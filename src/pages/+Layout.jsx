import React from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { HelmetProvider } from 'react-helmet-async'
import Layout from '../components/layouts/Layout.jsx'
import AdminRoot from '../adminpanel/components/layout/AdminRoot.jsx'
import '../index.css'

function LayoutDefault({ children }) {
  const pageContext = usePageContext()
  const isAdmin = pageContext.urlPathname?.startsWith('/admin')

  return (
    <HelmetProvider>
      {isAdmin ? <AdminRoot>{children}</AdminRoot> : <Layout>{children}</Layout>}
    </HelmetProvider>
  )
}

export default LayoutDefault
