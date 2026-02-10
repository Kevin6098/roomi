import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../api/client';

export default function Customers() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: customers, isLoading, error } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.customers.getMany(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.customers.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setDeleteId(null);
    },
  });

  if (isLoading) return <p className="text-gray-500">{t('dashboard.loading')}</p>;
  if (error) return <div className="text-red-600">{(error as Error).message}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">{t('nav.customers')}</h1>
        <Link
          to="/customers/new"
          className="rounded bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-800"
        >
          {t('actions.add')} {t('nav.customers')}
        </Link>
      </div>
      <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('table.name')}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('table.phone')}</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">{t('table.email')}</th>
              <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase">{t('actions.edit')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {(customers ?? []).map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-2 font-medium text-gray-900">{c.name}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{c.phone ?? t('common.na')}</td>
                <td className="px-4 py-2 text-sm text-gray-600">{c.email ?? t('common.na')}</td>
                <td className="px-4 py-2 text-right text-sm">
                  {deleteId === c.id ? (
                    <span className="flex items-center justify-end gap-2">
                      <span className="text-gray-500">{t('form.confirmDelete')}</span>
                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate(c.id)}
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
                      <Link to={`/customers/${c.id}/edit`} className="text-blue-600 hover:underline mr-3">
                        {t('actions.edit')}
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteId(c.id)}
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
        {(customers?.length ?? 0) === 0 && (
          <p className="px-4 py-8 text-center text-gray-500">{t('empty.noCustomers')}</p>
        )}
      </div>
    </div>
  );
}
