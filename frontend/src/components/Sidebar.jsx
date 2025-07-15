import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Sidebar.css";

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: "📊" },
    { path: "/inventory", label: "Inventory", icon: "📦" },
    { path: "/orders", label: "Orders", icon: "📋" },
    { path: "/ai", label: "AI Tools", icon: "🤖" },
  ];

  return (
    <nav className="sidebar">
      <div className="sidebar-header">
        <h2 className="sidebar-title">SCM System</h2>
      </div>
      <ul className="sidebar-menu">
        {menuItems.map((item) => (
          <li key={item.path} className="sidebar-item">
            <Link 
              to={item.path} 
              className={`sidebar-link ${location.pathname === item.path ? 'active' : ''}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
