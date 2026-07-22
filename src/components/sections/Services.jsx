import React from 'react'
import AnimatedSection from '../ui/AnimatedSection.jsx'
import StaggerContainer from '../ui/StaggerContainer.jsx'
import ServiceCard from '../ui/ServiceCard.jsx'
import { services } from '../../config/services.js'
import { useTranslation } from '../../hooks/useTranslation.js'

function Services() {
  const { t } = useTranslation('home')

  return (
    <section id="services" className="bg-surface-light section-padding">
      <div className="section-container">
        {/* Header */}
        <AnimatedSection className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-12">
          <div>
            <span className="text-brand-blue text-sm font-semibold uppercase tracking-wider mb-2 block">
              {t('services.badge')}
            </span>
            <h2 className="text-4xl lg:text-5xl font-black text-navy-900">
              {t('services.titlePrefix')}<span className="text-brand-blue">{t('services.titleHighlight')}</span>
            </h2>
          </div>
          <p className="text-gray-600 max-w-md lg:text-right">
            {t('services.subtitle')}
          </p>
        </AnimatedSection>

        {/* Services Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </StaggerContainer>
      </div>
    </section>
  )
}

export default Services
