import axios from "axios";
import { apiClient } from "@/utils/apiClient";
// API service for ExchanGo
const BASE_URL = "https://exchango.opineomanager.com/api/v1";

// Auth endpoints
const AUTH_ENDPOINTS = {
  REGISTER: "/auth/email/register",
  LOGIN: "/auth/email/login",
  FORGOT_PASSWORD: "/auth/forgot/password",
  RESET_PASSWORD: "/auth/email/reset-password",
  REFRESH_TOKEN: "/auth/refresh",
  LOGOUT: "/auth/logout",
  CHANGE_PASSWORD: "/auth/change/password",
};

// Office endpoints
const OFFICE_ENDPOINTS = {
  CREATE: "/offices",
  UPLOAD_FILE: "/files/upload",
  OWNED: "/offices/owned",
  LOGO: "/offices/logo",
  IMAGES: "/offices/images",
};

// Working hours endpoints
const WORKING_HOURS_ENDPOINTS = {
  BASE: "/working-hours",
  GET_ALL: "/working-hours", // Get all working hours
  CREATE: "/working-hours", // Create new working hours
};

// Office rates endpoints
const OFFICE_RATES_ENDPOINTS = {
  CREATE: "/office-rates",
  GET_ALL: "/office-rates",
  UPDATE: "/office-rates",
  DELETE: "/office-rates",
};

// City endpoints
const CITY_ENDPOINTS = {
  SEARCH: "/cities/search",
};

// Add analytics endpoints
const ANALYTICS_ENDPOINTS = {
  DASHBOARD: "/analytics/dashboard",
  TRACK_PROFILE_VIEW: "/analytics/track/profile-view",
  TRACK_GPS_CLICK: "/analytics/track/gps-click",
  TRACK_PHONE_CALL: "/analytics/track/phone-call",
};

// Add alerts endpoints
const ALERT_ENDPOINTS = {
  CREATE: "/alerts",
};

// Add notification preferences endpoints
const NOTIFICATION_ENDPOINTS = {
  GET_PREFERENCES: "/notification-preferences/me",
  UPDATE_PREFERENCES: "/notification-preferences/me",
};

// Add rate history endpoints
const RATE_HISTORY_ENDPOINTS = {
  GET_ALL: "/rate-histories",
};

// Add FAQ endpoints
const FAQ_ENDPOINTS = {
  GET_MY_FAQS: "/faqs/me",
  CREATE_FAQ: "/faqs/me",
  UPDATE_FAQ: (id: string) => `/faqs/me/${id}`,
  DELETE_FAQ: (id: string) => `/faqs/me/${id}`,
};

// Add registration requests endpoints
const REGISTRATION_REQUEST_ENDPOINTS = {
  GET_ALL: "/requests",
  GET_BY_ID: (id: string) => `/requests/${id}`,
  ACCEPT: (id: string) => `/requests/${id}/accept`,
  REJECT: (id: string) => `/requests/${id}/reject`,
  HOLD: (id: string) => `/requests/${id}/hold`, // Assuming this endpoint exists for hold status
};

// Add admin dashboard endpoints
const ADMIN_DASHBOARD_ENDPOINTS = {
  STATS: "/admins/dashboard/stats",
  TABLE: "/admins/dashboard/table",
};

// Add admin analytics endpoints
const ADMIN_ANALYTICS_ENDPOINTS = {
  STATS: "/admins/analytics/stats",
  ACTIVITY_LIST: "/admins/activity/list",
  OFFICE_ENGAGEMENT: "/admins/office-engagement",
  FILTER_CITIES: "/admins/filters/cities",
  ABOUT_OFFICES: "/admins/about-offices",
};

// Admin analytics interfaces
export interface AdminAnalyticsStats {
  profileViews: {
    total: number;
    percentageChange: number;
    changeFromLastMonth: number;
  };
  phoneCalls: {
    total: number;
    percentageChange: number;
    changeFromLastMonth: number;
  };
  gpsClicks: {
    total: number;
    percentageChange: number;
    changeFromLastMonth: number;
  };
  waAlertPrice: {
    total: number;
    percentageChange: number;
  };
  lastUpdate: string;
}

export interface ActivityListItem {
  id: string;
  office: {
    officeName: string;
    city: {
      name: string;
    };
  };
  lastUpdate: string;
  updates7days: number;
  activityStatus: "Very Active" | "Active" | "Low Activity";
  createdAt?: string;
  updatedAt?: string;
}

export interface OfficeEngagementItem {
  id: string;
  office: {
    officeName: string;
    city: {
      name: string;
    };
  };
  profileViews: number;
  phoneCalls: number;
  gpsClick: number;
  share: number;
  waAlerts: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface FilterCity {
  id: string;
  name: string;
  country: string;
}

export interface ActivityListResponse {
  data: ActivityListItem[];
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface OfficeEngagementResponse {
  data: OfficeEngagementItem[];
  pagination?: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export type AnalyticsPeriod = "7days" | "30days" | "90days";

// About Offices interfaces
export interface AboutOfficeItem {
  officeName: string;
  city: string;
  country: string;
  registrationDate: string;
  status: "REQUESTED" | "ON_HOLD" | "ACCEPTED" | "REJECTED";
  duration: number;
}

export interface AboutOfficesResponse {
  data: AboutOfficeItem[];
  totalOffices: number;
  filteredCount: number;
  appliedFilters: Record<string, any>;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export type AboutOfficeDuration =
  | "ALL_TIME"
  | "LAST_7_DAYS"
  | "LAST_1_MONTH"
  | "LAST_6_MONTHS";
export type AboutOfficeStatus =
  | "REQUESTED"
  | "ON_HOLD"
  | "ACCEPTED"
  | "REJECTED";

// Admin dashboard interfaces
export interface DashboardStats {
  totalOffices: {
    total: number;
    percentageChange: number;
    changeFromLastPeriod: number;
  };
  updatesThisWeek: {
    total: number;
    percentageChange: number;
    changeFromLastPeriod: number;
  };
  alerts: {
    total: number;
    percentageChange: number;
    changeFromLastPeriod: number;
  };
}

export interface DashboardTableItem {
  office: {
    id: string;
    officeName: string;
    city: {
      name: string;
    };
    country: {
      name: string;
    };
  };
  alertsCount: number;
  viewsCount: number;
  updateRate: string;
  rateHistoryCount: number;
}

export interface DashboardTableResponse {
  data: DashboardTableItem[];
  period: string;
  totalOffices: number;
  filteredCount: number;
  searchApplied: boolean;
  pagination: {
    currentPage: number;
    pageSize: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export type DashboardPeriod = "7days" | "30days" | "90days";

// Registration request interfaces
export interface RegistrationRequestOffice {
  id: string;
  officeName: string;
  registrationNumber: string;
  currencyExchangeLicenseNumber: string;
  address: string;
  city: {
    id: string;
    name: string;
  };
  country: {
    id: string;
    name: string;
    alpha2: string;
  };
  state: string;
  primaryPhoneNumber: string;
  secondaryPhoneNumber?: string;
  thirdPhoneNumber?: string;
  whatsappNumber: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  email: string;
  owner: {
    id: number;
    firstName?: string;
    lastName?: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationRequest {
  id: string;
  office: RegistrationRequestOffice;
  status: "REQUESTED" | "ON_HOLD" | "ACCEPTED" | "REJECTED";
  rejectReason?: string;
  additionalMessage?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RegistrationRequestsResponse {
  data: RegistrationRequest[];
  hasNextPage: boolean;
  total?: number;
  currentPage?: number;
  totalPages?: number;
}

// Time period enum for rate history API
export enum RateHistoryTimePeriod {
  LAST_SEVEN_DAYS = "LAST_SEVEN_DAYS",
  LAST_ONE_MONTH = "LAST_ONE_MONTH",
  LAST_SIX_MONTHS = "LAST_SIX_MONTHS",
  LAST_ONE_YEAR = "LAST_ONE_YEAR",
  ALL_HISTORY = "ALL_HISTORY",
}

// Auth response interface
export interface AuthResponse {
  token: string;
  refreshToken: string;
  tokenExpires: number;
  user: {
    id: number;
    email: string;
    provider: string;
    socialId: string;
    firstName: string;
    lastName: string;
    photo?: {
      id: string;
      path: string;
    };
    role: {
      id: number;
      name: string;
    };
    status: {
      id: number;
      name: string;
    };
    createdAt: string;
    updatedAt: string;
    deletedAt?: string;
  };
}

// Error response interface
export interface ApiErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
}

// Update interfaces to match the exact API response
export interface CityCountry {
  id: string;
  name: string;
  unicode: string;
  emoji: string;
  alpha2: string;
  dialCode: string;
  region: string;
  capital: string;
  alpha3: string;
  createdAt: string;
  updatedAt: string;
}

export interface CityOffice {
  id: string;
  officeName: string;
  address: string;
  primaryPhoneNumber: string;
  slug: string;
  isActive: boolean;
  isVerified: boolean;
  isFeatured: boolean;
}

export interface City {
  id: string;
  name: string;
  country: CityCountry;
  createdAt: string;
  updatedAt: string;
  numberOfOffices: number;
  offices: CityOffice[];
}

// Define dashboard data interface
export interface DashboardAnalyticsData {
  profileViews: {
    total: number;
    percentageChange: number;
    changeFromLastMonth: number;
  };
  phoneCalls: {
    total: number;
    percentageChange: number;
    changeFromLastMonth: number;
  };
  gpsClicks: {
    total: number;
    percentageChange: number;
    changeFromLastMonth: number;
  };
  waAlertPrice: {
    total: number;
    percentageChange: number;
  };
  rateAlertFrequency: string;
  keyStats: {
    day: string;
    value: number;
  }[];
  lastUpdate: string;
}

// Office data interface
export interface OfficeDetails {
  id: string;
  officeName: string;
  registrationNumber: string;
  currencyExchangeLicenseNumber: string;
  address: string;
  city: {
    id: string;
    name: string;
    createdAt: string;
    updatedAt: string;
  };
  country: {
    id: string;
    name: string;
    unicode: string;
    emoji: string;
    alpha2: string;
    dialCode: string;
    region: string;
    capital: string;
    alpha3: string;
    createdAt: string;
    updatedAt: string;
  };
  state: string;
  primaryPhoneNumber: string;
  secondaryPhoneNumber: string;
  thirdPhoneNumber: string;
  whatsappNumber: string;
  location: {
    type: string;
    coordinates: [number, number];
  };
  logo: {
    id: string;
    path: string;
    __entity: string;
  };
  images: any[];
  slug: string;
  owner: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
  };
  isActive: boolean;
  isVerified: boolean;
  isFeatured: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  email: string;
  rates: any[];
  workingHours: WorkingHour[];
  todayWorkingHours: WorkingHour & { __entity: string };
}

export interface WorkingHour {
  id: string;
  createdAt: string;
  updatedAt: string;
  dayOfWeek:
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY";
  isActive: boolean;
  fromTime: string;
  toTime: string;
  hasBreak: boolean;
  breakFromTime: string;
  breakToTime: string;
  officeId: string;
}

// Register a new user
export const registerUser = async (userData: {
  email: string;
  password: string;
  isTermsAccepted: boolean;
  remember?: boolean;
}) => {
  try {
    const response = await fetch(`${BASE_URL}${AUTH_ENDPOINTS.REGISTER}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!response.ok) {
      // Return a structured error with status code
      return {
        success: false,
        statusCode: response.status,
        message: data.message || "Registration failed",
        error: data.error || null,
      };
    }

    // Save auth data to localStorage or sessionStorage
    if (userData.remember) {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("tokenExpires", data.tokenExpires.toString());
      localStorage.setItem("user", JSON.stringify(data.user));
    } else {
      // Use sessionStorage if not remembered
      sessionStorage.setItem("authToken", data.token);
      sessionStorage.setItem("refreshToken", data.refreshToken);
      sessionStorage.setItem("tokenExpires", data.tokenExpires.toString());
      sessionStorage.setItem("user", JSON.stringify(data.user));
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Network error. Please check your connection.",
    };
  }
};

// Google OAuth login
export const googleLogin = async (idToken: string) => {
  try {
    const response = await fetch(`${BASE_URL}/api/v1/auth/google/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken }),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || "Google login failed",
        error: data.error || null,
      };
    }

    // Save auth data to localStorage
    localStorage.setItem("authToken", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);
    localStorage.setItem("tokenExpires", data.tokenExpires.toString());
    localStorage.setItem("user", JSON.stringify(data.user));

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Google login error:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Network error. Please check your connection.",
    };
  }
};

// Login user
export const loginUser = async (credentials: {
  email: string;
  password: string;
  remember?: boolean;
}) => {
  // Exclude remember from the data sent to the backend
  const { remember, ...backendCredentials } = credentials;
  console.log("login data", backendCredentials);

  const response = await fetch(`${BASE_URL}${AUTH_ENDPOINTS.LOGIN}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(backendCredentials),
  });

  const data = await response.json();

  console.log("login data", data);
  try {
    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || "Login failed",
        error: data.error || null,
      };
    }

    // Save auth data to localStorage if remember is true
    if (credentials.remember) {
      localStorage.setItem("authToken", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
      localStorage.setItem("tokenExpires", data.tokenExpires.toString());
      localStorage.setItem("user", JSON.stringify(data.user));
    } else {
      // Use sessionStorage if not remembered
      sessionStorage.setItem("authToken", data.token);
      sessionStorage.setItem("refreshToken", data.refreshToken);
      sessionStorage.setItem("tokenExpires", data.tokenExpires.toString());
      sessionStorage.setItem("user", JSON.stringify(data.user));
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Network error. Please check your connection.",
    };
  }
};

// Forgot password
export const forgotPassword = async (email: string) => {
  try {
    const response = await fetch(
      `${BASE_URL}${AUTH_ENDPOINTS.FORGOT_PASSWORD}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      }
    );

    if (response.status === 204) {
      return {
        success: true,
        statusCode: 204,
        message: "Password reset link sent successfully",
      };
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || "Failed to send reset email",
        error: data.error || null,
      };
    }

    return {
      success: true,
      statusCode: response.status,
      message: "Password reset link sent successfully",
      data,
    };
  } catch (error) {
    console.error("Forgot password error:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Network error. Please check your connection.",
    };
  }
};

// Refresh token
export const refreshToken = async () => {
  try {
    // Get refresh token from storage
    const refreshToken =
      localStorage.getItem("refreshToken") ||
      sessionStorage.getItem("refreshToken");

    if (!refreshToken) {
      return {
        success: false,
        statusCode: 401,
        message: "No refresh token available",
      };
    }

    const response = await fetch(`${BASE_URL}${AUTH_ENDPOINTS.REFRESH_TOKEN}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${refreshToken}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || "Token refresh failed",
        error: data.error || null,
      };
    }

    // Update stored tokens
    const isRemembered = localStorage.getItem("authToken") !== null;
    const storage = isRemembered ? localStorage : sessionStorage;

    storage.setItem("authToken", data.token);
    storage.setItem("refreshToken", data.refreshToken);
    storage.setItem("tokenExpires", data.tokenExpires.toString());

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Token refresh error:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Network error. Please check your connection.",
    };
  }
};

// Logout user from API
export const logoutFromAPI = async () => {
  try {
    // Get auth token from storage
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      return {
        success: false,
        statusCode: 401,
        message: "No auth token available",
      };
    }

    const response = await fetch(`${BASE_URL}${AUTH_ENDPOINTS.LOGOUT}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // Even if the API call fails, we still want to clear local storage
    // But we'll return the API response for informational purposes
    if (!response.ok) {
      const data = await response.json();
      console.warn("Logout API error:", data);
    }

    // Clear local storage regardless of API response
    clearAuthStorage();

    return {
      success: true,
    };
  } catch (error) {
    console.error("Logout error:", error);

    // Clear local storage even if API call fails
    clearAuthStorage();

    return {
      success: false,
      statusCode: 500,
      message: "Network error during logout, but local session was cleared.",
    };
  }
};

// Clear auth storage (local and session)
const clearAuthStorage = () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("tokenExpires");
  localStorage.removeItem("user");

  sessionStorage.removeItem("authToken");
  sessionStorage.removeItem("refreshToken");
  sessionStorage.removeItem("tokenExpires");
  sessionStorage.removeItem("user");
};

// Logout user (clear local storage)
export const logoutUser = async () => {
  try {
    // Call logout API
    await logoutFromAPI();
  } catch (error) {
    console.error("Error during logout:", error);
  } finally {
    // Always clear local storage
    clearAuthStorage();
  }
};

// Get current auth status
export const getAuthStatus = () => {
  const token =
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
  const refreshToken =
    localStorage.getItem("refreshToken") ||
    sessionStorage.getItem("refreshToken");
  const tokenExpires =
    localStorage.getItem("tokenExpires") ||
    sessionStorage.getItem("tokenExpires");
  const userStr =
    localStorage.getItem("user") || sessionStorage.getItem("user");

  if (!token || !refreshToken || !tokenExpires || !userStr) {
    return { isAuthenticated: false };
  }

  const user = JSON.parse(userStr);
  const isExpired = Date.now() > Number(tokenExpires);

  return {
    isAuthenticated: true,
    isExpired,
    user,
    token,
    refreshToken,
  };
};

// Upload file (supports single or multiple files)
export const uploadFile = async (files: File | File[]) => {
  try {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      console.error("No authentication token found in storage");
      return {
        success: false,
        statusCode: 401,
        message: "Authentication required",
      };
    }

    console.log("File upload - Using token:", token.substring(0, 10) + "...");
    console.log(
      "File upload - Endpoint:",
      `${BASE_URL}${OFFICE_ENDPOINTS.UPLOAD_FILE}`
    );

    const formData = new FormData();

    // Handle single file or multiple files
    if (Array.isArray(files)) {
      console.log("File upload - Multiple files:", files.length);
      files.forEach((file) => {
        formData.append("files", file);
        console.log("File upload - File name:", file.name, "Size:", file.size);
      });
    } else {
      console.log(
        "File upload - Single file:",
        files.name,
        "Size:",
        files.size
      );
      formData.append("file", files);
    }

    const response = await fetch(`${BASE_URL}${OFFICE_ENDPOINTS.UPLOAD_FILE}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    console.log("File upload - Response status:", response.status);
    const data = await response.json();
    console.log("File upload - Response data:", data);

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || "File upload failed",
        error: data.error || null,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("File upload error:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Network error. Please check your connection.",
    };
  }
};

// Attach logo to office
export const attachLogoToOffice = async (logoData: {
  logo: {
    file: {
      path: string;
      id: string;
    };
  };
}) => {
  try {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      return {
        success: false,
        statusCode: 401,
        message: "Authentication required",
      };
    }

    console.log("Attaching logo to office:", logoData);

    const response = await fetch(`${BASE_URL}${OFFICE_ENDPOINTS.LOGO}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(logoData),
    });

    const data = await response.json();
    console.log("Attach logo response:", data);

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || "Failed to attach logo",
        error: data.error || null,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Attach logo error:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Network error. Please check your connection.",
    };
  }
};

// Attach images to office
export const attachImagesToOffice = async (imagesData: {
  images: Array<{
    file: {
      path: string;
      id: string;
    };
  }>;
}) => {
  try {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      return {
        success: false,
        statusCode: 401,
        message: "Authentication required",
      };
    }

    console.log("Attaching images to office:", imagesData);

    const response = await fetch(`${BASE_URL}${OFFICE_ENDPOINTS.IMAGES}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(imagesData),
    });

    const data = await response.json();
    console.log("Attach images response:", data);

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || "Failed to attach images",
        error: data.error || null,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Attach images error:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Network error. Please check your connection.",
    };
  }
};

// Create office
export const createOffice = async (officeData: {
  officeName: string;
  registrationNumber: string;
  currencyExchangeLicenseNumber: string;
  address: string;
  city: string;
  state: string;
  primaryPhoneNumber: string;
  secondaryPhoneNumber?: string;
  thirdPhoneNumber?: string;
  whatsappNumber: string;
  logo: string | { id: string };
  location: string | { type: string; coordinates: number[] };
  email?: string;
}) => {
  try {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      console.error("No authentication token found in storage");
      return {
        success: false,
        statusCode: 401,
        message: "Authentication required",
      };
    }

    // Format the data as expected by the API
    const formattedData = {
      ...officeData,
      // Keep location as an object if it's an object, otherwise use as-is
      location:
        typeof officeData.location === "string"
          ? officeData.location
          : {
              type: officeData.location.type,
              coordinates: officeData.location.coordinates,
            },
      // Ensure logo is in the correct format (if API expects { id: string })
      logo:
        typeof officeData.logo === "string"
          ? { id: officeData.logo }
          : officeData.logo,
    };

    const response = await fetch(`${BASE_URL}${OFFICE_ENDPOINTS.CREATE}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(formattedData),
    });

    const data = await response.json();
    console.log("Office creation - Response data:", data); // Log the parsed data, not the response object

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || "Office creation failed",
        error: data.error || null,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Office creation error:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Network error. Please check your connection.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// Update searchCities function to return the exact response
export const searchCities = async (cityName: string): Promise<City | null> => {
  try {
    const response = await axios.get(`${BASE_URL}${CITY_ENDPOINTS.SEARCH}`, {
      params: { name: cityName.toLowerCase() },
    });

    console.log("City search response:", response.data.data[0]);
    return response.data.data[0];
  } catch (error) {
    console.error("Error fetching city data:", error);
    return null;
  }
};

// Update the CityWithExchanges interface to match the transformation
export interface CityExchange {
  id: string;
  name: string;
  slug: string;
  address?: string;
  primaryPhoneNumber?: string;
  selected: boolean;
  isActive: boolean;
  isVerified: boolean;
  isFeatured: boolean;
}

export interface CityWithExchanges {
  city: string;
  cityId?: string; // Add optional cityId for API integration
  numberOfOffices: number;
  exchanges: CityExchange[];
}

// Utility function to transform API response
export const transformCitySearchResponse = (
  cityData: City | null
): CityWithExchanges | null => {
  if (!cityData) return null;

  return {
    city: cityData.name,
    cityId: cityData.id, // Include the city ID from the API
    numberOfOffices: cityData.numberOfOffices,
    exchanges: cityData.offices.map((office) => ({
      id: office.id,
      name: office.officeName,
      slug: office.slug,
      address: office.address,
      primaryPhoneNumber: office.primaryPhoneNumber,
      selected: true,
      isActive: office.isActive,
      isVerified: office.isVerified,
      isFeatured: office.isFeatured,
    })),
  };
};

export const fetchCityRankingData = async (params: {
  baseCurrencyCode: string;
  targetCurrencyCode: string;
  amount: number;
}) => {
  try {
    const response = await axios.get(`${BASE_URL}/landing-pages/city-ranking`, {
      params,
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching city ranking data:", error);
    throw error;
  }
};

export const fetchCityOffices = async (params: {
  cityName: string;
  baseCurrency?: string;
  targetCurrency?: string;
  targetCurrencyRate?: number;
  page?: number;
  limit?: number;
  isActive?: boolean;
  availableCurrencies?: string[];
  trend?: "featured" | "verified" | "newest";
  showOnlyOpenNow?: boolean;
}) => {
  try {
    const {
      cityName,
      baseCurrency = "EUR",
      targetCurrency = "MAD",
      targetCurrencyRate,
      page = 1,
      limit = 9,
      isActive = false,
      availableCurrencies,
      trend,
      showOnlyOpenNow,
    } = params;

    // Prepare query parameters
    const queryParams = new URLSearchParams({
      baseCurrency,
      targetCurrency,
      page: page.toString(),
      limit: limit.toString(),
      isActive: isActive.toString(),
    });

    // Add optional filters
    if (availableCurrencies && availableCurrencies.length > 0) {
      queryParams.append("availableCurrencies", availableCurrencies.join(","));
    }

    if (trend) {
      queryParams.append("trend", trend);
    }

    if (targetCurrencyRate) {
      queryParams.append("targetCurrencyRate", targetCurrencyRate.toString());
    }

    if (showOnlyOpenNow) {
      queryParams.append("showOnlyOpenNow", "true");
    }

    console.log("Fetching city offices with params:", queryParams.toString());

    const response = await axios.get(
      `${BASE_URL}/offices/city/${cityName.toLowerCase()}`,
      { params: Object.fromEntries(queryParams) }
    );

    console.log("Offices response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error fetching city offices:", error);
    throw error;
  }
};

export const fetchNearbyOffices = async (params: {
  latitude: number;
  longitude: number;
  radiusInKm?: number;
  baseCurrency?: string;
  targetCurrency?: string;
  targetCurrencyRate?: number;
  page?: number;
  limit?: number;
  isActive?: boolean;
  availableCurrencies?: string[];
  trend?: "featured" | "verified" | "newest";
  showOnlyOpenNow?: boolean;
}) => {
  try {
    const {
      latitude,
      longitude,
      radiusInKm = 10,
      baseCurrency = "EUR",
      targetCurrency = "MAD",
      targetCurrencyRate,
      page = 1,
      limit = 9,
      isActive = false,
      availableCurrencies,
      trend,
      showOnlyOpenNow,
    } = params;

    console.log("Step 1: Starting fetchNearbyOffices with params:", {
      latitude,
      longitude,
      radiusInKm,
      baseCurrency,
      targetCurrency,
      page,
      limit,
      isActive,
      availableCurrencies,
      trend,
      showOnlyOpenNow,
    });

    // Prepare query parameters
    const queryParams = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      radiusInKm: radiusInKm.toString(),
      baseCurrency,
      targetCurrency,
      page: page.toString(),
      limit: limit.toString(),
      isActive: isActive.toString(),
    });

    // Add targetCurrencyRate only if it's defined
    if (targetCurrencyRate !== undefined && !isNaN(targetCurrencyRate)) {
      queryParams.append("targetCurrencyRate", targetCurrencyRate.toString());
    }

    // Add optional filters
    if (availableCurrencies && availableCurrencies.length > 0) {
      queryParams.append("availableCurrencies", availableCurrencies.join(","));
    }

    if (trend) {
      queryParams.append("trend", trend);
    }

    // if (targetCurrencyRate) {
    //   queryParams.append("targetCurrencyRate", targetCurrencyRate.toString());
    // }

    if (showOnlyOpenNow) {
      queryParams.append("showOnlyOpenNow", "true");
    }

    console.log("Step 2: Prepared query parameters:", queryParams.toString());

    const response = await axios.get(`${BASE_URL}/offices/nearby`, {
      params: Object.fromEntries(queryParams),
    });

    console.log("Steppppppp:", response.data);
    return response.data;
  } catch (error) {
    console.error("Step 4: Error fetching nearby offices:", error);
    throw error;
  }
};

export const fetchExchangeDetailsBySlug = async (slug: string) => {
  try {
    const response = await fetch(
      `${BASE_URL}/offices/slug/${encodeURIComponent(slug)}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      let errorDetails = "";
      try {
        const errorJson = JSON.parse(errorText);
        errorDetails = errorJson.message || errorJson.error || errorText;
      } catch {
        errorDetails = errorText;
      }

      throw new Error(
        `HTTP error! status: ${response.status}, details: ${errorDetails}`
      );
    }

    const data = await response.json();

    // Construct description if not provided by API
    const description =
      data.description ||
      ` Located in the heart of Rabat, ${
        data.officeName || "Unknown Office"
      } is your reliable destination for all foreign currency exchange needs. 
    
Whether you're a traveler, a business professional, or a local resident, we offer fast, secure, and transparent currency exchange services.

Security and trust are the cornerstones of our business. All transactions are handled with the utmost confidentiality and processed through secure systems. Our staff is highly trained to provide professional and courteous service. We are licensed and regulated, giving you peace of mind.

We cater to a diverse clientele, from international tourists needing local currency to businesses managing foreign transactions. We also assist students studying abroad and expatriates with their financial needs. No amount is too small or too large for us to handle with care. We offer special rates for bulk transactions.

Convenience is key to our service offering. Our office is centrally located and easily accessible by public transport. We also offer online pre-ordering so your currency is ready for you when you arrive. This saves you time and ensures you get the best possible rate on the day.

Customer satisfaction is our ultimate goal. We pride ourselves on the positive feedback we receive from our clients. Our dedicated support team is always ready to answer any questions you may have. Come and experience the difference at our exchange office.

In addition to currency exchange, we provide helpful travel tips and up-to-date information on exchange rate trends to help you make informed decisions. Whether you're planning a vacation or managing international payments, our team is here to support your financial journey every step of the way.`;

    return {
      success: true,
      data: {
        id: data.id || 0,
        officeName: data.officeName || "Unnamed Office",
        rate: data.rate || "N/A",
        address: data.address || "Address not available",
        hours: data.todayWorkingHours.fromTime
          ? `${data.todayWorkingHours.fromTime} -   ${data.todayWorkingHours.toTime}`
          : "Hours not specified",
        images: data.images || [],
        whatsappNumber: data.whatsappNumber || "N/A",
        primaryPhoneNumber: data.primaryPhoneNumber || "N/A",
        isPopular: data.isFeatured || false, // isFeatured = Popular tag
        isVerified: data.isVerified || false, // isVerified = Verified tag
        lastUpdate: data.lastUpdate || "16 April 2025",
        description,
        slug: data.slug || slug,
        rates: data.rates || [], // ADD THE MISSING RATES DATA!
        logo: data.logo || null, // Also add logo which was missing
      },
    };
  } catch (error) {
    console.error("Error fetching exchange details:", error);
    return {
      success: false,
      statusCode: 500,
      message: `Failed to load exchange details: ${
        error instanceof Error ? error.message : String(error)
      }`,
    };
  }
};

// Function to create a new office rate
export const createOfficeRate = async (rateData: {
  targetCurrency: string;
  buyRate: number;
  sellRate: number;
  isActive: boolean;
}) => {
  try {
    // Retrieve the authentication token
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log("Create office rate data:", rateData);

    const response = await fetch(
      `${BASE_URL}${OFFICE_RATES_ENDPOINTS.CREATE}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(rateData),
      }
    );

    return {
      success: true,
      data: response,
    };
  } catch (error: any) {
    console.error("Create office rate error:", error);
    return {
      success: false,
      statusCode: error?.statusCode || 500,
      message: error?.message || "Failed to create office rate",
      error: error?.error || null,
    };
  }
};

// Function to fetch office rates
export const fetchOfficeRates = async () => {
  try {
    // Retrieve the authentication token
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(
      `${BASE_URL}${OFFICE_RATES_ENDPOINTS.GET_ALL}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || "Failed to fetch office rates",
        error: data.error || null,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("Fetch office rates error:", error);
    return {
      success: false,
      statusCode: error?.statusCode || 500,
      message: error?.message || "Network error. Please check your connection.",
    };
  }
};

// Function to update an existing office rate
export const updateOfficeRate = async (
  rateId: string,
  rateData: {
    buyRate?: number;
    sellRate?: number;
    isActive?: boolean;
  }
) => {
  try {
    // Retrieve the authentication token
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log(`Updating office rate ${rateId} with data:`, rateData);

    const response = await fetch(
      `${BASE_URL}${OFFICE_RATES_ENDPOINTS.UPDATE}/${rateId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(rateData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || "Failed to update office rate",
        error: data.error || null,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("Update office rate error:", error);
    return {
      success: false,
      statusCode: error?.statusCode || 500,
      message: error?.message || "Network error. Please check your connection.",
      error: error?.error || null,
    };
  }
};

// Function to delete an existing office rate
export const deleteOfficeRate = async (rateId: string) => {
  try {
    // Retrieve the authentication token
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log(`Deleting office rate ${rateId}`);

    const response = await fetch(
      `${BASE_URL}${OFFICE_RATES_ENDPOINTS.DELETE}/${rateId}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // For DELETE requests, some APIs return no content
    if (response.status === 204) {
      return {
        success: true,
      };
    }

    // If there's content, try to parse it
    let data;
    try {
      data = await response.json();
    } catch (e) {
      // No JSON response
      if (response.ok) {
        return { success: true };
      }
    }

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: (data && data.message) || "Failed to delete office rate",
        error: (data && data.error) || null,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("Delete office rate error:", error);
    return {
      success: false,
      statusCode: error?.statusCode || 500,
      message: error?.message || "Network error. Please check your connection.",
      error: error?.error || null,
    };
  }
};

// Function to fetch dashboard analytics data
export const fetchDashboardAnalytics = async (
  period: "7days" | "30days" | "90days" = "7days"
) => {
  try {
    // Retrieve the authentication token
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(
      `${BASE_URL}${ANALYTICS_ENDPOINTS.DASHBOARD}?period=${period}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || "Failed to fetch dashboard analytics",
        error: data.error || null,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("Fetch dashboard analytics error:", error);
    return {
      success: false,
      statusCode: error?.statusCode || 500,
      message: error?.message || "Network error. Please check your connection.",
      error: error?.error || null,
    };
  }
};

// Function to fetch owned office details
export const fetchOwnedOffice = async () => {
  try {
    // Retrieve the authentication token
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${BASE_URL}${OFFICE_ENDPOINTS.OWNED}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || "Failed to fetch office details",
        error: data.error || null,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("Fetch office details error:", error);
    return {
      success: false,
      statusCode: error?.statusCode || 500,
      message: error?.message || "Network error. Please check your connection.",
      error: error?.error || null,
    };
  }
};

// Function to update office details
export const updateOfficeDetails = async (
  officeData: Partial<OfficeDetails>
) => {
  try {
    // Retrieve the authentication token
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(`${BASE_URL}${OFFICE_ENDPOINTS.OWNED}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(officeData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || "Failed to update office details",
        error: data.error || null,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("Update office details error:", error);
    return {
      success: false,
      statusCode: error?.statusCode || 500,
      message: error?.message || "Network error. Please check your connection.",
      error: error?.error || null,
    };
  }
};

// Update working hours (PATCH method as per API docs)
export const updateWorkingHours = async (
  workingHoursData: Array<{
    dayOfWeek: string;
    isActive: boolean;
    fromTime?: string;
    toTime?: string;
    hasBreak?: boolean;
    breakFromTime?: string;
    breakToTime?: string;
  }>
) => {
  try {
    // Retrieve the authentication token
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      throw new Error("No authentication token found");
    }

    // Format data according to API spec
    const formattedData = {
      workingHours: workingHoursData.map((item) => ({
        ...item,
        dayOfWeek: item.dayOfWeek.toUpperCase(),
      })),
    };

    console.log("Updating working hours:", formattedData);

    const response = await fetch(`${BASE_URL}${WORKING_HOURS_ENDPOINTS.BASE}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formattedData),
    });

    console.log("Response:", response);

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || "Failed to create/update working hours",
        error: data.error || null,
      };
    }

    return {
      success: true,
      data: data.data || data, // Handle both response formats
    };
  } catch (error: any) {
    console.error("Create/update working hours error:", error);
    return {
      success: false,
      statusCode: error?.statusCode || 500,
      message: error?.message || "Network error. Please check your connection.",
      error: error?.error || null,
    };
  }
};

// Function to get all working hours
export const getAllWorkingHours = async () => {
  try {
    // Retrieve the authentication token
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      throw new Error("No authentication token found");
    }

    const response = await fetch(
      `${BASE_URL}${WORKING_HOURS_ENDPOINTS.GET_ALL}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || "Failed to get working hours",
        error: data.error || null,
      };
    }
    console.log("Data:", data);

    return {
      success: true,
      data: data.data || data, // Handle both response formats
    };
  } catch (error: any) {
    console.error("Get working hours error:", error);
    return {
      success: false,
      statusCode: error?.statusCode || 500,
      message: error?.message || "Network error. Please check your connection.",
      error: error?.error || null,
    };
  }
};

// Interface for alerts
export interface AlertRequest {
  triggerType: "OFFICE" | "CITY";
  whatsAppNumber: string;
  offices?: string[];
  cities?: string[];
  currency: string;
  baseCurrencyAmount: number;
  targetCurrencyAmount: number;
  targetCurrency: string;
}

// Alert response interface
export interface AlertResponse {
  id: string;
  triggerType: "OFFICE" | "CITY";
  whatsAppNumber: string;
  offices?: string[];
  cities?: string[];
  currency: string;
  baseCurrencyAmount: number;
  targetCurrencyAmount: number;
  targetCurrency: string;
  createdAt: string;
  updatedAt: string;
}

// Function to create a WhatsApp alert
export const createAlert = async (alertData: AlertRequest) => {
  try {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    console.log(
      "Creating alert with data:",
      JSON.stringify(alertData, null, 2)
    );

    const response = await fetch(`${BASE_URL}${ALERT_ENDPOINTS.CREATE}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}), // Add token if available, but don't require it
      },
      body: JSON.stringify(alertData),
    });

    const data = await response.json();
    console.log("Alert API response:", data);

    if (!response.ok) {
      console.error("Alert API error:", {
        status: response.status,
        statusText: response.statusText,
        data,
      });

      return {
        success: false,
        statusCode: response.status,
        message:
          data.message || `Error ${response.status}: ${response.statusText}`,
        error: data.error || data,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("Create alert error:", error);
    return {
      success: false,
      statusCode: error?.statusCode || 500,
      message: error?.message || "Network error. Please check your connection.",
      error: error?.error || error,
    };
  }
};

// Interface for currency
export interface Currency {
  id: string;
  code: string;
  name: string;
  namePlural: string;
  symbol: string;
  symbolNative: string;
  decimalDigits: number;
  rounding: string;
  createdAt: string;
  updatedAt: string;
  flag: string;
}

// Interface for rate history
export interface RateHistory {
  id: string;
  createdAt: string;
  updatedAt: string;
  office: {
    id: string;
    officeName: string;
    registrationNumber: string;
    currencyExchangeLicenseNumber: string;
    address: string;
    city: {
      id: string;
      name: string;
      createdAt: string;
      updatedAt: string;
    };
    country: {
      id: string;
      name: string;
      unicode: string;
      emoji: string;
      alpha2: string;
      dialCode: string;
      region: string;
      capital: string;
      alpha3: string;
      createdAt: string;
      updatedAt: string;
    };
    state: string;
    primaryPhoneNumber: string;
    secondaryPhoneNumber: string;
    thirdPhoneNumber: string;
    whatsappNumber: string;
    location: {
      type: string;
      coordinates: [number, number];
    };
    logo: {
      id: string;
      path: string;
      __entity: string;
    } | null;
    images: any[];
    slug: string;
    owner: {
      id: number;
      firstName: string | null;
      lastName: string | null;
      role: {
        id: number;
        name: string;
        __entity: string;
      };
      status: {
        id: number;
        name: string;
        __entity: string;
      };
      createdAt: string;
      updatedAt: string;
      deletedAt: string | null;
    };
    isActive: boolean;
    isVerified: boolean;
    isFeatured: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    email: string;
    rates: any[];
    workingHours: any[];
  };
  targetCurrency: Currency;
  baseCurrency: Currency;
  oldBuyRate: string;
  oldSellRate: string;
  newBuyRate: string;
  newSellRate: string;
  isActive: boolean;
}

// Function to fetch rate histories
export const fetchRateHistories = async (params?: {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "ASC" | "DESC";
  timePeriod?: RateHistoryTimePeriod;
}) => {
  try {
    // Construct query parameters
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sort) queryParams.append("sort", params.sort);
    if (params?.order) queryParams.append("order", params.order);
    if (params?.timePeriod) queryParams.append("timePeriod", params.timePeriod);

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";

    // Get token if available but don't require it
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    console.log(
      `Fetching rate histories${
        queryString ? " with params: " + queryString : ""
      }`
    );

    const response = await fetch(
      `${BASE_URL}${RATE_HISTORY_ENDPOINTS.GET_ALL}${queryString}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    const data = await response.json();
    console.log("Rate histories API response:", data);

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message:
          data.message || `Error ${response.status}: ${response.statusText}`,
        error: data.error || data,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error: any) {
    console.error("Fetch rate histories error:", error);
    return {
      success: false,
      statusCode: error?.statusCode || 500,
      message: error?.message || "Network error. Please check your connection.",
      error: error?.error || error,
    };
  }
};

// Track profile view analytics
export const trackProfileView = async (officeId: string) => {
  try {
    console.log(`Tracking profile view for office ID: ${officeId}`);

    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    const response = await fetch(
      `${BASE_URL}${ANALYTICS_ENDPOINTS.TRACK_PROFILE_VIEW}/${officeId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.warn(
        `Failed to track profile view: ${data.message || response.statusText}`
      );
      return {
        success: false,
        message: data.message || "Failed to track profile view",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.warn("Error tracking profile view:", error);
    return {
      success: false,
      message: "Error tracking profile view",
    };
  }
};

// Track GPS click analytics
export const trackGpsClick = async (officeId: string) => {
  try {
    console.log(`Tracking GPS click for office ID: ${officeId}`);

    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    const response = await fetch(
      `${BASE_URL}${ANALYTICS_ENDPOINTS.TRACK_GPS_CLICK}/${officeId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.warn(
        `Failed to track GPS click: ${data.message || response.statusText}`
      );
      return {
        success: false,
        message: data.message || "Failed to track GPS click",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.warn("Error tracking GPS click:", error);
    return {
      success: false,
      message: "Error tracking GPS click",
    };
  }
};

// Track phone call analytics
export const trackPhoneCall = async (
  officeId: string,
  phoneNumber?: string
) => {
  try {
    console.log(`Tracking phone call for office ID: ${officeId}`);

    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    const response = await fetch(
      `${BASE_URL}${ANALYTICS_ENDPOINTS.TRACK_PHONE_CALL}/${officeId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber || "",
          phoneType: "WHATSAPP",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.warn(
        `Failed to track phone call: ${data.message || response.statusText}`
      );
      return {
        success: false,
        message: data.message || "Failed to track phone call",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.warn("Error tracking phone call:", error);
    return {
      success: false,
      message: "Error tracking phone call",
    };
  }
};

// Change password function
export const changePassword = async (passwordData: {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  try {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      return {
        success: false,
        statusCode: 401,
        message: "Authentication required",
      };
    }

    const response = await fetch(
      `${BASE_URL}${AUTH_ENDPOINTS.CHANGE_PASSWORD}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(passwordData),
      }
    );

    console.log("hihihi", response);

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || "Failed to change password",
        error: data.error || null,
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Password change error:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Network error. Please check your connection.",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};

// FAQ interface
export interface FAQ {
  id: string;
  question: string;
  answer: string;
  createdAt?: string;
  updatedAt?: string;
}

// Get my FAQs
export const getMyFaqs = async (): Promise<{
  success: boolean;
  data?: FAQ[];
  message?: string;
  statusCode?: number;
}> => {
  try {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      return {
        success: false,
        statusCode: 401,
        message: "Authentication required",
      };
    }

    const response = await fetch(`${BASE_URL}${FAQ_ENDPOINTS.GET_MY_FAQS}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || "Failed to fetch FAQs",
      };
    }

    return {
      success: true,
      data: data.data || [],
    };
  } catch (error) {
    console.error("Error fetching FAQs:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Network error. Please check your connection.",
    };
  }
};

// Create a new FAQ
export const createFaq = async (faqData: {
  question: string;
  answer: string;
}): Promise<{
  success: boolean;
  data?: FAQ;
  message?: string;
  statusCode?: number;
}> => {
  try {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      return {
        success: false,
        statusCode: 401,
        message: "Authentication required",
      };
    }

    const response = await fetch(`${BASE_URL}${FAQ_ENDPOINTS.CREATE_FAQ}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(faqData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || "Failed to create FAQ",
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error("Error creating FAQ:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Network error. Please check your connection.",
    };
  }
};

// Update an existing FAQ
export const updateFaq = async (
  id: string,
  faqData: { question: string; answer: string }
): Promise<{
  success: boolean;
  data?: FAQ;
  message?: string;
  statusCode?: number;
}> => {
  try {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      return {
        success: false,
        statusCode: 401,
        message: "Authentication required",
      };
    }

    const response = await fetch(`${BASE_URL}${FAQ_ENDPOINTS.UPDATE_FAQ(id)}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(faqData),
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || "Failed to update FAQ",
      };
    }

    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error("Error updating FAQ:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Network error. Please check your connection.",
    };
  }
};

// Delete an FAQ
export const deleteFaq = async (
  id: string
): Promise<{ success: boolean; message?: string; statusCode?: number }> => {
  try {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      return {
        success: false,
        statusCode: 401,
        message: "Authentication required",
      };
    }

    const response = await fetch(`${BASE_URL}${FAQ_ENDPOINTS.DELETE_FAQ(id)}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      return {
        success: false,
        statusCode: response.status,
        message: data.message || "Failed to delete FAQ",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    console.error("Error deleting FAQ:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Network error. Please check your connection.",
    };
  }
};

export const createFaqsBulk = async (bulkData: {
  faqs: { question: string; answer: string }[];
}): Promise<{
  success: boolean;
  data?: any[];
  message?: string;
  statusCode?: number;
}> => {
  try {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    const response = await axios.post(`${BASE_URL}/faqs/me/bulk`, bulkData, {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    });

    console.log("khikhi", response);
    return { success: true, data: response.data.data };
  } catch (error: any) {
    return {
      success: false,
      message: error?.response?.data?.message || error.message,
      statusCode: error?.response?.status,
    };
  }
};

// Registration request API functions

// Get all registration requests
export const getRegistrationRequests = async (params?: {
  page?: number;
  limit?: number;
}): Promise<{
  success: boolean;
  data?: RegistrationRequestsResponse;
  message?: string;
  statusCode?: number;
}> => {
  try {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      return {
        success: false,
        statusCode: 401,
        message: "Authentication required",
      };
    }

    // Build query string
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";

    const response = await fetch(
      `${BASE_URL}${REGISTRATION_REQUEST_ENDPOINTS.GET_ALL}${queryString}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || "Failed to fetch registration requests",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error fetching registration requests:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Network error. Please check your connection.",
    };
  }
};

// Get registration request by ID
export const getRegistrationRequestById = async (
  id: string
): Promise<{
  success: boolean;
  data?: RegistrationRequest;
  message?: string;
  statusCode?: number;
}> => {
  try {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      return {
        success: false,
        statusCode: 401,
        message: "Authentication required",
      };
    }

    const response = await fetch(
      `${BASE_URL}${REGISTRATION_REQUEST_ENDPOINTS.GET_BY_ID(id)}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || "Failed to fetch registration request",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error fetching registration request:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Network error. Please check your connection.",
    };
  }
};

// Accept registration request
export const acceptRegistrationRequest = async (
  id: string
): Promise<{
  success: boolean;
  data?: RegistrationRequest;
  message?: string;
  statusCode?: number;
}> => {
  try {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      return {
        success: false,
        statusCode: 401,
        message: "Authentication required",
      };
    }

    const response = await fetch(
      `${BASE_URL}${REGISTRATION_REQUEST_ENDPOINTS.ACCEPT(id)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || "Failed to accept registration request",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error accepting registration request:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Network error. Please check your connection.",
    };
  }
};

// Reject registration request
export const rejectRegistrationRequest = async (
  id: string,
  rejectData: { rejectReason: string; additionalMessage?: string }
): Promise<{
  success: boolean;
  data?: RegistrationRequest;
  message?: string;
  statusCode?: number;
}> => {
  try {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      return {
        success: false,
        statusCode: 401,
        message: "Authentication required",
      };
    }

    const response = await fetch(
      `${BASE_URL}${REGISTRATION_REQUEST_ENDPOINTS.REJECT(id)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rejectData),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || "Failed to reject registration request",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error rejecting registration request:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Network error. Please check your connection.",
    };
  }
};

// Put on hold registration request (assuming this endpoint exists)
export const holdRegistrationRequest = async (
  id: string
): Promise<{
  success: boolean;
  data?: RegistrationRequest;
  message?: string;
  statusCode?: number;
}> => {
  try {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      return {
        success: false,
        statusCode: 401,
        message: "Authentication required",
      };
    }

    const response = await fetch(
      `${BASE_URL}${REGISTRATION_REQUEST_ENDPOINTS.HOLD(id)}`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || "Failed to put registration request on hold",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error putting registration request on hold:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Network error. Please check your connection.",
    };
  }
};

// Add admin dashboard endpoints
export const fetchAdminDashboardStats = async (
  period: DashboardPeriod = "7days"
): Promise<{
  success: boolean;
  data?: DashboardStats;
  message?: string;
  statusCode?: number;
}> => {
  try {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      return {
        success: false,
        statusCode: 401,
        message: "Authentication required",
      };
    }

    const response = await fetch(
      `${BASE_URL}${ADMIN_DASHBOARD_ENDPOINTS.STATS}?period=${period}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || "Failed to fetch admin dashboard stats",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error fetching admin dashboard stats:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Network error. Please check your connection.",
    };
  }
};

export const fetchAdminDashboardTable = async (params?: {
  page?: number;
  limit?: number;
  search?: string;
  period?: DashboardPeriod;
}): Promise<{
  success: boolean;
  data?: DashboardTableResponse;
  message?: string;
  statusCode?: number;
}> => {
  try {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      return {
        success: false,
        statusCode: 401,
        message: "Authentication required",
      };
    }

    // Build query string
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.period) queryParams.append("period", params.period);

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";

    const response = await fetch(
      `${BASE_URL}${ADMIN_DASHBOARD_ENDPOINTS.TABLE}${queryString}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || "Failed to fetch admin dashboard table",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error fetching admin dashboard table:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Network error. Please check your connection.",
    };
  }
};

// Add admin analytics endpoints
export const fetchAdminAnalyticsStats = async (
  period: AnalyticsPeriod = "7days"
): Promise<{
  success: boolean;
  data?: AdminAnalyticsStats;
  message?: string;
  statusCode?: number;
}> => {
  try {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      return {
        success: false,
        statusCode: 401,
        message: "Authentication required",
      };
    }

    const response = await fetch(
      `${BASE_URL}${ADMIN_ANALYTICS_ENDPOINTS.STATS}?period=${period}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || "Failed to fetch admin analytics stats",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error fetching admin analytics stats:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Network error. Please check your connection.",
    };
  }
};

export const fetchAdminActivityList = async (params?: {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "ASC" | "DESC";
  period?: AnalyticsPeriod;
}): Promise<{
  success: boolean;
  data?: ActivityListResponse;
  message?: string;
  statusCode?: number;
}> => {
  try {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      return {
        success: false,
        statusCode: 401,
        message: "Authentication required",
      };
    }

    // Build query string
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sort) queryParams.append("sort", params.sort);
    if (params?.order) queryParams.append("order", params.order);
    if (params?.period) queryParams.append("period", params.period);

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";

    const response = await fetch(
      `${BASE_URL}${ADMIN_ANALYTICS_ENDPOINTS.ACTIVITY_LIST}${queryString}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || "Failed to fetch admin activity list",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error fetching admin activity list:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Network error. Please check your connection.",
    };
  }
};

export const fetchAdminOfficeEngagement = async (params?: {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "ASC" | "DESC";
  period?: AnalyticsPeriod;
  cityIds?: string;
  search?: string;
}): Promise<{
  success: boolean;
  data?: OfficeEngagementResponse;
  message?: string;
  statusCode?: number;
}> => {
  try {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      return {
        success: false,
        statusCode: 401,
        message: "Authentication required",
      };
    }

    // Build query string
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.sort) queryParams.append("sort", params.sort);
    if (params?.order) queryParams.append("order", params.order);
    if (params?.period) queryParams.append("period", params.period);
    if (params?.cityIds) queryParams.append("cityIds", params.cityIds);
    if (params?.search) queryParams.append("search", params.search);

    const queryString = queryParams.toString()
      ? `?${queryParams.toString()}`
      : "";

    const response = await fetch(
      `${BASE_URL}${ADMIN_ANALYTICS_ENDPOINTS.OFFICE_ENGAGEMENT}${queryString}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || "Failed to fetch admin office engagement",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error fetching admin office engagement:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Network error. Please check your connection.",
    };
  }
};

// Notification preferences interfaces
export interface NotificationPreferences {
  rateUpdateReminderWhatsApp: boolean;
  rateUpdateReminderEmail?: boolean;
  // Add other notification preferences as needed
}

export const getNotificationPreferences = async (): Promise<{
  success: boolean;
  data?: NotificationPreferences;
  message?: string;
  statusCode?: number;
}> => {
  try {
    console.log(
      "Making GET request to:",
      NOTIFICATION_ENDPOINTS.GET_PREFERENCES
    );

    // Check if user is authenticated
    const authStatus = getAuthStatus();
    console.log("Auth status:", authStatus);

    const response = await apiClient.get(
      NOTIFICATION_ENDPOINTS.GET_PREFERENCES
    );

    console.log("API Response:", response);

    // Handle different response structures
    let preferencesData;
    if (response.data) {
      preferencesData = response.data;
    } else if (response.rateUpdateReminderWhatsApp !== undefined) {
      preferencesData = response;
    } else {
      preferencesData = response;
    }

    console.log("Processed preferences data:", preferencesData);

    return {
      success: true,
      data: preferencesData,
    };
  } catch (error: any) {
    console.error("Error fetching notification preferences:", error);
    console.error("Error details:", {
      statusCode: error.statusCode,
      message: error.message,
      error: error.error,
    });
    return {
      success: false,
      message: error.message || "Failed to fetch notification preferences",
      statusCode: error.statusCode,
    };
  }
};

export const updateNotificationPreferences = async (
  preferences: Partial<NotificationPreferences>
): Promise<{
  success: boolean;
  data?: NotificationPreferences;
  message?: string;
  statusCode?: number;
}> => {
  try {
    console.log(
      "Making PATCH request to:",
      NOTIFICATION_ENDPOINTS.UPDATE_PREFERENCES
    );
    console.log("Request body:", preferences);

    const response = await apiClient.patch(
      NOTIFICATION_ENDPOINTS.UPDATE_PREFERENCES,
      preferences
    );

    console.log("Update API Response:", response);

    return {
      success: true,
      data: response.data || response,
    };
  } catch (error: any) {
    console.error("Error updating notification preferences:", error);
    console.error("Error details:", {
      statusCode: error.statusCode,
      message: error.message,
      error: error.error,
    });
    return {
      success: false,
      message: error.message || "Failed to update notification preferences",
      statusCode: error.statusCode,
    };
  }
};

export const fetchAdminFilterCities = async (
  search?: string
): Promise<{
  success: boolean;
  data?: FilterCity[];
  message?: string;
  statusCode?: number;
}> => {
  try {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      return {
        success: false,
        statusCode: 401,
        message: "Authentication required",
      };
    }

    const queryString = search ? `?search=${encodeURIComponent(search)}` : "";

    const response = await fetch(
      `${BASE_URL}${ADMIN_ANALYTICS_ENDPOINTS.FILTER_CITIES}${queryString}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || "Failed to fetch admin filter cities",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error fetching admin filter cities:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Network error. Please check your connection.",
    };
  }
};

export const fetchAdminAboutOffices = async (params?: {
  cityIds?: string;
  status?: AboutOfficeStatus;
  duration?: AboutOfficeDuration;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<{
  success: boolean;
  data?: AboutOfficesResponse;
  message?: string;
  statusCode?: number;
}> => {
  try {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

    if (!token) {
      return {
        success: false,
        statusCode: 401,
        message: "Authentication required",
      };
    }

    const queryParams = new URLSearchParams();

    if (params?.cityIds) {
      queryParams.append("cityIds", params.cityIds);
    }

    if (params?.status) {
      queryParams.append("status", params.status);
    }

    if (params?.duration) {
      queryParams.append("duration", params.duration);
    }

    if (params?.search) {
      queryParams.append("search", params.search);
    }

    if (params?.page) {
      queryParams.append("page", params.page.toString());
    }

    if (params?.limit) {
      queryParams.append("limit", params.limit.toString());
    }

    const queryString = queryParams.toString();
    const url = `${BASE_URL}${ADMIN_ANALYTICS_ENDPOINTS.ABOUT_OFFICES}${
      queryString ? `?${queryString}` : ""
    }`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        statusCode: response.status,
        message: data.message || "Failed to fetch about offices data",
      };
    }

    return {
      success: true,
      data,
    };
  } catch (error) {
    console.error("Error fetching about offices data:", error);
    return {
      success: false,
      statusCode: 500,
      message: "Network error. Please check your connection.",
    };
  }
};

export default {
  BASE_URL,
  AUTH_ENDPOINTS,
  OFFICE_ENDPOINTS,
  CITY_ENDPOINTS,
  ANALYTICS_ENDPOINTS,
  WORKING_HOURS_ENDPOINTS,
  ALERT_ENDPOINTS,
  RATE_HISTORY_ENDPOINTS,
  FAQ_ENDPOINTS,
  REGISTRATION_REQUEST_ENDPOINTS,
  ADMIN_DASHBOARD_ENDPOINTS,
  ADMIN_ANALYTICS_ENDPOINTS,
  registerUser,
  loginUser,
  forgotPassword,
  refreshToken,
  logoutUser,
  logoutFromAPI,
  getAuthStatus,
  uploadFile,
  attachLogoToOffice,
  attachImagesToOffice,
  createOffice,
  searchCities,
  fetchCityRankingData,
  fetchCityOffices,
  fetchExchangeDetailsBySlug,
  createOfficeRate,
  fetchOfficeRates,
  updateOfficeRate,
  deleteOfficeRate,
  fetchDashboardAnalytics,
  fetchOwnedOffice,
  updateOfficeDetails,
  updateWorkingHours,
  getAllWorkingHours,
  createAlert,
  fetchRateHistories,
  trackProfileView,
  trackGpsClick,
  trackPhoneCall,
  changePassword,
  getMyFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  createFaqsBulk,
  getRegistrationRequests,
  getRegistrationRequestById,
  acceptRegistrationRequest,
  rejectRegistrationRequest,
  holdRegistrationRequest,
  fetchAdminDashboardStats,
  fetchAdminDashboardTable,
  fetchAdminAnalyticsStats,
  fetchAdminActivityList,
  fetchAdminOfficeEngagement,
  fetchAdminFilterCities,
};
