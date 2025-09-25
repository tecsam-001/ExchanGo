import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import FilterButton from "./FilterButton";
import WhatsAppAlertModal from "../WhatsappAlert/WhatsAppAlertModal";
import SortDropdown from "./SortDropdown";

interface FilterState {
  selectedCurrencies: string[];
  selectedTrends: string[];
  showOpenOfficesOnly: boolean;
}

interface FilterSortProps {
  count?: number;
  location?: string;
  lastUpdate?: string;
  onSort?: (option: string) => void;
  onClearFilters?: () => void;
  cityOffices?: {
    cityInfo: {
      totalOffices: number;
      name: string;
    };
    totalCount?: number;
  } | null;
  onApplyFilters: (filters: FilterState) => void;
}

const FilterSort: React.FC<FilterSortProps> = ({
  count = 8,
  location = "",
  lastUpdate = "just now",
  onSort,
  onClearFilters,
  cityOffices,
  onApplyFilters,
}) => {
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const [selectedSortOption, setSelectedSortOption] = useState<string | null>(
    null
  );
  const sortButtonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const [isHeheDropdownOpen, setIsHeheDropdownOpen] = useState(false);
  const heheButtonRef = useRef<HTMLButtonElement>(null);
  const heheDropdownRef = useRef<HTMLDivElement>(null);

  const [city, setCity] = useState(location || "");
  const [resultCount, setResultCount] = useState(count || 0);
  const [lastUpdateDisplay, setLastUpdateDisplay] = useState("just now");
  const lastUpdateTimeRef = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (location) {
      setCity(location);
    }
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        sortButtonRef.current &&
        !sortButtonRef.current.contains(event.target as Node)
      ) {
        setIsSortDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef, sortButtonRef]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutsideHehe = (event: MouseEvent) => {
      if (
        heheDropdownRef.current &&
        !heheDropdownRef.current.contains(event.target as Node) &&
        heheButtonRef.current &&
        !heheButtonRef.current.contains(event.target as Node)
      ) {
        setIsHeheDropdownOpen(false);
      }
    };
    if (isHeheDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutsideHehe);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutsideHehe);
    };
  }, [isHeheDropdownOpen]);

  useEffect(() => {
    const handleLocationChanged = (event: any) => {
      if (event.detail && event.detail.name) {
        setCity(event.detail.name);
        setLastUpdateDisplay("just now");
        lastUpdateTimeRef.current = Date.now();
      }
    };
    window.addEventListener("userLocationChanged", handleLocationChanged);
    window.addEventListener("mapLocationChanged", handleLocationChanged);
    return () => {
      window.removeEventListener("userLocationChanged", handleLocationChanged);
      window.removeEventListener("mapLocationChanged", handleLocationChanged);
    };
  }, []);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const diff = Math.floor((Date.now() - lastUpdateTimeRef.current) / 60000);
      if (diff === 0) setLastUpdateDisplay("just now");
      else if (diff === 1) setLastUpdateDisplay("1 min ago");
      else setLastUpdateDisplay(`${diff} min ago`);
    }, 1000 * 10); // update every 10 seconds for demo, use 60000 for 1 min
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    setCity(location || "");
    setResultCount(
      cityOffices?.totalCount ||
        cityOffices?.cityInfo?.totalOffices ||
        count ||
        0
    );
  }, [location, cityOffices, count]);

  const handleOptionClick = (option: string) => {
    setSelectedSortOption(option);
    setIsSortDropdownOpen(false);
    if (onSort) {
      onSort(option);
    }
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

  const toggleAlertModal = () => {
    setIsAlertModalOpen(!isAlertModalOpen);
  };

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-[#585858] text-[14px] leading-[20px] font-normal">
          Showing{" "}
          <span className="text-[#20523C] font-bold">
            {cityOffices?.totalCount ||
              cityOffices?.cityInfo?.totalOffices ||
              "0"}
          </span>{" "}
          Exchange office listing in{" "}
          <span className="text-[#20523C] font-bold">
            {cityOffices?.cityInfo?.name || "Casablanca"}
          </span>
        </h3>

        <div className="flex items-center gap-3 mt-2 sm:mt-0">
          <h3 className="text-[#585858] text-[14px] leading-[20px] font-normal">
            Last update{" "}
            <span className="text-[#20523C] font-bold">
              {lastUpdateDisplay}
            </span>
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <FilterButton
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
          />

          <SortDropdown
            options={[
              "Highest to Lowest Rate",
              "Geographic proximity",
              "Currently open/closed",
            ]}
            selected={selectedSortOption}
            onSelect={handleOptionClick}
            open={isSortDropdownOpen}
            setOpen={setIsSortDropdownOpen}
            isMobile={isMobile}
          />

          <div className="relative">
            <button
              ref={heheButtonRef}
              onClick={() => setIsHeheDropdownOpen((prev) => !prev)}
              className="cursor-pointer border border-[#20523C] h-[46px] rounded-lg px-[11px] flex items-center gap-2 hover:bg-gray-100 transition-colors duration-300"
              title="Set Rate Alert"
              type="button"
            >
              <Image
                src="/assets/Rate Alert 4.svg"
                alt="Rate Alert"
                width={24}
                height={24}
              />
            </button>
            {isHeheDropdownOpen && (
              <div
                ref={heheDropdownRef}
                className="absolute right-0 top-[44px] z-40 bg-white rounded w-[137px] px-2 py-1.5"
                style={{ boxShadow: "0px 0px 24px 0px #00000014" }}
              >
                <button
                  className="text-[#111111] text-[14px] leading-[18px] font-normal cursor-pointer"
                  onClick={() => {
                    setIsHeheDropdownOpen(false);
                    toggleAlertModal();
                  }}
                >
                  Create a rate alert via WhatsApp
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* WhatsApp Alert Modal */}
      <WhatsAppAlertModal
        isOpen={isAlertModalOpen}
        onClose={toggleAlertModal}
        exchangeName="the selected exchange"
      />
    </>
  );
};

export default FilterSort;
