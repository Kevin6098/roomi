import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import { getDisplayLocation, UNDECIDED } from '../data/locationData';
import { getStatusBadgeClass } from '../utils/statusStyles';

export default function Items() {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') ?? '';
  const [search, setSearch] = useState('');

  const { data: itemsRaw, isLoading, error } = useQuery({
    queryKey: ['items', status, search],
    queryFn: () => api.items.getMany({ status: status || undefined, search: search || undefined }),
  });

  const items = useMemo(() => {
    if (!itemsRaw) return itemsRaw;
    return [...itemsRaw].sort((a, b) => {
      const aInStock = a.status === 'in_stock' ? 0 : 1;
      const bInStock = b.status === 'in_stock' ? 0 : 1;
      return aInStock - bInStock;
    });
  }, [itemsRaw]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-roomi-brown">{t('nav.items')}</h1>
        <Link to="/items/new" className="btn-primary">
          {t('actions.add')} {t('nav.items')}
        </Link>
      </div>

      <div className="flex flex-wrap gap-4">
        <input
          type="text"
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field max-w-xs"
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
          className="input-field max-w-[180px]"
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

      {isLoading && <p className="text-roomi-brownLight">{t('dashboard.loading')}</p>}
      {error && (
        <div className="card p-4 text-red-600 bg-red-50 border-red-200">
          {(error as Error).message}
        </div>
      )}
      {items && (
        <div className="card overflow-hidden">
          <table className="min-w-full divide-y divide-roomi-peach/60">
            <thead className="bg-roomi-cream/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-roomi-brown uppercase">{t('table.title')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-roomi-brown uppercase">{t('table.category')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-roomi-brown uppercase">{t('table.seller')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-roomi-brown uppercase">{t('table.status')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-roomi-brown uppercase">{t('table.location')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-roomi-peach/60 bg-white">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-roomi-cream/40">
                  <td className="px-4 py-3">
                    <Link to={`/items/${item.id}`} className="text-roomi-orange font-medium hover:underline">
                      {item.title}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-roomi-brownLight">
                    {item.subCategory?.mainCategory?.name} → {item.displaySubCategory ?? item.subCategory?.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-roomi-brownLight">
                    {item.acquisitionContact ? `${item.acquisitionContact.name} (${item.acquisitionContact.sourcePlatform})` : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={getStatusBadgeClass(item.status)}>{item.status}</span>
                  </td>
                  <td className="px-4 py-3 text-sm text-roomi-brownLight">{getDisplayLocation(item.prefecture, item.city) === UNDECIDED ? t('input.undecided') : getDisplayLocation(item.prefecture, item.city)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && (
            <p className="px-4 py-8 text-center text-roomi-brownLight">{t('dashboard.noItems')}</p>
          )}
        </div>
      )}
    </div>
  );
}
