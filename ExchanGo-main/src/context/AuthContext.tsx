"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { getAuthStatus, refreshToken, logoutFromAPI } from "@/services/api";
import { toast } from "react-toastify";

interface User {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  role?: {
    id: number;
    name: string;
  };
  photo?: {
    id: string;
    path: string;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (userData: any) => void;
  logout: () => Promise<void>;
  refreshUserToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: async () => {},
  refreshUserToken: async () => false,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const authStatus = getAuthStatus();

      if (authStatus.isAuthenticated) {
        if (authStatus.isExpired) {
          // Try to refresh the token
          const refreshResult = await refreshToken();
          if (refreshResult.success) {
            setUser(refreshResult.data.user);
            setIsAuthenticated(true);
          } else {
            // If refresh fails, logout
            await logoutFromAPI();
            setUser(null);
            setIsAuthenticated(false);

            // Only show toast if on a protected route
            if (isProtectedRoute(pathname)) {
              toast.info("Your session has expired. Please login again.");
              router.push("/login");
            }
          }
        } else {
          // Valid token exists
          setUser(authStatus.user);
          setIsAuthenticated(true);
        }
      } else {
        setUser(null);
        setIsAuthenticated(false);

        // Redirect if on protected route
        if (isProtectedRoute(pathname)) {
          router.push("/login");
        }
      }

      setIsLoading(false);
    };

    initAuth();
  }, [pathname, router]);

  // Check if route is protected
  const isProtectedRoute = (path: string) => {
    // Add your protected routes here
    const protectedRoutes = [
      "/admin/dashboard",
      "/admin/analytics",
      "/admin/register-request",
      "/admin/setting",
      "/dashboard",
      // "/setting",
      "/exchange-leadboard",
    ];

    return protectedRoutes.some((route) => path.startsWith(route));
  };

  // Login function
  const login = (userData: any) => {
    setUser(userData.user);
    setIsAuthenticated(true);
  };

  // Logout function
  const logout = async () => {
    try {
      // Call logout API
      const result = await logoutFromAPI();

      // Clear auth state
      setUser(null);
      setIsAuthenticated(false);

      // Show success message
      if (result.success) {
        toast.success("Logged out successfully");
      }

      // Redirect to login page
      router.push("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("An error occurred during logout");

      // Still clear auth state even if API call fails
      setUser(null);
      setIsAuthenticated(false);
      router.push("/login");
    }
  };

  // Refresh token function
  const refreshUserToken = async (): Promise<boolean> => {
    const result = await refreshToken();
    if (result.success) {
      setUser(result.data.user);
      return true;
    }
    return false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshUserToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
