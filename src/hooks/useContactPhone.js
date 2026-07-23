import { useCallback } from 'react'
import { COMPANY_INFO } from '../config/companyInfo.js'

export function useContactPhone() {
  const openWhatsApp = useCallback((message = '') => {
    const encodedMessage = encodeURIComponent(message)
    const url = `${COMPANY_INFO.whatsappLink}${message ? `?text=${encodedMessage}` : ''}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [])

  const callPhone = useCallback(() => {
    window.location.href = `tel:${COMPANY_INFO.phoneRaw}`
  }, [])

  return { openWhatsApp, callPhone, whatsappNumber: COMPANY_INFO.phoneRaw }
}

export default useContactPhone
