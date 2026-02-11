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
    <div className="space-y-5 sm:space-y-8 max-w-full min-w-0">
      <h1 className="text-2xl font-bold text-roomi-brown">{t('dashboard.title')}</h1>

      {/* Mobile: single column for readability; desktop: 4 cols then 2 cols */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4 sm:gap-4">
        <Link to="/items?status=in_stock" className="card p-5 md:p-5 min-h-0 flex flex-col justify-center hover:shadow-roomiMd active:scale-[0.99] transition-all touch-manipulation">
          <span className="block text-3xl md:text-2xl font-bold text-roomi-orange">{counts.in_stock ?? 0}</span>
          <span className="text-base md:text-sm text-roomi-brownLight mt-0.5">{t('status.in_stock')}</span>
        </Link>
        <Link to="/items?status=listed" className="card p-5 md:p-5 min-h-0 flex flex-col justify-center hover:shadow-roomiMd active:scale-[0.99] transition-all touch-manipulation">
          <span className="block text-3xl md:text-2xl font-bold text-roomi-orange">{counts.listed ?? 0}</span>
          <span className="text-base md:text-sm text-roomi-brownLight mt-0.5">{t('status.listed')}</span>
        </Link>
        <Link to="/items?status=rented" className="card p-5 md:p-5 min-h-0 flex flex-col justify-center hover:shadow-roomiMd active:scale-[0.99] transition-all touch-manipulation">
          <span className="block text-3xl md:text-2xl font-bold text-roomi-orange">{counts.rented ?? 0}</span>
          <span className="text-base md:text-sm text-roomi-brownLight mt-0.5">{t('status.rented')}</span>
        </Link>
        <Link to="/items?status=sold" className="card p-5 md:p-5 min-h-0 flex flex-col justify-center hover:shadow-roomiMd active:scale-[0.99] transition-all touch-manipulation">
          <span className="block text-3xl md:text-2xl font-bold text-roomi-orange">{counts.sold ?? 0}</span>
          <span className="text-base md:text-sm text-roomi-brownLight mt-0.5">{t('status.sold')}</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 sm:gap-4">
        <div className="card p-5 md:p-5 min-h-0 flex flex-col justify-center">
          <h3 className="text-base md:text-sm font-semibold text-roomi-brown">{t('dashboard.overdue')}</h3>
          <p className="text-3xl md:text-2xl font-bold text-roomi-orange mt-0.5">{overdueCount}</p>
        </div>
        <div className="card p-5 md:p-5 min-h-0 flex flex-col justify-center">
          <h3 className="text-base md:text-sm font-semibold text-roomi-brown">{t('dashboard.upcomingReturns')}</h3>
          <p className="text-3xl md:text-2xl font-bold text-roomi-brown mt-0.5">{upcomingReturnsCount}</p>
        </div>
      </div>

      <div className="card p-5 md:p-5 max-w-full min-w-0">
        <h3 className="text-lg md:text-base font-semibold text-roomi-brown mb-4">{t('dashboard.recentItems')}</h3>
        {recentItems.length === 0 ? (
          <p className="text-roomi-brownLight py-2 text-base">{t('dashboard.noItems')}</p>
        ) : (
          <ul className="divide-y divide-roomi-peach/60">
            {recentItems.map((item) => (
              <li key={item.id} className="min-w-0">
                <Link
                  to={`/items/${item.id}`}
                  className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-1 sm:gap-x-2 py-4 sm:py-3 rounded-roomi text-roomi-orange font-medium hover:bg-roomi-peach/40 active:bg-roomi-peach/60 transition-colors touch-manipulation min-h-[48px]"
                >
                  <span className="text-base truncate min-w-0">{item.title}</span>
                  <span className="text-sm text-roomi-brownLight font-normal truncate min-w-0">
                    {item.displaySubCategory ?? item.subCategory?.name ?? item.subCategory?.mainCategory?.name ?? ''}
                  </span>
                  <span className={`${getStatusBadgeClass(item.status)} text-sm inline-flex w-fit`}>{item.status}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
