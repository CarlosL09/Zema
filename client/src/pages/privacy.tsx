import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/navigation";
import { motion } from "framer-motion";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800">
      <Navigation />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Privacy Policy
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Last updated: January 5, 2025
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>1. Information We Collect</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <h4>Personal Information</h4>
              <p>When you register for ZEMA, we collect:</p>
              <ul>
                <li>Email address and name</li>
                <li>Account credentials and authentication information</li>
                <li>Billing information for paid subscriptions</li>
                <li>Contact preferences and communication settings</li>
              </ul>
              
              <h4>Email Data</h4>
              <p>To provide our service, we process:</p>
              <ul>
                <li>Email content and metadata (subject, sender, recipient, timestamps)</li>
                <li>Email attachments and embedded content</li>
                <li>Email categorization and priority data</li>
                <li>User interactions with AI-generated drafts</li>
              </ul>

              <h4>Usage Information</h4>
              <p>We automatically collect:</p>
              <ul>
                <li>Service usage patterns and feature interactions</li>
                <li>Device information and browser type</li>
                <li>IP addresses and location data (general region only)</li>
                <li>Performance metrics and error logs</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>2. How We Use Your Information</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>We use your information to:</p>
              <ul>
                <li><strong>Provide Services:</strong> Process emails, generate drafts, and provide automation features</li>
                <li><strong>Improve AI Models:</strong> Enhance our AI capabilities (with your explicit consent only)</li>
                <li><strong>Account Management:</strong> Maintain your account, process payments, and provide support</li>
                <li><strong>Security:</strong> Detect fraud, prevent abuse, and ensure platform security</li>
                <li><strong>Communication:</strong> Send service updates, security alerts, and account notifications</li>
                <li><strong>Analytics:</strong> Understand usage patterns to improve our service</li>
              </ul>
              
              <p className="font-semibold text-cyan-600 dark:text-cyan-400">
                Important: We never use your email content to train AI models without your explicit consent. Your private communications remain private.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>3. Information Sharing and Disclosure</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>We do not sell, trade, or rent your personal information. We may share information in limited circumstances:</p>
              
              <h4>Service Providers</h4>
              <ul>
                <li>Cloud hosting providers (with strict data processing agreements)</li>
                <li>Payment processors for billing (they only receive necessary payment data)</li>
                <li>Email service providers for integration purposes</li>
              </ul>

              <h4>Legal Requirements</h4>
              <ul>
                <li>When required by law or valid legal process</li>
                <li>To protect rights, property, or safety of ZEMA or users</li>
                <li>In connection with a merger, acquisition, or sale of assets</li>
              </ul>

              <h4>With Your Consent</h4>
              <ul>
                <li>When you explicitly authorize sharing with third parties</li>
                <li>For integrations you specifically enable</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>4. Data Security and Protection</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>We implement comprehensive security measures:</p>
              
              <h4>Encryption</h4>
              <ul>
                <li>End-to-end encryption for all email data in transit and at rest</li>
                <li>AES-256 encryption for stored data</li>
                <li>TLS 1.3 for all data transmission</li>
              </ul>

              <h4>Access Controls</h4>
              <ul>
                <li>Multi-factor authentication for user accounts</li>
                <li>Role-based access controls for internal systems</li>
                <li>Regular access reviews and permission audits</li>
              </ul>

              <h4>Compliance Standards</h4>
              <ul>
                <li>CASA Tier 3 compliance certification</li>
                <li>SOC 2 Type II controls</li>
                <li>GDPR and CCPA compliance measures</li>
                <li>Regular third-party security audits</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>5. Data Retention and Deletion</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <h4>Retention Periods</h4>
              <ul>
                <li><strong>Email Data:</strong> Retained while your account is active, deleted within 30 days of account termination</li>
                <li><strong>Account Information:</strong> Retained for 90 days after account deletion for legal compliance</li>
                <li><strong>Usage Analytics:</strong> Aggregated data retained for 2 years, personal identifiers removed after 90 days</li>
                <li><strong>Support Records:</strong> Retained for 3 years for customer service purposes</li>
              </ul>

              <h4>Your Deletion Rights</h4>
              <p>You can request deletion of:</p>
              <ul>
                <li>Specific email data or conversations</li>
                <li>Your entire account and associated data</li>
                <li>AI training data (if you previously consented)</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>6. Your Privacy Rights</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>You have the right to:</p>
              <ul>
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Rectification:</strong> Correct inaccurate or incomplete information</li>
                <li><strong>Erasure:</strong> Request deletion of your personal data</li>
                <li><strong>Portability:</strong> Export your data in a machine-readable format</li>
                <li><strong>Restriction:</strong> Limit how we process your data</li>
                <li><strong>Objection:</strong> Object to certain types of data processing</li>
                <li><strong>Withdraw Consent:</strong> Revoke previously given consent</li>
              </ul>

              <p>To exercise these rights, contact us at privacy@zema.ai with your request.</p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>7. Cookies and Tracking Technologies</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>We use cookies and similar technologies for:</p>
              <ul>
                <li><strong>Essential Cookies:</strong> Required for basic functionality and security</li>
                <li><strong>Preference Cookies:</strong> Remember your settings and preferences</li>
                <li><strong>Analytics Cookies:</strong> Understand how you use our service (with consent)</li>
                <li><strong>Security Cookies:</strong> Detect and prevent fraudulent activity</li>
              </ul>

              <p>You can control cookie preferences through your browser settings or our cookie preference center.</p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>8. International Data Transfers</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                ZEMA operates globally and may transfer data across international borders. We ensure adequate protection through:
              </p>
              <ul>
                <li>Standard Contractual Clauses (SCCs) for EU data transfers</li>
                <li>Adequacy decisions for transfers to approved countries</li>
                <li>Encryption and additional safeguards for all transfers</li>
                <li>Regular reviews of transfer mechanisms and protections</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>9. Children's Privacy</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                ZEMA is not intended for children under 13 (or 16 in the EU). We do not knowingly collect personal information from children. If we discover we have collected information from a child, we will delete it immediately.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>10. Changes to This Privacy Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                We may update this Privacy Policy periodically. We will notify you of significant changes via:
              </p>
              <ul>
                <li>Email notification to your registered address</li>
                <li>In-app notifications when you use the service</li>
                <li>Updates posted on our website</li>
              </ul>
              <p>Continued use of ZEMA after changes indicates acceptance of the updated policy.</p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>11. Contact Us</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>For privacy-related questions or concerns, contact us:</p>
              <ul>
                <li><strong>Email:</strong> privacy@zema.ai</li>
                <li><strong>Data Protection Officer:</strong> dpo@zema.ai</li>
                <li><strong>General Support:</strong> support@zema.ai</li>
                <li><strong>Address:</strong> ZEMA Privacy Team, Legal Department</li>
              </ul>
              
              <p>We will respond to privacy inquiries within 30 days.</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}