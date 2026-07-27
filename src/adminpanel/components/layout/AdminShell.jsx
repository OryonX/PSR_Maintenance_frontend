import React, { useState, useEffect } from 'react'
import { usePageContext } from 'vike-react/usePageContext'
import { navigate } from 'vike/client/router'
import { useAuth } from '../../hooks/useAuth.js'
import Sidebar from './Sidebar.jsx'
import Header from './Header.jsx'
import Spinner from '../../../ui/Spinner.jsx'

const COLLAPSE_KEY = 'psr_admin_sidebar_collapsed'

function AdminShell({ children }) {
  const pageContext = usePageContext()
  const currentPath = pageContext.urlPathname
  const { isAuthenticated, isChecking } = useAuth()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)

  useEffect(() => {
    const stored = typeof window !== 'undefined' && localStorage.getItem(COLLAPSE_KEY)
    if (stored === '1') setCollapsed(true)
  }, [])

  const toggleCollapse = () => {
    setCollapsed((prev) => {
      const next = !prev
      localStorage.setItem(COLLAPSE_KEY, next ? '1' : '0')
      return next
    })
  }

  const isLoginPage = currentPath === '/admin/login'

  useEffect(() => {
    if (!isLoginPage && !isChecking && !isAuthenticated) {
      navigate('/admin/login')
    }
  }, [isLoginPage, isChecking, isAuthenticated])

  if (isLoginPage) {
    return <div className="min-h-screen bg-surface-light">{children}</div>
  }

  if (isChecking || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-surface-light">
        <Spinner label="Checking session…" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-light">
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
        currentPath={currentPath}
      />
      <div className={`flex flex-col min-h-screen transition-[padding] duration-200 ${collapsed ? 'md:pl-[72px]' : 'md:pl-[240px]'}`}>
        <Header onMenuClick={() => setMobileOpen(true)} currentPath={currentPath} />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default AdminShell
