import React from 'react'
import Layout from './components/layouts/Layout.jsx'
import Hero from './components/sections/Hero.jsx'
import Services from './components/sections/Services.jsx'
import WhyPSR from './components/sections/WhyPSR.jsx'
import Projects from './components/sections/Projects.jsx'
import Testimonials from './components/sections/Testimonials.jsx'
import FAQ from './components/sections/FAQ.jsx'
import QuoteFormFooter from './components/sections/QuoteFormFooter.jsx'
import ChatWidget from './components/ui/ChatWidget.jsx'
import HelmetSEO from './seo/HelmetSEO.jsx'
import { homeSEO } from './seo/seoData.js'

function App() {
  return (
    <Layout>
      <HelmetSEO {...homeSEO} />
      <Hero />
      <Services />
      <WhyPSR />
      <Projects />
      <Testimonials />
      <FAQ />
      <QuoteFormFooter />
      <ChatWidget />
    </Layout>
  )
}

export default App