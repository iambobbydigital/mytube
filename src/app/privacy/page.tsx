import Link from 'next/link'
import { Youtube, ArrowLeft } from 'lucide-react'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center text-red-400 hover:text-red-300 transition-colors">
            <ArrowLeft size={20} className="mr-2" />
            Back to MyTube
          </Link>
          <div className="flex items-center">
            <Youtube size={24} className="text-red-600 mr-2" />
            <span className="font-bold">MyTube</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-8">
        <div className="prose prose-invert max-w-none">
          <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
          
          <p className="text-gray-300 mb-8">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Introduction</h2>
            <p className="text-gray-300 leading-relaxed">
              MyTube ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
              explains how we collect, use, disclose, and safeguard your information when you use our 
              application that allows you to view videos from your YouTube subscriptions with custom controls.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Information We Collect</h2>
            
            <h3 className="text-xl font-medium text-white mb-3">Google Account Information</h3>
            <p className="text-gray-300 mb-4">
              When you sign in with Google, we collect:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 ml-4">
              <li>Your name and email address</li>
              <li>Your profile picture</li>
              <li>Your Google account ID</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">YouTube Data</h3>
            <p className="text-gray-300 mb-4">
              With your permission, we access:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 ml-4">
              <li>Your YouTube channel subscriptions</li>
              <li>Basic information about videos from channels you subscribe to</li>
              <li>Video titles, descriptions, thumbnails, and metadata</li>
            </ul>

            <h3 className="text-xl font-medium text-white mb-3">Usage Information</h3>
            <p className="text-gray-300 mb-4">
              We may collect:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 ml-4">
              <li>Information about how you use our application</li>
              <li>Device and browser information</li>
              <li>IP address and general location data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">How We Use Your Information</h2>
            <p className="text-gray-300 mb-4">
              We use the collected information to:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 ml-4">
              <li>Provide and maintain our service</li>
              <li>Display videos from your subscribed channels</li>
              <li>Personalize your experience</li>
              <li>Improve our application</li>
              <li>Communicate with you about service updates</li>
              <li>Ensure the security of our service</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Information Sharing and Disclosure</h2>
            <p className="text-gray-300 mb-4">
              We do not sell, trade, or rent your personal information to third parties. We may share 
              your information only in the following circumstances:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 ml-4">
              <li><strong>With your consent:</strong> When you explicitly agree to share information</li>
              <li><strong>Service providers:</strong> With trusted partners who assist in operating our service</li>
              <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business transfers:</strong> In connection with a merger, sale, or acquisition</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Data Storage and Security</h2>
            <p className="text-gray-300 mb-4">
              We implement appropriate security measures to protect your information:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 ml-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments</li>
              <li>Limited access to personal information</li>
              <li>Secure authentication methods</li>
            </ul>
            <p className="text-gray-300">
              However, no method of transmission over the Internet is 100% secure, and we cannot 
              guarantee absolute security.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Your Rights and Choices</h2>
            <p className="text-gray-300 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 ml-4">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Delete your account and associated data</li>
              <li>Revoke access permissions</li>
              <li>Export your data</li>
              <li>Opt out of certain communications</li>
            </ul>
            <p className="text-gray-300">
              To exercise these rights, you can sign out of your account or contact us directly.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Third-Party Services</h2>
            <p className="text-gray-300 mb-4">
              Our application integrates with:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 ml-4">
              <li><strong>Google/YouTube:</strong> For authentication and accessing your subscription data</li>
              <li><strong>Vercel:</strong> For hosting and deployment</li>
            </ul>
            <p className="text-gray-300">
              These services have their own privacy policies, which we encourage you to review.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Data Retention</h2>
            <p className="text-gray-300">
              We retain your information only as long as necessary to provide our service and fulfill 
              the purposes outlined in this policy. You can delete your account at any time, which will 
              remove your personal information from our systems.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Children's Privacy</h2>
            <p className="text-gray-300">
              Our service is not intended for children under 13. We do not knowingly collect personal 
              information from children under 13. If we become aware that a child under 13 has provided 
              us with personal information, we will take steps to delete such information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Changes to This Policy</h2>
            <p className="text-gray-300">
              We may update this Privacy Policy from time to time. We will notify you of any changes 
              by posting the new policy on this page and updating the "Last updated" date. Your continued 
              use of the service after any changes constitutes acceptance of the new policy.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Contact Us</h2>
            <p className="text-gray-300">
              If you have any questions about this Privacy Policy or our data practices, please contact us at:
            </p>
            <div className="bg-gray-800 p-4 rounded-lg mt-4">
              <p className="text-gray-300">
                <strong>Email:</strong> privacy@mytube-app.com<br />
                <strong>GitHub:</strong> <a href="#" className="text-red-400 hover:text-red-300">https://github.com/your-username/mytube</a>
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}