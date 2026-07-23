import {
  Wrench,
  Home,
  Droplets,
  Zap,
  Paintbrush,
  Grid3X3,
  BrickWall,
  ClipboardCheck
} from 'lucide-react'
import servicesContent from '../locales/en/services.json'

const serviceMeta = [
  { id: 'general-repairs', icon: Wrench },
  { id: 'full-renovations', icon: Home },
  { id: 'plumbing', icon: Droplets },
  { id: 'electrical', icon: Zap },
  { id: 'painting-decorating', icon: Paintbrush },
  { id: 'tiling-flooring', icon: Grid3X3 },
  { id: 'plastering', icon: BrickWall },
  { id: 'maintenance-plans', icon: ClipboardCheck }
]

export const services = serviceMeta.map(({ id, icon }) => ({
  id,
  icon,
  slug: `/services/${id}`,
  ...servicesContent.items[id]
}))

export default services
