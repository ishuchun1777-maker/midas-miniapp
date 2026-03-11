import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  Home, Compass, Megaphone, Package, MessageSquare,
  Handshake, User, Bell, LogOut, ChevronRight, Zap
} from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useState } from 'react'
import clsx from 'clsx'

export function Sidebar() {
  const { t } = useTranslation()
  const location = useLocation()
  const { user, logout, isAuthenticated } = useAuthStore()
  const [collapsed, setCollapsed] = useState(false)

  const navItems = [
    { to: '/', icon: Home, label: t('nav.home') },
    { to: '/explore', icon: Compass, label: t('nav.explore') },
    { to: '/campaigns', icon: Megaphone, label: t('nav.campaigns') },
    { to: '/packages', icon: Package, label: t('nav.packages') },
    { to: '/messages', icon: MessageSquare, label: t('nav.messages'), badge: true },
    { to: '/deals', icon: Handshake, label: t('nav.deals') },
  ]

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/'
    return location.pathname.startsWith(to)
  }

  return (
    <aside
      className={clsx(
        'fixed left-0 top-0 h-full z-30 flex flex-col border-r border-dark-800 transition-all duration-300',
        collapsed ? 'w-16' : 'w-60',
        'bg-dark-950/95 backdrop-blur-xl'
      )}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-dark-800">
        {!collapsed && (
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gold-500 flex items-center justify-center">
              <Zap className="w-4 h-4 text-dark-950" fill="currentColor" />
            </div>
            <span className="font-display text-2xl tracking-widest text-white">MIDAS</span>
          </Link>
        )}
        {collapsed && (
          <div className="w-7 h-7 rounded-lg bg-gold-500 flex items-center justify-center mx-auto">
            <Zap className="w-4 h-4 text-dark-950" fill="currentColor" />
          </div>
        )}
        {!collapsed && (
          <button
            onClick={() => setCollapsed(true)}
            className="text-dark-400 hover:text-white p-1 rounded-md transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <Link
            key={to}
            to={to}
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150 text-sm font-medium group',
              collapsed && 'justify-center',
              isActive(to)
                ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                : 'text-dark-400 hover:text-white hover:bg-dark-800'
            )}
            title={collapsed ? label : undefined}
          >
            <Icon className={clsx('w-4 h-4 flex-shrink-0', isActive(to) ? 'text-gold-400' : '')} />
            {!collapsed && <span>{label}</span>}
          </Link>
        ))}
      </nav>

      {/* Bottom */}
      <div className="p-3 border-t border-dark-800 space-y-0.5">
        {isAuthenticated ? (
          <>
            <Link
              to="/profile"
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium',
                collapsed && 'justify-center',
                isActive('/profile')
                  ? 'bg-gold-500/10 text-gold-400 border border-gold-500/20'
                  : 'text-dark-400 hover:text-white hover:bg-dark-800'
              )}
            >
              {user?.photo_url ? (
                <img src={user.photo_url} alt="" className="w-5 h-5 rounded-full flex-shrink-0" />
              ) : (
                <User className="w-4 h-4 flex-shrink-0" />
              )}
              {!collapsed && (
                <span className="truncate">{user?.first_name || t('nav.profile')}</span>
              )}
            </Link>
            <button
              onClick={logout}
              className={clsx(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium text-dark-400 hover:text-red-400 hover:bg-red-500/10',
                collapsed && 'justify-center'
              )}
              title={collapsed ? 'Logout' : undefined}
            >
              <LogOut className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span>Chiqish</span>}
            </button>
          </>
        ) : (
          <Link
            to="/login"
            className={clsx(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gold-400 hover:bg-gold-500/10',
              collapsed && 'justify-center'
            )}
          >
            <User className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Kirish</span>}
          </Link>
        )}

        {collapsed && (
          <button
            onClick={() => setCollapsed(false)}
            className="w-full flex items-center justify-center p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg mt-1 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </aside>
  )
}

export function TopBar() {
  const { i18n } = useTranslation()

  const langs = [
    { code: 'uz', label: "O'z" },
    { code: 'ru', label: 'Ру' },
    { code: 'en', label: 'En' },
  ]

  return (
    <header className="fixed top-0 right-0 z-20 h-14 flex items-center justify-end px-6 gap-3 glass border-b border-dark-800"
      style={{ left: 240 }}
    >
      {/* Language switcher */}
      <div className="flex items-center gap-1 bg-dark-800 rounded-lg p-0.5">
        {langs.map(({ code, label }) => (
          <button
            key={code}
            onClick={() => i18n.changeLanguage(code)}
            className={clsx(
              'px-3 py-1 rounded-md text-xs font-medium transition-all',
              i18n.language === code
                ? 'bg-gold-500 text-dark-950'
                : 'text-dark-400 hover:text-white'
            )}
          >
            {label}
          </button>
        ))}
      </div>
    </header>
  )
}
