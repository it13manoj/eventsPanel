import axios from "axios";

const apiClient = axios.create({
  baseURL: "https://api.trussrental.in/api/v1",
  // baseURL: "http://localhost:8001/api/v1",
  headers: {
    "Content-Type": "application/json"
  }
});

/**
 * Checks whether a given JWT token is expired
 */
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;
    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    const decoded = JSON.parse(jsonPayload);
    if (typeof decoded.exp === "number") {
      // Expired if current time exceeds expiration (with 5 second buffer)
      return decoded.exp * 1000 <= Date.now() + 5000;
    }
    return false;
  } catch {
    return false;
  }
};

/**
 * Clears all local user credentials and permissions
 */
export const clearAuthSession = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  localStorage.removeItem("permissions");
};

/**
 * Safely redirects the user to the login screen
 */
export const redirectToLogin = (reason: "expired" | "logout" = "expired") => {
  clearAuthSession();
  const currentPath = window.location.pathname;
  if (currentPath !== "/login" && currentPath !== "/signin" && currentPath !== "/") {
    const target = reason === "expired" ? "/login?expired=1" : "/login";
    window.location.href = target;
  }
};

// Request interceptor (attach token & check client-side expiry before sending)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      if (isTokenExpired(token)) {
        redirectToLogin("expired");
        return Promise.reject(new Error("Session expired. Redirecting to login..."));
      }
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor (handle 401 Unauthorized or expired token responses)
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const data = error.response.data;
      const message = (data?.message || data?.error || "").toString().toLowerCase();
      const url = (error.config?.url || "").toString().toLowerCase();

      // Do not redirect on failed sign-in/sign-up requests (e.g. wrong password)
      const isAuthEndpoint = url.includes("/users/login") || url.includes("/users/signup");

      if (!isAuthEndpoint) {
        if (
          status === 401 ||
          (status === 403 && (message.includes("token") || message.includes("unauthorized") || message.includes("expired"))) ||
          message.includes("jwt expired") ||
          message.includes("token expired") ||
          message.includes("invalid token") ||
          message.includes("token required")
        ) {
          redirectToLogin("expired");
        }
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;