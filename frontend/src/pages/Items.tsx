import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../api/client';

export default function Items() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') ?? '';
  const [search, setSearch] = useState('');

  const { data: items, isLoading, error } = useQuery({
    queryKey: ['items', status, search],
    queryFn: () => api.items.getMany({ status: status || undefined, search: search || undefined }),
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{t('nav.items')}</h1>
        <Link
          to="/items/new"
          className="rounded bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-800"
        >
          {t('actions.add')} {t('nav.items')}
        </Link>
      </div>

      <div className="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(e) => {
            const v = e.target.value;
            setSearchParams((prev) => {
              const next = new URLSearchParams(prev);
              if (v) next.set('status', v);
              else next.delete('status');
              return next;
            });
          }}
          className="rounded border border-gray-300 px-3 py-2 text-sm"
        >
          <option value="">{t('common.allStatus')}</option>
          <option value="in_stock">{t('status.in_stock')}</option>
          <option value="listed">{t('status.listed')}</option>
          <option value="rented">{t('status.rented')}</option>
          <option value="sold">{t('status.sold')}</option>
          <option value="reserved">{t('status.reserved')}</option>
          <option value="disposed">{t('status.disposed')}</option>
        </select>
      </div>

      {isLoading && <p className="text-gray-500">{t('dashboard.loading')}</p>}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-700">
          {(error as Error).message}
        </div>
      )}
      {items && (
        <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('table.title')}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('table.category')}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('table.status')}</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('table.location')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2">
                    <Link to={`/items/${item.id}`} className="text-blue-600 hover:underline">
                      {item.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">
                    {item.subCategory?.mainCategory?.name} → {item.subCategory?.name}
                  </td>
                  <td className="px-4 py-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-gray-100">{item.status}</span>
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-600">{item.exactLocation ?? t('common.na')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && (
            <p className="px-4 py-8 text-center text-gray-500">{t('dashboard.noItems')}</p>
          )}
        </div>
      )}
    </div>
  );
}
