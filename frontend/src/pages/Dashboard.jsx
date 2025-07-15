import React, { useState, useEffect } from "react";
import Layout from "../components/common/Layout";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { useInventoryAlerts } from "../hooks/useInventory";
import { useOrderStats } from "../hooks/useOrders";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css";

export default function Dashboard() {
  const { user } = useAuth();
  const { alerts, loading: alertsLoading } = useInventoryAlerts();
  const { stats, loading: statsLoading } = useOrderStats();

  const dashboardCards = [
    {
      title: "Total Orders",
      value: stats.total_orders,
      icon: "📋",
      color: "blue"
    },
    {
      title: "Pending Orders",
      value: stats.pending_orders,
      icon: "⏳",
      color: "orange"
    },
    {
      title: "Completed Orders",
      value: stats.completed_orders,
      icon: "✅",
      color: "green"
    },
    {
      title: "Monthly Value",
      value: `$${stats.monthly_value.toLocaleString()}`,
      icon: "💰",
      color: "purple"
    }
  ];

  return (
    <Layout title="Dashboard">
      <div className="dashboard">
        <div className="dashboard-welcome">
          <h2>Welcome back, {user?.first_name || user?.username || 'User'}!</h2>
          <p>Here's what's happening with your supply chain today.</p>
        </div>

        {/* Stats Cards */}
        <div className="dashboard-stats">
          {statsLoading ? (
            <LoadingSpinner message="Loading statistics..." />
          ) : (
            <div className="stats-grid">
              {dashboardCards.map((card, index) => (
                <div key={index} className={`stat-card ${card.color}`}>
                  <div className="stat-icon">{card.icon}</div>
                  <div className="stat-content">
                    <h3 className="stat-value">{card.value}</h3>
                    <p className="stat-title">{card.title}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Alerts Section */}
        <div className="dashboard-alerts">
          <h3>Low Stock Alerts</h3>
          {alertsLoading ? (
            <LoadingSpinner size="small" message="Loading alerts..." />
          ) : alerts.length > 0 ? (
            <div className="alerts-list">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.item_id} className="alert-item">
                  <div className="alert-icon">⚠️</div>
                  <div className="alert-content">
                    <strong>{alert.name}</strong> (SKU: {alert.sku})
                    <br />
                    <span className="alert-details">
                      Current: {alert.current_quantity} | Minimum: {alert.minimum_stock}
                    </span>
                  </div>
                  <div className="alert-shortage">
                    -{alert.shortage} units
                  </div>
                </div>
              ))}
              {alerts.length > 5 && (
                <div className="alert-more">
                  +{alerts.length - 5} more alerts
                </div>
              )}
            </div>
          ) : (
            <div className="no-alerts">
              <p>✅ No low stock alerts at this time.</p>
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="dashboard-actions">
          <h3>Quick Actions</h3>
          <div className="actions-grid">
            <button className="action-btn" onClick={() => window.location.href = '/inventory'}>
              📦 Manage Inventory
            </button>
            <button className="action-btn" onClick={() => window.location.href = '/orders'}>
              📋 Create Order
            </button>
            <button className="action-btn" onClick={() => window.location.href = '/ai'}>
              🤖 AI Assistant
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
