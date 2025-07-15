import React, { useState, useEffect } from "react";
import Layout from "../components/common/Layout";
import ChatBot from "../components/ai/ChatBot";
import ForecastChart from "../components/ai/ForecastChart";
import AIInsights from "../components/ai/AIInsights";
import LoadingSpinner from "../components/common/LoadingSpinner";
import { aiAPI, inventoryAPI } from "../services/api";
import "./AiToolsPage.css";

export default function AiToolsPage() {
  const [activeTab, setActiveTab] = useState("chatbot");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch inventory items for forecasting
    const fetchItems = async () => {
      try {
        const response = await inventoryAPI.getItems({ per_page: 100 });
        setItems(response.data.items || []);
      } catch (error) {
        console.error('Failed to fetch items:', error);
      }
    };
    fetchItems();
  }, []);

  const tabs = [
    {
      id: "chatbot",
      label: "AI Assistant",
      icon: "🤖",
      description: "Get intelligent answers about supply chain management"
    },
    {
      id: "forecast",
      label: "Demand Forecasting",
      icon: "📈",
      description: "Predict future demand using AI models"
    },
    {
      id: "insights",
      label: "AI Insights",
      icon: "💡",
      description: "Get AI-powered recommendations and insights"
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "chatbot":
        return <ChatBot />;
      case "forecast":
        return <ForecastChart items={items} />;
      case "insights":
        return <AIInsights items={items} />;
      default:
        return <ChatBot />;
    }
  };

  return (
    <Layout title="AI Tools">
      <div className="ai-tools-page">
        <div className="ai-tools-header">
          <div className="ai-tools-title">
            <h2>AI-Powered Supply Chain Tools</h2>
            <p>Leverage artificial intelligence to optimize your supply chain operations</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="ai-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`ai-tab ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="tab-icon">{tab.icon}</span>
              <div className="tab-content">
                <span className="tab-label">{tab.label}</span>
                <span className="tab-description">{tab.description}</span>
              </div>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="ai-tab-content">
          {loading ? (
            <LoadingSpinner message="Loading AI tools..." />
          ) : (
            renderTabContent()
          )}
        </div>
      </div>
    </Layout>
  );
}
