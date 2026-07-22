import React from 'react'
import Hero from '../../components/sections/Hero.jsx'
import Services from '../../components/sections/Services.jsx'
import WhyPSR from '../../components/sections/WhyPSR.jsx'
import Projects from '../../components/sections/Projects.jsx'
import Testimonials from '../../components/sections/Testimonials.jsx'
import FAQ from '../../components/sections/FAQ.jsx'
import QuoteFormFooter from '../../components/sections/QuoteFormFooter.jsx'
import HelmetSEO from '../../seo/HelmetSEO.jsx'
import { homeSEO } from '../../seo/seoData.js'

function Page() {
  return (
    <>
      <HelmetSEO {...homeSEO} />
      <Hero />
      <Services />
      <WhyPSR />
      <Projects />
      <Testimonials />
      <FAQ />
      <QuoteFormFooter />
    </>
  )
}

export default Page
