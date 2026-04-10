import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const endpoints = {
  auth: '/auth',
  companies: '/companies',
  customers: '/customers',
  products: '/products',
  purchases: '/purchases',
  sales: '/sales',
  orders: '/orders',
  expenses: '/expenses',
  analytics: '/analytics'
};

export const fetchCompanies = async () => {
  const { data } = await apiClient.get(endpoints.companies);
  return data;
};

export const createCompany = async (company) => {
  const { data } = await apiClient.post(endpoints.companies, company);
  return data;
};

export const updateCompany = async (id, company) => {
  const { data } = await apiClient.put(`${endpoints.companies}/${id}`, company);
  return data;
};

export const deleteCompany = async (id) => {
  const { data } = await apiClient.delete(`${endpoints.companies}/${id}`);
  return data;
};

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 15000
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }

    const message =
      error.response?.data?.message ||
      error.message ||
      'API request failed';

    return Promise.reject(new Error(message));
  }
);

export const fetchCustomers = async (query = {}) => {
  const { data } = await apiClient.get(endpoints.customers, { params: query });
  return data;
};

export const registerUser = async (payload) => {
  const { data } = await apiClient.post(`${endpoints.auth}/register`, payload);
  return data;
};

export const loginUser = async (payload) => {
  const { data } = await apiClient.post(`${endpoints.auth}/login`, payload);
  return data;
};

export const updateAccount = async (payload) => {
  const { data } = await apiClient.put(`${endpoints.auth}/update`, payload);
  return data;
};

export const createCustomer = async (customer) => {
  const { data } = await apiClient.post(endpoints.customers, customer);
  return data;
};

export const updateCustomer = async (id, customer) => {
  const { data } = await apiClient.put(`${endpoints.customers}/${id}`, customer);
  return data;
};

export const deleteCustomer = async (id) => {
  const { data } = await apiClient.delete(`${endpoints.customers}/${id}`);
  return data;
};

export const fetchOrders = async (query = {}) => {
  const { data } = await apiClient.get(endpoints.orders, { params: query });
  return data;
};

export const fetchSales = async (query = {}) => {
  const { data } = await apiClient.get(endpoints.sales, { params: query });
  return data;
};

export const createOrder = async (order) => {
  const { data } = await apiClient.post(endpoints.orders, order);
  return data;
};

export const createSale = async (sale) => {
  const { data } = await apiClient.post(endpoints.sales, sale);
  return data;
};

export const updateOrder = async (id, order) => {
  const { data } = await apiClient.put(`${endpoints.orders}/${id}`, order);
  return data;
};

export const deleteOrder = async (id) => {
  const { data } = await apiClient.delete(`${endpoints.orders}/${id}`);
  return data;
};

export const fetchExpenses = async (query = {}) => {
  const { data } = await apiClient.get(endpoints.expenses, { params: query });
  return data;
};

export const fetchProducts = async (query = {}) => {
  const { data } = await apiClient.get(endpoints.products, { params: query });
  return data;
};

export const createProduct = async (product) => {
  const { data } = await apiClient.post(endpoints.products, product);
  return data;
};

export const updateProduct = async (id, product) => {
  const { data } = await apiClient.put(`${endpoints.products}/${id}`, product);
  return data;
};

export const deleteProduct = async (id) => {
  const { data } = await apiClient.delete(`${endpoints.products}/${id}`);
  return data;
};

export const fetchPurchases = async (query = {}) => {
  const { data } = await apiClient.get(endpoints.purchases, { params: query });
  return data;
};

export const createPurchase = async (purchase) => {
  const { data } = await apiClient.post(endpoints.purchases, purchase);
  return data;
};

export const updatePurchase = async (id, purchase) => {
  const { data } = await apiClient.put(`${endpoints.purchases}/${id}`, purchase);
  return data;
};

export const deletePurchase = async (id) => {
  const { data } = await apiClient.delete(`${endpoints.purchases}/${id}`);
  return data;
};

export const createExpense = async (expense) => {
  const { data } = await apiClient.post(endpoints.expenses, expense);
  return data;
};

export const updateExpense = async (id, expense) => {
  const { data } = await apiClient.put(`${endpoints.expenses}/${id}`, expense);
  return data;
};

export const deleteExpense = async (id) => {
  const { data } = await apiClient.delete(`${endpoints.expenses}/${id}`);
  return data;
};

export const fetchDashboardAnalytics = async (query = {}) => {
  const { data } = await apiClient.get(`${endpoints.analytics}/dashboard`, { params: query });
  return data;
};

export const fetchBusinessOverviewAnalytics = async (query = {}) => {
  const { data } = await apiClient.get(`${endpoints.analytics}/business-overview`, { params: query });
  return data;
};

export const fetchMonthlySalesAnalytics = async (query = {}) => {
  const { data } = await apiClient.get(`${endpoints.analytics}/monthly-sales`, { params: query });
  return data;
};

export const fetchYearlySalesAnalytics = async (query = {}) => {
  const { data } = await apiClient.get(`${endpoints.analytics}/yearly-sales`, { params: query });
  return data;
};

export const fetchCompanySalesAnalytics = async (query = {}) => {
  const { data } = await apiClient.get(`${endpoints.analytics}/company-sales`, { params: query });
  return data;
};

export const fetchCustomerSummaryAnalytics = async (query = {}) => {
  const { data } = await apiClient.get(`${endpoints.analytics}/customer-summary`, { params: query });
  return data;
};

export const fetchCustomerMonthlyAnalytics = async (query = {}) => {
  const { data } = await apiClient.get(`${endpoints.analytics}/customer-monthly`, { params: query });
  return data;
};

export const fetchTopCustomersAnalytics = async (query = {}) => {
  const { data } = await apiClient.get(`${endpoints.analytics}/top-customers`, { params: query });
  return data;
};

export const fetchInventoryAnalytics = async (query = {}) => {
  const { data } = await apiClient.get(`${endpoints.analytics}/inventory`, { params: query });
  return data;
};

export const api = {
  companies: {
    list: fetchCompanies,
    create: createCompany,
    update: updateCompany,
    delete: deleteCompany
  },
  customers: {
    list: fetchCustomers,
    create: createCustomer,
    update: updateCustomer,
    delete: deleteCustomer
  },
  orders: {
    list: fetchOrders,
    create: createOrder,
    update: updateOrder,
    delete: deleteOrder
  },
  sales: {
    list: fetchSales,
    create: createSale,
    update: updateOrder,
    delete: deleteOrder
  },
  products: {
    list: fetchProducts,
    create: createProduct,
    update: updateProduct,
    delete: deleteProduct
  },
  purchases: {
    list: fetchPurchases,
    create: createPurchase,
    update: updatePurchase,
    delete: deletePurchase
  },
  expenses: {
    list: fetchExpenses,
    create: createExpense,
    update: updateExpense,
    delete: deleteExpense
  },
  analytics: {
    dashboard: fetchDashboardAnalytics,
    businessOverview: fetchBusinessOverviewAnalytics,
    monthlySales: fetchMonthlySalesAnalytics,
    yearlySales: fetchYearlySalesAnalytics,
    companySales: fetchCompanySalesAnalytics,
    customerSummary: fetchCustomerSummaryAnalytics,
    customerMonthly: fetchCustomerMonthlyAnalytics,
    topCustomers: fetchTopCustomersAnalytics,
    inventory: fetchInventoryAnalytics
  }
};

export { endpoints };
export { apiClient };
export default api;
