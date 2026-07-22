import { 
  Wrench, 
  Home, 
  Droplets, 
  Zap, 
  Paintbrush, 
  Grid3X3, 
  Wall,
  ClipboardCheck
} from 'lucide-react'

export const services = [
  {
    id: 'general-repairs',
    title: 'General Repairs',
    icon: Wrench,
    description: 'From a sticking door to a crumbling plaster wall — PSR\'s general repair team handles every small job with the same care as a full renovation. We show up on time, bring the right tools, and leave your home better than we found it. No call-out fees, no hidden charges.',
    bullets: [
      'Door & Window Repairs',
      'Furniture Assembly',
      'Shelving & Fixtures',
      'Minor Structural Fixes'
    ],
    slug: '/servicios/general-repairs'
  },
  {
    id: 'full-renovations',
    title: 'Full Renovations',
    icon: Home,
    description: 'Whether it\'s a full kitchen refit, a loft conversion, or a whole-house renovation, PSR manages every stage — design, trades coordination, materials, and finish. One point of contact, one team, zero stress. We\'ve transformed properties across Greater Manchester for over 12 years.',
    bullets: [
      'Kitchen Refits',
      'Bathroom Renovations',
      'Extension Works',
      'Loft Conversions'
    ],
    slug: '/servicios/full-renovations'
  },
  {
    id: 'plumbing',
    title: 'Plumbing',
    icon: Droplets,
    description: 'PSR\'s plumbing team covers everything from a dripping tap to a full heating system installation. All our plumbers are fully qualified and Gas Safe registered where applicable. We offer emergency call-outs across Greater Manchester, 7 days a week, with a response target of under 2 hours.',
    bullets: [
      'Leak Detection & Repair',
      'Boiler Installation & Servicing',
      'Radiator Fitting',
      'Bathroom Plumbing'
    ],
    slug: '/servicios/plumbing'
  },
  {
    id: 'electrical-work',
    title: 'Electrical Work',
    icon: Zap,
    description: 'All electrical work at PSR is carried out by Part P certified electricians, ensuring every installation is safe, tested, and fully compliant with current BS 7671 wiring regulations. From a single socket to a full consumer unit upgrade, we issue the correct certification on completion.',
    bullets: [
      'Consumer Unit Upgrades',
      'Socket & Lighting Circuits',
      'EV Charger Installation',
      'Fault Finding & Repairs'
    ],
    slug: '/servicios/electrical-work'
  },
  {
    id: 'painting-decorating',
    title: 'Painting & Decorating',
    icon: Paintbrush,
    description: 'PSR\'s decorating team delivers clean, lasting paintwork on new builds, period properties, and commercial spaces across Greater Manchester. We prep properly — filling, sanding, priming — so the finish holds. No runs, no missed patches, no shortcuts.',
    bullets: [
      'Interior Painting',
      'Exterior Painting',
      'Feature Walls',
      'Wallpaper Hanging'
    ],
    slug: '/servicios/painting-decorating'
  },
  {
    id: 'tiling-flooring',
    title: 'Tiling & Flooring',
    icon: Grid3X3,
    description: 'PSR\'s tiling and flooring team works to a standard you can see in every grout line. We handle everything from a single bathroom wall to a whole-house floor installation — wall tiles, floor tiles, large format porcelain, underfloor heating, and all hard flooring types.',
    bullets: [
      'Wall Tiling',
      'Floor Tiling',
      'Underfloor Heating',
      'Laminate & Vinyl Flooring'
    ],
    slug: '/servicios/tiling-flooring'
  },
  {
    id: 'plastering',
    title: 'Plastering',
    icon: Wall,
    description: 'PSR\'s plasterers deliver the flat, flawless surface that makes a room. Whether you need a full re-skim after a renovation, dry lining for a new partition, or patch repairs after pipework — we work quickly, cleanly, and to a standard ready for paint the next day.',
    bullets: [
      'Skim Coating',
      'Dry Lining',
      'Coving & Cornices',
      'Patch Repairs'
    ],
    slug: '/servicios/plastering'
  },
  {
    id: 'maintenance-plans',
    title: 'Maintenance Plans',
    icon: ClipboardCheck,
    description: 'PSR\'s maintenance plans keep your property in peak condition with scheduled inspections, seasonal checks, and priority access to the full trades team. Ideal for homeowners who want peace of mind, and landlords who need compliant properties with minimal hassle.',
    bullets: [
      'Monthly Inspections',
      'Seasonal Checks',
      'Priority Call-Out',
      'Full Property Reports'
    ],
    slug: '/servicios/maintenance-plans'
  }
]

export default services