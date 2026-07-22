# PSR Maintenance Services - Frontend

Professional trades and renovations website for PSR Maintenance Services, serving Greater Manchester, UK.

## Stack

- **React 18** + **Vike** (SSR)
- **Tailwind CSS** (utility-first)
- **Framer Motion** (animations)
- **Lucide React** (icons)
- **React Helmet Async** (SEO)

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
PSR_Maintenance_frontend/
├── public/              # Static assets
├── src/
│   ├── api/            # API calls and webhooks
│   ├── assets/         # Images and media
│   ├── components/
│   │   ├── layouts/    # Layout components (Navbar, Footer)
│   │   ├── sections/   # Page sections (Hero, Services, etc.)
│   │   └── ui/         # Reusable UI components
│   ├── config/         # Data configs (services, projects, FAQ)
│   ├── hooks/          # Custom React hooks
│   ├── locales/        # i18n translations
│   ├── pages/          # Page components
│   ├── seo/            # SEO components and data
│   ├── App.jsx         # Main app component
│   ├── index.css       # Global styles
│   └── main.jsx        # Entry point
└── [config files]
```

## Environment Variables

Copy `.env.example` to `.env` and configure:

```
VITE_QUOTE_WEBHOOK_URL=https://n8n.yourdomain.com/webhook/psr-quote
VITE_WHATSAPP_NUMBER=447700000000
VITE_SITE_URL=https://psrmaintenance.co.uk
```

## Features

- ✅ Responsive design (mobile-first)
- ✅ SEO optimized with JSON-LD schema
- ✅ Animated sections with intersection observer
- ✅ WhatsApp integration
- ✅ Quote form with webhook integration
- ✅ Accessibility compliant (WCAG AA)
- ✅ Reduced motion support

## Design System

### Colors
- Navy: `#0B1526` (primary dark)
- Brand Blue: `#233B5C` (buttons, accents)
- WhatsApp Green: `#22C55E` (CTAs)
- Surface Light: `#F7F9FC` (section backgrounds)

### Typography
- Font: Inter (Google Fonts)
- Display: Bold, condensed for headlines
- Body: Regular, high contrast for readability

## Deployment

Configured for Netlify deployment via `netlify.toml`.

## License

© PSR Maintenance Services Ltd - All rights reserved.