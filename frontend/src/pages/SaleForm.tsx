import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type CreateSaleBody, type UpdateSaleBody } from '../api/client';

export default function SaleForm() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const today = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState<CreateSaleBody & UpdateSaleBody>({
    item_id: '',
    customer_id: '',
    sale_price: 0,
    sale_date: today,
  });
  const [error, setError] = useState('');

  const { data: sale, isLoading: loadingSale } = useQuery({
    queryKey: ['sale', id],
    queryFn: () => api.sales.getById(id!),
    enabled: isEdit,
  });

  const { data: items = [] } = useQuery({
    queryKey: ['items', 'saleable'],
    queryFn: async () => {
      const [a, b] = await Promise.all([
        api.items.getMany({ status: 'in_stock' }),
        api.items.getMany({ status: 'listed' }),
      ]);
      return [...a, ...b];
    },
    enabled: !isEdit,
  });
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.customers.getMany(),
  });

  useEffect(() => {
    if (sale) {
      setForm({
        item_id: sale.itemId,
        customer_id: sale.customerId,
        sale_price: sale.salePrice != null ? Number(sale.salePrice) : 0,
        sale_date: sale.saleDate.slice(0, 10),
        platform_sold: sale.platformSold ?? null,
        handover_location: sale.handoverLocation ?? null,
        notes: sale.notes ?? null,
      });
    }
  }, [sale]);

  const createMutation = useMutation({
    mutationFn: (body: CreateSaleBody) => api.sales.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      navigate('/sales');
    },
    onError: (e) => setError((e as Error).message),
  });
  const updateMutation = useMutation({
    mutationFn: (body: UpdateSaleBody) => api.sales.update(id!, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sale', id] });
      navigate('/sales');
    },
    onError: (e) => setError((e as Error).message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (isEdit) {
      updateMutation.mutate({
        sale_price: form.sale_price,
        sale_date: form.sale_date,
        platform_sold: form.platform_sold,
        handover_location: form.handover_location,
        notes: form.notes,
      });
    } else {
      if (!form.item_id || !form.customer_id) {
        setError('Item and customer are required');
        return;
      }
      createMutation.mutate({
        item_id: form.item_id,
        customer_id: form.customer_id ?? undefined,
        sale_price: form.sale_price != null ? form.sale_price : 0,
        sale_date: form.sale_date!,
        platform_sold: form.platform_sold,
        handover_location: form.handover_location,
        notes: form.notes,
      });
    }
  }

  if (isEdit && loadingSale) return <p className="text-gray-500">{t('dashboard.loading')}</p>;
  if (isEdit && !sale) return <p className="text-gray-500">Sale not found</p>;

  return (
    <div className="space-y-6">
      <Link to="/sales" className="nav-link text-sm">
        ← {t('common.back')}
      </Link>
      <h1 className="text-2xl font-bold text-roomi-brown">
        {isEdit ? t('form.editSale') : t('form.newSale')}
      </h1>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4 max-w-xl">
        {error && (
          <div className="rounded bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>
        )}
        {!isEdit && (
          <>
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
                  <option key={i.id} value={i.id}>{i.title}</option>
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
          </>
        )}
        {isEdit && (
          <p className="text-gray-600">
            {sale?.item?.title} — {sale?.customer?.name}
          </p>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('table.saleDate')} *</label>
            <input
              type="date"
              value={form.sale_date ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, sale_date: e.target.value }))}
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('table.price')}</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.sale_price ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, sale_price: e.target.value ? Number(e.target.value) : 0 }))}
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
            disabled={createMutation.isPending || updateMutation.isPending}
            className="btn-primary"
          >
            {t('common.save')}
          </button>
          <Link to="/sales" className="btn-ghost">
            {t('common.cancel')}
          </Link>
        </div>
      </form>
    </div>
  );
}
