import React from 'react'
import {
  LayoutDashboard, Users, UserSquare2, FileText, CalendarClock,
  HardHat, Receipt, Settings, BarChart3, ChevronsLeft, X
} from 'lucide-react'
import { useTenantConfig } from '../../hooks/useTenantConfig.js'
import logo from '../../../../public/img/rsr.png'

export const NAV_ITEMS = [
  { href: '/admin', icon: LayoutDashboard, staticLabel: 'Dashboard', module: null },
  { href: '/admin/leads', icon: Users, entity: 'lead', module: 'leads' },
  { href: '/admin/clients', icon: UserSquare2, entity: 'client', module: 'clients' },
  { href: '/admin/quotes', icon: FileText, entity: 'quote', module: 'quotes' },
  { href: '/admin/jobs', icon: CalendarClock, entity: 'work_item', module: 'trade_jobs' },
  { href: '/admin/team', icon: HardHat, entity: 'team', module: 'team_members' },
  { href: '/admin/invoices', icon: Receipt, entity: 'invoice', module: 'client_invoices' },
  { href: '/admin/settings', icon: Settings, staticLabel: 'Settings', module: null },
  { href: '/admin/reports', icon: BarChart3, staticLabel: 'Reports', module: null }
]

function SidebarContent({ collapsed, currentPath, onNavigate }) {
  const { label, hasModule, loading } = useTenantConfig()

  const items = NAV_ITEMS.filter((item) => !item.module || loading || hasModule(item.module))

  return (
    <>
      <div className={`flex items-center gap-2 px-4 h-16 border-b border-white/10 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center flex-shrink-0 p-1">
          <img src={logo} alt="PSR" className="w-full h-full object-contain" />
        </div>
        {!collapsed && (
          <span className="text-white/50 text-xs font-semibold uppercase tracking-wider">PSR Operations</span>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {items.map((item) => {
          const Icon = item.icon
          const text = item.staticLabel || label(item.entity, true)
          const active = currentPath === item.href || (item.href !== '/admin' && currentPath?.startsWith(item.href))

          return (
            <a
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              title={collapsed ? text : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-white/10 text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
              } ${collapsed ? 'justify-center' : ''}`}
            >
              <Icon className="w-[18px] h-[18px] flex-shrink-0" />
              {!collapsed && <span className="truncate">{text}</span>}
            </a>
          )
        })}
      </nav>

      <div className="p-2 border-t border-white/10">
        <a
          href="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/40 hover:text-white/70 transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <ChevronsLeft className="w-[18px] h-[18px] flex-shrink-0" />
          {!collapsed && <span>Back to website</span>}
        </a>
      </div>
    </>
  )
}

function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onCloseMobile, currentPath }) {
  return (
    <>
      {/* Desktop rail */}
      <aside
        className={`hidden md:flex fixed inset-y-0 left-0 z-30 flex-col bg-navy-900 transition-[width] duration-200 ${collapsed ? 'w-[72px]' : 'w-[240px]'}`}
      >
        <SidebarContent collapsed={collapsed} currentPath={currentPath} />
        <button
          onClick={onToggleCollapse}
          className="absolute -right-3 top-20 w-6 h-6 bg-navy-900 border border-white/20 rounded-full flex items-center justify-center text-white/60 hover:text-white transition-colors"
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <ChevronsLeft className={`w-3.5 h-3.5 transition-transform ${collapsed ? 'rotate-180' : ''}`} />
        </button>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/50" onClick={onCloseMobile} />
          <aside className="relative z-50 w-[78vw] max-w-[300px] bg-navy-900 flex flex-col">
            <button
              onClick={onCloseMobile}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
            <SidebarContent collapsed={false} currentPath={currentPath} onNavigate={onCloseMobile} />
          </aside>
        </div>
      )}
    </>
  )
}

export default Sidebar
