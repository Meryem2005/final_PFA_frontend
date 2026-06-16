const BASE_URL = "http://127.0.0.1:8000/api/v1";

// =========================================
// AUTH
// =========================================

export const authAPI = {

  register: async (data) => {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  login: async (data) => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  me: async (token) => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { "Authorization": `Bearer ${token}` },
    });
    return res.json();
  },
};

// =========================================
// TOKEN
// =========================================

export const getToken = () => localStorage.getItem("token");
export const setToken = (token) => localStorage.setItem("token", token);
export const removeToken = () => localStorage.removeItem("token");
export const getUser = () => JSON.parse(localStorage.getItem("user") || "null");
export const setUser = (user) => localStorage.setItem("user", JSON.stringify(user));
export const removeUser = () => localStorage.removeItem("user");
export const API_BASE_URL = "http://127.0.0.1:8000/api/v1";
export default API_BASE_URL;