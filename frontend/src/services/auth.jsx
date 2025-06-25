import API from "./api";

export const login = async (username, password) =>
  API.post("/auth/login", { username, password });

export const register = async (username, email, password) =>
  API.post("/auth/register", { username, email, password });

export const getProfile = async () =>
  API.get("/auth/profile");
