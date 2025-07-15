// services/api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
};

// Inventory API
export const inventoryAPI = {
  getItems: (params = {}) => api.get('/inventory', { params }),
  createItem: (itemData) => api.post('/inventory', itemData),
  getItem: (id) => api.get(`/inventory/${id}`),
  updateItem: (id, itemData) => api.put(`/inventory/${id}`, itemData),
  deleteItem: (id) => api.delete(`/inventory/${id}`),
  getAlerts: () => api.get('/inventory/alerts'),
  getCategories: () => api.get('/inventory/categories'),
};

// Orders API
export const ordersAPI = {
  getOrders: (params = {}) => api.get('/orders', { params }),
  createOrder: (orderData) => api.post('/orders', orderData),
  getOrder: (id) => api.get(`/orders/${id}`),
  updateOrder: (id, orderData) => api.put(`/orders/${id}`, orderData),
  cancelOrder: (id) => api.delete(`/orders/${id}`),
  getSuppliers: () => api.get('/orders/suppliers'),
  getStats: () => api.get('/orders/stats'),
};

// AI API
export const aiAPI = {
  chat: (query) => api.post('/ai/chat', { query }),
  forecast: (itemId, days = 7) => api.post('/ai/forecast', { item_id: itemId, days }),
  getModes: () => api.get('/ai/modes'),
};

export default api;