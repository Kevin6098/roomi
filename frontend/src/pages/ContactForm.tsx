import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type CreateContactBody } from '../api/client';

const SOURCE_PLATFORM_OPTIONS = [
  'Facebook', 'WeChat', 'Xiaohongshu', 'LINE', 'Whatsapp', 'Telegram',
  'Jimoty', 'Mercari', 'PayPayFlea', 'Rakuma', 'YahooAuction', 'Other',
];

export default function ContactForm() {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isEdit = !!id;
  const [error, setError] = useState('');

  const { data: contact, isLoading: loadingContact } = useQuery({
    queryKey: ['contact', id],
    queryFn: () => api.contacts.getById(id!),
    enabled: isEdit,
  });

  const [form, setForm] = useState<CreateContactBody & { source_platform_other?: string }>({
    source_platform: '',
    name: '',
    platform_user_id: null,
    phone: null,
    email: null,
  });

  useEffect(() => {
    if (contact) {
      const isOther = !SOURCE_PLATFORM_OPTIONS.includes(contact.sourcePlatform as typeof SOURCE_PLATFORM_OPTIONS[number]);
      setForm({
        source_platform: isOther ? 'Other' : contact.sourcePlatform,
        source_platform_other: isOther ? contact.sourcePlatform : undefined,
        name: contact.name,
        platform_user_id: contact.platformUserId ?? null,
        phone: contact.phone ?? null,
        email: contact.email ?? null,
      });
    }
  }, [contact]);

  const updateMutation = useMutation({
    mutationFn: (body: Partial<CreateContactBody>) => api.contacts.update(id!, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      queryClient.invalidateQueries({ queryKey: ['contact', id] });
    },
    onError: (e) => setError((e as Error).message),
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const platformVal = form.source_platform === 'Other' ? (form.source_platform_other?.trim() || 'Other') : form.source_platform;
    updateMutation.mutate({
      source_platform: platformVal,
      name: form.name.trim(),
      platform_user_id: form.platform_user_id?.trim() || null,
      phone: form.phone?.trim() || null,
      email: form.email?.trim() || null,
    });
  }

  if (isEdit && loadingContact) return <p className="text-roomi-brownLight">{t('dashboard.loading')}</p>;
  if (isEdit && !contact) return <p className="text-roomi-brownLight">Contact not found</p>;

  return (
    <div className="space-y-6">
      <Link to="/customers" className="nav-link text-sm">
        ← {t('common.back')}
      </Link>
      <h1 className="text-2xl font-bold text-roomi-brown">
        {t('form.editCustomer')}
      </h1>
      <form onSubmit={handleSubmit} className="card p-6 space-y-4 max-w-xl">
        {error && (
          <div className="rounded bg-red-50 text-red-700 text-sm px-3 py-2">{error}</div>
        )}
        <div>
          <label className="label">{t('input.sourcePlatform')} *</label>
          <select
            value={form.source_platform === 'Other' ? 'Other' : form.source_platform}
            onChange={(e) => setForm((f) => ({ ...f, source_platform: e.target.value }))}
            className="input-field"
          >
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
            value={form.platform_user_id ?? ''}
            onChange={(e) => setForm((f) => ({ ...f, platform_user_id: e.target.value || null }))}
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
          <button type="submit" disabled={updateMutation.isPending} className="btn-primary">
            {t('common.save')}
          </button>
          <Link to="/customers" className="btn-ghost">
            {t('common.cancel')}
          </Link>
        </div>
      </form>
    </div>
  );
}
