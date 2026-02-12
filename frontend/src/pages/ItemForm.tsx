import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type CreateItemBody } from '../api/client';
import { PREFECTURES, UNDECIDED, getCitiesForPrefecture } from '../data/locationData';
import { CenteredToast } from '../components/CenteredToast';

const STATUS_OPTIONS = ['overdue', 'in_stock', 'reserved', 'rented', 'sold', 'disposed'] as const;
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

  const [form, setForm] = useState<CreateItemBody & { custom_sub_category?: string | null }>({
    title: '',
    sub_category_id: '',
    custom_sub_category: null,
    acquisition_type: 'bought',
    acquisition_cost: 0,
    original_price: 0,
    condition: 'good',
    prefecture: UNDECIDED,
    city: UNDECIDED,
    exact_location: null,
    location_visibility: 'hidden',
    status: 'in_stock',
  });
  const [showLocationFields, setShowLocationFields] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setForm({
        title: item.title,
        sub_category_id: item.subCategoryId,
        custom_sub_category: item.customSubCategory ?? null,
        acquisition_contact_id: item.acquisitionContactId ?? undefined,
        acquisition_type: item.acquisitionType as CreateItemBody['acquisition_type'],
        acquisition_cost: Number(item.acquisitionCost),
        original_price: item.originalPrice != null ? Number(item.originalPrice) : null,
        condition: item.condition as CreateItemBody['condition'],
        prefecture: item.prefecture ?? UNDECIDED,
        city: item.city ?? UNDECIDED,
        exact_location: item.exactLocation ?? null,
        location_visibility: item.locationVisibility ?? 'hidden',
        status: item.status as CreateItemBody['status'],
        acquisition_date: item.acquisitionDate?.slice(0, 10) ?? null,
        notes: item.notes ?? null,
      });
      setShowLocationFields(
        (item.prefecture && item.prefecture !== UNDECIDED) ||
          (item.city && item.city !== UNDECIDED) ||
          !!item.exactLocation
      );
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
    const isOther = subCategories.find((c) => c.id === subId)?.name?.toLowerCase() === 'other';
    if (isOther && (!form.custom_sub_category?.trim() || form.custom_sub_category.trim().length < 2)) {
      setError(t('input.customSubCategoryRequired'));
      return;
    }
    const body = {
      ...form,
      sub_category_id: subId,
      acquisition_cost: Number(form.acquisition_cost) || 0,
      original_price: Number(form.original_price) ?? 0,
      custom_sub_category: isOther ? (form.custom_sub_category ?? null) : null,
    };
    if (isEdit) updateMutation.mutate(body);
    else createMutation.mutate(body as CreateItemBody);
  }

  if (isEdit && loadingItem) return <p className="text-roomi-brownLight">{t('dashboard.loading')}</p>;
  if (isEdit && !item) return <p className="text-roomi-brownLight">Item not found</p>;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      {error && (
        <CenteredToast message={error} variant="error" onDismiss={() => setError('')} />
      )}
      <Link to={isEdit ? `/items/${id}` : '/items'} className="nav-link text-sm">
        ← {t('common.back')}
      </Link>
      <h1 className="text-2xl font-bold text-roomi-brown">
        {isEdit ? t('form.editItem') : t('form.newItem')}
      </h1>
      <form onSubmit={handleSubmit} className="card p-6 sm:p-8 space-y-5">
        <div>
          <label className="label">{t('table.title')} *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            className="input-field"
            required
          />
        </div>
        <div>
          <label className="label">{t('table.category')} *</label>
          <div className="flex gap-2">
            <select
              value={mainId}
              onChange={(e) => {
                setMainId(e.target.value);
                setForm((f) => ({ ...f, sub_category_id: '' }));
              }}
              className="input-field flex-1"
            >
              <option value="">—</option>
              {mainCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              value={form.sub_category_id}
              onChange={(e) => setForm((f) => ({ ...f, sub_category_id: e.target.value, custom_sub_category: null }))}
              className="input-field flex-1"
              required
            >
              <option value="">—</option>
              {subCategories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          {subCategories.find((c) => c.id === form.sub_category_id)?.name?.toLowerCase() === 'other' && (
            <div className="mt-2">
              <label className="label">{t('input.customSubCategory')} *</label>
              <input
                type="text"
                value={form.custom_sub_category ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, custom_sub_category: e.target.value.trim() || null }))}
                className="input-field mt-1"
                placeholder="e.g. gaming_chair, coffee_machine"
                maxLength={120}
              />
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">{t('itemDetail.conditionLabel')}</label>
            <select
              value={form.condition}
              onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value as CreateItemBody['condition'] }))}
              className="input-field"
            >
              {CONDITION_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">{t('table.status')}</label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as CreateItemBody['status'] }))}
              className="input-field"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{t(`status.${s}`)}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">{t('itemDetail.acquisitionLabel')}</label>
            <select
              value={form.acquisition_type}
              onChange={(e) => setForm((f) => ({ ...f, acquisition_type: e.target.value as CreateItemBody['acquisition_type'] }))}
              className="input-field"
            >
              {ACQUISITION_OPTIONS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Cost</label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={form.acquisition_cost === undefined ? '' : form.acquisition_cost}
              onChange={(e) => setForm((f) => ({ ...f, acquisition_cost: e.target.value === '' ? undefined : Number(e.target.value) }))}
              className="input-field"
            />
          </div>
        </div>
        <div>
          <label className="label">{t('input.originalPrice')} *</label>
          <input
            type="number"
            min={0}
            step={0.01}
            value={form.original_price === undefined || form.original_price === null ? '' : form.original_price}
            onChange={(e) => setForm((f) => ({ ...f, original_price: e.target.value === '' ? 0 : Number(e.target.value) }))}
            className="input-field"
            required
          />
        </div>
        <div>
          <button type="button" onClick={() => setShowLocationFields((v) => !v)} className="text-sm font-semibold text-roomi-orange hover:underline">
            {showLocationFields ? '− ' : '+ '}{t('input.decideLocation')}
          </button>
          {showLocationFields && (
            <div className="mt-3 space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">{t('input.prefecture')}</label>
                  <select
                    value={form.prefecture ?? UNDECIDED}
                    onChange={(e) => {
                      const p = e.target.value;
                      const cities = getCitiesForPrefecture(p);
                      setForm((f) => ({ ...f, prefecture: p, city: cities[0] ?? UNDECIDED }));
                    }}
                    className="input-field"
                  >
                    {PREFECTURES.map((pref) => <option key={pref} value={pref}>{pref === UNDECIDED ? t('input.undecided') : pref}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">{t('input.city')}</label>
                  <select value={form.city ?? UNDECIDED} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} className="input-field">
                    {getCitiesForPrefecture(form.prefecture ?? UNDECIDED).map((c) => <option key={c} value={c}>{c === UNDECIDED ? t('input.undecided') : c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="label">{t('input.addExactLocation')}</label>
                <input type="text" value={form.exact_location ?? ''} onChange={(e) => setForm((f) => ({ ...f, exact_location: e.target.value.trim() || null }))} className="input-field" placeholder={t('input.addExactLocation')} />
              </div>
            </div>
          )}
        </div>
        <div>
          <label className="label">{t('itemDetail.notesLabel')}</label>
          <textarea
            value={form.notes ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value || null }))}
            className="input-field"
            rows={2}
          />
        </div>
        <div className="flex gap-3 pt-1">
          <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="btn-primary">
            {t('common.save')}
          </button>
          <Link to={isEdit ? `/items/${id}` : '/items'} className="btn-ghost">
            {t('common.cancel')}
          </Link>
        </div>
      </form>
    </div>
  );
}
