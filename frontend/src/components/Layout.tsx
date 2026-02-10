import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

export default function Layout({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-14">
          <Link to="/" className="font-semibold text-gray-900">
            ROOMI
          </Link>
          <nav className="flex items-center gap-6">
            <Link to="/" className="text-gray-600 hover:text-gray-900 text-sm">
              {t('nav.dashboard')}
            </Link>
            <Link to="/items" className="text-gray-600 hover:text-gray-900 text-sm">
              {t('nav.items')}
            </Link>
            <Link to="/customers" className="text-gray-600 hover:text-gray-900 text-sm">
              {t('nav.customers')}
            </Link>
            <Link to="/rentals" className="text-gray-600 hover:text-gray-900 text-sm">
              {t('nav.rentals')}
            </Link>
            <Link to="/sales" className="text-gray-600 hover:text-gray-900 text-sm">
              {t('nav.sales')}
            </Link>
            <Link to="/categories" className="text-gray-600 hover:text-gray-900 text-sm">
              {t('nav.categories')}
            </Link>
            {user?.role === 'OWNER' && (
              <Link to="/users" className="text-gray-600 hover:text-gray-900 text-sm">
                {t('nav.users')}
              </Link>
            )}
            <span className="flex items-center gap-4 text-sm">
              {user && (
                <span className="text-gray-500" title={user.email}>
                  {user.email}
                </span>
              )}
              <span className="flex gap-1">
                <button
                  type="button"
                  onClick={() => i18n.changeLanguage('en')}
                  className={i18n.language === 'en' ? 'font-medium text-gray-900' : 'text-gray-500 hover:text-gray-700'}
                >
                  EN
                </button>
                <span className="text-gray-300">|</span>
                <button
                  type="button"
                  onClick={() => i18n.changeLanguage('ja')}
                  className={i18n.language === 'ja' ? 'font-medium text-gray-900' : 'text-gray-500 hover:text-gray-700'}
                >
                  日本語
                </button>
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700"
              >
                {t('auth.logout')}
              </button>
            </span>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">{children}</main>
    </div>
  );
}
