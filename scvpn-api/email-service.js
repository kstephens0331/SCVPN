// Email service for VPN setup notifications
// Uses SendGrid for reliable email delivery

import sgMail from '@sendgrid/mail';

export class EmailService {
  constructor(apiKey, logger) {
    this.logger = logger;
    this.fromEmail = 'SACVPN <info@stephenscode.dev>';
    this.sendGridConfigured = false;

    // Initialize SendGrid
    if (apiKey) {
      sgMail.setApiKey(apiKey);
      this.sendGridConfigured = true;
      this.logger.info({ from: this.fromEmail }, 'Email service initialized with SendGrid');
    } else {
      this.logger.warn('Email service not configured - SendGrid API key missing');
    }
  }

  // Send VPN setup email with config file and QR code
  async sendVPNSetupEmail({ userEmail, userName, deviceName, wgConfig, qrCodeDataURL, platform }) {
    if (!this.sendGridConfigured) {
      this.logger.warn('Email service not configured - skipping email');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const isRouter = this.detectRouterFromDeviceName(deviceName, platform);
      const isMobile = this.detectMobileFromDeviceName(deviceName, platform);

      let emailHtml;
      if (isRouter) {
        emailHtml = this.getRouterSetupEmail(userName, deviceName, wgConfig);
      } else if (isMobile) {
        emailHtml = this.getMobileSetupEmail(userName, deviceName, qrCodeDataURL, wgConfig);
      } else {
        emailHtml = this.getDesktopSetupEmail(userName, deviceName, wgConfig);
      }

      const msg = {
        to: userEmail,
        from: this.fromEmail,
        subject: `Your ${deviceName} VPN is Ready! 🔒`,
        html: emailHtml,
        attachments: [
          {
            filename: `${this.sanitizeFilename(deviceName)}_sacvpn.conf`,
            content: Buffer.from(wgConfig).toString('base64'),
            type: 'text/plain',
            disposition: 'attachment',
          }
        ]
      };

      const response = await sgMail.send(msg);

      this.logger.info({
        messageId: response[0].headers['x-message-id'],
        to: userEmail
      }, 'VPN setup email sent');

      return { success: true, messageId: response[0].headers['x-message-id'] };

    } catch (error) {
      this.logger.error({
        error: error.message,
        code: error.code,
        response: error.response?.body
      }, 'Email sending failed');
      return { success: false, error: error.message };
    }
  }

  // Detect if device is a router from name or platform
  detectRouterFromDeviceName(name, platform) {
    if (platform === 'router') return true;
    const routerPat = /router|gateway|mikrotik|ubiquiti|openwrt|pfsense|edgerouter|asus.*rt|netgear|tp-link|linksys/i;
    return routerPat.test(name);
  }

  // Detect if device is likely mobile from name or platform
  detectMobileFromDeviceName(name, platform) {
    if (platform === 'ios' || platform === 'android') return true;
    const mobilePat = /iphone|ipad|android|mobile|pixel|galaxy|tablet/i;
    return mobilePat.test(name);
  }

  // Sanitize filename for attachment
  sanitizeFilename(name) {
    return name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  }

  // Desktop setup email template
  getDesktopSetupEmail(userName, deviceName, wgConfig) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your SACVPN is Ready!</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #000 0%, #333 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px; margin-bottom: 30px; }
    .logo { font-size: 32px; font-weight: bold; margin: 0; }
    .subtitle { font-size: 18px; margin: 10px 0 0 0; opacity: 0.9; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 8px; margin-bottom: 20px; }
    .step { background: white; padding: 20px; margin: 15px 0; border-left: 4px solid #dc2626; border-radius: 4px; }
    .step-number { display: inline-block; background: #dc2626; color: white; width: 30px; height: 30px; line-height: 30px; text-align: center; border-radius: 50%; margin-right: 10px; font-weight: bold; }
    .button { display: inline-block; background: #dc2626; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 15px 0; }
    .code-block { background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 12px; overflow-x: auto; margin: 10px 0; }
    .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
    .platform-links { display: flex; justify-content: space-around; margin: 20px 0; }
    .platform-link { text-align: center; }
    .icon { font-size: 40px; margin-bottom: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="logo">🔒 SACVPN</h1>
    <p class="subtitle">Your VPN is Ready!</p>
  </div>

  <div class="content">
    <h2>Hi ${userName || 'there'}! 👋</h2>
    <p>Great news! Your VPN configuration for <strong>${deviceName}</strong> is ready to use. Follow the simple steps below to get connected in under 2 minutes.</p>

    <div class="step">
      <span class="step-number">1</span>
      <strong>Download WireGuard</strong>
      <div class="platform-links">
        <div class="platform-link">
          <div class="icon"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Windows_logo_-_2012.svg/32px-Windows_logo_-_2012.svg.png" alt="Windows" width="32" height="32" style="display:inline-block;"></div>
          <a href="https://download.wireguard.com/windows-client/wireguard-installer.exe">Windows</a>
        </div>
        <div class="platform-link">
          <div class="icon"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/32px-Apple_logo_black.svg.png" alt="macOS" width="32" height="32" style="display:inline-block;"></div>
          <a href="https://apps.apple.com/us/app/wireguard/id1451685025">macOS</a>
        </div>
        <div class="platform-link">
          <div class="icon"><img src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/35/Tux.svg/32px-Tux.svg.png" alt="Linux" width="32" height="32" style="display:inline-block;"></div>
          <code>sudo apt install wireguard</code>
        </div>
      </div>
    </div>

    <div class="step">
      <span class="step-number">2</span>
      <strong>Import Your Configuration</strong>
      <p>Your WireGuard config file is attached to this email: <code>${this.sanitizeFilename(deviceName)}_sacvpn.conf</code></p>
      <p>• <strong>Windows/Mac:</strong> Open WireGuard app → "Import tunnel(s) from file" → Select downloaded .conf file<br>
      • <strong>Linux:</strong> <code>sudo wg-quick up /path/to/${this.sanitizeFilename(deviceName)}_sacvpn.conf</code></p>
    </div>

    <div class="step">
      <span class="step-number">3</span>
      <strong>Activate & Connect</strong>
      <p>Click the toggle/button in the WireGuard app to connect. That's it! 🎉</p>
      <p>You'll see "Active" status when connected. Your traffic is now encrypted and your IP is hidden.</p>
    </div>

    <h3>🧪 Test Your Connection</h3>
    <p>Verify you're connected by visiting: <a href="https://www.whatismyip.com">whatismyip.com</a></p>
    <p>Your IP should now show the VPN server location instead of your real location.</p>

    <h3>⚡ Performance Tips</h3>
    <ul>
      <li>Keep WireGuard app running in background for auto-connect</li>
      <li>Use "Always-On VPN" in settings for maximum protection</li>
      <li>Typical speeds: 100+ Mbps down, 50+ Mbps up</li>
      <li>Latency: 20-50ms (excellent for gaming and streaming)</li>
    </ul>
  </div>

  <div class="footer">
    <p><strong>Need help?</strong> Reply to this email or visit our <a href="https://www.sacvpn.com/support">Support Center</a></p>
    <p>🔒 Stay secure with SACVPN</p>
    <p style="font-size: 12px; color: #999;">This email was sent because you requested a VPN configuration for ${deviceName}.</p>
  </div>
</body>
</html>
    `.trim();
  }

  // Mobile setup email template with QR code
  getMobileSetupEmail(userName, deviceName, qrCodeDataURL, wgConfig) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your SACVPN is Ready!</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #000 0%, #333 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px; margin-bottom: 30px; }
    .logo { font-size: 32px; font-weight: bold; margin: 0; }
    .subtitle { font-size: 18px; margin: 10px 0 0 0; opacity: 0.9; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 8px; margin-bottom: 20px; }
    .step { background: white; padding: 20px; margin: 15px 0; border-left: 4px solid #dc2626; border-radius: 4px; }
    .step-number { display: inline-block; background: #dc2626; color: white; width: 30px; height: 30px; line-height: 30px; text-align: center; border-radius: 50%; margin-right: 10px; font-weight: bold; }
    .qr-container { text-align: center; background: white; padding: 30px; border-radius: 8px; margin: 20px 0; border: 2px dashed #dc2626; }
    .qr-code { max-width: 300px; margin: 0 auto; display: block; }
    .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
    .app-store { display: inline-block; margin: 10px; }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="logo">🔒 SACVPN</h1>
    <p class="subtitle">Your Mobile VPN is Ready!</p>
  </div>

  <div class="content">
    <h2>Hi ${userName || 'there'}! 👋</h2>
    <p>Your VPN for <strong>${deviceName}</strong> is ready! Setup takes just 30 seconds using the QR code below.</p>

    <div class="step">
      <span class="step-number">1</span>
      <strong>Download WireGuard App</strong>
      <div style="text-align: center; margin-top: 15px;">
        <a href="https://apps.apple.com/us/app/wireguard/id1441195209" class="app-store">
          <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="Download on App Store" height="40">
        </a>
        <a href="https://play.google.com/store/apps/details?id=com.wireguard.android" class="app-store">
          <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Get it on Google Play" height="60">
        </a>
      </div>
    </div>

    <div class="step">
      <span class="step-number">2</span>
      <strong>Scan QR Code</strong>
      <div class="qr-container">
        <p>Open WireGuard app → Tap <strong>"+"</strong> → <strong>"Create from QR code"</strong></p>
        <img src="${qrCodeDataURL}" alt="WireGuard QR Code" class="qr-code">
        <p style="color: #999; font-size: 14px; margin-top: 15px;">Scan this code with your camera</p>
      </div>
    </div>

    <div class="step">
      <span class="step-number">3</span>
      <strong>Activate VPN</strong>
      <p>Toggle the switch in WireGuard app to connect. Done! 🎉</p>
      <p>You'll see "Active" when connected. Your traffic is now encrypted!</p>
    </div>

    <h3>📱 Alternative: Manual Import</h3>
    <p>If QR code doesn't work, use the attached <code>${this.sanitizeFilename(deviceName)}_sacvpn.conf</code> file:</p>
    <ol>
      <li>Download the .conf file attachment</li>
      <li>Open WireGuard app → "+" → "Create from file or archive"</li>
      <li>Select the downloaded file</li>
    </ol>

    <h3>🧪 Test Your Connection</h3>
    <p>Visit <a href="https://www.whatismyip.com">whatismyip.com</a> in your browser to verify your IP changed.</p>

    <h3>⚡ Pro Tips</h3>
    <ul>
      <li>Enable "VPN On-Demand" for automatic connection</li>
      <li>Works on both WiFi and cellular data</li>
      <li>Battery efficient - no noticeable drain</li>
      <li>Perfect for public WiFi security</li>
    </ul>
  </div>

  <div class="footer">
    <p><strong>Need help?</strong> Reply to this email or visit <a href="https://www.sacvpn.com/support">Support Center</a></p>
    <p>🔒 Stay secure with SACVPN</p>
    <p style="font-size: 12px; color: #999;">This email was sent because you requested VPN access for ${deviceName}.</p>
  </div>
</body>
</html>
    `.trim();
  }

  // Router setup email template with detailed instructions
  getRouterSetupEmail(userName, deviceName, wgConfig) {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your SACVPN Router Configuration is Ready!</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #000 0%, #333 100%); color: white; padding: 30px 20px; text-align: center; border-radius: 8px; margin-bottom: 30px; }
    .logo { font-size: 32px; font-weight: bold; margin: 0; }
    .subtitle { font-size: 18px; margin: 10px 0 0 0; opacity: 0.9; }
    .content { background: #f9f9f9; padding: 30px; border-radius: 8px; margin-bottom: 20px; }
    .step { background: white; padding: 20px; margin: 15px 0; border-left: 4px solid #dc2626; border-radius: 4px; }
    .step-number { display: inline-block; background: #dc2626; color: white; width: 30px; height: 30px; line-height: 30px; text-align: center; border-radius: 50%; margin-right: 10px; font-weight: bold; }
    .code-block { background: #1e1e1e; color: #d4d4d4; padding: 15px; border-radius: 4px; font-family: 'Courier New', monospace; font-size: 12px; overflow-x: auto; margin: 10px 0; white-space: pre-wrap; }
    .footer { text-align: center; color: #666; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; }
    .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; border-radius: 4px; }
    .router-type { background: white; padding: 15px; margin: 10px 0; border-radius: 4px; border: 1px solid #e5e7eb; }
    .router-type h4 { margin: 0 0 10px 0; color: #dc2626; }
  </style>
</head>
<body>
  <div class="header">
    <h1 class="logo">🔒 SACVPN</h1>
    <p class="subtitle">Your Router VPN is Ready!</p>
  </div>

  <div class="content">
    <h2>Hi ${userName || 'there'}! 👋</h2>
    <p>Your VPN configuration for <strong>${deviceName}</strong> is ready. Router setup requires a few more steps than desktop/mobile, but once configured, all devices on your network will be protected automatically!</p>

    <div class="warning">
      <strong>⚠️ Important:</strong> Router VPN setup requires access to your router's admin panel and basic networking knowledge. Make sure you have your router's admin password ready.
    </div>

    <div class="step">
      <span class="step-number">1</span>
      <strong>Access Your Router Admin Panel</strong>
      <p>Open a browser and go to your router's admin page (usually <code>192.168.1.1</code> or <code>192.168.0.1</code>). Log in with your admin credentials.</p>
    </div>

    <div class="step">
      <span class="step-number">2</span>
      <strong>Locate WireGuard/VPN Settings</strong>
      <p>Find the WireGuard or VPN section in your router's settings. The location varies by router brand:</p>

      <div class="router-type">
        <h4>OpenWrt / DD-WRT</h4>
        <p>Services → VPN → WireGuard</p>
        <ol>
          <li>Create a new WireGuard interface</li>
          <li>Copy the <code>[Interface]</code> section values from the attached config</li>
          <li>Add a peer with the <code>[Peer]</code> section values</li>
        </ol>
      </div>

      <div class="router-type">
        <h4>ASUS Routers (with Merlin)</h4>
        <p>VPN → WireGuard</p>
        <ol>
          <li>Enable WireGuard</li>
          <li>Import the attached .conf file directly</li>
          <li>Or manually enter the configuration values</li>
        </ol>
      </div>

      <div class="router-type">
        <h4>MikroTik RouterOS</h4>
        <p>WireGuard → Peers</p>
        <ol>
          <li>Create WireGuard interface with the private key</li>
          <li>Add peer with public key, endpoint, and allowed IPs</li>
          <li>Configure routing and firewall rules</li>
        </ol>
      </div>

      <div class="router-type">
        <h4>pfSense / OPNsense</h4>
        <p>VPN → WireGuard</p>
        <ol>
          <li>Add a new tunnel with the interface settings</li>
          <li>Add a peer with the server details</li>
          <li>Configure firewall rules and routing</li>
        </ol>
      </div>

      <div class="router-type">
        <h4>Ubiquiti EdgeRouter</h4>
        <p>Config Tree → interfaces → wireguard</p>
        <ol>
          <li>Create WireGuard interface (wg0)</li>
          <li>Set private key and listen port</li>
          <li>Add peer configuration</li>
          <li>Configure routing</li>
        </ol>
      </div>
    </div>

    <div class="step">
      <span class="step-number">3</span>
      <strong>Your Configuration File</strong>
      <p>The attached <code>${this.sanitizeFilename(deviceName)}_sacvpn.conf</code> contains all required values. Here's a breakdown:</p>
      <div class="code-block">${wgConfig}</div>
      <p><strong>Key values you'll need:</strong></p>
      <ul>
        <li><strong>PrivateKey:</strong> Your router's private key (keep secret!)</li>
        <li><strong>Address:</strong> Your router's VPN IP address</li>
        <li><strong>DNS:</strong> DNS servers to use when VPN is active</li>
        <li><strong>PublicKey:</strong> SACVPN server's public key</li>
        <li><strong>Endpoint:</strong> SACVPN server address and port</li>
        <li><strong>AllowedIPs:</strong> Traffic to route through VPN</li>
      </ul>
    </div>

    <div class="step">
      <span class="step-number">4</span>
      <strong>Configure Routing (Important!)</strong>
      <p>To route all network traffic through the VPN:</p>
      <ul>
        <li>Set <code>AllowedIPs = 0.0.0.0/0</code> for full tunnel (all traffic)</li>
        <li>Or specify only certain IPs for split tunnel</li>
        <li>Ensure NAT/masquerading is enabled on the WireGuard interface</li>
        <li>Add firewall rules to allow WireGuard traffic</li>
      </ul>
    </div>

    <div class="step">
      <span class="step-number">5</span>
      <strong>Test Your Connection</strong>
      <p>After configuration:</p>
      <ol>
        <li>Enable/start the WireGuard interface</li>
        <li>Check the handshake status (should show recent timestamp)</li>
        <li>From a device on your network, visit <a href="https://www.whatismyip.com">whatismyip.com</a></li>
        <li>Your IP should now show the VPN server location</li>
      </ol>
    </div>

    <h3>🔧 Troubleshooting</h3>
    <ul>
      <li><strong>No handshake:</strong> Check firewall rules, ensure UDP port 51820 is allowed</li>
      <li><strong>Connected but no internet:</strong> Check DNS settings and routing rules</li>
      <li><strong>Slow speeds:</strong> Try adjusting MTU (usually 1420 works well)</li>
      <li><strong>Some sites not working:</strong> May need to adjust MSS clamping</li>
    </ul>

    <h3>📚 Additional Resources</h3>
    <ul>
      <li><a href="https://openwrt.org/docs/guide-user/services/vpn/wireguard/client">OpenWrt WireGuard Guide</a></li>
      <li><a href="https://docs.netgate.com/pfsense/en/latest/vpn/wireguard/index.html">pfSense WireGuard Docs</a></li>
      <li><a href="https://wiki.mikrotik.com/wiki/Manual:Interface/WireGuard">MikroTik WireGuard Manual</a></li>
    </ul>
  </div>

  <div class="footer">
    <p><strong>Need help?</strong> Router setup can be tricky! Reply to this email or visit our <a href="https://www.sacvpn.com/support">Support Center</a> for assistance.</p>
    <p>🔒 Stay secure with SACVPN</p>
    <p style="font-size: 12px; color: #999;">This email was sent because you requested a VPN configuration for ${deviceName}.</p>
  </div>
</body>
</html>
    `.trim();
  }
}
