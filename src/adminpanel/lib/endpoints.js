// Single source of truth for backend paths — verified against the real
// routes/api.php in DiegoDexx/oryonLabsDB (kebab-case, not the snake_case
// used in the earlier planning drafts). Every admin page calls through here
// instead of hardcoding a path.
import { api } from './api.js'

export const authApi = {
  login: (email, password) => api.post('login', { email, password }),
  logout: () => api.post('logout')
}

export const meApi = {
  profile: () => api.get('me'),
  features: () => api.get('me/features'),
  tenantConfig: () => api.get('me/tenant-config'),
  // Generic, business-model-aware KPIs (MetricsService) — for PSR's
  // business_model=appointment this covers leads/booking/occupancy, but
  // NOT revenue or job-completion counts (that vertical's metric set
  // doesn't include them). See dashboardApi.psrMetrics for those.
  metrics: () => api.get('me/metrics')
}

// PSR-specific dashboard numbers (module:trade_jobs) — revenue, completed
// jobs, avg response time, jobs by service type. Not vertical-generic like
// meApi.metrics; only meaningful for orgs on the trade-jobs flow.
export const dashboardApi = {
  psrMetrics: () => api.get('dashboard/psr-metrics')
}

export const leadsApi = {
  list: (params) => api.get('leads', params),
  get: (id) => api.get(`leads/${id}`),
  update: (id, body) => api.patch(`leads/${id}`, body),
  updateStatus: (id, status) => api.patch(`leads/${id}/status`, { status }),
  updateNotes: (id, notes) => api.patch(`leads/${id}/notes`, { notes }),
  updateStage: (id, stage) => api.patch(`leads/${id}/stage`, { stage }),
  convert: (id, body) => api.post(`leads/${id}/convert`, body),
  remove: (id) => api.delete(`leads/${id}`)
}

export const clientsApi = {
  list: (params) => api.get('clients', params),
  get: (id) => api.get(`clients/${id}`),
  update: (id, body) => api.patch(`clients/${id}`, body),
  remove: (id) => api.delete(`clients/${id}`)
}

export const quotesApi = {
  list: (params) => api.get('quotes', params),
  get: (id) => api.get(`quotes/${id}`),
  create: (body) => api.post('quotes', body),
  update: (id, body) => api.patch(`quotes/${id}`, body),
  updateStatus: (id, status) => api.patch(`quotes/${id}/status`, { status }),
  // QuoteController::send() takes no request body — it just stamps sent_at.
  send: (id) => api.post(`quotes/${id}/send`),
  remove: (id) => api.delete(`quotes/${id}`)
}

export const teamMembersApi = {
  list: (params) => api.get('team-members', params),
  get: (id) => api.get(`team-members/${id}`),
  create: (body) => api.post('team-members', body),
  update: (id, body) => api.patch(`team-members/${id}`, body),
  remove: (id) => api.delete(`team-members/${id}`)
}

export const tradeJobsApi = {
  list: (params) => api.get('trade-jobs', params),
  get: (id) => api.get(`trade-jobs/${id}`),
  create: (body) => api.post('trade-jobs', body),
  update: (id, body) => api.patch(`trade-jobs/${id}`, body),
  updateStatus: (id, status) => api.patch(`trade-jobs/${id}/status`, { status }),
  confirm: (id) => api.patch(`trade-jobs/${id}/confirm`),
  cancel: (id, reason) => api.patch(`trade-jobs/${id}/cancel`, { reason }),
  reschedule: (id, startsAt, endsAt) => api.patch(`trade-jobs/${id}/reschedule`, { starts_at: startsAt, ends_at: endsAt }),
  remove: (id) => api.delete(`trade-jobs/${id}`),
  calendar: (params) => api.get('calendar', params)
}

export const clientInvoicesApi = {
  list: (params) => api.get('client-invoices', params),
  get: (id) => api.get(`client-invoices/${id}`),
  create: (body) => api.post('client-invoices', body),
  update: (id, body) => api.patch(`client-invoices/${id}`, body),
  markPaid: (id, body) => api.patch(`client-invoices/${id}/mark-paid`, body),
  remove: (id) => api.delete(`client-invoices/${id}`)
}

export const usersApi = {
  list: () => api.get('users'),
  get: (id) => api.get(`users/${id}`),
  create: (body) => api.post('users', body),
  update: (id, body) => api.patch(`users/${id}`, body),
  remove: (id) => api.delete(`users/${id}`)
}

// GlobalSearchController::search() — type must be exactly 'email'|'phone'|'name'
// (backend validates `required|in:email,phone,name`); anything else is a 422.
// Scoped to the caller's own organization automatically via Sanctum auth —
// never pass an organization_id/slug here, there's nothing to override.
export const searchApi = {
  search: (type, value) => api.get('search', { type, value })
}
