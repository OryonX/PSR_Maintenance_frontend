import React, { useState } from 'react'
import Input from '../../../ui/Input.jsx'
import Select from '../../../ui/Select.jsx'
import Button from '../../../ui/Button.jsx'
import { leadsApi } from '../../lib/endpoints.js'
import { LEAD_STATUSES } from '../../lib/constants.js'
import { fieldErrors } from '../../lib/billing.js'

const CHANNELS = ['form', 'chatbot', 'whatsapp', 'phone', 'manual', 'instagram_ads', 'tiktok_ads']
const PRIORITIES = ['low', 'medium', 'high']

// LeadController@update only accepts these keys and drops nulls, so they
// can be changed but not cleared. Status and notes have their own endpoints.
const PATCH_FIELDS = ['priority', 'channel', 'category', 'project_name']

// Not accepted by PATCH /api/leads/{id} (they'd be silently ignored), so
// they're shown read-only.
const READONLY_FIELDS = [['name', 'Name'], ['company', 'Company'], ['email', 'Email'], ['phone', 'Phone'], ['language', 'Language'], ['challenge', 'Challenge']]

const toForm = (lead) => ({
  status: lead.status ?? 'new',
  priority: lead.priority ?? '',
  channel: lead.channel ?? '',
  category: lead.category ?? '',
  project_name: lead.project_name ?? '',
  notes: lead.notes ?? ''
})

function LeadEditForm({ lead, onSubmit, onCancel }) {
  const [form, setForm] = useState(toForm(lead))
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
    const original = toForm(lead)

    const patch = {}
    const clearErrors = {}
    for (const key of PATCH_FIELDS) {
      const value = String(form[key]).trim()
      if (value === String(original[key]).trim()) continue
      if (!value) { clearErrors[key] = "This field can't be cleared."; continue }
      patch[key] = value
    }
    if (Object.keys(clearErrors).length > 0) { setErrors(clearErrors); return }

    const statusChanged = form.status !== original.status
    const notesChanged = form.notes !== original.notes

    setSubmitting(true)
    try {
      let updated = lead
      if (Object.keys(patch).length > 0) updated = await leadsApi.update(lead.id, patch)
      if (statusChanged) updated = await leadsApi.updateStatus(lead.id, form.status)
      if (notesChanged) updated = await leadsApi.updateNotes(lead.id, form.notes || null)
      await onSubmit(updated)
    } catch (err) {
      setErrors(fieldErrors(err))
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  const channelOptions = [...CHANNELS, ...(lead.channel && !CHANNELS.includes(lead.channel) ? [lead.channel] : [])]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-gray-50 border border-gray-100 rounded-lg p-3.5">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-sm">
          {READONLY_FIELDS.map(([key, text]) => (
            <div key={key} className={key === 'challenge' ? 'col-span-2' : ''}>
              <dt className="text-gray-400 text-xs uppercase tracking-wide">{text}</dt>
              <dd className="text-navy-900 break-words">{lead[key] || '—'}</dd>
            </div>
          ))}
        </dl>
        <p className="text-xs text-gray-400 mt-3">Contact details can't be edited from the panel yet.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Select id="status" label="Status" value={form.status} onChange={(e) => update('status', e.target.value)}
          options={LEAD_STATUSES.map((s) => ({ value: s, label: s }))} error={errors.status} />
        <Select id="priority" label="Priority" value={form.priority} onChange={(e) => update('priority', e.target.value)}
          placeholder={lead.priority ? undefined : '—'}
          options={PRIORITIES.map((p) => ({ value: p, label: p }))} error={errors.priority} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Select id="channel" label="Channel" value={form.channel} onChange={(e) => update('channel', e.target.value)}
          placeholder={lead.channel ? undefined : '—'}
          options={channelOptions.map((c) => ({ value: c, label: c.replace(/_/g, ' ') }))} error={errors.channel} />
        <Input id="category" label="Category" maxLength={100} value={form.category} onChange={(e) => update('category', e.target.value)} error={errors.category} />
      </div>
      <Input id="project_name" label="Project" maxLength={255} value={form.project_name} onChange={(e) => update('project_name', e.target.value)} error={errors.project_name} />
      <div>
        <label htmlFor="notes" className="block text-sm font-medium text-navy-900 mb-1.5">Notes</label>
        <textarea
          id="notes"
          rows={3}
          value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-900/10 transition-colors resize-none"
        />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : 'Save'}</Button>
      </div>
    </form>
  )
}

export default LeadEditForm
