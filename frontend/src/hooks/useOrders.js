// hooks/useOrders.js
import { useState, useEffect } from 'react';
import { ordersAPI } from '../services/api';

export const useOrders = (initialParams = {}) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    current_page: 1,
    per_page: 20
  });

  const fetchOrders = async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ordersAPI.getOrders({ ...initialParams, ...params });
      const { orders: ordersData, ...paginationData } = response.data;
      
      setOrders(ordersData);
      setPagination(paginationData);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch orders');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const createOrder = async (orderData) => {
    try {
      const response = await ordersAPI.createOrder(orderData);
      await fetchOrders(); // Refresh the list
      return { success: true, data: response.data };
    } catch (err) {
      const error = err.response?.data?.error || 'Failed to create order';
      setError(error);
      return { success: false, error };
    }
  };

  const updateOrder = async (id, orderData) => {
    try {
      const response = await ordersAPI.updateOrder(id, orderData);
      await fetchOrders(); // Refresh the list
      return { success: true, data: response.data };
    } catch (err) {
      const error = err.response?.data?.error || 'Failed to update order';
      setError(error);
      return { success: false, error };
    }
  };

  const cancelOrder = async (id) => {
    try {
      await ordersAPI.cancelOrder(id);
      await fetchOrders(); // Refresh the list
      return { success: true };
    } catch (err) {
      const error = err.response?.data?.error || 'Failed to cancel order';
      setError(error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  return {
    orders,
    loading,
    error,
    pagination,
    fetchOrders,
    createOrder,
    updateOrder,
    cancelOrder,
    setError
  };
};

export const useOrderStats = () => {
  const [stats, setStats] = useState({
    total_orders: 0,
    pending_orders: 0,
    completed_orders: 0,
    monthly_value: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ordersAPI.getStats();
      setStats(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch order stats');
      console.error('Error fetching order stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return {
    stats,
    loading,
    error,
    fetchStats
  };
};