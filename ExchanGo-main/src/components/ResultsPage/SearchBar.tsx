"use client";
import Image from "next/image";
import type React from "react";

import {
  type ChangeEvent,
  useState,
  useEffect,
  useRef,
  forwardRef,
  useMemo,
  useCallback,
} from "react";

import { currencies, type Currency } from "@/data/currencies";
import GradientButton from "../ui/GradientButton";
import mapboxgl from "mapbox-gl";
import MAPBOX_TOKEN from "../Phase1/HomePage/mapboxConfig";
import { CustomDrawer } from "../../components/ui/Drawer";
import LocationDropdown from "./SearchBar/Location";
import { motion } from "framer-motion";

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string;
  error?: string;
}

const CustomInput = forwardRef<HTMLInputElement, CustomInputProps>(
  ({ className = "", ...props }, ref) => {
    return (
      <div className="px-5 mb-4">
        <div className="w-full px-4 h-[46px] border border-[#DEDEDE] hover:border-[#20523C] transition duration-200 flex items-center gap-1 rounded-lg ">
          <Image
            src="/assets/search-normal.svg"
            alt="search-normal"
            width={17}
            height={17}
          />
          <input
            ref={ref}
            className={`w-full placeholder:text-[#585858] focus:outline-none smaller text-[#585858] text-[14px] leading-[20px] font-normal ${className}`}
            {...props}
          />
        </div>
      </div>
    );
  }
);

CustomInput.displayName = "CustomInput";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZXhjaGFuZ28yNCIsImEiOiJjbWJobzNtbXkwYzd2MmtzZ3M0Nmlhem1wIn0.WWU3U5Ur4wsdKokNEk1DZQ";

interface Location {
  id: string;
  name: string;
  country: string;
  flag: string;
  coordinates?: {
    lng: number;
    lat: number;
  };
}

const locations: Location[] = [
  {
    id: "1",
    name: "Casablanca",
    country: "Maroc",
    flag: "/assets/location-icon.svg",
    coordinates: { lng: -7.5898, lat: 33.5731 },
  },
  {
    id: "2",
    name: "Rabat",
    country: "Maroc",
    flag: "/assets/location-icon.svg",
    coordinates: { lng: -6.8498, lat: 34.0209 },
  },
  {
    id: "3",
    name: "Fès",
    country: "Maroc",
    flag: "/assets/location-icon.svg",
    coordinates: { lng: -5.0078, lat: 34.0333 },
  },
  {
    id: "4",
    name: "Tanger",
    country: "Maroc",
    flag: "/assets/location-icon.svg",
    coordinates: { lng: -5.8129, lat: 35.7595 },
  },
  {
    id: "5",
    name: "Agadir",
    country: "Maroc",
    flag: "/assets/location-icon.svg",
    coordinates: { lng: -9.5982, lat: 30.4278 },
  },
  {
    id: "6",
    name: "Marrakech",
    country: "Maroc",
    flag: "/assets/location-icon.svg",
    coordinates: { lng: -8.0083, lat: 31.6295 },
  },
];

interface CurrencyDropdownProps {
  label: string;
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  placeholder?: string;
  isOpen: boolean;
  onToggle: () => void;
  disabled?: boolean;
  filteredCurrencies?: Currency[];
}

// CurrencyDropdown
const CurrencyDropdown: React.FC<CurrencyDropdownProps> = ({
  label,
  selectedCurrency,
  onCurrencyChange,
  placeholder = "Type of search",
  isOpen,
  onToggle,
  disabled = false,
  filteredCurrencies,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use filtered currencies if provided, otherwise use all currencies
  const availableCurrencies = filteredCurrencies || currencies;

  // Use useMemo to prevent unnecessary recalculations that cause focus loss
  const filteredBySearch = useMemo(() => {
    return availableCurrencies.filter((currency) =>
      currency.code.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableCurrencies, searchTerm]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        isOpen &&
        !isMobile
      ) {
        onToggle();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onToggle, isMobile]);

  const handleSelect = useCallback(
    (currency: Currency) => {
      onCurrencyChange(currency);
      onToggle();
      setSearchTerm("");
    },
    [onCurrencyChange, onToggle]
  );

  const DropdownContent = useCallback(
    () => (
      <div
        className={`${
          isMobile
            ? "pb-4 pt-1"
            : "max-h-[238px] overflow-y-auto hide-scrollbar"
        }`}
      >
        {isMobile && (
          <div className="">
            <CustomInput
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
        )}

        <div className={isMobile ? "max-h-[180px]" : ""}>
          <div className="">
            {filteredBySearch.map((currency, index) => (
              <button
                key={currency.code}
                onClick={() => handleSelect(currency)}
                className={`w-full border-b border-[#DEDEDE] flex items-center gap-3 px-4 py-3 hover:bg-[#F1F1F1] text-left transition-colors ${
                  currency.code === selectedCurrency.code ? "bg-[#F1F1F1]" : ""
                }`}
              >
                <img
                  src={currency.flag || "/placeholder.svg"}
                  alt={currency.code}
                  className="rounded-full w-[18px] h-[18px] object-cover"
                />

                <span className="text-[#585858] text-[14px] leading-[20px] font-normal">
                  {currency.code}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    ),
    [
      isMobile,
      searchTerm,
      filteredBySearch,
      selectedCurrency.code,
      handleSelect,
    ]
  );

  // Mobile Dropdown Design
  if (isMobile) {
    return (
      <div className="relative w-full">
        <label className="absolute -top-2 left-3 z-10 bg-white px-1.5 text-[#111111] text-[12px] font-medium leading-[17px]">
          {label}
        </label>

        <div
          className="w-full flex items-center justify-between cursor-pointer rounded-[10px] px-4 min-w-[157px] h-[46px] md:h-[56px] border border-[#DEDEDE] hover:border-[#20523C] transition-colors"
          onClick={onToggle}
        >
          <div className="flex items-center gap-1.5 flex-1">
            {selectedCurrency.code !== "Type of search" && (
              <img
                src={selectedCurrency.flag || "/placeholder.svg"}
                alt={selectedCurrency.code}
                className="rounded-full w-[18px] h-[18px] object-cover"
              />
            )}
            <span className="text-[#585858] text-[14px] leading-[20px] font-normal">
              {selectedCurrency.code === "Type of search"
                ? "Type of search"
                : selectedCurrency.code}
            </span>
          </div>

          <svg
            width="19"
            height="19"
            className="transition-transform"
            viewBox="0 0 19 19"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M15.1456 6.80518L10.1881 11.7627C9.60262 12.3482 8.64457 12.3482 8.0591 11.7627L3.10156 6.80518"
              stroke="#292D32"
              strokeWidth="1.14054"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <CustomDrawer
          isOpen={isOpen}
          onClose={onToggle}
          title="Select Currency"
        >
          {DropdownContent()}
        </CustomDrawer>
      </div>
    );
  }

  // Desktop Dropdown Design
  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="absolute -top-2 left-3 z-10 bg-white px-1.5 text-[#111111] text-[12px] font-medium leading-[17px]">
        {label}
      </label>

      <div
        className={`w-full flex items-center justify-between rounded-[10px] px-4 min-w-[157px] h-[56px] transition-colors ${
          disabled
            ? "border border-[#DEDEDE] bg-gray-50 cursor-not-allowed opacity-60"
            : isOpen
            ? "border border-[#20523C] cursor-pointer"
            : "border border-[#DEDEDE] hover:border-[#20523C] cursor-pointer"
        }`}
        onClick={disabled ? undefined : onToggle}
      >
        <div className="flex items-center gap-1.5 flex-1">
          {!isOpen && selectedCurrency.code !== "Type of search" && (
            <img
              src={selectedCurrency.flag || "/placeholder.svg"}
              alt={selectedCurrency.code}
              className="rounded-full w-[18px] h-[18px] object-cover"
            />
          )}
          {isOpen ? (
            <input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 text-[14px] leading-[20px] h-full font-normal smaller text-[#585858] placeholder:text-[#585858] bg-transparent outline-none"
            />
          ) : (
            <span className="text-[#585858] text-[14px] leading-[20px] font-normal">
              {selectedCurrency.code === "Type of search"
                ? "Type of search"
                : selectedCurrency.code}
            </span>
          )}
        </div>

        <svg
          width="19"
          height="19"
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
          viewBox="0 0 19 19"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M15.1456 6.80518L10.1881 11.7627C9.60262 12.3482 8.64457 12.3482 8.0591 11.7627L3.10156 6.80518"
            stroke="#292D32"
            strokeWidth="1.14054"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {isOpen && (
        <div
          className="absolute top-full left-0 py-1 right-0 mt-1 bg-white rounded-md z-50 border border-gray-200"
          style={{
            boxShadow: "0px 30px 80px 0px #00000029, 0px 4px 4px 0px #00000014",
          }}
        >
          {DropdownContent()}
        </div>
      )}
    </div>
  );
};

interface SearchBarProps {
  setShowSearchDrawer: (show: boolean) => void;
  onLocationChange: (
    locationName: string,
    coordinates?: { lng: number; lat: number }
  ) => void;
  onCheckRates?: () => void;
  onAmountCurrencyChange?: (args: {
    amount: number | undefined;
    baseCurrency: string;
    targetCurrency: string;
  }) => void;
  onCurrencyDropdownChange?: (isOpen: boolean) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  setShowSearchDrawer,
  onLocationChange,
  onCheckRates,
  onAmountCurrencyChange,
  onCurrencyDropdownChange,
}) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const [amount, setAmount] = useState<string>("1");
  const [sourceCurrency, setSourceCurrency] = useState<Currency>(
    currencies.find((c) => c.code === "USD")!
  ); // USD
  const [targetCurrency, setTargetCurrency] = useState<Currency>(
    currencies.find((c) => c.code === "MAD")!
  );
  const [selectedLocation, setSelectedLocation] = useState<Location>({
    id: "default",
    name: "Select a city",
    country: "",
    flag: "/assets/flags/default.svg",
  });
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showMobileModal, setShowMobileModal] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [pendingLocationUpdate, setPendingLocationUpdate] = useState<{
    lat: number;
    lng: number;
    name: string;
  } | null>(null);
  const [urlParamsProcessed, setUrlParamsProcessed] = useState(false);

  const [validationErrors, setValidationErrors] = useState<{
    location?: string;
    amount?: string;
    sourceCurrency?: string;
    targetCurrency?: string;
  }>({});

  // New function to geocode and store without dispatching event
  const geocodeLocationNameAndStore = async (locationName: string) => {
    if (!MAPBOX_TOKEN) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          locationName
        )}.json?access_token=${MAPBOX_TOKEN}&types=place&country=MA`
      );

      if (!response.ok) {
        throw new Error(`Failed to geocode location: ${response.status}`);
      }

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;

        setPendingLocationUpdate({
          lat: lat,
          lng: lng,
          name: locationName,
        });

        setSelectedLocation((prev) => ({
          ...prev,
          coordinates: { lat, lng },
        }));
      }
    } catch (error) {
      console.error("Error geocoding location:", error);
    }
  };

  const handleSourceCurrencyChange = (currency: Currency) => {
    if (currency.code === targetCurrency.code) {
      // If selecting same as target, swap to keep distinct currencies
      setTargetCurrency(sourceCurrency);
    }
    setSourceCurrency(currency);
    if (onAmountCurrencyChange) {
      onAmountCurrencyChange({
        amount: parseFloat(amount) || undefined,
        baseCurrency: currency.code,
        targetCurrency: targetCurrency.code,
      });
    }
  };

  const handleTargetCurrencyChange = (currency: Currency) => {
    if (currency.code === sourceCurrency.code) {
      // If selecting same as source, swap to keep distinct currencies
      setSourceCurrency(targetCurrency);
    }
    setTargetCurrency(currency);
    if (onAmountCurrencyChange) {
      onAmountCurrencyChange({
        amount: parseFloat(amount) || undefined,
        baseCurrency: sourceCurrency.code,
        targetCurrency: currency.code,
      });
    }
  };

  useEffect(() => {
    // Only emit after URL params have been processed to avoid wrong initial values
    if (onAmountCurrencyChange && urlParamsProcessed) {
      console.log("🔍 SearchBar: Sending currency values to parent:", {
        sourceCurrency: sourceCurrency.code,
        targetCurrency: targetCurrency.code,
        amount: amount === "" ? undefined : parseFloat(amount),
      });

      onAmountCurrencyChange({
        amount: amount === "" ? undefined : parseFloat(amount),
        baseCurrency: sourceCurrency.code,
        targetCurrency: targetCurrency.code,
      });
    }
  }, [
    onAmountCurrencyChange,
    amount,
    sourceCurrency,
    targetCurrency,
    urlParamsProcessed,
  ]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Emit currency dropdown state changes to parent
  useEffect(() => {
    if (onCurrencyDropdownChange) {
      const isCurrencyDropdownOpen =
        openDropdown === "source" ||
        openDropdown === "target" ||
        openDropdown === "location";
      onCurrencyDropdownChange(isCurrencyDropdownOpen);
    }
  }, [openDropdown, onCurrencyDropdownChange]);

  useEffect(() => {
    const handleMapLocationChange = (event: any) => {
      const { lat, lng, name, country } = event.detail;

      const newLocation: Location = {
        id: `map-search-${Date.now()}`,
        name: name,
        country: country || "Unknown",
        flag: "/assets/flags/default.svg",
        coordinates: { lat, lng },
      };

      setSelectedLocation(newLocation);
    };

    window.addEventListener("mapLocationChanged", handleMapLocationChange);

    return () => {
      window.removeEventListener("mapLocationChanged", handleMapLocationChange);
    };
  }, []);

  useEffect(() => {
    const processUrlParams = async () => {
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);

        const sourceParam = params.get("source");
        const targetParam = params.get("target");
        const amountParam = params.get("amount");
        const locationParam = params.get("location");
        const latParam = params.get("lat");
        const lngParam = params.get("lng");

        if (sourceParam) {
          const sourceCurr = currencies.find((c) => c.code === sourceParam);
          if (sourceCurr) {
            console.log(
              "🔍 SearchBar: Setting sourceCurrency from URL param:",
              sourceParam
            );
            setSourceCurrency(sourceCurr);
          }
        }

        if (targetParam) {
          const targetCurr = currencies.find((c) => c.code === targetParam);
          if (targetCurr) {
            console.log(
              "🔍 SearchBar: Setting targetCurrency from URL param:",
              targetParam
            );
            setTargetCurrency(targetCurr);
          }
        }

        if (amountParam) {
          setAmount(amountParam);
        }

        if (locationParam) {
          // Find the matching city in our predefined list
          const foundCity = locations.find(
            (city) => city.name.toLowerCase() === locationParam.toLowerCase()
          );
          if (foundCity) {
            // Geocode the city to get coordinates
            await geocodeLocationNameAndStore(foundCity.name);
            setSelectedLocation(foundCity);
          }
          // Scroll to this component
          if (componentRef.current) {
            setTimeout(() => {
              (componentRef.current as HTMLDivElement).scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }, 500);
          }
        }

        // Wait a bit more to ensure all state updates are processed
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Mark URL params as processed so initial callback can fire
        setUrlParamsProcessed(true);
      }
    };

    processUrlParams();
  }, []);

  const triggerMapLocationUpdate = (lat: number, lng: number, name: string) => {
    const customEvent = new CustomEvent("mapLocationChanged", {
      detail: {
        lat: lat,
        lng: lng,
        name: name,
      },
    });
    window.dispatchEvent(customEvent);
  };

  const geocodeLocationName = async (locationName: string) => {
    if (!MAPBOX_TOKEN) return;

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          locationName
        )}.json?access_token=${MAPBOX_TOKEN}&types=place`
      );

      if (!response.ok) {
        throw new Error(`Failed to geocode location: ${response.status}`);
      }

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;

        triggerMapLocationUpdate(lat, lng, locationName);

        setSelectedLocation((prev) => ({
          ...prev,
          coordinates: { lat, lng },
        }));
      }
    } catch (error) {
      console.error("Error geocoding location:", error);
    }
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value: string = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
      if (onAmountCurrencyChange) {
        const numeric = value === "" ? undefined : parseFloat(value);
        onAmountCurrencyChange({
          amount: numeric,
          baseCurrency: sourceCurrency.code,
          targetCurrency: targetCurrency.code,
        });
      }
    }
  };

  const handleSwapCurrencies = () => {
    setIsRotating(true);
    const temp = sourceCurrency;
    setSourceCurrency(targetCurrency);
    setTargetCurrency(temp);

    // Notify parent of currency swap
    if (onAmountCurrencyChange) {
      onAmountCurrencyChange({
        amount: parseFloat(amount) || undefined,
        baseCurrency: targetCurrency.code, // Now becomes sourceCurrency
        targetCurrency: temp.code, // Now becomes targetCurrency
      });
    }

    setTimeout(() => setIsRotating(false), 300);
  };

  const handleGetCurrentLocation = () => {
    setLocationError(null);
    setIsGettingLocation(true);

    if (!navigator.geolocation) {
      const errorMessage = "Geolocation is not supported by this browser.";
      setLocationError(errorMessage);
      setIsGettingLocation(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const cityName = await fetchCityName(latitude, longitude);

        const currentLocation: Location = {
          id: "current",
          name: cityName,
          country: "Maroc",
          flag: "/assets/location-icon.svg",
          coordinates: {
            lng: longitude,
            lat: latitude,
          },
        };

        setSelectedLocation(currentLocation);

        // Store the location update for when Check Rates is clicked
        setPendingLocationUpdate({
          lat: latitude,
          lng: longitude,
          name: cityName,
        });

        setIsGettingLocation(false);
      },
      (error) => {
        let errorMessage = "Unknown geolocation error";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location permission denied.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
          default:
            errorMessage = `Geolocation error: ${
              error.message || "Unknown error"
            }`;
        }

        console.error("Error getting location:", {
          code: error.code,
          message: error.message,
          PERMISSION_DENIED: error.PERMISSION_DENIED,
          POSITION_UNAVAILABLE: error.POSITION_UNAVAILABLE,
          TIMEOUT: error.TIMEOUT,
        });

        setLocationError(errorMessage);
        setIsGettingLocation(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleCheckRates = () => {
    // Validate all fields
    const errors: typeof validationErrors = {};

    if (
      !selectedLocation ||
      selectedLocation.id === "placeholder" ||
      selectedLocation.name === "Select a city"
    ) {
      errors.location = "Please select a location";
    }

    if (!amount || amount.trim() === "") {
      errors.amount = "Please enter an amount";
    }

    if (!sourceCurrency || sourceCurrency.code === "Type of search") {
      errors.sourceCurrency = "Please select source currency";
    }

    if (!targetCurrency || targetCurrency.code === "Type of search") {
      errors.targetCurrency = "Please select target currency";
    }

    setValidationErrors(errors);

    // If there are validation errors, don't proceed
    if (Object.keys(errors).length > 0) {
      return;
    }

    // Clear any existing errors
    setValidationErrors({});

    // Dispatch the pending location update when Check Rates is clicked
    if (pendingLocationUpdate) {
      // Update the parent with the location name when Check Rates is clicked
      onLocationChange(pendingLocationUpdate.name);

      const customEvent = new CustomEvent("mapLocationChanged", {
        detail: {
          ...pendingLocationUpdate,
          userInitiated: true,
        },
      });
      window.dispatchEvent(customEvent);
      setPendingLocationUpdate(null); // Clear the pending update
    }

    if (onCheckRates) {
      onCheckRates();
    }
  };

  const handleLocationSelected = (location: Location) => {
    setSelectedLocation(location);

    // Store the location for later use when Check Rates is clicked
    if (location.coordinates) {
      setPendingLocationUpdate({
        lat: location.coordinates.lat,
        lng: location.coordinates.lng,
        name: location.name,
      });
    } else {
      geocodeLocationNameAndStore(location.name);
    }
  };

  const fetchCityName = async (lat: number, lng: number) => {
    try {
      if (!MAPBOX_TOKEN) {
        return "Current Location";
      }

      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=place&limit=1`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch location data: ${response.status}`);
      }

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const place = data.features[0];
        return place.text || "Current Location";
      }

      return "Current Location";
    } catch (error) {
      console.error("Error fetching city name:", error);
      return "Current Location";
    }
  };

  useEffect(() => {
    console.log("showMobileModal changed:", showMobileModal);
  }, [showMobileModal]);

  return (
    <div ref={componentRef} className="px-6 w-full lg:max-w-[1020px] mx-auto">
      <div className="w-full flex flex-col md:flex-row items-center flex-wrap gap-6 lg:gap-5">
        {/* Location Dropdown */}
        <div className="w-full lg:w-[157px] lg:max-w-[157px]">
          <LocationDropdown
            label="Location"
            selectedLocation={selectedLocation}
            onLocationChange={handleLocationSelected}
            placeholder="Search city"
            isOpen={openDropdown === "location"}
            onToggle={() =>
              setOpenDropdown(openDropdown === "location" ? null : "location")
            }
          />
          {validationErrors.location && (
            <p className="text-red-500 text-[12px] mt-1 px-3">
              {validationErrors.location}
            </p>
          )}
          <button
            onClick={handleGetCurrentLocation}
            disabled={isGettingLocation}
            className={`mt-1.5 lg:hidden flex items-center gap-1 text-[#20523C] text-[14px] font-medium leading-[20px] ${
              isGettingLocation
                ? "opacity-50 cursor-not-allowed"
                : "cursor-pointer"
            }`}
          >
            {isGettingLocation ? (
              <div className="w-4 h-4 border-2 border-[#20523C] border-t-transparent rounded-full animate-spin mr-1"></div>
            ) : (
              <>
                <Image
                  src="/assets/gps-dark-green.svg"
                  alt="gps"
                  width={16}
                  height={16}
                />
                Use current location
              </>
            )}
          </button>
        </div>

        {/* Amount to exchange */}
        <div className="w-full lg:min-w-[157px] lg:max-w-[157px] md:pb-0 pb-3 relative">
          <label
            className={`absolute -top-2 left-3 z-10 bg-white px-1.5 text-[#111111] text-[12px] font-medium leading-[17px]`}
          >
            Amount
          </label>
          <div className="flex items-center relative border border-[#DEDEDE] rounded-[10px] transition duration-200 h-[46px] md:h-[56px] px-4 hover:border-[#20523C]">
            <span className="text-[14px] leading-[20px] font-normal text-[#585858] pointer-events-none">
              {sourceCurrency.symbol}
            </span>
            <input
              type="text"
              value={amount}
              onChange={(e) => {
                handleAmountChange(e);
                if (validationErrors.amount) {
                  setValidationErrors((prev) => ({
                    ...prev,
                    amount: undefined,
                  }));
                }
              }}
              className={`w-full outline-none text-[14px] leading-[20px] smaller h-full font-normal text-[#585858] placeholder:text-[#585858] bg-transparent ${
                amount ? "pl-1" : "pl-0"
              }`}
            />
          </div>
        </div>

        {/* Currency Swap Section */}
        <div className="w-full lg:w-fit flex items-center lg:flex-row flex-col gap-4 lg:gap-3 h-full">
          <motion.div
            className="w-full lg:w-[157px] lg:max-w-[157px]"
            animate={isRotating ? { x: [0, 20, 0], scale: [1, 0.95, 1] } : {}}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <motion.div
              animate={isRotating ? { opacity: [1, 0.7, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <CurrencyDropdown
                label="Change from"
                selectedCurrency={sourceCurrency}
                onCurrencyChange={handleSourceCurrencyChange}
                placeholder="Type of search"
                isOpen={openDropdown === "source"}
                onToggle={() =>
                  setOpenDropdown(openDropdown === "source" ? null : "source")
                }
              />
              {validationErrors.sourceCurrency && (
                <p className="text-red-500 text-[12px] mt-1 px-3">
                  {validationErrors.sourceCurrency}
                </p>
              )}
            </motion.div>
          </motion.div>

          {/* Swap Button */}
          <div className="w-full flex items-center justify-between gap-3">
            <div className="bg-[#DEDEDE] h-[1px] w-full lg:hidden block"></div>
            <div className="flex items-center justify-center sm:min-w-[24.33px] sm:w-[24.33px]">
              <motion.button
                onClick={handleSwapCurrencies}
                disabled={isRotating}
                aria-label="Swap currencies"
                className="cursor-pointer bg-white relative z-40 rounded-full p-1 hover:bg-gray-50 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                animate={isRotating ? { rotate: 35 } : { rotate: 0 }}
                transition={{
                  duration: 0.5,
                  ease: "easeInOut",
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                }}
              >
                <motion.div
                  animate={
                    isRotating
                      ? {
                          scale: [1, 1.2, 1],
                          filter: [
                            "hue-rotate(0deg)",
                            "hue-rotate(45deg)",
                            "hue-rotate(0deg)",
                          ],
                        }
                      : {}
                  }
                  transition={{ duration: 0.4 }}
                >
                  <Image
                    src="/assets/exchange-rotate.svg"
                    alt="refresh-circle"
                    width={24.33}
                    height={24.33}
                    className="min-w-[24.33px] p-1 bg-green-50 rounded-full border border-[#D1D1D1]"
                  />
                </motion.div>
              </motion.button>
            </div>
            <div className="bg-[#DEDEDE] h-[1px] w-full lg:hidden block"></div>
          </div>

          <motion.div
            className="w-full lg:w-[157px] lg:max-w-[157px]"
            animate={isRotating ? { x: [0, -20, 0], scale: [1, 0.95, 1] } : {}}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <motion.div
              animate={isRotating ? { opacity: [1, 0.7, 1] } : {}}
              transition={{ duration: 0.3 }}
            >
              <CurrencyDropdown
                label="Change to"
                selectedCurrency={targetCurrency}
                onCurrencyChange={handleTargetCurrencyChange}
                placeholder="Type of search"
                isOpen={openDropdown === "target"}
                onToggle={() =>
                  setOpenDropdown(openDropdown === "target" ? null : "target")
                }
              />
              {validationErrors.targetCurrency && (
                <p className="text-red-500 text-[12px] mt-1 px-3">
                  {validationErrors.targetCurrency}
                </p>
              )}
            </motion.div>
          </motion.div>
        </div>

        <motion.div
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="w-full lg:w-auto"
        >
          <GradientButton
            onClick={handleCheckRates}
            className="w-full lg:w-auto h-[46px] md:h-[56px] font-bold text-nowrap cursor-pointer flex items-center justify-center gap-2"
          >
            <Image src="/assets/clock.svg" alt="clock" width={18} height={18} />
            Check Rates
          </GradientButton>
        </motion.div>
      </div>

      <button
        onClick={handleGetCurrentLocation}
        disabled={isGettingLocation}
        className={`mt-4 hidden lg:flex items-center gap-1 text-[#20523C] text-[14px] font-medium leading-[20px] ${
          isGettingLocation ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
        }`}
      >
        {isGettingLocation ? (
          <div className="w-4 h-4 border-2 border-[#20523C] border-t-transparent rounded-full animate-spin mr-1"></div>
        ) : (
          <>
            <Image
              src="/assets/gps-dark-green.svg"
              alt="gps"
              width={16}
              height={16}
            />
            Use current location
          </>
        )}
      </button>
    </div>
  );
};

export default SearchBar;
