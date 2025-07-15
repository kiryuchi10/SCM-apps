// components/inventory/InventoryForm.jsx
import React, { useState, useEffect } from 'react';
import './InventoryForm.css';

const InventoryForm = ({ item, categories, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sku: '',
    quantity: 0,
    unit_price: 0,
    category: '',
    location: '',
    minimum_stock: 10
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (item) {
      setFormData({
        name: item.name || '',
        description: item.description || '',
        sku: item.sku || '',
        quantity: item.quantity || 0,
        unit_price: item.unit_price || 0,
        category: item.category || '',
        location: item.location || '',
        minimum_stock: item.minimum_stock || 10
      });
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!formData.name.trim() || !formData.sku.trim()) {
      setError('Name and SKU are required');
      setLoading(false);
      return;
    }

    if (formData.quantity < 0 || formData.unit_price < 0 || formData.minimum_stock < 0) {
      setError('Quantities and prices cannot be negative');
      setLoading(false);
      return;
    }

    try {
      const result = await onSubmit(formData);
      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Failed to save item');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>{item ? 'Edit Item' : 'Add New Item'}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="inventory-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="name">Item Name *</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder="Enter item name"
              />
            </div>

            <div className="form-group">
              <label htmlFor="sku">SKU *</label>
              <input
                type="text"
                id="sku"
                name="sku"
                value={formData.sku}
                onChange={handleChange}
                required
                placeholder="Enter SKU"
                disabled={!!item} // Don't allow SKU changes for existing items
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              placeholder="Enter item description"
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="location">Location</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Storage location"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="quantity">Current Quantity</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                min="0"
                step="1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="minimum_stock">Minimum Stock Level</label>
              <input
                type="number"
                id="minimum_stock"
                name="minimum_stock"
                value={formData.minimum_stock}
                onChange={handleChange}
                min="0"
                step="1"
              />
            </div>

            <div className="form-group">
              <label htmlFor="unit_price">Unit Price ($)</label>
              <input
                type="number"
                id="unit_price"
                name="unit_price"
                value={formData.unit_price}
                onChange={handleChange}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Saving...' : (item ? 'Update Item' : 'Create Item')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InventoryForm;