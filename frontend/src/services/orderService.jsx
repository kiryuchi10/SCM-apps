import API from "./api";

// Get all orders
export const getOrders = async () => API.get("/orders/");

// Create a new order
export const createOrder = async (data) => API.post("/orders/", data);

// Update an order
export const updateOrder = async (id, data) => API.put(`/orders/${id}`, data);

// Delete an order
export const deleteOrder = async (id) => API.delete(`/orders/${id}`);
