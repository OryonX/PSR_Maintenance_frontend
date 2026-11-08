import React, { useState, useEffect, useRef } from 'react'
import { X, Mail, Download } from 'lucide-react'

// Admin panel is English-only (PSR convention: no admin i18n), so the viewer
// copy lives here instead of in src/locales.
const TEXT = {
  loading: 'Loading PDF…',
  sending: 'Sending…',
  send_email: 'Send by email',
  send_whatsapp: 'Send by WhatsApp',
  download: 'Download',
  email_sent: 'Email sent.',
  whatsapp_sent: 'Sent by WhatsApp.',
  no_phone: 'No phone number',
  err_generic: 'Something went wrong.'
}

const WhatsAppIcon = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.1-.198.05-.371-.025-.52-.074-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
  </svg>
)

const Spin = () => <span className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />

/**
 * Document-agnostic PDF viewer with a send bar (quotes and client invoices).
 * Knows nothing about either doc type — everything comes in through props:
 *
 *  - isOpen, onClose, title, subtitle (e.g. the recipient)
 *  - loadPdfUrl: async () => objectURL (revoked by the modal on close)
 *  - sendEmail: async () => any | null (null → email button hidden)
 *  - sendWhatsApp: async () => any | null (null → WhatsApp button hidden)
 *  - whatsappAvailable: false → WhatsApp button disabled with a tooltip
 *  - formatError: (err) => string — maps backend error codes (billing.js)
 *  - onSent: (kind: 'email'|'whatsapp', result) => void — e.g. refresh the list
 */
function PdfPreviewModal({
  isOpen,
  onClose,
  title,
  subtitle,
  loadPdfUrl,
  sendEmail,
  sendWhatsApp,
  whatsappAvailable = false,
  formatError,
  onSent
}) {
  const [pdfUrl, setPdfUrl] = useState(null)
  const [loadingPdf, setLoadingPdf] = useState(false)
  const [pdfError, setPdfError] = useState(null)
  const [sending, setSending] = useState(null) // 'email' | 'whatsapp' | null
  const [result, setResult] = useState(null) // { type: 'success' | 'error', message }

  // Callers pass inline arrows; keep the latest in refs so a parent re-render
  // (e.g. the list refreshing after a send) doesn't refetch the PDF.
  const loadRef = useRef(loadPdfUrl)
  loadRef.current = loadPdfUrl
  const errorText = (err) => (formatError ? formatError(err) : err?.message) || TEXT.err_generic

  useEffect(() => {
    if (!isOpen) return undefined
    let objectUrl = null
    let cancelled = false

    setLoadingPdf(true)
    setPdfError(null)
    setResult(null)

    loadRef.current()
      .then((url) => {
        if (cancelled) { URL.revokeObjectURL(url); return }
        objectUrl = url
        setPdfUrl(url)
      })
      .catch((err) => { if (!cancelled) setPdfError(errorText(err)) })
      .finally(() => { if (!cancelled) setLoadingPdf(false) })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
      setPdfUrl(null)
    }
    // Reload only when the modal opens or switches document.
  }, [isOpen, title]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!isOpen) return undefined
    const handleKey = (e) => { if (e.key === 'Escape' && !sending) onClose() }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose, sending])

  const handleSend = async (kind, fn) => {
    if (!fn || sending) return
    setSending(kind)
    setResult(null)
    try {
      const res = await fn()
      setResult({ type: 'success', message: kind === 'email' ? TEXT.email_sent : TEXT.whatsapp_sent })
      onSent?.(kind, res)
    } catch (err) {
      setResult({ type: 'error', message: errorText(err) })
    } finally {
      setSending(null)
    }
  }

  if (!isOpen) return null

  const close = () => { if (!sending) onClose() }

  return (
    <div className="fixed inset-0 z-50 flex items-stretch sm:items-center justify-center" role="dialog" aria-modal="true" aria-label={title}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={close} />
      <div className="relative bg-white w-full sm:w-[92vw] sm:max-w-4xl sm:rounded-xl shadow-xl flex flex-col h-full sm:h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 border-b border-gray-100 flex-shrink-0">
          <div className="min-w-0">
            <h3 className="font-bold text-navy-900 truncate">{title}</h3>
            {subtitle && <p className="text-xs text-gray-400 truncate">{subtitle}</p>}
          </div>
          <button onClick={close} className="text-gray-400 hover:text-navy-900 transition-colors flex-shrink-0" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* PDF */}
        <div className="flex-1 min-h-0 bg-gray-100">
          {loadingPdf && (
            <div className="h-full flex flex-col items-center justify-center gap-3">
              <span className="animate-spin w-8 h-8 border-2 border-navy-900 border-t-transparent rounded-full" />
              <p className="text-xs text-gray-500">{TEXT.loading}</p>
            </div>
          )}
          {!loadingPdf && pdfError && (
            <div className="h-full flex items-center justify-center p-6">
              <p className="text-sm text-red-500 text-center max-w-md">{pdfError}</p>
            </div>
          )}
          {!loadingPdf && !pdfError && pdfUrl && (
            <iframe src={pdfUrl} title={title} className="w-full h-full border-0" />
          )}
        </div>

        {/* Result banner */}
        {result && (
          <div className={`px-4 sm:px-6 py-2 text-sm flex-shrink-0 ${
            result.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'
          }`}>
            {result.message}
          </div>
        )}

        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 border-t border-gray-100 bg-white flex-shrink-0">
          {sendEmail && (
            <button
              onClick={() => handleSend('email', sendEmail)}
              disabled={sending !== null}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-navy-900 text-white text-sm font-semibold hover:opacity-90 disabled:opacity-50 transition"
            >
              {sending === 'email' ? <Spin /> : <Mail className="w-4 h-4" />}
              {sending === 'email' ? TEXT.sending : TEXT.send_email}
            </button>
          )}

          {sendWhatsApp && (
            <button
              onClick={() => handleSend('whatsapp', sendWhatsApp)}
              disabled={sending !== null || !whatsappAvailable}
              title={!whatsappAvailable ? TEXT.no_phone : undefined}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-green-500 text-white text-sm font-semibold hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {sending === 'whatsapp' ? <Spin /> : <WhatsAppIcon className="w-4 h-4" />}
              {sending === 'whatsapp' ? TEXT.sending : TEXT.send_whatsapp}
            </button>
          )}

          {pdfUrl && (
            <a
              href={pdfUrl}
              download={`${String(title).replace(/\s+/g, '_')}.pdf`}
              className="sm:ml-auto inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition"
            >
              <Download className="w-4 h-4" /> {TEXT.download}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

export default PdfPreviewModal
