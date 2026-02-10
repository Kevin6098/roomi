import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export default function Sales() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: sales, isLoading, error } = useQuery({
    queryKey: ['sales'],
    queryFn: () => api.sales.getMany(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.sales.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      setDeleteId(null);
    },
  });

  if (isLoading) return <p className="text-gray-500">{t('dashboard.loading')}</p>;
  if (error) return <div className="text-red-600">{(error as Error).message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{t('nav.sales')}</h1>
        <Link
          to="/sales/new"
          className="rounded bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-800"
        >
          {t('actions.add')} {t('nav.sales')}
        </Link>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('table.item')}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('table.customer')}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('table.saleDate')}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('table.price')}</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{t('actions.edit')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {(sales ?? []).map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium">{s.item?.title ?? s.itemId}</td>
                <td className="px-4 py-2 text-sm">{s.customer?.name ?? s.customerId}</td>
                <td className="px-4 py-2 text-sm">{s.saleDate.slice(0, 10)}</td>
                <td className="px-4 py-2 text-sm">{s.salePrice != null ? Number(s.salePrice) : t('common.na')}</td>
                <td className="px-4 py-2 text-right text-sm">
                  {deleteId === s.id ? (
                    <span className="flex items-center justify-end gap-2">
                      <span className="text-gray-500">{t('form.confirmDelete')}</span>
                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate(s.id)}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:underline"
                      >
                        {t('common.yes')}
                      </button>
                      <button type="button" onClick={() => setDeleteId(null)} className="text-gray-600 hover:underline">
                        {t('common.cancel')}
                      </button>
                    </span>
                  ) : (
                    <>
                      <Link to={`/sales/${s.id}/edit`} className="text-blue-600 hover:underline mr-3">
                        {t('actions.edit')}
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteId(s.id)}
                        className="text-red-600 hover:underline"
                      >
                        {t('actions.delete')}
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(sales?.length ?? 0) === 0 && (
          <p className="px-4 py-8 text-center text-gray-500">{t('empty.noSales')}</p>
        )}
      </div>
    </div>
  );
}
