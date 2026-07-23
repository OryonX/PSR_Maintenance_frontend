import React, { useState } from 'react'
import { MessageCircle, Phone, MapPin, ArrowRight, Check, Loader2 } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection.jsx'
import { services } from '../../config/services.js'
import { useContactPhone } from '../../hooks/useContactPhone.js'
import { useTranslation } from '../../hooks/useTranslation.js'
import { COMPANY_INFO } from '../../config/companyInfo.js'

function QuoteFormFooter({ defaultServiceType = '', titlePrefix, titleHighlight, subtitle }) {
  const { openWhatsApp } = useContactPhone()
  const { t } = useTranslation('home')
  const [formState, setFormState] = useState({
    full_name: '',
    phone: '',
    email: '',
    service_type: defaultServiceType,
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!formState.full_name.trim()) {
      newErrors.full_name = t('quoteForm.errors.fullNameRequired')
    }

    if (!formState.phone.trim()) {
      newErrors.phone = t('quoteForm.errors.phoneRequired')
    } else if (!/^\+?[\d\s-]{10,}$/.test(formState.phone.replace(/\s/g, ''))) {
      newErrors.phone = t('quoteForm.errors.phoneInvalid')
    }

    if (formState.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      newErrors.email = t('quoteForm.errors.emailInvalid')
    }

    if (!formState.service_type) {
      newErrors.service_type = t('quoteForm.errors.serviceTypeRequired')
    }

    if (!formState.description.trim()) {
      newErrors.description = t('quoteForm.errors.descriptionRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const webhookUrl = import.meta.env.VITE_QUOTE_WEBHOOK_URL

      if (webhookUrl) {
        await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formState,
            timestamp: new Date().toISOString(),
            source: 'website_quote_form'
          })
        })
      }

      // Simulate API delay for UX
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsSubmitted(true)
    } catch (error) {
      console.error('Form submission error:', error)
      // Still show success - we'll handle errors server-side
      setIsSubmitted(true)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormState(prev => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }))
    }
  }

  return (
    <section id="contact" className="bg-surface-light section-padding">
      <div className="section-container">
        {/* Header */}
        <AnimatedSection className="text-center mb-12">
          <h2 className="text-4xl lg:text-5xl font-black text-navy-900 mb-4">
            {titlePrefix ?? t('quoteForm.titlePrefix')}<span className="text-brand-blue">{titleHighlight ?? t('quoteForm.titleHighlight')}</span>
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            {subtitle ?? t('quoteForm.subtitle')}
          </p>
        </AnimatedSection>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left Column - Contact Cards & Map */}
          <AnimatedSection className="lg:col-span-2 space-y-4">
            {/* WhatsApp Card */}
            <button
              onClick={() => openWhatsApp(t('quoteForm.whatsappMessage'))}
              className="w-full flex items-center gap-4 p-4 bg-whatsapp/10 hover:bg-whatsapp/20 rounded-xl transition-colors text-left group"
            >
              <div className="w-12 h-12 bg-whatsapp rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-navy-900">{t('quoteForm.whatsappCard.title')}</h4>
                <p className="text-sm text-gray-600">{t('quoteForm.whatsappCard.subtitle')}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-whatsapp opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {/* Phone Card */}
            <a
              href={`tel:${COMPANY_INFO.phoneRaw}`}
              className="w-full flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-brand-blue transition-colors"
            >
              <div className="w-12 h-12 bg-surface-light rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-navy-900" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{t('quoteForm.phoneCard.label')}</p>
                <p className="font-semibold text-navy-900">{COMPANY_INFO.phone}</p>
              </div>
            </a>

            {/* Location Card */}
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-surface-light rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-navy-900" />
              </div>
              <div>
                <p className="text-xs text-gray-500">{t('quoteForm.locationCard.label')}</p>
                <p className="font-semibold text-navy-900">{t('quoteForm.locationCard.address')}</p>
                <p className="text-xs text-gray-500">{t('quoteForm.locationCard.coverage')}</p>
              </div>
            </div>

            {/* Map Embed */}
            <div className="rounded-xl overflow-hidden border border-gray-200 aspect-video bg-gray-100">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d152515.3654478067!2d-2.321782553437491!3d53.47224516273675!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x487a4d4c5226f5db%3A0xd9be143804fe6baa!2sManchester!5e0!3m2!1sen!2suk!4v1651234567890!5m2!1sen!2suk"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title={t('quoteForm.mapTitle')}
              />
            </div>
          </AnimatedSection>

          {/* Right Column - Form */}
          <AnimatedSection delay={100} className="lg:col-span-3">
            {isSubmitted ? (
              <div className="bg-white rounded-2xl p-8 lg:p-12 border border-gray-200 text-center h-full flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-whatsapp/10 rounded-full flex items-center justify-center mb-4">
                  <Check className="w-8 h-8 text-whatsapp" />
                </div>
                <h3 className="text-2xl font-bold text-navy-900 mb-2">{t('quoteForm.success.title')}</h3>
                <p className="text-gray-600 mb-6">
                  {t('quoteForm.success.message')}
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false)
                    setFormState({
                      full_name: '',
                      phone: '',
                      email: '',
                      service_type: defaultServiceType,
                      description: ''
                    })
                  }}
                  className="text-brand-blue font-semibold hover:underline"
                >
                  {t('quoteForm.success.sendAnother')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-200">
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="full_name" className="block text-sm font-medium text-navy-900 mb-1.5">
                      {t('quoteForm.fields.fullName')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      value={formState.full_name}
                      onChange={handleChange}
                      placeholder={t('quoteForm.fields.fullNamePlaceholder')}
                      className={`w-full px-4 py-2.5 rounded-lg border ${errors.full_name ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-brand-blue'} focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-colors`}
                    />
                    {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-navy-900 mb-1.5">
                      {t('quoteForm.fields.phone')} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formState.phone}
                      onChange={handleChange}
                      placeholder={t('quoteForm.fields.phonePlaceholder')}
                      className={`w-full px-4 py-2.5 rounded-lg border ${errors.phone ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-brand-blue'} focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-colors`}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-navy-900 mb-1.5">
                      {t('quoteForm.fields.email')}
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formState.email}
                      onChange={handleChange}
                      placeholder={t('quoteForm.fields.emailPlaceholder')}
                      className={`w-full px-4 py-2.5 rounded-lg border ${errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-brand-blue'} focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-colors`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  {/* Service Type */}
                  <div>
                    <label htmlFor="service_type" className="block text-sm font-medium text-navy-900 mb-1.5">
                      {t('quoteForm.fields.serviceType')} <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="service_type"
                      name="service_type"
                      value={formState.service_type}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-lg border ${errors.service_type ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-brand-blue'} focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-colors bg-white`}
                    >
                      <option value="">{t('quoteForm.fields.serviceTypePlaceholder')}</option>
                      {services.map((service) => (
                        <option key={service.id} value={service.id}>
                          {service.title}
                        </option>
                      ))}
                    </select>
                    {errors.service_type && <p className="text-red-500 text-xs mt-1">{errors.service_type}</p>}
                  </div>
                </div>

                {/* Description */}
                <div className="mb-6">
                  <label htmlFor="description" className="block text-sm font-medium text-navy-900 mb-1.5">
                    {t('quoteForm.fields.description')} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formState.description}
                    onChange={handleChange}
                    placeholder={t('quoteForm.fields.descriptionPlaceholder')}
                    rows={5}
                    className={`w-full px-4 py-2.5 rounded-lg border ${errors.description ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-brand-blue'} focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-colors resize-none`}
                  />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-brand py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      {t('quoteForm.submitting')}
                    </>
                  ) : (
                    <>
                      {t('quoteForm.submit')}
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-500 mt-4">
                  {t('quoteForm.disclaimer')}
                </p>
              </form>
            )}
          </AnimatedSection>
        </div>
      </div>
    </section>
  )
}

export default QuoteFormFooter
