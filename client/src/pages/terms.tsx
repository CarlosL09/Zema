import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Navigation from "@/components/navigation";
import { motion } from "framer-motion";

export default function Terms() {
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
              Terms and Conditions
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Last updated: January 5, 2025
            </p>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>1. Acceptance of Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                By accessing and using ZEMA (Zero Effort Mail Automation), you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>2. Description of Service</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                ZEMA is an AI-powered email automation platform that helps users manage their email communications more efficiently. Our service includes:
              </p>
              <ul>
                <li>Automated email drafting and responses</li>
                <li>Email categorization and prioritization</li>
                <li>Integration with email providers like Gmail and Outlook</li>
                <li>Business intelligence and analytics</li>
                <li>Security monitoring and compliance features</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>3. User Accounts and Registration</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                To use ZEMA, you must register for an account by providing accurate and complete information. You are responsible for:
              </p>
              <ul>
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Notifying us immediately of any unauthorized use</li>
                <li>Ensuring your account information remains current and accurate</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>4. Acceptable Use Policy</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>You agree not to use ZEMA for:</p>
              <ul>
                <li>Any unlawful purpose or to solicit others to perform unlawful acts</li>
                <li>Violating any international, federal, provincial, or state regulations, rules, laws, or local ordinances</li>
                <li>Infringing upon or violating our intellectual property rights or the intellectual property rights of others</li>
                <li>Harassing, abusing, insulting, harming, defaming, slandering, disparaging, intimidating, or discriminating</li>
                <li>Submitting false or misleading information</li>
                <li>Uploading or transmitting viruses or any other type of malicious code</li>
                <li>Spamming, phishing, or any other form of unsolicited communication</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>5. Privacy and Data Protection</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                Your privacy is important to us. Our collection and use of personal information is governed by our Privacy Policy, which is incorporated into these Terms by reference. We implement industry-standard security measures to protect your data, including:
              </p>
              <ul>
                <li>End-to-end encryption for all email data</li>
                <li>CASA Tier 3 compliance standards</li>
                <li>Regular security audits and monitoring</li>
                <li>Limited data retention policies</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>6. Subscription and Payment Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                ZEMA offers both free and paid subscription plans. For paid plans:
              </p>
              <ul>
                <li>Subscriptions are billed in advance on a monthly or annual basis</li>
                <li>All fees are non-refundable except as required by law</li>
                <li>You may cancel your subscription at any time</li>
                <li>Price changes will be communicated 30 days in advance</li>
                <li>Failed payments may result in service suspension</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>7. Intellectual Property Rights</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                ZEMA and its original content, features, and functionality are owned by us and are protected by international copyright, trademark, patent, trade secret, and other intellectual property laws. You retain ownership of your email content and data.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>8. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                In no event shall ZEMA, its directors, employees, partners, agents, suppliers, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your use of the service.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>9. Service Availability</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                We strive to maintain 99.9% uptime but cannot guarantee uninterrupted service. We reserve the right to modify, suspend, or discontinue the service with reasonable notice.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>10. Termination</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                We may terminate or suspend your account and access to the service immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, your right to use the service will cease immediately.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>11. Changes to Terms</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                We reserve the right to modify these terms at any time. We will provide notice of significant changes via email or through the service. Your continued use constitutes acceptance of the revised terms.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>12. Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="prose dark:prose-invert max-w-none">
              <p>
                If you have any questions about these Terms and Conditions, please contact us at:
              </p>
              <p>
                Email: legal@zema.ai<br />
                Address: ZEMA Legal Department<br />
                Support: support@zema.ai
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}