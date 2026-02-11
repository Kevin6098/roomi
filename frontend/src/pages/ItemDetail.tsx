import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';
import { getDisplayLocation, UNDECIDED } from '../data/locationData';
import { getStatusBadgeClass } from '../utils/statusStyles';

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [disposeConfirm, setDisposeConfirm] = useState(false);

  const { data: item, isLoading, error } = useQuery({
    queryKey: ['item', id],
    queryFn: () => api.items.getById(id!),
    enabled: !!id,
  });

  const disposeMutation = useMutation({
    mutationFn: () => api.items.dispose(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['item', id] });
      setDisposeConfirm(false);
    },
  });

  if (!id) return <p className="text-roomi-brownLight">{t('itemDetail.missingId')}</p>;
  if (isLoading) return <p className="text-roomi-brownLight">{t('dashboard.loading')}</p>;
  if (error) return <div className="card p-4 text-red-600 bg-red-50 border-red-200">{(error as Error).message}</div>;
  if (!item) return null;

  const canEdit = !['sold', 'disposed'].includes(item.status);
  const canDispose = !['sold', 'disposed'].includes(item.status);

  return (
    <div className="space-y-6">
      <Link to="/items" className="nav-link text-sm">← {t('common.back')}</Link>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl sm:text-2xl font-bold text-roomi-brown truncate min-w-0">{item.title}</h1>
        <div className="flex flex-wrap gap-2 shrink-0">
          {canEdit && (
            <Link to={`/items/${id}/edit`} className="btn-secondary py-1.5 px-3 text-sm">
              {t('actions.edit')}
            </Link>
          )}
          {canDispose && !disposeConfirm && (
            <button
              type="button"
              onClick={() => setDisposeConfirm(true)}
              className="rounded-roomi border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-semibold text-red-700 hover:bg-red-100"
            >
              {t('actions.dispose')}
            </button>
          )}
          {canDispose && disposeConfirm && (
            <span className="flex items-center gap-2 text-sm">
              <span className="text-roomi-brownLight">{t('form.confirmDispose')}</span>
              <button type="button" onClick={() => disposeMutation.mutate()} disabled={disposeMutation.isPending} className="btn-primary py-1 px-2 text-sm bg-red-600 hover:bg-red-700 focus:ring-red-500">
                {t('common.yes')}
              </button>
              <button type="button" onClick={() => setDisposeConfirm(false)} className="btn-ghost py-1 px-2 text-sm">
                {t('common.cancel')}
              </button>
            </span>
          )}
        </div>
      </div>
      <div className="card p-6 space-y-2">
        <p><span className="text-roomi-brownLight">{t('itemDetail.statusLabel')}:</span> <span className={getStatusBadgeClass(item.status)}>{item.status}</span></p>
        <p><span className="text-roomi-brownLight">{t('itemDetail.categoryLabel')}:</span> {item.subCategory?.mainCategory?.name} → {item.displaySubCategory ?? item.subCategory?.name}</p>
        <p><span className="text-roomi-brownLight">{t('itemDetail.conditionLabel')}:</span> {item.condition}</p>
        <p><span className="text-roomi-brownLight">{t('itemDetail.locationLabel')}:</span> {(getDisplayLocation(item.prefecture, item.city) === UNDECIDED ? t('input.undecided') : getDisplayLocation(item.prefecture, item.city))}{item.locationVisibility === 'shown' && item.exactLocation ? ` — ${item.exactLocation}` : ''}</p>
        <p><span className="text-roomi-brownLight">{t('table.seller')}:</span> {item.acquisitionContact ? `${item.acquisitionContact.name} (${item.acquisitionContact.sourcePlatform})` : '—'}</p>
        {item.sale?.customer && (
          <p><span className="text-roomi-brownLight">{t('table.buyer')}:</span> {item.sale.customer.name}{item.sale.customer.sourcePlatform ? ` (${item.sale.customer.sourcePlatform})` : ''}</p>
        )}
        <p><span className="text-roomi-brownLight">{t('itemDetail.acquisitionLabel')}:</span> {item.acquisitionType} / {Number(item.acquisitionCost)}</p>
        {item.rentals && item.rentals.length > 0 && (
          <div className="pt-1">
            <p className="text-roomi-brownLight font-medium">{t('itemDetail.rentInfo')}</p>
            <ul className="list-none space-y-1.5 mt-1">
              {item.rentals.map((r) => (
                <li key={r.id} className="text-roomi-brown text-sm">
                  <span className="text-roomi-brownLight">{t('table.renter')}:</span> {r.customer?.name ?? '—'}
                  {' · '}
                  <span className="text-roomi-brownLight">{t('itemDetail.rentPeriod')}:</span> {r.startDate} – {r.actualEndDate ?? r.expectedEndDate}
                  {r.status && <span className="ml-1">({r.status})</span>}
                </li>
              ))}
            </ul>
          </div>
        )}
        {item.acquisitionContact && (item.acquisitionContact.phone || item.acquisitionContact.email) && (
          <p className="text-sm text-roomi-brownLight">
            {item.acquisitionContact.phone && <span>{t('table.phone')}: {item.acquisitionContact.phone}</span>}
            {item.acquisitionContact.phone && item.acquisitionContact.email && ' · '}
            {item.acquisitionContact.email && <span>{t('table.email')}: {item.acquisitionContact.email}</span>}
          </p>
        )}
        {item.notes && <p><span className="text-roomi-brownLight">{t('itemDetail.notesLabel')}:</span> {item.notes}</p>}
      </div>
    </div>
  );
}
