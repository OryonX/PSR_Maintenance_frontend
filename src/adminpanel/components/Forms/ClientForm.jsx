import React, { useState } from 'react'
import Input from '../../../ui/Input.jsx'
import Select from '../../../ui/Select.jsx'
import Button from '../../../ui/Button.jsx'
import { clientsApi } from '../../lib/endpoints.js'
import { CLIENT_STATUSES } from '../../lib/constants.js'
import { BILLING_DETAILS_FIELDS, FIELD_LABELS, fieldErrors, fieldList } from '../../lib/billing.js'

const toBilling = (client) =>
  Object.fromEntries(BILLING_DETAILS_FIELDS.map((k) => [k, client?.billing_details?.[k] ?? '']))

// Create (no `client`) or edit (`client` given). Billing details are optional,
// but an invoice can't be sent until legal_name, address_line1 and postcode
// are filled. On edit only the changed billing keys are sent — the backend
// merges billing_details key by key, and a key sent as null is cleared.
function ClientForm({ client, onSubmit, onCancel }) {
  const isEdit = Boolean(client)
  const [form, setForm] = useState({
    name: client?.name ?? '',
    company: client?.company ?? '',
    email: client?.email ?? '',
    phone: client?.phone ?? '',
    status: client?.status ?? 'active',
    language: client?.language ?? 'en'
  })
  const [billing, setBilling] = useState(toBilling(client))
  const missing = client?.billing_details_missing ?? []
  const [showBilling, setShowBilling] = useState(isEdit)
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
    if (isEdit && !form.email.trim() && client.email) { setErrors({ email: "Email can't be removed once set." }); return }

    const original = toBilling(client)
    const billingDetails = Object.fromEntries(
      BILLING_DETAILS_FIELDS
        .filter((k) => billing[k].trim() !== String(original[k]).trim())
        .map((k) => [k, billing[k].trim() || null])
        .filter(([, v]) => isEdit || v !== null)
    )

    const body = {
      name: form.name.trim(),
      company: form.company.trim() || null,
      phone: form.phone.trim() || null,
      ...(form.email.trim() ? { email: form.email.trim() } : (isEdit ? {} : { email: null })),
      ...(isEdit ? { status: form.status, language: form.language } : {}),
      ...(Object.keys(billingDetails).length > 0 ? { billing_details: billingDetails } : {})
    }

    setSubmitting(true)
    try {
      const saved = isEdit ? await clientsApi.update(client.id, body) : await clientsApi.create(body)
      await onSubmit(saved)
    } catch (err) {
      setErrors(fieldErrors(err))
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
      {isEdit && (
        <div className="grid grid-cols-2 gap-3">
          <Select
            id="status"
            label="Status"
            value={form.status}
            onChange={(e) => update('status', e.target.value)}
            options={CLIENT_STATUSES.map((s) => ({ value: s, label: s }))}
            error={errors.status}
          />
          <Select
            id="language"
            label="Language"
            value={form.language}
            onChange={(e) => update('language', e.target.value)}
            options={[{ value: 'en', label: 'English' }, { value: 'es', label: 'Español' }]}
            error={errors.language}
          />
        </div>
      )}

      <div className="border border-gray-200 rounded-lg">
        <button
          type="button"
          onClick={() => setShowBilling((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-navy-900"
        >
          Billing details{isEdit ? '' : ' (optional)'}
          <span className="text-gray-400">{showBilling ? '−' : '+'}</span>
        </button>
        {showBilling && (
          <div className="px-4 pb-4 pt-3 space-y-3 border-t border-gray-100">
            {missing.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-lg px-3 py-2">
                Needed before this client can be invoiced: {fieldList(missing)}
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              {BILLING_DETAILS_FIELDS.map((key) => (
                <Input
                  key={key}
                  id={`billing_${key}`}
                  label={FIELD_LABELS[key]}
                  className={key === 'legal_name' || key === 'address_line1' ? 'col-span-2' : ''}
                  value={billing[key]}
                  onChange={(e) => setBilling((prev) => ({ ...prev, [key]: e.target.value }))}
                  error={errors[`billing_details.${key}`]}
                />
              ))}
            </div>
            {missing.length === 0 && (
              <p className="text-xs text-gray-400">Legal name, address line 1 and postcode are needed before an invoice can be sent.</p>
            )}
          </div>
        )}
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={submitting}>
          {submitting ? (isEdit ? 'Saving…' : 'Creating…') : (isEdit ? 'Save' : 'Create')}
        </Button>
      </div>
    </form>
  )
}

export default ClientForm
