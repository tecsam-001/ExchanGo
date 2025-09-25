"use client";

import ExchangeDetail from "@/components/ExchangeDetail/ExchangeDetail";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { fetchExchangeDetailsBySlug, trackProfileView } from "@/services/api";

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

interface Rate {
  id: string;
  baseCurrency: Currency;
  targetCurrency: Currency;
  buyRate: string;
  sellRate: string;
  isActive: boolean;
}

interface ExchangeData {
  id: number;
  name: string;
  rate: string;
  address: string;
  hours: string;
  whatsappNumber: string;
  primaryPhoneNumber: string;
  images: { id: string; path: string }[];
  logo?: { id: string; path: string } | null;
  isPopular: boolean;
  isVerified: boolean; // Add isVerified
  lastUpdate: string;
  description?: string;
  slug: string;
  officeId?: string; // Add officeId for tracking
  rates?: Rate[]; // Add rates from API
}

const ExchangeDetailWrapper = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const [exchangeData, setExchangeData] = useState<ExchangeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchExchangeDetails = async () => {
      try {
        // Try to get slug from params first, then fallback to search params
        let slug = params?.slug as string;

        // If no slug in params, try search params
        if (!slug) {
          slug = searchParams?.get("slug") || "";
        }

        if (!slug) {
          throw new Error("No slug provided");
        }

        console.log("Attempting to fetch details for slug:", slug);

        // Use the new API service method
        const response = await fetchExchangeDetailsBySlug(slug);

        if (!response.success || !response.data) {
          throw new Error(
            response.message || "Failed to fetch exchange details"
          );
        }

        const data = response.data as any; // Type as any to access all properties

        // Track profile view for this office
        if (data.id) {
          try {
            console.log("Tracking profile view for office:", data.id);
            await trackProfileView(data.id.toString());
          } catch (trackError) {
            // Just log the error but don't interrupt the user experience
            console.warn("Error tracking profile view:", trackError);
          }
        }

        // Base API URL for constructing full image URLs
        const API_BASE_URL = "https://exchango.opineomanager.com";

        // Helper function to convert image path to full URL (same logic as ExchangeCard)
        const convertImagePath = (path: string): string => {
          if (!path) return "/assets/placeholder.png";

          // If it's already a full URL, return as is
          if (path.startsWith("http")) {
            console.log("Image already has full URL:", path);
            return path;
          }

          // If it's a placeholder, return as is
          if (path === "/assets/placeholder.png") {
            return path;
          }

          // If it's a relative path, construct the full URL
          const fullUrl = `${API_BASE_URL}${path}`;
          console.log(
            "Converting relative path to full URL:",
            path,
            "->",
            fullUrl
          );
          return fullUrl;
        };

        // Log the images data for debugging
        console.log("Raw images data from API:", data.images);

        const processedImages =
          data.images?.map((img: { id?: string; path?: string }) => ({
            id: img.id || crypto.randomUUID(),
            path: img.path
              ? convertImagePath(img.path)
              : "/assets/placeholder.png",
          })) || [];

        console.log("Processed images:", processedImages);

        setExchangeData({
          id: data.id || 0,
          name: data.officeName || "Unnamed Office",
          rate: data.rate || "N/A",
          address: data.address || "Address not available",
          hours: data.hours?.toString() || "N/A",
          images: processedImages,
          logo: data.logo
            ? {
                id: data.logo.id || crypto.randomUUID(),
                path: data.logo.path
                  ? convertImagePath(data.logo.path)
                  : "/assets/placeholder.png",
              }
            : null,
          whatsappNumber: data.whatsappNumber,
          primaryPhoneNumber: data.primaryPhoneNumber,
          isPopular: (data as any).isPopular || false,
          isVerified: (data as any).isVerified || false, // Add isVerified
          lastUpdate: data.lastUpdate || "16 April 2025",
          description: data.description,
          slug: data.slug || slug,
          officeId: data.id?.toString(), // Save office ID for tracking
          rates: (data as any).rates || [], // Include rates from API
        });
      } catch (err) {
        console.error("Detailed error fetching exchange details:", err);
        setError(
          `Failed to load exchange details: ${
            err instanceof Error ? err.message : String(err)
          }`
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchExchangeDetails();
  }, [params?.slug, searchParams]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#20523C]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[50vh] text-red-500 p-4 text-center">
        <h2 className="text-2xl font-bold mb-4">
          Error Loading Exchange Details
        </h2>

        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-[#20523C] text-white rounded hover:bg-[#2a6b4f] transition"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!exchangeData) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        No exchange details found
      </div>
    );
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ExchangeDetail exchangeData={exchangeData} />
    </Suspense>
  );
};

export default ExchangeDetailWrapper;
