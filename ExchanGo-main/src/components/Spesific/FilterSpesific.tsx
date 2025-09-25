"use client";
import React, { useState, useEffect } from "react";
import Checkbox from "../ui/Checkbox";
import { ExchangeOffice } from "@/components/ResultsPage/types";

interface FilterState {
  selectedCurrencies: string[];
  selectedTrends: string[];
  showOpenOfficesOnly: boolean;
}

interface FilterSpesificProps {
  cityOffices: {
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
  filters: FilterState;
  onApplyFilters: (filters: FilterState) => void;
  onClearFilters: () => void;
}

const TREND_FILTERS = [
  { label: "Popular Exchange", value: "popular", icon: "🔥" },
  { label: "Most Searched", value: "searched", icon: "⚡" },
  { label: "Nearest office", value: "nearest", icon: "📍" },
];

const FilterSpesific: React.FC<FilterSpesificProps> = ({
  cityOffices,
  filters,
  onApplyFilters,
  onClearFilters,
}) => {
  const [showAll, setShowAll] = useState<boolean>(false);

  // Extract available currencies from API data using rates.targetCurrency.code
  const availableCurrencies = React.useMemo(() => {
    if (!cityOffices?.offices) return [];

    const currencies = new Set<string>();

    cityOffices.offices.forEach((office) => {
      if (office.rates && Array.isArray(office.rates)) {
        office.rates.forEach((rate) => {
          if (rate.targetCurrency?.code) {
            currencies.add(rate.targetCurrency.code);
          }
        });
      }
    });

    return Array.from(currencies).sort();
  }, [cityOffices]);

  const visibleCurrencies = showAll
    ? availableCurrencies
    : availableCurrencies.slice(0, 10);

  const handleCurrencyClick = (currency: string) => {
    const newFilters = {
      ...filters,
      selectedCurrencies: filters.selectedCurrencies.includes(currency)
        ? filters.selectedCurrencies.filter((c) => c !== currency)
        : [...filters.selectedCurrencies, currency],
    };
    onApplyFilters(newFilters);
  };

  const handleTrendClick = (trendValue: string) => {
    const newFilters = {
      ...filters,
      selectedTrends: filters.selectedTrends.includes(trendValue)
        ? filters.selectedTrends.filter((t) => t !== trendValue)
        : [trendValue], // Only allow one trend at a time
    };
    onApplyFilters(newFilters);
  };

  const handleOpenOfficesChange = (checked: boolean) => {
    const newFilters = {
      ...filters,
      showOpenOfficesOnly: checked,
    };
    onApplyFilters(newFilters);
  };

  const handleClearAll = () => {
    const clearedFilters: FilterState = {
      selectedCurrencies: [],
      selectedTrends: [],
      showOpenOfficesOnly: false,
    };
    onClearFilters();
  };

  return (
    <div className="w-[200px] xl:w-[292px]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[#111111] text-[20px] leading-[24px] font-bold">
          Filter
        </h2>
        <button
          className="text-[#20523C] text-[14px] leading-[20px] font-bold transition duration-200 hover:underline cursor-pointer"
          onClick={handleClearAll}
        >
          Clear All
        </button>
      </div>

      {/* By Available Currencies */}
      <div className="mb-8">
        <h3 className="text-[#111111] text-[16px] leading-[16px] font-bold mb-4">
          By Available Currencies ({availableCurrencies.length})
        </h3>
        {availableCurrencies.length > 0 ? (
          <div className="flex items-center flex-wrap gap-1.5">
            {visibleCurrencies.map((currency) => (
              <button
                key={currency}
                className={`px-3 py-2 cursor-pointer rounded-full border text-[14px] leading-[17px] font-normal transition
                  ${
                    filters.selectedCurrencies.includes(currency)
                      ? "bg-[#20523C] border-[#20523C] text-white"
                      : "text-[#111111] border-[#DEDEDE] hover:border-[#20523C]"
                  }
                `}
                onClick={() => handleCurrencyClick(currency)}
                type="button"
              >
                {currency}
              </button>
            ))}
            {availableCurrencies.length > 10 && (
              <button
                className="px-3 py-2 rounded-full cursor-pointer border border-[#DEDEDE] bg-[#F1F1F1] text-[14px] leading-[17px] font-normal text-[#585858] hover:bg-gray-200"
                onClick={() => setShowAll((s) => !s)}
                type="button"
              >
                {showAll ? "Show less" : "Show more"}
              </button>
            )}
          </div>
        ) : (
          <p className="text-[#585858] text-[14px] leading-[17px] font-normal">
            No currencies available
          </p>
        )}
      </div>

      {/* By Trend */}
      <div className="mb-8">
        <h3 className="text-[#111111] text-[16px] leading-[16px] font-bold mb-4">
          By Trend
        </h3>
        <div className="flex flex-col gap-1.5">
          {TREND_FILTERS.map((trend) => (
            <button
              key={trend.value}
              className={`w-fit cursor-pointer flex items-center px-3 py-2 rounded-full border text-[14px] leading-[17px] font-normal transition
                ${
                  filters.selectedTrends.includes(trend.value)
                    ? `bg-[#20523C] border-[#20523C] text-white`
                    : `border-[#DEDEDE] text-[#111111] hover:border-[#20523C]`
                }
              `}
              onClick={() => handleTrendClick(trend.value)}
              type="button"
            >
              {trend.icon && (
                <span role="img" aria-label={trend.label} className="mr-1">
                  {trend.icon}
                </span>
              )}
              {trend.label}
            </button>
          ))}
        </div>
      </div>

      {/* By Office Hour */}
      <div>
        <h3 className="text-[#111111] text-[16px] leading-[16px] font-bold mb-4">
          By Office Hour
        </h3>
        <div className="flex items-center gap-2.5">
          <Checkbox
            checked={filters.showOpenOfficesOnly}
            onChange={handleOpenOfficesChange}
          />
          <h3 className="text-[#111111] text-[16px] leading-[16px] font-normal text-left">
            Show only currently open offices
          </h3>
        </div>
      </div>
    </div>
  );
};

export default FilterSpesific;
