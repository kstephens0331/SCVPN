export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <h1 className="text-4xl font-bold mb-6">Terms of Service</h1>
      <p className="text-sm text-gray-600 mb-8">Last Updated: October 27, 2025</p>

      <div className="prose prose-lg max-w-none space-y-8">

        {/* 1. Agreement to Terms */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">1. Agreement to Terms</h2>
          <p className="mb-4">
            By accessing or using SACVPN's services, website, or applications (collectively, the "Service"),
            you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms,
            do not use the Service.
          </p>
          <p>
            SACVPN is operated by Stephen's Code ("we," "us," or "our"). We provide virtual private network
            (VPN) services to protect your online privacy and security.
          </p>
        </section>

        {/* 2. Acceptable Use */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">2. Acceptable Use Policy</h2>
          <p className="mb-4">You agree to use SACVPN only for lawful purposes. You may NOT use our Service to:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Violate any local, state, national, or international law</li>
            <li>Infringe on intellectual property rights of others</li>
            <li>Transmit malware, viruses, or any malicious code</li>
            <li>Engage in spamming, phishing, or fraudulent activities</li>
            <li>Access or attempt to access systems or data without authorization</li>
            <li>Harass, threaten, or harm others</li>
            <li>Distribute child exploitation material (zero tolerance)</li>
            <li>Engage in activities that could harm our infrastructure or other users</li>
            <li>Resell or redistribute our Service without written permission</li>
          </ul>
          <p className="mt-4">
            <strong>Violation of this policy may result in immediate termination of your account without refund.</strong>
          </p>
        </section>

        {/* 3. Account Registration */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">3. Account Registration and Security</h2>
          <p className="mb-4">To use SACVPN, you must:</p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Provide accurate and complete registration information</li>
            <li>Maintain the security of your account credentials</li>
            <li>Be at least 18 years of age or have parental consent</li>
            <li>Notify us immediately of any unauthorized account access</li>
          </ul>
          <p>
            You are responsible for all activities that occur under your account. We recommend using
            strong passwords and enabling two-factor authentication when available.
          </p>
        </section>

        {/* 4. Subscription and Payment */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Subscription and Payment Terms</h2>

          <h3 className="text-xl font-semibold mb-2 mt-4">4.1 Billing</h3>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Subscriptions are billed in advance for the selected billing period</li>
            <li>Payment is processed through Stripe, our secure payment processor</li>
            <li>All prices are in U.S. Dollars (USD) unless otherwise stated</li>
            <li>Subscriptions automatically renew unless canceled before renewal date</li>
          </ul>

          <h3 className="text-xl font-semibold mb-2 mt-4">4.2 Refund Policy</h3>
          <p className="mb-4">
            We offer a <strong>30-day money-back guarantee</strong> for first-time subscribers.
            To request a refund within 30 days of your initial purchase, contact us at
            info@stephenscode.dev with your account email.
          </p>
          <p className="mb-4">After 30 days, refunds are provided at our sole discretion and only in exceptional circumstances.</p>

          <h3 className="text-xl font-semibold mb-2 mt-4">4.3 Cancellation</h3>
          <p className="mb-4">
            You may cancel your subscription at any time from your account dashboard. Cancellation
            takes effect at the end of your current billing period. No prorated refunds are provided
            for partial billing periods.
          </p>

          <h3 className="text-xl font-semibold mb-2 mt-4">4.4 Price Changes</h3>
          <p>
            We reserve the right to modify our pricing. Existing subscribers will be notified at least
            30 days before any price changes take effect. Continued use after notification constitutes
            acceptance of new pricing.
          </p>
        </section>

        {/* 5. Service Availability */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Service Availability and Support</h2>
          <p className="mb-4">
            We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service. The Service
            may be temporarily unavailable due to:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Scheduled maintenance (announced in advance when possible)</li>
            <li>Emergency maintenance or security updates</li>
            <li>Factors beyond our control (ISP issues, DDoS attacks, natural disasters)</li>
          </ul>
          <p>
            Technical support is provided via email at info@stephenscode.dev. Response times vary
            based on plan level and issue severity.
          </p>
        </section>

        {/* 6. Privacy and Data */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">6. Privacy and Data Collection</h2>
          <p className="mb-4">
            <strong>No-Logs Policy:</strong> We do not log your browsing activity, connection
            timestamps, IP addresses, or DNS queries. We collect only minimal data necessary to
            provide and improve our Service.
          </p>
          <p>
            For complete details on data collection and use, please review our{' '}
            <a href="/privacy" className="text-blue-600 hover:underline font-semibold">Privacy Policy</a>.
          </p>
        </section>

        {/* 7. Intellectual Property */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">7. Intellectual Property Rights</h2>
          <p className="mb-4">
            All content, features, and functionality of the Service, including but not limited to
            software, text, graphics, logos, and trademarks, are owned by SACVPN or our licensors
            and are protected by copyright, trademark, and other intellectual property laws.
          </p>
          <p>
            You may not copy, modify, distribute, sell, or reverse engineer any part of the Service
            without our prior written consent.
          </p>
        </section>

        {/* 8. Third-Party Services */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">8. Third-Party Services and Links</h2>
          <p className="mb-4">
            Our Service may contain links to third-party websites or services (e.g., Stripe for payments).
            We are not responsible for:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Content, privacy policies, or practices of third-party sites</li>
            <li>Transactions between you and third-party providers</li>
            <li>Availability or reliability of third-party services</li>
          </ul>
        </section>

        {/* 9. Disclaimers and Limitations */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">9. Disclaimers and Limitations of Liability</h2>

          <h3 className="text-xl font-semibold mb-2 mt-4">9.1 Service "As Is"</h3>
          <p className="mb-4">
            THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND,
            EITHER EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF
            MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.
          </p>

          <h3 className="text-xl font-semibold mb-2 mt-4">9.2 Limitation of Liability</h3>
          <p className="mb-4">
            TO THE MAXIMUM EXTENT PERMITTED BY LAW, SACVPN SHALL NOT BE LIABLE FOR ANY INDIRECT,
            INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR
            REVENUES, WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL,
            OR OTHER INTANGIBLE LOSSES.
          </p>
          <p>
            Our total liability shall not exceed the amount you paid us in the 12 months preceding
            the claim.
          </p>
        </section>

        {/* 10. Indemnification */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">10. Indemnification</h2>
          <p>
            You agree to indemnify and hold harmless SACVPN, its officers, directors, employees,
            and agents from any claims, losses, damages, liabilities, and expenses (including legal fees)
            arising from:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4">
            <li>Your use or misuse of the Service</li>
            <li>Your violation of these Terms</li>
            <li>Your violation of any rights of another party</li>
          </ul>
        </section>

        {/* 11. Termination */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">11. Termination</h2>
          <p className="mb-4">
            We reserve the right to suspend or terminate your account and access to the Service at
            any time, with or without notice, for:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Violation of these Terms or our Acceptable Use Policy</li>
            <li>Fraudulent or illegal activity</li>
            <li>Non-payment of fees</li>
            <li>At our sole discretion for any reason</li>
          </ul>
          <p>
            Upon termination, your right to use the Service immediately ceases. Termination for cause
            does not entitle you to a refund.
          </p>
        </section>

        {/* 12. Dispute Resolution */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">12. Dispute Resolution and Arbitration</h2>

          <h3 className="text-xl font-semibold mb-2 mt-4">12.1 Informal Resolution</h3>
          <p className="mb-4">
            Before filing a claim, you agree to contact us at info@stephenscode.dev to attempt
            to resolve the dispute informally for at least 30 days.
          </p>

          <h3 className="text-xl font-semibold mb-2 mt-4">12.2 Binding Arbitration</h3>
          <p className="mb-4">
            If informal resolution fails, disputes shall be resolved through binding arbitration
            under the American Arbitration Association (AAA) rules, rather than in court.
          </p>

          <h3 className="text-xl font-semibold mb-2 mt-4">12.3 Class Action Waiver</h3>
          <p>
            You agree to resolve disputes on an individual basis only. You waive any right to
            participate in class actions or class-wide arbitration.
          </p>
        </section>

        {/* 13. Governing Law */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">13. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the
            State of [Your State], United States, without regard to its conflict of law provisions.
          </p>
        </section>

        {/* 14. Changes to Terms */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">14. Changes to These Terms</h2>
          <p className="mb-4">
            We reserve the right to modify these Terms at any time. Material changes will be
            notified via:
          </p>
          <ul className="list-disc pl-6 space-y-2 mb-4">
            <li>Email to your registered email address</li>
            <li>Prominent notice on our website</li>
            <li>In-app notification</li>
          </ul>
          <p>
            Continued use of the Service after changes constitute acceptance of the new Terms.
            The "Last Updated" date at the top reflects the most recent revision.
          </p>
        </section>

        {/* 15. Contact Information */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">15. Contact Information</h2>
          <p className="mb-4">
            For questions about these Terms of Service, please contact us:
          </p>
          <div className="bg-gray-50 p-6 rounded-lg">
            <p><strong>SACVPN</strong></p>
            <p>Stephen's Code</p>
            <p>Email: info@stephenscode.dev</p>
            <p>Website: https://sacvpn.com</p>
          </div>
        </section>

        {/* 16. Severability */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">16. Severability and Waiver</h2>
          <p className="mb-4">
            If any provision of these Terms is found to be unenforceable or invalid, that provision
            shall be limited or eliminated to the minimum extent necessary so that these Terms shall
            otherwise remain in full force and effect.
          </p>
          <p>
            Our failure to enforce any right or provision of these Terms shall not be considered a
            waiver of those rights.
          </p>
        </section>

        {/* 17. Entire Agreement */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">17. Entire Agreement</h2>
          <p>
            These Terms, together with our Privacy Policy and any other legal notices published by
            us on the Service, constitute the entire agreement between you and SACVPN concerning
            the Service.
          </p>
        </section>

        {/* Acknowledgment */}
        <section className="bg-blue-50 p-6 rounded-lg border border-blue-200">
          <h2 className="text-xl font-semibold mb-3">Acknowledgment</h2>
          <p>
            BY USING SACVPN, YOU ACKNOWLEDGE THAT YOU HAVE READ THESE TERMS OF SERVICE,
            UNDERSTAND THEM, AND AGREE TO BE BOUND BY THEM. IF YOU DO NOT AGREE TO THESE TERMS,
            DO NOT USE THE SERVICE.
          </p>
        </section>

      </div>
    </div>
  );
}
