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
    setListed: (id: string) => request<Item>(`/items/${id}/list`, { method: 'POST' }),
    dispose: (id: string) => request<Item>(`/items/${id}`, { method: 'DELETE' }),
  },

  customers: {
    getMany: () => request<Customer[]>('/customers'),
    getById: (id: string) => request<Customer>(`/customers/${id}`),
    create: (body: CreateCustomerBody) => request<Customer>('/customers', { method: 'POST', body: JSON.stringify(body) }),
    update: (id: string, body: Partial<CreateCustomerBody>) => request<Customer>(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
    delete: (id: string) => request<void>(`/customers/${id}`, { method: 'DELETE' }),
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

export interface Item {
  id: string;
  title: string;
  subCategoryId: string;
  status: string;
  condition: string;
  acquisitionType: string;
  acquisitionCost: number;
  originalPrice?: number | null;
  locationArea?: string | null;
  exactLocation?: string | null;
  notes?: string | null;
  acquisitionDate?: string | null;
  createdAt: string;
  updatedAt: string;
  subCategory?: { id: string; name: string; mainCategory?: { id: string; name: string } };
}

export interface CreateItemBody {
  title: string;
  sub_category_id: string;
  source_platform?: string | null;
  acquisition_type?: string;
  acquisition_cost?: number;
  original_price?: number | null;
  condition?: string;
  location_area?: string | null;
  exact_location?: string | null;
  status?: string;
  acquisition_date?: string | null;
  notes?: string | null;
}

export interface Customer {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  preferredLanguage?: string;
  sourcePlatform?: string | null;
  appId?: string | null;
  createdAt: string;
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
  startDate: string;
  expectedEndDate: string;
  actualEndDate?: string | null;
  status: string;
  rentPriceMonthly?: number | null;
  deposit?: number | null;
  damageFee?: number | null;
  notes?: string | null;
  handoverLocation?: string | null;
  isOverdue?: boolean;
  item?: Item;
  customer?: Customer;
  createdAt: string;
}

export interface StartRentalBody {
  item_id: string;
  customer_id: string;
  rent_price_monthly?: number | null;
  deposit?: number | null;
  start_date: string;
  expected_end_date: string;
  handover_location?: string | null;
  notes?: string | null;
}

export interface EndRentalBody {
  actual_end_date?: string | null;
  damage_fee?: number | null;
  next_item_status: 'in_stock' | 'listed' | 'disposed';
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
  customer_id: string;
  sale_price?: number | null;
  sale_date: string;
  platform_sold?: string | null;
  handover_location?: string | null;
  notes?: string | null;
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
