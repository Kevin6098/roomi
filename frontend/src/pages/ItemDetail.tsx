import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export default function ItemDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
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
      navigate('/items');
    },
  });

  if (!id) return <p className="text-gray-500">{t('itemDetail.missingId')}</p>;
  if (isLoading) return <p className="text-gray-500">{t('dashboard.loading')}</p>;
  if (error) return <div className="text-red-600">{(error as Error).message}</div>;
  if (!item) return null;

  const canEdit = !['sold', 'disposed'].includes(item.status);
  const canDispose = !['sold', 'disposed'].includes(item.status);

  return (
    <div className="space-y-6">
      <Link to="/items" className="text-sm text-blue-600 hover:underline">
        ← {t('common.back')}
      </Link>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{item.title}</h1>
        <div className="flex gap-2">
          {canEdit && (
            <Link
              to={`/items/${id}/edit`}
              className="rounded border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              {t('actions.edit')}
            </Link>
          )}
          {canDispose && !disposeConfirm && (
            <button
              type="button"
              onClick={() => setDisposeConfirm(true)}
              className="rounded border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100"
            >
              {t('actions.dispose')}
            </button>
          )}
          {canDispose && disposeConfirm && (
            <span className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">{t('form.confirmDelete')}</span>
              <button
                type="button"
                onClick={() => disposeMutation.mutate()}
                disabled={disposeMutation.isPending}
                className="rounded bg-red-600 text-white px-2 py-1 text-sm"
              >
                {t('common.yes')}
              </button>
              <button
                type="button"
                onClick={() => setDisposeConfirm(false)}
                className="rounded border border-gray-300 px-2 py-1 text-sm"
              >
                {t('common.cancel')}
              </button>
            </span>
          )}
        </div>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white p-6 space-y-2">
        <p><span className="text-gray-500">{t('itemDetail.statusLabel')}:</span> <span className="font-medium">{item.status}</span></p>
        <p><span className="text-gray-500">{t('itemDetail.categoryLabel')}:</span> {item.subCategory?.mainCategory?.name} → {item.subCategory?.name}</p>
        <p><span className="text-gray-500">{t('itemDetail.conditionLabel')}:</span> {item.condition}</p>
        <p><span className="text-gray-500">{t('itemDetail.locationLabel')}:</span> {item.exactLocation ?? item.locationArea ?? t('common.na')}</p>
        <p><span className="text-gray-500">{t('itemDetail.acquisitionLabel')}:</span> {item.acquisitionType} / {Number(item.acquisitionCost)}</p>
        {item.notes && <p><span className="text-gray-500">{t('itemDetail.notesLabel')}:</span> {item.notes}</p>}
      </div>
    </div>
  );
}
