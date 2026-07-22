import React from 'react'
import { ArrowRight } from 'lucide-react'
import Layout from '../components/layouts/Layout.jsx'
import AnimatedSection from '../components/ui/AnimatedSection.jsx'
import StaggerContainer from '../components/ui/StaggerContainer.jsx'
import ServiceCard from '../components/ui/ServiceCard.jsx'
import ChatWidget from '../components/ui/ChatWidget.jsx'
import HelmetSEO from '../seo/HelmetSEO.jsx'
import { servicesSEO } from '../seo/seoData.js'
import { services } from '../config/services.js'
import { useContactPhone } from '../hooks/useContactPhone.js'

function ServicesPage() {
  const { openWhatsApp } = useContactPhone()

  return (
    <Layout>
      <HelmetSEO {...servicesSEO} />
      
      {/* Hero Section */}
      <section className="bg-navy-900 pt-32 pb-20">
        <div className="section-container">
          <AnimatedSection className="text-center max-w-3xl mx-auto">
            <span className="text-white/60 text-sm font-semibold uppercase tracking-wider mb-4 block">
              What We Do
            </span>
            <h1 className="text-4xl lg:text-6xl font-black text-white mb-6">
              OUR <span className="text-white/60">SERVICES</span>
            </h1>
            <p className="text-lg text-white/70 leading-relaxed">
              From emergency repairs to complete property transformations, PSR delivers professional trades services across Greater Manchester. Every job, every trade, one trusted team.
            </p>
          </AnimatedSection>
        </div>
      </section>

      {/* Services Grid */}
      <section className="bg-surface-light section-padding">
        <div className="section-container">
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-white py-16">
        <div className="section-container">
          <AnimatedSection className="bg-navy-900 rounded-2xl p-8 lg:p-12 text-center">
            <h2 className="text-3xl lg:text-4xl font-black text-white mb-4">
              Need Something Else?
            </h2>
            <p className="text-white/70 max-w-xl mx-auto mb-8">
              Can't see what you're looking for? We handle all types of maintenance and renovation work. Get in touch and let's discuss your project.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => openWhatsApp('Hi, I have a project and would like to discuss what services you can provide.')}
                className="btn-primary"
              >
                Get a Free Quote
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </AnimatedSection>
        </div>
      </section>

      <ChatWidget />
    </Layout>
  )
}

export default ServicesPage