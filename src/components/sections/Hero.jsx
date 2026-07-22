import React from 'react'
import { ArrowRight, MessageCircle, MapPin, Shield, Award, Clock, ChevronDown } from 'lucide-react'
import { useCountUp } from '../../hooks/useCountUp.js'
import { useContactPhone } from '../../hooks/useContactPhone.js'
import { useTranslation } from '../../hooks/useTranslation.js'

function StatCard({ value, suffix, label }) {
  const { ref, count } = useCountUp(value, 2000, { suffix })

  return (
    <div ref={ref} className="bg-white/5 backdrop-blur-sm rounded-xl p-4 lg:p-5 border border-white/10">
      <div className="text-3xl lg:text-4xl font-black text-white mb-1">
        {count}
      </div>
      <div className="text-white/60 text-xs lg:text-sm">
        {label}
      </div>
    </div>
  )
}

function Hero() {
  const { openWhatsApp } = useContactPhone()
  const { t } = useTranslation('home')

  const stats = [
    { value: 500, suffix: '+', label: t('hero.stats.projects') },
    { value: 12, suffix: '+', label: t('hero.stats.years') },
    { value: 98, suffix: '%', label: t('hero.stats.satisfaction') },
    { value: 24, suffix: 'h', label: t('hero.stats.response') }
  ]

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 80
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' })
    }
  }

  return (
    <section className="relative min-h-screen bg-navy-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-navy-900 via-navy-900/95 to-navy-800/90" />

      {/* Glow Effects */}
      <div className="absolute top-1/4 right-0 w-96 h-96 bg-brand-blue/20 rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-whatsapp/10 rounded-full blur-3xl" />

      {/* Content */}
      <div className="relative section-container pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Text */}
          <div className="space-y-8">
            {/* Location Badge */}
            <div
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-white/80 text-sm"
              style={{ animation: 'fadeInUp 0.6s ease-out forwards' }}
            >
              <MapPin className="w-4 h-4" />
              {t('hero.locationBadge')}
            </div>

            {/* Headline */}
            <h1 className="space-y-2">
              <span
                className="block text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-none"
                style={{ animation: 'fadeInUp 0.6s ease-out 0.1s forwards', opacity: 0 }}
              >
                {t('hero.headline.line1')}
              </span>
              <span
                className="block text-5xl sm:text-6xl lg:text-7xl font-black text-white/80 leading-none"
                style={{ animation: 'fadeInUp 0.6s ease-out 0.2s forwards', opacity: 0 }}
              >
                {t('hero.headline.line2')}
              </span>
              <span
                className="block text-5xl sm:text-6xl lg:text-7xl font-black text-white/60 leading-none"
                style={{ animation: 'fadeInUp 0.6s ease-out 0.3s forwards', opacity: 0 }}
              >
                {t('hero.headline.line3')}
              </span>
            </h1>

            {/* Description */}
            <p
              className="text-lg text-white/70 max-w-xl leading-relaxed"
              style={{ animation: 'fadeInUp 0.6s ease-out 0.4s forwards', opacity: 0 }}
            >
              {t('hero.description')}
            </p>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row gap-4"
              style={{ animation: 'fadeInUp 0.6s ease-out 0.5s forwards', opacity: 0 }}
            >
              <button
                onClick={() => scrollToSection('contact')}
                className="btn-primary group"
              >
                {t('hero.ctaQuote')}
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={() => openWhatsApp(t('hero.whatsappMessage'))}
                className="btn-whatsapp"
              >
                <MessageCircle className="w-5 h-5" />
                {t('hero.ctaWhatsapp')}
              </button>
            </div>

            {/* Trust Indicators */}
            <div
              className="flex flex-wrap gap-4 pt-4"
              style={{ animation: 'fadeInUp 0.6s ease-out 0.6s forwards', opacity: 0 }}
            >
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Shield className="w-4 h-4 text-whatsapp" />
                {t('hero.trust.insured')}
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Award className="w-4 h-4 text-whatsapp" />
                {t('hero.trust.certified')}
              </div>
              <div className="flex items-center gap-2 text-white/60 text-sm">
                <Clock className="w-4 h-4 text-whatsapp" />
                {t('hero.trust.emergency')}
              </div>
            </div>
          </div>

          {/* Right Column - Stats */}
          <div
            className="grid grid-cols-2 gap-4"
            style={{ animation: 'fadeInUp 0.6s ease-out 0.7s forwards', opacity: 0 }}
          >
            {stats.map((stat, index) => (
              <StatCard key={index} value={stat.value} suffix={stat.suffix} label={stat.label} />
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Down Indicator */}
      <button
        onClick={() => scrollToSection('services')}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/40 hover:text-white/60 transition-colors"
        aria-label={t('hero.scrollToServices')}
      >
        <ChevronDown className="w-6 h-6 animate-bounce-slow" />
      </button>
    </section>
  )
}

export default Hero
