import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

const SIDEBAR_WIDTH = 260;

export default function Layout({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  function isActive(path: string) {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  }

  function navItem(path: string, label: string) {
    const active = isActive(path);
    return (
      <Link
        to={path}
        onClick={() => setDrawerOpen(false)}
        className={`flex items-center gap-3 rounded-roomi px-3 py-2.5 text-sm font-semibold transition-colors ${
          active
            ? 'bg-roomi-orange/15 text-roomi-orange'
            : 'text-roomi-brownLight hover:bg-roomi-peach/60 hover:text-roomi-brown'
        }`}
      >
        {label}
      </Link>
    );
  }

  const sidebar = (
    <aside
      className="fixed top-0 left-0 z-40 h-full flex flex-col bg-white border-r border-roomi-peach/60 shadow-roomiMd"
      style={{ width: SIDEBAR_WIDTH }}
    >
      <div className="flex items-center justify-between p-4 border-b border-roomi-peach/60">
        <Link to="/" className="flex items-center gap-3 min-w-0" onClick={() => setDrawerOpen(false)}>
          <img src="/roomi-logo.png" alt="ROOMI" className="h-9 w-9 flex-shrink-0 rounded-roomi object-contain" />
          <span className="font-bold text-lg text-roomi-orange truncate">ROOMI</span>
        </Link>
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setDrawerOpen(false);
          }}
          className="lg:hidden flex-shrink-0 min-w-[44px] min-h-[44px] -mr-2 flex items-center justify-center rounded-roomi text-roomi-brownLight hover:bg-roomi-peach/60 active:bg-roomi-peach/80 touch-manipulation"
          aria-label="Close menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-1">
        {navItem('/', t('nav.dashboard'))}
        {navItem('/records', t('nav.records'))}
        {navItem('/items', t('nav.items'))}
        {navItem('/customers', t('nav.customers'))}
        {navItem('/rentals', t('nav.rentals'))}
        {navItem('/sales', t('nav.sales'))}

        <div className="pt-4 mt-4 border-t border-roomi-peach/60">
          <p className="px-3 py-1.5 text-xs font-bold text-roomi-brownLight uppercase tracking-wider">
            {t('nav.settings')}
          </p>
          <div className="mt-1 space-y-0.5">
            {navItem('/categories', t('nav.categories'))}
            {user?.role === 'OWNER' && navItem('/users', t('nav.users'))}
          </div>
        </div>
      </nav>

      <div className="p-3 border-t border-roomi-peach/60 space-y-2">
        {user && (
          <p className="px-3 py-1 text-xs text-roomi-brownLight truncate" title={user.email}>
            {user.email}
          </p>
        )}
        <div className="flex items-center gap-2 px-3">
          <button
            type="button"
            onClick={() => i18n.changeLanguage('en')}
            className={`text-xs font-semibold py-1.5 px-2 rounded ${i18n.language === 'en' ? 'bg-roomi-orange/20 text-roomi-orange' : 'text-roomi-brownLight hover:text-roomi-orange'}`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => i18n.changeLanguage('ja')}
            className={`text-xs font-semibold py-1.5 px-2 rounded ${i18n.language === 'ja' ? 'bg-roomi-orange/20 text-roomi-orange' : 'text-roomi-brownLight hover:text-roomi-orange'}`}
          >
            日本語
          </button>
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-sm font-semibold text-roomi-brownLight hover:bg-roomi-peach/60 hover:text-roomi-brown rounded-roomi transition-colors"
        >
          {t('auth.logout')}
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-roomi-cream font-roomi">
      {/* Mobile: overlay when drawer open (starts right of sidebar so X button is never covered) */}
      {drawerOpen && (
        <button
          type="button"
          onClick={() => setDrawerOpen(false)}
          className="fixed inset-0 z-30 bg-black/30 lg:hidden"
          style={{ left: SIDEBAR_WIDTH }}
          aria-label="Close menu"
        />
      )}

      {/* Sidebar: fixed on desktop, overlay on mobile */}
      <div
        className={`fixed top-0 left-0 z-40 h-full transform transition-transform duration-200 ease-out ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
        style={{ width: SIDEBAR_WIDTH }}
      >
        {sidebar}
      </div>

      {/* Main content */}
      <div className="min-h-screen lg:ml-[260px]">
        {/* Top bar: only on mobile, for hamburger + branding */}
        <header className="lg:hidden sticky top-0 z-20 flex items-center gap-3 h-14 px-4 bg-white/95 backdrop-blur border-b border-roomi-peach/60 shadow-roomi">
          <button
            type="button"
            onClick={() => setDrawerOpen(true)}
            className="p-2 -ml-2 rounded-roomi text-roomi-brown hover:bg-roomi-peach/60"
            aria-label="Open menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <Link to="/" className="flex items-center gap-2">
            <img src="/roomi-logo.png" alt="ROOMI" className="h-8 w-8 rounded-roomi object-contain" />
            <span className="font-bold text-roomi-orange">ROOMI</span>
          </Link>
        </header>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-6 lg:py-8">{children}</main>
      </div>
    </div>
  );
}
