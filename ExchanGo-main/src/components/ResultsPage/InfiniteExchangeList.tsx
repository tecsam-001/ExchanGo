import React, { useState, useEffect } from "react";
import ExchangeCard from "./ExchangeCard";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { ExchangeOffice, WorkingHoursObject } from "./types";
import { truncateName } from "./ExchangeCard";
import { getCurrencySymbol } from "@/utils/currencyUtils";

// Helper function to convert working hours to string
const formatWorkingHours = (hours: any): string => {
  if (!hours) return "Hours not specified";
  if (typeof hours === "string") return hours;

  if (hours.fromTime && hours.toTime) {
    return `${hours.fromTime} - ${hours.toTime}`;
  }

  return "Hours not specified";
};

const ExchangeCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-lg border border-[#DEDEDE] w-full">
      <div className="relative">
        <Skeleton height={121} className="rounded-t-lg" />
        <div className="absolute top-3 left-3 z-30">
          <Skeleton width={100} height={24} borderRadius={4} />
        </div>
        <div className="absolute top-3 right-3 z-30">
          <Skeleton width={60} height={24} borderRadius={4} />
        </div>
      </div>

      <div className="px-[18.25px] pt-[18.25px] sm:p-[18.25px]">
        <Skeleton height={19} width="70%" />
        <Skeleton height={24} width="50%" className="mt-1" />
        <Skeleton height={20} width="90%" className="mt-[12.17px]" />
        <Skeleton height={20} width="80%" className="mt-1" />
      </div>

      <div className="mt-6 flex items-center justify-between gap-[12.17px] p-[18.25px] pt-0">
        <Skeleton height={47} width="100%" borderRadius={6} />
        <Skeleton height={47} width={47} borderRadius={6} />
      </div>
    </div>
  );
};

interface InfiniteExchangeListProps {
  cityOffices?: {
    offices: ExchangeOffice[];
    totalCount: number;
    cityInfo: {
      name: string;
      totalOffices: number;
      activeOffices: number;
      verifiedOffices: number;
      featuredOffices: number;
      availableCurrencies: string[];
    };
    pagination?: {
      page: number;
      limit: number;
      totalPages: number;
      hasNextPage: boolean;
      hasPreviousPage: boolean;
    };
  } | null;
  filteredOffices?: ExchangeOffice[];
  // Add currency information for sharing
  baseAmount?: string;
  sourceCurrency?: string;
  targetCurrency?: string;
  // Add loading state from parent
  isLoading?: boolean;
}

const InfiniteExchangeList: React.FC<InfiniteExchangeListProps> = ({
  cityOffices,
  filteredOffices,
  // Add currency props
  baseAmount,
  sourceCurrency,
  targetCurrency,
  isLoading: parentIsLoading,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [allOffices, setAllOffices] = useState<ExchangeOffice[]>([]);

  useEffect(() => {
    // Reset state when cityOffices prop changes
    setIsLoading(true);
    setAllOffices([]);

    // Check if we have data immediately
    const offices = filteredOffices || cityOffices?.offices || [];

    if (offices.length > 0) {
      // If we have data, show it immediately
      setIsLoading(false);
      setAllOffices(offices);
    } else if (cityOffices === null) {
      // If cityOffices is null, it means the API call failed or no data
      setIsLoading(false);
      setAllOffices([]);
    } else {
      // If cityOffices is undefined, it means we're still waiting for the API response
      // Only show loading state for a short time to avoid flickering
      const timer = setTimeout(() => {
        setIsLoading(false);
        setAllOffices(offices);
      }, 500);

      return () => clearTimeout(timer);
    }
  }, [cityOffices, filteredOffices]);

  const renderSkeletons = (count: number) => {
    return Array.from({ length: count }).map((_, index) => (
      <ExchangeCardSkeleton key={`skeleton-${index}`} />
    ));
  };

  return (
    <div className="mt-4 mb-6 w-full">
      <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading || parentIsLoading ? (
          renderSkeletons(9)
        ) : !parentIsLoading && allOffices.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center py-12">
            <div className="text-gray-400 text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto mb-4 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="text-xl font-medium mb-2">
                No Exchange Offices Found
              </h3>
              <p className="text-gray-500">
                There are no exchange offices available in this location.
              </p>
              <p className="text-gray-500 mt-1">
                Try searching in Casablanca where our offices are located.
              </p>
            </div>
          </div>
        ) : (
          <>
            {allOffices.map((office) => {
              const extractedRate =
                office.equivalentValue ??
                (office.rates && office.rates.length > 0
                  ? office.rates[0].buyRate
                  : "N/A");

              // Get dynamic currency symbol from office data
              const dynamicCurrencySymbol = office?.targetCurrency?.symbol;

              return (
                <ExchangeCard
                  key={office.id}
                  id={office.id}
                  name={truncateName(office.officeName || "Unnamed Office")}
                  rate={String(extractedRate)}
                  address={office.address || "Address not available"}
                  hours={formatWorkingHours(office.todayWorkingHours)}
                  images={office.images || []}
                  country={office.country?.name || "Morocco"}
                  isPopular={office.isPopular}
                  isVerified={office.isVerified}
                  bestOffice={office.bestOffice}
                  availableCurrencies={office.availableCurrencies}
                  searchCount={office.searchCount}
                  distance={office.distance}
                  isCurrentlyOpen={office.isCurrentlyOpen}
                  slug={office.slug}
                  baseAmount={baseAmount}
                  sourceCurrency={sourceCurrency}
                  targetCurrency={targetCurrency}
                  targetCurrencySymbol={dynamicCurrencySymbol}
                  city={
                    office.address
                      ? office.address.split(",")[0]
                      : "Unknown City"
                  }
                  rates={office.rates}
                />
              );
            })}
          </>
        )}
      </div>
    </div>
  );
};

export default InfiniteExchangeList;
