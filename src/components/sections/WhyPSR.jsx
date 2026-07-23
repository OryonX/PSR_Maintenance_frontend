import React from 'react'
import { Shield, Award, Star, Clock, ArrowRight } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection.jsx'
import TrustBadge from '../ui/TrustBadge.jsx'
import { useContactPhone } from '../../hooks/useContactPhone.js'
import { useTranslation } from '../../hooks/useTranslation.js'

const trustPointIds = ['insured', 'certified', 'rated', 'emergency']
const trustPointIcons = {
  insured: Shield,
  certified: Award,
  rated: Star,
  emergency: Clock
}

function WhyPSR() {
  const { openWhatsApp } = useContactPhone()
  const { t } = useTranslation('home')

  const trustPoints = trustPointIds.map((id) => ({
    id,
    icon: trustPointIcons[id],
    title: t(`about.trustPoints.${id}.title`),
    description: t(`about.trustPoints.${id}.description`)
  }))

  const scrollToContact = () => {
    const element = document.getElementById('contact')
    if (element) {
      const offset = 80
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' })
    }
  }

  return (
    <section id="about" className="bg-white section-padding overflow-hidden">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Column - Images */}
          <AnimatedSection className="relative">
            {/* Main Image */}
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3] bg-navy-900">
              <img
                src="/assets/img/about/team-working.webp"
                alt={t('about.mainImageAlt')}
                className="w-full h-full object-cover"
              />
              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 to-transparent" />
            </div>

            {/* Secondary Image - Overlapping */}
            <div className="absolute -bottom-6 -right-6 w-2/3 rounded-xl overflow-hidden shadow-2xl border-4 border-white bg-navy-900 aspect-video">
              <img
                src="/assets/img/about/completed-project.webp"
                alt={t('about.secondaryImageAlt')}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Experience Badge */}
            <div className="absolute top-6 left-6 bg-navy-900 text-white px-5 py-3 rounded-xl shadow-lg">
              <div className="text-2xl font-black">{t('about.experienceBadge.years')}</div>
              <div className="text-xs text-white/80">{t('about.experienceBadge.label')}</div>
            </div>
          </AnimatedSection>

          {/* Right Column - Content */}
          <div className="space-y-8">
            <AnimatedSection delay={100}>
              <span className="text-brand-blue text-sm font-semibold uppercase tracking-wider mb-2 block">
                {t('about.badge')}
              </span>
              <h2 className="text-4xl lg:text-5xl font-black text-navy-900 mb-6">
                {t('about.titlePrefix')}<span className="text-brand-blue">{t('about.titleHighlight')}</span>{t('about.titleSuffix')}
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                {t('about.paragraph1')}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {t('about.paragraph2')}
              </p>
            </AnimatedSection>

            {/* Trust Points Grid */}
            <AnimatedSection delay={200}>
              <div className="grid grid-cols-2 gap-4">
                {trustPoints.map((point) => {
                  const Icon = point.icon
                  return (
                    <div key={point.id} className="flex items-start gap-3 p-4 bg-surface-light rounded-xl">
                      <div className="w-10 h-10 bg-brand-blue/10 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-brand-blue" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-navy-900 text-sm">{point.title}</h4>
                        <p className="text-xs text-gray-500">{point.description}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </AnimatedSection>

            {/* Trust Badges */}
            <AnimatedSection delay={300}>
              <div className="flex flex-wrap gap-2">
                <TrustBadge type="gas-safe" size="md" />
                <TrustBadge type="part-p" size="md" />
                <TrustBadge type="insured" size="md" />
                <TrustBadge type="trustmark" size="md" />
              </div>
            </AnimatedSection>

            {/* CTA */}
            <AnimatedSection delay={400}>
              <button
                onClick={scrollToContact}
                className="btn-brand group"
              >
                {t('about.cta')}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </section>
  )
}

export default WhyPSR
