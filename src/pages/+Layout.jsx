import React from 'react'
import { HelmetProvider } from 'react-helmet-async'
import Layout from '../components/layouts/Layout.jsx'
import '../index.css'

function LayoutDefault({ children }) {
  return (
    <HelmetProvider>
      <Layout>{children}</Layout>
    </HelmetProvider>
  )
}

export default LayoutDefault
