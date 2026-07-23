import { COMPANY_INFO } from '../config/companyInfo.js'

// Vike evaluates this file in plain Node at config-time (outside Vite's pipeline),
// where env vars aren't populated, so this read must tolerate that and fall back.
let siteUrl = 'https://psrmaintenance.co.uk'
try {
  siteUrl = import.meta.env.VITE_SITE_URL || siteUrl
} catch {
  // Config-time evaluation: env vars unavailable here, default above is kept.
}

export const homeSEO = {
  title: 'PSR Maintenance Services | Professional Trades & Renovations in Manchester',
  description: 'Trusted tradespeople in Greater Manchester for 12+ years. Kitchen & bathroom renovations, plumbing, electrics, painting, and general repairs. Free quotes, fully insured.',
  canonical: `${siteUrl}/`,
  schema: {
    '@context': 'https://schema.org',
    '@type': 'HomeAndConstructionBusiness',
    name: COMPANY_INFO.name,
    image: `${siteUrl}/assets/img/logo/psr-logo.png`,
    '@id': `${siteUrl}/`,
    url: siteUrl,
    telephone: COMPANY_INFO.phoneRaw,
    email: COMPANY_INFO.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Manchester',
      addressRegion: 'Greater Manchester',
      addressCountry: 'GB'
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 53.4808,
      longitude: -2.2426
    },
    areaServed: {
      '@type': 'GeoCircle',
      geoMidpoint: {
        '@type': 'GeoCoordinates',
        latitude: 53.4808,
        longitude: -2.2426
      },
      geoRadius: '25000'
    },
    serviceType: [
      'General Repairs',
      'Kitchen Renovation',
      'Bathroom Renovation',
      'Plumbing Services',
      'Electrical Work',
      'Painting and Decorating',
      'Tiling and Flooring',
      'Plastering'
    ],
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Maintenance Services',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'General Repairs'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Full Renovations'
          }
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Plumbing Services'
          }
        }
      ]
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '120',
      bestRating: '5'
    },
    priceRange: '££',
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '08:00',
        closes: '18:00'
      },
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Saturday'],
        opens: '09:00',
        closes: '16:00'
      }
    ]
  }
}

export const servicesSEO = {
  title: 'Our Services | PSR Maintenance - Trades & Renovations Manchester',
  description: 'Complete range of maintenance services: general repairs, renovations, plumbing, electrical, painting, tiling, plastering. Professional tradespeople across Greater Manchester.',
  canonical: `${siteUrl}/servicios`
}

export const notFoundSEO = {
  title: 'Page Not Found | PSR Maintenance Services',
  description: 'Sorry, the page you are looking for does not exist. Browse our services or contact us for help.',
  noindex: true
}

export function serviceSEO(service) {
  return {
    title: `${service.title} | PSR Maintenance Services Manchester`,
    description: service.tagline,
    canonical: `${siteUrl}/services/${service.slug}`
  }
}

export default { homeSEO, servicesSEO, notFoundSEO, serviceSEO }