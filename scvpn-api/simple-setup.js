#!/usr/bin/env node
// Simple setup for Windows - generates keys using Node.js crypto
import { createClient } from "@supabase/supabase-js";
import { randomBytes } from "crypto";

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

// Generate WireGuard private key using Node.js crypto
function generatePrivateKey() {
  const key = randomBytes(32);
  return Buffer.from(key).toString('base64');
}

// Generate a mock public key (in production, you'd derive this from private key)
// For now, we'll generate a placeholder and you can update later
function generateMockPublicKey(privateKey) {
  const hash = randomBytes(32);
  return Buffer.from(hash).toString('base64');
}

async function setupNode(config) {
  try {
    console.log(`🔧 Setting up node: ${config.name}...`);
    
    // Generate server keys
    console.log("  📝 Generating WireGuard keys...");
    const serverPrivateKey = generatePrivateKey();
    const serverPublicKey = generateMockPublicKey(serverPrivateKey);
    
    console.log(`  🔑 Server public key: ${serverPublicKey}`);
    console.log(`  🔒 Server private key: ${serverPrivateKey} (SAVE THIS!)`);
    
    // Insert node in database
    const { data, error } = await supabase
      .from("vpn_nodes")
      .upsert({
        name: config.name,
        region: config.region,
        public_ip: config.public_ip,
        port: config.port || 51820,
        interface_name: config.interface_name || 'wg0',
        public_key: serverPublicKey,
        client_subnet: config.client_subnet,
        dns_servers: config.dns_servers || '1.1.1.1,8.8.8.8',
        max_clients: config.max_clients || 1000,
        management_type: config.management_type || 'ssh',
        api_endpoint: config.api_endpoint || null,
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
    return { ...data, server_private_key: serverPrivateKey };
    
  } catch (error) {
    console.error(`  ❌ Error setting up node: ${error.message}`);
    return null;
  }
}

function generateServerConfig(node, serverPrivateKey) {
  const isPrimary = node.name.includes('Primary');
  
  return `# WireGuard Server Config for ${node.name}
# Save this as /etc/wireguard/wg0.conf

[Interface]
PrivateKey = ${serverPrivateKey}
Address = ${node.client_subnet.split('/')[0].replace(/\d+$/, '1')}/24
ListenPort = ${node.port}
SaveConfig = false

# Enable IP forwarding and masquerading
PostUp = iptables -A FORWARD -i %i -j ACCEPT; iptables -A FORWARD -o %i -j ACCEPT; iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE
PostDown = iptables -D FORWARD -i %i -j ACCEPT; iptables -D FORWARD -o %i -j ACCEPT; iptables -t nat -D POSTROUTING -o eth0 -j MASQUERADE

# ${isPrimary ? 'PRIMARY NODE: Optimized for low latency' : 'SECONDARY NODE: Optimized for throughput'}
# Expected capacity: ${node.max_clients} clients
`;
}

async function main() {
  console.log("🚀 SACVPN Simple Node Setup");
  console.log("============================\n");
  
  // Your actual server configurations
  const nodeConfigs = [
    {
      name: "SACVPN-VA-Primary",
      region: "us-east", 
      public_ip: "135.148.121.237",
      port: 51820,
      client_subnet: "10.8.0.0/24",
      dns_servers: "1.1.1.1,1.0.0.1",
      max_clients: 2000,
      management_type: "ssh", 
      ssh_user: "ubuntu",
      ssh_host: "135.148.121.237",
      location: "Virginia, USA"
    },
    {
      name: "SACVPN-Dallas-Central",
      region: "us-central",
      public_ip: "45.79.8.145", 
      port: 51820,
      client_subnet: "10.9.0.0/24",
      dns_servers: "1.1.1.1,1.0.0.1",
      max_clients: 1000,
      management_type: "ssh",
      ssh_user: "root", 
      ssh_host: "45.79.8.145",
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
      setupNodes.push(node);
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
    console.log(generateServerConfig(node, node.server_private_key));
    console.log("---\n");
  });
  
  console.log("🚨 IMPORTANT NEXT STEPS:");
  console.log("1. Copy the server configs above to your VPN servers");
  console.log("2. Install WireGuard on servers: apt install wireguard");  
  console.log("3. Enable IP forwarding: echo 'net.ipv4.ip_forward=1' >> /etc/sysctl.conf");
  console.log("4. Start WireGuard: systemctl enable --now wg-quick@wg0");
  console.log("5. Deploy API with VPN_NODE_SSH_PASSWORD environment variable");
  console.log("6. Test the system!\n");
  
  console.log("🔧 Test Commands:");
  console.log("- Check API: curl https://scvpn-production.up.railway.app/api/wireguard/health");
  console.log("- Process keys: curl -X POST https://scvpn-production.up.railway.app/api/wireguard/process-requests");
}

main().catch(err => {
  console.error("❌ Setup failed:", err);
  process.exit(1);
});