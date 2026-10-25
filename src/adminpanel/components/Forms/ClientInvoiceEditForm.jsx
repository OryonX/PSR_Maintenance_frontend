import React, { useState } from 'react'
import Input from '../../../ui/Input.jsx'
import Button from '../../../ui/Button.jsx'
import { clientInvoicesApi } from '../../lib/endpoints.js'
import { BILL_TO_FIELDS, FIELD_LABELS, fieldErrors, invoiceErrorMessage, toDateInput } from '../../lib/billing.js'

// Same fallback as ClientInvoiceController::resolveBillTo — the client's
// billing details (plus contact), or the job's lead/address with no client.
function derivedBillTo(invoice) {
  const client = invoice.client
  if (client) {
    const d = client.billing_details || {}
    return {
      ...Object.fromEntries(BILL_TO_FIELDS.map((k) => [k, d[k] ?? null])),
      legal_name: d.legal_name ?? client.name,
      email: client.email,
      phone: client.phone
    }
  }
  const job = invoice.trade_job
  return { legal_name: job?.lead?.name, address_line1: job?.address, postcode: job?.postcode, email: job?.lead?.email, phone: job?.lead?.phone }
}

// Draft-only edit. Without "override", bill_to stays null and the backend
// resolves it from the live client data at send time; with it, what's typed
// here is what gets frozen on the invoice.
function ClientInvoiceEditForm({ invoice, onSubmit, onCancel }) {
  const initialBillTo = invoice.bill_to || derivedBillTo(invoice)
  const [form, setForm] = useState({
    amount: invoice.amount ?? '',
    vat_rate: invoice.vat_rate ?? '',
    due_date: toDateInput(invoice.due_date),
    payment_method: invoice.payment_method ?? ''
  })
  const [billTo, setBillTo] = useState(Object.fromEntries(BILL_TO_FIELDS.map((k) => [k, initialBillTo?.[k] ?? ''])))
  const [override, setOverride] = useState(Boolean(invoice.bill_to))
  const [showBillTo, setShowBillTo] = useState(Boolean(invoice.bill_to))
  const [errors, setErrors] = useState({})
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    const body = {
      vat_rate: form.vat_rate === '' ? null : Number(form.vat_rate),
      due_date: form.due_date || null,
      payment_method: String(form.payment_method).trim() || null
    }
    if (form.amount !== '') body.amount = Number(form.amount)
    if (override) {
      body.bill_to = Object.fromEntries(BILL_TO_FIELDS.map((k) => [k, String(billTo[k] ?? '').trim() || null]))
    } else if (invoice.bill_to) {
      body.bill_to = null
    }

    setSubmitting(true)
    try {
      const updated = await clientInvoicesApi.update(invoice.id, body)
      await onSubmit(updated)
    } catch (err) {
      setErrors(fieldErrors(err))
      setError(invoiceErrorMessage(err))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input id="amount" label="Amount (£)" type="number" min="0" step="0.01" value={form.amount} onChange={(e) => update('amount', e.target.value)} error={errors.amount} />
        <Input id="vat_rate" label="VAT (%)" type="number" min="0" max="100" step="0.01" placeholder="20" value={form.vat_rate} onChange={(e) => update('vat_rate', e.target.value)} error={errors.vat_rate} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input id="due_date" label="Due date" type="date" value={form.due_date} onChange={(e) => update('due_date', e.target.value)} error={errors.due_date} />
        <Input
          id="payment_method"
          label="Payment method"
          list="edit-invoice-payment-methods"
          maxLength={50}
          placeholder="bank_transfer, card…"
          value={form.payment_method}
          onChange={(e) => update('payment_method', e.target.value)}
          error={errors.payment_method}
        />
        <datalist id="edit-invoice-payment-methods">
          <option value="bank_transfer" />
          <option value="card" />
          <option value="cash" />
        </datalist>
      </div>

      <div className="border border-gray-200 rounded-lg">
        <button
          type="button"
          onClick={() => setShowBillTo((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-navy-900"
        >
          Recipient details
          <span className="text-gray-400">{showBillTo ? '−' : '+'}</span>
        </button>
        {showBillTo && (
          <div className="px-4 pb-4 pt-3 space-y-3 border-t border-gray-100">
            <label className="flex items-start gap-2 text-sm text-navy-900 cursor-pointer">
              <input type="checkbox" className="mt-0.5" checked={override} onChange={(e) => setOverride(e.target.checked)} />
              <span>
                Use these details instead of the client's
                <span className="block text-xs text-gray-400">For individuals or clients without billing details. Unticked, the client's current details are used when sending.</span>
              </span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              {BILL_TO_FIELDS.map((key) => (
                <Input
                  key={key}
                  id={`bill_to_${key}`}
                  label={FIELD_LABELS[key]}
                  type={key === 'email' ? 'email' : 'text'}
                  className={key === 'legal_name' || key === 'address_line1' ? 'col-span-2' : ''}
                  value={billTo[key]}
                  disabled={!override}
                  onChange={(e) => setBillTo((prev) => ({ ...prev, [key]: e.target.value }))}
                  error={errors[`bill_to.${key}`]}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save'}</Button>
      </div>
    </form>
  )
}

export default ClientInvoiceEditForm
