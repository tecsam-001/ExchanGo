"use client";
import React, { createContext, useContext, useState, useEffect } from "react";
import { fetchOwnedOffice, updateOfficeDetails } from "@/services/api";
import { useAuth } from "./AuthContext";

interface VisibilityContextType {
  isVisible: boolean;
  setIsVisible: (value: boolean) => void;
  isLoading: boolean;
}

const VisibilityContext = createContext<VisibilityContextType | undefined>(
  undefined
);

export const VisibilityProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Load office visibility from API only when authenticated
  useEffect(() => {
    const loadOfficeVisibility = async () => {
      // Only proceed if user is authenticated and auth loading is complete
      if (!isAuthenticated || authLoading) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetchOwnedOffice();
        if (response.success && response.data) {
          setIsVisible(response.data.isActive || false);
        }
      } catch (error) {
        console.error("Error loading office visibility:", error);
        // Fallback to localStorage if API fails
        const savedVisibility = localStorage.getItem("officeVisibility");
        if (savedVisibility !== null) {
          setIsVisible(JSON.parse(savedVisibility));
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadOfficeVisibility();
  }, [isAuthenticated, authLoading]);

  // Update office visibility in API when it changes
  const handleSetIsVisible = async (value: boolean) => {
    // Only proceed if user is authenticated
    if (!isAuthenticated) {
      console.warn("Cannot update office visibility: user not authenticated");
      return;
    }

    try {
      setIsVisible(value);

      // Update in API
      const response = await updateOfficeDetails({
        isActive: value,
      });

      if (response.success) {
        // Also save to localStorage as backup
        localStorage.setItem("officeVisibility", JSON.stringify(value));
      } else {
        console.error("Failed to update office visibility:", response.message);
        // Revert the state if API call fails
        setIsVisible(!value);
      }
    } catch (error) {
      console.error("Error updating office visibility:", error);
      // Revert the state if API call fails
      setIsVisible(!value);
    }
  };

  return (
    <VisibilityContext.Provider
      value={{
        isVisible,
        setIsVisible: handleSetIsVisible,
        isLoading,
      }}
    >
      {children}
    </VisibilityContext.Provider>
  );
};

export const useVisibility = () => {
  const context = useContext(VisibilityContext);
  if (context === undefined) {
    throw new Error("useVisibility must be used within a VisibilityProvider");
  }
  return context;
};
