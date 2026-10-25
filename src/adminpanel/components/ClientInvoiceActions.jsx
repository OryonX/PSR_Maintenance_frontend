import React, { useState } from 'react'
import { Download, Send, Pencil, CheckCircle2, Trash2, AlertTriangle } from 'lucide-react'
import Modal from '../../ui/Modal.jsx'
import Button from '../../ui/Button.jsx'
import Select from '../../ui/Select.jsx'
import ClientInvoiceEditForm from './Forms/ClientInvoiceEditForm.jsx'
import { clientInvoicesApi } from '../lib/endpoints.js'
import {
  PAYMENT_METHODS,
  canDeleteInvoice,
  canEditInvoice,
  canMarkInvoiceOverdue,
  canMarkInvoicePaid,
  canSendInvoice,
  invoiceErrorMessage,
  invoiceRecipientEmail
} from '../lib/billing.js'

const CONFIRM = {
  send: { title: 'Send invoice', confirm: 'Send', busy: 'Sending…', variant: 'primary' },
  delete: { title: 'Delete invoice', confirm: 'Delete', busy: 'Deleting…', variant: 'danger' },
  paid: { title: 'Mark as paid', confirm: 'Confirm', busy: 'Saving…', variant: 'primary' },
  overdue: { title: 'Mark as overdue', confirm: 'Mark overdue', busy: 'Saving…', variant: 'danger' }
}

/**
 * Every client-invoice action (PDF, send, edit, mark paid/overdue, delete)
 * with its confirmation modal, shared by the list and the detail page so the
 * status rules and error messages can't drift apart.
 *
 * onDone(type, invoice) runs after a successful action — invoice is the API
 * response (null after a delete).
 */
export function useClientInvoiceActions({ onDone, onError }) {
  const [action, setAction] = useState(null) // { type, invoice }
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('bank_transfer')
  const [pdfBusyId, setPdfBusyId] = useState(null)

  const open = (type, invoice) => {
    setError(null)
    setPaymentMethod(invoice.payment_method || 'bank_transfer')
    setAction({ type, invoice })
  }
  const close = () => { if (!busy) setAction(null) }

  const pdf = async (invoice) => {
    setPdfBusyId(invoice.id)
    try {
      await clientInvoicesApi.downloadPdf(invoice)
    } catch (err) {
      onError?.(`Couldn't download the PDF: ${invoiceErrorMessage(err)}`)
    } finally {
      setPdfBusyId(null)
    }
  }

  const confirm = async () => {
    const { type, invoice } = action
    setBusy(true)
    setError(null)
    try {
      let result = null
      if (type === 'send') result = await clientInvoicesApi.send(invoice.id)
      if (type === 'delete') await clientInvoicesApi.remove(invoice.id)
      if (type === 'paid') result = await clientInvoicesApi.markPaid(invoice.id, { payment_method: paymentMethod })
      if (type === 'overdue') result = await clientInvoicesApi.update(invoice.id, { status: 'overdue' })
      setAction(null)
      await onDone?.(type, result)
    } catch (err) {
      setError(invoiceErrorMessage(err))
    } finally {
      setBusy(false)
    }
  }

  const email = action ? invoiceRecipientEmail(action.invoice) : null
  const meta = action && action.type !== 'edit' ? CONFIRM[action.type] : null

  const modals = (
    <>
      <Modal open={Boolean(meta)} onClose={close} title={meta?.title}>
        {meta && (
          <div className="space-y-4">
            {action.type === 'send' && (
              <p className="text-sm text-navy-900">
                {email
                  ? <>Send <strong>{action.invoice.invoice_number}</strong> to <strong>{email}</strong>?</>
                  : <>Send <strong>{action.invoice.invoice_number}</strong>? The recipient is taken from the client's details.</>}
              </p>
            )}
            {action.type === 'delete' && (
              <p className="text-sm text-navy-900">
                Delete draft <strong>{action.invoice.invoice_number}</strong>? This can't be undone.
              </p>
            )}
            {action.type === 'overdue' && (
              <p className="text-sm text-navy-900">
                Mark <strong>{action.invoice.invoice_number}</strong> as overdue? It can then be re-sent or marked as paid.
              </p>
            )}
            {action.type === 'paid' && (
              <Select
                id="payment_method"
                label="Payment method"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                options={PAYMENT_METHODS.some((m) => m.value === paymentMethod)
                  ? PAYMENT_METHODS
                  : [...PAYMENT_METHODS, { value: paymentMethod, label: paymentMethod }]}
              />
            )}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-3">{error}</div>
            )}
            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" variant="secondary" onClick={close}>Cancel</Button>
              <Button type="button" variant={meta.variant} onClick={confirm} disabled={busy}>
                {busy ? meta.busy : meta.confirm}
              </Button>
            </div>
          </div>
        )}
      </Modal>

      <Modal open={action?.type === 'edit'} onClose={close} title={`Edit ${action?.invoice?.invoice_number ?? 'invoice'}`}>
        {action?.type === 'edit' && (
          <ClientInvoiceEditForm
            invoice={action.invoice}
            onCancel={close}
            onSubmit={async (updated) => { setAction(null); await onDone?.('edit', updated) }}
          />
        )}
      </Modal>
    </>
  )

  return { open, pdf, pdfBusyId, modals }
}

const ICON_BTN = 'p-1.5 rounded-lg text-gray-400 transition-colors disabled:opacity-40'

/** Compact icon buttons for a table row — only the actions the status allows. */
export function ClientInvoiceRowActions({ invoice, actions }) {
  // The row itself navigates to the detail page; buttons must not.
  const handle = (fn) => (e) => { e.stopPropagation(); fn() }

  return (
    <div className="flex items-center gap-0.5">
      <button title="Download PDF" className={`${ICON_BTN} hover:text-navy-900 hover:bg-gray-100`} disabled={actions.pdfBusyId === invoice.id} onClick={handle(() => actions.pdf(invoice))}>
        <Download className="w-4 h-4" />
      </button>
      {canSendInvoice(invoice) && (
        <button title="Send" className={`${ICON_BTN} hover:text-blue-600 hover:bg-blue-50`} onClick={handle(() => actions.open('send', invoice))}>
          <Send className="w-4 h-4" />
        </button>
      )}
      {canEditInvoice(invoice) && (
        <button title="Edit" className={`${ICON_BTN} hover:text-navy-900 hover:bg-gray-100`} onClick={handle(() => actions.open('edit', invoice))}>
          <Pencil className="w-4 h-4" />
        </button>
      )}
      {canMarkInvoicePaid(invoice) && (
        <button title="Mark as paid" className={`${ICON_BTN} hover:text-green-600 hover:bg-green-50`} onClick={handle(() => actions.open('paid', invoice))}>
          <CheckCircle2 className="w-4 h-4" />
        </button>
      )}
      {canDeleteInvoice(invoice) && (
        <button title="Delete" className={`${ICON_BTN} hover:text-red-600 hover:bg-red-50`} onClick={handle(() => actions.open('delete', invoice))}>
          <Trash2 className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

/** Full-width buttons for the detail page sidebar. */
export function ClientInvoiceActionButtons({ invoice, actions }) {
  return (
    <div className="space-y-2">
      <Button variant="secondary" className="w-full" disabled={actions.pdfBusyId === invoice.id} onClick={() => actions.pdf(invoice)}>
        <Download className="w-4 h-4" /> {actions.pdfBusyId === invoice.id ? 'Downloading…' : 'Download PDF'}
      </Button>
      {canSendInvoice(invoice) && (
        <Button className="w-full" onClick={() => actions.open('send', invoice)}>
          <Send className="w-4 h-4" /> Send
        </Button>
      )}
      {canEditInvoice(invoice) && (
        <Button variant="secondary" className="w-full" onClick={() => actions.open('edit', invoice)}>
          <Pencil className="w-4 h-4" /> Edit
        </Button>
      )}
      {canMarkInvoicePaid(invoice) && (
        <Button className="w-full" onClick={() => actions.open('paid', invoice)}>
          <CheckCircle2 className="w-4 h-4" /> Mark as paid
        </Button>
      )}
      {canMarkInvoiceOverdue(invoice) && (
        <Button variant="ghost" className="w-full" onClick={() => actions.open('overdue', invoice)}>
          <AlertTriangle className="w-4 h-4" /> Mark as overdue
        </Button>
      )}
      {canDeleteInvoice(invoice) && (
        <Button variant="danger" className="w-full" onClick={() => actions.open('delete', invoice)}>
          <Trash2 className="w-4 h-4" /> Delete
        </Button>
      )}
    </div>
  )
}
