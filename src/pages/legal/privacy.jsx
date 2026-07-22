import React from 'react'
import Layout from '../../components/layouts/Layout.jsx'
import HelmetSEO from '../../seo/HelmetSEO.jsx'

function PrivacyPage() {
  return (
    <Layout>
      <HelmetSEO 
        title="Privacy Policy | PSR Maintenance Services"
        description="How PSR Maintenance Services collects, uses, and protects your personal information."
        noindex={true}
      />
      
      <section className="bg-surface-light py-20">
        <div className="section-container max-w-4xl">
          <div className="bg-white rounded-2xl p-8 lg:p-12 border border-gray-200">
            <h1 className="text-3xl lg:text-4xl font-black text-navy-900 mb-8">
              Privacy Policy
            </h1>
            
            <div className="prose prose-lg max-w-none text-gray-600">
              <p className="text-sm text-gray-500 mb-8">
                Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>

              <h2 className="text-xl font-bold text-navy-900 mt-8 mb-4">1. Introduction</h2>
              <p>
                PSR Maintenance Services Ltd ("we", "our", or "us") is committed to protecting and respecting your privacy. 
                This Privacy Policy explains how we collect, use, and safeguard your personal information when you visit our 
                website or use our services.
              </p>

              <h2 className="text-xl font-bold text-navy-900 mt-8 mb-4">2. Information We Collect</h2>
              <p>We may collect and process the following data about you:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Personal identification information (name, email address, phone number)</li>
                <li>Address and location information</li>
                <li>Details about your property and the services you require</li>
                <li>Communication records between you and us</li>
                <li>Technical data (IP address, browser type, device information)</li>
              </ul>

              <h2 className="text-xl font-bold text-navy-900 mt-8 mb-4">3. How We Use Your Information</h2>
              <p>We use your personal information to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Provide and manage our services</li>
                <li>Respond to your enquiries and quote requests</li>
                <li>Communicate with you about your project</li>
                <li>Improve our website and services</li>
                <li>Comply with legal obligations</li>
              </ul>

              <h2 className="text-xl font-bold text-navy-900 mt-8 mb-4">4. Data Security</h2>
              <p>
                We implement appropriate technical and organisational measures to protect your personal data 
                against unauthorised access, alteration, disclosure, or destruction.
              </p>

              <h2 className="text-xl font-bold text-navy-900 mt-8 mb-4">5. Your Rights</h2>
              <p>Under UK data protection law, you have the right to:</p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Access your personal data</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to processing of your data</li>
                <li>Request restriction of processing</li>
              </ul>

              <h2 className="text-xl font-bold text-navy-900 mt-8 mb-4">6. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy or how we handle your data, 
                please contact us at:
              </p>
              <p className="mt-4">
                <strong>PSR Maintenance Services Ltd</strong><br />
                Manchester, UK<br />
                Email: info@psrmaintenance.co.uk
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default PrivacyPage