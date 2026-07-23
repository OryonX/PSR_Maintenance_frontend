import React from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { useTranslation } from '../../hooks/useTranslation.js'

function ServiceCard({ service }) {
  const { t } = useTranslation('services')
  const Icon = service.icon

  return (
    <article className="group bg-white border border-gray-100 rounded-xl p-7 lg:p-9 transition-all duration-300 hover:shadow-lg hover:shadow-navy-900/5 hover:-translate-y-1 hover:border-transparent">
      {/* Icon */}
      <div className="w-12 h-12 bg-navy-900/5 rounded-lg flex items-center justify-center mb-6 group-hover:bg-navy-900 group-hover:text-white transition-colors duration-300">
        <Icon className="w-6 h-6 text-navy-900 group-hover:text-white transition-colors duration-300" />
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-navy-900 mb-3">
        {service.title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 text-sm leading-relaxed mb-5">
        {service.description}
      </p>

      {/* Bullets */}
      <ul className="divide-y divide-gray-100 mb-6">
        {service.bullets.map((bullet, index) => (
          <li key={index} className="flex items-center gap-2.5 text-sm text-gray-700 py-2 first:pt-0 last:pb-0">
            <span className="w-4 h-4 bg-brand-blue/10 rounded-full flex items-center justify-center flex-shrink-0">
              <Check className="w-2.5 h-2.5 text-brand-blue" strokeWidth={3} />
            </span>
            {bullet}
          </li>
        ))}
      </ul>

      {/* Link */}
      <a
        href={service.slug}
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue hover:text-brand-light transition-colors duration-200 group/link pt-5 border-t border-gray-100 w-full"
      >
        {t('serviceCard.viewService')}
        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-1" />
      </a>
    </article>
  )
}

export default ServiceCard
