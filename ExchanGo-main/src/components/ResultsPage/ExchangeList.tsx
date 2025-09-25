import React, { useState, useEffect } from "react";
import ExchangeCard from "./ExchangeCard";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import { ExchangeOffice, WorkingHoursObject } from "./types";
import { truncateName } from "./ExchangeCard";
// Server-driven pagination handled by parent; no direct API calls here

// Helper function to convert working hours to string
const formatWorkingHours = (hours: string | WorkingHoursObject | any | undefined): string => {
  if (!hours) return "Hours not specified";
  if (typeof hours === "string") return hours;

  if (hours?.fromTime && hours?.toTime) {
    return `${hours?.fromTime} - ${hours?.toTime}`;
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

interface ExchangeListProps {
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
  onVisibleOfficesChange?: (offices: ExchangeOffice[]) => void;
  // Add currency information for sharing
  baseAmount?: string;
  sourceCurrency?: string;
  targetCurrency?: string;
  // Add loading state from parent
  isLoading?: boolean;
  // Server-driven pagination props
  currentPage?: number;
  totalPages?: number;
  totalOfficesInArea?: number;
  onPageChange?: (page: number) => void;
}

const ExchangeList: React.FC<ExchangeListProps> = ({
  cityOffices,
  filteredOffices,
  onVisibleOfficesChange,
  // Add currency props
  baseAmount,
  sourceCurrency,
  targetCurrency,
  isLoading: parentIsLoading,
  currentPage: parentCurrentPage = 1,
  totalPages: parentTotalPages = 1,
  totalOfficesInArea,
  onPageChange,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [displayedOffices, setDisplayedOffices] = useState<ExchangeOffice[]>(
    []
  );
  const initialBatchSize = 9;

  useEffect(() => {
    // Determine which list to show: preferred filtered list for the current page,
    // otherwise the raw offices from the API page.
    const offices = (filteredOffices && filteredOffices.length > 0)
      ? filteredOffices
      : (cityOffices?.offices || []);

    if (offices.length > 0) {
      setIsLoading(false);
      setDisplayedOffices(offices);
      if (onVisibleOfficesChange) onVisibleOfficesChange(offices);
    } else if (cityOffices === null) {
      // If cityOffices is null, it means the API call failed or no data
      setIsLoading(false);
      setDisplayedOffices([]);
    } else if (cityOffices !== undefined) {
      // If cityOffices is defined but has no offices, stop loading
      setIsLoading(false);
      setDisplayedOffices([]);
    }
    // If cityOffices is undefined, keep showing skeletons until data arrives
  }, [cityOffices, filteredOffices, onVisibleOfficesChange]);

  useEffect(() => {
    if (onVisibleOfficesChange) onVisibleOfficesChange(displayedOffices);
  }, [displayedOffices]);

  const renderSkeletons = (count: number) => {
    return Array.from({ length: count }).map((_, index) => (
      <ExchangeCardSkeleton key={`skeleton-${index}`} />
    ));
  };

  const handlePageChange = (newPage: number) => {
    if (!onPageChange) return;
    if (newPage < 1 || newPage > parentTotalPages || newPage === parentCurrentPage) return;
    onPageChange(newPage);
    // Notify map to adjust view for newly loaded page markers
    try {
      const evt = new CustomEvent("resultsPageChanged", { detail: { page: newPage } });
      window.dispatchEvent(evt);
    } catch (e) {
      // no-op
    }
  };

  // Note: Pagination numbers are generated inline below using
  // parentTotalPages and parentCurrentPage to avoid stale/undefined refs.

  return (
    <div className="mt-4 mb-6 w-full">
      <div className="w-full grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading || parentIsLoading ? (
          renderSkeletons(initialBatchSize)
        ) : !parentIsLoading &&
          !isLoading &&
          cityOffices &&
          cityOffices.offices.length === 0 ? (
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
            {displayedOffices.map((office) => (
              <ExchangeCard
                key={office.id}
                id={office.id}
                name={truncateName(office.officeName || "Unnamed Office")}
                rate={String(
                  office.equivalentValue ??
                    (office.rates && office.rates.length > 0
                      ? office.rates[0].buyRate
                      : "N/A")
                )}
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
                phoneNumber={office.primaryPhoneNumber}
                baseAmount={baseAmount}
                sourceCurrency={sourceCurrency}
                targetCurrency={targetCurrency}
                targetCurrencySymbol={office.targetCurrency?.symbol}
                city={
                  office.address ? office.address.split(",")[0] : "Unknown City"
                }
                rates={office.rates || []}
              />
            ))}
          </>
        )}
      </div>

      {/* Pagination */}
      {parentTotalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2">
            {/* Previous Button */}
            <button
              onClick={() => handlePageChange(parentCurrentPage - 1)}
              disabled={parentCurrentPage === 1}
              className="px-3 py-2 text-[#111111] cursor-pointer text-sm font-medium border border-[#DEDEDE] rounded-md bg-white hover:bg-[#F6F6F6] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                width="24"
                height="25"
                viewBox="0 0 24 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.0038 20.7111L8.48375 14.1911C7.71375 13.4211 7.71375 12.1611 8.48375 11.3911L15.0038 4.87109"
                  stroke="#292D32"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Page Numbers */}
            {(() => {
              // Generate page numbers using parent totals/current page
              const pages: (number | string)[] = [];
              const maxVisiblePages = 5;
              const totalPages = parentTotalPages;
              const currentPage = parentCurrentPage;
              if (totalPages <= maxVisiblePages) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                pages.push(1);
                if (currentPage <= 3) {
                  pages.push(2, 3, 4, "...", totalPages);
                } else if (currentPage >= totalPages - 2) {
                  pages.push("...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                } else {
                  pages.push("...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
                }
              }
              return pages;
            })().map((pageNum, index) => (
              <button
                key={index}
                onClick={() => {
                  if (pageNum !== "...") {
                    handlePageChange(pageNum as number);
                  }
                }}
                disabled={pageNum === "..."}
                className={`px-3 py-2 text-[17px] cursor-pointer font-medium border border-[#DEDEDE] rounded-md transition-colors duration-200 ${
                  pageNum === parentCurrentPage
                    ? "bg-[#20523C] text-white border-[#20523C]"
                    : pageNum === "..."
                    ? "text-[#111111] cursor-default bg-white"
                    : "text-[#111111] hover:bg-[#F6F6F6] bg-white"
                }`}
              >
                {pageNum === "..." ? "..." : String(pageNum).padStart(2, "0")}
              </button>
            ))}

            {/* Next Button */}
            <button
              onClick={() => handlePageChange(parentCurrentPage + 1)}
              disabled={parentCurrentPage === parentTotalPages}
              className="px-3 py-2 text-[#111111] rotate-180 cursor-pointer text-sm font-medium border border-[#DEDEDE] rounded-md bg-white hover:bg-[#F6F6F6] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg
                width="24"
                height="25"
                viewBox="0 0 24 25"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.0038 20.7111L8.48375 14.1911C7.71375 13.4211 7.71375 12.1611 8.48375 11.3911L15.0038 4.87109"
                  stroke="#292D32"
                  strokeWidth="1.5"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExchangeList;
