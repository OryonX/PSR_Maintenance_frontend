import React, { useState } from 'react'
import Input from '../../../ui/Input.jsx'
import Button from '../../../ui/Button.jsx'
import { clientInvoicesApi } from '../../lib/endpoints.js'
import { BILL_TO_FIELDS, FIELD_LABELS, fieldErrors, formatGBP, invoiceErrorMessage, toDateInput } from '../../lib/billing.js'
import { computeTotals, deserializeLines, serializeLines, totalsFromGross } from '../../lib/lineItems.js'
import { useTenantConfig } from '../../hooks/useTenantConfig.js'
import LineItemsEditor, { validateLines } from './LineItemsEditor.jsx'

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
  const { serviceInfo } = useTenantConfig()
  const [lines, setLines] = useState(() => deserializeLines(invoice.line_items))
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
    // amount_net is `sometimes|numeric` (can't be null), so it's always sent
    // alongside amount to keep the PDF totals consistent.
    if (lines.length > 0) {
      const linesError = validateLines(lines)
      if (linesError) { setErrors({ lines: linesError }); return }
      const totals = computeTotals(lines, form.vat_rate)
      Object.assign(body, {
        line_items: serializeLines(lines),
        amount: totals.gross,
        amount_net: totals.net,
        vat_amount: form.vat_rate === '' ? null : totals.vat
      })
    } else {
      if (invoice.line_items?.length) body.line_items = null
      if (form.amount !== '') {
        const manual = totalsFromGross(form.amount, form.vat_rate)
        Object.assign(body, {
          amount: manual.gross,
          amount_net: manual.net,
          vat_amount: form.vat_rate === '' ? null : manual.vat
        })
      }
    }
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
      <div>
        <p className="block text-sm font-medium text-navy-900 mb-1.5">Lines</p>
        <LineItemsEditor
          lines={lines}
          onChange={(next) => { setLines(next); if (errors.lines) setErrors((prev) => ({ ...prev, lines: undefined })) }}
          vatRate={form.vat_rate}
          serviceInfo={serviceInfo}
          error={errors.lines}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        {lines.length === 0 ? (
          <Input id="amount" label="Amount (£)" type="number" min="0" step="0.01" value={form.amount} onChange={(e) => update('amount', e.target.value)} error={errors.amount} />
        ) : (
          <div>
            <p className="block text-sm font-medium text-navy-900 mb-1.5">Amount (£)</p>
            <p className="px-3.5 py-2.5 rounded-lg border border-gray-100 bg-gray-50 text-sm text-navy-900">{formatGBP(computeTotals(lines, form.vat_rate).gross)} <span className="text-gray-400">· from lines</span></p>
          </div>
        )}
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
