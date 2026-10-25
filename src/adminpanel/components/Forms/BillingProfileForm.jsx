import React, { useState, useEffect } from 'react'
import { CheckCircle2, AlertTriangle } from 'lucide-react'
import Input from '../../../ui/Input.jsx'
import Button from '../../../ui/Button.jsx'
import Card from '../../../ui/Card.jsx'
import Spinner from '../../../ui/Spinner.jsx'
import { billingProfileApi } from '../../lib/endpoints.js'
import { BILLING_PROFILE_SECTIONS, FIELD_LABELS, fieldErrors, fieldList } from '../../lib/billing.js'

const ALL_FIELDS = Object.values(BILLING_PROFILE_SECTIONS).flat()
const WIDE_FIELDS = new Set(['legal_name', 'address_line1', 'account_name', 'iban', 'footer_notes'])
const LOCKED_HINT = 'Managed by OryonX once the sending domain is verified'

const toForm = (profile) => Object.fromEntries(ALL_FIELDS.map((k) => [k, profile?.[k] ?? '']))

// The organisation's own fiscal data — issuer on every invoice PDF/email.
function BillingProfileForm() {
  const [data, setData] = useState(null)
  const [form, setForm] = useState(toForm(null))
  const [loadError, setLoadError] = useState(null)
  const [errors, setErrors] = useState({})
  const [notice, setNotice] = useState(null) // { tone, text }
  const [saving, setSaving] = useState(false)

  const load = () =>
    billingProfileApi.get()
      .then((d) => { setData(d); setForm(toForm(d.billing_profile)) })
      .catch(setLoadError)

  useEffect(() => { load() }, [])

  const locked = Boolean(data?.from_email_locked)

  const update = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setNotice(null)

    // PUT is a partial merge: send only what changed, empty → null (clears).
    // A locked from_email is never sent — the backend rejects any change.
    const original = toForm(data.billing_profile)
    const body = Object.fromEntries(
      ALL_FIELDS
        .filter((k) => !(k === 'from_email' && locked))
        .filter((k) => String(form[k]).trim() !== String(original[k]).trim())
        .map((k) => {
          const v = String(form[k]).trim()
          if (!v) return [k, null]
          return [k, k === 'payment_terms_days' ? Number(v) : v]
        })
    )

    if (Object.keys(body).length === 0) { setNotice({ tone: 'info', text: 'Nothing to save.' }); return }

    setSaving(true)
    setErrors({})
    try {
      await billingProfileApi.update(body)
      await load()
      setNotice({ tone: 'success', text: 'Billing details saved.' })
    } catch (err) {
      setErrors(fieldErrors(err))
      setNotice({ tone: 'error', text: err.message })
    } finally {
      setSaving(false)
    }
  }

  if (loadError) return <Card><p className="text-sm text-red-500">Couldn't load the billing details: {loadError.message}</p></Card>
  if (!data) return <Spinner />

  const renderField = (key) => {
    const isLocked = key === 'from_email' && locked
    const required = data.missing?.includes(key)
    const label = `${FIELD_LABELS[key]}${required ? ' *' : ''}`

    if (key === 'footer_notes') {
      return (
        <div key={key} className="sm:col-span-2">
          <label htmlFor={key} className="block text-sm font-medium text-navy-900 mb-1.5">{label}</label>
          <textarea
            id={key}
            rows={3}
            maxLength={1000}
            value={form[key]}
            onChange={(e) => update(key, e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-lg border border-gray-200 text-sm focus:border-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-900/10 transition-colors resize-none"
          />
          {errors[key] && <p className="text-red-500 text-xs mt-1">{errors[key]}</p>}
        </div>
      )
    }

    return (
      // Disabled inputs swallow pointer events, so the tooltip lives on the wrapper.
      <div key={key} className={WIDE_FIELDS.has(key) ? 'sm:col-span-2' : ''} title={isLocked ? LOCKED_HINT : undefined}>
        <Input
          id={key}
          label={label}
          type={key === 'payment_terms_days' ? 'number' : (key === 'from_email' || key === 'reply_to') ? 'email' : 'text'}
          {...(key === 'payment_terms_days' ? { min: 0, max: 365 } : {})}
          {...(key === 'sort_code' ? { placeholder: '12-34-56' } : {})}
          value={form[key]}
          disabled={isLocked}
          onChange={(e) => update(key, e.target.value)}
          error={errors[key]}
        />
        {isLocked && <p className="text-xs text-gray-400 mt-1">{LOCKED_HINT}</p>}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {data.complete ? (
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" /> Billing profile complete — invoices can be sent.
        </div>
      ) : (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 text-amber-800 text-sm rounded-lg px-4 py-3">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" /> Missing before invoices can be sent: {fieldList(data.missing)}
        </div>
      )}

      {Object.entries(BILLING_PROFILE_SECTIONS).map(([section, fields]) => (
        <Card key={section} title={section}>
          <div className="grid sm:grid-cols-2 gap-4">{fields.map(renderField)}</div>
        </Card>
      ))}

      {notice && (
        <p className={`text-sm ${notice.tone === 'success' ? 'text-green-700' : notice.tone === 'error' ? 'text-red-500' : 'text-gray-500'}`}>
          {notice.text}
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save'}</Button>
      </div>
    </form>
  )
}

export default BillingProfileForm
