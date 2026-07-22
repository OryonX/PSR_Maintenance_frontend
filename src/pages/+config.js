import vikeReact from 'vike-react/config'
import { homeSEO } from '../seo/seoData.js'

export default {
  extends: [vikeReact],
  title: homeSEO.title,
  description: homeSEO.description,
  favicon: '/favicon.svg',
  prerender: true
}
