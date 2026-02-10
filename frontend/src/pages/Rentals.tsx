import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';

export default function Rentals() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<string>('active');
  const { data: rentals, isLoading, error } = useQuery({
    queryKey: ['rentals', status],
    queryFn: () => api.rentals.getMany({ status: status || undefined }),
  });

  if (isLoading) return <p className="text-gray-500">{t('dashboard.loading')}</p>;
  if (error) return <div className="text-red-600">{(error as Error).message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{t('nav.rentals')}</h1>
        <Link
          to="/rentals/new"
          className="rounded bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-800"
        >
          {t('form.startRental')}
        </Link>
      </div>
      <div className="flex gap-4">
        <button
          type="button"
          onClick={() => setStatus('active')}
          className={`px-3 py-1 rounded text-sm ${status === 'active' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          {t('status.active')}
        </button>
        <button
          type="button"
          onClick={() => setStatus('ended')}
          className={`px-3 py-1 rounded text-sm ${status === 'ended' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700'}`}
        >
          {t('status.ended')}
        </button>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('table.item')}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('table.customer')}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('table.start')}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('table.expectedEnd')}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('table.overdue')}</th>
              {status === 'active' && <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{t('actions.endRental')}</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {(rentals ?? []).map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{r.item?.title ?? r.itemId}</td>
                <td className="px-4 py-2 text-sm">{r.customer?.name ?? r.customerId}</td>
                <td className="px-4 py-2 text-sm">{r.startDate.slice(0, 10)}</td>
                <td className="px-4 py-2 text-sm">{r.expectedEndDate.slice(0, 10)}</td>
                <td className="px-4 py-2">
                  {r.isOverdue ? <span className="text-orange-600 font-medium">{t('common.yes')}</span> : t('common.na')}
                </td>
                {status === 'active' && r.status === 'active' && (
                  <td className="px-4 py-2 text-right">
                    <Link to={`/rentals/${r.id}/end`} className="text-blue-600 hover:underline text-sm">
                      {t('actions.endRental')}
                    </Link>
                  </td>
                )}
                {status === 'active' && r.status !== 'active' && <td className="px-4 py-2" />}
              </tr>
            ))}
          </tbody>
        </table>
        {(rentals?.length ?? 0) === 0 && (
          <p className="px-4 py-8 text-center text-gray-500">{t('empty.noRentals')}</p>
        )}
      </div>
    </div>
  );
}
