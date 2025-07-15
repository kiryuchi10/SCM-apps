// components/ai/AIInsights.jsx
import React, { useState, useEffect } from 'react';
import { inventoryAPI, ordersAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import './AIInsights.css';

const AIInsights = ({ items }) => {
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedInsight, setSelectedInsight] = useState('inventory');

  useEffect(() => {
    generateInsights();
  }, [items]);

  const generateInsights = async () => {
    setLoading(true);
    
    try {
      // Fetch additional data for insights
      const [alertsResponse, statsResponse] = await Promise.all([
        inventoryAPI.getAlerts(),
        ordersAPI.getStats()
      ]);

      const alerts = alertsResponse.data.alerts || [];
      const stats = statsResponse.data;

      // Generate AI insights based on data
      const generatedInsights = {
        inventory: generateInventoryInsights(items, alerts),
        performance: generatePerformanceInsights(stats),
        recommendations: generateRecommendations(items, alerts, stats),
        trends: generateTrendInsights(items, stats)
      };

      setInsights(generatedInsights);
    } catch (error) {
      console.error('Failed to generate insights:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateInventoryInsights = (items, alerts) => {
    const totalItems = items.length;
    const lowStockItems = alerts.length;
    const outOfStockItems = items.filter(item => item.quantity === 0).length;
    const totalValue = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
    
    const categories = [...new Set(items.map(item => item.category).filter(Boolean))];
    const categoryAnalysis = categories.map(category => {
      const categoryItems = items.filter(item => item.category === category);
      const categoryValue = categoryItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);
      return {
        category,
        itemCount: categoryItems.length,
        totalValue: categoryValue,
        percentage: (categoryValue / totalValue) * 100
      };
    }).sort((a, b) => b.totalValue - a.totalValue);

    return {
      summary: {
        totalItems,
        lowStockItems,
        outOfStockItems,
        totalValue,
        stockHealthScore: Math.max(0, 100 - (lowStockItems / totalItems) * 100)
      },
      categoryAnalysis,
      alerts: alerts.slice(0, 5)
    };
  };

  const generatePerformanceInsights = (stats) => {
    const completionRate = stats.total_orders > 0 ? (stats.completed_orders / stats.total_orders) * 100 : 0;
    const pendingRate = stats.total_orders > 0 ? (stats.pending_orders / stats.total_orders) * 100 : 0;
    
    return {
      orderMetrics: {
        totalOrders: stats.total_orders,
        completionRate: completionRate.toFixed(1),
        pendingRate: pendingRate.toFixed(1),
        monthlyValue: stats.monthly_value
      },
      performanceScore: Math.min(100, completionRate + (stats.monthly_value / 1000))
    };
  };

  const generateRecommendations = (items, alerts, stats) => {
    const recommendations = [];

    // Inventory recommendations
    if (alerts.length > 0) {
      recommendations.push({
        type: 'inventory',
        priority: 'high',
        title: 'Address Low Stock Items',
        description: `${alerts.length} items are below minimum stock levels. Consider reordering soon.`,
        action: 'Review inventory alerts and create purchase orders',
        impact: 'Prevent stockouts and maintain service levels'
      });
    }

    // Performance recommendations
    if (stats.pending_orders > stats.completed_orders) {
      recommendations.push({
        type: 'operations',
        priority: 'medium',
        title: 'Optimize Order Processing',
        description: 'High number of pending orders detected. Consider streamlining approval process.',
        action: 'Review order workflow and approval bottlenecks',
        impact: 'Improve order fulfillment speed and customer satisfaction'
      });
    }

    // Cost optimization
    const highValueItems = items.filter(item => item.unit_price > 100).length;
    if (highValueItems > 0) {
      recommendations.push({
        type: 'cost',
        priority: 'low',
        title: 'Review High-Value Items',
        description: `${highValueItems} items have unit prices above $100. Consider bulk purchasing or alternative suppliers.`,
        action: 'Negotiate better rates with suppliers for high-value items',
        impact: 'Reduce procurement costs and improve margins'
      });
    }

    // Diversification recommendation
    const categories = [...new Set(items.map(item => item.category).filter(Boolean))];
    if (categories.length < 3) {
      recommendations.push({
        type: 'strategy',
        priority: 'low',
        title: 'Consider Product Diversification',
        description: 'Limited product categories detected. Diversification could reduce risk.',
        action: 'Explore new product categories or market segments',
        impact: 'Reduce dependency risk and explore new revenue streams'
      });
    }

    return recommendations;
  };

  const generateTrendInsights = (items, stats) => {
    // Simulate trend data (in a real app, this would come from historical data)
    const trends = [
      {
        metric: 'Inventory Turnover',
        value: '4.2x',
        change: '+12%',
        trend: 'up',
        description: 'Inventory is moving faster than last quarter'
      },
      {
        metric: 'Order Fulfillment Time',
        value: '2.3 days',
        change: '-8%',
        trend: 'down',
        description: 'Improved processing efficiency'
      },
      {
        metric: 'Stock Accuracy',
        value: '94.5%',
        change: '+3%',
        trend: 'up',
        description: 'Better inventory tracking and management'
      },
      {
        metric: 'Supplier Performance',
        value: '87%',
        change: '-2%',
        trend: 'down',
        description: 'Some delivery delays noted this month'
      }
    ];

    return trends;
  };

  const renderInsightCard = (title, children, className = '') => (
    <div className={`insight-card ${className}`}>
      <h4 className="insight-title">{title}</h4>
      {children}
    </div>
  );

  const renderInventoryInsights = () => {
    if (!insights?.inventory) return null;

    const { summary, categoryAnalysis, alerts } = insights.inventory;

    return (
      <div className="insights-grid">
        {renderInsightCard(
          'Inventory Health Score',
          <div className="health-score">
            <div className="score-circle">
              <span className="score-value">{Math.round(summary.stockHealthScore)}</span>
              <span className="score-label">/ 100</span>
            </div>
            <div className="score-details">
              <div className="score-item">
                <span className="score-metric">Total Items:</span>
                <span className="score-number">{summary.totalItems}</span>
              </div>
              <div className="score-item">
                <span className="score-metric">Low Stock:</span>
                <span className="score-number text-warning">{summary.lowStockItems}</span>
              </div>
              <div className="score-item">
                <span className="score-metric">Out of Stock:</span>
                <span className="score-number text-danger">{summary.outOfStockItems}</span>
              </div>
            </div>
          </div>,
          'health-card'
        )}

        {renderInsightCard(
          'Category Distribution',
          <div className="category-chart">
            {categoryAnalysis.slice(0, 5).map((category, index) => (
              <div key={category.category} className="category-bar">
                <div className="category-info">
                  <span className="category-name">{category.category}</span>
                  <span className="category-value">${category.totalValue.toLocaleString()}</span>
                </div>
                <div className="category-progress">
                  <div 
                    className="category-fill"
                    style={{ width: `${category.percentage}%` }}
                  ></div>
                </div>
                <span className="category-percentage">{category.percentage.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        )}

        {renderInsightCard(
          'Critical Alerts',
          <div className="alerts-summary">
            {alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <div key={index} className="alert-summary-item">
                  <span className="alert-name">{alert.name}</span>
                  <span className="alert-shortage">-{alert.shortage} units</span>
                </div>
              ))
            ) : (
              <div className="no-alerts">✅ No critical alerts</div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderPerformanceInsights = () => {
    if (!insights?.performance) return null;

    const { orderMetrics, performanceScore } = insights.performance;

    return (
      <div className="insights-grid">
        {renderInsightCard(
          'Order Performance',
          <div className="performance-metrics">
            <div className="metric-item">
              <span className="metric-label">Total Orders</span>
              <span className="metric-value">{orderMetrics.totalOrders}</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Completion Rate</span>
              <span className="metric-value">{orderMetrics.completionRate}%</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Pending Rate</span>
              <span className="metric-value">{orderMetrics.pendingRate}%</span>
            </div>
            <div className="metric-item">
              <span className="metric-label">Monthly Value</span>
              <span className="metric-value">${orderMetrics.monthlyValue.toLocaleString()}</span>
            </div>
          </div>
        )}

        {renderInsightCard(
          'Performance Score',
          <div className="performance-score">
            <div className="score-gauge">
              <div className="gauge-fill" style={{ width: `${Math.min(100, performanceScore)}%` }}></div>
            </div>
            <div className="score-text">
              <span className="score-number">{Math.round(performanceScore)}/100</span>
              <span className="score-description">
                {performanceScore >= 80 ? 'Excellent' : 
                 performanceScore >= 60 ? 'Good' : 
                 performanceScore >= 40 ? 'Fair' : 'Needs Improvement'}
              </span>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderRecommendations = () => {
    if (!insights?.recommendations) return null;

    return (
      <div className="recommendations-list">
        {insights.recommendations.map((rec, index) => (
          <div key={index} className={`recommendation-card ${rec.priority}`}>
            <div className="rec-header">
              <div className="rec-type-badge">{rec.type}</div>
              <div className={`rec-priority-badge ${rec.priority}`}>
                {rec.priority.toUpperCase()}
              </div>
            </div>
            <h5 className="rec-title">{rec.title}</h5>
            <p className="rec-description">{rec.description}</p>
            <div className="rec-details">
              <div className="rec-action">
                <strong>Action:</strong> {rec.action}
              </div>
              <div className="rec-impact">
                <strong>Impact:</strong> {rec.impact}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTrends = () => {
    if (!insights?.trends) return null;

    return (
      <div className="trends-grid">
        {insights.trends.map((trend, index) => (
          <div key={index} className="trend-card">
            <div className="trend-header">
              <span className="trend-metric">{trend.metric}</span>
              <span className={`trend-change ${trend.trend}`}>
                {trend.change}
              </span>
            </div>
            <div className="trend-value">{trend.value}</div>
            <div className="trend-description">{trend.description}</div>
          </div>
        ))}
      </div>
    );
  };

  const insightTabs = [
    { id: 'inventory', label: 'Inventory Analysis', icon: '📦' },
    { id: 'performance', label: 'Performance Metrics', icon: '📊' },
    { id: 'recommendations', label: 'AI Recommendations', icon: '💡' },
    { id: 'trends', label: 'Trend Analysis', icon: '📈' }
  ];

  if (loading) {
    return <LoadingSpinner message="Generating AI insights..." />;
  }

  return (
    <div className="ai-insights-container">
      <div className="insights-header">
        <h3>AI-Powered Supply Chain Insights</h3>
        <p>Intelligent analysis of your supply chain performance and recommendations</p>
      </div>

      <div className="insights-tabs">
        {insightTabs.map(tab => (
          <button
            key={tab.id}
            className={`insight-tab ${selectedInsight === tab.id ? 'active' : ''}`}
            onClick={() => setSelectedInsight(tab.id)}
          >
            <span className="tab-icon">{tab.icon}</span>
            <span className="tab-label">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="insights-content">
        {selectedInsight === 'inventory' && renderInventoryInsights()}
        {selectedInsight === 'performance' && renderPerformanceInsights()}
        {selectedInsight === 'recommendations' && renderRecommendations()}
        {selectedInsight === 'trends' && renderTrends()}
      </div>
    </div>
  );
};

export default AIInsights;