import React, { useEffect, useState } from "react";
import { getOrders, createOrder } from "../services/orderService";
import { getItems } from "../services/inventory";
import Papa from "papaparse"; // npm install papaparse

const handleCSVUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  Papa.parse(file, {
    header: true,
    complete: async (results) => {
      for (let row of results.data) {
        if (row.order_number && row.item_id && row.quantity) {
          try {
            const order = {
              order_number: row.order_number,
              item_id: parseInt(row.item_id),
              quantity: parseInt(row.quantity),
            };
            await createOrder(order);
          } catch (err) {
            console.error("Failed to create order from CSV row:", row, err);
          }
        }
      }
      alert("CSV upload complete!");
    },
  });
};

const OrderPage = () => {
  const [orders, setOrders] = useState([]);
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    order_number: "",
    item_id: "",
    quantity: 1,
  });

  // Fetch existing orders
  useEffect(() => {
    getOrders()
      .then((res) => setOrders(res.data))
      .catch((err) => console.error("Error fetching orders:", err));
  }, []);

  // Fetch items for dropdown
  useEffect(() => {
    getItems()
      .then((res) => setItems(res.data))
      .catch((err) => console.error("Error fetching items:", err));
  }, []);

  // Submit new order
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createOrder(formData);
      alert("Order placed!");
      setOrders([...orders, res.data.order]);
    } catch (err) {
      console.error("Order error:", err);
      alert("Failed to place order.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl mb-4">Create Order</h2>
      <h2 className="text-lg mt-6">Upload Orders via CSV</h2>
      <input
        type="file"
        accept=".csv"
        onChange={handleCSVUpload}
        className="mt-2"
      />

      <form onSubmit={handleSubmit} className="mb-8 space-y-2">
        <input
          type="text"
          name="order_number"
          value={formData.order_number}
          onChange={handleChange}
          placeholder="Order Number"
          className="border px-2 py-1 w-full"
          required
        />
        <select
          name="item_id"
          value={formData.item_id}
          onChange={handleChange}
          className="border px-2 py-1 w-full"
          required
        >
          <option value="">Select Item</option>
          {items.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name} (SKU: {item.sku})
            </option>
          ))}
        </select>
        <input
          type="number"
          name="quantity"
          value={formData.quantity}
          onChange={handleChange}
          min="1"
          className="border px-2 py-1 w-full"
          required
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Submit Order
        </button>
      </form>

      <h2 className="text-xl mb-2">Order List</h2>
      <table className="w-full table-auto border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Order #</th>
            <th className="border px-2 py-1">Item ID</th>
            <th className="border px-2 py-1">Quantity</th>
            <th className="border px-2 py-1">Status</th>
            <th className="border px-2 py-1">Requested By</th>
          </tr>
        </thead>
        <tbody>
          {orders.length === 0 ? (
            <tr>
              <td colSpan="5" className="text-center py-4 text-gray-500">
                No orders found.
              </td>
            </tr>
          ) : (
            orders.map((order) => (
              <tr key={order.id}>
                <td className="border px-2 py-1">{order.order_number}</td>
                <td className="border px-2 py-1">{order.item_id}</td>
                <td className="border px-2 py-1">{order.quantity}</td>
                <td className="border px-2 py-1">{order.status}</td>
                <td className="border px-2 py-1">{order.requested_by}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default OrderPage;
