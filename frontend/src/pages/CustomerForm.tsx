import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type CreateCustomerBody } from '../api/client';

export default function CustomerForm() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const { data: customer, isLoading: loadingCustomer } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => api.customers.getById(id!),
    enabled: isEdit,
  });

  const [form, setForm] = useState<CreateCustomerBody>({ name: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (customer) {
      setForm({
        name: customer.name,
        phone: customer.phone ?? null,
        email: customer.email ?? null,
      });
    }
  }, [customer]);

  const createMutation = useMutation({
    mutationFn: (body: CreateCustomerBody) => api.customers.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      navigate('/customers');
    },
    onError: (e) => setError((e as Error).message),
  });
  const updateMutation = useMutation({
    mutationFn: (body: Partial<CreateCustomerBody>) => api.customers.update(id!, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      navigate('/customers');
    },
    onError: (e) => setError((e as Error).message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (isEdit) updateMutation.mutate(form);
    else createMutation.mutate(form);
  }

  if (isEdit && loadingCustomer) return <p className="text-gray-500">{t('dashboard.loading')}</p>;
  if (isEdit && !customer) return <p className="text-gray-500">Customer not found</p>;

  return (
    <div className="space-y-6">
      <Link to="/customers" className="text-sm text-blue-600 hover:underline">
        ← {t('common.back')}
      </Link>
      <h1 className="text-2xl font-semibold text-gray-900">
        {isEdit ? t('form.editCustomer') : t('form.newCustomer')}
      </h1>
      <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm space-y-4 max-w-xl">
        {error && (
          <div className="rounded bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('table.name')} *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('table.phone')}</label>
          <input
            type="text"
            value={form.phone ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value || null }))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('table.email')}</label>
          <input
            type="email"
            value={form.email ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value || null }))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="rounded bg-gray-900 text-white px-4 py-2 text-sm font-medium hover:bg-gray-800 disabled:opacity-50"
          >
            {t('common.save')}
          </button>
          <Link
            to="/customers"
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {t('common.cancel')}
          </Link>
        </div>
      </form>
    </div>
  );
}
