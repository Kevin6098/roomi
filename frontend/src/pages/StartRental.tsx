import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type StartRentalBody } from '../api/client';
import { CenteredToast } from '../components/CenteredToast';

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
  const [showListingsChecklist, setShowListingsChecklist] = useState(false);
  const [listingsConfirmed, setListingsConfirmed] = useState<Record<string, boolean>>({});
  const [paymentReceived, setPaymentReceived] = useState(false);

  const { data: items = [] } = useQuery({
    queryKey: ['items', 'available'],
    queryFn: async () => {
      const [inStock, reserved] = await Promise.all([
        api.items.getMany({ status: 'in_stock' }),
        api.items.getMany({ status: 'reserved' }),
      ]);
      return [...inStock, ...reserved];
    },
  });
  const { data: selectedItem } = useQuery({
    queryKey: ['item', form.item_id],
    queryFn: () => api.items.getById(form.item_id),
    enabled: !!form.item_id,
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

  const activeListings = selectedItem?.itemListings?.filter((l) => l.status === 'active' || l.status === 'needs_update') ?? [];
  const isReserved = selectedItem?.status === 'reserved';
  const allListingsChecked = activeListings.length === 0 || activeListings.every((l) => listingsConfirmed[l.id]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (isReserved && !paymentReceived) {
      setError('Please confirm payment/deposit received for this reserved item');
      return;
    }
    if (activeListings.length > 0) {
      setShowListingsChecklist(true);
      setListingsConfirmed({});
      return;
    }
    doStartRental();
  }

  function doStartRental() {
    createMutation.mutate({
      ...form,
      payment_received: isReserved ? true : undefined,
      listing_ids: activeListings.map((l) => l.id),
    });
    setShowListingsChecklist(false);
  }

  return (
    <div className="space-y-6">
      {error && (
        <CenteredToast message={error} variant="error" onDismiss={() => setError('')} />
      )}
      <Link to="/rentals" className="nav-link text-sm">
        ← {t('common.back')}
      </Link>
      <h1 className="text-2xl font-bold text-roomi-brown">{t('form.startRental')}</h1>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4 max-w-xl">
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
        {!isReserved && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('table.customer')} *</label>
            <select
              value={form.customer_id ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, customer_id: e.target.value }))}
              className="input-field"
              required={!isReserved}
            >
              <option value="">—</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        )}
        {isReserved && (
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="payment_received_rental"
              checked={paymentReceived}
              onChange={(e) => setPaymentReceived(e.target.checked)}
              className="rounded border-roomi-brown/40"
            />
            <label htmlFor="payment_received_rental" className="text-sm font-medium text-roomi-brown">
              Payment/deposit received?
            </label>
          </div>
        )}
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
            disabled={createMutation.isPending || (isReserved && !paymentReceived)}
            className="btn-primary"
          >
            {t('common.save')}
          </button>
          <Link to="/rentals" className="btn-ghost">
            {t('common.cancel')}
          </Link>
        </div>
      </form>

      {showListingsChecklist && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowListingsChecklist(false)}>
          <div className="card p-6 max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-semibold text-roomi-brown mb-2">Update SNS posts</h3>
            <p className="text-sm text-roomi-brownLight mb-4">Confirm you updated or deleted each listing before finalizing the rental.</p>
            <ul className="space-y-2 mb-4">
              {activeListings.map((l) => (
                <li key={l.id} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`listing-rental-${l.id}`}
                    checked={!!listingsConfirmed[l.id]}
                    onChange={(e) => setListingsConfirmed((prev) => ({ ...prev, [l.id]: e.target.checked }))}
                    className="rounded border-roomi-brown/40"
                  />
                  <label htmlFor={`listing-rental-${l.id}`} className="text-sm">{l.platform}</label>
                </li>
              ))}
            </ul>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={doStartRental}
                disabled={!allListingsChecked || createMutation.isPending}
                className="btn-primary"
              >
                {createMutation.isPending ? t('dashboard.loading') : 'Confirm and start rental'}
              </button>
              <button type="button" onClick={() => setShowListingsChecklist(false)} className="btn-secondary">Back</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
