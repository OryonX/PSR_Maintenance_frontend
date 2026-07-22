import { useState, useCallback } from 'react'
import en from '../locales/home/en.json'

// Simple i18n hook - currently English only, infrastructure ready for Spanish
const translations = { en }

export function useTranslation(namespace = 'common') {
  const [locale] = useState('en')

  const t = useCallback(
    (key, params = {}) => {
      const keys = key.split('.')
      let value = translations[locale]?.[namespace] || translations[locale]
      
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

      return value || key
    },
    [locale, namespace]
  )

  return { t, locale }
}

export default useTranslation