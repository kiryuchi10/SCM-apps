import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import Dashboard from "./pages/Dashboard";
import InventoryPage from "./pages/InventoryPage";
import AiToolsPage from "./pages/AiToolsPage";
import SignupPage from "./pages/SignupPage";
import OrderPage from "./pages/OrderPage";
//import TestConnection from './components/TestConnection';

export default function App() {
  return (
    <BrowserRouter>
      {/*Render test connection outside of <Routes> */}
      {/*<TestConnection />*/}

      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/order" element={<OrderPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/inventory" element={<InventoryPage />} />
        <Route path="/ai" element={<AiToolsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
