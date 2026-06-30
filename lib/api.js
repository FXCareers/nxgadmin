// Relative base so all requests go through the Next.js rewrite proxy
// (/api/:path* → https://api.nxgmarkets.com/api/:path*)
// Override with NEXT_PUBLIC_API_URL=http://localhost:5000 in .env.local to hit a local backend.
export const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "/api";

class ApiClient {
  constructor() {
    this.baseURL = BASE_URL;
  }

  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const token = this.getToken();

    // Check if token exists and is expired
    if (token && !options.skipAuth) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.exp && payload.exp * 1000 < Date.now()) {
          this.logout();
          throw new Error("Token expired");
        }
      } catch (error) {
        if (error.message === "Token expired") throw error;
        this.logout();
        throw new Error("Invalid token");
      }
    }

    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    if (config.body instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    // Add authorization header if token exists
    if (token && !options.skipAuth) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, config);

      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(
          `Endpoint not found or returned non-JSON (${response.status}): ${endpoint}`,
        );
      }

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          this.logout();
          throw new Error("Session expired. Please login again.");
        }
        throw new Error(
          data.message || `HTTP error! status: ${response.status}`,
        );
      }

      return data;
    } catch (error) {
      if (
        error.message.includes("Token expired") ||
        error.message.includes("Invalid token")
      ) {
        this.logout();
        throw new Error("Session expired. Please login again.");
      }
      throw error;
    }
  }

  // Auth methods
  async login(credentials) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
      skipAuth: true,
    });
  }

  async register(userData) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
      skipAuth: true,
    });
  }

  // Token management
  setToken(token) {
    if (typeof window !== "undefined") {
      localStorage.setItem("auth_token", token);
    }
  }

  getToken() {
    if (typeof window !== "undefined") {
      return localStorage.getItem("auth_token");
    }
    return null;
  }

  removeToken() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("auth_token");
    }
  }

  // User data management
  setUser(user) {
    if (typeof window !== "undefined") {
      localStorage.setItem("user_data", JSON.stringify(user));
    }
  }

  getUser() {
    if (typeof window !== "undefined") {
      const userData = localStorage.getItem("user_data");
      return userData ? JSON.parse(userData) : null;
    }
    return null;
  }

  removeUser() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user_data");
    }
  }

  // Check if user is authenticated
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.exp && payload.exp * 1000 < Date.now()) {
        this.logout();
        return false;
      }
      return true;
    } catch (error) {
      this.logout();
      return false;
    }
  }

  // Logout
  logout() {
    this.removeToken();
    this.removeUser();
  }
}

export const apiClient = new ApiClient();
export default apiClient;
