import React, { useState } from 'react'
import Input from '../../../ui/Input.jsx'
import Button from '../../../ui/Button.jsx'
import { clientsApi } from '../../lib/endpoints.js'

// Same keys as Client::BILLING_DETAILS_FIELDS. Optional here, but an invoice
// can't be sent until legal_name, address_line1 and postcode are filled.
const BILLING_FIELDS = [
  ['legal_name', 'Legal name'],
  ['vat_number', 'VAT number'],
  ['address_line1', 'Address line 1'],
  ['address_line2', 'Address line 2'],
  ['city', 'City'],
  ['postcode', 'Postcode'],
  ['country', 'Country']
]

function ClientForm({ onSubmit, onCancel }) {
  const [form, setForm] = useState({ name: '', company: '', email: '', phone: '' })
  const [billing, setBilling] = useState(Object.fromEntries(BILLING_FIELDS.map(([k]) => [k, ''])))
  const [showBilling, setShowBilling] = useState(false)
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

    const billingDetails = Object.fromEntries(
      Object.entries(billing).map(([k, v]) => [k, v.trim()]).filter(([, v]) => v)
    )

    setSubmitting(true)
    try {
      const client = await clientsApi.create({
        name: form.name.trim(),
        company: form.company.trim() || null,
        email: form.email.trim() || null,
        phone: form.phone.trim() || null,
        ...(Object.keys(billingDetails).length > 0 ? { billing_details: billingDetails } : {})
      })
      await onSubmit(client)
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
      <div className="grid grid-cols-2 gap-3">
        <Input id="email" label="Email" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} error={errors.email} />
        <Input id="phone" label="Phone" type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} error={errors.phone} />
      </div>

      <div className="border border-gray-200 rounded-lg">
        <button
          type="button"
          onClick={() => setShowBilling((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-navy-900"
        >
          Billing details (optional)
          <span className="text-gray-400">{showBilling ? '−' : '+'}</span>
        </button>
        {showBilling && (
          <div className="px-4 pb-4 pt-1 grid grid-cols-2 gap-3 border-t border-gray-100">
            {BILLING_FIELDS.map(([key, text]) => (
              <Input
                key={key}
                id={`billing_${key}`}
                label={text}
                className={key === 'legal_name' || key === 'address_line1' ? 'col-span-2' : ''}
                value={billing[key]}
                onChange={(e) => setBilling((prev) => ({ ...prev, [key]: e.target.value }))}
                error={errors[`billing_details.${key}`]}
              />
            ))}
            <p className="col-span-2 text-xs text-gray-400">Legal name, address line 1 and postcode are needed before an invoice can be sent.</p>
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={submitting}>{submitting ? 'Creating…' : 'Create'}</Button>
      </div>
    </form>
  )
}

export default ClientForm
