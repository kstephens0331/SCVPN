// scvpn-api/wireguard-manager.js
import { spawn } from "child_process";
import { promisify } from "util";
import { createHash, randomBytes } from "crypto";
import nacl from "tweetnacl";

export class WireGuardManager {
  constructor(supabase, logger) {
    this.supabase = supabase;
    this.logger = logger;
    this.nodes = new Map(); // nodeId -> node config
  }

  async initialize() {
    // Load node configurations from database
    const { data: nodes, error } = await this.supabase
      .from("vpn_nodes")
      .select("*")
      .eq("is_active", true);
      
    if (error) {
      this.logger.error({ error }, "Failed to load VPN nodes");
      return;
    }

    for (const node of nodes || []) {
      this.nodes.set(node.id, {
        ...node,
        lastHealthCheck: null,
        isHealthy: false
      });
    }
    
    this.logger.info({ nodeCount: this.nodes.size }, "WireGuard manager initialized");
  }

  // Generate a new WireGuard key pair using TweetNaCl (Curve25519)
  // WireGuard uses Curve25519 for encryption, same as NaCl
  generateKeyPair() {
    // Generate a random 32-byte private key
    const privateKeyBytes = nacl.randomBytes(32);

    // Clamp the private key (WireGuard requirement)
    // https://cr.yp.to/ecdh.html
    privateKeyBytes[0] &= 248;
    privateKeyBytes[31] &= 127;
    privateKeyBytes[31] |= 64;

    // Derive public key using Curve25519
    const publicKeyBytes = nacl.scalarMult.base(privateKeyBytes);

    return {
      privateKey: Buffer.from(privateKeyBytes).toString('base64'),
      publicKey: Buffer.from(publicKeyBytes).toString('base64')
    };
  }

  // Legacy method - now just calls generateKeyPair
  generatePrivateKey() {
    return this.generateKeyPair().privateKey;
  }

  // Generate public key from existing private key
  async generatePublicKey(privateKey) {
    try {
      // Decode base64 private key
      const privateKeyBytes = Buffer.from(privateKey, 'base64');

      // Clamp the private key (WireGuard requirement)
      privateKeyBytes[0] &= 248;
      privateKeyBytes[31] &= 127;
      privateKeyBytes[31] |= 64;

      // Derive public key using Curve25519
      const publicKeyBytes = nacl.scalarMult.base(privateKeyBytes);

      return Buffer.from(publicKeyBytes).toString('base64');
    } catch (error) {
      this.logger.error({ error: error.message }, "Failed to generate public key from private key");
      throw new Error(`Key generation failed: ${error.message}`);
    }
  }

  // Assign user to best available node
  // Strategy: Dallas handles quick connects until 80% full, then VA Primary takes over
  selectBestNode(userRegion = 'us-east', userLocation = null) {
    const availableNodes = Array.from(this.nodes.values())
      .filter(node => node.is_active && node.current_clients < node.max_clients);

    if (availableNodes.length === 0) {
      throw new Error('No available VPN nodes');
    }

    // Find Dallas and VA nodes
    const dallasCentral = availableNodes.find(n => n.name === 'SACVPN-Dallas-Central' || n.priority === 2);
    const vaPrimary = availableNodes.find(n => n.name === 'SACVPN-VA-Primary' || n.priority === 1);

    // STRATEGY: Dallas handles quick connects and small traffic until 80% capacity
    if (dallasCentral && dallasCentral.current_clients < (dallasCentral.max_clients * 0.80)) {
      this.logger.info({
        node: dallasCentral.name,
        load: `${dallasCentral.current_clients}/${dallasCentral.max_clients}`,
        capacity: `${((dallasCentral.current_clients / dallasCentral.max_clients) * 100).toFixed(1)}%`
      }, "Selected Dallas Central for quick connect (under 80% capacity)");
      return dallasCentral;
    }

    // Dallas is at/over 80% capacity - use VA Primary
    if (vaPrimary) {
      this.logger.info({
        node: vaPrimary.name,
        load: `${vaPrimary.current_clients}/${vaPrimary.max_clients}`,
        reason: dallasCentral ? 'Dallas at 80%+ capacity' : 'Dallas unavailable'
      }, "Selected VA Primary (overflow from Dallas)");
      return vaPrimary;
    }

    // Fallback: Sort by priority, then by load
    const sortedNodes = availableNodes.sort((a, b) => {
      // First by priority (lower number = higher priority)
      if (a.priority !== b.priority) {
        return (a.priority || 999) - (b.priority || 999);
      }
      // Then by load (lower load = better)
      return a.current_clients - b.current_clients;
    });

    const selectedNode = sortedNodes[0];
    this.logger.info({
      node: selectedNode.name,
      load: `${selectedNode.current_clients}/${selectedNode.max_clients}`,
      priority: selectedNode.priority
    }, "Selected VPN node (fallback)");

    return selectedNode;
  }

  // Generate next available IP for a node
  async getNextClientIP(nodeId) {
    const node = this.nodes.get(nodeId);
    if (!node) throw new Error('Node not found');
    
    // Get existing client IPs for this node
    const { data: existingDevices } = await this.supabase
      .from("device_configs")
      .select("client_ip")
      .eq("node_id", nodeId)
      .not("client_ip", "is", null);
    
    const usedIPs = new Set((existingDevices || []).map(d => d.client_ip));
    
    // Parse node's client subnet (e.g., "10.8.0.0/24" -> "10.8.0.x")
    const [subnet, cidr] = node.client_subnet.split('/');
    const [a, b, c] = subnet.split('.');
    
    // Find first available IP in range (start from .2, skip .1 which is usually gateway)
    for (let i = 2; i < 254; i++) {
      const ip = `${a}.${b}.${c}.${i}`;
      if (!usedIPs.has(ip)) {
        return ip;
      }
    }
    
    throw new Error('No available client IPs in subnet');
  }

  // Create device configuration
  async generateDeviceConfig(deviceId, userId, nodeId = null) {
    try {
      // Select best node if none specified
      const node = nodeId ? this.nodes.get(nodeId) : this.selectBestNode();
      if (!node) throw new Error('No suitable node found');

      // Generate WireGuard keys
      const privateKey = this.generatePrivateKey();
      const publicKey = await this.generatePublicKey(privateKey);
      const clientIP = await this.getNextClientIP(node.id);

      // Store in database
      const configData = {
        device_id: deviceId,
        user_id: userId,
        node_id: node.id,
        private_key: privateKey,
        public_key: publicKey,
        client_ip: clientIP,
        dns_servers: node.dns_servers || "1.1.1.1,8.8.8.8",
        created_at: new Date().toISOString(),
        is_active: true
      };

      const { data: config, error } = await this.supabase
        .from("device_configs")
        .insert(configData)
        .select("*")
        .single();

      if (error) throw error;

      // Add peer to WireGuard node
      await this.addPeerToNode(node, {
        publicKey,
        allowedIPs: `${clientIP}/32`,
        deviceId
      });

      // Update node client count
      await this.supabase
        .from("vpn_nodes")
        .update({ 
          current_clients: node.current_clients + 1,
          last_updated: new Date().toISOString()
        })
        .eq("id", node.id);

      this.logger.info({ 
        deviceId, 
        nodeId: node.id, 
        clientIP 
      }, "Device config generated");

      return {
        config,
        wgConfig: this.generateWireGuardConfig(config, node)
      };

    } catch (error) {
      this.logger.error({ error, deviceId }, "Failed to generate device config");
      throw error;
    }
  }

  // Add peer to WireGuard node (via SSH or API)
  async addPeerToNode(node, peer) {
    if (node.management_type === 'ssh') {
      return this.addPeerViaSSH(node, peer);
    } else if (node.management_type === 'api') {
      return this.addPeerViaAPI(node, peer);
    } else {
      throw new Error(`Unsupported node management type: ${node.management_type}`);
    }
  }

  // Add peer via SSH commands
  async addPeerViaSSH(node, peer) {
    const command = [
      'wg', 'set', node.interface_name,
      'peer', peer.publicKey,
      'allowed-ips', peer.allowedIPs
    ].join(' ');

    return this.executeSSHCommand(node, command);
  }

  // Execute SSH command on node
  async executeSSHCommand(node, command) {
    return new Promise((resolve, reject) => {
      const SSH_TIMEOUT = 15000; // 15 seconds timeout

      // For now, we'll use sshpass for password authentication
      // In production, you should set up SSH key authentication
      const password = process.env.VPN_NODE_SSH_PASSWORD;

      let sshCmd;
      if (password) {
        sshCmd = [
          'sshpass', '-p', password, 'ssh',
          '-o', 'ConnectTimeout=10',
          '-o', 'StrictHostKeyChecking=no',
          '-o', 'UserKnownHostsFile=/dev/null',
          '-o', 'BatchMode=no',
          `${node.ssh_user || 'root'}@${node.ssh_host || node.public_ip}`,
          command
        ];
      } else {
        // Fallback to key-based auth
        sshCmd = [
          'ssh',
          '-o', 'ConnectTimeout=10',
          '-o', 'StrictHostKeyChecking=no',
          '-o', 'UserKnownHostsFile=/dev/null',
          '-i', process.env.VPN_NODE_SSH_KEY_PATH || '~/.ssh/vpn_nodes',
          `${node.ssh_user || 'root'}@${node.ssh_host || node.public_ip}`,
          command
        ];
      }

      this.logger.info({
        node: node.name,
        host: `${node.ssh_user}@${node.ssh_host}`,
        command
      }, "Executing SSH command");

      let proc;
      try {
        proc = spawn(sshCmd[0], sshCmd.slice(1), { stdio: ['pipe', 'pipe', 'pipe'] });
      } catch (err) {
        this.logger.error({ err, cmd: sshCmd[0] }, "Failed to spawn SSH process - command not found?");
        return reject(new Error(`Failed to execute ${sshCmd[0]}: ${err.message}. Is sshpass installed?`));
      }

      let stdout = '';
      let stderr = '';
      let timedOut = false;

      // Set timeout to kill process if it hangs
      const timeout = setTimeout(() => {
        timedOut = true;
        this.logger.warn({ node: node.name }, "SSH command timed out, killing process");
        proc.kill('SIGTERM');
        setTimeout(() => proc.kill('SIGKILL'), 2000); // Force kill after 2s
      }, SSH_TIMEOUT);

      proc.stdout.on('data', (data) => stdout += data.toString());
      proc.stderr.on('data', (data) => stderr += data.toString());

      proc.on('error', (err) => {
        clearTimeout(timeout);
        this.logger.error({ err, node: node.name }, "SSH process error");
        reject(new Error(`SSH process error: ${err.message}`));
      });

      proc.on('close', (code) => {
        clearTimeout(timeout);

        if (timedOut) {
          this.logger.error({ node: node.name, command }, "SSH command timed out");
          reject(new Error(`SSH command timed out after ${SSH_TIMEOUT}ms`));
        } else if (code === 0) {
          this.logger.info({ node: node.name }, "SSH command successful");
          resolve(stdout);
        } else {
          this.logger.error({
            node: node.name,
            code,
            stderr,
            stdout
          }, "SSH command failed");
          reject(new Error(`SSH command failed (exit ${code}): ${stderr || stdout}`));
        }
      });
    });
  }

  // Generate WireGuard config file content
  generateWireGuardConfig(deviceConfig, node) {
    return `[Interface]
PrivateKey = ${deviceConfig.private_key}
Address = ${deviceConfig.client_ip}/24
DNS = ${deviceConfig.dns_servers}

[Peer]
PublicKey = ${node.public_key}
Endpoint = ${node.public_ip}:${node.port || 51820}
AllowedIPs = 0.0.0.0/0
PersistentKeepalive = 25`;
  }

  // Remove device configuration
  async removeDeviceConfig(deviceId) {
    try {
      // Get device config
      const { data: config, error: fetchError } = await this.supabase
        .from("device_configs")
        .select("*, vpn_nodes(*)")
        .eq("device_id", deviceId)
        .single();

      if (fetchError || !config) {
        throw new Error('Device config not found');
      }

      const node = config.vpn_nodes;

      // Remove peer from WireGuard node
      await this.removePeerFromNode(node, config.public_key);

      // Deactivate config in database
      await this.supabase
        .from("device_configs")
        .update({ 
          is_active: false,
          deactivated_at: new Date().toISOString()
        })
        .eq("device_id", deviceId);

      // Update node client count
      await this.supabase
        .from("vpn_nodes")
        .update({ 
          current_clients: Math.max(0, node.current_clients - 1),
          last_updated: new Date().toISOString()
        })
        .eq("id", node.id);

      this.logger.info({ deviceId }, "Device config removed");

    } catch (error) {
      this.logger.error({ error, deviceId }, "Failed to remove device config");
      throw error;
    }
  }

  // Remove peer from WireGuard node
  async removePeerFromNode(node, publicKey) {
    if (node.management_type === 'ssh') {
      const command = `wg set ${node.interface_name} peer ${publicKey} remove`;
      return this.executeSSHCommand(node, command);
    }
    // Add API management if needed
  }

  // Health check all nodes
  async performHealthCheck() {
    for (const [nodeId, node] of this.nodes) {
      try {
        // Simple ping test or more sophisticated check
        const isHealthy = await this.pingNode(node);
        
        node.isHealthy = isHealthy;
        node.lastHealthCheck = new Date().toISOString();

        await this.supabase
          .from("vpn_nodes")
          .update({ 
            is_healthy: isHealthy,
            last_health_check: node.lastHealthCheck
          })
          .eq("id", nodeId);

      } catch (error) {
        this.logger.error({ error, nodeId }, "Health check failed");
        node.isHealthy = false;
      }
    }
  }

  async pingNode(node) {
    return new Promise((resolve) => {
      const proc = spawn('ping', ['-c', '1', '-W', '5', node.public_ip]);
      proc.on('close', (code) => resolve(code === 0));
    });
  }
}