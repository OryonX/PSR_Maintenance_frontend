import React from 'react'
import { Star, ExternalLink } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection.jsx'
import StaggerContainer from '../ui/StaggerContainer.jsx'
import TestimonialCard from '../ui/TestimonialCard.jsx'
import { testimonials, aggregateRating } from '../../config/testimonials.js'
import { useTranslation } from '../../hooks/useTranslation.js'

function Testimonials() {
  const { t } = useTranslation('home')

  return (
    <section id="testimonials" className="bg-surface-light section-padding">
      <div className="section-container">
        {/* Header */}
        <AnimatedSection className="text-center mb-12">
          <span className="text-brand-blue text-sm font-semibold uppercase tracking-wider mb-2 block">
            {t('testimonials.badge')}
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-navy-900 mb-6">
            {t('testimonials.titlePrefix')}<span className="text-brand-blue">{t('testimonials.titleHighlight')}</span>
          </h2>

          {/* Rating Summary */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <div className="flex items-center gap-2">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(aggregateRating.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
              <span className="font-bold text-navy-900">{aggregateRating.rating} {t('testimonials.ratingOutOf')}</span>
            </div>
            <span className="text-gray-500">·</span>
            <span className="text-gray-600">{t('testimonials.basedOn')} <strong>{aggregateRating.totalReviews}{t('testimonials.reviewsSuffix')}</strong></span>
            <a
              href={aggregateRating.googleBusinessUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-brand-blue hover:text-brand-light font-medium transition-colors"
            >
              {t('testimonials.viewOnGoogle')}
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </AnimatedSection>

        {/* Testimonials Grid */}
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.id} testimonial={testimonial} />
          ))}
        </StaggerContainer>

        {/* Leave Review CTA */}
        <AnimatedSection delay={500} className="text-center mt-10">
          <a
            href={aggregateRating.googleBusinessUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-navy-900 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            {t('testimonials.leaveReview')}
          </a>
        </AnimatedSection>
      </div>
    </section>
  )
}

export default Testimonials
