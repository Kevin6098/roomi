import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, type Contact, type Customer } from '../api/client';

type ListRow = { id: string; name: string; platform: string; type: 'contact' | 'customer' };

const ALL_PLATFORMS = '';

export default function Customers() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [platformFilter, setPlatformFilter] = useState(ALL_PLATFORMS);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleteType, setDeleteType] = useState<'contact' | 'customer'>('customer');

  const { data: customers = [], isLoading: loadingCustomers, error: errorCustomers } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.customers.getMany(),
    retry: false,
  });
  const { data: contacts = [], isLoading: loadingContacts, error: errorContacts } = useQuery({
    queryKey: ['contacts'],
    queryFn: () => api.contacts.getMany(),
    retry: false,
  });

  const fullList = useMemo(() => {
    const fromContacts: ListRow[] = (contacts as Contact[]).map((c) => ({
      id: c.id,
      name: c.name,
      platform: c.sourcePlatform ?? '—',
      type: 'contact' as const,
    }));
    const fromCustomers: ListRow[] = (customers as Customer[])
      .filter((c) => !c.contactId)
      .map((c) => ({
        id: c.id,
        name: c.name,
        platform: c.sourcePlatform ?? '—',
        type: 'customer' as const,
      }));
    return [...fromContacts, ...fromCustomers].sort((a, b) => a.name.localeCompare(b.name));
  }, [contacts, customers]);

  const platformOptions = useMemo(() => {
    const set = new Set<string>(fullList.map((r) => r.platform).filter((p) => p && p !== '—'));
    return [ALL_PLATFORMS, ...Array.from(set).sort()];
  }, [fullList]);

  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    const byPlatform = platformFilter === ALL_PLATFORMS
      ? fullList
      : fullList.filter((r) => r.platform === platformFilter);
    if (!q) return byPlatform;
    return byPlatform.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.platform.toLowerCase().includes(q)
    );
  }, [fullList, search, platformFilter]);

  const deleteCustomerMutation = useMutation({
    mutationFn: (id: string) => api.customers.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      setDeleteId(null);
    },
  });
  const deleteContactMutation = useMutation({
    mutationFn: (id: string) => api.contacts.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setDeleteId(null);
    },
  });

  const isLoading = loadingCustomers || loadingContacts;
  const customersFailed = !!errorCustomers;
  const contactsFailed = !!errorContacts;
  const bothFailed = customersFailed && contactsFailed;

  if (isLoading) return <p className="text-roomi-brownLight">{t('dashboard.loading')}</p>;
  if (bothFailed) {
    return (
      <div className="space-y-4">
        <p className="text-red-600 font-medium">{(errorCustomers as Error).message}</p>
        <p className="text-roomi-brownLight text-sm">
          Make sure the backend is running and database migrations are applied (run in backend: npx prisma migrate deploy).
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {contactsFailed && (
        <div className="rounded-xl bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 text-sm">
          Contacts could not be loaded ({(errorContacts as Error).message}). Showing customers only. Run backend migrations if needed: <code className="bg-amber-100 px-1.5 py-0.5 rounded">npx prisma migrate deploy</code>
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-roomi-brown">{t('nav.customers')}</h1>
          <p className="mt-1 text-sm text-roomi-brownLight">
            {fullList.length === 0
              ? t('empty.noCustomers')
              : list.length === fullList.length
                ? `${list.length} ${list.length === 1 ? t('table.customer').toLowerCase() : t('nav.customers').toLowerCase()}`
                : `${list.length} ${t('customers.of')} ${fullList.length}`}
          </p>
        </div>
        <Link to="/customers/new" className="btn-primary shrink-0">
          {t('actions.add')} {t('nav.customers')}
        </Link>
      </div>

      {fullList.length > 0 && (
        <div className="rounded-roomiLg border-2 border-roomi-peach bg-white px-4 py-3 shadow-roomi">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <label htmlFor="customers-search" className="text-sm font-semibold text-roomi-brown sm:sr-only">
              {t('common.search')}
            </label>
            <input
              id="customers-search"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('customers.searchPlaceholder')}
              className="w-full sm:max-w-[280px] rounded-roomi border-2 border-roomi-brown/25 bg-roomi-cream/80 px-3 py-2.5 text-sm font-medium text-roomi-brown placeholder-roomi-brownLight focus:border-roomi-orange focus:bg-white focus:outline-none focus:ring-2 focus:ring-roomi-orange/30"
            />
            <label htmlFor="customers-platform-filter" className="text-sm font-semibold text-roomi-brown sm:sr-only">
              {t('table.platform')}
            </label>
            <select
              id="customers-platform-filter"
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
              className="w-full sm:w-auto sm:min-w-[180px] rounded-roomi border-2 border-roomi-brown/25 bg-roomi-cream/80 px-3 py-2.5 text-sm font-medium text-roomi-brown focus:border-roomi-orange focus:bg-white focus:outline-none focus:ring-2 focus:ring-roomi-orange/30 appearance-none cursor-pointer"
            >
              <option value={ALL_PLATFORMS}>{t('customers.allPlatforms')}</option>
              {platformOptions.filter((p) => p !== ALL_PLATFORMS).map((platform) => (
                <option key={platform} value={platform}>{platform}</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {list.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-roomi-peach/40 flex items-center justify-center text-roomi-brownLight mb-4">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-roomi-brownLight font-medium">
            {fullList.length === 0 ? t('empty.noCustomers') : t('customers.noResults')}
          </p>
          {fullList.length === 0 && (
            <Link to="/customers/new" className="btn-primary mt-4 inline-block">
              {t('actions.add')} {t('nav.customers')}
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {list.map((row) => (
            <div
              key={`${row.type}-${row.id}`}
              className="card p-5 flex flex-col gap-3 hover:shadow-roomiMd transition-shadow"
            >
              <div className="flex items-start justify-between gap-3 min-w-0">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-roomi-brown truncate" title={row.name}>
                    {row.name}
                  </p>
                  <span className="inline-block mt-1.5 text-xs font-medium text-roomi-brownLight bg-roomi-peach/50 rounded-full px-2.5 py-1">
                    {row.platform}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {row.type === 'customer' ? (
                    <Link
                      to={`/customers/${row.id}/edit`}
                      className="p-2 rounded-roomi text-roomi-brownLight hover:bg-roomi-peach/60 hover:text-roomi-orange transition-colors"
                      title={t('actions.edit')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </Link>
                  ) : (
                    <Link
                      to={`/contacts/${row.id}/edit`}
                      className="p-2 rounded-roomi text-roomi-brownLight hover:bg-roomi-peach/60 hover:text-roomi-orange transition-colors"
                      title={t('actions.edit')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                    </Link>
                  )}
                  {deleteId !== row.id || deleteType !== row.type ? (
                    <button
                      type="button"
                      onClick={() => { setDeleteId(row.id); setDeleteType(row.type); }}
                      className="p-2 rounded-roomi text-roomi-brownLight hover:bg-red-50 hover:text-red-600 transition-colors"
                      title={t('actions.delete')}
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  ) : null}
                </div>
              </div>
              {deleteId === row.id && deleteType === row.type && (
                <div className="flex items-center gap-2 pt-1 border-t border-roomi-peach/40 text-sm">
                  <span className="text-roomi-brownLight">{t('form.confirmDelete')}</span>
                  <button
                    type="button"
                    onClick={() => (row.type === 'customer' ? deleteCustomerMutation.mutate(row.id) : deleteContactMutation.mutate(row.id))}
                    disabled={deleteCustomerMutation.isPending || deleteContactMutation.isPending}
                    className="text-red-600 hover:underline font-medium"
                  >
                    {t('common.yes')}
                  </button>
                  <button type="button" onClick={() => setDeleteId(null)} className="text-roomi-brownLight hover:underline">
                    {t('common.cancel')}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
