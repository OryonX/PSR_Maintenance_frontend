import React from 'react'
import { MessageCircle, Phone } from 'lucide-react'
import { useContactPhone } from '../../hooks/useContactPhone.js'
import { useTranslation } from '../../hooks/useTranslation.js'

function StickyMobileCTA() {
  const { openWhatsApp, callPhone } = useContactPhone()
  const { t } = useTranslation('common')

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-3 flex gap-3 z-40 lg:hidden">
      <button
        onClick={() => openWhatsApp()}
        className="flex-1 flex items-center justify-center gap-2 py-3 bg-whatsapp text-white font-semibold rounded-lg"
      >
        <MessageCircle className="w-5 h-5" />
        {t('cta.whatsapp')}
      </button>
      <button
        onClick={callPhone}
        className="flex-1 flex items-center justify-center gap-2 py-3 bg-navy-900 text-white font-semibold rounded-lg"
      >
        <Phone className="w-5 h-5" />
        {t('cta.callNow')}
      </button>
    </div>
  )
}

export default StickyMobileCTA
