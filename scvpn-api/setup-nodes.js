#!/usr/bin/env node
// Setup script for VPN nodes
// Usage: node setup-nodes.js

import { createClient } from "@supabase/supabase-js";
import { spawn } from "child_process";

const SUPABASE_URL = process.env.SCVPN_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SCVPN_SUPABASE_SERVICE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error("❌ Missing Supabase environment variables:");
  console.error("   SCVPN_SUPABASE_URL");
  console.error("   SCVPN_SUPABASE_SERVICE_KEY");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false },
});

// Generate WireGuard server keys
async function generateServerKeys() {
  return new Promise((resolve, reject) => {
    const proc = spawn('wg', ['genkey'], { stdio: ['pipe', 'pipe', 'pipe'] });
    
    let stdout = '';
    let stderr = '';
    
    proc.stdout.on('data', (data) => stdout += data.toString());
    proc.stderr.on('data', (data) => stderr += data.toString());
    
    proc.on('close', (code) => {
      if (code === 0) {
        const privateKey = stdout.trim();
        
        // Generate public key
        const pubProc = spawn('wg', ['pubkey'], { stdio: ['pipe', 'pipe', 'pipe'] });
        let pubStdout = '';
        
        pubProc.stdout.on('data', (data) => pubStdout += data.toString());
        pubProc.on('close', (pubCode) => {
          if (pubCode === 0) {
            resolve({
              privateKey,
              publicKey: pubStdout.trim()
            });
          } else {
            reject(new Error('Failed to generate public key'));
          }
        });
        
        pubProc.stdin.write(privateKey + '\n');
        pubProc.stdin.end();
      } else {
        reject(new Error(`wg genkey failed: ${stderr}`));
      }
    });
  });
}

// Setup node configuration
async function setupNode(config) {
  try {
    console.log(`🔧 Setting up node: ${config.name}...`);
    
    // Generate server keys if not provided
    if (!config.public_key) {
      console.log("  📝 Generating WireGuard keys...");
      const keys = await generateServerKeys();
      config.server_private_key = keys.privateKey;
      config.public_key = keys.publicKey;
      console.log(`  🔑 Server public key: ${config.public_key}`);
      console.log(`  🔒 Server private key: ${config.server_private_key} (SAVE THIS!)`);
    }
    
    // Insert/update node in database
    const { data, error } = await supabase
      .from("vpn_nodes")
      .upsert({
        name: config.name,
        region: config.region,
        public_ip: config.public_ip,
        port: config.port || 51820,
        interface_name: config.interface_name || 'wg0',
        public_key: config.public_key,
        client_subnet: config.client_subnet,
        dns_servers: config.dns_servers || '1.1.1.1,8.8.8.8',
        max_clients: config.max_clients || 1000,
        management_type: config.management_type || 'ssh',
        ssh_host: config.ssh_host || config.public_ip,
        ssh_user: config.ssh_user || 'root',
        ssh_port: config.ssh_port || 22,
        is_active: true
      }, { 
        onConflict: 'name',
        ignoreDuplicates: false 
      })
      .select()
      .single();
    
    if (error) {
      console.error(`  ❌ Failed to setup node: ${error.message}`);
      return null;
    }
    
    console.log(`  ✅ Node configured with ID: ${data.id}`);
    return data;
    
  } catch (error) {
    console.error(`  ❌ Error setting up node: ${error.message}`);
    return null;
  }
}

// Generate WireGuard server config - OPTIMIZED FOR PERFORMANCE
function generateServerConfig(node, serverPrivateKey) {
  const isPrimary = node.name.includes('Primary');
  const networkInterface = isPrimary ? 'ens3' : 'eth0'; // Common cloud interfaces
  
  return `# WireGuard Server Config for ${node.name}
# Location: ${node.location}
# Performance Tier: ${node.performance_tier}
# Save this as /etc/wireguard/${node.interface_name}.conf

[Interface]
PrivateKey = ${serverPrivateKey}
Address = ${node.client_subnet.split('/')[0].replace(/\d+$/, '1')}/24
ListenPort = ${node.port}
SaveConfig = false

# PERFORMANCE OPTIMIZATIONS
# High-performance kernel bypass and buffer settings
# PostUp = echo 1 > /proc/sys/net/core/netdev_max_backlog
# PostUp = echo 'net.core.rmem_max = 134217728' >> /etc/sysctl.conf
# PostUp = echo 'net.core.wmem_max = 134217728' >> /etc/sysctl.conf

# Enable IP forwarding and masquerading  
PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT; iptables -t nat -A POSTROUTING -o ${networkInterface} -j MASQUERADE
PostUp = ip6tables -A FORWARD -i %i -j ACCEPT; ip6tables -A FORWARD -o %i -j ACCEPT; ip6tables -t nat -A POSTROUTING -o ${networkInterface} -j MASQUERADE

# Clean up rules on shutdown
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -o ${networkInterface} -j MASQUERADE  
PostDown = ip6tables -D FORWARD -i %i -j ACCEPT; ip6tables -D FORWARD -o %i -j ACCEPT; ip6tables -t nat -D POSTROUTING -o ${networkInterface} -j MASQUERADE

# PERFORMANCE SETTINGS
# Optimize for ${isPrimary ? 'LOW LATENCY (Primary Node)' : 'THROUGHPUT (Secondary Node)'}
${isPrimary ? '# Primary node: Optimized for minimal latency' : '# Secondary node: Optimized for high throughput'}

# Clients will be added dynamically via API
# Expected capacity: ${node.max_clients} clients
`;
}

// Main setup function
async function main() {
  console.log("🚀 SACVPN Node Setup");
  console.log("====================\n");
  
  // Your actual VPN server configurations - OPTIMIZED FOR PERFORMANCE
  const nodeConfigs = [
    {
      name: "SACVPN-VA-Primary",
      region: "us-east", 
      public_ip: "135.148.121.237",
      port: 51820,
      client_subnet: "10.8.0.0/24",
      dns_servers: "1.1.1.1,1.0.0.1", // Cloudflare DNS for speed
      max_clients: 2000, // Higher capacity for primary
      current_clients: 0,
      management_type: "ssh", 
      ssh_user: "ubuntu",
      ssh_host: "135.148.121.237",
      priority: 1, // PRIMARY NODE - lowest latency
      performance_tier: "premium", // High-performance routing
      location: "Virginia, USA"
    },
    {
      name: "SACVPN-Dallas-Central",
      region: "us-central",
      public_ip: "45.79.8.145", 
      port: 51820,
      client_subnet: "10.9.0.0/24",
      dns_servers: "1.1.1.1,1.0.0.1", // Cloudflare DNS for speed
      max_clients: 1000, // Secondary capacity
      current_clients: 0,
      management_type: "ssh",
      ssh_user: "root", 
      ssh_host: "45.79.8.145",
      priority: 2, // SECONDARY NODE - backup/overflow
      performance_tier: "standard", // Standard routing
      location: "Dallas, USA"
    }
  ];
  
  console.log("📋 Node configurations to setup:");
  nodeConfigs.forEach((config, i) => {
    console.log(`  ${i + 1}. ${config.name} (${config.public_ip})`);
  });
  console.log("");
  
  // Setup each node
  const setupNodes = [];
  for (const config of nodeConfigs) {
    const node = await setupNode(config);
    if (node) {
      setupNodes.push({ ...node, server_private_key: config.server_private_key });
    }
  }
  
  if (setupNodes.length === 0) {
    console.log("❌ No nodes were successfully configured.");
    process.exit(1);
  }
  
  console.log(`\n✅ Successfully configured ${setupNodes.length} node(s)!\n`);
  
  // Generate server configs
  console.log("📝 WireGuard Server Configurations:");
  console.log("=====================================\n");
  
  setupNodes.forEach((node, i) => {
    console.log(`--- ${node.name} ---`);
    if (node.server_private_key) {
      console.log(generateServerConfig(node, node.server_private_key));
    } else {
      console.log("⚠️  No private key available (node may have been previously configured)");
    }
    console.log("---\n");
  });
  
  console.log("🚨 IMPORTANT NEXT STEPS:");
  console.log("1. Copy the server configs above to your VPN servers");
  console.log("2. Install WireGuard on your servers: apt install wireguard");
  console.log("3. Enable IP forwarding: echo 'net.ipv4.ip_forward=1' >> /etc/sysctl.conf");
  console.log("4. Start WireGuard: systemctl enable --now wg-quick@wg0");
  console.log("5. Set up SSH key authentication for node management");
  console.log("6. Test the API endpoints with your Railway deployment\n");
  
  console.log("🔧 API Endpoints:");
  console.log("- Process key requests: POST /api/wireguard/process-requests");
  console.log("- Download configs: GET /api/device/{deviceId}/config");
  console.log("- Health check: GET /api/wireguard/health");
}

// Handle CLI arguments
const args = process.argv.slice(2);
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
SACVPN Node Setup

Usage: node setup-nodes.js [options]

Options:
  -h, --help     Show this help message
  
Environment Variables:
  SCVPN_SUPABASE_URL          Your Supabase project URL
  SCVPN_SUPABASE_SERVICE_KEY  Your Supabase service role key
  
Before running:
1. Install WireGuard tools: apt install wireguard-tools
2. Set your server IPs in the nodeConfigs array
3. Set your Supabase environment variables

This script will:
- Generate WireGuard keys for each server
- Insert node configurations into your database  
- Output server config files for setup
`);
  process.exit(0);
}

// Run the setup
main().catch(err => {
  console.error("❌ Setup failed:", err);
  process.exit(1);
});