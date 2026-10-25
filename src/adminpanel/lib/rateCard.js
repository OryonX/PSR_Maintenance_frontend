// PSR service rates — transcribed from the "SERVICE RATES" sheet (Oct 2026).
// The backend has no price list, so this is the only source of default
// prices for invoice lines. Prices are in GBP, as on the sheet.
//
// unit:
//   'fixed' — flat price                      → quantity 1
//   'hour'  — price per hour (per operative)  → quantity = hours
//   'day'   — price per day                   → quantity = days
//   'from'  — starting price; prefilled, adjust to the real job
//   'quote' — no list price; enter it from the quotation
//
// serviceTypes: matching keys of the vertical's service_types
// (config/multitenancy.php → field_service), used to suggest a default line
// for a job. Gardening and guttering have no service type in the system yet.

export const RATE_CARD = [
  {
    category: 'Electrical',
    serviceTypes: ['electrical'],
    items: [
      { id: 'electrical-callout', name: 'Standard Call-Out', includes: 'Up to 1h travel + 1h labour', unit: 'fixed', price: 180, isDefault: true },
      { id: 'electrical-hour', name: 'Additional Labour Hour', includes: 'Per operative', unit: 'hour', price: 65 },
      { id: 'electrical-fault', name: 'Fault Finding', includes: 'Basic diagnostic', unit: 'from', price: 120 },
      { id: 'electrical-emergency', name: 'Emergency Electrical Call-Out', includes: 'Out of hours', unit: 'from', price: 260 }
    ]
  },
  {
    category: 'General Maintenance',
    serviceTypes: ['general-repairs', 'maintenance-plans'],
    items: [
      { id: 'general-callout', name: 'Standard Call-Out', includes: 'Up to 1h travel + 1h labour', unit: 'fixed', price: 150, isDefault: true },
      { id: 'general-hour', name: 'Additional Labour Hour', includes: 'Per operative', unit: 'hour', price: 50 },
      { id: 'general-minor', name: 'Minor Repairs', includes: 'Basic maintenance works', unit: 'from', price: 90 }
    ]
  },
  {
    category: 'Plumbing',
    serviceTypes: ['plumbing'],
    items: [
      { id: 'plumbing-simple', name: 'Simple Plumbing Repair', includes: 'Minor repairs/blockages', unit: 'fixed', price: 150, isDefault: true },
      { id: 'plumbing-complex', name: 'Complex Plumbing Works', includes: 'Diagnostic/repair works', unit: 'from', price: 180 },
      { id: 'plumbing-hour', name: 'Additional Labour Hour', includes: 'Per operative', unit: 'hour', price: 60 },
      { id: 'plumbing-emergency', name: 'Emergency Plumbing Call-Out', includes: 'Out of hours', unit: 'from', price: 260 }
    ]
  },
  {
    category: 'Painting & Decorating',
    serviceTypes: ['painting-decorating'],
    items: [
      { id: 'painting-quote', name: 'Painting & Decorating', unit: 'quote', price: null },
      { id: 'painting-touchups', name: 'Touch-Ups & Small Repairs', unit: 'from', price: 120, isDefault: true },
      { id: 'painting-day', name: 'Day Rate', unit: 'day', price: 220 }
    ]
  },
  {
    category: 'Gardening & Landscaping',
    serviceTypes: [],
    items: [
      { id: 'garden-maintenance', name: 'Garden Maintenance', unit: 'from', price: 80, isDefault: true },
      { id: 'garden-landscaping', name: 'Landscaping Works', unit: 'quote', price: null },
      { id: 'garden-waste', name: 'Waste Removal', unit: 'quote', price: null }
    ]
  },
  {
    category: 'Guttering',
    serviceTypes: [],
    items: [
      { id: 'gutter-small', name: 'Small Property', unit: 'fixed', price: 90 },
      { id: 'gutter-medium', name: 'Medium Property', unit: 'fixed', price: 150, isDefault: true },
      { id: 'gutter-large', name: 'Large Property', unit: 'fixed', price: 240 }
    ]
  }
]

const ITEMS_BY_ID = Object.fromEntries(
  RATE_CARD.flatMap((group) => group.items.map((item) => [item.id, { ...item, category: group.category }]))
)

export const rateItem = (id) => ITEMS_BY_ID[id] || null

const UNIT_SUFFIX = { hour: '/hr', day: '/day' }

/** "£65/hr" · "From £120" · "Quotation" */
export function rateLabel(item) {
  if (item.unit === 'quote' || item.price == null) return 'Quotation'
  const price = `£${item.price}${UNIT_SUFFIX[item.unit] || ''}`
  return item.unit === 'from' ? `From ${price}` : price
}

/** Default rate item for a vertical service_type key, or null. */
export function defaultRateFor(serviceType) {
  if (!serviceType) return null
  const group = RATE_CARD.find((g) => g.serviceTypes.includes(serviceType))
  const item = group?.items.find((i) => i.isDefault) || group?.items.find((i) => i.price != null)
  return item ? { ...item, category: group.category } : null
}
