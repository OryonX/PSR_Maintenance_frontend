import React, { useState } from 'react'
import Input from '../../../ui/Input.jsx'
import Button from '../../../ui/Button.jsx'
import { useTenantConfig } from '../../hooks/useTenantConfig.js'

const COLOR_OPTIONS = ['#3B82F6', '#F59E0B', '#EF4444', '#10B981', '#8B5CF6', '#06B6D4']

function TeamMemberForm({ initial, onSubmit, onCancel, submitLabel = 'Save' }) {
  const { services } = useTenantConfig()
  const [form, setForm] = useState({
    name: initial?.name || '',
    phone: initial?.phone || '',
    email: initial?.email || '',
    trade_specialties: initial?.trade_specialties || [],
    color_code: initial?.color_code || COLOR_OPTIONS[0],
    is_active: initial?.is_active ?? true
  })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  const toggleSpecialty = (key) => {
    setForm((prev) => ({
      ...prev,
      trade_specialties: prev.trade_specialties.includes(key)
        ? prev.trade_specialties.filter((s) => s !== key)
        : [...prev.trade_specialties, key]
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (form.trade_specialties.length === 0) {
      setError('Select at least one specialty.')
      return
    }

    setSubmitting(true)
    try {
      await onSubmit(form)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input id="tm_name" label="Name" value={form.name} onChange={(e) => update('name', e.target.value)} required />
      <div className="grid grid-cols-2 gap-3">
        <Input id="tm_phone" label="Phone" value={form.phone} onChange={(e) => update('phone', e.target.value)} />
        <Input id="tm_email" label="Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} />
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-900 mb-1.5">Specialties</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(services).map(([key, meta]) => (
            <button
              key={key}
              type="button"
              onClick={() => toggleSpecialty(key)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                form.trade_specialties.includes(key) ? 'text-white border-transparent' : 'border-gray-200 text-gray-600'
              }`}
              style={form.trade_specialties.includes(key) ? { backgroundColor: meta.color } : undefined}
            >
              {meta.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-900 mb-1.5">Colour</label>
        <div className="flex gap-2">
          {COLOR_OPTIONS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => update('color_code', color)}
              className={`w-7 h-7 rounded-full ${form.color_code === color ? 'ring-2 ring-offset-2 ring-navy-900' : ''}`}
              style={{ backgroundColor: color }}
              aria-label={color}
            />
          ))}
        </div>
      </div>

      <label className="flex items-center gap-2 text-sm text-navy-900">
        <input type="checkbox" checked={form.is_active} onChange={(e) => update('is_active', e.target.checked)} className="rounded" />
        Active
      </label>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={submitting}>{submitting ? 'Saving…' : submitLabel}</Button>
      </div>
    </form>
  )
}

export default TeamMemberForm
