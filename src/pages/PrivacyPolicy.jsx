export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-4xl font-bold mb-6">Privacy Policy</h1>
      <p className="text-sm text-gray-600 mb-8">Last Updated: October 27, 2025</p>

      <div className="prose prose-lg max-w-none space-y-8">

        {/* Introduction */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">Introduction</h2>
          <p className="mb-4">
            At SACVPN ("we," "us," or "our"), operated by Stephen's Code, we are committed to protecting
            your privacy and ensuring the security of your personal information. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your information when you use our
            virtual private network (VPN) service, website, and applications (collectively, the "Service").
          </p>
          <p>
            <strong>Our Core Privacy Principle:</strong> We operate a strict no-logs policy. We do not
            track, log, or store your browsing activity, connection logs, IP addresses, or DNS queries.
          </p>
        </section>

        {/* 1. Information We Collect */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Information We Collect</h2>

          <h3 className="text-xl font-semibold mb-2 mt-4">1.1 Information You Provide to Us</h3>
          <p className="mb-4"><strong>Account Information:</strong></p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Email Address:</strong> Required for account creation, authentication, and communication</li>
            <li><strong>Password:</strong> Encrypted and stored securely using industry-standard hashing</li>
            <li><strong>Display Name:</strong> Optional, for personalizing your account</li>
            <li><strong>Payment Information:</strong> Processed securely through Stripe (we never store full credit card numbers)</li>
          </ul>

          <p className="mb-4"><strong>Support Communications:</strong></p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Any information you provide when contacting customer support</li>
            <li>Email correspondence and support tickets</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2 mt-4">1.2 Information Collected Automatically</h3>
          <p className="mb-4"><strong>Service Usage Data (Non-Identifiable):</strong></p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Total Bandwidth:</strong> Aggregate data usage for capacity planning</li>
            <li><strong>Server Load:</strong> Anonymous metrics to optimize server performance</li>
            <li><strong>App Version:</strong> To ensure compatibility and provide updates</li>
            <li><strong>Operating System:</strong> To provide platform-specific support</li>
          </ul>

          <p className="mb-4"><strong>Website Analytics:</strong></p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Page views, click patterns, and navigation paths (via privacy-respecting analytics)</li>
            <li>Device type, browser type, and screen resolution</li>
            <li>Referring websites and search terms</li>
            <li>Geographic location (country-level only)</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2 mt-4">1.3 What We DO NOT Collect (No-Logs Policy)</h3>
          <div className="bg-green-50 p-6 rounded-lg border border-green-200 mb-4">
            <p className="font-semibold mb-3">We DO NOT log or store:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>❌ Browsing history or websites visited</li>
              <li>❌ Source IP addresses of VPN connections</li>
              <li>❌ VPN server IP addresses you connect to</li>
              <li>❌ Connection timestamps or session duration</li>
              <li>❌ DNS queries or DNS leak data</li>
              <li>❌ Traffic data or bandwidth usage per session</li>
              <li>❌ Individual user activity or behavior patterns</li>
            </ul>
          </div>
        </section>

        {/* 2. How We Use Your Information */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">2. How We Use Your Information</h2>
          <p className="mb-4">We use the information we collect for the following purposes:</p>

          <h3 className="text-xl font-semibold mb-2 mt-4">2.1 Service Provision</h3>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Creating and managing your account</li>
            <li>Authenticating your identity and preventing unauthorized access</li>
            <li>Processing payments and managing subscriptions</li>
            <li>Providing customer support and responding to inquiries</li>
            <li>Delivering service updates and important notices</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2 mt-4">2.2 Service Improvement</h3>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Analyzing aggregate usage patterns to optimize server capacity</li>
            <li>Monitoring service performance and reliability</li>
            <li>Developing new features and improving existing ones</li>
            <li>Conducting internal research and analytics</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2 mt-4">2.3 Legal and Security</h3>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Detecting and preventing fraud, abuse, or security threats</li>
            <li>Complying with legal obligations and responding to lawful requests</li>
            <li>Enforcing our Terms of Service</li>
            <li>Protecting our rights, property, and safety</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2 mt-4">2.4 Marketing (Opt-In Only)</h3>
          <ul className="list-disc pl-6 space-y-2">
            <li>Sending promotional emails about new features or offers (with your consent)</li>
            <li>You can unsubscribe from marketing emails at any time</li>
          </ul>
        </section>

        {/* 3. Information Sharing and Disclosure */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Information Sharing and Disclosure</h2>
          <p className="mb-4">
            We do not sell, rent, or trade your personal information to third parties for their
            marketing purposes. We may share information only in the following circumstances:
          </p>

          <h3 className="text-xl font-semibold mb-2 mt-4">3.1 Service Providers</h3>
          <p className="mb-4">We share information with trusted third-party service providers who assist us in operating our Service:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Stripe:</strong> Payment processing (see <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Stripe's Privacy Policy</a>)</li>
            <li><strong>Supabase:</strong> Database and authentication services</li>
            <li><strong>Email Service Provider:</strong> Transactional and support emails</li>
            <li><strong>Server Hosting Providers:</strong> OVH and other infrastructure providers</li>
          </ul>
          <p className="text-sm text-gray-600 mb-4">
            These providers are contractually obligated to protect your data and use it only for the
            purposes we specify.
          </p>

          <h3 className="text-xl font-semibold mb-2 mt-4">3.2 Legal Requirements</h3>
          <p className="mb-4">We may disclose information if required by law or in response to valid legal processes, such as:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Court orders or subpoenas</li>
            <li>Government or regulatory investigations</li>
            <li>Protection of national security</li>
          </ul>
          <p className="text-sm text-gray-600 mb-4">
            <strong>Note:</strong> Due to our no-logs policy, we have minimal data to provide even if
            legally compelled. We cannot provide browsing history, connection logs, or IP addresses
            because we do not collect this information.
          </p>

          <h3 className="text-xl font-semibold mb-2 mt-4">3.3 Business Transfers</h3>
          <p>
            If SACVPN is involved in a merger, acquisition, or sale of assets, your information may be
            transferred. We will notify you before your information is transferred and becomes subject
            to a different privacy policy.
          </p>
        </section>

        {/* 4. Data Security */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Data Security</h2>
          <p className="mb-4">We implement industry-standard security measures to protect your information:</p>

          <h3 className="text-xl font-semibold mb-2 mt-4">4.1 Technical Safeguards</h3>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Encryption:</strong> All data in transit is encrypted using TLS 1.3</li>
            <li><strong>WireGuard Protocol:</strong> State-of-the-art VPN encryption (ChaCha20, Poly1305)</li>
            <li><strong>Secure Storage:</strong> Passwords hashed using bcrypt with salt</li>
            <li><strong>Database Security:</strong> Encrypted at rest, access-controlled</li>
            <li><strong>Regular Security Audits:</strong> Vulnerability assessments and penetration testing</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2 mt-4">4.2 Organizational Safeguards</h3>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Access to personal information limited to authorized personnel only</li>
            <li>Employee training on data protection and privacy practices</li>
            <li>Incident response procedures for data breaches</li>
          </ul>

          <p className="text-sm text-gray-600">
            <strong>Note:</strong> No method of transmission over the Internet is 100% secure. While we
            strive to protect your information, we cannot guarantee absolute security.
          </p>
        </section>

        {/* 5. Data Retention */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Data Retention</h2>
          <p className="mb-4">We retain your personal information only as long as necessary for the purposes outlined in this Privacy Policy:</p>

          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Active Accounts:</strong> Information retained while your account is active</li>
            <li><strong>Canceled Accounts:</strong> Account data deleted within 30 days of cancellation</li>
            <li><strong>Payment Records:</strong> Retained for 7 years to comply with tax and accounting regulations</li>
            <li><strong>Support Communications:</strong> Retained for 2 years for quality assurance and dispute resolution</li>
            <li><strong>VPN Connection Data:</strong> Not retained (no-logs policy)</li>
          </ul>

          <p>
            You can request deletion of your account and associated data at any time by contacting us
            at info@stephenscode.dev.
          </p>
        </section>

        {/* 6. Your Privacy Rights */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Your Privacy Rights</h2>
          <p className="mb-4">Depending on your location, you may have the following rights regarding your personal information:</p>

          <h3 className="text-xl font-semibold mb-2 mt-4">6.1 General Rights (All Users)</h3>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Access:</strong> Request a copy of your personal information</li>
            <li><strong>Correction:</strong> Update or correct inaccurate information</li>
            <li><strong>Deletion:</strong> Request deletion of your account and data</li>
            <li><strong>Portability:</strong> Receive your data in a machine-readable format</li>
            <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2 mt-4">6.2 GDPR Rights (European Economic Area)</h3>
          <p className="mb-4">If you are in the EEA, you have additional rights under the General Data Protection Regulation (GDPR):</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Right to Object:</strong> Object to processing of your personal data</li>
            <li><strong>Right to Restriction:</strong> Request restriction of processing</li>
            <li><strong>Right to Withdraw Consent:</strong> Withdraw consent at any time</li>
            <li><strong>Right to Lodge a Complaint:</strong> File a complaint with your local data protection authority</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2 mt-4">6.3 CCPA Rights (California Residents)</h3>
          <p className="mb-4">If you are a California resident, you have rights under the California Consumer Privacy Act (CCPA):</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Right to Know:</strong> Know what personal information we collect and how it's used</li>
            <li><strong>Right to Delete:</strong> Request deletion of your personal information</li>
            <li><strong>Right to Opt-Out:</strong> Opt-out of sale of personal information (Note: We do not sell personal information)</li>
            <li><strong>Right to Non-Discrimination:</strong> Not be discriminated against for exercising your rights</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2 mt-4">6.4 How to Exercise Your Rights</h3>
          <p className="mb-4">To exercise any of these rights, contact us at:</p>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p><strong>Email:</strong> info@stephenscode.dev</p>
            <p><strong>Subject Line:</strong> Privacy Rights Request</p>
          </div>
          <p className="text-sm text-gray-600">
            We will respond to your request within 30 days. We may need to verify your identity before
            processing your request.
          </p>
        </section>

        {/* 7. Cookies and Tracking */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Cookies and Tracking Technologies</h2>

          <h3 className="text-xl font-semibold mb-2 mt-4">7.1 What We Use</h3>
          <p className="mb-4">We use minimal cookies and tracking technologies:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li><strong>Essential Cookies:</strong> Required for login, authentication, and security (cannot be disabled)</li>
            <li><strong>Analytics Cookies:</strong> Anonymous usage statistics (can be opted out)</li>
            <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2 mt-4">7.2 Third-Party Cookies</h3>
          <p className="mb-4">We use privacy-respecting analytics that do not track you across websites:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>No third-party advertising cookies</li>
            <li>No social media tracking pixels</li>
            <li>No cross-site tracking</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2 mt-4">7.3 Managing Cookies</h3>
          <p>
            You can control cookies through your browser settings. Note that disabling essential
            cookies may affect functionality of the Service.
          </p>
        </section>

        {/* 8. Children's Privacy */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Children's Privacy</h2>
          <p className="mb-4">
            Our Service is not directed to children under 13 years of age. We do not knowingly collect
            personal information from children under 13. If you are a parent or guardian and believe
            your child has provided us with personal information, please contact us at
            info@stephenscode.dev, and we will delete such information.
          </p>
          <p>
            Users between 13 and 18 years of age must have parental consent to use the Service.
          </p>
        </section>

        {/* 9. International Data Transfers */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">9. International Data Transfers</h2>
          <p className="mb-4">
            Your information may be transferred to and processed in countries other than your own.
            We ensure that appropriate safeguards are in place, including:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Standard Contractual Clauses (SCCs) approved by the European Commission</li>
            <li>Adequacy decisions for certain countries</li>
            <li>Encryption and security measures during transfer</li>
          </ul>
          <p>
            By using our Service, you consent to the transfer of your information to countries that
            may have different data protection laws than your own.
          </p>
        </section>

        {/* 10. Do Not Track */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Do Not Track Signals</h2>
          <p>
            We respect Do Not Track (DNT) browser signals. When DNT is enabled, we do not track your
            activity across other websites or use third-party analytics cookies.
          </p>
        </section>

        {/* 11. Changes to Privacy Policy */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">11. Changes to This Privacy Policy</h2>
          <p className="mb-4">
            We may update this Privacy Policy from time to time. Material changes will be notified via:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Email to your registered email address</li>
            <li>Prominent notice on our website</li>
            <li>In-app notification</li>
          </ul>
          <p>
            The "Last Updated" date at the top of this policy indicates when it was last revised.
            Your continued use of the Service after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        {/* 12. Contact Us */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">12. Contact Us</h2>
          <p className="mb-4">
            If you have questions, concerns, or requests regarding this Privacy Policy or our data
            practices, please contact us:
          </p>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p><strong>SACVPN</strong></p>
            <p>Stephen's Code</p>
            <p><strong>Email:</strong> info@stephenscode.dev</p>
            <p><strong>Website:</strong> https://sacvpn.com</p>
            <p className="mt-4 text-sm text-gray-600">
              For privacy-related inquiries, please include "Privacy Request" in the subject line.
              We will respond within 30 days.
            </p>
          </div>
        </section>

        {/* Data Protection Officer */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">13. Data Protection Officer</h2>
          <p>
            For GDPR-related inquiries, you may contact our Data Protection Officer at:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mt-4">
            <p><strong>Email:</strong> privacy@stephenscode.dev</p>
          </div>
        </section>

        {/* No-Logs Commitment */}
        <section className="bg-green-50 p-6 rounded-lg border border-green-200">
          <h2 className="text-xl font-semibold mb-3">Our No-Logs Commitment</h2>
          <p className="mb-3">
            <strong>We are committed to your privacy.</strong> Unlike many VPN providers, we operate
            a true no-logs policy verified by our technical architecture.
          </p>
          <p>
            We believe that privacy is a fundamental right, and we've designed our Service to collect
            only the minimum information necessary to provide you with a secure, reliable VPN connection.
          </p>
        </section>

      </div>
    </div>
  );
}
