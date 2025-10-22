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
  async sendVPNSetupEmail({ userEmail, userName, deviceName, wgConfig, qrCodeDataURL }) {
    if (!this.sendGridConfigured) {
      this.logger.warn('Email service not configured - skipping email');
      return { success: false, error: 'Email service not configured' };
    }

    try {
      const isMobile = this.detectMobileFromDeviceName(deviceName);

      const emailHtml = isMobile
        ? this.getMobileSetupEmail(userName, deviceName, qrCodeDataURL, wgConfig)
        : this.getDesktopSetupEmail(userName, deviceName, wgConfig);

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

  // Detect if device is likely mobile from name
  detectMobileFromDeviceName(name) {
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
          <div class="icon">🪟</div>
          <a href="https://download.wireguard.com/windows-client/wireguard-installer.exe">Windows</a>
        </div>
        <div class="platform-link">
          <div class="icon">🍎</div>
          <a href="https://apps.apple.com/us/app/wireguard/id1451685025">macOS</a>
        </div>
        <div class="platform-link">
          <div class="icon">🐧</div>
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
}
