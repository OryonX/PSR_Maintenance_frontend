import React, { useState } from 'react'
import Input from '../../../ui/Input.jsx'
import Select from '../../../ui/Select.jsx'
import Button from '../../../ui/Button.jsx'
import { clientInvoicesApi } from '../../lib/endpoints.js'

function jobLabel(job) {
  const quote = job.quote?.amount_fixed ?? job.quote?.amount_max ?? job.quote?.amount_min
  return [
    `#${job.id}`,
    job.lead?.name,
    job.scheduled_date ? String(job.scheduled_date).slice(0, 10) : null,
    quote != null ? `£${Number(quote).toLocaleString()}` : null
  ].filter(Boolean).join(' · ')
}

// ClientInvoiceController::store — only trade_job_id is required. amount falls
// back to the linked quote (fixed → max → min); with no quote amount the
// backend answers 422 { error: 'amount_required' }.
function ClientInvoiceForm({ tradeJobs, clients, invoicedJobIds, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    trade_job_id: '',
    client_id: '',
    amount: '',
    vat_rate: '',
    due_date: '',
    payment_method: ''
  })
  const [errors, setErrors] = useState({})
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  // A trade job takes a single invoice.
  const availableJobs = (tradeJobs || []).filter((job) => !invoicedJobIds?.has(String(job.id)))

  const update = (key, value) => {
    setForm((prev) => {
      const next = { ...prev, [key]: value }
      // Preselect the client when the job's lead has already converted.
      if (key === 'trade_job_id' && !prev.client_id) {
        const clientId = (tradeJobs || []).find((job) => String(job.id) === value)?.lead?.client_id
        if (clientId && (clients || []).some((c) => c.id === clientId)) next.client_id = String(clientId)
      }
      return next
    })
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!form.trade_job_id) { setErrors({ trade_job_id: 'Select a job.' }); return }

    const body = { trade_job_id: Number(form.trade_job_id) }
    if (form.client_id) body.client_id = Number(form.client_id)
    if (form.amount !== '') body.amount = Number(form.amount)
    if (form.vat_rate !== '') body.vat_rate = Number(form.vat_rate)
    if (form.due_date) body.due_date = form.due_date
    if (form.payment_method.trim()) body.payment_method = form.payment_method.trim()

    setSubmitting(true)
    try {
      const invoice = await clientInvoicesApi.create(body)
      await onSubmit(invoice)
    } catch (err) {
      if (err.body?.error === 'amount_required') {
        setErrors({ amount: "The job's quote has no amount — enter one." })
      } else {
        setErrors(err.errors ? Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v[0]])) : {})
        setError(err.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Select
          id="trade_job_id"
          label="Job"
          placeholder={availableJobs.length ? 'Select a job…' : 'No uninvoiced jobs'}
          value={form.trade_job_id}
          onChange={(e) => update('trade_job_id', e.target.value)}
          options={availableJobs.map((job) => ({ value: job.id, label: jobLabel(job) }))}
          error={errors.trade_job_id}
          required
        />
      </div>

      <Select
        id="client_id"
        label="Client (optional)"
        placeholder="No client — bill the job's lead"
        value={form.client_id}
        onChange={(e) => update('client_id', e.target.value)}
        options={(clients || []).map((c) => ({ value: c.id, label: c.company ? `${c.name} (${c.company})` : c.name }))}
        error={errors.client_id}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          id="amount"
          label="Amount (£)"
          type="number"
          min="0"
          step="0.01"
          placeholder="From the quote if empty"
          value={form.amount}
          onChange={(e) => update('amount', e.target.value)}
          error={errors.amount}
        />
        <Input
          id="vat_rate"
          label="VAT (%)"
          type="number"
          min="0"
          max="100"
          step="0.01"
          placeholder="20"
          value={form.vat_rate}
          onChange={(e) => update('vat_rate', e.target.value)}
          error={errors.vat_rate}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Input id="due_date" label="Due date" type="date" value={form.due_date} onChange={(e) => update('due_date', e.target.value)} error={errors.due_date} />
        <Input
          id="payment_method"
          label="Payment method"
          list="client-invoice-payment-methods"
          maxLength={50}
          placeholder="bank_transfer, card…"
          value={form.payment_method}
          onChange={(e) => update('payment_method', e.target.value)}
          error={errors.payment_method}
        />
        <datalist id="client-invoice-payment-methods">
          <option value="bank_transfer" />
          <option value="card" />
          <option value="cash" />
        </datalist>
      </div>

      <p className="text-xs text-gray-400">Created as a draft — review it before sending.</p>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={submitting || availableJobs.length === 0}>{submitting ? 'Creating…' : 'Create'}</Button>
      </div>
    </form>
  )
}

export default ClientInvoiceForm
