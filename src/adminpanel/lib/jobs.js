// Display helpers for trade jobs ("work items").
//
// Title resolution, first match wins:
//   1. job.details.title — the job's own name (TradeJobController accepts
//      details.title on store/update and merges details on update);
//   2. lead.project_name — older fallback, shared by every job of the lead;
//   3. the lead's service type, with the vertical's label.

const humanize = (value) => String(value).replace(/_/g, ' ').replace(/^\w/, (c) => c.toUpperCase())

/** "Plumbing repair" — what the job is about, or null when nothing is known. */
export function jobDescription(job, serviceInfo) {
  const ownTitle = job?.details?.title?.trim()
  if (ownTitle) return ownTitle

  const projectName = job?.lead?.project_name?.trim()
  if (projectName) return projectName

  const serviceType = job?.lead?.details?.service_type
  if (!serviceType) return null
  return serviceInfo?.(serviceType)?.label || humanize(serviceType)
}

/** "Plumbing repair for Jose" · "Jose" · "Job #12" */
export function jobTitle(job, serviceInfo) {
  const description = jobDescription(job, serviceInfo)
  const name = job?.lead?.name
  if (description && name) return `${description} for ${name}`
  return description || name || `Job #${job?.id}`
}

/** "12 Oct, 09:00" · "12 Oct · 09:00-11:00" · "Unscheduled" */
export function jobWhen(job) {
  if (job?.starts_at) {
    return new Date(job.starts_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  }
  if (job?.scheduled_date) {
    const day = new Date(job.scheduled_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    return job.scheduled_time_window ? `${day} · ${job.scheduled_time_window}` : day
  }
  return 'Unscheduled'
}
