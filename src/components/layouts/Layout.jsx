import React from 'react'
import Navbar from './Navbar.jsx'
import Footer from './Footer.jsx'
import StickyMobileCTA from '../ui/StickyMobileCTA.jsx'
import ChatWidget from '../ui/ChatWidget.jsx'

function Layout({ children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      <StickyMobileCTA />
      <ChatWidget />
    </div>
  )
}

export default Layout