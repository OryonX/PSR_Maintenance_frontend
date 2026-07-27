import React, { useState } from 'react'
import { Menu, ExternalLink, LogOut, ChevronDown } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth.js'
import { useTenantConfig } from '../../hooks/useTenantConfig.js'
import { NAV_ITEMS } from './Sidebar.jsx'

function pageTitle(currentPath, label) {
  const match = [...NAV_ITEMS].reverse().find(
    (item) => currentPath === item.href || (item.href !== '/admin' && currentPath?.startsWith(item.href))
  )
  if (!match) return 'Admin'
  return match.staticLabel || label(match.entity, true)
}

function Header({ onMenuClick, currentPath }) {
  const { user, logout } = useAuth()
  const { label } = useTenantConfig()
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white border-b border-gray-100 sticky top-0 z-20">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="md:hidden w-9 h-9 flex items-center justify-center text-navy-900"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-bold text-navy-900">{pageTitle(currentPath, label)}</h1>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <a
          href="/"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-navy-900 transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Back to website
        </a>

        <div className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-navy-900 text-white text-xs font-bold flex items-center justify-center flex-shrink-0">
              {user?.name?.[0]?.toUpperCase() || '?'}
            </div>
            <span className="hidden sm:block text-sm font-medium text-navy-900">{user?.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-44 bg-white border border-gray-100 rounded-lg shadow-lg z-20 py-1">
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header
