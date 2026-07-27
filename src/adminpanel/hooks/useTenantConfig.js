import { useContext } from 'react'
import TenantConfigContext from '../contexts/TenantConfigContext.jsx'

export function useTenantConfig() {
  const ctx = useContext(TenantConfigContext)
  if (!ctx) throw new Error('useTenantConfig must be used within TenantConfigProvider')
  return ctx
}

export default useTenantConfig
