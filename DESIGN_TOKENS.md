# PSR Maintenance Services - Design Tokens

Extracted and defined from approved design screenshots.

## Color Palette

### Primary Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--navy-900` | `#0B1526` | Hero bg, footer bg, navbar |
| `--navy-800` | `#0F1E33` | Card backgrounds, overlays |
| `--navy-700` | `#1B2A4A` | Hover states, accents |
| `--brand-blue` | `#233B5C` | Primary buttons, links |
| `--brand-light` | `#2A4570` | Button hover states |

### Accent Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--whatsapp` | `#22C55E` | WhatsApp CTA, chat widget |
| `--whatsapp-light` | `#25D95C` | WhatsApp hover |

### Surface Colors
| Token | Hex | Usage |
|-------|-----|-------|
| `--surface-light` | `#F7F9FC` | Section backgrounds |
| `--surface-white` | `#FFFFFF` | Cards, content areas |

### Trust Badge Colors
| Badge | Hex | Usage |
|-------|-----|-------|
| Gas Safe | `#DC2626` | Red badge |
| Part P | `#2563EB` | Blue badge |
| Fully Insured | `#22C55E` | Green badge |
| TrustMark | `#D97706` | Amber/gold badge |

## Typography

### Font Family
- **Primary**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700, 800, 900

### Type Scale
| Element | Size (Mobile) | Size (Desktop) | Weight |
|---------|---------------|----------------|--------|
| H1 Hero | 48px | 72px | 900 (Black) |
| H2 Section | 32px | 48px | 800 (ExtraBold) |
| H3 Card | 20px | 24px | 700 (Bold) |
| Body | 16px | 16px | 400 (Regular) |
| Small | 14px | 14px | 400 (Regular) |
| Caption | 12px | 12px | 500 (Medium) |

## Spacing

### Section Padding
| Breakpoint | Value |
|------------|-------|
| Mobile | `py-16` (64px) |
| Tablet | `py-20` (80px) |
| Desktop | `py-24` (96px) |

### Container Padding
| Breakpoint | Value |
|------------|-------|
| Mobile | `px-4` (16px) |
| SM | `px-6` (24px) |
| LG | `px-8` (32px) |
| XL | `px-12` (48px) |
| 2XL | `px-16` (64px) |

### Component Spacing
- Card padding: `p-6` (24px) / `p-8` (32px) desktop
- Grid gap: `gap-6` (24px)
- Stack spacing: `space-y-4` to `space-y-8`

## Border Radius
| Token | Value | Usage |
|-------|-------|-------|
| `rounded-lg` | 8px | Buttons, inputs |
| `rounded-xl` | 12px | Cards, panels |
| `rounded-2xl` | 16px | Large cards, modals |
| `rounded-full` | 9999px | Pills, avatars |

## Shadows
| Token | Value |
|-------|-------|
| Card default | `shadow-sm` |
| Card hover | `shadow-lg` |
| Modal/Dropdown | `shadow-2xl` |

## Animations

### Durations
| Name | Value |
|------|-------|
| Fast | 200ms |
| Normal | 300ms |
| Slow | 500ms |
| Count Up | 2000ms |

### Easing
| Name | Value |
|------|-------|
| Default | `ease-out` |
| Bounce | `cubic-bezier(0.34, 1.56, 0.64, 1)` |

### Scroll Reveal
- Translate Y: 20px → 0
- Opacity: 0 → 1
- Duration: 600ms
- Stagger delay: 80ms between items

## Breakpoints
| Name | Value |
|------|-------|
| SM | 640px |
| MD | 768px |
| LG | 1024px |
| XL | 1280px |
| 2XL | 1536px |

## Accessibility

### Contrast Requirements
- All text meets WCAG AA (4.5:1)
- Hero text uses opacity gradient (100% → 80% → 60%) with care for 60% line
- Focus states: `ring-2 ring-brand-blue/20`

### Reduced Motion
- Respects `prefers-reduced-motion`
- Count-up animates instantly when reduced motion is preferred
- Scroll reveals become simple fades

## Assumptions Made

1. **Images**: Project and about images will be added to `/src/assets/img/` - placeholder colors used where images not yet available

2. **Webhook**: Form submission uses environment variable `VITE_QUOTE_WEBHOOK_URL` - falls back to simulated success in dev

3. **WhatsApp Number**: Set via `VITE_WHATSAPP_NUMBER` - defaults to placeholder in dev

4. **i18n**: Infrastructure ready for Spanish but English-only for launch as specified

5. **Chat Widget**: Functional mock - quick replies route to WhatsApp, real conversational AI to be integrated later

6. **Testimonials**: Placeholder data marked as such - to be replaced with real Google reviews feed

7. **Mobile CTA**: Sticky bottom bar appears only on mobile (< lg breakpoint) with WhatsApp + Call buttons