import React from 'react'
import { AuthProvider } from '../../contexts/AuthContext.jsx'
import { TenantConfigProvider } from '../../contexts/TenantConfigContext.jsx'
import AdminShell from './AdminShell.jsx'

function AdminRoot({ children }) {
  return (
    <AuthProvider>
      <TenantConfigProvider>
        <AdminShell>{children}</AdminShell>
      </TenantConfigProvider>
    </AuthProvider>
  )
}

export default AdminRoot
