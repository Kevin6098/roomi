import { getToken } from '../auth/storage';

const API_BASE = '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  const token = getToken();
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error || res.statusText || 'Request failed');
  return data as T;
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
}

export const api = {
  health: () => request<{ ok: boolean }>('/health'),
  auth: {
    login: (email: string, password: string) =>
      request<{ user: AuthUser; token: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    me: () => request<{ user: AuthUser }>('/auth/me'),
  },

  categories: {
    getMain: () => request<MainCategory[]>('/categories/main'),
    getMainById: (id: string) => request<MainCategoryWithSubs>('/categories/main/' + id),
    getSub: (mainId: string) => request<SubCategory[]>('/categories/sub/' + mainId),
    getAllSubs: () => request<SubCategory[]>('/categories/sub'),
    getSubById: (id: string) => request<SubCategory>('/categories/sub/by-id/' + id),
    createMain: (body: { name_en: string; name_ja?: string | null }) =>
      request<MainCategory>('/categories/main', { method: 'POST', body: JSON.stringify(body) }),
    updateMain: (id: string, body: { name_en?: string; name_ja?: string | null }) =>
      request<MainCategory>('/categories/main/' + id, { method: 'PUT', body: JSON.stringify(body) }),
    deleteMain: (id: string) => request<void>('/categories/main/' + id, { method: 'DELETE' }),
    createSub: (body: { main_category_id: string; name_en: string; name_ja?: string | null }) =>
      request<SubCategory>('/categories/sub', { method: 'POST', body: JSON.stringify(body) }),
    updateSub: (id: string, body: { name_en?: string; name_ja?: string | null }) =>
      request<SubCategory>('/categories/sub/' + id, { method: 'PUT', body: JSON.stringify(body) }),
    deleteSub: (id: string) => request<void>('/categories/sub/' + id, { method: 'DELETE' }),
  },

  items: {
    getCounts: () => request<Record<string, number>>('/items/counts'),
    getRecent: () => request<Item[]>('/items/recent'),
    getRecentlyAcquired: () => request<Item[]>('/items/recently-acquired'),
    getAvailable: (params?: { search?: string; sub_category_id?: string; location?: string }) => {
      const q = new URLSearchParams();
      if (params?.search) q.set('search', params.search);
      if (params?.sub_category_id) q.set('sub_category_id', params.sub_category_id);
      if (params?.location) q.set('location', params.location);
      const query = q.toString();
      return request<Item[]>(`/items/available${query ? `?${query}` : ''}`);
    },
    getMany: (params?: { status?: string; sub_category_id?: string; search?: string }) => {
      const q = new URLSearchParams();
      if (params?.status) q.set('status', params.status);
      if (params?.sub_category_id) q.set('sub_category_id', params.sub_category_id);
      if (params?.search) q.set('search', params.search);
      const query = q.toString();
      return request<Item[]>(`/items${query ? `?${query}` : ''}`);
    },
    getById: (id: string) => request<Item>(`/items/${id}`),
    create: (body: CreateItemBody) => request<Item>('/items', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<CreateItemBody>) => request<Item>(`/items/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    getListings: (id: string) => request<ItemListing[]>(`/items/${id}/listings`),
    createListing: (id: string, body: { platform: string; listing_url?: string | null; listing_ref_id?: string | null }) =>
      request<ItemListing>(`/items/${id}/listings`, { method: 'POST', body: JSON.stringify(body) }),
    setListedFlag: (id: string, is_listed: boolean) =>
      request<{ isListed: boolean }>(`/items/${id}/listed`, { method: 'POST', body: JSON.stringify({ is_listed }) }),
    confirmListingsUpdated: (id: string, body: { listing_ids: string[]; action: 'sold' | 'rented' | 'deleted' }) =>
      request<{ updated: number }>(`/items/${id}/confirm-listings-updated`, { method: 'POST', body: JSON.stringify(body) }),
    reserve: (id: string, body: { contact_id?: string | null; contact?: CreateContactBody; reserve_type: 'sale' | 'rental'; deposit_expected?: number | null; expires_at?: string | null; note?: string | null }) =>
      request<Reservation>(`/items/${id}/reserve`, { method: 'POST', body: JSON.stringify(body) }),
    dispose: (id: string) => request<Item>(`/items/${id}`, { method: 'DELETE' }),
  },

  listings: {
    update: (listingId: string, body: { platform?: string; listing_url?: string | null; listing_ref_id?: string | null; status?: string }) =>
      request<ItemListing>(`/listings/${listingId}`, { method: 'PUT', body: JSON.stringify(body) }),
  },

  reservations: {
    getById: (id: string) => request<Reservation>(`/reservations/${id}`),
    setDepositReceived: (id: string, body: { deposit_received: true; deposit_received_at?: string | null }) =>
      request<Reservation>(`/reservations/${id}/deposit`, { method: 'PUT', body: JSON.stringify(body) }),
    cancel: (id: string, body?: { reason?: string | null }) =>
      request<Reservation>(`/reservations/${id}/cancel`, { method: 'PUT', body: JSON.stringify(body ?? {}) }),
  },

  customers: {
    getMany: () => request<Customer[]>('/customers'),
    getById: (id: string) => request<Customer>(`/customers/${id}`),
    create: (body: CreateCustomerBody) => request<Customer>('/customers', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<CreateCustomerBody>) => request<Customer>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request<void>(`/customers/${id}`, { method: 'DELETE' }),
  },

  contacts: {
    getMany: (params?: { search?: string }) => {
      const q = new URLSearchParams();
      if (params?.search) q.set('search', params.search);
      const query = q.toString();
      return request<Contact[]>(`/contacts${query ? `?${query}` : ''}`);
    },
    getById: (id: string) => request<Contact>(`/contacts/${id}`),
    create: (body: CreateContactBody) => request<Contact>('/contacts', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<CreateContactBody>) => request<Contact>(`/contacts/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request<void>(`/contacts/${id}`, { method: 'DELETE' }),
  },

  rentals: {
    getMany: (params?: { status?: string; overdue?: string }) => {
      const q = new URLSearchParams();
      if (params?.status) q.set('status', params.status);
      if (params?.overdue) q.set('overdue', params.overdue);
      const query = q.toString();
      return request<Rental[]>(`/rentals${query ? `?${query}` : ''}`);
    },
    getById: (id: string) => request<Rental>(`/rentals/${id}`),
    start: (body: StartRentalBody) => request<Rental>('/rentals/start', { method: 'POST', body: JSON.stringify(body) }),
    end: (id: string, body: EndRentalBody) => request<Rental>(`/rentals/${id}/end`, { method: 'PUT', body: JSON.stringify(body) }),
  },

  sales: {
    getMany: () => request<Sale[]>('/sales'),
    getById: (id: string) => request<Sale>(`/sales/${id}`),
    create: (body: CreateSaleBody) => request<Sale>('/sales', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: UpdateSaleBody) => request<Sale>(`/sales/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request<void>(`/sales/${id}`, { method: 'DELETE' }),
  },

  users: {
    getMany: () => request<AdminUser[]>('/users'),
    getById: (id: string) => request<AdminUser>(`/users/${id}`),
    create: (body: CreateUserBody) => request<AdminUser>('/users', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: UpdateUserBody) => request<AdminUser>(`/users/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request<void>(`/users/${id}`, { method: 'DELETE' }),
  },

  dashboard: {
    getOverview: () => request<DashboardOverview>('/dashboard/overview'),
    getFinance: () => request<DashboardFinance>('/dashboard/finance'),
  },
};

// Types (match backend)
export interface MainCategory {
  id: string;
  name: string;
  nameEn?: string | null;
  nameJa?: string | null;
  createdAt?: string;
}

export interface MainCategoryWithSubs extends MainCategory {
  subCategories: SubCategory[];
}

export interface SubCategory {
  id: string;
  mainCategoryId: string;
  name: string;
  nameEn?: string | null;
  nameJa?: string | null;
  mainCategory?: MainCategory;
  createdAt?: string;
}

export interface Contact {
  id: string;
  sourcePlatform: string;
  platformUserId?: string | null;
  name: string;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
  createdAt: string;
  acquisitionItems?: { id: string; title: string }[];
}

export interface Item {
  id: string;
  title: string;
  subCategoryId: string;
  customSubCategory?: string | null;
  displaySubCategory?: string;
  acquisitionContactId?: string | null;
  status: string;
  condition: string;
  acquisitionType: string;
  acquisitionCost: number;
  originalPrice?: number | null;
  prefecture?: string;
  city?: string;
  exactLocation?: string | null;
  locationVisibility?: string;
  locationArea?: string | null;
  notes?: string | null;
  acquisitionDate?: string | null;
  createdAt: string;
  updatedAt: string;
  subCategory?: { id: string; name: string; mainCategory?: { id: string; name: string } };
  acquisitionContact?: Contact | null;
  sale?: Sale | null;
  rentals?: Rental[];
  isListed?: boolean;
  itemListings?: ItemListing[];
}

export interface ItemListing {
  id: string;
  itemId: string;
  platform: string;
  listingUrl?: string | null;
  listingRefId?: string | null;
  status: 'active' | 'needs_update' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export interface Reservation {
  id: string;
  itemId: string;
  contactId?: string | null;
  reserveType: 'sale' | 'rental';
  reservedAt: string;
  expiresAt?: string | null;
  depositExpected?: number | null;
  depositReceived: boolean;
  depositReceivedAt?: string | null;
  note?: string | null;
  status: 'active' | 'cancelled' | 'converted';
  contact?: Contact | null;
  item?: Item;
}

export interface CreateContactBody {
  source_platform: string;
  name: string;
  platform_user_id?: string | null;
  phone?: string | null;
  email?: string | null;
  notes?: string | null;
}

export interface CreateItemBody {
  title: string;
  sub_category_id: string;
  custom_sub_category?: string | null;
  acquisition_contact_id?: string | null;
  contact?: CreateContactBody;
  source_platform?: string | null;
  acquisition_type?: string;
  acquisition_cost?: number;
  original_price?: number | null;
  condition?: string;
  prefecture?: string;
  city?: string;
  exact_location?: string | null;
  location_visibility?: string;
  location_area?: string | null;
  status?: string;
  acquisition_date?: string | null;
  notes?: string | null;
}

export interface Customer {
  id: string;
  contactId?: string | null;
  name: string;
  phone?: string | null;
  email?: string | null;
  preferredLanguage?: string;
  sourcePlatform?: string | null;
  appId?: string | null;
  createdAt: string;
  sales?: { item?: { id: string; title: string } }[];
  rentals?: { item?: { id: string; title: string } }[];
}

export interface CreateCustomerBody {
  name: string;
  phone?: string | null;
  email?: string | null;
  preferred_language?: string;
  source_platform?: string | null;
  app_id?: string | null;
}

export interface Rental {
  id: string;
  itemId: string;
  customerId: string;
  rentPeriod?: string;
  rentPriceMonthly?: number | null;
  rentPriceAnnually?: number | null;
  deposit?: number | null;
  damageFee?: number | null;
  startDate: string;
  expectedEndDate: string;
  actualEndDate?: string | null;
  status: string;
  notes?: string | null;
  handoverLocation?: string | null;
  handoverPrefecture?: string | null;
  handoverCity?: string | null;
  handoverExactLocation?: string | null;
  isOverdue?: boolean;
  item?: Item;
  customer?: Customer;
  createdAt: string;
}

export interface StartRentalBody {
  item_id: string;
  customer_id?: string | null;
  contact_id?: string | null;
  contact?: CreateContactBody;
  rent_period?: 'monthly' | 'annually';
  rent_price_monthly?: number | null;
  rent_price_annually?: number | null;
  deposit?: number | null;
  start_date: string;
  expected_end_date: string;
  handover_location?: string | null;
  handover_prefecture?: string | null;
  handover_city?: string | null;
  handover_exact_location?: string | null;
  notes?: string | null;
  payment_received?: boolean;
  listing_ids?: string[];
}

export interface EndRentalBody {
  actual_end_date?: string | null;
  damage_fee?: number | null;
  next_item_status: 'in_stock' | 'disposed';
  notes?: string | null;
}

export interface Sale {
  id: string;
  itemId: string;
  customerId: string;
  salePrice?: number | null;
  saleDate: string;
  platformSold?: string | null;
  notes?: string | null;
  handoverLocation?: string | null;
  item?: Item;
  customer?: Customer;
  createdAt: string;
}

export interface CreateSaleBody {
  item_id: string;
  customer_id?: string | null;
  contact_id?: string | null;
  contact?: CreateContactBody;
  sale_price: number;
  sale_date: string;
  platform_sold?: string | null;
  handover_location?: string | null;
  handover_prefecture?: string | null;
  handover_city?: string | null;
  handover_exact_location?: string | null;
  notes?: string | null;
  payment_received?: boolean;
  listing_ids?: string[];
}

export interface UpdateSaleBody {
  sale_price?: number | null;
  sale_date?: string;
  platform_sold?: string | null;
  handover_location?: string | null;
  notes?: string | null;
}

export interface AdminUser {
  id: string;
  email: string;
  role: string;
  createdAt: string;
}

export interface CreateUserBody {
  email: string;
  password: string;
  role?: string;
}

export interface UpdateUserBody {
  email?: string;
  password?: string;
  role?: string;
}

export interface DashboardOverview {
  counts: Record<string, number>;
  activeRentalsCount: number;
  overdueCount: number;
  upcomingReturnsCount: number;
  recentItems: Item[];
  reservedItems: Item[];
  overdueRentals: Rental[];
}

export interface DashboardFinance {
  revenueThisMonth: number;
  rentalIncome: number;
  salesIncome: number;
  acquisitionCostSum: number;
  profitEstimate: number;
}
