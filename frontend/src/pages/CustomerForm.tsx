import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type CreateCustomerBody } from '../api/client';
import { CenteredToast } from '../components/CenteredToast';
import { PREFECTURES, getCitiesForPrefecture, UNDECIDED, getPrefectureDisplayName, getCityDisplayName } from '../data/locationData';
import { PLATFORM_OPTIONS as SOURCE_PLATFORM_OPTIONS } from '../data/platforms';

type FormState = CreateCustomerBody & { source_platform_other?: string };

export default function CustomerForm() {
  const { id } = useParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = !!id;

  const { data: customer, isLoading: loadingCustomer } = useQuery({
    queryKey: ['customer', id],
    queryFn: () => api.customers.getById(id!),
    enabled: isEdit,
  });

  const [form, setForm] = useState<FormState>({
    name: '',
    source_platform: null,
    app_id: null,
    phone: null,
    email: null,
    prefecture: null,
    city: null,
    exact_location: null,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (customer) {
      const isOther = customer.sourcePlatform != null &&
        !SOURCE_PLATFORM_OPTIONS.includes(customer.sourcePlatform as typeof SOURCE_PLATFORM_OPTIONS[number]);
      setForm({
        name: customer.name,
        source_platform: isOther ? 'Other' : (customer.sourcePlatform ?? null),
        source_platform_other: isOther ? customer.sourcePlatform ?? undefined : undefined,
        app_id: customer.appId ?? null,
        phone: customer.phone ?? null,
        email: customer.email ?? null,
        prefecture: customer.prefecture ?? null,
        city: customer.city ?? null,
        exact_location: customer.exactLocation ?? null,
      });
    }
  }, [customer]);

  const createMutation = useMutation({
    mutationFn: (body: CreateCustomerBody) => api.customers.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      navigate('/customers');
    },
    onError: (e) => setError((e as Error).message),
  });
  const updateMutation = useMutation({
    mutationFn: (body: Partial<CreateCustomerBody>) => api.customers.update(id!, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['customer', id] });
      navigate('/customers');
    },
    onError: (e) => setError((e as Error).message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const sourcePlatform = form.source_platform === 'Other'
      ? (form.source_platform_other?.trim() || 'Other')
      : (form.source_platform ?? '');
    const body: CreateCustomerBody = {
      name: form.name.trim(),
      source_platform: sourcePlatform || null,
      app_id: form.app_id?.trim() || null,
      phone: form.phone?.trim() || null,
      email: form.email?.trim() || null,
      prefecture: form.prefecture?.trim() || null,
      city: form.city?.trim() || null,
      exact_location: form.exact_location?.trim() || null,
    };
    if (isEdit) updateMutation.mutate(body);
    else createMutation.mutate(body);
  }

  if (isEdit && loadingCustomer) return <p className="text-roomi-brownLight">{t('dashboard.loading')}</p>;
  if (isEdit && !customer) return <p className="text-roomi-brownLight">Customer not found</p>;

  return (
    <div className="space-y-6">
      {error && (
        <CenteredToast message={error} variant="error" onDismiss={() => setError('')} />
      )}
      <Link to="/customers" className="nav-link text-sm">
        ← {t('common.back')}
      </Link>
      <h1 className="text-2xl font-bold text-roomi-brown">
        {isEdit ? t('form.editCustomer') : t('form.newCustomer')}
      </h1>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4 max-w-xl">
        <p className="text-sm text-roomi-brownLight mb-4">{t('input.sourcePlatformHint')}</p>
        <div className="flex flex-wrap gap-2 items-center mb-4">
          <select
            value={form.source_platform === null || form.source_platform === '' ? '' : (form.source_platform === 'Other' ? 'Other' : form.source_platform)}
            onChange={(e) => setForm((f) => ({ ...f, source_platform: e.target.value === '' ? null : e.target.value }))}
            className="input-field flex-1 min-w-[120px]"
            required={!isEdit}
            aria-label={t('input.sourcePlatform')}
          >
            <option value="">—</option>
            {SOURCE_PLATFORM_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt === 'Other' ? t('input.sourcePlatformOther') : t('platform.' + opt)}</option>
            ))}
          </select>
          <input
            type="text"
            value={form.app_id ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, app_id: e.target.value || null }))}
            className="input-field flex-1 min-w-[140px]"
            placeholder={t('listings.refIdOptional')}
          />
        </div>
        {form.source_platform === 'Other' && (
          <div className="mb-4">
            <input
              type="text"
              value={form.source_platform_other ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, source_platform_other: e.target.value }))}
              className="input-field w-full max-w-xs"
              placeholder={t('input.sourcePlatformOther')}
            />
          </div>
        )}
        <div>
          <label className="label">{t('table.name')} *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            className="input-field"
            required
          />
        </div>

        <div className="border-t border-roomi-peach/40 pt-4 mt-2">
          <h3 className="text-sm font-semibold text-roomi-brown mb-1">{t('input.defaultLocation')}</h3>
          <p className="text-xs text-roomi-brownLight mb-3">{t('input.defaultLocationHint')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label">{t('input.prefecture')}</label>
              <select
                value={form.prefecture ?? UNDECIDED}
                onChange={(e) => {
                  const p = e.target.value;
                  const cities = getCitiesForPrefecture(p);
                  setForm((f) => ({ ...f, prefecture: p === UNDECIDED ? null : p, city: cities[0] === UNDECIDED ? null : cities[0] }));
                }}
                className="input-field"
              >
                {PREFECTURES.map((pref) => (
                  <option key={pref} value={pref}>{pref === UNDECIDED ? t('input.undecided') : getPrefectureDisplayName(pref, i18n.language)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">{t('input.city')}</label>
              <select
                value={form.city ?? UNDECIDED}
                onChange={(e) => setForm((f) => ({ ...f, city: e.target.value === UNDECIDED ? null : e.target.value }))}
                className="input-field"
              >
                {getCitiesForPrefecture(form.prefecture ?? UNDECIDED).map((c) => (
                  <option key={c} value={c}>{c === UNDECIDED ? t('input.undecided') : getCityDisplayName(c, form.prefecture ?? UNDECIDED, i18n.language)}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="mt-3">
            <label className="label">{t('input.addExactLocationOptional')}</label>
            <input
              type="text"
              value={form.exact_location ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, exact_location: e.target.value.trim() || null }))}
              className="input-field"
              placeholder={t('input.addExactLocationOptional')}
            />
          </div>
        </div>

        <div>
          <label className="label">{t('input.platformId')}</label>
          <input
            type="text"
            value={form.app_id ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, app_id: e.target.value || null }))}
            className="input-field"
            placeholder={t('input.platformIdPlaceholder')}
          />
        </div>
        <div>
          <label className="label">{t('table.phone')}</label>
          <input
            type="text"
            value={form.phone ?? ''}
            onChange={(e) => {
              const digits = e.target.value.replace(/\D/g, '');
              setForm((f) => ({ ...f, phone: digits || null }));
            }}
            inputMode="numeric"
            pattern="[0-9]*"
            className="input-field"
          />
        </div>
        <div>
          <label className="label">{t('table.email')}</label>
          <input
            type="email"
            value={form.email ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value || null }))}
            className="input-field"
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
          <Link
            to="/customers"
            className="btn-ghost"
          >
            {t('common.cancel')}
          </Link>
        </div>
      </form>
    </div>
  );
}
