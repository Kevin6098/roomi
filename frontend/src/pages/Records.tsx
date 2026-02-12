// Records — Acquire (Buy), Sell, and Rent in one page

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  api,
  type CreateItemBody,
  type CreateSaleBody,
  type StartRentalBody,
  type EndRentalBody,
} from '../api/client';
import { PREFECTURES, UNDECIDED, getCitiesForPrefecture } from '../data/locationData';
import { getStatusBadgeClass } from '../utils/statusStyles';
import { CenteredToast } from '../components/CenteredToast';

const CONDITION_OPTIONS = ['new', 'good', 'fair', 'poor'] as const;
const ACQUISITION_OPTIONS = ['free', 'cheap', 'bought'] as const;
const SOURCE_PLATFORM_OPTIONS = [
  'Facebook', 'WeChat', 'Xiaohongshu', 'LINE', 'Whatsapp', 'Telegram',
  'Jimoty', 'Mercari', 'PayPayFlea', 'Rakuma', 'YahooAuction', 'Other',
] as const;
const SOURCE_PLATFORM_OTHER = 'Other';
const SOURCE_PLATFORM_OTHER_SENTINEL = '__other__';
const today = () => new Date().toISOString().slice(0, 10);

const emptyNewContact = (): {
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

export default function Records() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<'acquire' | 'sell' | 'rent'>('acquire');
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [acquireForm, setAcquireForm] = useState<CreateItemBody>({
    title: '',
    sub_category_id: '',
    custom_sub_category: null,
    acquisition_type: '',
    acquisition_cost: 0,
    original_price: 0,
    condition: '',
    prefecture: UNDECIDED,
    city: UNDECIDED,
    exact_location: null,
    location_visibility: 'hidden',
    status: 'in_stock',
    acquisition_date: today(),
  });
  const [contactMode, setContactMode] = useState<'existing' | 'new'>('new');
  const [selectedContactId, setSelectedContactId] = useState('');
  const [newContact, setNewContact] = useState(emptyNewContact());
  const [contactSearch, setContactSearch] = useState('');
  const [showLocationFields, setShowLocationFields] = useState(false);

  const [sellForm, setSellForm] = useState<CreateSaleBody>({
    item_id: '',
    sale_price: 0,
    sale_date: today(),
    handover_prefecture: null,
    handover_city: null,
    handover_exact_location: null,
  });
  const [sellContactMode, setSellContactMode] = useState<'existing' | 'new'>('new');
  const [sellSelectedContactId, setSellSelectedContactId] = useState('');
  const [sellNewContact, setSellNewContact] = useState(emptyNewContact());
  const [sellContactSearch, setSellContactSearch] = useState('');
  const [sellConfirm, setSellConfirm] = useState(false);

  const [rentForm, setRentForm] = useState<StartRentalBody>({
    item_id: '',
    rent_period: 'monthly',
    rent_price_monthly: null,
    rent_price_annually: null,
    deposit: null,
    start_date: today(),
    expected_end_date: '',
    handover_prefecture: null,
    handover_city: null,
    handover_exact_location: null,
  });
  const [rentContactMode, setRentContactMode] = useState<'existing' | 'new'>('new');
  const [rentSelectedContactId, setRentSelectedContactId] = useState('');
  const [rentNewContact, setRentNewContact] = useState(emptyNewContact());
  const [rentContactSearch, setRentContactSearch] = useState('');
  const [rentOriginalPriceEdit, setRentOriginalPriceEdit] = useState<string>('');

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

  const { data: recentlyAcquired = [] } = useQuery({
    queryKey: ['items', 'recently-acquired'],
    queryFn: () => api.items.getRecentlyAcquired(),
    enabled: tab === 'acquire',
  });
  const { data: availableItemsForSell = [] } = useQuery({
    queryKey: ['items', 'available', 'sell'],
    queryFn: () => api.items.getAvailable({ for_use: 'sell' }),
    enabled: tab === 'sell',
  });
  const { data: availableItemsForRent = [] } = useQuery({
    queryKey: ['items', 'available', 'rent'],
    queryFn: () => api.items.getAvailable({ for_use: 'rent' }),
    enabled: tab === 'rent',
  });
  const availableItems = tab === 'sell' ? availableItemsForSell : availableItemsForRent;
  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts', contactSearch],
    queryFn: () => api.contacts.getMany({ search: contactSearch || undefined }),
    enabled: tab === 'acquire',
  });
  const { data: contactsForSell = [] } = useQuery({
    queryKey: ['contacts', 'sell', sellContactSearch],
    queryFn: () => api.contacts.getMany({ search: sellContactSearch || undefined }),
    enabled: tab === 'sell',
  });
  const { data: contactsForRent = [] } = useQuery({
    queryKey: ['contacts', 'rent', rentContactSearch],
    queryFn: () => api.contacts.getMany({ search: rentContactSearch || undefined }),
    enabled: tab === 'rent',
  });
  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: () => api.customers.getMany(),
    enabled: tab === 'sell' || tab === 'rent',
  });
  const { data: sellReservationData } = useQuery({
    queryKey: ['item-reservation', sellForm.item_id],
    queryFn: () => api.items.getReservation(sellForm.item_id),
    enabled: tab === 'sell' && !!sellForm.item_id,
  });
  const { data: rentReservationData } = useQuery({
    queryKey: ['item-reservation', rentForm.item_id],
    queryFn: () => api.items.getReservation(rentForm.item_id),
    enabled: tab === 'rent' && !!rentForm.item_id,
  });
  const { data: rentals = [] } = useQuery({
    queryKey: ['rentals', { status: 'active' }],
    queryFn: () => api.rentals.getMany({ status: 'active' }),
    enabled: tab === 'rent',
  });

  const acquireMutation = useMutation({
    mutationFn: (body: CreateItemBody) => api.items.create(body),
    onSuccess: () => {
      setToast(t('input.saved'));
      setAcquireForm({
        title: '',
        sub_category_id: '',
        custom_sub_category: null,
        acquisition_type: '',
        acquisition_cost: 0,
        condition: '',
        prefecture: UNDECIDED,
        city: UNDECIDED,
        exact_location: null,
        location_visibility: 'hidden',
        status: 'in_stock',
        acquisition_date: today(),
      });
      setContactMode('new');
      setSelectedContactId('');
      setNewContact(emptyNewContact());
      setContactSearch('');
      setShowLocationFields(false);
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setTimeout(() => setToast(''), 3000);
    },
    onError: (e) => setError((e as Error).message),
  });
  const sellMutation = useMutation({
    mutationFn: (body: CreateSaleBody) => api.sales.create(body),
    onSuccess: () => {
      setToast(t('output.saleSaved'));
      setSellForm({ item_id: '', sale_price: 0, sale_date: today(), handover_prefecture: null, handover_city: null, handover_exact_location: null });
      setSellContactMode('new');
      setSellSelectedContactId('');
      setSellNewContact(emptyNewContact());
      setSellContactSearch('');
      setSellConfirm(false);
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setTimeout(() => setToast(''), 3000);
    },
    onError: (e) => setError((e as Error).message),
  });
  const rentMutation = useMutation({
    mutationFn: (body: StartRentalBody) => api.rentals.start(body),
    onSuccess: () => {
      setToast(t('output.rentalSaved'));
      setRentForm({ item_id: '', rent_period: 'monthly', rent_price_monthly: null, rent_price_annually: null, deposit: null, start_date: today(), expected_end_date: '', handover_prefecture: null, handover_city: null, handover_exact_location: null });
      setRentContactMode('new');
      setRentSelectedContactId('');
      setRentNewContact(emptyNewContact());
      setRentContactSearch('');
      queryClient.invalidateQueries({ queryKey: ['items'] });
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      setTimeout(() => setToast(''), 3000);
    },
    onError: (e) => setError((e as Error).message),
  });

  // Auto-fill sell contact from reservation when selected item is reserved
  useEffect(() => {
    if (tab !== 'sell' || !sellForm.item_id || !sellReservationData?.reservation?.contact) return;
    const res = sellReservationData.reservation;
    setSellContactMode('existing');
    setSellSelectedContactId(res.contact!.id);
  }, [tab, sellForm.item_id, sellReservationData?.reservation]);

  // Include reservation contact in sell dropdown so it's always selectable and shows the right name
  const sellContactOptions = useMemo(() => {
    const res = sellReservationData?.reservation?.contact;
    if (!res) return contactsForSell;
    const inList = contactsForSell.some((c) => c.id === res.id);
    if (inList) return contactsForSell;
    return [res, ...contactsForSell];
  }, [contactsForSell, sellReservationData?.reservation?.contact]);

  // Pre-fill handover location from customer when selecting an existing contact (sell)
  useEffect(() => {
    if (tab !== 'sell' || !sellSelectedContactId || customers.length === 0) return;
    const customer = customers.find((c) => c.contactId === sellSelectedContactId);
    if (!customer || (!customer.prefecture && !customer.city && !customer.exactLocation)) return;
    setSellForm((prev) => ({
      ...prev,
      handover_prefecture: customer.prefecture ?? prev.handover_prefecture,
      handover_city: customer.city ?? prev.handover_city,
      handover_exact_location: customer.exactLocation ?? prev.handover_exact_location,
    }));
  }, [tab, sellSelectedContactId, customers]);

  // Auto-fill rent contact from reservation when selected item is reserved
  useEffect(() => {
    if (tab !== 'rent' || !rentForm.item_id || !rentReservationData?.reservation?.contact) return;
    const res = rentReservationData.reservation;
    setRentContactMode('existing');
    setRentSelectedContactId(res.contact!.id);
  }, [tab, rentForm.item_id, rentReservationData?.reservation]);

  // Include reservation contact in rent dropdown so it's always selectable and shows the right name
  const rentContactOptions = useMemo(() => {
    const res = rentReservationData?.reservation?.contact;
    if (!res) return contactsForRent;
    const inList = contactsForRent.some((c) => c.id === res.id);
    if (inList) return contactsForRent;
    return [res, ...contactsForRent];
  }, [contactsForRent, rentReservationData?.reservation?.contact]);

  // Pre-fill handover location from customer when selecting an existing contact (rent)
  useEffect(() => {
    if (tab !== 'rent' || !rentSelectedContactId || customers.length === 0) return;
    const customer = customers.find((c) => c.contactId === rentSelectedContactId);
    if (!customer || (!customer.prefecture && !customer.city && !customer.exactLocation)) return;
    setRentForm((prev) => ({
      ...prev,
      handover_prefecture: customer.prefecture ?? prev.handover_prefecture,
      handover_city: customer.city ?? prev.handover_city,
      handover_exact_location: customer.exactLocation ?? prev.handover_exact_location,
    }));
  }, [tab, rentSelectedContactId, customers]);

  useEffect(() => {
    setRentOriginalPriceEdit('');
  }, [rentForm.item_id]);

  const updateRentItemOriginalPriceMutation = useMutation({
    mutationFn: ({ itemId, original_price }: { itemId: string; original_price: number }) =>
      api.items.update(itemId, { original_price }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['items', 'available', 'rent'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      setRentOriginalPriceEdit('');
    },
    onError: (e) => setError((e as Error).message),
  });

  const [endRentalId, setEndRentalId] = useState<string | null>(null);
  const [endForm, setEndForm] = useState<EndRentalBody>({ next_item_status: 'in_stock' });
  const endRentalMutation = useMutation({
    mutationFn: ({ id, body }: { id: string; body: EndRentalBody }) =>
      api.rentals.end(id, body),
    onSuccess: () => {
      setToast(t('output.rentalEnded'));
      setEndRentalId(null);
      queryClient.invalidateQueries({ queryKey: ['rentals'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      setTimeout(() => setToast(''), 3000);
    },
    onError: (e) => setError((e as Error).message),
  });

  function handleAcquireSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    const subId = acquireForm.sub_category_id || subCategories[0]?.id;
    if (!subId) {
      setError(t('input.selectCategory'));
      return;
    }
    if (contactMode === 'existing') {
      if (!selectedContactId) {
        setError(t('input.selectContactRequired'));
        return;
      }
    } else {
      const platformVal = newContact.source_platform === SOURCE_PLATFORM_OTHER_SENTINEL
        ? newContact.source_platform_other.trim()
        : newContact.source_platform;
      if (!newContact.source_platform || !platformVal) {
        setError(t('input.selectSourcePlatform'));
        return;
      }
      if (!newContact.name.trim()) {
        setError(t('input.customerDetailsNameRequired'));
        return;
      }
    }
    const at = acquireForm.acquisition_type;
    if (!at || !ACQUISITION_OPTIONS.includes(at as (typeof ACQUISITION_OPTIONS)[number])) {
      setError(t('input.selectAcquisitionType'));
      return;
    }
    const cond = acquireForm.condition;
    if (!cond || !CONDITION_OPTIONS.includes(cond as (typeof CONDITION_OPTIONS)[number])) {
      setError(t('input.selectCondition'));
      return;
    }
    const isOtherSub = subCategories.find((c) => c.id === subId)?.name?.toLowerCase() === 'other';
    if (isOtherSub && (!acquireForm.custom_sub_category?.trim() || acquireForm.custom_sub_category.trim().length < 2)) {
      setError(t('input.customSubCategoryRequired'));
      return;
    }
    const payload: CreateItemBody = {
      ...acquireForm,
      sub_category_id: subId,
      acquisition_type: at,
      condition: cond,
      acquisition_cost: at === 'free' ? 0 : (Number(acquireForm.acquisition_cost) || 0),
      original_price: Number(acquireForm.original_price) ?? 0,
      custom_sub_category: isOtherSub ? (acquireForm.custom_sub_category?.trim() || null) : null,
    };
    if (contactMode === 'existing') {
      payload.acquisition_contact_id = selectedContactId;
    } else {
      const platformVal = newContact.source_platform === SOURCE_PLATFORM_OTHER_SENTINEL
        ? newContact.source_platform_other.trim() || t('input.sourcePlatformOther')
        : newContact.source_platform;
      payload.contact = {
        source_platform: platformVal,
        name: newContact.name.trim(),
        platform_user_id: newContact.platform_user_id?.trim() || null,
        phone: newContact.phone?.trim() || null,
        email: newContact.email?.trim() || null,
      };
    }
    acquireMutation.mutate(payload);
  }

  function handleSellSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (sellContactMode === 'existing') {
      if (!sellSelectedContactId) {
        setError(t('input.selectContactRequired'));
        return;
      }
    } else {
      const platformVal = sellNewContact.source_platform === SOURCE_PLATFORM_OTHER_SENTINEL ? sellNewContact.source_platform_other.trim() : sellNewContact.source_platform;
      if (!sellNewContact.source_platform || !platformVal) {
        setError(t('input.selectSourcePlatform'));
        return;
      }
      if (!sellNewContact.name.trim()) {
        setError(t('input.customerDetailsNameRequired'));
        return;
      }
    }
    const salePrice = Number(sellForm.sale_price);
    if (Number.isNaN(salePrice) || salePrice < 0) {
      setError(t('output.salePriceRequired'));
      return;
    }
    const pref = sellForm.handover_prefecture?.trim();
    const city = sellForm.handover_city?.trim();
    const exact = sellForm.handover_exact_location?.trim();
    if (!pref || pref === UNDECIDED || !city || city === UNDECIDED || !exact) {
      setError(t('output.handoverLocationRequired'));
      return;
    }
    if (!sellConfirm) {
      setSellConfirm(true);
      return;
    }
    const payload: CreateSaleBody = {
      item_id: sellForm.item_id,
      sale_price: salePrice,
      sale_date: sellForm.sale_date,
      handover_prefecture: sellForm.handover_prefecture ?? undefined,
      handover_city: sellForm.handover_city ?? undefined,
      handover_exact_location: sellForm.handover_exact_location ?? undefined,
    };
    if (sellContactMode === 'existing') {
      payload.contact_id = sellSelectedContactId;
    } else {
      const platformVal = sellNewContact.source_platform === SOURCE_PLATFORM_OTHER_SENTINEL
        ? (sellNewContact.source_platform_other.trim() || t('input.sourcePlatformOther'))
        : sellNewContact.source_platform;
      payload.contact = {
        source_platform: platformVal,
        name: sellNewContact.name.trim(),
        platform_user_id: sellNewContact.platform_user_id?.trim() || null,
        phone: sellNewContact.phone?.trim() || null,
        email: sellNewContact.email?.trim() || null,
      };
    }
    sellMutation.mutate(payload);
  }

  function handleRentSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (rentContactMode === 'existing') {
      if (!rentSelectedContactId) {
        setError(t('input.selectContactRequired'));
        return;
      }
    } else {
      const platformVal = rentNewContact.source_platform === SOURCE_PLATFORM_OTHER_SENTINEL ? rentNewContact.source_platform_other.trim() : rentNewContact.source_platform;
      if (!rentNewContact.source_platform || !platformVal) {
        setError(t('input.selectSourcePlatform'));
        return;
      }
      if (!rentNewContact.name.trim()) {
        setError(t('input.customerDetailsNameRequired'));
        return;
      }
    }
    const rentPref = rentForm.handover_prefecture?.trim();
    const rentCity = rentForm.handover_city?.trim();
    const rentExact = rentForm.handover_exact_location?.trim();
    if (!rentPref || rentPref === UNDECIDED || !rentCity || rentCity === UNDECIDED || !rentExact) {
      setError(t('output.handoverLocationRequired'));
      return;
    }
    const payload: StartRentalBody = {
      item_id: rentForm.item_id,
      rent_period: rentForm.rent_period ?? 'monthly',
      rent_price_monthly: rentForm.rent_period === 'monthly' ? (rentForm.rent_price_monthly ?? undefined) : undefined,
      rent_price_annually: rentForm.rent_period === 'annually' ? (rentForm.rent_price_annually ?? undefined) : undefined,
      deposit: rentForm.deposit ?? undefined,
      start_date: rentForm.start_date,
      expected_end_date: rentForm.expected_end_date,
      handover_prefecture: rentForm.handover_prefecture ?? undefined,
      handover_city: rentForm.handover_city ?? undefined,
      handover_exact_location: rentForm.handover_exact_location ?? undefined,
    };
    if (rentContactMode === 'existing') {
      payload.contact_id = rentSelectedContactId;
    } else {
      const platformVal = rentNewContact.source_platform === SOURCE_PLATFORM_OTHER_SENTINEL
        ? (rentNewContact.source_platform_other.trim() || t('input.sourcePlatformOther'))
        : rentNewContact.source_platform;
      payload.contact = {
        source_platform: platformVal,
        name: rentNewContact.name.trim(),
        platform_user_id: rentNewContact.platform_user_id?.trim() || null,
        phone: rentNewContact.phone?.trim() || null,
        email: rentNewContact.email?.trim() || null,
      };
    }
    rentMutation.mutate(payload);
  }

  function handleEndRentalSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!endRentalId) return;
    setError('');
    endRentalMutation.mutate({ id: endRentalId, body: endForm });
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto w-full max-w-full min-w-0">
      <header className="text-center lg:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-roomi-brown">{t('records.title')}</h1>
        <p className="text-roomi-brownLight mt-1">{t('records.intro')}</p>
      </header>

      {toast && (
        <CenteredToast
          message={toast}
          variant="success"
          onDismiss={() => setToast('')}
          autoDismissMs={3000}
        />
      )}
      {error && (
        <CenteredToast message={error} variant="error" onDismiss={() => setError('')} />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto sm:max-w-none">
        <div
          className={`rounded-xl border-2 p-5 transition-all ${
            tab === 'acquire' ? 'border-roomi-orange bg-roomi-orange/5 shadow' : 'border-roomi-peach/60 bg-white'
          }`}
        >
          <span className="block text-xs font-bold text-roomi-mint uppercase tracking-wider mb-2">{t('records.in')}</span>
          <h2 className="text-lg font-bold text-roomi-brown">{t('records.inTitle')}</h2>
          <p className="text-sm text-roomi-brownLight mt-1">{t('records.inDesc')}</p>
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setTab('acquire')}
              className={`w-full rounded-lg py-2.5 text-sm font-semibold border-2 transition-all ${
                tab === 'acquire' ? 'border-roomi-orange bg-roomi-orange text-white' : 'border-gray-300 text-gray-700 hover:border-roomi-orange hover:bg-roomi-orange/10'
              }`}
            >
              {t('records.tab.acquire')}
            </button>
          </div>
        </div>

        <div
          className={`rounded-xl border-2 p-5 transition-all ${
            tab === 'sell' || tab === 'rent' ? 'border-roomi-orange bg-roomi-orange/5 shadow' : 'border-roomi-peach/60 bg-white'
          }`}
        >
          <span className="block text-xs font-bold text-roomi-mint uppercase tracking-wider mb-2">{t('records.out')}</span>
          <h2 className="text-lg font-bold text-roomi-brown">{t('records.outTitle')}</h2>
          <p className="text-sm text-roomi-brownLight mt-1">{t('records.outDesc')}</p>
          <div className="flex gap-3 mt-3">
            <button
              type="button"
              onClick={() => setTab('sell')}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold border-2 transition-all ${
                tab === 'sell' ? 'border-roomi-orange bg-roomi-orange text-white' : 'border-gray-300 text-gray-700 hover:border-roomi-orange hover:bg-roomi-orange/10'
              }`}
            >
              {t('records.tab.sell')}
            </button>
            <button
              type="button"
              onClick={() => setTab('rent')}
              className={`flex-1 rounded-lg py-2.5 text-sm font-semibold border-2 transition-all ${
                tab === 'rent' ? 'border-roomi-orange bg-roomi-orange text-white' : 'border-gray-300 text-gray-700 hover:border-roomi-orange hover:bg-roomi-orange/10'
              }`}
            >
              {t('records.tab.rent')}
            </button>
          </div>
        </div>
      </div>

      <div className="pt-2 border-t border-roomi-peach/60">
        <p className="text-xs font-semibold text-roomi-brownLight uppercase tracking-wider mb-6 text-center lg:text-left">
          {tab === 'acquire' ? t('records.in') : t('records.out')} — {tab === 'acquire' ? t('records.tab.acquire') : tab === 'sell' ? t('records.tab.sell') : t('records.tab.rent')}
        </p>

        {tab === 'acquire' && (
          <>
            <section className="card p-6 sm:p-8 max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold text-roomi-brown mb-6">{t('input.newAcquisition')}</h2>
              <form onSubmit={handleAcquireSubmit} className="space-y-5">
                <div>
                  <label className="label">{t('table.title')} *</label>
                  <input
                    type="text"
                    value={acquireForm.title}
                    onChange={(e) => setAcquireForm((f) => ({ ...f, title: e.target.value }))}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">{t('table.category')} *</label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select
                      value={mainId}
                      onChange={(e) => { setMainId(e.target.value); setAcquireForm((f) => ({ ...f, sub_category_id: '', custom_sub_category: null })); }}
                      className="input-field"
                    >
                      <option value="">—</option>
                      {mainCategories.map((c) => <option key={c.id} value={c.id}>{c.nameEn ?? c.name}</option>)}
                    </select>
                    <select
                      value={acquireForm.sub_category_id}
                      onChange={(e) => setAcquireForm((f) => ({ ...f, sub_category_id: e.target.value, custom_sub_category: null }))}
                      className="input-field"
                      required
                    >
                      <option value="">—</option>
                      {subCategories.map((c) => <option key={c.id} value={c.id}>{c.nameEn ?? c.name}</option>)}
                    </select>
                  </div>
                  {subCategories.find((c) => c.id === acquireForm.sub_category_id)?.name?.toLowerCase() === 'other' && (
                    <div className="mt-2">
                      <label className="label">{t('input.customSubCategory')} *</label>
                      <input
                        type="text"
                        value={acquireForm.custom_sub_category ?? ''}
                        onChange={(e) => setAcquireForm((f) => ({ ...f, custom_sub_category: e.target.value.trim() || null }))}
                        className="input-field mt-1"
                        placeholder="e.g. gaming_chair, coffee_machine"
                        maxLength={120}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="label">{t('input.acquisitionDate')}</label>
                  <input
                    type="date"
                    value={acquireForm.acquisition_date ?? today()}
                    onChange={(e) => setAcquireForm((f) => ({ ...f, acquisition_date: e.target.value || null }))}
                    className="input-field"
                  />
                </div>
                <div className="border border-roomi-peach/60 rounded-roomiLg p-5 space-y-4 bg-roomi-cream/40">
                  <h3 className="text-sm font-semibold text-roomi-brown">{t('input.customerDetails')}</h3>
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
                      <label className="label">{t('input.contactSearch')}</label>
                      <input
                        type="text"
                        value={contactSearch}
                        onChange={(e) => setContactSearch(e.target.value)}
                        placeholder={t('common.search')}
                        className="input-field mb-2"
                      />
                      <label className="label">{t('input.selectContact')}</label>
                      <select
                        value={selectedContactId}
                        onChange={(e) => setSelectedContactId(e.target.value)}
                        className="input-field"
                      >
                        <option value="">—</option>
                        {contacts.map((c) => (
                          <option key={c.id} value={c.id}>{c.name} ({c.sourcePlatform})</option>
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
                            <option key={opt} value={opt}>{opt === SOURCE_PLATFORM_OTHER ? t('input.sourcePlatformOther') : opt}</option>
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">{t('input.acquisitionType')}</label>
                    <select
                      value={acquireForm.acquisition_type ?? ''}
                      onChange={(e) => {
                        const v = e.target.value as CreateItemBody['acquisition_type'] | '';
                        setAcquireForm((f) => ({ ...f, acquisition_type: v, ...(v === 'free' ? { acquisition_cost: 0 } : {}) }));
                      }}
                      className="input-field"
                    >
                      <option value="">—</option>
                      <option value="free">{t('input.acquisitionTypeFreeItem')}</option>
                      <option value="cheap">{t('input.acquisitionTypeSecondHand')}</option>
                      <option value="bought">{t('input.acquisitionTypeNewItem')}</option>
                    </select>
                  </div>
                    <div>
                    <label className="label">{t('input.acquisitionCost')}</label>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={acquireForm.acquisition_type === 'free' ? 0 : (acquireForm.acquisition_cost === undefined ? '' : acquireForm.acquisition_cost)}
                      onChange={(e) => setAcquireForm((f) => ({ ...f, acquisition_cost: e.target.value === '' ? undefined : Number(e.target.value) }))}
                      className="input-field"
                      disabled={acquireForm.acquisition_type === 'free'}
                      readOnly={acquireForm.acquisition_type === 'free'}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label">{t('input.originalPrice')} *</label>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={acquireForm.original_price ?? ''}
                      onChange={(e) => setAcquireForm((f) => ({ ...f, original_price: e.target.value ? Number(e.target.value) : 0 }))}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">{t('itemDetail.conditionLabel')}</label>
                    <select
                      value={acquireForm.condition ?? ''}
                      onChange={(e) => setAcquireForm((f) => ({ ...f, condition: e.target.value as CreateItemBody['condition'] | '' }))}
                      className="input-field"
                    >
                      <option value="">—</option>
                      {CONDITION_OPTIONS.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <button type="button" onClick={() => setShowLocationFields((v) => !v)} className="text-sm font-medium text-roomi-orange hover:underline">
                    {showLocationFields ? '− ' : '+ '}{t('input.decideLocation')}
                  </button>
                  {showLocationFields && (
                    <div className="mt-3 space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="label">{t('input.prefecture')}</label>
                          <select
                            value={acquireForm.prefecture ?? UNDECIDED}
                            onChange={(e) => {
                              const p = e.target.value;
                              const cities = getCitiesForPrefecture(p);
                              setAcquireForm((f) => ({ ...f, prefecture: p, city: cities[0] ?? UNDECIDED }));
                            }}
                            className="input-field"
                          >
                            {PREFECTURES.map((pref) => <option key={pref} value={pref}>{pref === UNDECIDED ? t('input.undecided') : pref}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="label">{t('input.city')}</label>
                          <select
                            value={acquireForm.city ?? UNDECIDED}
                            onChange={(e) => setAcquireForm((f) => ({ ...f, city: e.target.value }))}
                            className="input-field"
                          >
                            {getCitiesForPrefecture(acquireForm.prefecture ?? UNDECIDED).map((c) => <option key={c} value={c}>{c === UNDECIDED ? t('input.undecided') : c}</option>)}
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="label">{t('input.addExactLocation')}</label>
                        <input
                          type="text"
                          value={acquireForm.exact_location ?? ''}
                          onChange={(e) => setAcquireForm((f) => ({ ...f, exact_location: e.target.value.trim() || null }))}
                          className="input-field mt-1"
                          placeholder={t('input.addExactLocation')}
                        />
                      </div>
                    </div>
                  )}
                </div>
                <div>
                  <label className="label">{t('itemDetail.notesLabel')}</label>
                  <textarea
                    value={acquireForm.notes ?? ''}
                    onChange={(e) => setAcquireForm((f) => ({ ...f, notes: e.target.value || null }))}
                    className="input-field"
                    rows={2}
                  />
                </div>
                <div className="pt-1">
                  <button type="submit" disabled={acquireMutation.isPending} className="btn-primary">
                    {t('input.saveAcquisition')}
                  </button>
                </div>
              </form>
            </section>
            <section className="card p-6 sm:p-8 mt-8 max-w-2xl mx-auto">
              <h2 className="text-lg font-semibold text-roomi-brown mb-4">{t('input.recentlyAcquired')}</h2>
              {recentlyAcquired.length === 0 ? (
                <p className="text-roomi-brownLight text-sm">{t('input.noAcquisitions')}</p>
              ) : (
                <ul className="divide-y divide-roomi-peach/60">
                  {recentlyAcquired.map((item) => (
                    <li key={item.id} className="py-2">
                      <Link to={`/items/${item.id}`} className="text-roomi-orange hover:underline font-medium">{item.title}</Link>
                      <span className="ml-2 text-sm text-roomi-brownLight">{item.subCategory?.mainCategory?.name} → {item.displaySubCategory ?? item.subCategory?.name}</span>
                      <span className={`ml-2 ${getStatusBadgeClass(item.status)}`}>{item.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        {tab === 'sell' && (
          <section className="card p-6 sm:p-8 max-w-2xl mx-auto">
            <h2 className="text-xl font-semibold text-roomi-brown mb-6">{t('output.createSale')}</h2>
            <form onSubmit={handleSellSubmit} className="space-y-5">
              <div>
                <label className="label">{t('table.item')} *</label>
                <select
                  value={sellForm.item_id}
                  onChange={(e) => setSellForm((f) => ({ ...f, item_id: e.target.value }))}
                  className="input-field"
                  required
                >
                  <option value="">—</option>
                  {availableItems.map((i) => <option key={i.id} value={i.id}>{i.title} (#{i.id.slice(-6)}) — {i.status}</option>)}
                </select>
              </div>
              {sellReservationData?.reservation?.contact && (
                <div className="rounded-roomi border border-roomi-orange/40 bg-roomi-peach/30 px-3 py-2 text-sm text-roomi-brown">
                  {t('output.reservedItemPrefilled', { name: sellReservationData.reservation.contact.name })}
                </div>
              )}
              <div className="border border-roomi-peach/60 rounded-lg p-4 space-y-4 bg-roomi-cream/30">
                <h3 className="text-sm font-semibold text-roomi-brown">{t('input.customerDetails')} (buyer)</h3>
                <div className="flex flex-wrap gap-3">
                  <button type="button" onClick={() => setSellContactMode('existing')} className={`rounded-lg py-2 px-3 text-sm font-medium border-2 ${sellContactMode === 'existing' ? 'border-roomi-orange bg-roomi-orange text-white' : 'border-gray-300 text-gray-700 hover:border-roomi-orange/60'}`}>{t('input.selectExistingContact')}</button>
                  <button type="button" onClick={() => setSellContactMode('new')} className={`rounded-lg py-2 px-3 text-sm font-medium border-2 ${sellContactMode === 'new' ? 'border-roomi-orange bg-roomi-orange text-white' : 'border-gray-300 text-gray-700 hover:border-roomi-orange/60'}`}>{t('input.createNewContact')}</button>
                </div>
                {sellContactMode === 'existing' ? (
                  <>
                    {sellReservationData?.reservation?.contact && sellSelectedContactId === sellReservationData.reservation.contact.id ? (
                      <div className="rounded-roomi border border-roomi-peach/50 bg-roomi-cream/50 px-3 py-2 text-sm text-roomi-brown">
                        <span className="text-roomi-brownLight font-medium">{t('table.buyer')}: </span>
                        {sellReservationData.reservation.contact.name}
                        {sellReservationData.reservation.contact.sourcePlatform && (
                          <span className="text-roomi-brownLight"> ({sellReservationData.reservation.contact.sourcePlatform})</span>
                        )}
                      </div>
                    ) : (
                      <>
                        <input type="text" value={sellContactSearch} onChange={(e) => setSellContactSearch(e.target.value)} placeholder={t('common.search')} className="input-field mb-2" />
                        <select value={sellSelectedContactId} onChange={(e) => setSellSelectedContactId(e.target.value)} className="input-field">
                          <option value="">—</option>
                          {sellContactOptions.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.sourcePlatform})</option>)}
                        </select>
                      </>
                    )}
                  </>
                ) : (
                  <>
                    <div>
                      <label className="label">{t('input.sourcePlatform')} *</label>
                      <select value={sellNewContact.source_platform === SOURCE_PLATFORM_OTHER_SENTINEL ? SOURCE_PLATFORM_OTHER : sellNewContact.source_platform} onChange={(e) => setSellNewContact((c) => ({ ...c, source_platform: e.target.value === SOURCE_PLATFORM_OTHER ? SOURCE_PLATFORM_OTHER_SENTINEL : e.target.value }))} className="input-field">
                        <option value="">—</option>
                        {SOURCE_PLATFORM_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt === SOURCE_PLATFORM_OTHER ? t('input.sourcePlatformOther') : opt}</option>)}
                      </select>
                      {sellNewContact.source_platform === SOURCE_PLATFORM_OTHER_SENTINEL && <input type="text" value={sellNewContact.source_platform_other} onChange={(e) => setSellNewContact((c) => ({ ...c, source_platform_other: e.target.value }))} className="input-field mt-2" placeholder={t('input.sourcePlatformOther')} />}
                    </div>
                    <div><label className="label">{t('table.name')} *</label><input type="text" value={sellNewContact.name} onChange={(e) => setSellNewContact((c) => ({ ...c, name: e.target.value }))} className="input-field" required /></div>
                    <div><label className="label">{t('input.platformId')}</label><input type="text" value={sellNewContact.platform_user_id} onChange={(e) => setSellNewContact((c) => ({ ...c, platform_user_id: e.target.value }))} className="input-field" placeholder={t('input.platformIdPlaceholder')} /></div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className="label">{t('table.phone')}</label><input type="text" value={sellNewContact.phone} onChange={(e) => setSellNewContact((c) => ({ ...c, phone: e.target.value }))} className="input-field" /></div>
                      <div><label className="label">{t('table.email')}</label><input type="email" value={sellNewContact.email} onChange={(e) => setSellNewContact((c) => ({ ...c, email: e.target.value }))} className="input-field" /></div>
                    </div>
                  </>
                )}
              </div>
              <div>
                <label className="label">{t('output.salePrice')} *</label>
                <input type="number" min={0} step={0.01} value={sellForm.sale_price === 0 ? '' : sellForm.sale_price} onChange={(e) => setSellForm((f) => ({ ...f, sale_price: Number(e.target.value) || 0 }))} className="input-field" required />
                {sellForm.item_id && (() => {
                  const item = availableItems.find((i) => i.id === sellForm.item_id);
                  return item != null ? (
                    <p className="mt-1.5 text-sm text-roomi-brownLight">
                      {t('output.buyPrice')}: {Number(item.acquisitionCost).toLocaleString()}
                    </p>
                  ) : null;
                })()}
              </div>
              <div>
                <label className="label">{t('input.decideLocation')} *</label>
                <div className="mt-2 space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div><label className="label">{t('input.prefecture')}</label><select value={sellForm.handover_prefecture ?? UNDECIDED} onChange={(e) => { const p = e.target.value; const cities = getCitiesForPrefecture(p); setSellForm((f) => ({ ...f, handover_prefecture: p, handover_city: cities[0] ?? UNDECIDED })); }} className="input-field">{PREFECTURES.map((pref) => <option key={pref} value={pref}>{pref === UNDECIDED ? t('input.undecided') : pref}</option>)}</select></div>
                    <div><label className="label">{t('input.city')}</label><select value={sellForm.handover_city ?? UNDECIDED} onChange={(e) => setSellForm((f) => ({ ...f, handover_city: e.target.value }))} className="input-field">{getCitiesForPrefecture(sellForm.handover_prefecture ?? UNDECIDED).map((c) => <option key={c} value={c}>{c === UNDECIDED ? t('input.undecided') : c}</option>)}</select></div>
                  </div>
                  <div><label className="label">{t('input.addExactLocationRequired')}</label><input type="text" value={sellForm.handover_exact_location ?? ''} onChange={(e) => setSellForm((f) => ({ ...f, handover_exact_location: e.target.value.trim() || null }))} className="input-field mt-1" placeholder={t('input.addExactLocationRequired')} required /></div>
                </div>
              </div>
              <div><label className="label">{t('table.saleDate')}</label><input type="date" value={sellForm.sale_date} onChange={(e) => setSellForm((f) => ({ ...f, sale_date: e.target.value }))} className="input-field" /></div>
              {sellConfirm && <p className="text-amber-700 text-sm bg-amber-50 rounded px-3 py-2">{t('output.confirmSell')}</p>}
              <div className="flex gap-2">
                <button type="submit" disabled={sellMutation.isPending} className="btn-primary">{sellConfirm ? t('output.confirmSellBtn') : t('output.sellBtn')}</button>
                {sellConfirm && <button type="button" onClick={() => setSellConfirm(false)} className="btn-ghost">{t('common.cancel')}</button>}
              </div>
            </form>
          </section>
        )}

        {tab === 'rent' && (
          <>
            <section className="card p-6 sm:p-8 max-w-2xl mx-auto">
              <h2 className="text-xl font-semibold text-roomi-brown mb-6">{t('output.createRental')}</h2>
              <form onSubmit={handleRentSubmit} className="space-y-5">
                <div>
                  <label className="label">{t('table.item')} *</label>
                  <select value={rentForm.item_id} onChange={(e) => setRentForm((f) => ({ ...f, item_id: e.target.value }))} className="input-field" required>
                    <option value="">—</option>
                    {availableItems.map((i) => <option key={i.id} value={i.id}>{i.title} (#{i.id.slice(-6)}) — {i.status}</option>)}
                  </select>
                </div>
                {rentReservationData?.reservation?.contact && (
                  <div className="rounded-roomi border border-roomi-orange/40 bg-roomi-peach/30 px-3 py-2 text-sm text-roomi-brown">
                    {t('output.reservedItemPrefilled', { name: rentReservationData.reservation.contact.name })}
                  </div>
                )}
                <div className="border border-roomi-peach/60 rounded-lg p-4 space-y-4 bg-roomi-cream/30">
                  <h3 className="text-sm font-semibold text-roomi-brown">{t('input.customerDetails')} (renter)</h3>
                  <div className="flex flex-wrap gap-3">
                    <button type="button" onClick={() => setRentContactMode('existing')} className={`rounded-lg py-2 px-3 text-sm font-medium border-2 ${rentContactMode === 'existing' ? 'border-roomi-orange bg-roomi-orange text-white' : 'border-gray-300 text-gray-700 hover:border-roomi-orange/60'}`}>{t('input.selectExistingContact')}</button>
                    <button type="button" onClick={() => setRentContactMode('new')} className={`rounded-lg py-2 px-3 text-sm font-medium border-2 ${rentContactMode === 'new' ? 'border-roomi-orange bg-roomi-orange text-white' : 'border-gray-300 text-gray-700 hover:border-roomi-orange/60'}`}>{t('input.createNewContact')}</button>
                  </div>
                  {rentContactMode === 'existing' ? (
                    <>
                      {rentReservationData?.reservation?.contact && rentSelectedContactId === rentReservationData.reservation.contact.id ? (
                        <div className="rounded-roomi border border-roomi-peach/50 bg-roomi-cream/50 px-3 py-2 text-sm text-roomi-brown">
                          <span className="text-roomi-brownLight font-medium">{t('table.renter')}: </span>
                          {rentReservationData.reservation.contact.name}
                          {rentReservationData.reservation.contact.sourcePlatform && (
                            <span className="text-roomi-brownLight"> ({rentReservationData.reservation.contact.sourcePlatform})</span>
                          )}
                        </div>
                      ) : (
                        <>
                          <input type="text" value={rentContactSearch} onChange={(e) => setRentContactSearch(e.target.value)} placeholder={t('common.search')} className="input-field mb-2" />
                          <select value={rentSelectedContactId} onChange={(e) => setRentSelectedContactId(e.target.value)} className="input-field"><option value="">—</option>{rentContactOptions.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.sourcePlatform})</option>)}</select>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <div><label className="label">{t('input.sourcePlatform')} *</label><select value={rentNewContact.source_platform === SOURCE_PLATFORM_OTHER_SENTINEL ? SOURCE_PLATFORM_OTHER : rentNewContact.source_platform} onChange={(e) => setRentNewContact((c) => ({ ...c, source_platform: e.target.value === SOURCE_PLATFORM_OTHER ? SOURCE_PLATFORM_OTHER_SENTINEL : e.target.value }))} className="input-field"><option value="">—</option>{SOURCE_PLATFORM_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt === SOURCE_PLATFORM_OTHER ? t('input.sourcePlatformOther') : opt}</option>)}</select>{rentNewContact.source_platform === SOURCE_PLATFORM_OTHER_SENTINEL && <input type="text" value={rentNewContact.source_platform_other} onChange={(e) => setRentNewContact((c) => ({ ...c, source_platform_other: e.target.value }))} className="input-field mt-2" placeholder={t('input.sourcePlatformOther')} />}</div>
                      <div><label className="label">{t('table.name')} *</label><input type="text" value={rentNewContact.name} onChange={(e) => setRentNewContact((c) => ({ ...c, name: e.target.value }))} className="input-field" required /></div>
                      <div><label className="label">{t('input.platformId')}</label><input type="text" value={rentNewContact.platform_user_id} onChange={(e) => setRentNewContact((c) => ({ ...c, platform_user_id: e.target.value }))} className="input-field" placeholder={t('input.platformIdPlaceholder')} /></div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label className="label">{t('table.phone')}</label><input type="text" value={rentNewContact.phone} onChange={(e) => setRentNewContact((c) => ({ ...c, phone: e.target.value }))} className="input-field" /></div><div><label className="label">{t('table.email')}</label><input type="email" value={rentNewContact.email} onChange={(e) => setRentNewContact((c) => ({ ...c, email: e.target.value }))} className="input-field" /></div></div>
                    </>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="label">{t('output.rentPeriod')}</label><select value={rentForm.rent_period ?? 'monthly'} onChange={(e) => setRentForm((f) => ({ ...f, rent_period: e.target.value as 'monthly' | 'annually' }))} className="input-field"><option value="monthly">{t('output.rentPeriodMonthly')}</option><option value="annually">{t('output.rentPeriodAnnually')}</option></select></div>
                  <div>
                    <label className="label">{rentForm.rent_period === 'annually' ? t('output.rentPriceAnnually') : t('output.rentPriceMonthly')}</label>
                    <input type="number" min={0} step={0.01} value={rentForm.rent_period === 'annually' ? (rentForm.rent_price_annually ?? '') : (rentForm.rent_price_monthly ?? '')} onChange={(e) => setRentForm((f) => ({ ...f, ...(f.rent_period === 'annually' ? { rent_price_annually: e.target.value ? Number(e.target.value) : null } : { rent_price_monthly: e.target.value ? Number(e.target.value) : null }) }))} className="input-field" />
                    {rentForm.item_id && (() => {
                      const item = availableItems.find((i) => i.id === rentForm.item_id);
                      return item != null ? (
                        <p className="mt-1.5 text-sm text-roomi-brownLight">
                          {t('output.buyPrice')}: {Number(item.acquisitionCost).toLocaleString()}
                        </p>
                      ) : null;
                    })()}
                  </div>
                </div>
                <div><label className="label">{t('output.deposit')}</label><input type="number" min={0} step={0.01} value={rentForm.deposit ?? ''} onChange={(e) => setRentForm((f) => ({ ...f, deposit: e.target.value ? Number(e.target.value) : null }))} className="input-field" placeholder={t('output.depositPlaceholder')} /></div>
                {rentForm.item_id && (() => {
                  const item = availableItems.find((i) => i.id === rentForm.item_id);
                  if (!item) return null;
                  const originalPrice = Number(item.originalPrice ?? item.acquisitionCost) ?? 0;
                  const hasOriginalPrice = originalPrice > 0;
                  return (
                    <div className="rounded-roomi border border-roomi-peach/50 bg-roomi-cream/40 p-3 space-y-2">
                      <p className="text-sm font-medium text-roomi-brown">{t('output.originalPriceForDeposit')}</p>
                      {hasOriginalPrice ? (
                        <p className="text-roomi-brownLight text-sm">{t('input.originalPrice')}: {originalPrice.toLocaleString()}</p>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            value={rentOriginalPriceEdit}
                            onChange={(e) => setRentOriginalPriceEdit(e.target.value)}
                            className="input-field flex-1 min-w-[120px]"
                            placeholder={t('output.setOriginalPricePlaceholder')}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const v = Number(rentOriginalPriceEdit);
                              if (!Number.isFinite(v) || v < 0) return;
                              updateRentItemOriginalPriceMutation.mutate({ itemId: item.id, original_price: v });
                            }}
                            disabled={updateRentItemOriginalPriceMutation.isPending || !rentOriginalPriceEdit.trim()}
                            className="btn-secondary text-sm py-2 px-3"
                          >
                            {t('output.saveOriginalPrice')}
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })()}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div><label className="label">{t('table.start')} *</label><input type="date" value={rentForm.start_date} onChange={(e) => setRentForm((f) => ({ ...f, start_date: e.target.value }))} className="input-field" required /></div>
                  <div><label className="label">{t('table.expectedEnd')} *</label><input type="date" value={rentForm.expected_end_date} onChange={(e) => setRentForm((f) => ({ ...f, expected_end_date: e.target.value }))} className="input-field" required /></div>
                </div>
                <div>
                  <label className="label">{t('input.decideLocation')} *</label>
                  <div className="mt-2 space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div><label className="label">{t('input.prefecture')}</label><select value={rentForm.handover_prefecture ?? UNDECIDED} onChange={(e) => { const p = e.target.value; const cities = getCitiesForPrefecture(p); setRentForm((f) => ({ ...f, handover_prefecture: p, handover_city: cities[0] ?? UNDECIDED })); }} className="input-field">{PREFECTURES.map((pref) => <option key={pref} value={pref}>{pref === UNDECIDED ? t('input.undecided') : pref}</option>)}</select></div>
                      <div><label className="label">{t('input.city')}</label><select value={rentForm.handover_city ?? UNDECIDED} onChange={(e) => setRentForm((f) => ({ ...f, handover_city: e.target.value }))} className="input-field">{getCitiesForPrefecture(rentForm.handover_prefecture ?? UNDECIDED).map((c) => <option key={c} value={c}>{c === UNDECIDED ? t('input.undecided') : c}</option>)}</select></div>
                    </div>
                    <div><label className="label">{t('input.addExactLocationRequired')}</label><input type="text" value={rentForm.handover_exact_location ?? ''} onChange={(e) => setRentForm((f) => ({ ...f, handover_exact_location: e.target.value.trim() || null }))} className="input-field mt-1" placeholder={t('input.addExactLocationRequired')} required /></div>
                  </div>
                </div>
                <button type="submit" disabled={rentMutation.isPending} className="btn-primary">{t('output.startRentalBtn')}</button>
              </form>
            </section>
            <section className="rounded-xl border border-roomi-peach/60 bg-white p-6 mt-6">
              <h2 className="text-lg font-semibold text-roomi-brown mb-4">{t('output.endRentalBtn')}</h2>
              {rentals.length === 0 ? <p className="text-roomi-brownLight text-sm">{t('output.noActiveRentals')}</p> : (
                <ul className="space-y-3">
                  {rentals.map((r) => (
                    <li key={r.id} className="flex items-center justify-between py-2 border-b border-roomi-peach/60">
                      <span>{r.item?.title} — {r.customer?.name} (start: {r.startDate})</span>
                      {endRentalId === r.id ? (
                        <form onSubmit={handleEndRentalSubmit} className="flex gap-2 items-center">
                          <select value={endForm.next_item_status} onChange={(e) => setEndForm((f) => ({ ...f, next_item_status: e.target.value as 'in_stock' | 'disposed' }))} className="input-field py-1 px-2 text-sm inline-block">
                            <option value="in_stock">in_stock</option>
                            <option value="disposed">disposed</option>
                          </select>
                          <button type="submit" disabled={endRentalMutation.isPending} className="btn-primary py-1.5 px-3 text-sm">End</button>
                          <button type="button" onClick={() => setEndRentalId(null)} className="btn-ghost py-1 px-3 text-sm">{t('common.cancel')}</button>
                        </form>
                      ) : (
                        <button type="button" onClick={() => setEndRentalId(r.id)} className="btn-primary py-1.5 px-3 text-sm">{t('output.endRentalBtn')}</button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
