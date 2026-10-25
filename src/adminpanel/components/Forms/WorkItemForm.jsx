import React, { useState } from 'react'
import Input from '../../../ui/Input.jsx'
import Select from '../../../ui/Select.jsx'
import Button from '../../../ui/Button.jsx'
import { tradeJobsApi } from '../../lib/endpoints.js'
import { formatGBP } from '../../lib/billing.js'

const leadOptionLabel = (lead) => {
  const contact = lead.phone || lead.email
  return contact ? `${lead.name} · ${contact}` : lead.name
}

function quoteOptionLabel(quote) {
  const price = quote.amount_fixed != null
    ? formatGBP(quote.amount_fixed)
    : [quote.amount_min, quote.amount_max].filter((v) => v != null).map(formatGBP).join('–')
  return [quote.quote_number, price || null, quote.status].filter(Boolean).join(' · ')
}

// TradeJobController::store only accepts scheduled_date/scheduled_time_window
// (legacy display fields) — starts_at/ends_at (what the calendar filters on)
// are only ever set via the reschedule action. This form creates the job
// then immediately reschedules it so it's visible on both Kanban and Calendar.
function WorkItemForm({ leads, quotes, teamMembers, onSubmit, onCancel }) {
  const [form, setForm] = useState({
    title: '',
    lead_id: '',
    quote_id: '',
    assigned_team_member_id: '',
    address: '',
    postcode: '',
    date: '',
    startTime: '09:00',
    endTime: '11:00'
  })
  const [error, setError] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const update = (key, value) => setForm((prev) => ({ ...prev, [key]: value }))

  // Only the selected lead's quotes make sense here — accepted ones first.
  const leadQuotes = (quotes || [])
    .filter((q) => form.lead_id && String(q.lead_id) === String(form.lead_id))
    .sort((a, b) => (b.status === 'accepted') - (a.status === 'accepted'))
  // Inactive technicians stay on record but aren't offered for new jobs.
  const activeMembers = (teamMembers || []).filter((t) => t.is_active !== false)

  const handleLeadChange = (value) => {
    const lead = (leads || []).find((l) => String(l.id) === value)
    setForm((prev) => ({
      ...prev,
      lead_id: value,
      quote_id: '',
      // The web quote form stores the postcode on the lead — reuse it.
      postcode: prev.postcode || lead?.details?.postcode || ''
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!form.lead_id) { setError('Select a lead.'); return }
    if (form.date && form.endTime <= form.startTime) { setError('The end time must be after the start time.'); return }

    setSubmitting(true)
    try {
      const job = await tradeJobsApi.create({
        lead_id: form.lead_id,
        quote_id: form.quote_id || null,
        assigned_team_member_id: form.assigned_team_member_id || null,
        address: form.address || null,
        postcode: form.postcode || null,
        ...(form.title.trim() ? { details: { title: form.title.trim() } } : {}),
        scheduled_date: form.date || null,
        scheduled_time_window: form.date ? `${form.startTime}-${form.endTime}` : null
      })

      if (form.date) {
        const startsAt = new Date(`${form.date}T${form.startTime}`)
        const endsAt = new Date(`${form.date}T${form.endTime}`)
        await tradeJobsApi.reschedule(job.id, startsAt.toISOString(), endsAt.toISOString())
      }

      await onSubmit(job)
    } catch (err) {
      setError(err.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        id="lead_id"
        label="Lead"
        placeholder="Select a lead…"
        value={form.lead_id}
        onChange={(e) => handleLeadChange(e.target.value)}
        options={(leads || []).map((l) => ({ value: l.id, label: leadOptionLabel(l) }))}
        hint="The customer this job is for."
        required
      />

      <Input
        id="title"
        label="Title (optional)"
        placeholder="e.g. Boiler service"
        maxLength={255}
        value={form.title}
        onChange={(e) => update('title', e.target.value)}
        hint="Short name shown on the calendar, the board and when invoicing. Empty = based on the requested service."
      />

      {form.lead_id && (
        <Select
          id="quote_id"
          label="Linked quote (optional)"
          placeholder={leadQuotes.length ? 'No linked quote' : 'This lead has no quotes'}
          value={form.quote_id}
          onChange={(e) => update('quote_id', e.target.value)}
          options={leadQuotes.map((q) => ({ value: q.id, label: quoteOptionLabel(q) }))}
          disabled={leadQuotes.length === 0}
          hint="The quote's price becomes the default amount when this job is invoiced. Without one, the service rate is suggested."
        />
      )}

      <Select
        id="assigned_team_member_id"
        label="Technician"
        placeholder="Unassigned"
        value={form.assigned_team_member_id}
        onChange={(e) => update('assigned_team_member_id', e.target.value)}
        options={activeMembers.map((t) => ({ value: t.id, label: t.name }))}
        hint="Who will do the work. Can be left unassigned and set later."
      />

      <div>
        <div className="grid grid-cols-2 gap-3">
          <Input id="address" label="Address" placeholder="12 High Street, Salford" value={form.address} onChange={(e) => update('address', e.target.value)} />
          <Input id="postcode" label="Postcode" placeholder="M5 4WT" value={form.postcode} onChange={(e) => update('postcode', e.target.value)} />
        </div>
        <p className="text-gray-400 text-xs mt-1">Where the work takes place. Also used as the billing address when invoicing a lead who isn't a customer yet.</p>
      </div>

      <Input
        id="date"
        label="Date"
        type="date"
        value={form.date}
        onChange={(e) => update('date', e.target.value)}
        hint="Leave empty to create it unscheduled — it won't show on the calendar until you reschedule it."
      />
      {form.date && (
        <div className="grid grid-cols-2 gap-3">
          <Input id="startTime" label="Start time" type="time" value={form.startTime} onChange={(e) => update('startTime', e.target.value)} />
          <Input id="endTime" label="End time" type="time" value={form.endTime} onChange={(e) => update('endTime', e.target.value)} />
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={submitting}>{submitting ? 'Creating…' : 'Create'}</Button>
      </div>
    </form>
  )
}

export default WorkItemForm
