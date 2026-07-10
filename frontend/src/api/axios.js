import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// ── Request interceptor: attach JWT ───────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ── Response interceptor: handle token expiry ─────────────────────────────────
// When the backend returns 401 (expired / invalid token), fire a custom DOM
// event so that AuthContext can react (logout + redirect) without creating a
// circular import dependency between this module and React context.
let _expiryEventFired = false;

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    // Skip 401 handling for auth endpoints (login / register) so that wrong
    // credentials don't trigger a session-expiry redirect.
    const url = error?.config?.url ?? "";
    const isAuthEndpoint =
      url.includes("/auth/login") ||
      url.includes("/auth/register") ||
      url.includes("/auth/verify") ||
      url.includes("/auth/forgot-password") ||
      url.includes("/auth/reset-password");

    if (status === 401 && !isAuthEndpoint && !_expiryEventFired) {
      _expiryEventFired = true;

      // Reset the flag after a short delay so future sessions work normally.
      setTimeout(() => { _expiryEventFired = false; }, 3000);

      window.dispatchEvent(new CustomEvent("auth:token-expired"));
    }

    return Promise.reject(error);
  }
);

export default api;