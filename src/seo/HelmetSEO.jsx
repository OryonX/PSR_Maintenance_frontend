import React from 'react'
import { Helmet } from 'react-helmet-async'

function HelmetSEO({ 
  title, 
  description, 
  canonical, 
  schema = null,
  noindex = false,
  ogImage = '/assets/img/og-image.jpg'
}) {
  const siteUrl = import.meta.env.VITE_SITE_URL || 'https://psrmaintenance.co.uk'
  
  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {canonical && <link rel="canonical" href={canonical} />}
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      {canonical && <meta property="og:url" content={canonical} />}
      <meta property="og:image" content={`${siteUrl}${ogImage}`} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${siteUrl}${ogImage}`} />
      
      {/* JSON-LD Schema */}
      {schema && (
        <script type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      )}
    </Helmet>
  )
}

export default HelmetSEO