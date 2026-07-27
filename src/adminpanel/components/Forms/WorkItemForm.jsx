import React, { useState } from 'react'
import Input from '../../../ui/Input.jsx'
import Select from '../../../ui/Select.jsx'
import Button from '../../../ui/Button.jsx'
import { tradeJobsApi } from '../../lib/endpoints.js'

// TradeJobController::store only accepts scheduled_date/scheduled_time_window
// (legacy display fields) — starts_at/ends_at (what the calendar filters on)
// are only ever set via the reschedule action. This form creates the job
// then immediately reschedules it so it's visible on both Kanban and Calendar.
function WorkItemForm({ leads, quotes, teamMembers, onSubmit, onCancel }) {
  const [form, setForm] = useState({
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    if (!form.lead_id) { setError('Select a lead.'); return }

    setSubmitting(true)
    try {
      const job = await tradeJobsApi.create({
        lead_id: form.lead_id,
        quote_id: form.quote_id || null,
        assigned_team_member_id: form.assigned_team_member_id || null,
        address: form.address || null,
        postcode: form.postcode || null,
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
        onChange={(e) => update('lead_id', e.target.value)}
        options={(leads || []).map((l) => ({ value: l.id, label: l.name }))}
        required
      />

      {quotes && quotes.length > 0 && (
        <Select
          id="quote_id"
          label="Linked quote (optional)"
          placeholder="No linked quote"
          value={form.quote_id}
          onChange={(e) => update('quote_id', e.target.value)}
          options={quotes.map((q) => ({ value: q.id, label: q.quote_number }))}
        />
      )}

      <Select
        id="assigned_team_member_id"
        label="Assign to"
        placeholder="Unassigned"
        value={form.assigned_team_member_id}
        onChange={(e) => update('assigned_team_member_id', e.target.value)}
        options={(teamMembers || []).map((t) => ({ value: t.id, label: t.name }))}
      />

      <div className="grid grid-cols-2 gap-3">
        <Input id="address" label="Address" value={form.address} onChange={(e) => update('address', e.target.value)} />
        <Input id="postcode" label="Postcode" value={form.postcode} onChange={(e) => update('postcode', e.target.value)} />
      </div>

      <Input id="date" label="Date" type="date" value={form.date} onChange={(e) => update('date', e.target.value)} />
      <div className="grid grid-cols-2 gap-3">
        <Input id="startTime" label="Start time" type="time" value={form.startTime} onChange={(e) => update('startTime', e.target.value)} />
        <Input id="endTime" label="End time" type="time" value={form.endTime} onChange={(e) => update('endTime', e.target.value)} />
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex justify-end gap-3 pt-2">
        {onCancel && <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>}
        <Button type="submit" disabled={submitting}>{submitting ? 'Creating…' : 'Create'}</Button>
      </div>
    </form>
  )
}

export default WorkItemForm
