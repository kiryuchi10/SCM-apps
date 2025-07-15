// hooks/useInventory.js
import { useState, useEffect } from 'react';
import { inventoryAPI } from '../services/api';

export const useInventory = (initialParams = {}) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    current_page: 1,
    per_page: 20
  });

  const fetchItems = async (params = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await inventoryAPI.getItems({ ...initialParams, ...params });
      const { items: itemsData, ...paginationData } = response.data;
      
      setItems(itemsData);
      setPagination(paginationData);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch inventory items');
      console.error('Error fetching inventory:', err);
    } finally {
      setLoading(false);
    }
  };

  const createItem = async (itemData) => {
    try {
      const response = await inventoryAPI.createItem(itemData);
      await fetchItems(); // Refresh the list
      return { success: true, data: response.data };
    } catch (err) {
      const error = err.response?.data?.error || 'Failed to create item';
      setError(error);
      return { success: false, error };
    }
  };

  const updateItem = async (id, itemData) => {
    try {
      const response = await inventoryAPI.updateItem(id, itemData);
      await fetchItems(); // Refresh the list
      return { success: true, data: response.data };
    } catch (err) {
      const error = err.response?.data?.error || 'Failed to update item';
      setError(error);
      return { success: false, error };
    }
  };

  const deleteItem = async (id) => {
    try {
      await inventoryAPI.deleteItem(id);
      await fetchItems(); // Refresh the list
      return { success: true };
    } catch (err) {
      const error = err.response?.data?.error || 'Failed to delete item';
      setError(error);
      return { success: false, error };
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return {
    items,
    loading,
    error,
    pagination,
    fetchItems,
    createItem,
    updateItem,
    deleteItem,
    setError
  };
};

export const useInventoryAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAlerts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await inventoryAPI.getAlerts();
      setAlerts(response.data.alerts);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch alerts');
      console.error('Error fetching alerts:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  return {
    alerts,
    loading,
    error,
    fetchAlerts
  };
};