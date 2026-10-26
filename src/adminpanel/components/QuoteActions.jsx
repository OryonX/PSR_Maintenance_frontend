import React, { useState } from 'react'
import { Download, Send, AlertTriangle } from 'lucide-react'
import Modal from '../../ui/Modal.jsx'
import Button from '../../ui/Button.jsx'
import { quotesApi } from '../lib/endpoints.js'
import { quoteErrorMessage } from '../lib/billing.js'

// Send is offered on drafts and Resend on sent quotes; accepted/rejected/
// expired quotes don't show it (the backend would allow it from any status).
export const quoteSendLabel = (quote) =>
  quote.status === 'draft' ? 'Send' : quote.status === 'sent' ? 'Resend' : null

// Same rule as QuoteController::send — a fixed amount or a complete range.
export const quoteHasPrice = (quote) =>
  quote.amount_fixed != null || (quote.amount_min != null && quote.amount_max != null)

/** "Sent 26 Oct 2026" or null. */
export const quoteSentLabel = (quote) =>
  quote.sent_at
    ? `Sent ${new Date(quote.sent_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}`
    : null

/**
 * Send/Resend (with confirmation) and PDF download for quotes, shared by the
 * list and the detail page. onDone() runs after a successful send.
 */
export function useQuoteActions({ label, onDone, onError }) {
  const [target, setTarget] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [pdfBusyId, setPdfBusyId] = useState(null)

  const openSend = (quote) => { setError(null); setTarget(quote) }
  const close = () => { if (!busy) setTarget(null) }

  const pdf = async (quote) => {
    setPdfBusyId(quote.id)
    try {
      await quotesApi.downloadPdf(quote)
    } catch (err) {
      onError?.(`Couldn't download the PDF: ${quoteErrorMessage(err)}`)
    } finally {
      setPdfBusyId(null)
    }
  }

  const confirm = async () => {
    setBusy(true)
    setError(null)
    try {
      const updated = await quotesApi.send(target.id)
      setTarget(null)
      await onDone?.(updated)
    } catch (err) {
      setError(quoteErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  // Known up front from the quote itself, so warn before the round trip.
  // The 422s from the backend still cover anything that changed meanwhile.
  const email = target?.lead?.email
  // Only flag a missing email when the lead is actually loaded on the quote.
  const missingEmail = Boolean(target?.lead) && !email
  const missingPrice = Boolean(target) && !quoteHasPrice(target)
  const verb = target ? quoteSendLabel(target) || 'Send' : 'Send'

  const modals = (
    <Modal open={Boolean(target)} onClose={close} title={`${verb} ${label('quote').toLowerCase()}`}>
      {target && (
        <div className="space-y-4">
          <p className="text-sm text-navy-900">
            {email
              ? <>{verb} <strong>{target.quote_number}</strong> to <strong>{email}</strong>?</>
              : <>{verb} <strong>{target.quote_number}</strong>?</>}
          </p>
          <p className="text-xs text-gray-400">The customer receives an email with the quote attached as a PDF.</p>

          {(missingPrice || missingEmail) && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-3.5 py-3">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div className="space-y-1">
                {missingPrice && <p>Set a price or an estimate before sending this quote (a fixed amount, or both min and max).</p>}
                {missingEmail && <p>This lead has no email address — add one before sending.</p>}
              </div>
            </div>
          )}

          {error && <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={close}>Cancel</Button>
            <Button type="button" onClick={confirm} disabled={busy || missingPrice || missingEmail}>
              <Send className="w-4 h-4" /> {busy ? 'Sending…' : verb}
            </Button>
          </div>
        </div>
      )}
    </Modal>
  )

  return { openSend, pdf, pdfBusyId, modals }
}

const ICON_BTN = 'p-1.5 rounded-lg text-gray-400 transition-colors disabled:opacity-40'

/** Row icons: Download PDF (any status) + Send/Resend (draft/sent). */
export function QuoteRowActions({ quote, actions }) {
  const handle = (fn) => (e) => { e.stopPropagation(); fn() }
  const sendLabel = quoteSendLabel(quote)

  return (
    <div className="flex items-center gap-0.5">
      <button title="Download PDF" className={`${ICON_BTN} hover:text-navy-900 hover:bg-gray-100`} disabled={actions.pdfBusyId === quote.id} onClick={handle(() => actions.pdf(quote))}>
        <Download className="w-4 h-4" />
      </button>
      {sendLabel && (
        <button title={sendLabel} className={`${ICON_BTN} hover:text-blue-600 hover:bg-blue-50`} onClick={handle(() => actions.openSend(quote))}>
          <Send className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
