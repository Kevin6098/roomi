import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type CreateCustomerBody } from '../api/client';

const SOURCE_PLATFORM_OPTIONS = [
  'Facebook', 'WeChat', 'Xiaohongshu', 'LINE', 'Whatsapp', 'Telegram',
  'Jimoty', 'Mercari', 'PayPayFlea', 'Rakuma', 'YahooAuction', 'Other',
] as const;

type FormState = CreateCustomerBody & { source_platform_other?: string };

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

  const [form, setForm] = useState<FormState>({
    name: '',
    source_platform: null,
    app_id: null,
    phone: null,
    email: null,
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
    };
    if (isEdit) updateMutation.mutate(body);
    else createMutation.mutate(body);
  }

  if (isEdit && loadingCustomer) return <p className="text-roomi-brownLight">{t('dashboard.loading')}</p>;
  if (isEdit && !customer) return <p className="text-roomi-brownLight">Customer not found</p>;

  return (
    <div className="space-y-6">
      <Link to="/customers" className="nav-link text-sm">
        ← {t('common.back')}
      </Link>
      <h1 className="text-2xl font-bold text-roomi-brown">
        {isEdit ? t('form.editCustomer') : t('form.newCustomer')}
      </h1>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4 max-w-xl">
        {error && (
          <div className="rounded bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>
        )}
        <div>
          <label className="label">{t('input.sourcePlatform')} *</label>
          <select
            value={form.source_platform === null || form.source_platform === '' ? '' : (form.source_platform === 'Other' ? 'Other' : form.source_platform)}
            onChange={(e) => setForm((f) => ({ ...f, source_platform: e.target.value === '' ? null : e.target.value }))}
            className="input-field"
            required={!isEdit}
          >
            <option value="">—</option>
            {SOURCE_PLATFORM_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt === 'Other' ? t('input.sourcePlatformOther') : opt}</option>
            ))}
          </select>
          {form.source_platform === 'Other' && (
            <input
              type="text"
              value={form.source_platform_other ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, source_platform_other: e.target.value }))}
              className="input-field mt-2"
              placeholder={t('input.sourcePlatformOther')}
            />
          )}
        </div>
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
            onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value || null }))}
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
