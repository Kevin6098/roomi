import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type CreateItemBody } from '../api/client';

const STATUS_OPTIONS = ['in_stock', 'listed', 'reserved', 'rented', 'sold', 'disposed'] as const;
const CONDITION_OPTIONS = ['new', 'good', 'fair', 'poor'] as const;
const ACQUISITION_OPTIONS = ['free', 'cheap', 'bought'] as const;

export default function ItemForm() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const { data: item, isLoading: loadingItem } = useQuery({
    queryKey: ['item', id],
    queryFn: () => api.items.getById(id!),
    enabled: isEdit,
  });

  const { data: mainCategories = [] } = useQuery({
    queryKey: ['categories', 'main'],
    queryFn: () => api.categories.getMain(),
  });

  const [mainId, setMainId] = useState('');
  const { data: subCategories = [] } = useQuery({
    queryKey: ['categories', 'sub', mainId],
    queryFn: () => api.categories.getSub(mainId),
    enabled: !!mainId,
  });

  const [form, setForm] = useState<CreateItemBody>({
    title: '',
    sub_category_id: '',
    acquisition_type: 'bought',
    acquisition_cost: 0,
    condition: 'good',
    status: 'in_stock',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setForm({
        title: item.title,
        sub_category_id: item.subCategoryId,
        source_platform: item.subCategory?.mainCategory?.name ?? null,
        acquisition_type: item.acquisitionType as CreateItemBody['acquisition_type'],
        acquisition_cost: Number(item.acquisitionCost),
        original_price: item.originalPrice != null ? Number(item.originalPrice) : null,
        condition: item.condition as CreateItemBody['condition'],
        location_area: item.locationArea ?? null,
        exact_location: item.exactLocation ?? null,
        status: item.status as CreateItemBody['status'],
        acquisition_date: item.acquisitionDate?.slice(0, 10) ?? null,
        notes: item.notes ?? null,
      });
      setMainId(item.subCategory?.mainCategory?.id ?? '');
    }
  }, [item]);

  useEffect(() => {
    if (mainCategories.length && !mainId && item?.subCategory?.mainCategory?.id) setMainId(item.subCategory.mainCategory.id);
  }, [mainCategories, mainId, item]);

  const createMutation = useMutation({
    mutationFn: (body: CreateItemBody) => api.items.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      navigate('/items');
    },
    onError: (e) => setError((e as Error).message),
  });
  const updateMutation = useMutation({
    mutationFn: (body: Partial<CreateItemBody>) => api.items.update(id!, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['item', id] });
      navigate(`/items/${id}`);
    },
    onError: (e) => setError((e as Error).message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const subId = form.sub_category_id || (subCategories[0]?.id);
    if (!subId) {
      setError('Please select a category');
      return;
    }
    const body = { ...form, sub_category_id: subId };
    if (isEdit) updateMutation.mutate(body);
    else createMutation.mutate(body as CreateItemBody);
  }

  if (isEdit && loadingItem) return <p className="text-gray-500">{t('dashboard.loading')}</p>;
  if (isEdit && !item) return <p className="text-gray-500">Item not found</p>;

  return (
    <div className="space-y-6">
      <Link to={isEdit ? `/items/${id}` : '/items'} className="text-sm text-blue-600 hover:underline">
        ← {t('common.back')}
      </Link>
      <h1 className="text-2xl font-semibold text-gray-900">
        {isEdit ? t('form.editItem') : t('form.newItem')}
      </h1>
      <form onSubmit={handleSubmit} className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm space-y-4 max-w-xl">
        {error && (
          <div className="rounded bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('table.title')} *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('table.category')} *</label>
          <div className="flex gap-2">
            <select
              value={mainId}
              onChange={(e) => {
                setMainId(e.target.value);
                setForm((f) => ({ ...f, sub_category_id: '' }));
              }}
              className="rounded border border-gray-300 px-3 py-2 text-sm flex-1"
            >
              <option value="">—</option>
              {mainCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              value={form.sub_category_id}
              onChange={(e) => setForm((f) => ({ ...f, sub_category_id: e.target.value }))}
              className="rounded border border-gray-300 px-3 py-2 text-sm flex-1"
              required
            >
              <option value="">—</option>
              {subCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('itemDetail.conditionLabel')}</label>
            <select
              value={form.condition}
              onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value as CreateItemBody['condition'] }))}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              {CONDITION_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('table.status')}</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as CreateItemBody['status'] }))}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{t(`status.${s}`)}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{t('itemDetail.acquisitionLabel')}</label>
            <select
              value={form.acquisition_type}
              onChange={(e) => setForm((f) => ({ ...f, acquisition_type: e.target.value as CreateItemBody['acquisition_type'] }))}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            >
              {ACQUISITION_OPTIONS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cost</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.acquisition_cost ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, acquisition_cost: Number(e.target.value) || 0 }))}
              className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('itemDetail.locationLabel')}</label>
          <input
            type="text"
            value={form.exact_location ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, exact_location: e.target.value || null }))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">{t('itemDetail.notesLabel')}</label>
          <textarea
            value={form.notes ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value || null }))}
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm"
            rows={2}
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
            to={isEdit ? `/items/${id}` : '/items'}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            {t('common.cancel')}
          </Link>
        </div>
      </form>
    </div>
  );
}
