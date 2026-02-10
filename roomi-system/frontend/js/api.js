// File: frontend/js/api.js
// Base URL for API - change if backend runs elsewhere

const API_BASE = 'http://localhost:3000/api';

async function request(path, options = {}) {
  const url = path.startsWith('http') ? path : `${API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText || 'Request failed');
  return data;
}

const api = {
  // Categories (main + sub)
  getMainCategories: () => request('/categories/main'),
  getSubCategories: (mainId) => request('/categories/sub/' + mainId),
  createMainCategory: (body) => request('/categories/main', { method: 'POST', body: JSON.stringify(body) }),
  createSubCategory: (body) => request('/categories/sub', { method: 'POST', body: JSON.stringify(body) }),

  // Items
  getItemCounts: () => request('/items/counts'),
  getRecentItems: () => request('/items/recent'),
  getRecentlyAcquiredItems: () => request('/items/recently-acquired'),
  getAvailableItems: (params = {}) => {
    const clean = {};
    Object.keys(params).forEach(function (k) {
      var v = params[k];
      if (v !== undefined && v !== null && v !== '') clean[k] = v;
    });
    const q = new URLSearchParams(clean).toString();
    return request('/items/available' + (q ? '?' + q : ''));
  },
  getItems: (params = {}) => {
    const clean = {};
    Object.keys(params).forEach(function (k) {
      var v = params[k];
      if (v !== undefined && v !== null && v !== '') clean[k] = v;
    });
    if (clean.sub_category_id != null) clean.sub_category_id = String(clean.sub_category_id);
    const q = new URLSearchParams(clean).toString();
    return request('/items' + (q ? '?' + q : ''));
  },
  getItem: (id) => request(`/items/${id}`),
  createItem: (body) => request('/items', { method: 'POST', body: JSON.stringify(body) }),
  updateItem: (id, body) => request(`/items/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteItem: (id) => request(`/items/${id}`, { method: 'DELETE' }),

  // Output workflow
  outputSell: (body) => request('/output/sell', { method: 'POST', body: JSON.stringify(body) }),
  outputRent: (body) => request('/output/rent', { method: 'POST', body: JSON.stringify(body) }),
  outputEndRental: (id, body) => request(`/output/rentals/${id}/end`, { method: 'PUT', body: JSON.stringify(body) }),

  // Customers
  getCustomers: () => request('/customers'),
  getCustomer: (id) => request(`/customers/${id}`),
  createCustomer: (body) => request('/customers', { method: 'POST', body: JSON.stringify(body) }),
  updateCustomer: (id, body) => request(`/customers/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteCustomer: (id) => request(`/customers/${id}`, { method: 'DELETE' }),

  // Rentals
  getRentals: (params = {}) => {
    const clean = {};
    Object.keys(params).forEach(function (k) {
      var v = params[k];
      if (v !== undefined && v !== null && v !== '') clean[k] = v;
    });
    const q = new URLSearchParams(clean).toString();
    return request('/rentals' + (q ? '?' + q : ''));
  },
  getRental: (id) => request(`/rentals/${id}`),
  createRental: (body) => request('/rentals', { method: 'POST', body: JSON.stringify(body) }),
  updateRental: (id, body) => request(`/rentals/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  setRentalDamage: (id, damageFee) => request(`/rentals/${id}/damage`, { method: 'PATCH', body: JSON.stringify({ damage_fee: damageFee }) }),

  // Sales
  getSales: () => request('/sales'),
  getSale: (id) => request(`/sales/${id}`),
  createSale: (body) => request('/sales', { method: 'POST', body: JSON.stringify(body) }),
};
