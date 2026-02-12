import { useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { api, type Item, type ItemListing, type CreateContactBody } from '../api/client';
import { getDisplayLocation } from '../data/locationData';
import { getStatusBadgeClass } from '../utils/statusStyles';
import { getSubCategoryDisplayName } from '../utils/categoryDisplay';
import { LISTING_PLATFORMS } from '../data/listingPlatforms';
import { CenteredToast } from '../components/CenteredToast';

const SOURCE_PLATFORM_OPTIONS = [
  'Facebook', 'WeChat', 'Xiaohongshu', 'LINE', 'Whatsapp', 'Telegram',
  'Jimoty', 'Mercari', 'PayPayFlea', 'Rakuma', 'YahooAuction', 'Other',
] as const;
const SOURCE_PLATFORM_OTHER = 'Other';
const SOURCE_PLATFORM_OTHER_SENTINEL = '__other__';

const emptyReserveContact = (): {
  source_platform: string;
  source_platform_other: string;
  name: string;
  platform_user_id: string;
  phone: string;
  email: string;
} => ({
  source_platform: '',
  source_platform_other: '',
  name: '',
  platform_user_id: '',
  phone: '',
  email: '',
});

export default function Items() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status') ?? '';
  const [search, setSearch] = useState('');
  const [listedModalItem, setListedModalItem] = useState<Item | null>(null);
  const [reserveModalItem, setReserveModalItem] = useState<Item | null>(null);

  const { data: itemsRaw, isLoading, error } = useQuery({
    queryKey: ['items', status, search],
    queryFn: () => api.items.getMany({ status: status || undefined, search: search || undefined }),
  });

  const STATUS_ORDER = ['overdue', 'in_stock', 'reserved', 'rented', 'sold', 'disposed'] as const;

  function getItemStatusDateForSort(item: Item): string {
    const d =
      item.status === 'in_stock' || item.status === 'overdue'
        ? (item.acquisitionDate || item.createdAt)
        : item.status === 'sold'
          ? item.sale?.saleDate
          : item.status === 'rented'
            ? item.rentals?.[0]?.startDate
            : (item.status === 'disposed' || item.status === 'reserved')
              ? item.updatedAt
              : null;
    if (!d) return '0000-00-00';
    return typeof d === 'string' ? d.slice(0, 10) : new Date(d).toISOString().slice(0, 10);
  }

  const items = useMemo(() => {
    if (!itemsRaw) return itemsRaw;
    return [...itemsRaw].sort((a, b) => {
      const ai = STATUS_ORDER.indexOf(a.status as (typeof STATUS_ORDER)[number]);
      const bi = STATUS_ORDER.indexOf(b.status as (typeof STATUS_ORDER)[number]);
      const aIdx = ai === -1 ? STATUS_ORDER.length : ai;
      const bIdx = bi === -1 ? STATUS_ORDER.length : bi;
      if (aIdx !== bIdx) return aIdx - bIdx;
      const aDate = getItemStatusDateForSort(a);
      const bDate = getItemStatusDateForSort(b);
      return aDate.localeCompare(bDate);
    });
  }, [itemsRaw]);

  function getItemCustomerDisplay(item: Item, t: (key: string) => string) {
    const platformLabel = (p: string) => {
      const key = 'platform.' + p;
      const translated = t(key);
      return translated === key ? p : translated;
    };
    if (item.status === 'disposed') return '—';
    if (item.status === 'sold' && item.sale?.customer) {
      const c = item.sale.customer;
      return `${c.name}${c.sourcePlatform ? ` (${platformLabel(c.sourcePlatform)})` : ''}`;
    }
    if (item.status === 'rented' && item.rentals?.[0]?.customer) {
      const c = item.rentals[0].customer;
      return `${c.name}${c.sourcePlatform ? ` (${platformLabel(c.sourcePlatform)})` : ''}`;
    }
    if (item.acquisitionContact) {
      const c = item.acquisitionContact;
      return `${c.name}${c.sourcePlatform ? ` (${platformLabel(c.sourcePlatform)})` : ''}`;
    }
    return '—';
  }

  function getItemStatusDate(item: Item): string | null {
    const d =
      item.status === 'in_stock' || item.status === 'overdue'
        ? (item.acquisitionDate || item.createdAt)
        : item.status === 'sold'
          ? item.sale?.saleDate
          : item.status === 'rented'
            ? item.rentals?.[0]?.startDate
            : (item.status === 'disposed' || item.status === 'reserved')
              ? item.updatedAt
              : null;
    if (!d) return null;
    return typeof d === 'string' ? d.slice(0, 10) : new Date(d).toISOString().slice(0, 10);
  }

  function getItemDisplayLocation(item: Item, lang?: string): string {
    if (item.status === 'sold' && item.sale) {
      return getDisplayLocation(item.sale.handoverPrefecture ?? undefined, item.sale.handoverCity ?? undefined, lang);
    }
    if (item.status === 'rented' && item.rentals?.[0]) {
      const r = item.rentals[0];
      return getDisplayLocation(r.handoverPrefecture ?? undefined, r.handoverCity ?? undefined, lang);
    }
    return getDisplayLocation(item.prefecture ?? undefined, item.city ?? undefined, lang);
  }

  return (
    <div className="space-y-4 sm:space-y-6 w-full max-w-full min-w-0">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-roomi-brown">{t('nav.items')}</h1>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
        <input
          type="text"
          placeholder={t('common.search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field min-h-[44px] w-full sm:max-w-xs"
        />
        <select
          value={status}
          onChange={(e) => {
            const v = e.target.value;
            setSearchParams((prev) => {
              const next = new URLSearchParams(prev);
              if (v) next.set('status', v);
              else next.delete('status');
              return next;
            });
          }}
          className="input-field min-h-[44px] w-full sm:max-w-[180px]"
        >
          <option value="">{t('common.allStatus')}</option>
          <option value="overdue">{t('status.overdue')}</option>
          <option value="in_stock">{t('status.in_stock')}</option>
          <option value="listed">{t('status.listed')}</option>
          <option value="reserved">{t('status.reserved')}</option>
          <option value="rented">{t('status.rented')}</option>
          <option value="sold">{t('status.sold')}</option>
          <option value="disposed">{t('status.disposed')}</option>
        </select>
      </div>

      {isLoading && <p className="text-roomi-brownLight">{t('dashboard.loading')}</p>}
      {error && (
        <div className="card p-4 text-red-600 bg-red-50 border-red-200">
          {(error as Error).message}
        </div>
      )}
      {items && (
        <>
          {/* Mobile: card list — no horizontal scroll */}
          <div className="lg:hidden space-y-3 w-full max-w-full min-w-0">
            {items.length === 0 ? (
              <div className="card p-6 text-center text-roomi-brownLight">{t('dashboard.noItems')}</div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="card p-4 w-full max-w-full min-w-0 flex flex-col gap-3"
                >
                  <Link
                    to={`/items/${item.id}`}
                    className="text-base font-semibold text-roomi-orange hover:underline block truncate min-w-0"
                  >
                    {item.title}
                  </Link>
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-roomi-brownLight">
                    <span className="truncate min-w-0">{item.customSubCategory ?? getSubCategoryDisplayName(item.subCategory, i18n.language) ?? '—'}</span>
                    <span>·</span>
                    <span className={`${getStatusBadgeClass(item.status)} text-xs shrink-0`}>{t(`status.${item.status}`)}</span>
                    {getItemStatusDate(item) && (
                      <>
                        <span>·</span>
                        <span className="shrink-0">{getItemStatusDate(item)}</span>
                      </>
                    )}
                  </div>
                  <div className="text-sm text-roomi-brownLight truncate min-w-0">
                    {t('table.customer')}: {getItemCustomerDisplay(item, t)}
                  </div>
                  <div className="text-sm text-roomi-brownLight truncate min-w-0">
                    {t('table.location')}: {getItemDisplayLocation(item, i18n.language)}
                  </div>
                  <div className="flex flex-wrap gap-2 pt-1">
                    {(item.status === 'in_stock' || item.status === 'overdue' || item.status === 'reserved') && (
                      <ListedCheckbox item={item} onOpenModal={() => setListedModalItem(item)} onRefresh={() => queryClient.invalidateQueries({ queryKey: ['items'] })} />
                    )}
                    {(item.status === 'in_stock' || item.status === 'overdue') && (
                      (item.itemListings?.length ?? 0) > 0 ? (
                        <button
                          type="button"
                          onClick={() => setReserveModalItem(item)}
                          className="btn-secondary text-sm py-2 px-3 min-h-[40px]"
                        >
                          {t('actions.reserve')}
                        </button>
                      ) : (
                        <span className="text-xs text-roomi-brownLight italic" title={t('listings.mustListFirst')}>
                          {t('listings.mustListFirst')}
                        </span>
                      )
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Desktop: table */}
          <div className="hidden lg:block card overflow-hidden max-w-full min-w-0 overflow-x-auto">
            <table className="min-w-full divide-y divide-roomi-peach/60 table-auto">
              <thead className="bg-roomi-cream/80">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-semibold text-roomi-brown uppercase">{t('table.title')}</th>
                  <th className="px-2 py-3 text-left text-xs font-semibold text-roomi-brown uppercase">{t('table.category')}</th>
                  <th className="px-2 py-3 text-left text-xs font-semibold text-roomi-brown uppercase">{t('table.customer')}</th>
                  <th className="px-2 py-3 text-left text-xs font-semibold text-roomi-brown uppercase">{t('table.status')}</th>
                  <th className="px-2 py-3 text-left text-xs font-semibold text-roomi-brown uppercase">{t('listings.listed')}</th>
                  <th className="px-2 py-3 text-left text-xs font-semibold text-roomi-brown uppercase">{t('table.location')}</th>
                  <th className="px-2 py-3 text-left text-xs font-semibold text-roomi-brown uppercase">{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-roomi-peach/60 bg-white">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-roomi-cream/40">
                    <td className="px-3 py-3 min-w-0">
                      <Link to={`/items/${item.id}`} className="text-roomi-orange font-medium hover:underline block truncate">
                        {item.title}
                      </Link>
                    </td>
                    <td className="px-2 py-3 text-sm text-roomi-brownLight min-w-0 truncate">
                      {item.customSubCategory ?? getSubCategoryDisplayName(item.subCategory, i18n.language) ?? '—'}
                    </td>
                    <td className="px-2 py-3 text-sm text-roomi-brownLight min-w-0 truncate">
                      {getItemCustomerDisplay(item, t)}
                    </td>
                    <td className="px-2 py-3 min-w-0">
                      <div className="flex flex-col gap-0.5">
                        <span className={`${getStatusBadgeClass(item.status)} text-xs lg:text-sm w-fit`}>{t(`status.${item.status}`)}</span>
                        {getItemStatusDate(item) && (
                          <span className="text-xs text-roomi-brownLight">{getItemStatusDate(item)}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-2 py-3">
                      {(item.status === 'in_stock' || item.status === 'overdue' || item.status === 'reserved') && (
                        <ListedCheckbox item={item} onOpenModal={() => setListedModalItem(item)} onRefresh={() => queryClient.invalidateQueries({ queryKey: ['items'] })} />
                      )}
                      {(item.status === 'sold' || item.status === 'rented' || item.status === 'disposed') && (
                        <span className="text-roomi-brownLight">—</span>
                      )}
                    </td>
                    <td className="px-2 py-3 text-sm text-roomi-brownLight min-w-0 truncate">{getItemDisplayLocation(item, i18n.language)}</td>
                    <td className="px-2 py-3">
                      {(item.status === 'in_stock' || item.status === 'overdue') && (
                        (item.itemListings?.length ?? 0) > 0 ? (
                          <button type="button" onClick={() => setReserveModalItem(item)} className="btn-secondary text-xs py-1.5 px-2 min-h-0">
                            {t('actions.reserve')}
                          </button>
                        ) : (
                          <span className="text-xs text-roomi-brownLight italic" title={t('listings.mustListFirst')}>{t('listings.mustListFirst')}</span>
                        )
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {listedModalItem && (
        <ListingsModal
          item={listedModalItem}
          onClose={() => setListedModalItem(null)}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
            setListedModalItem(null);
          }}
        />
      )}
      {reserveModalItem && (
        <ReserveModal
          item={reserveModalItem}
          onClose={() => setReserveModalItem(null)}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ['items'] });
            setReserveModalItem(null);
          }}
        />
      )}
    </div>
  );
}

function ListedCheckbox({ item, onOpenModal }: { item: Item; onOpenModal: () => void; onRefresh: () => void }) {
  const { t } = useTranslation();
  const isListed = !!item.isListed;
  const isSold = item.status === 'sold';
  const showRemoveSnsHint = isSold && isListed;
  return (
    <button
      type="button"
      onClick={onOpenModal}
      title={showRemoveSnsHint ? t('listings.removeSnsHint') : undefined}
      className="flex items-center gap-1 cursor-pointer text-left text-xs text-roomi-brownLight hover:text-roomi-brown border-0 bg-transparent p-0"
    >
      <span className={`inline-block w-4 h-4 rounded border border-roomi-brown/40 flex items-center justify-center ${isListed ? 'bg-roomi-orange/20 border-roomi-orange' : ''}`}>
        {isListed && <span className="text-roomi-orange text-[10px]">✓</span>}
      </span>
      <span>{t('listings.listed')}{showRemoveSnsHint && <span className="text-amber-600 font-bold" aria-hidden> !</span>}</span>
    </button>
  );
}

function ListingsModal({ item, onClose, onSaved }: { item: Item; onClose: () => void; onSaved: () => void }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [view, setView] = useState<'list' | 'add'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ platform: string; listing_url: string; listing_ref_id: string }>({ platform: '', listing_url: '', listing_ref_id: '' });

  const { data: listings = [], isLoading: loadingListings, refetch: refetchListings } = useQuery({
    queryKey: ['listings', item.id],
    queryFn: () => api.items.getListings(item.id),
    enabled: !!item.id,
  });

  const setListedMutation = useMutation({
    mutationFn: (is_listed: boolean) => api.items.setListedFlag(item.id, is_listed),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items'] });
      refetchListings();
      onSaved();
      onClose();
    },
  });
  const updateListingMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: { platform?: string; listing_url?: string | null; listing_ref_id?: string | null; status?: string } }) =>
      api.listings.update(id, body),
    onSuccess: () => {
      refetchListings();
      queryClient.invalidateQueries({ queryKey: ['items'] });
      setEditingId(null);
    },
  });

  const activeListings = listings.filter((l) => l.status !== 'closed');
  const hasActive = activeListings.length > 0;

  function handleMarkAllClosed() {
    if (!window.confirm(t('listings.confirmMarkClosed'))) return;
    setListedMutation.mutate(false);
  }

  function startEdit(l: ItemListing) {
    setEditingId(l.id);
    setEditForm({
      platform: l.platform,
      listing_url: l.listingUrl ?? '',
      listing_ref_id: l.listingRefId ?? '',
    });
  }

  function saveEdit() {
    if (!editingId) return;
    updateListingMutation.mutate({
      id: editingId,
      body: {
        platform: editForm.platform,
        listing_url: editForm.listing_url || null,
        listing_ref_id: editForm.listing_ref_id || null,
      },
    });
  }

  function markClosed(listingId: string) {
    updateListingMutation.mutate({ id: listingId, body: { status: 'closed' } });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div className="card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold text-roomi-brown mb-4">{t('listings.wherePosted')} — {item.title}</h3>

        {view === 'list' ? (
          <>
            {loadingListings ? (
              <p className="text-roomi-brownLight text-sm">{t('dashboard.loading')}</p>
            ) : listings.length === 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-roomi-brownLight">{t('listings.noListingsYet')}</p>
                <button type="button" onClick={() => setView('add')} className="btn-primary">
                  {t('listings.addPlatforms')}
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <ul className="space-y-3 divide-y divide-roomi-peach/50">
                  {listings.map((l) => (
                    <li key={l.id} className="pt-3 first:pt-0">
                      {editingId === l.id ? (
                        <div className="space-y-2">
                          <select
                            value={editForm.platform}
                            onChange={(e) => setEditForm((f) => ({ ...f, platform: e.target.value }))}
                            className="input-field"
                          >
                            {LISTING_PLATFORMS.map((pl) => (
                              <option key={pl} value={pl}>{t(`listings.${pl}`)}</option>
                            ))}
                          </select>
                          <input
                            type="url"
                            placeholder={t('listings.urlOptional')}
                            value={editForm.listing_url}
                            onChange={(e) => setEditForm((f) => ({ ...f, listing_url: e.target.value }))}
                            className="input-field"
                          />
                          <input
                            type="text"
                            placeholder={t('listings.refIdOptional')}
                            value={editForm.listing_ref_id}
                            onChange={(e) => setEditForm((f) => ({ ...f, listing_ref_id: e.target.value }))}
                            className="input-field"
                          />
                          <div className="flex gap-2">
                            <button type="button" onClick={saveEdit} className="btn-primary text-sm" disabled={updateListingMutation.isPending}>{t('common.save')}</button>
                            <button type="button" onClick={() => setEditingId(null)} className="btn-secondary text-sm">{t('common.cancel')}</button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="font-medium text-roomi-brown">{t(`listings.${l.platform}`)}</p>
                            {l.listingUrl && (
                              <a href={l.listingUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-roomi-orange hover:underline truncate block">{l.listingUrl}</a>
                            )}
                            {l.listingRefId && <p className="text-xs text-roomi-brownLight">{t('listings.refIdOptional')}: {l.listingRefId}</p>}
                            <span className={`text-xs px-1.5 py-0.5 rounded ${l.status === 'closed' ? 'bg-roomi-brownLight/20 text-roomi-brownLight' : 'bg-roomi-mint/30 text-roomi-brown'}`}>
                              {l.status === 'closed' ? t('listings.statusClosed') : t('listings.statusActive')}
                            </span>
                          </div>
                          <div className="flex gap-1 shrink-0">
                            {l.status !== 'closed' && (
                              <>
                                <button type="button" onClick={() => startEdit(l)} className="btn-ghost text-xs py-1 px-2 min-h-0">{t('listings.editListing')}</button>
                                <button type="button" onClick={() => markClosed(l.id)} className="text-xs text-roomi-brownLight hover:text-red-600 py-1 px-2">{t('listings.markClosed')}</button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2 pt-2">
                  <button type="button" onClick={() => { setView('add'); }} className="btn-secondary text-sm">{t('listings.addPlatform')}</button>
                  {hasActive && (
                    <button type="button" onClick={handleMarkAllClosed} className="btn-ghost text-sm text-roomi-brownLight hover:text-roomi-brown" disabled={setListedMutation.isPending}>
                      {t('listings.markAllClosed')}
                    </button>
                  )}
                </div>
              </div>
            )}
            <div className="mt-4 pt-4 border-t border-roomi-peach/60">
              <button type="button" onClick={onClose} className="btn-secondary w-full sm:w-auto">{t('common.cancel')}</button>
            </div>
          </>
        ) : (
          <AddListingsForm
            item={item}
            setListedAfterCreate={listings.length === 0}
            onSaved={() => {
              refetchListings();
              queryClient.invalidateQueries({ queryKey: ['items'] });
              onSaved();
              setView('list');
            }}
            onCancel={() => setView('list')}
          />
        )}
      </div>
    </div>
  );
}

function AddListingsForm({ item, setListedAfterCreate, onSaved, onCancel }: { item: Item; setListedAfterCreate: boolean; onSaved: () => void; onCancel: () => void }) {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [platforms, setPlatforms] = useState<{ platform: string; listing_url: string; listing_ref_id: string }[]>([{ platform: LISTING_PLATFORMS[0], listing_url: '', listing_ref_id: '' }]);
  const createListingMutation = useMutation({
    mutationFn: (body: { platform: string; listing_url?: string | null; listing_ref_id?: string | null }) =>
      api.items.createListing(item.id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['items'] }),
  });
  const setListedMutation = useMutation({
    mutationFn: () => api.items.setListedFlag(item.id, true),
    onSuccess: onSaved,
  });
  const handleAddRow = () => setPlatforms((p) => [...p, { platform: LISTING_PLATFORMS[0], listing_url: '', listing_ref_id: '' }]);
  const handleSave = async () => {
    for (const row of platforms) {
      if (!row.platform.trim()) continue;
      await createListingMutation.mutateAsync({
        platform: row.platform,
        listing_url: row.listing_url || null,
        listing_ref_id: row.listing_ref_id || null,
      });
    }
    if (setListedAfterCreate) {
      await setListedMutation.mutateAsync();
    } else {
      onSaved();
    }
  };
  return (
    <>
      <p className="text-sm text-roomi-brownLight mb-4">{t('listings.addPlatformsHint')}</p>
      <div className="space-y-3">
        {platforms.map((row, i) => (
          <div key={i} className="flex flex-wrap gap-2 items-center">
            <select
              value={row.platform}
              onChange={(e) => setPlatforms((p) => p.map((r, j) => (j === i ? { ...r, platform: e.target.value } : r)))}
              className="input-field flex-1 min-w-[120px]"
            >
              {LISTING_PLATFORMS.map((pl) => (
                <option key={pl} value={pl}>{t(`listings.${pl}`)}</option>
              ))}
            </select>
            <input
              type="url"
              placeholder={t('listings.urlOptional')}
              value={row.listing_url}
              onChange={(e) => setPlatforms((p) => p.map((r, j) => (j === i ? { ...r, listing_url: e.target.value } : r)))}
              className="input-field flex-1 min-w-[140px]"
            />
            <input
              type="text"
              placeholder={t('listings.refIdOptional')}
              value={row.listing_ref_id}
              onChange={(e) => setPlatforms((p) => p.map((r, j) => (j === i ? { ...r, listing_ref_id: e.target.value } : r)))}
              className="input-field w-24"
            />
          </div>
        ))}
        <button type="button" onClick={handleAddRow} className="btn-ghost text-sm">{t('listings.addPlatform')}</button>
      </div>
      <div className="flex gap-2 mt-4">
        <button type="button" onClick={handleSave} className="btn-primary" disabled={createListingMutation.isPending || setListedMutation.isPending}>
          {createListingMutation.isPending || setListedMutation.isPending ? t('dashboard.loading') : t('common.save')}
        </button>
        <button type="button" onClick={onCancel} className="btn-secondary">{t('common.cancel')}</button>
      </div>
    </>
  );
}

function ReserveModal({ item, onClose, onSaved }: { item: Item; onClose: () => void; onSaved: () => void }) {
  const { t } = useTranslation();
  const [reserveType, setReserveType] = useState<'sale' | 'rental'>('sale');
  const [contactMode, setContactMode] = useState<'existing' | 'new'>('existing');
  const [selectedContactId, setSelectedContactId] = useState('');
  const [newContact, setNewContact] = useState(emptyReserveContact);
  const [expiresAt, setExpiresAt] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const { data: contacts = [] } = useQuery({ queryKey: ['contacts'], queryFn: () => api.contacts.getMany() });
  const reserveMutation = useMutation({
    mutationFn: (body: Parameters<typeof api.items.reserve>[1]) => api.items.reserve(item.id, body),
    onSuccess: onSaved,
    onError: (e) => setError((e as Error).message),
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (contactMode === 'existing') {
      if (!selectedContactId) {
        setError(t('input.selectContactRequired'));
        return;
      }
      reserveMutation.mutate({
        contact_id: selectedContactId,
        reserve_type: reserveType,
        expires_at: expiresAt || null,
        note: note || null,
      });
      return;
    }
    const platformVal = newContact.source_platform === SOURCE_PLATFORM_OTHER_SENTINEL
      ? (newContact.source_platform_other?.trim() || SOURCE_PLATFORM_OTHER)
      : newContact.source_platform;
    if (!platformVal?.trim()) {
      setError(t('input.customerDetailsRequired'));
      return;
    }
    if (!newContact.name?.trim()) {
      setError(t('input.customerDetailsNameRequired'));
      return;
    }
    const contactPayload: CreateContactBody = {
      source_platform: platformVal.trim(),
      name: newContact.name.trim(),
      platform_user_id: newContact.platform_user_id?.trim() || null,
      phone: newContact.phone?.trim() || null,
      email: newContact.email?.trim() || null,
    };
    reserveMutation.mutate({
      contact: contactPayload,
      reserve_type: reserveType,
      expires_at: expiresAt || null,
      note: note || null,
    });
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      {error && (
        <CenteredToast message={error} variant="error" onDismiss={() => setError('')} />
      )}
      <div className="card p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <h3 className="font-semibold text-roomi-brown mb-4">{t('actions.reserve')} — {item.title}</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">{t('listings.reserveType')}</label>
            <select value={reserveType} onChange={(e) => setReserveType(e.target.value as 'sale' | 'rental')} className="input-field">
              <option value="sale">{t('status.sold')} (reserve)</option>
              <option value="rental">{t('status.rented')} (reserve)</option>
            </select>
          </div>

          <div className="border border-roomi-peach/60 rounded-roomiLg p-5 space-y-4 bg-roomi-cream/40">
            <h3 className="text-sm font-semibold text-roomi-brown">{t('input.customerDetailsOnly')}</h3>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setContactMode('existing')}
                className={`rounded-roomi py-2.5 px-4 text-sm font-semibold border-2 transition-colors ${
                  contactMode === 'existing' ? 'border-roomi-orange bg-roomi-orange text-white' : 'border-roomi-brown/30 text-roomi-brown bg-white hover:border-roomi-orange/60 hover:bg-roomi-peach/40'
                }`}
              >
                {t('input.selectExistingContact')}
              </button>
              <button
                type="button"
                onClick={() => setContactMode('new')}
                className={`rounded-roomi py-2.5 px-4 text-sm font-semibold border-2 transition-colors ${
                  contactMode === 'new' ? 'border-roomi-orange bg-roomi-orange text-white' : 'border-roomi-brown/30 text-roomi-brown bg-white hover:border-roomi-orange/60 hover:bg-roomi-peach/40'
                }`}
              >
                {t('input.createNewContact')}
              </button>
            </div>
            {contactMode === 'existing' ? (
              <div>
                <label className="label">{t('input.selectContact')}</label>
                <select
                  value={selectedContactId}
                  onChange={(e) => setSelectedContactId(e.target.value)}
                  className="input-field"
                >
                  <option value="">—</option>
                  {contacts.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} ({t('platform.' + c.sourcePlatform) !== 'platform.' + c.sourcePlatform ? t('platform.' + c.sourcePlatform) : c.sourcePlatform})</option>
                  ))}
                </select>
              </div>
            ) : (
              <>
                <div>
                  <label className="label">{t('input.sourcePlatform')} *</label>
                  <select
                    value={newContact.source_platform === SOURCE_PLATFORM_OTHER_SENTINEL ? SOURCE_PLATFORM_OTHER : newContact.source_platform}
                    onChange={(e) => {
                      const v = e.target.value;
                      setNewContact((c) => ({ ...c, source_platform: v === SOURCE_PLATFORM_OTHER ? SOURCE_PLATFORM_OTHER_SENTINEL : v }));
                    }}
                    className="input-field"
                  >
                    <option value="">—</option>
                    {SOURCE_PLATFORM_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>{opt === SOURCE_PLATFORM_OTHER ? t('input.sourcePlatformOther') : t('platform.' + opt)}</option>
                    ))}
                  </select>
                  {newContact.source_platform === SOURCE_PLATFORM_OTHER_SENTINEL && (
                    <input
                      type="text"
                      value={newContact.source_platform_other}
                      onChange={(e) => setNewContact((c) => ({ ...c, source_platform_other: e.target.value }))}
                      className="input-field mt-2"
                      placeholder={t('input.sourcePlatformOther')}
                    />
                  )}
                </div>
                <div>
                  <label className="label">{t('table.name')} *</label>
                  <input
                    type="text"
                    value={newContact.name}
                    onChange={(e) => setNewContact((c) => ({ ...c, name: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">{t('input.platformId')}</label>
                  <input
                    type="text"
                    value={newContact.platform_user_id}
                    onChange={(e) => setNewContact((c) => ({ ...c, platform_user_id: e.target.value }))}
                    className="input-field"
                    placeholder={t('input.platformIdPlaceholder')}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">{t('table.phone')}</label>
                    <input
                      type="text"
                      value={newContact.phone}
                      onChange={(e) => setNewContact((c) => ({ ...c, phone: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="label">{t('table.email')}</label>
                    <input
                      type="email"
                      value={newContact.email}
                      onChange={(e) => setNewContact((c) => ({ ...c, email: e.target.value }))}
                      className="input-field"
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          <div>
            <label className="label">{t('listings.expiresAt')} (optional)</label>
            <input type="datetime-local" value={expiresAt} onChange={(e) => setExpiresAt(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">{t('common.notes')} (optional)</label>
            <input type="text" value={note} onChange={(e) => setNote(e.target.value)} className="input-field" />
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="btn-primary" disabled={reserveMutation.isPending}>{reserveMutation.isPending ? t('dashboard.loading') : t('common.save')}</button>
            <button type="button" onClick={onClose} className="btn-secondary">{t('common.cancel')}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
