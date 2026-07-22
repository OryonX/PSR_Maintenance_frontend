import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'

function FAQItem({ item, isOpen, onToggle }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-blue/20 focus:ring-inset"
        aria-expanded={isOpen}
      >
        <span className="font-semibold text-navy-900 pr-4">{item.question}</span>
        <ChevronDown 
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      
      <div 
        className="grid transition-all duration-300 ease-in-out"
        style={{
          gridTemplateRows: isOpen ? '1fr' : '0fr'
        }}
      >
        <div className="overflow-hidden">
          <div className="p-5 pt-0 text-gray-600 text-sm leading-relaxed">
            {item.answer}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FAQItem