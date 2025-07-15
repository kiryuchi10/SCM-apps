// components/inventory/StockAlerts.jsx
import React, { useState } from 'react';
import './StockAlerts.css';

const StockAlerts = ({ alerts }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayAlerts = isExpanded ? alerts : alerts.slice(0, 3);

  if (!alerts || alerts.length === 0) {
    return null;
  }

  return (
    <div className="stock-alerts">
      <div className="alerts-header">
        <div className="alerts-title">
          <span className="alert-icon">⚠️</span>
          <h3>Low Stock Alerts ({alerts.length})</h3>
        </div>
        {alerts.length > 3 && (
          <button
            className="toggle-btn"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Show Less' : `Show All (${alerts.length})`}
          </button>
        )}
      </div>

      <div className="alerts-list">
        {displayAlerts.map((alert) => (
          <div key={alert.item_id} className="alert-item">
            <div className="alert-content">
              <div className="alert-main">
                <strong className="item-name">{alert.name}</strong>
                <span className="item-sku">SKU: {alert.sku}</span>
              </div>
              <div className="alert-details">
                <span className="current-stock">
                  Current: <strong>{alert.current_quantity}</strong>
                </span>
                <span className="minimum-stock">
                  Minimum: <strong>{alert.minimum_stock}</strong>
                </span>
                {alert.category && (
                  <span className="category">
                    Category: {alert.category}
                  </span>
                )}
              </div>
            </div>
            <div className="alert-shortage">
              <span className="shortage-label">Short by</span>
              <span className="shortage-value">{alert.shortage}</span>
            </div>
          </div>
        ))}
      </div>

      {alerts.length > 0 && (
        <div className="alerts-footer">
          <p className="alerts-summary">
            Total items requiring attention: <strong>{alerts.length}</strong>
          </p>
          <div className="alerts-actions">
            <button className="btn btn-primary btn-sm">
              Generate Reorder Report
            </button>
            <button className="btn btn-secondary btn-sm">
              Export Alerts
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StockAlerts;