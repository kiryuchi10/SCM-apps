// components/orders/OrderForm.jsx
import React, { useState, useEffect } from 'react';
import './OrderForm.css';

const OrderForm = ({ order, items, suppliers, onSubmit, onClose }) => {
  const [formData, setFormData] = useState({
    supplier_name: '',
    supplier_contact: '',
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery: '',
    items: [{ inventory_item_id: '', quantity: 1, unit_price: 0 }]
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (order) {
      setFormData({
        supplier_name: order.supplier_name || '',
        supplier_contact: order.supplier_contact || '',
        order_date: order.order_date || new Date().toISOString().split('T')[0],
        expected_delivery: order.expected_delivery || '',
        items: order.items && order.items.length > 0 ? 
          order.items.map(item => ({
            inventory_item_id: item.inventory_item_id,
            quantity: item.quantity,
            unit_price: item.unit_price
          })) : 
          [{ inventory_item_id: '', quantity: 1, unit_price: 0 }]
      });
    }
  }, [order]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const updatedItems = [...formData.items];
    updatedItems[index] = {
      ...updatedItems[index],
      [field]: field === 'inventory_item_id' ? value : parseFloat(value) || 0
    };

    // Auto-fill unit price when item is selected
    if (field === 'inventory_item_id' && value) {
      const selectedItem = items.find(item => item.id === parseInt(value));
      if (selectedItem) {
        updatedItems[index].unit_price = selectedItem.unit_price;
      }
    }

    setFormData(prev => ({
      ...prev,
      items: updatedItems
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { inventory_item_id: '', quantity: 1, unit_price: 0 }]
    }));
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      setFormData(prev => ({
        ...prev,
        items: prev.items.filter((_, i) => i !== index)
      }));
    }
  };

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      return total + (item.quantity * item.unit_price);
    }, 0);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (!formData.supplier_name.trim()) {
      setError('Supplier name is required');
      setLoading(false);
      return;
    }

    if (formData.items.some(item => !item.inventory_item_id || item.quantity <= 0)) {
      setError('All items must have a valid selection and quantity greater than 0');
      setLoading(false);
      return;
    }

    try {
      const result = await onSubmit(formData);
      if (result.success) {
        onClose();
      } else {
        setError(result.error || 'Failed to save order');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSupplierSelect = (supplierName) => {
    setFormData(prev => ({
      ...prev,
      supplier_name: supplierName
    }));
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content order-form-modal">
        <div className="modal-header">
          <h3>{order ? 'Edit Order' : 'Create New Order'}</h3>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="order-form">
          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          {/* Supplier Information */}
          <div className="form-section">
            <h4>Supplier Information</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="supplier_name">Supplier Name *</label>
                <input
                  type="text"
                  id="supplier_name"
                  name="supplier_name"
                  value={formData.supplier_name}
                  onChange={handleChange}
                  required
                  placeholder="Enter supplier name"
                  list="suppliers-list"
                />
                <datalist id="suppliers-list">
                  {suppliers.map((supplier, index) => (
                    <option key={index} value={supplier} />
                  ))}
                </datalist>
              </div>

              <div className="form-group">
                <label htmlFor="supplier_contact">Supplier Contact</label>
                <input
                  type="text"
                  id="supplier_contact"
                  name="supplier_contact"
                  value={formData.supplier_contact}
                  onChange={handleChange}
                  placeholder="Email or phone"
                />
              </div>
            </div>
          </div>

          {/* Order Details */}
          <div className="form-section">
            <h4>Order Details</h4>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="order_date">Order Date *</label>
                <input
                  type="date"
                  id="order_date"
                  name="order_date"
                  value={formData.order_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="expected_delivery">Expected Delivery</label>
                <input
                  type="date"
                  id="expected_delivery"
                  name="expected_delivery"
                  value={formData.expected_delivery}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Order Items */}
          <div className="form-section">
            <div className="section-header">
              <h4>Order Items</h4>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={addItem}
              >
                + Add Item
              </button>
            </div>

            <div className="items-list">
              {formData.items.map((item, index) => (
                <div key={index} className="item-row">
                  <div className="item-fields">
                    <div className="form-group">
                      <label>Item *</label>
                      <select
                        value={item.inventory_item_id}
                        onChange={(e) => handleItemChange(index, 'inventory_item_id', e.target.value)}
                        required
                      >
                        <option value="">Select item...</option>
                        {items.map((inventoryItem) => (
                          <option key={inventoryItem.id} value={inventoryItem.id}>
                            {inventoryItem.name} (SKU: {inventoryItem.sku}) - ${inventoryItem.unit_price}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Quantity *</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        min="1"
                        step="1"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Unit Price ($) *</label>
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => handleItemChange(index, 'unit_price', e.target.value)}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label>Total</label>
                      <div className="total-display">
                        ${(item.quantity * item.unit_price).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {formData.items.length > 1 && (
                    <button
                      type="button"
                      className="remove-item-btn"
                      onClick={() => removeItem(index)}
                      title="Remove item"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="order-total">
              <strong>Order Total: ${calculateTotal().toFixed(2)}</strong>
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
              {loading ? 'Saving...' : (order ? 'Update Order' : 'Create Order')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderForm;