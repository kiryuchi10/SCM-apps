// components/inventory/InventoryTable.jsx
import React from 'react';
import './InventoryTable.css';

const InventoryTable = ({ items, pagination, onPageChange, onEdit, onDelete }) => {
  const handlePageClick = (page) => {
    if (page >= 1 && page <= pagination.pages) {
      onPageChange(page);
    }
  };

  const getStockStatus = (item) => {
    if (item.quantity <= 0) return 'out-of-stock';
    if (item.low_stock_alert) return 'low-stock';
    return 'in-stock';
  };

  const getStockStatusText = (item) => {
    if (item.quantity <= 0) return 'Out of Stock';
    if (item.low_stock_alert) return 'Low Stock';
    return 'In Stock';
  };

  if (!items || items.length === 0) {
    return (
      <div className="inventory-table-container">
        <div className="no-items">
          <p>No inventory items found.</p>
          <p>Add your first item to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-table-container">
      <div className="table-wrapper">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>SKU</th>
              <th>Name</th>
              <th>Category</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Status</th>
              <th>Location</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className={getStockStatus(item)}>
                <td className="sku-cell">{item.sku}</td>
                <td className="name-cell">
                  <div className="item-name">{item.name}</div>
                  {item.description && (
                    <div className="item-description">{item.description}</div>
                  )}
                </td>
                <td>{item.category || '-'}</td>
                <td className="quantity-cell">
                  <span className="quantity-value">{item.quantity}</span>
                  {item.low_stock_alert && (
                    <span className="min-stock">/ {item.minimum_stock} min</span>
                  )}
                </td>
                <td className="price-cell">${item.unit_price.toFixed(2)}</td>
                <td>
                  <span className={`status-badge ${getStockStatus(item)}`}>
                    {getStockStatusText(item)}
                  </span>
                </td>
                <td>{item.location || '-'}</td>
                <td className="actions-cell">
                  <button
                    className="btn btn-sm btn-outline"
                    onClick={() => onEdit(item)}
                    title="Edit item"
                  >
                    ✏️
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => onDelete(item.id)}
                    title="Delete item"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <div className="pagination-info">
            Showing {items.length} of {pagination.total} items
          </div>
          <div className="pagination-controls">
            <button
              className="btn btn-sm"
              onClick={() => handlePageClick(pagination.current_page - 1)}
              disabled={pagination.current_page <= 1}
            >
              Previous
            </button>
            
            {[...Array(pagination.pages)].map((_, index) => {
              const page = index + 1;
              const isCurrentPage = page === pagination.current_page;
              const showPage = 
                page === 1 || 
                page === pagination.pages || 
                Math.abs(page - pagination.current_page) <= 2;

              if (!showPage) {
                if (page === pagination.current_page - 3 || page === pagination.current_page + 3) {
                  return <span key={page} className="pagination-ellipsis">...</span>;
                }
                return null;
              }

              return (
                <button
                  key={page}
                  className={`btn btn-sm ${isCurrentPage ? 'btn-primary' : ''}`}
                  onClick={() => handlePageClick(page)}
                >
                  {page}
                </button>
              );
            })}
            
            <button
              className="btn btn-sm"
              onClick={() => handlePageClick(pagination.current_page + 1)}
              disabled={pagination.current_page >= pagination.pages}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTable;