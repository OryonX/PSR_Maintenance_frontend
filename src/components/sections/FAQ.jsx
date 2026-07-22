import React, { useState } from 'react'
import AnimatedSection from '../ui/AnimatedSection.jsx'
import FAQItem from '../ui/FAQItem.jsx'
import { faqItems } from '../../config/faq.js'

function FAQ() {
  const [openItem, setOpenItem] = useState(null)

  const handleToggle = (id) => {
    setOpenItem(openItem === id ? null : id)
  }

  return (
    <section className="bg-white section-padding">
      <div className="section-container max-w-3xl mx-auto">
        {/* Header */}
        <AnimatedSection className="text-center mb-12">
          <span className="text-brand-blue text-sm font-semibold uppercase tracking-wider mb-2 block">
            FAQs
          </span>
          <h2 className="text-4xl lg:text-5xl font-black text-navy-900">
            COMMON <span className="text-brand-blue">QUESTIONS</span>
          </h2>
        </AnimatedSection>

        {/* FAQ List */}
        <AnimatedSection delay={100}>
          <div className="space-y-3">
            {faqItems.map((item) => (
              <FAQItem 
                key={item.id}
                item={item}
                isOpen={openItem === item.id}
                onToggle={() => handleToggle(item.id)}
              />
            ))}
          </div>
        </AnimatedSection>
      </div>
    </section>
  )
}

export default FAQ