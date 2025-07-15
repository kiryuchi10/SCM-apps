// components/ai/ForecastChart.jsx
import React, { useState, useEffect } from 'react';
import { aiAPI } from '../../services/api';
import LoadingSpinner from '../common/LoadingSpinner';
import './ForecastChart.css';

const ForecastChart = ({ items }) => {
  const [selectedItem, setSelectedItem] = useState('');
  const [forecastDays, setForecastDays] = useState(7);
  const [forecastData, setForecastData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateForecast = async () => {
    if (!selectedItem) {
      setError('Please select an item to forecast');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await aiAPI.forecast(selectedItem, forecastDays);
      setForecastData(response.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate forecast');
      console.error('Forecast error:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderChart = () => {
    if (!forecastData || !forecastData.forecast) return null;

    const maxValue = Math.max(...forecastData.forecast.map(f => f.upper_bound || f.predicted_demand));
    const chartHeight = 200;

    return (
      <div className="forecast-chart">
        <div className="chart-header">
          <h4>Demand Forecast for {forecastData.item_name}</h4>
          <div className="chart-info">
            <span className="model-type">Model: {forecastData.model_type}</span>
            <span className="current-stock">Current Stock: {forecastData.current_stock}</span>
          </div>
        </div>

        <div className="chart-container">
          <div className="chart-y-axis">
            <div className="y-label">{Math.round(maxValue)}</div>
            <div className="y-label">{Math.round(maxValue * 0.75)}</div>
            <div className="y-label">{Math.round(maxValue * 0.5)}</div>
            <div className="y-label">{Math.round(maxValue * 0.25)}</div>
            <div className="y-label">0</div>
          </div>

          <div className="chart-area">
            <svg width="100%" height={chartHeight} className="forecast-svg">
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => (
                <line
                  key={index}
                  x1="0"
                  y1={chartHeight * ratio}
                  x2="100%"
                  y2={chartHeight * ratio}
                  stroke="#e0e0e0"
                  strokeWidth="1"
                />
              ))}

              {/* Forecast bars */}
              {forecastData.forecast.map((point, index) => {
                const barWidth = `${80 / forecastData.forecast.length}%`;
                const barX = `${(index * 100) / forecastData.forecast.length + 10}%`;
                const barHeight = (point.predicted_demand / maxValue) * chartHeight;
                const barY = chartHeight - barHeight;

                const confidenceHeight = ((point.upper_bound - point.lower_bound) / maxValue) * chartHeight;
                const confidenceY = chartHeight - (point.upper_bound / maxValue) * chartHeight;

                return (
                  <g key={index}>
                    {/* Confidence interval */}
                    {point.upper_bound && point.lower_bound && (
                      <rect
                        x={barX}
                        y={confidenceY}
                        width={barWidth}
                        height={confidenceHeight}
                        fill="rgba(0, 123, 255, 0.2)"
                        rx="2"
                      />
                    )}
                    
                    {/* Predicted demand bar */}
                    <rect
                      x={barX}
                      y={barY}
                      width={barWidth}
                      height={barHeight}
                      fill="#007bff"
                      rx="2"
                    />
                    
                    {/* Value label */}
                    <text
                      x={`${(index * 100) / forecastData.forecast.length + 10 + (80 / forecastData.forecast.length) / 2}%`}
                      y={barY - 5}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#333"
                    >
                      {Math.round(point.predicted_demand)}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* X-axis labels */}
            <div className="chart-x-axis">
              {forecastData.forecast.map((point, index) => (
                <div key={index} className="x-label">
                  {new Date(point.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="chart-legend">
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: '#007bff' }}></div>
            <span>Predicted Demand</span>
          </div>
          <div className="legend-item">
            <div className="legend-color" style={{ backgroundColor: 'rgba(0, 123, 255, 0.2)' }}></div>
            <span>Confidence Interval</span>
          </div>
        </div>
      </div>
    );
  };

  const renderRecommendations = () => {
    if (!forecastData || !forecastData.recommendations) return null;

    return (
      <div className="forecast-recommendations">
        <h4>AI Recommendations</h4>
        <div className="recommendations-list">
          {forecastData.recommendations.map((rec, index) => (
            <div key={index} className={`recommendation ${rec.priority}`}>
              <div className="rec-icon">
                {rec.type === 'restock' && '📦'}
                {rec.type === 'overstock' && '⚠️'}
                {rec.type === 'demand_spike' && '📈'}
              </div>
              <div className="rec-content">
                <div className="rec-priority">{rec.priority.toUpperCase()}</div>
                <div className="rec-message">{rec.message}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="forecast-container">
      <div className="forecast-controls">
        <div className="control-group">
          <label htmlFor="item-select">Select Item:</label>
          <select
            id="item-select"
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            className="item-select"
          >
            <option value="">Choose an item...</option>
            {items.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name} (SKU: {item.sku})
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="days-select">Forecast Period:</label>
          <select
            id="days-select"
            value={forecastDays}
            onChange={(e) => setForecastDays(parseInt(e.target.value))}
            className="days-select"
          >
            <option value={7}>7 days</option>
            <option value={14}>14 days</option>
            <option value={30}>30 days</option>
            <option value={60}>60 days</option>
            <option value={90}>90 days</option>
          </select>
        </div>

        <button
          className="generate-btn"
          onClick={handleGenerateForecast}
          disabled={loading || !selectedItem}
        >
          {loading ? 'Generating...' : 'Generate Forecast'}
        </button>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      {loading && (
        <LoadingSpinner message="Generating demand forecast..." />
      )}

      {forecastData && !loading && (
        <div className="forecast-results">
          {renderChart()}
          {renderRecommendations()}
        </div>
      )}

      {!forecastData && !loading && !error && (
        <div className="forecast-placeholder">
          <div className="placeholder-icon">📈</div>
          <h3>AI Demand Forecasting</h3>
          <p>Select an inventory item and forecast period to generate AI-powered demand predictions.</p>
          <div className="forecast-features">
            <div className="feature">
              <span className="feature-icon">🧠</span>
              <span>Machine Learning Models</span>
            </div>
            <div className="feature">
              <span className="feature-icon">📊</span>
              <span>Confidence Intervals</span>
            </div>
            <div className="feature">
              <span className="feature-icon">💡</span>
              <span>Smart Recommendations</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ForecastChart;