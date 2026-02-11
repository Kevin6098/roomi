import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type StartRentalBody } from '../api/client';

export default function StartRental() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState<StartRentalBody>({
    item_id: '',
    customer_id: '',
    start_date: today,
    expected_end_date: today,
  });

  const { data: items = [] } = useQuery({
    queryKey: ['items', 'available'],
    queryFn: async () => {
      const [inStock, listed] = await Promise.all([
        api.items.getMany({ status: 'in_stock' }),
        api.items.getMany({ status: 'listed' }),
      ]);
      return [...inStock, ...listed];
    },
  });
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.customers.getMany(),
  });

  const createMutation = useMutation({
    mutationFn: (body: StartRentalBody) => api.rentals.start(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      navigate('/rentals');
    },
    onError: (e) => setError((e as Error).message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    createMutation.mutate(form);
  }

  return (
    <div className="space-y-6">
      <Link to="/rentals" className="nav-link text-sm">
        ← {t('common.back')}
      </Link>
      <h1 className="text-2xl font-bold text-roomi-brown">{t('form.startRental')}</h1>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4 max-w-xl">
        {error && (
          <div className="rounded bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('table.item')} *</label>
          <select
            value={form.item_id}
            onChange={(e) => setForm((f) => ({ ...f, item_id: e.target.value }))}
            className="input-field"
            required
          >
            <option value="">—</option>
            {items.map((i) => (
              <option key={i.id} value={i.id}>{i.title} ({i.status})</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('table.customer')} *</label>
          <select
            value={form.customer_id ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, customer_id: e.target.value }))}
            className="input-field"
            required
          >
            <option value="">—</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('table.start')} *</label>
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm((f) => ({ ...f, start_date: e.target.value }))}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('table.expectedEnd')} *</label>
            <input
              type="date"
              value={form.expected_end_date}
              onChange={(e) => setForm((f) => ({ ...f, expected_end_date: e.target.value }))}
              className="input-field"
              required
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly rent</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.rent_price_monthly ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, rent_price_monthly: e.target.value ? Number(e.target.value) : null }))}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Deposit</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.deposit ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, deposit: e.target.value ? Number(e.target.value) : null }))}
              className="input-field"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('itemDetail.notesLabel')}</label>
          <textarea
            value={form.notes ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value || null }))}
            className="input-field"
            rows={2}
          />
        </div>
        <div className="flex gap-2">
          <button
            type="submit"
            disabled={createMutation.isPending}
            className="btn-primary"
          >
            {t('common.save')}
          </button>
          <Link to="/rentals" className="btn-ghost">
            {t('common.cancel')}
          </Link>
        </div>
      </form>
    </div>
  );
}
