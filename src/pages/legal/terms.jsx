import React from 'react'
import Layout from '../../components/layouts/Layout.jsx'
import HelmetSEO from '../../seo/HelmetSEO.jsx'

function TermsPage() {
  return (
    <Layout>
      <HelmetSEO 
        title="Terms of Service | PSR Maintenance Services"
        description="Terms and conditions for using PSR Maintenance Services website and services."
        noindex={true}
      />
      
      <section className="bg-surface-light py-20">
        <div className="section-container max-w-4xl">
          <div className="bg-white rounded-2xl p-8 lg:p-12 border border-gray-200">
            <h1 className="text-3xl lg:text-4xl font-black text-navy-900 mb-8">
              Terms of Service
            </h1>
            
            <div className="prose prose-lg max-w-none text-gray-600">
              <p className="text-sm text-gray-500 mb-8">
                Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>

              <h2 className="text-xl font-bold text-navy-900 mt-8 mb-4">1. Acceptance of Terms</h2>
              <p>
                By accessing and using the PSR Maintenance Services website and services, you agree to be bound 
                by these Terms of Service. If you do not agree to these terms, please do not use our website or services.
              </p>

              <h2 className="text-xl font-bold text-navy-900 mt-8 mb-4">2. Our Services</h2>
              <p>
                PSR Maintenance Services provides property maintenance, renovation, and trade services in 
                Greater Manchester, UK. All work is carried out by qualified and insured tradespeople.
              </p>

              <h2 className="text-xl font-bold text-navy-900 mt-8 mb-4">3. Quotes and Estimates</h2>
              <p>
                Quotes provided are based on the information supplied by you. Final costs may vary if 
                the scope of work changes or if unforeseen issues are discovered during the project. 
                We will always communicate any changes before proceeding.
              </p>

              <h2 className="text-xl font-bold text-navy-900 mt-8 mb-4">4. Payment Terms</h2>
              <ul className="list-disc pl-5 space-y-2">
                <li>A deposit may be required for larger projects</li>
                <li>Payment is due on completion of work unless otherwise agreed</li>
                <li>We accept bank transfer, credit/debit cards, and cash</li>
                <li>Late payments may incur interest charges</li>
              </ul>

              <h2 className="text-xl font-bold text-navy-900 mt-8 mb-4">5. Cancellations</h2>
              <p>
                We understand that plans can change. Please provide at least 48 hours notice for 
                cancellations or rescheduling. Deposits may be forfeited for cancellations with less 
                than 48 hours notice.
              </p>

              <h2 className="text-xl font-bold text-navy-900 mt-8 mb-4">6. Warranties and Guarantees</h2>
              <p>
                All work is guaranteed for a minimum of 12 months from completion. Manufacturer 
                warranties on materials apply where applicable. Gas and electrical work comes with 
                the appropriate certification.
              </p>

              <h2 className="text-xl font-bold text-navy-900 mt-8 mb-4">7. Limitation of Liability</h2>
              <p>
                While we maintain comprehensive insurance, our liability is limited to the value of 
                the work performed. We are not liable for indirect or consequential losses.
              </p>

              <h2 className="text-xl font-bold text-navy-900 mt-8 mb-4">8. Governing Law</h2>
              <p>
                These Terms of Service are governed by and construed in accordance with the laws of 
                England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the 
                courts of England and Wales.
              </p>

              <h2 className="text-xl font-bold text-navy-900 mt-8 mb-4">9. Changes to Terms</h2>
              <p>
                We reserve the right to modify these terms at any time. Changes will be effective 
                immediately upon posting to our website. Your continued use of our services constitutes 
                acceptance of the updated terms.
              </p>

              <h2 className="text-xl font-bold text-navy-900 mt-8 mb-4">10. Contact Information</h2>
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

export default TermsPage