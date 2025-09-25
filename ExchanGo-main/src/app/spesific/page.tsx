"use client";
import React, { Suspense, useEffect, useState, useRef } from "react";
import BestDealsAreWaiting from "@/components/BestDealsAreWaiting";
import Footer from "@/components/Footer";
import InfiniteExchangeList from "@/components/ResultsPage/InfiniteExchangeList";
import CurrencyExchangeRabat from "@/components/Spesific/CurrencyExchangeRabat";
import FAQSpesific from "@/components/Spesific/FAQSpesific";
import FilterSpesific from "@/components/Spesific/FilterSpesific";
import Hero from "@/components/Spesific/Hero";
import Why from "@/components/Spesific/Why";
import Image from "next/image";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import SortDropdown from "@/components/ResultsPage/Filters/SortDropdown";
import WhatsAppAlertModal from "@/components/ResultsPage/WhatsappAlert/WhatsAppAlertModal";
import { HoverProvider } from "@/context/HoverContext";
import api from "@/services/api";
import { ExchangeOffice } from "@/components/ResultsPage/types";

// Define filter state interface
interface FilterState {
  selectedCurrencies: string[];
  selectedTrends: string[];
  showOpenOfficesOnly: boolean;
}

function SpesificContent() {
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);

  // Desktop Dropdown State and Refs
  const [isDesktopDropdownOpen, setIsDesktopDropdownOpen] = useState(false);
  const desktopButtonRef = useRef<HTMLButtonElement>(null);
  const desktopDropdownRef = useRef<HTMLDivElement>(null);

  // Mobile Dropdown State and Refs
  const [isMobileDropdownOpen, setIsMobileDropdownOpen] = useState(false);
  const mobileButtonRef = useRef<HTMLButtonElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize city from URL on mount
  const [city, setCity] = useState<string>("Casablanca");
  const [isInitialized, setIsInitialized] = useState(false);

  // Hydrate from URL once on mount, then react to searchParams changes
  useEffect(() => {
    const sp =
      typeof window !== "undefined"
        ? new URLSearchParams(window.location.search)
        : null;
    const initialCity =
      sp?.get("city") || searchParams.get("city") || "Casablanca";
    setCity(initialCity);
    setIsInitialized(true);
  }, []);

  useEffect(() => {
    const nextCity = searchParams.get("city");
    if (nextCity && nextCity !== city) {
      setCity(nextCity);
    }
  }, [searchParams, city]);
  const [resultCount, setResultCount] = useState(0);
  const [lastUpdate, setLastUpdate] = useState("just now");
  const lastUpdateTimeRef = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [selectedSortOption, setSelectedSortOption] = useState<string | null>(
    null
  );
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const sortButtonRef = useRef<HTMLButtonElement | null>(null);

  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // API integration state
  const [filteredOffices, setFilteredOffices] = useState<ExchangeOffice[]>([]);
  const [cityOffices, setCityOffices] = useState<{
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
  } | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    selectedCurrencies: [],
    selectedTrends: [],
    showOpenOfficesOnly: false,
  });

  const toggleAlertModal = () => {
    setIsAlertModalOpen(!isAlertModalOpen);
  };

  const handleOptionClick = (option: string) => {
    setSelectedSortOption(option);
    setIsSortDropdownOpen(false);
  };

  // Function to sort offices based on the selected option
  const sortOffices = (offices: ExchangeOffice[], option: string) => {
    const sortedOffices = [...offices];

    if (option === "Highest to Lowest Rate") {
      sortedOffices.sort((a, b) => {
        // Get the first available rate from the rates array
        const rateA =
          a.rates && a.rates.length > 0
            ? parseFloat(a.rates[0].buyRate || "0")
            : 0;
        const rateB =
          b.rates && b.rates.length > 0
            ? parseFloat(b.rates[0].buyRate || "0")
            : 0;
        return rateB - rateA; // Descending order
      });
    } else if (option === "Geographic proximity") {
      // Sort by distance
      sortedOffices.sort((a, b) => (a.distance || 999) - (b.distance || 999));
    } else if (option === "Currently open/closed") {
      // Sort by open status - open offices first
      sortedOffices.sort((a, b) => {
        if (a.isCurrentlyOpen && !b.isCurrentlyOpen) return -1;
        if (!a.isCurrentlyOpen && b.isCurrentlyOpen) return 1;
        return 0;
      });
    }

    return sortedOffices;
  };

  // Update filtered offices and count when location changes or filters are applied
  useEffect(() => {
    // Get base offices from API data or use empty array
    let offices = cityOffices?.offices ? [...cityOffices.offices] : [];

    // Apply filters
    if (filters.selectedCurrencies.length > 0) {
      // Filter by available currencies from rates.targetCurrency.code
      offices = offices.filter((office) => {
        if (!office.rates || !Array.isArray(office.rates)) return false;

        const officeCurrencies = office.rates
          .map((rate) => rate.targetCurrency?.code)
          .filter(Boolean);

        return filters.selectedCurrencies.some((currency) =>
          officeCurrencies.includes(currency)
        );
      });
    }

    if (filters.selectedTrends.includes("popular")) {
      offices = offices.filter((office) => office.isPopular === true);
    }

    if (filters.selectedTrends.includes("searched")) {
      // Sort by search count and take top 5
      offices = [...offices]
        .sort((a, b) => (b.searchCount || 0) - (a.searchCount || 0))
        .slice(0, 5);
    }

    if (filters.selectedTrends.includes("nearest")) {
      // Sort by distance and take closest 7
      offices = [...offices]
        .sort((a, b) => (a.distance || 999) - (b.distance || 999))
        .slice(0, 7);
    }

    if (filters.showOpenOfficesOnly) {
      // Filter for currently open offices
      offices = offices.filter((office) => office.isCurrentlyOpen === true);
    }

    // Apply sorting if a sort option is selected
    if (selectedSortOption) {
      offices = sortOffices(offices, selectedSortOption);
    }

    setFilteredOffices(offices);
    setResultCount(offices.length);
  }, [cityOffices, selectedSortOption, filters]);

  // Function to fetch city offices data
  const fetchCityOfficesData = async (
    cityName: string,
    sourceCurrency: string = "EUR",
    targetCurrency: string = "MAD"
  ) => {
    setIsLoading(true);
    try {
      const data = await api.fetchCityOffices({
        cityName: cityName.toLowerCase(),
        baseCurrency: sourceCurrency,
        targetCurrency: targetCurrency,
        isActive: false,
        page: 1,
        limit: 1000, // Fetch all offices at once
        trend:
          filters.selectedTrends.length > 0
            ? (filters.selectedTrends[0] as
                | "featured"
                | "verified"
                | "newest")
            : undefined,
        showOnlyOpenNow: filters.showOpenOfficesOnly,
      });

      setCityOffices(data);
      setResultCount(data.totalCount || data.offices.length || 0);
    } catch (error) {
      console.error("Error fetching city offices:", error);
      setCityOffices(null);
      setResultCount(0);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch city offices data when city changes (only after init)
  useEffect(() => {
    if (!isInitialized || !city) return;
    fetchCityOfficesData(city);
  }, [city, filters.showOpenOfficesOnly, isInitialized]);

  // Handle CheckRates callback from Hero component
  const handleCheckRates = (params: {
    source: string;
    target: string;
    amount: string;
    location: string;
    lat?: number;
    lng?: number;
  }) => {
    // Update city if location changed
    if (params.location !== city) {
      setCity(params.location);
    }
    
    // Fetch new data with the selected currencies
    fetchCityOfficesData(params.location, params.source, params.target);
    
    // Update last update time
    setLastUpdate("just now");
    lastUpdateTimeRef.current = Date.now();
  };

  // Click outside for Desktop Dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        desktopDropdownRef.current &&
        !desktopDropdownRef.current.contains(event.target as Node) &&
        desktopButtonRef.current &&
        !desktopButtonRef.current.contains(event.target as Node)
      ) {
        setIsDesktopDropdownOpen(false);
      }
    };
    if (isDesktopDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDesktopDropdownOpen]);

  // Click outside for Mobile Dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileDropdownRef.current &&
        !mobileDropdownRef.current.contains(event.target as Node) &&
        mobileButtonRef.current &&
        !mobileButtonRef.current.contains(event.target as Node)
      ) {
        setIsMobileDropdownOpen(false);
      }
    };
    if (isMobileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isMobileDropdownOpen]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

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
    if (isSortDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSortDropdownOpen]);

  useEffect(() => {
    const handleUserLocationChanged = (event: any) => {
      if (event.detail && event.detail.name) {
        const newCityName = event.detail.name;
        setCity(newCityName);
        setLastUpdate("just now");
        lastUpdateTimeRef.current = Date.now();
        
        // Update URL parameters when map location changes
        const currentParams = new URLSearchParams(window.location.search);
        currentParams.set("city", newCityName);
        
        // Update the URL without navigation
        const newUrl = `${window.location.pathname}?${currentParams.toString()}`;
        window.history.pushState({}, "", newUrl);
      }
    };
    window.addEventListener("mapLocationChanged", handleUserLocationChanged);
    return () =>
      window.removeEventListener(
        "mapLocationChanged",
        handleUserLocationChanged
      );
  }, []);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const diff = Math.floor((Date.now() - lastUpdateTimeRef.current) / 60000);
      if (diff === 0) setLastUpdate("just now");
      else if (diff === 1) setLastUpdate("1 min ago");
      else setLastUpdate(`${diff} min ago`);
    }, 1000 * 10);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <>
      <div className="w-full">
        <Hero city={city} onCheckRates={handleCheckRates} />
        <div className="pt-[52px] pb-[30px] md:py-[100px] md:px-8 px-5">
          <div className="max-w-[1240px] mx-auto w-full flex items-start justify-between gap-6">
            <div className="sticky top-4 lg:block hidden">
              <FilterSpesific
                cityOffices={cityOffices}
                filters={filters}
                onApplyFilters={setFilters}
                onClearFilters={() => {
                  setFilters({
                    selectedCurrencies: [],
                    selectedTrends: [],
                    showOpenOfficesOnly: false,
                  });
                }}
              />
            </div>

            <div className="w-full">
              <div className="w-full mb-6 sm:mb-8">
                <h1 className="text-[#111111] text-[24px] sm:text-[32px] font-bold leading-[29px] sm:leading-[38px] mb-4 sm:mb-2">
                  Some exchange offices in {city}
                </h1>
                {/* Mobile */}
                <div className="w-full lg:hidden flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[#585858] text-[11px] sm:text-[14px] font-normal leading-[15px] sm:leading-[20px]">
                      Showing{" "}
                      <span className="text-[#20523C] font-bold">
                        {resultCount}
                      </span>{" "}
                      Exchange office listing in{" "}
                      <span className="text-[#20523C] font-bold">{city}</span>
                    </p>
                    <h3 className="text-[#585858] text-[11px] sm:text-[14px] font-normal leading-[15px] sm:leading-[20px] mt-1">
                      Last update{" "}
                      <span className="text-[#20523C] font-bold">
                        {lastUpdate}
                      </span>
                    </h3>
                  </div>
                  <div className="relative">
                    <button
                      ref={mobileButtonRef}
                      onClick={() => setIsMobileDropdownOpen((prev) => !prev)}
                      className="cursor-pointer"
                      title="Set Rate Alert"
                      type="button"
                    >
                      <Image
                        src="/assets/whatsapp-mobile-alert.svg"
                        alt="Rate Alert"
                        width={24}
                        height={24}
                      />
                    </button>
                    {isMobileDropdownOpen && (
                      <div
                        ref={mobileDropdownRef}
                        className="absolute right-0 top-[30px] z-40 bg-white rounded w-[137px] px-2 py-1.5"
                        style={{ boxShadow: "0px 0px 24px 0px #00000014" }}
                      >
                        <button
                          className="text-[#111111] text-[14px] leading-[18px] font-normal cursor-pointer"
                          onClick={() => {
                            setIsMobileDropdownOpen(false);
                            toggleAlertModal();
                          }}
                        >
                          Create a rate alert via WhatsApp
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Desktop */}
                <div className="w-full hidden lg:flex items-center justify-between gap-4">
                  <p className="text-[#585858] text-[11px] sm:text-[14px] font-normal leading-[15px] sm:leading-[20px]">
                    Showing{" "}
                    <span className="text-[#20523C] font-bold">
                      {resultCount}
                    </span>{" "}
                    Exchange office listing in{" "}
                    <span className="text-[#20523C] font-bold">{city}</span>
                  </p>
                  <div className="flex items-center justify-between gap-6">
                    <h3 className="text-[#585858] text-[11px] sm:text-[14px] font-normal leading-[15px] sm:leading-[20px] mt-1">
                      Last update{" "}
                      <span className="text-[#20523C] font-bold">
                        {lastUpdate}
                      </span>
                    </h3>
                    <div className="flex items-center gap-2">
                      {/* Sort */}
                      <div ref={dropdownRef}>
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
                      </div>
                      {/* Whatsapp */}
                      <div className="relative">
                        <button
                          ref={desktopButtonRef}
                          onClick={() =>
                            setIsDesktopDropdownOpen((prev) => !prev)
                          }
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
                        {isDesktopDropdownOpen && (
                          <div
                            ref={desktopDropdownRef}
                            className="absolute right-0 top-[44px] z-40 bg-white rounded w-[137px] px-2 py-1.5"
                            style={{ boxShadow: "0px 0px 24px 0px #00000014" }}
                          >
                            <button
                              className="text-[#111111] text-[14px] leading-[18px] font-normal cursor-pointer"
                              onClick={() => {
                                setIsDesktopDropdownOpen(false);
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
                </div>
              </div>
              <InfiniteExchangeList
                cityOffices={cityOffices}
                filteredOffices={filteredOffices}
                baseAmount="1"
                sourceCurrency="EUR"
                targetCurrency="MAD"
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
        <Why city={city} />
        <FAQSpesific city={city} />
        <CurrencyExchangeRabat />
        <BestDealsAreWaiting />
        <Footer />
      </div>
      {/* WhatsApp Alert Modal */}
      <WhatsAppAlertModal
        isOpen={isAlertModalOpen}
        onClose={toggleAlertModal}
        exchangeName="the selected exchange"
      />
    </>
  );
}

export default function Spesific() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HoverProvider>
        <SpesificContent />
      </HoverProvider>
    </Suspense>
  );
}
