import React, { useState } from 'react'
import { ChevronRight, MessageCircle, ArrowRight } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection.jsx'
import StaggerContainer from '../ui/StaggerContainer.jsx'
import ServiceGallery from '../ui/ServiceGallery.jsx'
import TestimonialCard from '../ui/TestimonialCard.jsx'
import FAQItem from '../ui/FAQItem.jsx'
import QuoteFormFooter from './QuoteFormFooter.jsx'
import { services } from '../../config/services.js'
import { useContactPhone } from '../../hooks/useContactPhone.js'
import { useTranslation } from '../../hooks/useTranslation.js'

const BADGE_TONE_CLASSES = {
  green: 'bg-green-100 text-green-700 border-green-200',
  blue: 'bg-blue-100 text-blue-700 border-blue-200',
  amber: 'bg-amber-100 text-amber-700 border-amber-200',
  red: 'bg-red-100 text-red-700 border-red-200'
}

function HeroBadge({ label, tone }) {
  return (
    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg border text-sm font-medium ${BADGE_TONE_CLASSES[tone]}`}>
      {label}
    </span>
  )
}

function ServiceDetailTemplate({ data }) {
  const [openFaqId, setOpenFaqId] = useState(null)
  const { openWhatsApp } = useContactPhone()
  const { t } = useTranslation('servicesDetail')
  const { t: tc } = useTranslation('common')
  const Icon = data.icon
  const otherServices = services.filter((s) => s.id !== data.slug)

  const scrollToContact = () => {
    const element = document.getElementById('contact')
    if (element) {
      const offset = 80
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' })
    }
  }

  return (
    <>
      {/* 1. Breadcrumb */}
      <nav className="bg-white border-b border-gray-100 pt-24 pb-4" aria-label="Breadcrumb">
        <div className="section-container">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li><a href="/" className="hover:text-navy-900 transition-colors">{t('template.breadcrumbHome')}</a></li>
            <li><ChevronRight className="w-3.5 h-3.5" /></li>
            <li><a href="/servicios" className="hover:text-navy-900 transition-colors">{t('template.breadcrumbServices')}</a></li>
            <li><ChevronRight className="w-3.5 h-3.5" /></li>
            <li className="text-navy-900 font-medium">{data.title}</li>
          </ol>
        </div>
      </nav>

      {/* 2. Compact Hero */}
      <section className="bg-navy-900 py-16 lg:py-20">
        <div className="section-container">
          <div className="grid lg:grid-cols-3 gap-10 items-center">
            <div className="lg:col-span-2">
              <div className="inline-flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="text-white/60 text-sm font-semibold uppercase tracking-wider">
                  {t('template.heroKicker')}
                </span>
              </div>
              <h1 className="text-4xl lg:text-5xl font-black text-white mb-4 uppercase">
                {data.title}
              </h1>
              <p className="text-lg text-white/70 leading-relaxed max-w-xl mb-8">
                {data.tagline}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => openWhatsApp(`Hi, I'd like a quote for ${data.title}.`)} className="btn-whatsapp">
                  <MessageCircle className="w-5 h-5" />
                  {t('template.ctaWhatsapp')}
                </button>
                <button onClick={scrollToContact} className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-white/30 text-white font-semibold rounded-lg hover:bg-white/10 transition-all duration-200">
                  {t('template.ctaQuote')}
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Desktop badge panel */}
            <div className="hidden lg:flex flex-col gap-3">
              {data.heroBadges.map((badge) => (
                <HeroBadge key={badge.key} label={tc(badge.labelKey)} tone={badge.tone} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* 3. Mobile accreditation strip */}
      <div className="lg:hidden bg-navy-800 py-4">
        <div className="section-container flex flex-wrap gap-2">
          {data.heroBadges.map((badge) => (
            <HeroBadge key={badge.key} label={tc(badge.labelKey)} tone={badge.tone} />
          ))}
        </div>
      </div>

      {/* 4. Description + Sub-services */}
      <section className="bg-white section-padding">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            <AnimatedSection>
              <p className="text-gray-600 leading-relaxed text-lg">
                {data.description}
              </p>
            </AnimatedSection>

            <div>
              <span className="text-brand-blue text-sm font-semibold uppercase tracking-wider mb-4 block">
                {t('template.includedBadge')}
              </span>
              <StaggerContainer className="space-y-4">
                {data.subServices.map((sub) => (
                  <div key={sub.name} className="p-4 bg-surface-light rounded-xl">
                    <h3 className="font-semibold text-navy-900 mb-1">{sub.name}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{sub.description}</p>
                  </div>
                ))}
              </StaggerContainer>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Project Gallery */}
      <section className="bg-surface-light section-padding">
        <div className="section-container">
          <AnimatedSection className="text-center mb-12">
            <span className="text-brand-blue text-sm font-semibold uppercase tracking-wider mb-2 block">
              {t('template.galleryBadge')}
            </span>
            <h2 className="text-4xl lg:text-5xl font-black text-navy-900">
              {t('template.galleryTitlePrefix')}<span className="text-brand-blue">{data.title}</span>{t('template.galleryTitleSuffix')}
            </h2>
          </AnimatedSection>

          <ServiceGallery items={data.gallery} />
        </div>
      </section>

      {/* 6. Why Choose Us + Testimonial */}
      <section className="bg-white section-padding">
        <div className="section-container">
          <div className={`grid gap-12 ${data.testimonial ? 'lg:grid-cols-5' : ''}`}>
            <AnimatedSection className={data.testimonial ? 'lg:col-span-3' : ''}>
              <span className="text-brand-blue text-sm font-semibold uppercase tracking-wider mb-2 block">
                {t('template.whyChooseUsBadge')}
              </span>
              <h2 className="text-3xl lg:text-4xl font-black text-navy-900 mb-8">
                {t('template.whyChooseUsTitlePrefix')}<span className="text-brand-blue">{t('template.whyChooseUsTitleHighlight')}</span>
              </h2>
              <ol className="space-y-5">
                {data.whyChooseUs.map((point, index) => (
                  <li key={index} className="flex items-start gap-4">
                    <span className="w-8 h-8 flex-shrink-0 rounded-full bg-navy-900 text-white text-sm font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <p className="text-gray-700 leading-relaxed pt-1">{point}</p>
                  </li>
                ))}
              </ol>
            </AnimatedSection>

            {data.testimonial && (
              <AnimatedSection delay={150} className="lg:col-span-2">
                <TestimonialCard
                  testimonial={{
                    rating: data.testimonial.rating,
                    text: data.testimonial.text,
                    name: data.testimonial.author,
                    location: data.testimonial.location,
                    timeAgo: data.testimonial.timeAgo,
                    service: data.title,
                    verified: true
                  }}
                />
              </AnimatedSection>
            )}
          </div>
        </div>
      </section>

      {/* 7. Service FAQ */}
      <section className="bg-surface-light section-padding">
        <div className="section-container max-w-3xl mx-auto">
          <AnimatedSection className="text-center mb-12">
            <span className="text-brand-blue text-sm font-semibold uppercase tracking-wider mb-2 block">
              {t('template.faqBadge')}
            </span>
            <h2 className="text-4xl lg:text-5xl font-black text-navy-900">
              {t('template.faqTitlePrefix')}<span className="text-brand-blue">{t('template.faqTitleHighlight')}</span>
            </h2>
          </AnimatedSection>

          <div className="space-y-3">
            {data.faq.map((item, index) => (
              <FAQItem
                key={index}
                item={{ question: item.question, answer: item.answer }}
                isOpen={openFaqId === index}
                onToggle={() => setOpenFaqId(openFaqId === index ? null : index)}
              />
            ))}
          </div>
        </div>
      </section>

      {/* 8. Other Services + Final CTA / Form */}
      <section className="bg-white pt-16 pb-4">
        <div className="section-container">
          <AnimatedSection className="bg-surface-light rounded-2xl p-6 lg:p-8">
            <h3 className="font-semibold text-navy-900 mb-4">{t('template.otherServicesHeading')}</h3>
            <div className="flex flex-wrap gap-2">
              {otherServices.map((service) => (
                <a
                  key={service.id}
                  href={service.slug}
                  className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-navy-900 hover:border-brand-blue hover:text-brand-blue transition-colors"
                >
                  {service.title}
                </a>
              ))}
              <a
                href="/servicios"
                className="px-3 py-1.5 bg-navy-900 text-white rounded-lg text-sm font-medium hover:bg-navy-800 transition-colors"
              >
                {t('template.viewAllServices')}
              </a>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <QuoteFormFooter
        defaultServiceType={data.slug}
        titlePrefix={t('template.ctaFinalTitlePrefix')}
        titleHighlight={data.title.toUpperCase()}
      />
    </>
  )
}

export default ServiceDetailTemplate
