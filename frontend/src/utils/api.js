import axios from "axios";

// Create API instance
const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Attach auth token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");

  if (token) req.headers.token = token;

  return req;
});

export default API;