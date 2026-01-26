const API_BASE_URL = 'https://imsserver-production-8749.up.railway.app';

export const authApi = {
  login: (data) => apiCall('/auth/login', { method: 'POST', body: data }),
};

const apiCall = async (endpoint, options = {}) => {
  let url = `${API_BASE_URL}${endpoint}`;
  
  // Add query parameters for pagination and filters
  const params = new URLSearchParams();
  if (options.page) params.append('page', options.page);
  if (options.limit) params.append('limit', options.limit);
  
  // Add filter parameters
  if (options.filters) {
    if (options.filters.date) params.append('date', options.filters.date);
    if (options.filters.dateFrom) params.append('dateFrom', options.filters.dateFrom);
    if (options.filters.dateTo) params.append('dateTo', options.filters.dateTo);
    if (options.filters.search && options.filters.search.trim()) params.append('search', options.filters.search.trim());
    if (options.filters.filterType && options.filters.filterType.trim()) params.append('filterType', options.filters.filterType.trim());
  }
  
  // Add other filter options (like storeId, shopId, itemId, filterType, userId)
  if (options.storeId) params.append('storeId', options.storeId);
  if (options.shopId) params.append('shopId', options.shopId);
  if (options.itemId) params.append('itemId', options.itemId);
  if (options.filterType && options.filterType.trim()) params.append('filterType', options.filterType.trim());
  if (options.userId) params.append('userId', options.userId);
  
  if (params.toString()) {
    url += `?${params.toString()}`;
  }
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  };

  if (options.body) {
    config.body = JSON.stringify(options.body);
  }

  // Remove page and limit from config as they're in URL
  delete config.page;
  delete config.limit;

  const response = await fetch(url, config);
  
  if (!response.ok) {
    throw new Error(`API error: ${response.statusText}`);
  }

  return response.json();
};

const getUserId = () => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user.id;
    } catch (e) {
      console.error('Error parsing user from localStorage:', e);
    }
  }
  return null;
};

const getSelectedShopId = () => {
  const shopStr = localStorage.getItem('selectedShop');
  if (shopStr) {
    try {
      const shop = JSON.parse(shopStr);
      return shop.id;
    } catch (e) {
      console.error('Error parsing selected shop from localStorage:', e);
    }
  }
  return null;
};

export const shopsApi = {
  getAll: (page, limit, filters) => {
    const options = { page, limit, filters };
    const userId = getUserId();
    if (userId) {
      options.userId = userId;
    }
    return apiCall('/shops', options);
  },
  getOne: (id) => {
    const options = {};
    const userId = getUserId();
    if (userId) {
      options.userId = userId;
    }
    return apiCall(`/shops/${id}`, options);
  },
  getItems: (id) => {
    const options = {};
    const userId = getUserId();
    if (userId) {
      options.userId = userId;
    }
    return apiCall(`/shops/${id}/items`, options);
  },
  getAssetValue: (id) => {
    const options = {};
    const userId = getUserId();
    if (userId) {
      options.userId = userId;
    }
    return apiCall(`/shops/${id}/asset-value`, options);
  },
  create: (data) => {
    const options = { method: 'POST', body: data };
    const userId = getUserId();
    if (userId) {
      options.userId = userId;
    }
    return apiCall('/shops', options);
  },
  update: (id, data) => apiCall(`/shops/${id}`, { method: 'PATCH', body: data }),
  delete: (id) => apiCall(`/shops/${id}`, { method: 'DELETE' }),
};

export const storesApi = {
  getAll: (page, limit, filters) => apiCall('/stores', { page, limit, filters }),
  getOne: (id) => apiCall(`/stores/${id}`),
  getItems: (id) => apiCall(`/stores/${id}/items`),
  getAssetValue: (id) => apiCall(`/stores/${id}/asset-value`),
  create: (data) => apiCall('/stores', { method: 'POST', body: data }),
  update: (id, data) => apiCall(`/stores/${id}`, { method: 'PATCH', body: data }),
  delete: (id) => apiCall(`/stores/${id}`, { method: 'DELETE' }),
};

export const categoriesApi = {
  getAll: (page, limit, filters) => apiCall('/category', { page, limit, filters }),
  getOne: (id) => apiCall(`/category/${id}`),
  create: (data) => apiCall('/category', { method: 'POST', body: data }),
  update: (id, data) => apiCall(`/category/${id}`, { method: 'PATCH', body: data }),
  delete: (id) => apiCall(`/category/${id}`, { method: 'DELETE' }),
};

export const companiesApi = {
  getAll: (page, limit, filters) => apiCall('/companies', { page, limit, filters }),
  getOne: (id) => apiCall(`/companies/${id}`),
  create: (data) => apiCall('/companies', { method: 'POST', body: data }),
  update: (id, data) => apiCall(`/companies/${id}`, { method: 'PATCH', body: data }),
  delete: (id) => apiCall(`/companies/${id}`, { method: 'DELETE' }),
};

export const itemsApi = {
  getAll: (page, limit, filters) => {
    const options = { page, limit };
    const shopId = getSelectedShopId();
    if (shopId) {
      options.shopId = shopId;
    }
    if (filters) {
      options.filters = filters;
      if (filters.storeId) options.storeId = filters.storeId;
      if (filters.shopId) options.shopId = filters.shopId;
      if (filters.filterType) options.filterType = filters.filterType;
    }
    return apiCall('/items', options);
  },
  getOne: (id) => apiCall(`/items/${id}`),
  create: (data) => {
    const shopId = getSelectedShopId();
    if (shopId && !data.shopId) {
      data.shopId = shopId;
    }
    return apiCall('/items', { method: 'POST', body: data });
  },
  update: (id, data) => apiCall(`/items/${id}`, { method: 'PATCH', body: data }),
  delete: (id) => apiCall(`/items/${id}`, { method: 'DELETE' }),
  transfer: (data) => apiCall('/items/transfer', { method: 'POST', body: data }),
};

export const salesApi = {
  getAll: (page, limit, filters) => {
    const options = { page, limit, filters };
    const shopId = getSelectedShopId();
    if (shopId) {
      options.shopId = shopId;
    }
    return apiCall('/sales', options);
  },
  getOne: (id) => apiCall(`/sales/${id}`),
  getTotals: (filters, shopId) => {
    const options = { filters };
    const selectedShopId = getSelectedShopId();
    options.shopId = shopId || selectedShopId;
    return apiCall('/sales/totals', options);
  },
  create: (data) => {
    const shopId = getSelectedShopId();
    if (shopId && !data.shopId) {
      data.shopId = shopId;
    }
    return apiCall('/sales', { method: 'POST', body: data });
  },
  update: (id, data) => apiCall(`/sales/${id}`, { method: 'PATCH', body: data }),
  delete: (id) => apiCall(`/sales/${id}`, { method: 'DELETE' }),
};

export const ordersApi = {
  getAll: (page, limit, filters) => {
    const options = { page, limit, filters };
    const shopId = getSelectedShopId();
    if (shopId) {
      options.shopId = shopId;
    }
    return apiCall('/orders', options);
  },
  getOne: (id) => apiCall(`/orders/${id}`),
  create: (data) => {
    const shopId = getSelectedShopId();
    if (shopId && !data.shopId) {
      data.shopId = shopId;
    }
    return apiCall('/orders', { method: 'POST', body: data });
  },
  update: (id, data) => apiCall(`/orders/${id}`, { method: 'PATCH', body: data }),
  returnItems: (id, itemId, returnedQuantity) => apiCall(`/orders/${id}/return-items`, { 
    method: 'POST', 
    body: { itemId, returnedQuantity } 
  }),
  delete: (id) => apiCall(`/orders/${id}`, { method: 'DELETE' }),
};

export const purchasesApi = {
  getAll: (page, limit, filters) => {
    const options = { page, limit, filters: {} };
    const shopId = getSelectedShopId();
    if (shopId) {
      options.shopId = shopId;
    }
    // Pass date filters in filters object
    if (filters?.date) options.filters.date = filters.date;
    if (filters?.dateFrom) options.filters.dateFrom = filters.dateFrom;
    if (filters?.dateTo) options.filters.dateTo = filters.dateTo;
    // Pass itemId as a separate option (not in filters)
    if (filters?.itemId) options.itemId = filters.itemId;
    return apiCall('/purchases', options);
  },
  getOne: (id) => apiCall(`/purchases/${id}`),
  getTotals: (filters) => {
    const options = { filters: {} };
    const shopId = getSelectedShopId();
    if (shopId) {
      options.shopId = shopId;
    }
    if (filters?.date) options.filters.date = filters.date;
    if (filters?.dateFrom) options.filters.dateFrom = filters.dateFrom;
    if (filters?.dateTo) options.filters.dateTo = filters.dateTo;
    if (filters?.itemId) options.itemId = filters.itemId;
    return apiCall('/purchases/totals', options);
  },
  create: (data) => {
    const shopId = getSelectedShopId();
    if (shopId && !data.shopId) {
      data.shopId = shopId;
    }
    return apiCall('/purchases', { method: 'POST', body: data });
  },
  update: (id, data) => apiCall(`/purchases/${id}`, { method: 'PATCH', body: data }),
  delete: (id) => apiCall(`/purchases/${id}`, { method: 'DELETE' }),
};

export const expensesApi = {
  getAll: (page, limit, filters) => {
    const options = { page, limit, filters };
    const shopId = getSelectedShopId();
    if (shopId) {
      options.shopId = shopId;
    }
    return apiCall('/expense', options);
  },
  getOne: (id) => apiCall(`/expense/${id}`),
  getTotals: (shopId) => {
    const options = {};
    const selectedShopId = getSelectedShopId();
    options.shopId = shopId || selectedShopId;
    return apiCall('/expense/totals', options);
  },
  create: (data) => {
    const shopId = getSelectedShopId();
    if (shopId && !data.shopId) {
      data.shopId = shopId;
    }
    return apiCall('/expense', { method: 'POST', body: data });
  },
  update: (id, data) => apiCall(`/expense/${id}`, { method: 'PATCH', body: data }),
  delete: (id) => apiCall(`/expense/${id}`, { method: 'DELETE' }),
};

export const issuesApi = {
  getAll: () => apiCall('/issues'),
  getOne: (id) => apiCall(`/issues/${id}`),
  create: (data) => apiCall('/issues', { method: 'POST', body: data }),
  update: (id, data) => apiCall(`/issues/${id}`, { method: 'PATCH', body: data }),
  delete: (id) => apiCall(`/issues/${id}`, { method: 'DELETE' }),
};
