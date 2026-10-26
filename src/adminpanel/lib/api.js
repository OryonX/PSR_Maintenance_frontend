import { getAuthToken, clearAuthToken } from './auth.js'

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ApiError extends Error {
  constructor(status, body) {
    // Real error shapes seen in the backend, in order of preference:
    // - Laravel validation: { message, errors: { field: [msg] } }
    // - Custom guards: { error: 'code', message?: string }
    // - Auth: { error: 'Invalid credentials.' }
    super(body?.message || body?.error || `Request failed (${status})`)
    this.status = status
    this.body = body
    this.errors = body?.errors || null
  }
}

function buildUrl(path, params) {
  const url = new URL(BASE_URL.replace(/\/$/, '') + '/' + path.replace(/^\//, ''))
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value)
      }
    })
  }
  return url.toString()
}

async function request(method, path, { params, body, signal } = {}) {
  const token = getAuthToken()

  const headers = {
    Accept: 'application/json'
  }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(buildUrl(path, params), {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal
  })

  if (response.status === 204) return null

  let data = null
  const text = await response.text()
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthToken()
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/admin/login')) {
        window.location.href = '/admin/login'
      }
    }
    throw new ApiError(response.status, data)
  }

  return data
}

// Binary GET (e.g. PDFs). The endpoint still needs the Bearer token, so a
// plain <a href> can't be used — callers turn the Blob into an object URL.
async function requestBlob(path) {
  const token = getAuthToken()
  const response = await fetch(buildUrl(path), {
    headers: { Accept: 'application/pdf', ...(token ? { Authorization: `Bearer ${token}` } : {}) }
  })

  if (!response.ok) {
    let data = null
    try { data = await response.json() } catch { data = null }
    throw new ApiError(response.status, data)
  }

  return response.blob()
}

// Authenticated file download: fetch as Blob (Bearer required, so no plain
// <a href>), then trigger the browser download from an object URL.
async function downloadFile(path, filename) {
  const blob = await requestBlob(path)
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  link.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const api = {
  get: (path, params) => request('GET', path, { params }),
  blob: (path) => requestBlob(path),
  download: (path, filename) => downloadFile(path, filename),
  post: (path, body, params) => request('POST', path, { body, params }),
  put: (path, body) => request('PUT', path, { body }),
  patch: (path, body) => request('PATCH', path, { body }),
  delete: (path) => request('DELETE', path)
}

export default api
