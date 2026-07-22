import { useState, useCallback } from 'react'
import common from '../locales/en/common.json'
import home from '../locales/en/home.json'
import services from '../locales/en/services.json'
import faq from '../locales/en/faq.json'
import projects from '../locales/en/projects.json'
import testimonials from '../locales/en/testimonials.json'
import legal from '../locales/en/legal.json'
import notFound from '../locales/en/notFound.json'

// Simple i18n hook - currently English only, infrastructure ready for Spanish
const translations = {
  en: { common, home, services, faq, projects, testimonials, legal, notFound }
}

export function useTranslation(namespace = 'common') {
  const [locale] = useState('en')

  const t = useCallback(
    (key, params = {}) => {
      const keys = key.split('.')
      let value = translations[locale]?.[namespace]

      for (const k of keys) {
        value = value?.[k]
        if (value === undefined) return key
      }

      // Replace parameters
      if (typeof value === 'string' && Object.keys(params).length > 0) {
        return value.replace(/\{\{(\w+)\}\}/g, (match, paramKey) =>
          params[paramKey] !== undefined ? params[paramKey] : match
        )
      }

      return value ?? key
    },
    [locale, namespace]
  )

  return { t, locale }
}

export default useTranslation
