import React, { createContext, useState, useEffect, useCallback } from 'react'
import { meApi } from '../lib/endpoints.js'
import { useAuth } from '../hooks/useAuth.js'

export const TenantConfigContext = createContext(null)

const FALLBACK_STATE = { label: null, color: '#6B7280', category: 'open', is_terminal: false }
const FALLBACK_SERVICE = { label: null, icon: 'tool', color: '#6B7280' }

export function TenantConfigProvider({ children }) {
  const { isAuthenticated } = useAuth()
  const [config, setConfig] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false)
      return
    }

    let cancelled = false
    setLoading(true)

    meApi.tenantConfig()
      .then((data) => { if (!cancelled) setConfig(data) })
      .catch((err) => { if (!cancelled) setError(err) })
      .finally(() => { if (!cancelled) setLoading(false) })

    return () => { cancelled = true }
  }, [isAuthenticated])

  const label = useCallback((entity, plural = false) => {
    const entry = config?.labels?.[entity]
    if (entry) return plural ? entry.many : entry.one
    const fallback = entity.replace(/_/g, ' ')
    return plural ? `${fallback}s` : fallback
  }, [config])

  const stateInfo = useCallback((status) => {
    return { ...FALLBACK_STATE, label: status, ...(config?.states?.[status] || {}) }
  }, [config])

  const serviceInfo = useCallback((type) => {
    return { ...FALLBACK_SERVICE, label: type, ...(config?.services?.[type] || {}) }
  }, [config])

  const hasModule = useCallback((moduleKey) => {
    return Boolean(config?.modules?.includes(moduleKey))
  }, [config])

  const value = {
    vertical: config?.vertical || null,
    labels: config?.labels || {},
    states: config?.states || {},
    fields: config?.fields || {},
    services: config?.services || {},
    plan: config?.plan || null,
    modules: config?.modules || [],
    label,
    stateInfo,
    serviceInfo,
    hasModule,
    loading,
    error
  }

  return <TenantConfigContext.Provider value={value}>{children}</TenantConfigContext.Provider>
}

export default TenantConfigContext
