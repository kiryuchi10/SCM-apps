// components/orders/OrderList.jsx
import React from 'react';
import './OrderList.css';

const OrderList = ({ orders, pagination, onPageChange, onEdit, onCancel }) => {
  const handlePageClick = (page) => {
    if (page >= 1 && page <= pagination.pages) {
      onPageChange(page);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { class: 'status-pending', label: 'Pending' },
      approved: { class: 'status-approved', label: 'Approved' },
      ordered: { class: 'status-ordered', label: 'Ordered' },
      received: { class: 'status-received', label: 'Received' },
      cancelled: { class: 'status-cancelled', label: 'Cancelled' }
    };
    
    const config = statusConfig[status] || { class: 'status-unknown', label: status };
    return <span className={`status-badge ${config.class}`}>{config.label}</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="order-list-container">
        <div className="no-orders">
          <div className="no-orders-icon">📋</div>
          <h3>No Orders Found</h3>
          <p>Create your first purchase order to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="order-list-container">
      <div className="table-wrapper">
        <table className="order-table">
          <thead>
            <tr>
              <th>Order Number</th>
              <th>Supplier</th>
              <th>Items</th>
              <th>Total Amount</th>
              <th>Order Date</th>
              <th>Expected Delivery</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="order-number-cell">
                  <div className="order-number">{order.order_number}</div>
                </td>
                <td className="supplier-cell">
                  <div className="supplier-name">{order.supplier_name}</div>
                  {order.supplier_contact && (
                    <div className="supplier-contact">{order.supplier_contact}</div>
                  )}
                </td>
                <td className="items-cell">
                  <div className="items-count">
                    {order.items ? order.items.length : 0} item(s)
                  </div>
                  {order.items && order.items.length > 0 && (
                    <div className="items-preview">
                      {order.items.slice(0, 2).map((item, index) => (
                        <div key={index} className="item-preview">
                          {item.item_name} ({item.quantity})
                        </div>
                      ))}
                      {order.items.length > 2 && (
                        <div className="items-more">
                          +{order.items.length - 2} more
                        </div>
                      )}
                    </div>
                  )}
                </td>
                <td className="amount-cell">
                  <div className="total-amount">
                    {formatCurrency(order.total_amount)}
                  </div>
                </td>
                <td className="date-cell">
                  {formatDate(order.order_date)}
                </td>
                <td className="date-cell">
                  {formatDate(order.expected_delivery)}
                </td>
                <td className="status-cell">
                  {getStatusBadge(order.status)}
                </td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    <button
                      className="btn btn-sm btn-outline"
                      onClick={() => onEdit(order)}
                      title="Edit order"
                    >
                      ✏️
                    </button>
                    {order.status !== 'cancelled' && order.status !== 'received' && (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => onCancel(order.id)}
                        title="Cancel order"
                      >
                        ❌
                      </button>
                    )}
                  </div>
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
            Showing {orders.length} of {pagination.total} orders
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

export default OrderList;