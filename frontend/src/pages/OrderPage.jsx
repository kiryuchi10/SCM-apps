import React, { useState, useEffect } from "react";
import Layout from "../components/common/Layout";
import OrderForm from "../components/orders/OrderForm";
import OrderList from "../components/orders/OrderList";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useOrders, useOrderStats } from "../hooks/useOrders";
import { inventoryAPI, ordersAPI } from "../services/api";
import "./OrderPage.css";

export default function OrderPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingOrder, setEditingOrder] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const { 
    orders, 
    loading, 
    error, 
    pagination, 
    fetchOrders, 
    createOrder, 
    updateOrder, 
    cancelOrder,
    setError 
  } = useOrders();

  const { stats } = useOrderStats();

  // Fetch items and suppliers for form
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsResponse, suppliersResponse] = await Promise.all([
          inventoryAPI.getItems({ per_page: 100 }),
          ordersAPI.getSuppliers()
        ]);
        setItems(itemsResponse.data.items || []);
        setSuppliers(suppliersResponse.data.suppliers || []);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };
    fetchData();
  }, []);

  // Handle search and filters
  const handleSearch = () => {
    fetchOrders({
      search: searchTerm,
      status: selectedStatus,
      supplier: selectedSupplier,
      page: 1
    });
  };

  const handlePageChange = (page) => {
    fetchOrders({
      search: searchTerm,
      status: selectedStatus,
      supplier: selectedSupplier,
      page
    });
  };

  const handleCreateOrder = async (orderData) => {
    const result = await createOrder(orderData);
    if (result.success) {
      setShowForm(false);
      setError(null);
    }
    return result;
  };

  const handleUpdateOrder = async (orderData) => {
    const result = await updateOrder(editingOrder.id, orderData);
    if (result.success) {
      setShowForm(false);
      setEditingOrder(null);
      setError(null);
    }
    return result;
  };

  const handleEditOrder = (order) => {
    setEditingOrder(order);
    setShowForm(true);
  };

  const handleCancelOrder = async (id) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      await cancelOrder(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingOrder(null);
  };

  const statusOptions = [
    { value: '', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'ordered', label: 'Ordered' },
    { value: 'received', label: 'Received' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  return (
    <Layout title="Order Management">
      <div className="order-page">
        {/* Header */}
        <div className="order-header">
          <div className="order-title">
            <h2>Purchase Orders</h2>
            <p>Manage purchase orders and supplier relationships</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            + Create New Order
          </button>
        </div>

        {/* Stats Cards */}
        <div className="order-stats">
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.total_orders}</h3>
              <p className="stat-title">Total Orders</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⏳</div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.pending_orders}</h3>
              <p className="stat-title">Pending Orders</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <h3 className="stat-value">{stats.completed_orders}</h3>
              <p className="stat-title">Completed Orders</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <h3 className="stat-value">${stats.monthly_value.toLocaleString()}</h3>
              <p className="stat-title">Monthly Value</p>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="order-filters">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="filter-select"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <select
              value={selectedSupplier}
              onChange={(e) => setSelectedSupplier(e.target.value)}
              className="filter-select"
            >
              <option value="">All Suppliers</option>
              {suppliers.map(supplier => (
                <option key={supplier} value={supplier}>{supplier}</option>
              ))}
            </select>
            <button 
              className="btn btn-secondary"
              onClick={handleSearch}
            >
              Search
            </button>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="error-message">
            {error}
            <button onClick={() => setError(null)}>×</button>
          </div>
        )}

        {/* Order List */}
        {loading ? (
          <LoadingSpinner message="Loading orders..." />
        ) : (
          <OrderList
            orders={orders}
            pagination={pagination}
            onPageChange={handlePageChange}
            onEdit={handleEditOrder}
            onCancel={handleCancelOrder}
          />
        )}

        {/* Form Modal */}
        {showForm && (
          <OrderForm
            order={editingOrder}
            items={items}
            suppliers={suppliers}
            onSubmit={editingOrder ? handleUpdateOrder : handleCreateOrder}
            onClose={handleCloseForm}
          />
        )}
      </div>
    </Layout>
  );
}
