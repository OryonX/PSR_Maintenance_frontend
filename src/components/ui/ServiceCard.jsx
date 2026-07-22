import React from 'react'
import { ArrowRight } from 'lucide-react'

function ServiceCard({ service }) {
  const Icon = service.icon

  return (
    <article className="group bg-surface-light rounded-xl p-6 lg:p-8 transition-all duration-300 hover:shadow-lg hover:shadow-navy-900/5 hover:-translate-y-1">
      {/* Icon */}
      <div className="w-12 h-12 bg-navy-900/5 rounded-lg flex items-center justify-center mb-5 group-hover:bg-navy-900 group-hover:text-white transition-colors duration-300">
        <Icon className="w-6 h-6 text-navy-900 group-hover:text-white transition-colors duration-300" />
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-navy-900 mb-3">
        {service.title}
      </h3>

      {/* Description */}
      <p className="text-gray-600 text-sm leading-relaxed mb-4">
        {service.description}
      </p>

      {/* Bullets */}
      <ul className="space-y-2 mb-5">
        {service.bullets.map((bullet, index) => (
          <li key={index} className="flex items-center gap-2 text-sm text-gray-700">
            <span className="w-1.5 h-1.5 bg-brand-blue rounded-full flex-shrink-0" />
            {bullet}
          </li>
        ))}
      </ul>

      {/* Link */}
      <a 
        href={service.slug}
        className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue hover:text-brand-light transition-colors duration-200 group/link"
      >
        View service
        <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/link:translate-x-1" />
      </a>
    </article>
  )
}

export default ServiceCard