import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { getStatusBadgeClass } from '../utils/statusStyles';

export default function Dashboard() {
  const { t } = useTranslation();
  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => api.dashboard.getOverview(),
  });

  if (isLoading) {
    return <p className="text-roomi-brownLight">{t('dashboard.loading')}</p>;
  }
  if (error) {
    return (
      <div className="card p-4 text-red-600 bg-red-50 border-red-200">
        {t('dashboard.failed')} {(error as Error).message}
      </div>
    );
  }
  if (!data) return null;

  const { counts, overdueCount, upcomingReturnsCount, recentItems } = data;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-roomi-brown">{t('dashboard.title')}</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to="/items?status=in_stock" className="card p-5 hover:shadow-roomiMd transition-shadow">
          <span className="block text-2xl font-bold text-roomi-orange">{counts.in_stock ?? 0}</span>
          <span className="text-sm text-roomi-brownLight">{t('status.in_stock')}</span>
        </Link>
        <Link to="/items?status=listed" className="card p-5 hover:shadow-roomiMd transition-shadow">
          <span className="block text-2xl font-bold text-roomi-orange">{counts.listed ?? 0}</span>
          <span className="text-sm text-roomi-brownLight">{t('status.listed')}</span>
        </Link>
        <Link to="/items?status=rented" className="card p-5 hover:shadow-roomiMd transition-shadow">
          <span className="block text-2xl font-bold text-roomi-orange">{counts.rented ?? 0}</span>
          <span className="text-sm text-roomi-brownLight">{t('status.rented')}</span>
        </Link>
        <Link to="/items?status=sold" className="card p-5 hover:shadow-roomiMd transition-shadow">
          <span className="block text-2xl font-bold text-roomi-orange">{counts.sold ?? 0}</span>
          <span className="text-sm text-roomi-brownLight">{t('status.sold')}</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="card p-5">
          <h3 className="font-semibold text-roomi-brown">{t('dashboard.overdue')}</h3>
          <p className="text-2xl font-bold text-roomi-orange">{overdueCount}</p>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold text-roomi-brown">{t('dashboard.upcomingReturns')}</h3>
          <p className="text-2xl font-bold text-roomi-brown">{upcomingReturnsCount}</p>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="font-semibold text-roomi-brown mb-3">{t('dashboard.recentItems')}</h3>
        {recentItems.length === 0 ? (
          <p className="text-roomi-brownLight">{t('dashboard.noItems')}</p>
        ) : (
          <ul className="divide-y divide-roomi-peach/60">
            {recentItems.map((item) => (
              <li key={item.id} className="py-2">
                <Link to={`/items/${item.id}`} className="text-roomi-orange font-medium hover:underline">
                  {item.title}
                </Link>
                <span className="ml-2 text-sm text-roomi-brownLight">
                  {item.subCategory?.mainCategory?.name} → {item.displaySubCategory ?? item.subCategory?.name}
                </span>
                <span className={getStatusBadgeClass(item.status)}>{item.status}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
