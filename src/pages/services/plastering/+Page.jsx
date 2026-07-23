import React from 'react'
import ServiceDetailTemplate from '../../../components/sections/ServiceDetailTemplate.jsx'
import HelmetSEO from '../../../seo/HelmetSEO.jsx'
import { serviceSEO } from '../../../seo/seoData.js'
import { SERVICES_DETAIL } from '../../../config/servicesDetail.js'

const data = SERVICES_DETAIL['plastering']

function Page() {
  return (
    <>
      <HelmetSEO {...serviceSEO(data)} />
      <ServiceDetailTemplate data={data} />
    </>
  )
}

export default Page
