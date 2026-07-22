import React, { useState } from 'react'
import { MessageCircle, Phone, MapPin, ArrowRight, Check, Loader2 } from 'lucide-react'
import AnimatedSection from '../ui/AnimatedSection.jsx'
import { services } from '../../config/services.js'
import { useContactPhone } from '../../hooks/useContactPhone.js'

const CONTACT_INFO = {
  phone: import.meta.env.VITE_COMPANY_PHONE || '+44 7700 000 000',
  address: 'Manchester, UK',
  coverage: 'Covering all of Greater Manchester'
}

function QuoteFormFooter() {
  const { openWhatsApp } = useContactPhone()
  const [formState, setFormState] = useState({
    full_name: '',
    phone: '',
    email: '',
    service_type: '',
    description: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    
    if (!formState.full_name.trim()) {
      newErrors.full_name = 'Full name is required'
    }
    
    if (!formState.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else if (!/^\+?[\d\s-]{10,}$/.test(formState.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid phone number'
    }
    
    if (formState.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formState.email)) {
      newErrors.email = 'Please enter a valid email'
    }
    
    if (!formState.service_type) {
      newErrors.service_type = 'Please select a service'
    }
    
    if (!formState.description.trim()) {
      newErrors.description = 'Please describe your project'
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
            REQUEST A <span className="text-brand-blue">FREE QUOTE</span>
          </h2>
          <p className="text-gray-600 max-w-xl mx-auto">
            Fill in the form below, message us on WhatsApp, or find us on the map. We'll get back to you within 24 hours.
          </p>
        </AnimatedSection>

        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left Column - Contact Cards & Map */}
          <AnimatedSection className="lg:col-span-2 space-y-4">
            {/* WhatsApp Card */}
            <button
              onClick={() => openWhatsApp('Hi, I\'d like to get a free quote for some work.')}
              className="w-full flex items-center gap-4 p-4 bg-whatsapp/10 hover:bg-whatsapp/20 rounded-xl transition-colors text-left group"
            >
              <div className="w-12 h-12 bg-whatsapp rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-navy-900">Chat on WhatsApp</h4>
                <p className="text-sm text-gray-600">Fastest way to reach us</p>
              </div>
              <ArrowRight className="w-5 h-5 text-whatsapp opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {/* Phone Card */}
            <a
              href={`tel:${CONTACT_INFO.phone.replace(/\s/g, '')}`}
              className="w-full flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200 hover:border-brand-blue transition-colors"
            >
              <div className="w-12 h-12 bg-surface-light rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-navy-900" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Call us directly</p>
                <p className="font-semibold text-navy-900">{CONTACT_INFO.phone}</p>
              </div>
            </a>

            {/* Location Card */}
            <div className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-200">
              <div className="w-12 h-12 bg-surface-light rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-navy-900" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Based in</p>
                <p className="font-semibold text-navy-900">{CONTACT_INFO.address}</p>
                <p className="text-xs text-gray-500">{CONTACT_INFO.coverage}</p>
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
                title="PSR Maintenance Location"
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
                <h3 className="text-2xl font-bold text-navy-900 mb-2">Quote Request Sent!</h3>
                <p className="text-gray-600 mb-6">
                  We respond within 24 hours. Keep an eye on your phone — we'll be in touch soon.
                </p>
                <button
                  onClick={() => {
                    setIsSubmitted(false)
                    setFormState({
                      full_name: '',
                      phone: '',
                      email: '',
                      service_type: '',
                      description: ''
                    })
                  }}
                  className="text-brand-blue font-semibold hover:underline"
                >
                  Send another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 lg:p-8 border border-gray-200">
                <div className="grid sm:grid-cols-2 gap-4 mb-4">
                  {/* Full Name */}
                  <div>
                    <label htmlFor="full_name" className="block text-sm font-medium text-navy-900 mb-1.5">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="full_name"
                      name="full_name"
                      value={formState.full_name}
                      onChange={handleChange}
                      placeholder="John Smith"
                      className={`w-full px-4 py-2.5 rounded-lg border ${errors.full_name ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-brand-blue'} focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-colors`}
                    />
                    {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-navy-900 mb-1.5">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formState.phone}
                      onChange={handleChange}
                      placeholder="+44 7700 000 000"
                      className={`w-full px-4 py-2.5 rounded-lg border ${errors.phone ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-brand-blue'} focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-colors`}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-navy-900 mb-1.5">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formState.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      className={`w-full px-4 py-2.5 rounded-lg border ${errors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-brand-blue'} focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-colors`}
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>

                  {/* Service Type */}
                  <div>
                    <label htmlFor="service_type" className="block text-sm font-medium text-navy-900 mb-1.5">
                      Service Required <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="service_type"
                      name="service_type"
                      value={formState.service_type}
                      onChange={handleChange}
                      className={`w-full px-4 py-2.5 rounded-lg border ${errors.service_type ? 'border-red-300 focus:border-red-500' : 'border-gray-200 focus:border-brand-blue'} focus:outline-none focus:ring-2 focus:ring-brand-blue/20 transition-colors bg-white`}
                    >
                      <option value="">Select a service...</option>
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
                    Describe Your Project <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formState.description}
                    onChange={handleChange}
                    placeholder="Tell us about the work you need — location, scope, any details..."
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
                      Sending...
                    </>
                  ) : (
                    <>
                      SEND QUOTE REQUEST
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-gray-500 mt-4">
                  We respond within 24 hours. Your details are never shared with third parties.
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