import { getAuthStatus, refreshToken } from "@/services/api";

const BASE_URL = "https://exchango.opineomanager.com/api/v1";

interface RequestOptions extends RequestInit {
  skipAuth?: boolean;
}

/**
 * API client for making authenticated requests with automatic token refresh
 */
export const apiClient = {
  /**
   * Make an authenticated API request
   * @param endpoint - API endpoint (without base URL)
   * @param options - Request options
   * @returns Response data
   */
  async request<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    const { skipAuth = false, ...fetchOptions } = options;
    const url = `${BASE_URL}${endpoint}`;

    // Add default headers
    const headers = new Headers(fetchOptions.headers);
    if (
      !headers.has("Content-Type") &&
      !options.body?.toString().includes("FormData")
    ) {
      headers.set("Content-Type", "application/json");
    }

    // Add auth token if not skipping auth
    if (!skipAuth) {
      const authStatus = getAuthStatus();

      // If authenticated but token is expired, try to refresh
      if (authStatus.isAuthenticated && authStatus.isExpired) {
        const refreshResult = await refreshToken();
        if (refreshResult.success) {
          // Use new token and update storage with new user if provided
          headers.set("Authorization", `Bearer ${refreshResult.data.token}`);
          // Optionally update user in storage if returned
          if (refreshResult.data.user) {
            const isRemembered = localStorage.getItem("authToken") !== null;
            const storage = isRemembered ? localStorage : sessionStorage;
            storage.setItem("user", JSON.stringify(refreshResult.data.user));
          }
        } else {
          // Refresh failed, throw error
          throw new Error("Session expired. Please login again.");
        }
      } else if (authStatus.isAuthenticated) {
        // Use existing token
        headers.set("Authorization", `Bearer ${authStatus.token}`);
      }
    }

    // Make the request
    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    // Parse response
    const data = await response.json();

    // Handle errors
    if (!response.ok) {
      throw {
        statusCode: response.status,
        message: data.message || "Request failed",
        error: data.error || null,
      };
    }

    return data as T;
  },

  /**
   * Make a GET request
   */
  async get<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "GET",
      ...options,
    });
  },

  /**
   * Make a POST request
   */
  async post<T = any>(
    endpoint: string,
    body: any,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "POST",
      body: JSON.stringify(body),
      ...options,
    });
  },

  /**
   * Make a PUT request
   */
  async put<T = any>(
    endpoint: string,
    body: any,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
      ...options,
    });
  },

  /**
   * Make a PATCH request
   */
  async patch<T = any>(
    endpoint: string,
    body: any,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PATCH",
      body: JSON.stringify(body),
      ...options,
    });
  },

  /**
   * Make a DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: "DELETE",
      ...options,
    });
  },
};

export default apiClient;
