import React, { useState, useEffect } from "react";
import Layout from "../components/common/Layout";
import InventoryTable from "../components/inventory/InventoryTable";
import InventoryForm from "../components/inventory/InventoryForm";
import StockAlerts from "../components/inventory/StockAlerts";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useInventory, useInventoryAlerts } from "../hooks/useInventory";
import { inventoryAPI } from "../services/api";
import "./InventoryPage.css";

export default function InventoryPage() {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);
  const [categories, setCategories] = useState([]);

  const { 
    items, 
    loading, 
    error, 
    pagination, 
    fetchItems, 
    createItem, 
    updateItem, 
    deleteItem,
    setError 
  } = useInventory();

  const { alerts } = useInventoryAlerts();

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await inventoryAPI.getCategories();
        setCategories(response.data.categories);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchCategories();
  }, []);

  // Handle search and filters
  const handleSearch = () => {
    fetchItems({
      search: searchTerm,
      category: selectedCategory,
      low_stock_only: showLowStockOnly,
      page: 1
    });
  };

  const handlePageChange = (page) => {
    fetchItems({
      search: searchTerm,
      category: selectedCategory,
      low_stock_only: showLowStockOnly,
      page
    });
  };

  const handleCreateItem = async (itemData) => {
    const result = await createItem(itemData);
    if (result.success) {
      setShowForm(false);
      setError(null);
    }
    return result;
  };

  const handleUpdateItem = async (itemData) => {
    const result = await updateItem(editingItem.id, itemData);
    if (result.success) {
      setShowForm(false);
      setEditingItem(null);
      setError(null);
    }
    return result;
  };

  const handleEditItem = (item) => {
    setEditingItem(item);
    setShowForm(true);
  };

  const handleDeleteItem = async (id) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      await deleteItem(id);
    }
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingItem(null);
  };

  return (
    <Layout title="Inventory Management">
      <div className="inventory-page">
        {/* Header Actions */}
        <div className="inventory-header">
          <div className="inventory-title">
            <h2>Inventory Items</h2>
            <p>Manage your inventory items and stock levels</p>
          </div>
          <button 
            className="btn btn-primary"
            onClick={() => setShowForm(true)}
          >
            + Add New Item
          </button>
        </div>

        {/* Alerts */}
        {alerts.length > 0 && (
          <StockAlerts alerts={alerts} />
        )}

        {/* Search and Filters */}
        <div className="inventory-filters">
          <div className="filter-group">
            <input
              type="text"
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="filter-select"
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={showLowStockOnly}
                onChange={(e) => setShowLowStockOnly(e.target.checked)}
              />
              Low Stock Only
            </label>
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

        {/* Inventory Table */}
        {loading ? (
          <LoadingSpinner message="Loading inventory..." />
        ) : (
          <InventoryTable
            items={items}
            pagination={pagination}
            onPageChange={handlePageChange}
            onEdit={handleEditItem}
            onDelete={handleDeleteItem}
          />
        )}

        {/* Form Modal */}
        {showForm && (
          <InventoryForm
            item={editingItem}
            categories={categories}
            onSubmit={editingItem ? handleUpdateItem : handleCreateItem}
            onClose={handleCloseForm}
          />
        )}
      </div>
    </Layout>
  );
}
