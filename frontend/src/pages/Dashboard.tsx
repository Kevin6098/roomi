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
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-roomi-brownLight text-base">{t('dashboard.loading')}</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="card-stat p-4 text-red-600 bg-red-50 border-red-200 max-w-full">
        {t('dashboard.failed')} {(error as Error).message}
      </div>
    );
  }
  if (!data) return null;

  const { counts, upcomingReturnsCount, recentItems } = data;

  const statCards = [
    { value: counts.overdue ?? 0, label: t('status.overdue'), href: '/items?status=overdue' },
    { value: counts.in_stock ?? 0, label: t('status.in_stock'), href: '/items?status=in_stock' },
    { value: counts.listed ?? 0, label: t('status.listed'), href: '/items?status=listed' },
    { value: counts.reserved ?? 0, label: t('status.reserved'), href: '/items?status=reserved' },
    { value: counts.rented ?? 0, label: t('status.rented'), href: '/items?status=rented' },
    { value: counts.sold ?? 0, label: t('status.sold'), href: '/items?status=sold' },
    { value: counts.disposed ?? 0, label: t('status.disposed'), href: '/items?status=disposed' },
  ];

  const alertCards = [
    { value: upcomingReturnsCount, label: t('dashboard.upcomingReturns'), href: '/rentals?status=active' },
  ];

  return (
    <div className="space-y-7 sm:space-y-9 w-full max-w-full min-w-0">
      <h1 className="text-2xl sm:text-3xl font-bold text-roomi-brown tracking-tight pb-0.5">
        {t('dashboard.title')}
      </h1>

      {/* Status counts: same layout for all — number on top, label below */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ value, label, href }) => (
          <Link
            key={label}
            to={href}
            className="card-stat flex flex-col justify-center border-l-4 border-l-roomi-orange/60 hover:border-l-roomi-orange touch-manipulation py-5"
          >
            <span className="text-3xl sm:text-4xl font-extrabold text-roomi-orange tabular-nums">
              {value}
            </span>
            <span className="text-sm sm:text-base font-semibold text-roomi-brownLight mt-1">
              {label}
            </span>
          </Link>
        ))}
      </div>

      {/* Upcoming returns — number on top, label below, link to active rentals */}
      <div className="grid grid-cols-1 gap-4 sm:gap-5 sm:grid-cols-2">
        {alertCards.map(({ value, label, href }) => (
          <Link
            key={label}
            to={href ?? '#'}
            className="card-stat flex flex-col justify-center border-l-4 border-l-roomi-mint/80 py-5 hover:border-l-roomi-mint touch-manipulation"
          >
            <span className="text-3xl sm:text-4xl font-extrabold text-roomi-brown tabular-nums">
              {value}
            </span>
            <span className="text-sm sm:text-base font-semibold text-roomi-brownLight mt-1">
              {label}
            </span>
          </Link>
        ))}
      </div>

      {/* Recent items */}
      <div className="card p-5 sm:p-6 w-full max-w-full min-w-0">
        <h3 className="text-lg font-semibold text-roomi-brown mb-5">
          {t('dashboard.recentItems')}
        </h3>
        {recentItems.length === 0 ? (
          <p className="text-roomi-brownLight py-4 text-base">{t('dashboard.noItems')}</p>
        ) : (
          <ul className="divide-y divide-roomi-peach/50 -mx-1">
            {recentItems.map((item) => (
              <li key={item.id} className="min-w-0">
                <Link
                  to={`/items/${item.id}`}
                  className="flex flex-col gap-0.5 sm:flex-row sm:flex-wrap sm:items-center gap-x-2 py-4 px-2 rounded-roomi font-medium text-roomi-orange hover:bg-roomi-peach/40 active:bg-roomi-peach/60 transition-colors touch-manipulation min-h-[48px]"
                >
                  <span className="text-base truncate min-w-0">{item.title}</span>
                  <span className="text-sm text-roomi-brownLight font-normal truncate min-w-0">
                    {item.displaySubCategory ?? item.subCategory?.name ?? item.subCategory?.mainCategory?.name ?? ''}
                  </span>
                  <span className={`${getStatusBadgeClass(item.status)} text-xs sm:text-sm inline-flex w-fit shrink-0`}>
                    {item.status}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
