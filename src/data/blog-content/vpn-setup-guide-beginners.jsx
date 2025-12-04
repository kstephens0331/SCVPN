export default function VPNSetupGuideBeginners() {
  return (
    <div className="prose prose-invert prose-lg max-w-none">
      <h2 className="text-3xl font-bold text-white mt-12 mb-6">Getting Started with VPN: Your First Steps to Online Privacy</h2>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Setting up a VPN might seem technical, but with modern VPN services like SACVPN, it's actually one of the easiest ways to dramatically improve your online security. This step-by-step guide will walk you through everything you need to know to set up and use a VPN on any device, even if you've never used one before.
      </p>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        By the end of this guide, you'll understand how to set up VPN protection on your smartphone, computer, and even your home router. You'll also learn essential tips for using your VPN effectively and troubleshooting common issues.
      </p>

      <h2 className="text-3xl font-bold text-white mt-12 mb-6">Before You Begin: What You'll Need</h2>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Setting up a VPN requires just a few things:
      </p>

      <ul className="list-disc pl-6 text-gray-300 text-lg space-y-3 mb-6">
        <li><strong className="text-white">A VPN subscription:</strong> Sign up for SACVPN at our pricing page to get started</li>
        <li><strong className="text-white">Your device:</strong> A smartphone, tablet, computer, or router</li>
        <li><strong className="text-white">Internet connection:</strong> You'll need to be connected to download the VPN app</li>
        <li><strong className="text-white">5-10 minutes:</strong> That's all the time most setups require</li>
      </ul>

      <h2 className="text-3xl font-bold text-white mt-12 mb-6">Setting Up VPN on Windows</h2>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 1: Create Your SACVPN Account</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        If you haven't already, visit the SACVPN website and select a plan that fits your needs. After completing the signup process, you'll receive access to your personal dashboard where you can create and manage VPN devices.
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 2: Download WireGuard</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        SACVPN uses the WireGuard protocol, which requires the official WireGuard app. Visit the WireGuard website and download the Windows installer. Run the installer and follow the on-screen prompts—it's a standard Windows installation that takes just a minute.
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 3: Create a Device in Your Dashboard</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Log in to your SACVPN dashboard and navigate to the Devices section. Click "Create New Device" and give it a recognizable name like "Windows Laptop" or "Home PC." The system will generate a configuration file specifically for this device.
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 4: Import the Configuration</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Download the configuration file from your dashboard. Open the WireGuard app, click "Import tunnel(s) from file," and select the configuration file you downloaded. Your VPN tunnel will appear in the WireGuard interface.
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 5: Connect</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Click the "Activate" button next to your tunnel. That's it! The status will change to "Active" and you'll see data transfer statistics. Your internet traffic is now encrypted and routed through SACVPN's servers.
      </p>

      <h2 className="text-3xl font-bold text-white mt-12 mb-6">Setting Up VPN on macOS</h2>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 1: Download WireGuard from the App Store</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Open the Mac App Store and search for "WireGuard." Download and install the free app. You may need to enter your Apple ID password or use Touch ID to authorize the installation.
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 2: Create a Device in Your Dashboard</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Log in to your SACVPN dashboard and create a new device with a name like "MacBook Pro" or "iMac." Download the generated configuration file.
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 3: Import and Connect</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Open WireGuard, click "Import tunnel(s) from file," and select your configuration file. Grant any permission requests that appear—macOS needs to approve the VPN configuration. Click "Activate" to connect.
      </p>

      <h2 className="text-3xl font-bold text-white mt-12 mb-6">Setting Up VPN on iPhone/iPad</h2>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 1: Install WireGuard from the App Store</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Open the App Store on your iPhone or iPad and search for "WireGuard." Tap Get to download and install the free app.
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 2: Create a Device and Get the QR Code</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        In your SACVPN dashboard, create a new device. Instead of downloading the configuration file, look for the QR code option. SACVPN generates a scannable QR code containing your entire VPN configuration—this is the easiest setup method for mobile devices.
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 3: Scan the QR Code</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Open the WireGuard app, tap the + button, and select "Create from QR code." Point your camera at the QR code displayed in your dashboard. The app will automatically import all the configuration settings.
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 4: Allow VPN Configuration</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        iOS will ask for permission to add a VPN configuration. Tap "Allow" and authenticate with Face ID, Touch ID, or your passcode. This is a security measure to prevent unauthorized VPN installations.
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 5: Connect</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Toggle the switch next to your new tunnel to connect. You'll see a VPN icon appear in your status bar, indicating your connection is active and protected.
      </p>

      <h2 className="text-3xl font-bold text-white mt-12 mb-6">Setting Up VPN on Android</h2>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 1: Install WireGuard from Google Play</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Open the Google Play Store and search for "WireGuard." Install the official app (it's free and open-source).
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 2: Create a Device and Scan QR Code</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Create a new device in your SACVPN dashboard. Open the WireGuard app, tap the + button, and select "Scan from QR code." The app will request camera permission—allow it, then scan the QR code from your dashboard.
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 3: Grant VPN Permission</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Android will display a connection request when you first activate the VPN. Check "I trust this application" and tap OK. This allows WireGuard to create a secure VPN connection.
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 4: Connect</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Tap your tunnel to expand it, then toggle the switch to connect. A key icon will appear in your notification bar, indicating the VPN is active.
      </p>

      <h2 className="text-3xl font-bold text-white mt-12 mb-6">Setting Up VPN on Linux</h2>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 1: Install WireGuard</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        WireGuard is included in the Linux kernel (5.6+) and available in most distribution repositories. Install using your package manager:
      </p>

      <div className="bg-gray-800/50 rounded-xl p-6 my-8 border border-gray-700 font-mono text-sm">
        <p className="text-green-400"># Ubuntu/Debian</p>
        <p className="text-gray-300">sudo apt install wireguard</p>
        <br />
        <p className="text-green-400"># Fedora</p>
        <p className="text-gray-300">sudo dnf install wireguard-tools</p>
        <br />
        <p className="text-green-400"># Arch Linux</p>
        <p className="text-gray-300">sudo pacman -S wireguard-tools</p>
      </div>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 2: Download Configuration</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Create a device in your SACVPN dashboard and download the configuration file. Save it to /etc/wireguard/ with a .conf extension (e.g., sacvpn.conf). You'll need sudo permissions.
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Step 3: Connect via Terminal</h3>

      <div className="bg-gray-800/50 rounded-xl p-6 my-8 border border-gray-700 font-mono text-sm">
        <p className="text-green-400"># Start the VPN</p>
        <p className="text-gray-300">sudo wg-quick up sacvpn</p>
        <br />
        <p className="text-green-400"># Check connection status</p>
        <p className="text-gray-300">sudo wg show</p>
        <br />
        <p className="text-green-400"># Disconnect</p>
        <p className="text-gray-300">sudo wg-quick down sacvpn</p>
      </div>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Optional: Enable Auto-Start</h3>

      <div className="bg-gray-800/50 rounded-xl p-6 my-8 border border-gray-700 font-mono text-sm">
        <p className="text-green-400"># Enable VPN at boot</p>
        <p className="text-gray-300">sudo systemctl enable wg-quick@sacvpn</p>
      </div>

      <h2 className="text-3xl font-bold text-white mt-12 mb-6">Verifying Your VPN Connection</h2>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        After connecting, it's good practice to verify that your VPN is working correctly. Here are several ways to check:
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Check Your IP Address</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Visit a site like whatismyip.com or ipinfo.io. Your displayed IP address should be different from your regular IP and should show a location matching the VPN server you're connected to.
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Test for DNS Leaks</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Visit dnsleaktest.com and run an extended test. The results should only show DNS servers associated with your VPN provider, not your ISP's DNS servers.
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Check WireGuard Statistics</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        The WireGuard app shows data transfer statistics. If you see bytes being transferred in both directions (sent and received), your connection is working properly.
      </p>

      <h2 className="text-3xl font-bold text-white mt-12 mb-6">Troubleshooting Common Issues</h2>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">VPN Won't Connect</h3>

      <ul className="list-disc pl-6 text-gray-300 text-lg space-y-3 mb-6">
        <li>Check your internet connection—try visiting a website without the VPN</li>
        <li>Restart the WireGuard app and try connecting again</li>
        <li>Ensure your configuration file is correct and hasn't been modified</li>
        <li>Check if a firewall is blocking UDP traffic on port 51820</li>
      </ul>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Slow Connection Speeds</h3>

      <ul className="list-disc pl-6 text-gray-300 text-lg space-y-3 mb-6">
        <li>Try connecting to a server closer to your physical location</li>
        <li>Close bandwidth-heavy applications running in the background</li>
        <li>Check your base internet speed without the VPN</li>
        <li>WireGuard is extremely fast—if speeds are slow, the issue is likely your base connection</li>
      </ul>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Connection Drops Frequently</h3>

      <ul className="list-disc pl-6 text-gray-300 text-lg space-y-3 mb-6">
        <li>Check for WiFi interference or signal strength issues</li>
        <li>Update your WireGuard app to the latest version</li>
        <li>Try creating a new device configuration in your dashboard</li>
      </ul>

      <h2 className="text-3xl font-bold text-white mt-12 mb-6">Tips for Using Your VPN Effectively</h2>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Keep It Connected</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        For maximum protection, keep your VPN connected whenever you're online. WireGuard's efficiency means you won't notice a significant impact on speed or battery life.
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Use On Public WiFi</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Always connect to your VPN before using public WiFi at coffee shops, airports, hotels, or any other public location. This protects your data from potential eavesdroppers on the network.
      </p>

      <h3 className="text-2xl font-bold text-white mt-8 mb-4">Protect All Your Devices</h3>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        With SACVPN's generous device allowances, you can protect your phone, tablet, laptop, and desktop computer. For ultimate protection, consider setting up the VPN on your router to protect all devices on your network automatically.
      </p>

      <h2 className="text-3xl font-bold text-white mt-12 mb-6">Conclusion: You're Now Protected</h2>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Congratulations! You've successfully set up VPN protection on your device. With SACVPN's WireGuard-powered service, your internet traffic is now encrypted, your IP address is hidden, and your online activities are protected from prying eyes.
      </p>

      <p className="text-gray-300 text-lg leading-relaxed mb-6">
        Remember to keep your VPN connected, especially on untrusted networks, and don't hesitate to reach out to our support team if you have any questions or need assistance. Welcome to a more private, more secure internet experience!
      </p>
    </div>
  );
}
