import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type EndRentalBody } from '../api/client';
import { CenteredToast } from '../components/CenteredToast';

export default function EndRental() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState('');

  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState<EndRentalBody>({
    actual_end_date: today,
    next_item_status: 'in_stock',
  });

  const { data: rental, isLoading } = useQuery({
    queryKey: ['rental', id],
    queryFn: () => api.rentals.getById(id!),
    enabled: !!id,
  });

  const endMutation = useMutation({
    mutationFn: (body: EndRentalBody) => api.rentals.end(id!, body),
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
    endMutation.mutate(form);
  }

  if (!id) return <p className="text-gray-500">{t('itemDetail.missingId')}</p>;
  if (isLoading) return <p className="text-gray-500">{t('dashboard.loading')}</p>;
  if (!rental) return <p className="text-gray-500">Rental not found</p>;
  if (rental.status !== 'active') return <p className="text-gray-500">Rental is already ended</p>;

  return (
    <div className="space-y-6">
      {error && (
        <CenteredToast message={error} variant="error" onDismiss={() => setError('')} />
      )}
      <Link to="/rentals" className="nav-link text-sm">
        ← {t('common.back')}
      </Link>
      <h1 className="text-2xl font-bold text-roomi-brown">{t('form.endRental')}</h1>
      <p className="text-gray-600">
        {rental.item?.title} — {rental.customer?.name} (expected end: {rental.expectedEndDate.slice(0, 10)})
      </p>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4 max-w-xl">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Actual end date *</label>
          <input
            type="date"
            value={form.actual_end_date ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, actual_end_date: e.target.value || null }))}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Item status after return *</label>
          <select
            value={form.next_item_status}
            onChange={(e) => setForm((f) => ({ ...f, next_item_status: e.target.value as EndRentalBody['next_item_status'] }))}
            className="input-field"
          >
            <option value="in_stock">{t('status.in_stock')}</option>
            <option value="disposed">{t('status.disposed')}</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Damage fee</label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={form.damage_fee ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, damage_fee: e.target.value ? Number(e.target.value) : null }))}
            className="input-field"
          />
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
            disabled={endMutation.isPending}
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
