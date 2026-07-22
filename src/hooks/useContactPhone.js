import { useCallback } from 'react'

const WHATSAPP_NUMBER = import.meta.env.VITE_WHATSAPP_NUMBER || '447700000000'

export function useContactPhone() {
  const openWhatsApp = useCallback((message = '') => {
    const encodedMessage = encodeURIComponent(message)
    const url = `https://wa.me/${WHATSAPP_NUMBER}${message ? `?text=${encodedMessage}` : ''}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }, [])

  const callPhone = useCallback(() => {
    const phone = import.meta.env.VITE_COMPANY_PHONE || '+44 7700 000 000'
    window.location.href = `tel:${phone.replace(/\s/g, '')}`
  }, [])

  return { openWhatsApp, callPhone, whatsappNumber: WHATSAPP_NUMBER }
}

export default useContactPhone