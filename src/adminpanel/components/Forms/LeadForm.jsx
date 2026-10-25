import React, { useState } from 'react'
import Input from '../../../ui/Input.jsx'
import Select from '../../../ui/Select.jsx'
import Button from '../../../ui/Button.jsx'
import { leadsApi } from '../../lib/endpoints.js'

// Manual lead from the panel. lead_type=trade_job like the public quote form
// (QuoteFormFooter), so it shows up in the PSR pipeline and trade-jobs metrics;
// channel=manual so it isn't counted as a website form submission.
function LeadForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    priority: 'medium',
    challenge: ''
  })
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

    if (!form.name.trim()) { setErrors({ name: 'Name is required.' }); return }
    if (!form.email.trim() && !form.phone.trim()) { setError('Add an email or a phone number.'); return }

    setSubmitting(true)
    try {
      const res = await leadsApi.create({
        name: form.name.trim(),
        company: form.company.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        priority: form.priority,
        challenge: form.challenge.trim() || null,
        channel: 'manual',
        lead_type: 'trade_job'
      })
      await onSubmit(res?.lead ?? res)
    } catch (err) {
      setErrors(err.errors ? Object.fromEntries(Object.entries(err.errors).map(([k, v]) => [k, v[0]])) : {})
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Input id="name" label="Name" value={form.name} onChange={(e) => update('name', e.target.value)} error={errors.name} required />
        <Input id="company" label="Company (optional)" value={form.company} onChange={(e) => update('company', e.target.value)} error={errors.company} />
      </div>
      <div>
        <div className="grid grid-cols-2 gap-3">
          <Input id="email" label="Email" type="email" placeholder="jose@example.com" value={form.email} onChange={(e) => update('email', e.target.value)} error={errors.email} />
          <Input id="phone" label="Phone" type="tel" placeholder="07700 900123" value={form.phone} onChange={(e) => update('phone', e.target.value)} error={errors.phone} />
        </div>
        <p className="text-gray-400 text-xs mt-1">At least one is required so you can get back to them. Leads are matched by phone or email when they convert.</p>
      </div>
      <Select
        id="priority"
        label="Priority"
        value={form.priority}
        onChange={(e) => update('priority', e.target.value)}
        options={[{ value: 'low', label: 'Low' }, { value: 'medium', label: 'Medium' }, { value: 'high', label: 'High' }]}
        error={errors.priority}
        hint="How urgently to follow up. High = emergencies or customers waiting for a call back."
      />
      <div>
        <label htmlFor="challenge" className="block text-sm font-medium text-navy-900 mb-1.5">
          What do they need? <span className="text-xs font-normal text-gray-400">(recommended)</span>
        </label>
        <textarea
          id="challenge"
          rows={3}
          value={form.challenge}
          onChange={(e) => update('challenge', e.target.value)}
          placeholder="e.g. Leaking pipe under the bathroom sink, started yesterday. Prefers mornings."
          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-900/10 transition-colors resize-none placeholder:text-gray-300"
        />
        <p className="text-gray-400 text-xs mt-1">The request in their words — helps whoever prepares the quote.</p>
      </div>
      <p className="text-xs text-gray-400">
        A lead is someone asking for work. Once they agree, convert them into a customer from the lead's page.
      </p>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={submitting}>{submitting ? 'Creating…' : 'Create'}</Button>
      </div>
    </form>
  )
}

export default LeadForm
