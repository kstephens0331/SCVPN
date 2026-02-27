// scvpn-api/wireguard-manager.js
import { spawn } from "child_process";
import { promisify } from "util";
import { createHash, randomBytes } from "crypto";
import { writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import nacl from "tweetnacl";

export class WireGuardManager {
  constructor(db, logger) {
    this.db = db;
    this.logger = logger;
    this.nodes = new Map(); // nodeId -> node config
  }

  async initialize() {
    // Load node configurations from database
    const { rows: nodes } = await this.db.query(
      'SELECT * FROM vpn_nodes WHERE is_active = true'
    );

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
  // Strategy: Fill each node to 80% before spilling to next priority
  // Texas Primary (2.5Gbps) -> VA Secondary -> Dallas Tertiary
  static OVERFLOW_THRESHOLD = 0.80; // 80% capacity before spilling to next node

  selectBestNode(userRegion = 'us-central', userLocation = null) {
    const availableNodes = Array.from(this.nodes.values())
      .filter(node => node.is_active && node.current_clients < node.max_clients);

    if (availableNodes.length === 0) {
      throw new Error('No available VPN nodes');
    }

    // Sort by priority (lower number = higher priority)
    const sortedNodes = availableNodes.sort((a, b) => {
      return (a.priority || 999) - (b.priority || 999);
    });

    // Fill each node to 80% before moving to the next
    let selectedNode = null;
    for (const node of sortedNodes) {
      const capacityRatio = node.current_clients / node.max_clients;
      if (capacityRatio < WireGuardManager.OVERFLOW_THRESHOLD) {
        selectedNode = node;
        break;
      }
    }

    // All nodes above 80% - pick the one with the most remaining capacity
    if (!selectedNode) {
      selectedNode = sortedNodes.reduce((best, node) => {
        const remaining = node.max_clients - node.current_clients;
        const bestRemaining = best.max_clients - best.current_clients;
        return remaining > bestRemaining ? node : best;
      });
    }

    const capacityPct = ((selectedNode.current_clients / selectedNode.max_clients) * 100).toFixed(1);
    this.logger.info({
      node: selectedNode.name,
      load: `${selectedNode.current_clients}/${selectedNode.max_clients}`,
      capacity: `${capacityPct}%`,
      priority: selectedNode.priority,
      threshold: `${WireGuardManager.OVERFLOW_THRESHOLD * 100}%`
    }, `Selected VPN node (${capacityPct}% < ${WireGuardManager.OVERFLOW_THRESHOLD * 100}% threshold)`);

    return selectedNode;
  }

  // Generate next available IP for a node
  async getNextClientIP(nodeId) {
    const node = this.nodes.get(nodeId);
    if (!node) throw new Error('Node not found');

    // Get existing client IPs for this node
    const { rows: existingDevices } = await this.db.query(
      'SELECT client_ip FROM device_configs WHERE node_id = $1 AND client_ip IS NOT NULL',
      [nodeId]
    );

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

      const { rows: [config] } = await this.db.query(
        `INSERT INTO device_configs (device_id, user_id, node_id, private_key, public_key, client_ip, dns_servers, created_at, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
        [configData.device_id, configData.user_id, configData.node_id, configData.private_key,
         configData.public_key, configData.client_ip, configData.dns_servers, configData.created_at, configData.is_active]
      );

      if (!config) throw new Error('Failed to insert device config');

      // Add peer to WireGuard node
      await this.addPeerToNode(node, {
        publicKey,
        allowedIPs: `${clientIP}/32`,
        deviceId
      });

      // Update node client count
      await this.db.query(
        'UPDATE vpn_nodes SET current_clients = $1, last_updated = $2 WHERE id = $3',
        [node.current_clients + 1, new Date().toISOString(), node.id]
      );

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
    // Use sudo for non-root users (like ubuntu)
    const useSudo = node.ssh_user && node.ssh_user !== 'root';
    const command = [
      useSudo ? 'sudo' : '',
      'wg', 'set', node.interface_name,
      'peer', peer.publicKey,
      'allowed-ips', peer.allowedIPs
    ].filter(Boolean).join(' ');

    return this.executeSSHCommand(node, command);
  }

  // Write SSH key from env var to temp file
  _ensureSSHKeyFile() {
    if (this._sshKeyPath) return this._sshKeyPath;
    let keyContent = process.env.VPN_NODE_SSH_KEY;
    if (!keyContent) return null;

    const keyPath = join(tmpdir(), 'vpn_node_key');

    // May store newlines as literal \n — convert to real newlines
    keyContent = keyContent.replace(/\\n/g, '\n').trim();

    // If missing PEM headers, wrap the base64 body in proper OpenSSH format
    if (!keyContent.includes('-----BEGIN')) {
      const b64 = keyContent.replace(/\s+/g, '');
      const lines = b64.match(/.{1,70}/g) || [];
      keyContent = '-----BEGIN OPENSSH PRIVATE KEY-----\n' +
                   lines.join('\n') + '\n' +
                   '-----END OPENSSH PRIVATE KEY-----';
    }

    const normalized = keyContent.trim() + '\n';

    this.logger.info({
      keyPath,
      keyLength: normalized.length,
      startsWithBegin: normalized.startsWith('-----BEGIN'),
      lineCount: normalized.split('\n').length
    }, 'SSH key file written');

    writeFileSync(keyPath, normalized, { mode: 0o600 });
    this._sshKeyPath = keyPath;
    return keyPath;
  }

  // Execute SSH command on node
  async executeSSHCommand(node, command) {
    return new Promise((resolve, reject) => {
      const SSH_TIMEOUT = 15000; // 15 seconds timeout

      // Auth priority:
      // 1. Per-node ssh_password from DB (node-specific override)
      // 2. SSH key file (from VPN_NODE_SSH_KEY env var — for hardened servers like Texas)
      // 3. Global VPN_NODE_SSH_PASSWORD env var (fallback for nodes without per-node password)
      const nodePassword = node.ssh_password;                                    // per-node only
      const sshKeyPath = process.env.VPN_NODE_SSH_KEY_PATH || this._ensureSSHKeyFile();
      const globalPassword = process.env.VPN_NODE_SSH_PASSWORD;
      const target = `${node.ssh_user || 'root'}@${node.ssh_host || node.public_ip}`;

      this.logger.info({
        node: node.name,
        hasNodePassword: !!nodePassword,
        hasSshKeyPath: !!sshKeyPath,
        hasGlobalPassword: !!globalPassword
      }, 'SSH auth selection');

      let sshCmd;
      if (nodePassword) {
        // Per-node password (explicit override in database)
        sshCmd = [
          'sshpass', '-p', nodePassword, 'ssh',
          '-o', 'ConnectTimeout=10',
          '-o', 'StrictHostKeyChecking=no',
          '-o', 'UserKnownHostsFile=/dev/null',
          '-o', 'BatchMode=no',
          target, command
        ];
      } else if (sshKeyPath) {
        // Key-based auth (for hardened servers with PasswordAuthentication=no)
        sshCmd = [
          'ssh',
          '-o', 'ConnectTimeout=10',
          '-o', 'StrictHostKeyChecking=no',
          '-o', 'UserKnownHostsFile=/dev/null',
          '-i', sshKeyPath,
          target, command
        ];
      } else if (globalPassword) {
        // Global password fallback
        sshCmd = [
          'sshpass', '-p', globalPassword, 'ssh',
          '-o', 'ConnectTimeout=10',
          '-o', 'StrictHostKeyChecking=no',
          '-o', 'UserKnownHostsFile=/dev/null',
          '-o', 'BatchMode=no',
          target, command
        ];
      } else {
        // No auth configured
        sshCmd = [
          'ssh',
          '-o', 'ConnectTimeout=10',
          '-o', 'StrictHostKeyChecking=no',
          '-o', 'UserKnownHostsFile=/dev/null',
          target, command
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
      // Get device config with node details via JOIN
      const { rows: [row] } = await this.db.query(
        `SELECT dc.*, vn.id AS node_db_id, vn.name AS node_name, vn.public_ip AS node_public_ip,
                vn.interface_name AS node_interface_name, vn.ssh_host AS node_ssh_host,
                vn.ssh_user AS node_ssh_user, vn.ssh_port AS node_ssh_port, vn.ssh_password AS node_ssh_password,
                vn.management_type AS node_management_type, vn.current_clients AS node_current_clients,
                vn.max_clients AS node_max_clients
         FROM device_configs dc
         LEFT JOIN vpn_nodes vn ON dc.node_id = vn.id
         WHERE dc.device_id = $1
         LIMIT 1`,
        [deviceId]
      );

      if (!row) {
        throw new Error('Device config not found');
      }

      // Reshape to match nested format
      const config = row;
      const node = {
        id: row.node_db_id, name: row.node_name, public_ip: row.node_public_ip,
        interface_name: row.node_interface_name, ssh_host: row.node_ssh_host,
        ssh_user: row.node_ssh_user, ssh_port: row.node_ssh_port, ssh_password: row.node_ssh_password,
        management_type: row.node_management_type, current_clients: row.node_current_clients,
        max_clients: row.node_max_clients
      };

      // Remove peer from WireGuard node
      await this.removePeerFromNode(node, config.public_key);

      // Deactivate config in database
      await this.db.query(
        'UPDATE device_configs SET is_active = false, deactivated_at = $1 WHERE device_id = $2',
        [new Date().toISOString(), deviceId]
      );

      // Update node client count
      await this.db.query(
        'UPDATE vpn_nodes SET current_clients = $1, last_updated = $2 WHERE id = $3',
        [Math.max(0, node.current_clients - 1), new Date().toISOString(), node.id]
      );

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
        const isHealthy = await this.pingNode(node);

        node.isHealthy = isHealthy;
        node.lastHealthCheck = new Date().toISOString();

        await this.db.query(
          'UPDATE vpn_nodes SET is_healthy = $1, last_health_check = $2 WHERE id = $3',
          [isHealthy, node.lastHealthCheck, nodeId]
        );

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
