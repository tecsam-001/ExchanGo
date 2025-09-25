"use client";
import Image from "next/image";
import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ArrowLeft from "@/components/SvgIcons/ArrowLeft";
import SortDropdown from "../Filters/SortDropdown";
import FilterButton from "../Filters/FilterButton";
import SearchBar from "../SearchBar";
import MobileExchangeCardModal from "./MobileExchangeCardModal";
import Link from "next/link";
import { FilterState } from "../types";
import { useMenu } from "@/context/MenuContext";

interface MobileHeaderProps {
  onSortClick: (option: string) => void;
  onApplyFilters?: (filters: FilterState) => void;
  onClearFilters?: () => void;
  onCheckRates?: () => void;
  onAmountCurrencyChange?: (args: {
    amount: number | undefined;
    baseCurrency: string;
    targetCurrency: string;
  }) => void;
  cityOffices?: {
    offices: any[];
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
  filteredOffices?: any[];
  resultCount?: number;
  isMapCardOpen?: boolean;
}

const sortOptions = [
  "Highest to Lowest Rate",
  "Geographic proximity",
  "Currently open/closed",
];

const MobileHeader: React.FC<MobileHeaderProps> = ({
  onSortClick,
  onApplyFilters,
  onClearFilters,
  onCheckRates,
  onAmountCurrencyChange,
  cityOffices,
  filteredOffices,
  resultCount,
  isMapCardOpen = false,
}) => {
  const searchParams = useSearchParams();
  const { toggleMenu } = useMenu();
  const [showSearchDrawer, setShowSearchDrawer] = useState(false);
  const [selectedSortOption, setSelectedSortOption] = useState<string>(
    sortOptions[0]
  );
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [location, setLocation] = useState<string>("");
  const [displayText, setDisplayText] = useState<string>("");
  const [showMobileModal, setShowMobileModal] = useState(true);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);

  const isMobile = true;

  useEffect(() => {
    const locationParam = searchParams.get("location");
    const bestOfficeParam = searchParams.get("bestOffice");
    const sourceParam = searchParams.get("source");
    const targetParam = searchParams.get("target");

    if (locationParam) {
      setLocation(locationParam);
    }

    // Format the display text with location and currencies
    if (locationParam && sourceParam && targetParam) {
      const formattedLocation =
        locationParam.charAt(0).toUpperCase() + locationParam.slice(1);
      setDisplayText(`${formattedLocation} - ${sourceParam} to ${targetParam}`);
    } else if (locationParam) {
      const formattedLocation =
        locationParam.charAt(0).toUpperCase() + locationParam.slice(1);
      setDisplayText(formattedLocation);
    } else {
      setDisplayText("");
    }

    const handleLocationChange = (event: any) => {
      const { name } = event.detail;
      setLocation(name);

      // Update display text when location changes
      if (name && sourceParam && targetParam) {
        const formattedLocation = name.charAt(0).toUpperCase() + name.slice(1);
        setDisplayText(
          `${formattedLocation} - ${sourceParam} to ${targetParam}`
        );
      } else if (name) {
        const formattedLocation = name.charAt(0).toUpperCase() + name.slice(1);
        setDisplayText(formattedLocation);
      }
    };

    window.addEventListener("userLocationChanged", handleLocationChange);
    window.addEventListener("mapLocationChanged", handleLocationChange);

    return () => {
      window.removeEventListener("userLocationChanged", handleLocationChange);
      window.removeEventListener("mapLocationChanged", handleLocationChange);
    };
  }, [searchParams]);

  // Keep modal open by default - only hide for specific UI conflicts

  // Handle map card visibility changes - hide modal when map card is open
  useEffect(() => {
    if (isMapCardOpen || isCurrencyDropdownOpen) {
      setShowMobileModal(false);
    } else if (!isCurrencyDropdownOpen && !showSearchDrawer) {
      setShowMobileModal(true);
    }
  }, [isMapCardOpen, isCurrencyDropdownOpen, showSearchDrawer]);

  const toggleSearchDrawer = () => {
    setShowSearchDrawer(!showSearchDrawer);
  };

  const handleMenuClick = () => {
    toggleMenu();
  };

  const handleOptionClick = (option: string) => {
    setSelectedSortOption(option);
    setIsSortDropdownOpen(false);
    onSortClick(option);
  };

  const handleApplyFilters = (filters: FilterState) => {
    if (onApplyFilters) {
      onApplyFilters(filters);
    }
  };

  const handleClearFilters = () => {
    if (onClearFilters) {
      onClearFilters();
    }
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="border-b border-[#DEDEDE] pt-2 pb-4">
        <div className="mb-2 h-[46px] w-full px-5 flex items-center justify-between gap-4">
          <Link href="/" className="cursor-pointer">
            <ArrowLeft />
          </Link>
          <Link href="/">
            <Image src="/assets/logo.svg" alt="logo" width={143} height={31} />
          </Link>
          <button
            onClick={handleMenuClick}
            className="lg:hidden block cursor-pointer"
          >
            <Image
              src="/assets/menu-black.svg"
              alt="menu"
              width={24}
              height={24}
            />
          </button>
        </div>

        <div className="h-[46px] w-full px-5 flex items-center justify-between gap-4">
          <div className="relative flex-1">
            {/* <Image
              src="/assets/search-normal.svg"
              alt="location"
              width={18}
              height={18}
              className="absolute left-[20%] top-1/2 -translate-y-1/2"
            /> */}
            <input
              type="text"
              placeholder="Search Location"
              value={displayText}
              readOnly
              onClick={toggleSearchDrawer}
              className="border border-[#DEDEDE] text-center rounded-lg smaller h-[46px] w-full px-2.5 placeholder:text-[#585858] text-[#111111] outline-none text-[14px] font-normal leading-[20px] cursor-pointer"
            />
          </div>

          <SortDropdown
            options={sortOptions}
            selected={selectedSortOption}
            onSelect={handleOptionClick}
            open={isSortDropdownOpen}
            setOpen={setIsSortDropdownOpen}
            isMobile={isMobile}
            onOpenModal={() => setShowMobileModal(false)}
            onCloseModal={() => setShowMobileModal(true)}
          />

          <FilterButton
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            onOpenModal={() => setShowMobileModal(false)}
            onCloseModal={() => setShowMobileModal(true)}
          />
        </div>
      </div>
      {showSearchDrawer && (
        <>
          <div
            className={`fixed left-0 right-0 top-0 z-50 bg-white shadow-lg transition-transform duration-500 ease-in-out ${
              showSearchDrawer ? " " : "translate-y-full"
            }`}
          >
            <div className="h-[46px] w-full flex items-center justify-between mt-2 mb-4 px-5">
              <Link href="/">
                <Image
                  src="/assets/logo.svg"
                  alt="logo"
                  width={143}
                  height={31}
                />
              </Link>
              <button onClick={toggleSearchDrawer} aria-label="Close">
                <Image
                  src="/assets/close-circle.svg"
                  alt="close"
                  width={24}
                  height={24}
                />
              </button>
            </div>
            <div className="pb-[22px]">
              <SearchBar
                setShowSearchDrawer={setShowSearchDrawer}
                onLocationChange={setLocation}
                onCheckRates={() => {
                  // Notify parent first so it can trigger gated refetch
                  if (onCheckRates) onCheckRates();
                  setShowSearchDrawer(false);
                  setTimeout(() => {
                    // Only show mobile modal if map card is not open
                    if (!isMapCardOpen) {
                      setShowMobileModal(true);
                    }
                  }, 300);
                }}
                onAmountCurrencyChange={onAmountCurrencyChange}
                onCurrencyDropdownChange={setIsCurrencyDropdownOpen}
              />
            </div>
          </div>
          <div
            className="fixed inset-0 z-40 bg-black/40 transition-opacity duration-300"
            onClick={toggleSearchDrawer}
          />
        </>
      )}

      {showMobileModal && !isMapCardOpen && !isCurrencyDropdownOpen && (
        <MobileExchangeCardModal
          onClose={() => setShowMobileModal(false)}
          cityOffices={cityOffices}
          filteredOffices={filteredOffices}
          resultCount={resultCount}
        />
      )}
    </Suspense>
  );
};
export default MobileHeader;
