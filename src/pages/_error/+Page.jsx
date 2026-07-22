import React from 'react'
import { ArrowLeft, Home } from 'lucide-react'
import { usePageContext } from 'vike-react/usePageContext'
import HelmetSEO from '../../seo/HelmetSEO.jsx'
import { notFoundSEO } from '../../seo/seoData.js'
import { useTranslation } from '../../hooks/useTranslation.js'

function Page() {
  const pageContext = usePageContext()
  const is404 = pageContext.is404
  const { t } = useTranslation('notFound')

  return (
    <>
      <HelmetSEO {...notFoundSEO} />

      <section className="min-h-[70vh] flex items-center justify-center bg-surface-light py-20">
        <div className="section-container text-center">
          <div className="max-w-md mx-auto">
            {/* Error Code */}
            <h1 className="text-8xl lg:text-9xl font-black text-navy-900 mb-4">
              {is404 ? t('code404') : t('code500')}
            </h1>

            {/* Message */}
            <h2 className="text-2xl lg:text-3xl font-bold text-navy-900 mb-4">
              {is404 ? t('title404') : t('titleError')}
            </h2>
            <p className="text-gray-600 mb-8">
              {is404 ? t('message404') : t('messageError')}
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="/"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-navy-900 text-white font-semibold rounded-lg hover:bg-navy-800 transition-colors"
              >
                <Home className="w-5 h-5" />
                {t('backToHome')}
              </a>
              <a
                href="/servicios"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 text-navy-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                {t('viewServices')}
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Page
