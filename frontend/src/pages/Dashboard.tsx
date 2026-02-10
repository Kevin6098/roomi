import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function Dashboard() {
  const { t } = useTranslation();
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => api.dashboard.getOverview(),
  });

  if (isLoading) {
    return <p className="text-gray-500">{t('dashboard.loading')}</p>;
  }
  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        {t('dashboard.failed')} {(error as Error).message}
      </div>
    );
  }
  if (!data) return null;

  const { counts, overdueCount, upcomingReturnsCount, recentItems } = data;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-gray-900">{t('dashboard.title')}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link
          to="/items?status=in_stock"
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-gray-300"
        >
          <span className="block text-2xl font-semibold text-gray-900">{counts.in_stock ?? 0}</span>
          <span className="text-sm text-gray-500">{t('status.in_stock')}</span>
        </Link>
        <Link
          to="/items?status=listed"
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-gray-300"
        >
          <span className="block text-2xl font-semibold text-gray-900">{counts.listed ?? 0}</span>
          <span className="text-sm text-gray-500">{t('status.listed')}</span>
        </Link>
        <Link
          to="/items?status=rented"
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-gray-300"
        >
          <span className="block text-2xl font-semibold text-gray-900">{counts.rented ?? 0}</span>
          <span className="text-sm text-gray-500">{t('status.rented')}</span>
        </Link>
        <Link
          to="/items?status=sold"
          className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm hover:border-gray-300"
        >
          <span className="block text-2xl font-semibold text-gray-900">{counts.sold ?? 0}</span>
          <span className="text-sm text-gray-500">{t('status.sold')}</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="font-medium text-gray-900">{t('dashboard.overdue')}</h3>
          <p className="text-2xl font-semibold text-orange-600">{overdueCount}</p>
        </div>
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="font-medium text-gray-900">{t('dashboard.upcomingReturns')}</h3>
          <p className="text-2xl font-semibold text-gray-900">{upcomingReturnsCount}</p>
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="font-medium text-gray-900 mb-3">{t('dashboard.recentItems')}</h3>
        {recentItems.length === 0 ? (
          <p className="text-gray-500">{t('dashboard.noItems')}</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recentItems.map((item) => (
              <li key={item.id} className="py-2">
                <Link to={`/items/${item.id}`} className="text-blue-600 hover:underline">
                  {item.title}
                </Link>
                <span className="ml-2 text-sm text-gray-500">
                  {item.subCategory?.mainCategory?.name} → {item.subCategory?.name}
                </span>
                <span className="ml-2 text-xs px-2 py-0.5 rounded bg-gray-100">{item.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
