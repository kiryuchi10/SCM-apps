import API from "./api";

export const getItems = async () => API.get("/inventory/");
export const createItem = async (data) => API.post("/inventory/", data);
export const updateItem = async (id, data) => API.put(`/inventory/${id}`, data);
export const deleteItem = async (id) => API.delete(`/inventory/${id}`);
