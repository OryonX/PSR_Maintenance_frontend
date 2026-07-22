import faqContent from '../locales/en/faq.json'

export const faqItems = Object.entries(faqContent.items).map(([id, content]) => ({
  id,
  ...content
}))

export default faqItems
