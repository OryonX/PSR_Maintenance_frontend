// Fixed DB enums — verified against the real validation rules in each
// controller (not the org-configurable ones, which come from tenant-config:
// trade_jobs.status and Lead.pipeline_stage are NOT here, see useTenantConfig).
export const LEAD_STATUSES = ['new', 'contacted', 'qualified', 'converted', 'discarded']
export const QUOTE_STATUSES = ['draft', 'sent', 'accepted', 'rejected', 'expired']
export const CLIENT_INVOICE_STATUSES = ['draft', 'sent', 'paid', 'overdue']
export const CLIENT_STATUSES = ['active', 'inactive', 'churned']

// Lead.pipeline_stage — fixed constant on the Lead model (Lead::TRADE_JOB_STAGES),
// not per-vertical config, but only meaningful when lead_type = 'trade_job'.
export const LEAD_PIPELINE_STAGES = [
  'new_lead', 'quote_sent', 'quote_accepted', 'scheduled',
  'in_progress', 'completed', 'invoiced', 'paid'
]

export const STATUS_TONE = {
  new: 'blue', contacted: 'blue', qualified: 'amber', converted: 'green', discarded: 'grey',
  draft: 'grey', sent: 'blue', accepted: 'green', rejected: 'red', expired: 'grey',
  paid: 'green', overdue: 'red', active: 'green', inactive: 'grey', churned: 'red',
  new_lead: 'blue', quote_sent: 'blue', quote_accepted: 'amber', scheduled: 'blue',
  in_progress: 'amber', completed: 'green', invoiced: 'blue'
}
