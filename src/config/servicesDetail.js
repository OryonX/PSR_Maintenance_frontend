import { services } from './services.js'
import detailContent from '../locales/en/servicesDetail.json'

// Compressed gallery images land here once scripts/compress-images.js has run
// (see src/scripts/compress-images.js). Falls back to an empty map — and the
// gallery renders a placeholder — until the source photos are provided.
const compressedImages = import.meta.glob('../assets/img-optimized/services/**/*.webp', {
  eager: true,
  import: 'default'
})

function resolveGalleryImage(slug, filename) {
  const webpName = filename.replace(/\.(jpg|jpeg|png)$/i, '.webp')
  const key = `../assets/img-optimized/services/${slug}/${webpName}`
  return compressedImages[key] || null
}

// Badge tone/label mapping — text (labelKey) lives in locales/en/common.json,
// tone is presentational metadata, not translatable content.
const BADGES = {
  insured: { labelKey: 'trustBadges.insured', tone: 'green' },
  liability5m: { labelKey: 'trustBadges.liability5m', tone: 'blue' },
  sameDay: { labelKey: 'trustBadges.sameDayAvailable', tone: 'amber' },
  gasSafe: { labelKey: 'trustBadges.gasSafe', tone: 'red' },
  partP: { labelKey: 'trustBadges.partP', tone: 'blue' },
  trustmark: { labelKey: 'trustBadges.trustmark', tone: 'amber' }
}

// Trade-specific accreditation per service (section 3.3): only the trade that
// genuinely holds a certification gets its badge — the rest use the generic set.
const HERO_BADGE_KEYS = {
  'general-repairs': ['insured', 'liability5m', 'sameDay'],
  'full-renovations': ['trustmark', 'insured', 'liability5m'],
  plumbing: ['gasSafe', 'insured', 'sameDay'],
  electrical: ['partP', 'insured', 'liability5m'],
  'painting-decorating': ['insured', 'liability5m', 'sameDay'],
  'tiling-flooring': ['insured', 'liability5m', 'sameDay'],
  plastering: ['insured', 'liability5m', 'sameDay'],
  'maintenance-plans': ['insured', 'liability5m', 'trustmark']
}

// Gallery filenames per service — kept in sync with the naming convention in
// scripts/compress-images.js and the sourcing list handed to the photo pipeline.
const GALLERY_FILES = {
  'general-repairs': ['general-repairs-door-fix.jpg', 'general-repairs-shelving-install.jpg', 'general-repairs-toolkit.jpg'],
  'full-renovations': ['renovation-kitchen-refit.jpg', 'renovation-loft-conversion.jpg', 'renovation-bathroom-full.jpg'],
  plumbing: ['plumbing-pipe-repair.jpg', 'plumbing-boiler-service.jpg', 'plumbing-leak-detection.jpg'],
  electrical: ['electrical-consumer-unit.jpg', 'electrical-socket-install.jpg', 'electrical-wiring-check.jpg'],
  'painting-decorating': ['painting-interior-wall.jpg', 'painting-roller-closeup.jpg', 'painting-feature-wall.jpg'],
  'tiling-flooring': ['tiling-bathroom-floor.jpg', 'tiling-kitchen-splashback.jpg', 'tiling-grout-detail.jpg'],
  plastering: ['plastering-skim-coat.jpg', 'plastering-wall-finish.jpg', 'plastering-tools.jpg'],
  'maintenance-plans': ['maintenance-property-inspection.jpg', 'maintenance-checklist.jpg', 'maintenance-seasonal-check.jpg']
}

export const SERVICES_DETAIL = services.reduce((acc, service) => {
  const content = detailContent[service.id]
  const filenames = GALLERY_FILES[service.id] || []

  acc[service.id] = {
    slug: service.id,
    title: service.title,
    icon: service.icon,
    tagline: content.tagline,
    description: service.description,
    heroBadges: HERO_BADGE_KEYS[service.id].map((key) => ({ key, ...BADGES[key] })),
    subServices: content.subServices,
    gallery: filenames.map((filename, index) => ({
      image: resolveGalleryImage(service.id, filename),
      filename,
      caption: content.galleryCaptions[index]
    })),
    whyChooseUs: content.whyChooseUs,
    testimonial: content.testimonial,
    faq: content.faq
  }

  return acc
}, {})

export default SERVICES_DETAIL
