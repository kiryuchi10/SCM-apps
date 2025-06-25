import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import InventoryTable from "../components/InventoryTable";
import { getItems } from "../services/inventory";

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  useEffect(() => { getItems().then(res => setItems(res.data)); }, []);
  return (
    <div>
      <Sidebar />
      <h2>Inventory</h2>
      <InventoryTable items={items} />
    </div>
  );
}
