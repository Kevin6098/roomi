import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { t } = useTranslation();
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    navigate('/', { replace: true });
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.loginFailed'));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-roomi-cream flex items-center justify-center px-4 font-roomi">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <img src="/roomi-logo.png" alt="ROOMI" className="h-20 w-20 mx-auto rounded-roomiLg object-contain shadow-roomiMd" />
          <h1 className="text-2xl font-bold text-roomi-orange mt-4">ROOMI</h1>
          <p className="text-roomi-brownLight text-sm mt-1">{t('auth.signIn')}</p>
        </div>
        <form onSubmit={handleSubmit} className="card p-6 space-y-4">
          {error && (
            <div className="rounded-roomi bg-red-50 text-red-700 text-sm px-3 py-2" role="alert">
              {error}
            </div>
          )}
          <div>
            <label htmlFor="email" className="label">{t('auth.email')}</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="label">{t('auth.password')}</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              required
            />
          </div>
          <button type="submit" disabled={submitting} className="btn-primary w-full py-3">
            {submitting ? t('auth.signingIn') : t('auth.signIn')}
          </button>
        </form>
      </div>
    </div>
  );
}
