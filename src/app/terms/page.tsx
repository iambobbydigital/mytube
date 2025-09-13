import Link from 'next/link'
import { Youtube, ArrowLeft } from 'lucide-react'

export default function TermsOfService() {
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
          <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
          
          <p className="text-gray-300 mb-8">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Agreement to Terms</h2>
            <p className="text-gray-300 leading-relaxed">
              By accessing and using MyTube ("the Service"), you accept and agree to be bound by the 
              terms and provision of this agreement. If you do not agree to abide by the above, please 
              do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Description of Service</h2>
            <p className="text-gray-300 mb-4">
              MyTube is a web application that provides:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 ml-4">
              <li>Access to videos from your YouTube channel subscriptions</li>
              <li>Custom video player controls overlaid on YouTube's embedded player</li>
              <li>A curated viewing experience based on your subscription preferences</li>
              <li>Integration with Google/YouTube APIs for authentication and data access</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">User Responsibilities</h2>
            <p className="text-gray-300 mb-4">
              As a user of MyTube, you agree to:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 ml-4">
              <li>Provide accurate and complete information when creating an account</li>
              <li>Maintain the security of your Google account credentials</li>
              <li>Use the service only for lawful purposes</li>
              <li>Not attempt to gain unauthorized access to our systems or other users' accounts</li>
              <li>Not reverse engineer, decompile, or attempt to extract source code</li>
              <li>Not use automated systems to access the service without permission</li>
              <li>Respect intellectual property rights of content creators and YouTube</li>
              <li>Comply with YouTube's Terms of Service when viewing content</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Prohibited Activities</h2>
            <p className="text-gray-300 mb-4">
              You may not use MyTube to:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 ml-4">
              <li>Violate any applicable laws or regulations</li>
              <li>Infringe upon intellectual property rights</li>
              <li>Transmit malicious code or attempt to disrupt the service</li>
              <li>Collect or harvest personal information from other users</li>
              <li>Use the service for commercial purposes without authorization</li>
              <li>Circumvent any security measures or access restrictions</li>
              <li>Share your account credentials with others</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">YouTube Integration</h2>
            <p className="text-gray-300 mb-4">
              MyTube integrates with YouTube's services and is subject to:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 ml-4">
              <li>YouTube's Terms of Service</li>
              <li>Google's Privacy Policy</li>
              <li>YouTube API Terms of Service</li>
            </ul>
            <p className="text-gray-300">
              By using MyTube, you acknowledge that your use of YouTube content through our service 
              is also governed by YouTube's terms and policies. We are not responsible for changes 
              to YouTube's API or policies that may affect the functionality of our service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Privacy and Data Use</h2>
            <p className="text-gray-300">
              Your privacy is important to us. Our collection and use of your information is governed 
              by our Privacy Policy, which is incorporated into these terms by reference. Please review 
              our Privacy Policy to understand how we collect, use, and protect your information.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Intellectual Property</h2>
            <p className="text-gray-300 mb-4">
              MyTube and its original content, features, and functionality are owned by us and are 
              protected by international copyright, trademark, patent, trade secret, and other 
              intellectual property laws.
            </p>
            <p className="text-gray-300">
              All video content accessed through MyTube remains the property of its respective creators 
              and YouTube. We do not claim ownership of any user-generated content or YouTube videos.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Service Availability</h2>
            <p className="text-gray-300 mb-4">
              We strive to maintain high availability but cannot guarantee uninterrupted service. 
              MyTube may be temporarily unavailable due to:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 ml-4">
              <li>Scheduled maintenance</li>
              <li>Technical difficulties</li>
              <li>Third-party service outages (YouTube, Google, hosting providers)</li>
              <li>Changes to YouTube's API or policies</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Disclaimer of Warranties</h2>
            <p className="text-gray-300">
              MyTube is provided "as is" and "as available" without warranties of any kind, either 
              express or implied, including but not limited to implied warranties of merchantability, 
              fitness for a particular purpose, or non-infringement. We do not warrant that the 
              service will be uninterrupted, error-free, or free of viruses or other harmful components.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Limitation of Liability</h2>
            <p className="text-gray-300">
              In no event shall MyTube, its officers, directors, employees, or agents be liable for 
              any indirect, incidental, special, consequential, or punitive damages, including without 
              limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting 
              from your use of the service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Termination</h2>
            <p className="text-gray-300 mb-4">
              We may terminate or suspend your access immediately, without prior notice, for any 
              reason whatsoever, including but not limited to:
            </p>
            <ul className="list-disc list-inside text-gray-300 mb-4 ml-4">
              <li>Breach of these Terms of Service</li>
              <li>Violation of applicable laws</li>
              <li>At our sole discretion</li>
            </ul>
            <p className="text-gray-300">
              You may also terminate your use of the service at any time by discontinuing use and 
              revoking access permissions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Changes to Terms</h2>
            <p className="text-gray-300">
              We reserve the right to modify or replace these terms at any time. If a revision is 
              material, we will try to provide at least 30 days notice prior to any new terms taking 
              effect. What constitutes a material change will be determined at our sole discretion.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Governing Law</h2>
            <p className="text-gray-300">
              These Terms shall be interpreted and governed by the laws of the jurisdiction in which 
              the service is operated, without regard to its conflict of law provisions.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Contact Information</h2>
            <p className="text-gray-300">
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <div className="bg-gray-800 p-4 rounded-lg mt-4">
              <p className="text-gray-300">
                <strong>Email:</strong> legal@mytube-app.com<br />
                <strong>GitHub:</strong> <a href="#" className="text-red-400 hover:text-red-300">https://github.com/your-username/mytube</a>
              </p>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Acknowledgment</h2>
            <p className="text-gray-300">
              By using MyTube, you acknowledge that you have read this Terms of Service agreement 
              and agree to be bound by its terms and conditions.
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}