import React from 'react'
import { ArrowLeft, Home } from 'lucide-react'
import Layout from '../components/layouts/Layout.jsx'
import HelmetSEO from '../seo/HelmetSEO.jsx'
import { notFoundSEO } from '../seo/seoData.js'

function NotFoundPage() {
  return (
    <Layout>
      <HelmetSEO {...notFoundSEO} />
      
      <section className="min-h-[70vh] flex items-center justify-center bg-surface-light py-20">
        <div className="section-container text-center">
          <div className="max-w-md mx-auto">
            {/* 404 Code */}
            <h1 className="text-8xl lg:text-9xl font-black text-navy-900 mb-4">
              404
            </h1>
            
            {/* Message */}
            <h2 className="text-2xl lg:text-3xl font-bold text-navy-900 mb-4">
              Page Not Found
            </h2>
            <p className="text-gray-600 mb-8">
              Sorry, the page you are looking for doesn't exist or has been moved. 
              Check out our services or get in touch if you need help.
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-navy-900 text-white font-semibold rounded-lg hover:bg-navy-800 transition-colors"
              >
                <Home className="w-5 h-5" />
                Back to Home
              </a>
              <a
                href="/servicios"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-navy-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                View Services
              </a>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}

export default NotFoundPage