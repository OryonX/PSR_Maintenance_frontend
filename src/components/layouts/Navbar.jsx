import React, { useState } from 'react'
import { Menu, X, MessageCircle, ArrowRight } from 'lucide-react'
import { useScrollSpy } from '../../hooks/useScrollSpy.js'
import { useContactPhone } from '../../hooks/useContactPhone.js'
import { useTranslation } from '../../hooks/useTranslation.js'
import logo from "../../../public/img/rsr.png"

const navLinkIds = ['services', 'about', 'work', 'testimonials', 'contact']

function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const activeSection = useScrollSpy(navLinkIds, { offset: 150 })
  const { openWhatsApp } = useContactPhone()
  const { t } = useTranslation('common')
  const navLinks = navLinkIds.map((id) => ({ id, label: t(`nav.links.${id}`) }))

  const scrollToSection = (id) => {
    const element = document.getElementById(id)
    if (element) {
      const offset = 80
      const elementPosition = element.getBoundingClientRect().top + window.scrollY
      window.scrollTo({
        top: elementPosition - offset,
        behavior: 'smooth'
      })
    }
    setIsMobileMenuOpen(false)
  }

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 bg-navy-900/95 backdrop-blur-md shadow-lg"
    >
      <nav className="section-container">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2">
            <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center">
              <img src={logo} alt="RSR Logo" className="w-12 h-12 object-contain " />
            </div>
           
          </a>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => scrollToSection(link.id)}
                className={`text-sm font-medium transition-colors duration-200 ${
                  activeSection === link.id 
                    ? 'text-white' 
                    : 'text-white/70 hover:text-white'
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <button
              onClick={() => openWhatsApp()}
              className="flex items-center gap-2 px-4 py-2 bg-whatsapp text-white text-sm font-semibold rounded-lg hover:bg-whatsapp-light transition-colors duration-200"
            >
              <MessageCircle className="w-4 h-4" />
              {t('nav.whatsapp')}
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="flex items-center gap-2 px-4 py-2 bg-white text-navy-900 text-sm font-semibold rounded-lg hover:bg-gray-100 transition-colors duration-200"
            >
              {t('nav.freeQuote')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-10 h-10 flex items-center justify-center text-white"
            aria-label={t('nav.toggleMenu')}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 bg-navy-900 border-t border-white/10">
            <div className="section-container py-4">
              <div className="flex flex-col gap-2">
                {navLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className={`text-left py-3 px-4 rounded-lg font-medium transition-colors ${
                      activeSection === link.id 
                        ? 'bg-white/10 text-white' 
                        : 'text-white/70 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
              
              {/* Mobile CTAs */}
              <div className="flex gap-3 mt-4 pt-4 border-t border-white/10">
                <button
                  onClick={() => {
                    openWhatsApp()
                    setIsMobileMenuOpen(false)
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-whatsapp text-white font-semibold rounded-lg"
                >
                  <MessageCircle className="w-5 h-5" />
                  {t('nav.whatsapp')}
                </button>
                <button
                  onClick={() => scrollToSection('contact')}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-white text-navy-900 font-semibold rounded-lg"
                >
                  {t('nav.freeQuote')}
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}

export default Navbar