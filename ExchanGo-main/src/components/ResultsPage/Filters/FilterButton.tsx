"use client";
import Checkbox from "@/components/ui/Checkbox";
import GradientButton from "@/components/ui/GradientButton";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { FilterState } from "../types";

interface FilterModalProps {
  onApplyFilters?: (filters: FilterState) => void;
  onClearFilters?: () => void;
  onOpenModal?: () => void;
  onCloseModal?: () => void;
}

const AVAILABLE_CURRENCIES = [
  "USD",
  "EUR",
  "AUD",
  "CAD",
  "GBP",
  "CHF",
  "SAR",
  "QAR",
];
const ADDITIONAL_CURRENCIES = [
  "KWD",
  "CNY",
  "TRY",
  "JPY",
  "NOK",
  "KRW",
  "RUB",
  "INR",
];
const TREND_OPTIONS = [
  { id: "featured", label: "🔥Popular Exchange" },
  { id: "verified", label: "✅Verified Offices" },
  { id: "newest", label: "🆕Newest Offices" },
];

const FilterButton: React.FC<FilterModalProps> = ({
  onApplyFilters,
  onClearFilters,
  onOpenModal,
  onCloseModal,
}) => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCurrencies, setSelectedCurrencies] = useState<string[]>([]);
  const [selectedTrends, setSelectedTrends] = useState<string[]>([]);
  const [showOpenOfficesOnly, setShowOpenOfficesOnly] =
    useState<boolean>(false);
  const [showMoreCurrencies, setShowMoreCurrencies] = useState<boolean>(false);

  useEffect(() => {
    const style = document.createElement("style");
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const closeModal = (): void => {
    setIsModalOpen(false);
    if (onCloseModal) {
      onCloseModal();
    }
  };

  const handleCurrencyToggle = (currency: string): void => {
    setSelectedCurrencies((prev) =>
      prev.includes(currency)
        ? prev.filter((c) => c !== currency)
        : [...prev, currency]
    );
  };

  const handleTrendToggle = (trendId: string): void => {
    setSelectedTrends((prev) =>
      prev.includes(trendId)
        ? prev.filter((t) => t !== trendId)
        : [...prev, trendId]
    );
  };

  const handleCheckboxChange = (checked: boolean): void => {
    setShowOpenOfficesOnly(checked);
  };

  const handleClearAll = (): void => {
    setSelectedCurrencies([]);
    setSelectedTrends([]);
    setShowOpenOfficesOnly(false);
    setShowMoreCurrencies(false);
    if (onClearFilters) {
      onClearFilters();
    }
  };

  const handleApplyFilters = (): void => {
    const filters: FilterState = {
      selectedCurrencies,
      selectedTrends,
      showOpenOfficesOnly,
    };
    if (onApplyFilters) {
      onApplyFilters(filters);
    }
    closeModal();
  };

  const toggleMoreCurrencies = (): void => {
    setShowMoreCurrencies((prev) => !prev);
  };

  const getCurrencyButtonClass = (currency: string): string => {
    const baseClass =
      "border rounded-[1000px] py-2.5 sm:py-3 px-3 sm:px-4 text-[12px] sm:text-[14px] leading-[14px] sm:leading-[17px] font-normal cursor-pointer transition duration-200";
    return selectedCurrencies.includes(currency)
      ? `${baseClass} border-[#20523C] bg-[#20523C] text-white`
      : `${baseClass} border-[#DEDEDE] text-[#111111] hover:border-[#111111]`;
  };

  const getTrendButtonClass = (trendId: string): string => {
    const baseClass =
      "py-2.5 sm:py-3 px-3 border rounded-[1000px] text-[12px] sm:text-[14px] font-normal leading-[14px] sm:leading-[17px] cursor-pointer transition duration-200";
    return selectedTrends.includes(trendId)
      ? `${baseClass} border-[#20523C] bg-[#20523C] text-white`
      : `${baseClass} border-[#DEDEDE] text-[#111111] hover:border-[#20523C]`;
  };

  const getActiveFiltersCount = (): number => {
    return (
      selectedCurrencies.length +
      selectedTrends.length +
      (showOpenOfficesOnly ? 1 : 0)
    );
  };

  return (
    <div>
      <button
        onClick={() => {
          setIsModalOpen(true);
          if (onOpenModal) {
            onOpenModal();
          }
        }}
        className="lg:border border-[#20523C] cursor-pointer lg:px-5 h-[46px] flex items-center justify-center gap-2 rounded-lg lg:hover:bg-gray-100 transition-colors duration-300 relative"
      >
        <h4 className="text-[#20523C] text-[16px] leading-[22px] font-medium lg:block hidden">
          Filter
        </h4>
        {getActiveFiltersCount() > 0 && (
          <span className="bg-[#D0E500] text-[#20523C] text-[11px] leading-[15px] font-medium rounded-full min-h-5 min-w-5 hidden lg:flex items-center justify-center">
            {getActiveFiltersCount()}
          </span>
        )}
        {getActiveFiltersCount() > 0 && (
          <span className="bg-[#D0E500] text-[#20523C] text-[8px] leading-[10px] font-medium rounded-full min-h-3 min-w-3 lg:hidden flex items-center justify-center absolute top-2 -right-0.5">
            {getActiveFiltersCount()}
          </span>
        )}
        <svg
          width="25"
          height="25"
          viewBox="0 0 25 25"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.80887 2.12915H19.1912C20.3064 2.12915 21.2188 3.04158 21.2188 4.15677V6.38716C21.2188 7.1982 20.7119 8.21202 20.205 8.71892L15.8456 12.5714C15.2373 13.0783 14.8318 14.0921 14.8318 14.9032V19.2626C14.8318 19.8708 14.4263 20.6819 13.9194 20.986L12.5 21.8985C11.1821 22.7095 9.35721 21.7971 9.35721 20.175V14.8018C9.35721 14.0921 8.95169 13.1797 8.54616 12.6728L4.69368 8.61754C4.18677 8.11063 3.78125 7.1982 3.78125 6.58992V4.25815C3.78125 3.04158 4.69368 2.12915 5.80887 2.12915Z"
            stroke="#20523C"
            strokeWidth="1.52072"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M11.42 2.12915L6.42188 10.1383"
            stroke="#20523C"
            strokeWidth="1.52072"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end lg:items-center justify-center z-[500000000000]"
          onClick={closeModal}
        >
          <div
            className="bg-white mobile-modal rounded-[16px] w-full lg:w-[529px] relative max-h-[90vh] overflow-y-auto slide-up-enter"
            onClick={(e) => e.stopPropagation()}
          >
            <button className="bg-[#E3E3E3] cursor-pointer w-[42px] h-[5px] rounded-full mt-2 max-w-full mx-auto mb-3 sm:hidden block"></button>
            <div className="px-5 md:px-10 sm:py-[18px] flex items-center justify-between gap-4 sm:border-b border-[#DEDEDE] sticky top-0 bg-white rounded-t-[20px] md:rounded-t-[16px]">
              <h2
                onClick={closeModal}
                className="text-[#111111] text-[16px] sm:text-[20px] leading-[19px] sm:leading-[24px] font-bold"
              >
                Filter
              </h2>
              <button
                onClick={closeModal}
                className="cursor-pointer sm:block hidden"
              >
                <Image
                  src="/assets/close-circle.svg"
                  alt="close"
                  height={24}
                  width={24}
                />
              </button>
              <button
                onClick={handleClearAll}
                className="cursor-pointer block sm:hidden text-[#20523C] text-[14px] font-bold leading-[20px]"
                disabled={getActiveFiltersCount() === 0}
              >
                Clear All
              </button>
            </div>

            <div className="px-5 md:px-10 py-2 sm:py-8 space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-[#111111] text-[14px] sm:text-[16px] font-medium sm:font-bold leading-[14px] sm:leading-[16px] mb-2 sm:mb-4">
                  By Available Currencies
                  {selectedCurrencies.length > 0 && (
                    <span className="ml-2 text-[#20523C] text-sm leading-[14px] sm:leading-[16px] font-normal">
                      ({selectedCurrencies.length} selected)
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                  {AVAILABLE_CURRENCIES.map((currency) => (
                    <button
                      key={currency}
                      onClick={() => handleCurrencyToggle(currency)}
                      className={getCurrencyButtonClass(currency)}
                    >
                      {currency}
                    </button>
                  ))}
                  {showMoreCurrencies &&
                    ADDITIONAL_CURRENCIES.map((currency) => (
                      <button
                        key={currency}
                        onClick={() => handleCurrencyToggle(currency)}
                        className={getCurrencyButtonClass(currency)}
                      >
                        {currency}
                      </button>
                    ))}
                  <button
                    onClick={toggleMoreCurrencies}
                    className="cursor-pointer border border-[#DEDEDE] bg-[#F1F1F1] rounded-[1000px] py-2.5 sm:py-3 px-3 sm:px-4 text-[#585858] text-[12px] sm:text-[14px] leading-[14px] sm:leading-[17px] font-normal flex items-center gap-1 hover:bg-[#E5E5E5] transition-colors"
                  >
                    {!showMoreCurrencies ? (
                      <>
                        <svg
                          width="17"
                          height="17"
                          viewBox="0 0 17 17"
                          className="min-w-[16.22px]"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M3.37891 8.5H12.8411"
                            stroke="#292D32"
                            strokeWidth="1.01381"
                            strokeLinecap="round"
                          />
                          <path
                            d="M8.11328 13.231V3.7688"
                            stroke="#292D32"
                            strokeWidth="1.01381"
                            strokeLinecap="round"
                          />
                        </svg>
                        More
                      </>
                    ) : (
                      "Show Less"
                    )}
                  </button>
                </div>
              </div>

              <div>
                <h3 className="text-[#111111] text-[14px] sm:text-[16px] font-medium sm:font-bold leading-[14px] sm:leading-[16px] mb-2 sm:mb-4">
                  By Trend
                  {selectedTrends.length > 0 && (
                    <span className="ml-2 text-[#20523C] text-sm leading-[14px] sm:leading-[16px] font-normal">
                      ({selectedTrends.length} selected)
                    </span>
                  )}
                </h3>
                <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                  {TREND_OPTIONS.map((trend) => (
                    <button
                      key={trend.id}
                      onClick={() => handleTrendToggle(trend.id)}
                      className={getTrendButtonClass(trend.id)}
                    >
                      {trend.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-[#111111] text-[14px] sm:text-[16px] font-medium sm:font-bold leading-[14px] sm:leading-[16px] mb-2 sm:mb-4">
                  Office Hour
                </h3>
                <div className="flex items-center gap-2.5">
                  <Checkbox
                    checked={showOpenOfficesOnly}
                    onChange={handleCheckboxChange}
                  />
                  <h3 className="text-[#111111] text-[14px] sm:text-[16px] leading-[20px] sm:leading-[16px] font-normal text-left">
                    Show only currently open offices
                  </h3>
                </div>
              </div>
            </div>

            <div className="px-5 md:px-10 pb-4 sm:py-5 flex items-center justify-between sm:border-t border-[#DEDEDE] sticky bottom-0 bg-white">
              <button
                onClick={handleClearAll}
                className="border cursor-pointer border-[#20523C] text-[#20523C] hover:text-white text-[16px] leading-[22px] font-medium px-5 h-[40px] sm:h-[46px] hidden sm:flex items-center justify-center rounded-lg transition duration-200 hover:bg-[#20523C]"
                disabled={getActiveFiltersCount() === 0}
              >
                Clear All
              </button>
              <GradientButton
                onClick={handleApplyFilters}
                className="w-full sm:w-fit"
              >
                Apply
              </GradientButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterButton;
