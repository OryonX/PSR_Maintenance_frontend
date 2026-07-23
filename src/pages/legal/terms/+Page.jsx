import React from 'react'
import HelmetSEO from '../../../seo/HelmetSEO.jsx'
import { useTranslation } from '../../../hooks/useTranslation.js'
import { COMPANY_INFO } from '../../../config/companyInfo.js'

function Page() {
  const { t } = useTranslation('legal')
  const terms = t('terms')

  return (
    <>
      <HelmetSEO
        title={terms.seoTitle}
        description={terms.seoDescription}
        noindex={true}
      />

      <section className="bg-surface-light py-20">
        <div className="section-container max-w-4xl">
          <div className="bg-white rounded-2xl p-8 lg:p-12 border border-gray-200">
            <h1 className="text-3xl lg:text-4xl font-black text-navy-900 mb-8">
              {terms.pageTitle}
            </h1>

            <div className="prose prose-lg max-w-none text-gray-600">
              <p className="text-sm text-gray-500 mb-8">
                {terms.lastUpdatedLabel} {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>

              {terms.sections.map((section) => (
                <React.Fragment key={section.heading}>
                  <h2 className="text-xl font-bold text-navy-900 mt-8 mb-4">{section.heading}</h2>
                  {section.paragraphs?.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                  {section.intro && <p>{section.intro}</p>}
                  {section.list && (
                    <ul className="list-disc pl-5 space-y-2">
                      {section.list.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </ul>
                  )}
                </React.Fragment>
              ))}

              <p className="mt-4">
                <strong>{terms.contact.companyName}</strong><br />
                {terms.contact.address}<br />
                {terms.contact.emailLabel} {COMPANY_INFO.email}
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default Page
