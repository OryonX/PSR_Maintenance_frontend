import React, { useState } from 'react'
import Input from '../../../ui/Input.jsx'
import Select from '../../../ui/Select.jsx'
import Button from '../../../ui/Button.jsx'

function QuoteForm({ leads, initial, onSubmit, onCancel, submitLabel = 'Save' }) {
  const [amountType, setAmountType] = useState(initial?.amount_fixed ? 'fixed' : 'range')
  const [form, setForm] = useState({
    lead_id: initial?.lead_id || '',
    amount_min: initial?.amount_min ?? '',
    amount_max: initial?.amount_max ?? '',
    amount_fixed: initial?.amount_fixed ?? '',
    notes: initial?.notes || '',
    expires_at: initial?.expires_at ? initial.expires_at.slice(0, 10) : ''
  })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const body = {
      lead_id: form.lead_id || undefined,
      notes: form.notes || null,
      expires_at: form.expires_at || null,
      amount_min: amountType === 'range' ? (form.amount_min || null) : null,
      amount_max: amountType === 'range' ? (form.amount_max || null) : null,
      amount_fixed: amountType === 'fixed' ? (form.amount_fixed || null) : null
    }

    try {
      await onSubmit(body)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!initial && leads && (
        <Select
          id="lead_id"
          label="Lead"
          placeholder="Select a lead…"
          value={form.lead_id}
          onChange={(e) => update('lead_id', e.target.value)}
          options={leads.map((l) => ({ value: l.id, label: l.name }))}
          required
        />
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setAmountType('range')}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border ${amountType === 'range' ? 'bg-navy-900 text-white border-navy-900' : 'border-gray-200 text-gray-600'}`}
        >
          Price range
        </button>
        <button
          type="button"
          onClick={() => setAmountType('fixed')}
          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium border ${amountType === 'fixed' ? 'bg-navy-900 text-white border-navy-900' : 'border-gray-200 text-gray-600'}`}
        >
          Fixed price
        </button>
      </div>

      {amountType === 'range' ? (
        <div className="grid grid-cols-2 gap-3">
          <Input id="amount_min" label="Min (£)" type="number" min="0" value={form.amount_min} onChange={(e) => update('amount_min', e.target.value)} />
          <Input id="amount_max" label="Max (£)" type="number" min="0" value={form.amount_max} onChange={(e) => update('amount_max', e.target.value)} />
        </div>
      ) : (
        <Input id="amount_fixed" label="Amount (£)" type="number" min="0" value={form.amount_fixed} onChange={(e) => update('amount_fixed', e.target.value)} />
      )}

      <Input id="expires_at" label="Expires on" type="date" value={form.expires_at} onChange={(e) => update('expires_at', e.target.value)} />

      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-navy-900 mb-1.5">Notes</label>
        <textarea
          id="notes"
          rows={3}
          value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 focus:border-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-900/10 text-sm"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : submitLabel}</Button>
      </div>
    </form>
  )
}

export default QuoteForm
