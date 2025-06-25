import React from "react";
import { Link } from "react-router-dom";
export default function Sidebar() {
  return (
    <nav>
      <ul>
        <li><Link to="/dashboard">Dashboard</Link></li>
        <li><Link to="/inventory">Inventory</Link></li>
        <li><Link to="/orders">Orders</Link></li>
        <li><Link to="/ai">AI Tools</Link></li>
      </ul>
    </nav>
  );
}
