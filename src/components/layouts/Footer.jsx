import React from 'react'
import { MessageCircle, MapPin, ExternalLink } from 'lucide-react'
import { useContactPhone } from '../../hooks/useContactPhone.js'
import TrustBadge from '../ui/TrustBadge.jsx'

const footerLinks = {
  services: [
    { label: 'General Repairs', href: '#services' },
    { label: 'Full Renovations', href: '#services' },
    { label: 'Plumbing', href: '#services' },
    { label: 'Electrical Work', href: '#services' }
  ],
  company: [
    { label: 'About Us', href: '#about' },
    { label: 'Our Work', href: '#work' },
    { label: 'Testimonials', href: '#testimonials' },
    { label: 'Contact', href: '#contact' }
  ],
  legal: [
    { label: 'Privacy Policy', href: '/legal/privacy' },
    { label: 'Terms of Service', href: '/legal/terms' }
  ]
}

function Footer() {
  const { openWhatsApp } = useContactPhone()
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-navy-900 text-white">
      <div className="section-container section-padding pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
                <span className="text-navy-900 font-black text-lg">PSR</span>
              </div>
              <span className="font-bold text-lg">PSR Maintenance</span>
            </div>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              Proudly serving Greater Manchester since 2012. Professional tradespeople delivering quality workmanship, on time and on budget.
            </p>
            <div className="flex flex-wrap gap-2">
              <TrustBadge type="gas-safe" size="sm" />
              <TrustBadge type="part-p" size="sm" />
              <TrustBadge type="insured" size="sm" />
              <TrustBadge type="trustmark" size="sm" />
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    className="text-white/60 hover:text-white text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a 
                    href={link.href}
                    className="text-white/60 hover:text-white text-sm transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Get in Touch</h4>
            <div className="space-y-3">
              <button
                onClick={() => openWhatsApp()}
                className="flex items-center gap-2 px-4 py-2.5 bg-whatsapp text-white text-sm font-semibold rounded-lg hover:bg-whatsapp-light transition-colors duration-200 w-full justify-center"
              >
                <MessageCircle className="w-4 h-4" />
                WhatsApp Us
              </button>
              
              <a 
                href="https://g.page/psrmaintenance"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 text-white/60 hover:text-white text-sm transition-colors"
              >
                <MapPin className="w-4 h-4" />
                Google Business Profile
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/40 text-sm">
            © {currentYear} PSR Maintenance Services Ltd. Manchester, UK. All rights reserved.
          </p>
          <div className="flex gap-6">
            {footerLinks.legal.map((link) => (
              <a 
                key={link.label}
                href={link.href}
                className="text-white/40 hover:text-white/60 text-sm transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer