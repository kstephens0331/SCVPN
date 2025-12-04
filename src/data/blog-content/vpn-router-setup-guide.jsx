export default function VPNRouterSetupGuide() {
  return (
    <div className="prose prose-invert prose-lg max-w-none">
      <h2 className="text-3xl font-bold text-white mt-12 mb-6">Why Configure VPN on Your Router?</h2>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        While you can install VPN apps on individual devices, configuring a VPN directly on your router offers significant advantages. Once set up, every device that connects to your WiFi network is automatically protected—including devices that don't support VPN apps like smart TVs, gaming consoles, IoT devices, and guest devices.
      </p>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        This comprehensive guide walks you through the process of setting up SACVPN on your router using the WireGuard protocol. Whether you're a networking novice or an experienced administrator, you'll find the information you need to protect your entire network.
      </p>

      <h2 className="text-3xl font-bold text-white mt-12 mb-6">Benefits of Router-Level VPN</h2>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Protect All Devices Automatically</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        With a VPN on your router, protection is automatic and universal. Smart TVs, streaming devices, gaming consoles, smart home devices, and any guest devices all receive VPN protection without any individual configuration. There's no need to remember to connect—if a device is on your network, it's protected.
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Protect Devices That Don't Support VPNs</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Many devices don't support VPN software: Roku, Apple TV, Chromecast, PlayStation, Xbox, smart refrigerators, security cameras, and countless IoT gadgets. A router-level VPN is the only way to protect these devices. This is particularly important for smart home devices that may have security vulnerabilities.
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Single Configuration, Unlimited Devices</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Instead of configuring VPN on each device individually, you set it up once on the router. Add new devices to your network without any additional VPN configuration. This simplifies management and ensures consistent protection across your entire home or office.
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Always-On Protection</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Router-level VPN is always active. You don't need to remember to connect or worry about apps crashing. As long as your router is running, your network is protected. This is the "set it and forget it" approach to VPN security.
      </p>

      <h2 className="text-3xl font-bold text-white mt-12 mb-6">Prerequisites</h2>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Compatible Router</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Not all routers support VPN configuration. You'll need a router with one of the following:
      </p>

      <ul className="list-disc pl-6 text-gray-300 text-lg space-y-3 mb-6">
        <li><strong className="text-white">Built-in WireGuard support:</strong> Newer routers from ASUS, MikroTik, Ubiquiti, and others</li>
        <li><strong className="text-white">OpenWrt firmware:</strong> Open-source firmware that adds WireGuard to many routers</li>
        <li><strong className="text-white">DD-WRT firmware:</strong> Alternative firmware with VPN capabilities</li>
        <li><strong className="text-white">pfSense/OPNsense:</strong> Router/firewall software with excellent WireGuard support</li>
      </ul>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        If your router doesn't support VPN, consider upgrading to a VPN-capable model or flashing custom firmware. We recommend routers from ASUS (RT-AX series) or dedicated pfSense/OPNsense hardware for the best experience.
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">SACVPN Subscription</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        You'll need an active SACVPN subscription. Router VPN counts as one device on your account. Our Personal and Gaming plans include unlimited devices, making them ideal for router configurations that protect many devices simultaneously.
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Router Admin Access</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        You'll need administrator access to your router's configuration interface. This typically means knowing your router's admin password and being connected to your home network.
      </p>

      <h2 className="text-3xl font-bold text-white mt-12 mb-6">Setup Guide: ASUS Routers with WireGuard</h2>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        ASUS routers running firmware 388 or later have native WireGuard support. Here's how to configure SACVPN:
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 1: Generate Your Configuration</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Log into your SACVPN dashboard and create a new device. Name it something like "Home Router" for easy identification. Download the WireGuard configuration file.
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 2: Access Router Admin Panel</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Open your browser and navigate to your router's admin interface (typically http://192.168.1.1 or http://router.asus.com). Log in with your admin credentials.
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 3: Navigate to VPN Settings</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Go to VPN → VPN Fusion (or VPN Client on older firmware). Select the WireGuard tab.
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 4: Import Configuration</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Click "Add profile" and select "Import .conf file." Upload the configuration file you downloaded from SACVPN. The router will automatically populate all necessary fields.
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 5: Enable the VPN</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Toggle the VPN connection to "ON" and apply settings. The router will establish a connection to SACVPN servers. You should see "Connected" status within a few seconds.
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 6: Configure VPN Rules (Optional)</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        ASUS routers allow you to specify which devices use the VPN. You can route all traffic through the VPN or select specific devices. This is useful if some devices need to access local services without VPN.
      </p>

      <h2 className="text-3xl font-bold text-white mt-12 mb-6">Setup Guide: OpenWrt</h2>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        OpenWrt is powerful open-source router firmware that runs on many devices. Here's how to configure WireGuard:
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 1: Install WireGuard Package</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        SSH into your router or use LuCI (web interface). Install the WireGuard packages:
      </p>

      <div className="bg-gray-800/50 rounded-xl p-6 my-8 border border-gray-700 font-mono text-sm">
        <p className="text-gray-300">opkg update</p>
        <p className="text-gray-300">opkg install luci-proto-wireguard wireguard-tools</p>
      </div>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 2: Create WireGuard Interface</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        In LuCI, go to Network → Interfaces → Add new interface. Name it "sacvpn" and select "WireGuard VPN" as the protocol.
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 3: Enter Configuration Details</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        From your SACVPN configuration file, copy:
      </p>

      <ul className="list-disc pl-6 text-gray-300 text-lg space-y-3 mb-6">
        <li><strong className="text-white">Private Key:</strong> Your unique private key</li>
        <li><strong className="text-white">Listen Port:</strong> Usually 51820</li>
        <li><strong className="text-white">IP Addresses:</strong> Your assigned VPN IP</li>
      </ul>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 4: Add Peer Configuration</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Add a peer with the server details from your configuration:
      </p>

      <ul className="list-disc pl-6 text-gray-300 text-lg space-y-3 mb-6">
        <li><strong className="text-white">Public Key:</strong> SACVPN server's public key</li>
        <li><strong className="text-white">Endpoint:</strong> Server address and port</li>
        <li><strong className="text-white">Allowed IPs:</strong> 0.0.0.0/0 for all traffic</li>
        <li><strong className="text-white">Persistent Keepalive:</strong> 25 seconds</li>
      </ul>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 5: Configure Firewall</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Add the WireGuard interface to your WAN zone or create a dedicated zone. Ensure masquerading is enabled so traffic can flow properly through the VPN.
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 6: Set DNS and Enable</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Configure the interface to use SACVPN's DNS servers to prevent DNS leaks. Enable the interface and verify connectivity by checking your public IP from a connected device.
      </p>

      <h2 className="text-3xl font-bold text-white mt-12 mb-6">Setup Guide: pfSense</h2>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        pfSense is a powerful firewall/router platform with excellent WireGuard support:
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 1: Install WireGuard Package</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Go to System → Package Manager → Available Packages. Find "wireguard" and install it.
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 2: Create Tunnel</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Navigate to VPN → WireGuard → Tunnels. Add a new tunnel using your SACVPN private key and address configuration.
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 3: Add Peer</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        In the Peers tab, add SACVPN's server as a peer with the public key, endpoint, and allowed IPs from your configuration file.
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 4: Configure Interface and Gateway</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Assign the WireGuard tunnel as an interface. Create a gateway pointing to the tunnel interface. This allows you to route traffic through the VPN.
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 5: Create Firewall Rules</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Add firewall rules to route desired traffic through the VPN gateway. You can route all LAN traffic or specific devices/networks based on your requirements.
      </p>

      <h2 className="text-3xl font-bold text-white mt-12 mb-6">Troubleshooting Common Issues</h2>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">VPN Won't Connect</h3>

      <ul className="list-disc pl-6 text-gray-300 text-lg space-y-3 mb-6">
        <li>Verify your router has internet connectivity without VPN</li>
        <li>Double-check that all configuration values were entered correctly</li>
        <li>Ensure UDP port 51820 isn't blocked by your ISP</li>
        <li>Try a different SACVPN server endpoint</li>
      </ul>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Slow Speeds Through VPN</h3>

      <ul className="list-disc pl-6 text-gray-300 text-lg space-y-3 mb-6">
        <li>Check your router's CPU usage—VPN encryption requires processing power</li>
        <li>Older or low-end routers may bottleneck speeds</li>
        <li>Try a server geographically closer to your location</li>
        <li>Consider upgrading to a more powerful router</li>
      </ul>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Some Sites or Services Don't Work</h3>

      <ul className="list-disc pl-6 text-gray-300 text-lg space-y-3 mb-6">
        <li>Configure split tunneling to exclude problematic services</li>
        <li>Some local services (banking, streaming) may block VPN IPs</li>
        <li>Use policy-based routing to send specific traffic outside the VPN</li>
      </ul>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">DNS Leaks</h3>

      <ul className="list-disc pl-6 text-gray-300 text-lg space-y-3 mb-6">
        <li>Ensure DNS settings point to SACVPN's DNS servers</li>
        <li>Disable router's DNS proxy if necessary</li>
        <li>Test for leaks at dnsleaktest.com</li>
      </ul>

      <h2 className="text-3xl font-bold text-white mt-12 mb-6">Best Practices</h2>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Use Policy-Based Routing</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Not everything needs to go through the VPN. Configure your router to route only desired devices or traffic types through the VPN while allowing direct access for services that require it.
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Enable Kill Switch</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Configure firewall rules to block internet access if the VPN disconnects. This prevents accidental exposure of unprotected traffic.
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Monitor Connection Status</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Set up monitoring to alert you if the VPN connection drops. Many routers support email alerts or can run scripts when interface status changes.
      </p>

      <h2 className="text-3xl font-bold text-white mt-12 mb-6">Conclusion: Complete Network Protection</h2>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Configuring SACVPN on your router provides the most comprehensive protection for your home or office network. Every connected device benefits from encryption and IP masking without requiring individual configuration. It's the ultimate "set it and forget it" security solution.
      </p>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        While the initial setup requires some technical knowledge, the long-term benefits are substantial. Your smart TV streams through encrypted connections, your IoT devices are shielded from attacks, and every guest who connects to your WiFi receives the same protection. With SACVPN powering your router, your entire digital life is secured.
      </p>
    </div>
  );
}
