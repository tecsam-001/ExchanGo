"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import GradientButton from "../../ui/GradientButton";
import Image from "next/image";
import ArrowBack from "../../SvgIcons/ArrowBack";
import Checkbox from "../../ui/Checkbox";
import CustomInput from "../../ui/CustomInput";
import { currencies, type Currency } from "../../../data/currencies";
import CountryCodeDropdown from "../../ui/CountryCodeDropdown";
import MAPBOX_TOKEN from "../../Phase1/HomePage/mapboxConfig";
import AlarmRateSuccessfullySetModal from "./AlarmRateSuccessfullySetModal";
// Import axios for API calls
import axios from "axios";
import {
  searchCities,
  transformCitySearchResponse,
  createAlert,
  AlertRequest,
} from "@/services/api";
import { toast } from "react-toastify";
// Import libphonenumber-js for phone validation
import {
  parsePhoneNumber,
  isValidPhoneNumber,
  getCountryCallingCode,
} from "libphonenumber-js";

// Define local interfaces for city data
interface CityExchange {
  id: string;
  name: string;
  slug: string;
  address?: string;
  primaryPhoneNumber?: string;
  selected: boolean;
  isActive: boolean;
  isVerified: boolean;
  isFeatured: boolean;
}

interface CityWithExchanges {
  city: string;
  cityId?: string; // Add optional cityId for API integration
  numberOfOffices: number;
  exchanges: CityExchange[];
}

interface CitySearchProps {
  onSelectCity: (city: string) => void;
  selectedExchanges: number | null;
  selectedCities: string[];
  getSelectedExchangesCount: (city: string) => number;
}

interface LocationSuggestion {
  name: string;
  country: string;
  id: string;
}

// Add interface for office type
interface CityOffice {
  id: string;
  officeName: string;
  address: string;
  primaryPhoneNumber: string;
  slug: string;
  isActive: boolean;
  isVerified: boolean;
  isFeatured: boolean;
}

// Add predefined Moroccan cities
const predefinedLocations: LocationSuggestion[] = [
  {
    id: "1",
    name: "Casablanca",
    country: "Maroc",
  },
  {
    id: "2",
    name: "Rabat",
    country: "Maroc",
  },
  {
    id: "3",
    name: "Fès",
    country: "Maroc",
  },
  {
    id: "4",
    name: "Tanger",
    country: "Maroc",
  },
  {
    id: "5",
    name: "Agadir",
    country: "Maroc",
  },
  {
    id: "6",
    name: "Marrakech",
    country: "Maroc",
  },
];

const CitySearch: React.FC<CitySearchProps> = ({
  onSelectCity,
  selectedExchanges,
  selectedCities,
  getSelectedExchangesCount,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const dropdownRef = useRef<HTMLDivElement>(null);

  console.log("selectedddExchanges", selectedExchanges);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        showDropdown
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showDropdown]);

  const fetchLocationSuggestions = async (query: string) => {
    // Always show predefined locations, even with empty search
    if (!query.trim()) {
      // Filter out already selected cities
      const availablePredefined = predefinedLocations.filter(
        (location) => !selectedCities.includes(location.name)
      );
      setSuggestions(availablePredefined);
      return;
    }

    setIsLoading(true);
    // First filter predefined locations
    const filteredPredefined = predefinedLocations.filter(
      (location) =>
        location.name.toLowerCase().includes(query.toLowerCase()) &&
        !selectedCities.includes(location.name)
    );

    // If the query is very short, just show filtered predefined locations
    if (query.length < 2) {
      setSuggestions(filteredPredefined);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${MAPBOX_TOKEN}&types=place&limit=5&country=MA&language=fr`
      );

      if (!response.ok) {
        throw new Error(
          `Failed to fetch location suggestions: ${response.status}`
        );
      }

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const mapboxSuggestions: LocationSuggestion[] = data.features.map(
          (place: any, index: number) => {
            const country =
              place.context?.find((ctx: any) => ctx.id.startsWith("country"))
                ?.text || "Maroc";
            return {
              id: `mapbox-${index}-${place.id}`,
              name: place.text,
              country: country,
            };
          }
        );

        // Remove duplicates (by name) with predefined cities and already selected cities
        const uniqueMapbox = mapboxSuggestions.filter(
          (s) =>
            !filteredPredefined.some(
              (l) => l.name.toLowerCase() === s.name.toLowerCase()
            ) && !selectedCities.includes(s.name)
        );

        setSuggestions([...filteredPredefined, ...uniqueMapbox]);
      } else {
        setSuggestions(filteredPredefined);
      }
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
      setSuggestions(filteredPredefined);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value.trim()) {
      // Show all predefined locations when search is cleared
      const availablePredefined = predefinedLocations.filter(
        (location) => !selectedCities.includes(location.name)
      );
      setSuggestions(availablePredefined);
      return;
    }

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    const timeout = setTimeout(() => {
      fetchLocationSuggestions(value);
    }, 300);
    setDebounceTimeout(timeout);
  };

  const handleSelectCity = (city: string) => {
    onSelectCity(city);
    setSearchTerm("");
    setShowDropdown(false);
    // Don't clear suggestions, keep them for next time
  };

  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

  // Show predefined cities when the dropdown is opened
  useEffect(() => {
    if (showDropdown) {
      // Filter out already selected cities
      const availablePredefined = predefinedLocations.filter(
        (location) => !selectedCities.includes(location.name)
      );
      setSuggestions(availablePredefined);
    }
  }, [showDropdown, selectedCities]);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div className="flex items-center flex-wrap gap-2">
        <Image
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                async (position) => {
                  setIsLoading(true);
                  try {
                    const response = await fetch(
                      `https://api.mapbox.com/geocoding/v5/mapbox.places/${position.coords.longitude},${position.coords.latitude}.json?access_token=${MAPBOX_TOKEN}&types=place&limit=1&language=fr`
                    );
                    if (!response.ok) {
                      throw new Error("Failed to fetch city name");
                    }
                    const data = await response.json();
                    if (data.features && data.features.length > 0) {
                      const cityName = data.features[0].text;
                      console.log("GPS located city:", cityName);

                      // Get city data from our API to get the ID
                      const cityDataFromApi = await searchCities(cityName);
                      console.log("API data for GPS city:", cityDataFromApi);

                      if (cityDataFromApi && cityDataFromApi.id) {
                        console.log(
                          `City ID for ${cityName}:`,
                          cityDataFromApi.id
                        );
                      } else {
                        console.warn(`No API data found for city: ${cityName}`);
                      }

                      handleSelectCity(cityName);
                    } else {
                      handleSelectCity("Rabat"); // Default to Rabat if geolocation doesn't return a valid city
                    }
                  } catch (error) {
                    console.error("Error getting location name:", error);
                    handleSelectCity("Rabat"); // Default to Rabat on error
                  } finally {
                    setIsLoading(false);
                  }
                },
                (error) => {
                  console.error("Error getting location:", error);
                  handleSelectCity("Rabat"); // Default to Rabat if geolocation fails
                }
              );
            } else {
              // If geolocation is not supported, use default city
              handleSelectCity("Rabat");
            }
          }}
          className="cursor-pointer"
          src="/assets/gps.svg"
          alt="City Icon"
          width={18}
          height={18}
        />
        {selectedCities.map((city) => {
          const exchangeCount = getSelectedExchangesCount(city);
          // Don't render cities with 0 offices
          if (exchangeCount === -1) return null;

          return (
            <div
              key={city}
              className="flex items-center gap-1 border border-[#DEDEDE] rounded-full bg-transparent px-3 h-[20px] sm:h-[29px]"
            >
              <span className="text-[#111111] text-[14px] leading-[17px] font-normal">
                {city} ({exchangeCount})
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  const cityElement = e.currentTarget.closest("div");
                  if (cityElement) {
                    cityElement.classList.add("scale-95", "opacity-50");
                    setTimeout(() => {
                      const cityName = city;
                      const cityToRemove = selectedCities.find(
                        (c) => c === cityName
                      );
                      if (cityToRemove) {
                        onSelectCity(cityToRemove);
                      }
                    }, 150);
                  }
                }}
                className="mt-0.5"
              >
                <Image
                  src="/assets/close-circle.svg"
                  alt="Close"
                  width={14}
                  height={14}
                  className="cursor-pointer min-w-[14px]"
                />
              </button>
            </div>
          );
        })}
        <input
          type="text"
          placeholder={selectedCities.length ? "" : "Type your city"}
          value={searchTerm}
          onChange={handleSearchChange}
          onClick={() => setShowDropdown(true)}
          className="flex-1 min-w-[80px] bg-transparent border-0 smaller outline-none text-[#111111] placeholder-[#585858] text-sm leading-[20px] font-normal"
        />
      </div>

      {showDropdown && (
        <div className="absolute left-0 right-0 mt-4 sm:mt-6 max-w-full w-full overflow-y-auto bg-white rounded-md shadow-lg z-50 border border-[#DEDEDE]">
          {isLoading ? (
            <div className="flex items-center justify-center py-3">
              <div className="w-5 h-5 border-2 border-[#20523C] border-t-transparent rounded-full animate-spin"></div>
              <span className="ml-2 text-[#585858] text-[14px]">
                Searching...
              </span>
            </div>
          ) : suggestions.length > 0 ? (
            suggestions.map((location) => (
              <div
                key={location.id}
                className="px-4 py-2 hover:bg-[#F1F1F1] cursor-pointer border-b border-[#DEDEDE] last:border-b-0"
                onClick={() => handleSelectCity(location.name)}
              >
                <div className="flex flex-col">
                  <span className="text-[#585858] text-[14px] leading-[20px] font-medium">
                    {location.name}
                  </span>
                  {location.country && (
                    <span className="text-[#9CA3AF] text-[12px] leading-[16px]">
                      {location.country}
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : searchTerm ? (
            <div className="text-[#585858] text-center py-3 text-[14px]">
              No locations found
            </div>
          ) : (
            <div className="text-[#585858] text-center py-3 text-[14px]">
              Type to search for locations
            </div>
          )}
        </div>
      )}
    </div>
  );
};

interface ExchangeSelectionProps {
  city: string;
  cityData: CityWithExchanges;
  onBack: (selectedCount: string[]) => void;
  onSave: (selectedExchangeIds: string[]) => void;
}

// Modify the ExchangeSelection component to handle empty exchanges
const ExchangeSelection: React.FC<ExchangeSelectionProps> = ({
  city,
  cityData,
  onBack,
  onSave,
}) => {
  // Ensure cityData always has a valid structure
  const safeCityData: CityWithExchanges = {
    city: cityData.city || "Unknown City",
    numberOfOffices: cityData.numberOfOffices || 0,
    exchanges: cityData.exchanges || [],
  };

  // Include ALL exchanges, not just active ones
  const allExchanges = safeCityData.exchanges;

  // Filter out inactive exchanges for selection
  const activeExchanges = allExchanges;
  const [selectedExchanges, setSelectedExchanges] = useState<string[]>(
    activeExchanges.map((ex) => ex.id)
  );

  const totalOffices = safeCityData.numberOfOffices;
  const activeExchangeCount = activeExchanges.length;

  const toggleExchange = (id: string) => {
    setSelectedExchanges((prev) =>
      prev.includes(id)
        ? prev.filter((exchangeId) => exchangeId !== id)
        : [...prev, id]
    );
  };

  const handleBack = () => {
    // When going back, pass the selected exchanges
    onBack(selectedExchanges);
  };

  const handleSelectAll = () => {
    if (selectedExchanges.length === activeExchanges.length) {
      setSelectedExchanges([]);
    } else {
      setSelectedExchanges(activeExchanges.map((ex) => ex.id));
    }
  };

  const handleSave = () => {
    onSave(selectedExchanges);
  };

  // Determine the status text
  const getStatusText = () => {
    if (totalOffices === 0) return "No offices found";
    if (activeExchangeCount === 0) return "No active offices";
    return `${activeExchangeCount} active out of ${totalOffices} offices`;
  };

  return (
    <div className="h-full flex flex-col">
      <div className="px-3 sm:px-5 md:px-10">
        <div className="flex items-center justify-between mb-5 sm:mb-7 md:mb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={handleBack}
              className="flex items-center gap-1.5 cursor-pointer text-[#585858] text-[14px] sm:text-[16px] leading-[22px]"
            >
              <ArrowBack /> Back
            </button>
          </div>
        </div>

        <h2 className="text-[18px] sm:text-[20px] leading-[22px] sm:leading-[24px] font-bold mb-2 sm:mb-1.5">
          Exchange Office In {safeCityData.city}
        </h2>
        <p className="text-[13px] sm:text-[14px] leading-[18px] sm:leading-[20px] text-[#585858] font-normal mb-3 sm:mb-4">
          {getStatusText()}
        </p>

        <div className="relative flex-grow overflow-hidden max-h-[400px] sm:max-h-[446px] border border-[#DEDEDE] rounded-md">
          <div className="flex justify-between items-center border-b border-[#DEDEDE] py-2 px-3 sm:px-4 sticky top-0 bg-white">
            <button
              onClick={handleSelectAll}
              className="text-[11px] sm:text-[12px] leading-[15px] sm:leading-[17px] cursor-pointer text-[#20523C] font-bold"
              disabled={activeExchangeCount === 0}
            >
              {selectedExchanges.length === activeExchanges.length
                ? "Unselect All"
                : "Select All"}
            </button>
            <span className="text-[11px] sm:text-[12px] leading-[15px] sm:leading-[17px] font-normal text-[#585858]">
              {selectedExchanges.length} offices selected
            </span>
          </div>

          <div className="overflow-y-auto max-h-[300px] sm:max-h-[350px]">
            {activeExchanges.length > 0 ? (
              activeExchanges.map((exchange) => (
                <div
                  key={exchange.id}
                  className="flex items-center gap-1 py-2 sm:py-2.5 px-3 sm:px-4 border-b border-[#DEDEDE] last:border-b-0"
                >
                  <Checkbox
                    checked={selectedExchanges.includes(exchange.id)}
                    onChange={() => toggleExchange(exchange.id)}
                  />
                  <div className="flex flex-col">
                    <span className="text-[13px] sm:text-[14px] text-[#585858] font-normal leading-[18px] sm:leading-[20px]">
                      {exchange.name}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-4 text-[#585858]">
                <p className="text-[13px] sm:text-[14px] mb-2">
                  No active exchange offices found
                </p>
                <p className="text-[11px] sm:text-[12px] text-[#9CA3AF]">
                  Total offices in {safeCityData.city}: {totalOffices}
                </p>
              </div>
            )}
          </div>

          <div className=" absolute -bottom-1 z-40 left-0 right-0 h-[20px] w-full pointer-events-none">
            <Image
              src="/assets/shadow.svg"
              alt="shadow"
              width={1000}
              height={20}
              className="rounded-b-md"
            />
          </div>
        </div>
      </div>

      <div className="mt-4 sm:mt-5 md:mt-10 sm:border-t border-[#DEDEDE] sm:py-5 pb-4 px-3 sm:px-5 md:px-10 flex items-end justify-end">
        <GradientButton
          className="h-[42px] sm:h-[46px] sm:w-fit w-full"
          onClick={handleSave}
          disabled={activeExchangeCount === 0}
        >
          Save
        </GradientButton>
      </div>
    </div>
  );
};

interface CurrencyDropdownProps {
  label: string;
  selectedCurrency: Currency;
  onCurrencyChange: (currency: Currency) => void;
  placeholder?: string;
  isOpen: boolean;
  onToggle: () => void;
}

const CurrencyDropdown: React.FC<CurrencyDropdownProps> = ({
  label,
  selectedCurrency,
  onCurrencyChange,
  placeholder = "Type of search",
  isOpen,
  onToggle,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        isOpen
      ) {
        onToggle();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onToggle]);

  const filteredCurrencies = currencies.filter((currency) =>
    currency.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (currency: Currency) => {
    onCurrencyChange(currency);
    onToggle();
    setSearchTerm("");
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label
        className={`absolute -top-2 left-3 z-10 bg-white px-1.5 text-[#111111] text-[12px] font-medium leading-[17px]`}
      >
        {label}
      </label>

      <div
        className="w-full flex items-center justify-between cursor-pointer rounded-[10px] px-4 h-[46px] sm:h-[56px] border border-[#DEDEDE]"
        onClick={onToggle}
      >
        <div className="w-full flex items-center gap-1.5 flex-1">
          {!isOpen && selectedCurrency.code !== "Type of search" && (
            <img
              src={selectedCurrency.flag || "/placeholder.svg"}
              alt={selectedCurrency.code}
              className="rounded-full object-cover max-w-[16px] max-h-[16px] min-w-[16px] min-h-[16px] sm:max-w-[18px] sm:max-h-[18px] sm:min-w-[18px] sm:min-h-[18px]"
            />
          )}

          {isOpen ? (
            <input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="w-[130px] text-[14px] leading-[20px] smaller font-normal text-[#9CA3AF] placeholder:text-[#ACACAC] truncate bg-transparent border-none outline-none"
              autoFocus
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
          className={` transition-transform min-w-[19px] ${
            isOpen ? "rotate-180" : ""
          }`}
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

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute top-full left-0 py-1 right-0 mt-1 bg-white rounded-md z-50"
          style={{
            boxShadow: "0px 30px 80px 0px #00000029, 0px 4px 4px 0px #00000014",
          }}
        >
          <div className="max-h-40 overflow-y-auto hide-scrollbar">
            {filteredCurrencies.map((currency, index) => (
              <button
                key={currency.code}
                onClick={() => handleSelect(currency)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#F1F1F1] text-left transition-colors ${
                  currency.code === selectedCurrency.code ? "bg-[#F1F1F1]" : ""
                } ${
                  index !== filteredCurrencies.length - 1
                    ? "border-b border-[#DEDEDE]"
                    : ""
                }`}
              >
                <img
                  src={currency.flag || "/placeholder.svg"}
                  alt={currency.code}
                  className="rounded-full object-cover max-w-[18px] max-h-[18px] min-w-[18px] min-h-[18px]"
                />
                <span className="text-[#585858] text-[14px] leading-[20px] font-normal">
                  {currency.code}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface WhatsAppAlertFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  areaType: "area" | "exchange";
  exchangeName?: string;
  onBack: () => void;
}

const WhatsAppAlertFormModal: React.FC<WhatsAppAlertFormModalProps> = ({
  isOpen,
  onClose,
  areaType,
  exchangeName = "this exchange",
  onBack,
}) => {
  // Common states that don't need separation
  const [isTermsAccepted, setIsTermsAccepted] = useState<boolean>(false);
  const [openDropdown, setOpenDropdown] = useState<"source" | "target" | null>(
    null
  );
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [selectedExchanges, setSelectedExchanges] = useState<number | null>(
    null
  );
  const [currentStep, setCurrentStep] = useState<
    "cities" | "exchanges" | "form"
  >("cities");
  const [currentCity, setCurrentCity] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);

  // Area form states
  const [areaWhatsappNumber, setAreaWhatsappNumber] = useState({
    countryCode: "+212",
    number: "",
  });
  const [areaSelectedCities, setAreaSelectedCities] = useState<string[]>([]);
  const [areaCitiesWithExchanges, setAreaCitiesWithExchanges] = useState<
    CityWithExchanges[]
  >([]);
  const [areaSourceCurrency, setAreaSourceCurrency] = useState<Currency>(
    currencies.find((c) => c.code === "MAD") || currencies[5]
  );
  const [areaTargetCurrency, setAreaTargetCurrency] = useState<Currency>(
    currencies.find((c) => c.code === "USD") || currencies[0]
  );
  const [areaSourceCurrencyAmount, setAreaSourceCurrencyAmount] = useState("1");
  const [areaTargetRate, setAreaTargetRate] = useState("0.11");

  // Exchange form states
  const [exchangeWhatsappNumber, setExchangeWhatsappNumber] = useState({
    countryCode: "+212",
    number: "",
  });
  const [exchangeSelectedCities, setExchangeSelectedCities] = useState<
    string[]
  >([]);
  const [exchangeCitiesWithExchanges, setExchangeCitiesWithExchanges] =
    useState<CityWithExchanges[]>([]);
  const [exchangeSourceCurrency, setExchangeSourceCurrency] =
    useState<Currency>(
      currencies.find((c) => c.code === "MAD") || currencies[5]
    );
  const [exchangeTargetCurrency, setExchangeTargetCurrency] =
    useState<Currency>(
      currencies.find((c) => c.code === "USD") || currencies[0]
    );
  const [exchangeSourceCurrencyAmount, setExchangeSourceCurrencyAmount] =
    useState("1");
  const [exchangeTargetRate, setExchangeTargetRate] = useState("0.11");

  // Active state variables based on current areaType
  const [whatsappNumber, setWhatsappNumber] = useState({
    countryCode: "+212",
    number: "",
  });
  const [isWhatsAppSame, setIsWhatsAppSame] = useState(false);
  const [phoneValidation, setPhoneValidation] = useState({
    isValid: false,
    error: "",
    maxLength: 9, // Default for Morocco
  });
  const [selectedCities, setSelectedCities] = useState<string[]>([]);
  const [citiesWithExchanges, setCitiesWithExchanges] = useState<
    CityWithExchanges[]
  >([]);
  const [sourceCurrency, setSourceCurrency] = useState<Currency>(
    currencies.find((c) => c.code === "MAD") || currencies[5]
  );
  const [targetCurrency, setTargetCurrency] = useState<Currency>(
    currencies.find((c) => c.code === "USD") || currencies[0]
  );
  const [sourceCurrencyAmount, setSourceCurrencyAmount] = useState("1");
  const [targetRate, setTargetRate] = useState("0.11");

  // State to track selected exchanges for each city
  const [selectedExchangesByCity, setSelectedExchangesByCity] = useState<{
    [city: string]: number;
  }>({});

  // Effect to update active state based on areaType
  useEffect(() => {
    // Reset to cities step when switching between forms
    setCurrentStep("cities");

    if (areaType === "area") {
      // Set active states to area states
      setWhatsappNumber(areaWhatsappNumber);
      setSelectedCities(areaSelectedCities);
      setCitiesWithExchanges(areaCitiesWithExchanges);
      setSourceCurrency(areaSourceCurrency);
      setTargetCurrency(areaTargetCurrency);
      setSourceCurrencyAmount(areaSourceCurrencyAmount);
      setTargetRate(areaTargetRate);
    } else {
      // Set active states to exchange states
      setWhatsappNumber(exchangeWhatsappNumber);
      setSelectedCities(exchangeSelectedCities);
      setCitiesWithExchanges(exchangeCitiesWithExchanges);
      setSourceCurrency(exchangeSourceCurrency);
      setTargetCurrency(exchangeTargetCurrency);
      setSourceCurrencyAmount(exchangeSourceCurrencyAmount);
      setTargetRate(exchangeTargetRate);
    }
  }, [areaType]);

  // Effect to initialize phone validation when country code changes
  useEffect(() => {
    validatePhoneNumber(whatsappNumber.countryCode, whatsappNumber.number);
  }, [whatsappNumber.countryCode]);

  // Effect to save changes back to appropriate state object
  useEffect(() => {
    if (areaType === "area") {
      setAreaWhatsappNumber(whatsappNumber);
      setAreaSelectedCities(selectedCities);
      setAreaCitiesWithExchanges(citiesWithExchanges);
      setAreaSourceCurrency(sourceCurrency);
      setAreaTargetCurrency(targetCurrency);
      setAreaSourceCurrencyAmount(sourceCurrencyAmount);
      setAreaTargetRate(targetRate);
    } else {
      setExchangeWhatsappNumber(whatsappNumber);
      setExchangeSelectedCities(selectedCities);
      setExchangeCitiesWithExchanges(citiesWithExchanges);
      setExchangeSourceCurrency(sourceCurrency);
      setExchangeTargetCurrency(targetCurrency);
      setExchangeSourceCurrencyAmount(sourceCurrencyAmount);
      setExchangeTargetRate(targetRate);
    }
  }, [
    whatsappNumber,
    selectedCities,
    citiesWithExchanges,
    sourceCurrency,
    targetCurrency,
    sourceCurrencyAmount,
    targetRate,
  ]);

  type ExchangeRate = {
    [key: string]: { [key: string]: number };
  };

  const [exchangeRates, setExchangeRates] = useState<ExchangeRate>({
    MAD: {
      USD: 0.11,
      EUR: 0.09,
      GBP: 0.08,
      AUD: 0.15,
      JPY: 15.3,
      AED: 0.37,
      CHF: 0.09,
    },
    USD: {
      MAD: 9.3,
      EUR: 0.92,
      GBP: 0.79,
      AUD: 1.52,
      JPY: 157.5,
      AED: 3.67,
      CHF: 0.91,
    },
    EUR: {
      MAD: 10.11,
      USD: 1.09,
      GBP: 0.86,
      AUD: 1.65,
      JPY: 171.2,
      AED: 3.99,
      CHF: 0.99,
    },
    GBP: {
      MAD: 11.75,
      USD: 1.26,
      EUR: 1.16,
      AUD: 1.92,
      JPY: 199.0,
      AED: 4.64,
      CHF: 1.15,
    },
    AUD: {
      MAD: 6.12,
      USD: 0.66,
      EUR: 0.61,
      GBP: 0.52,
      JPY: 103.6,
      AED: 2.42,
      CHF: 0.6,
    },
    JPY: {
      MAD: 0.059,
      USD: 0.0063,
      EUR: 0.0058,
      GBP: 0.005,
      AUD: 0.0097,
      AED: 0.023,
      CHF: 0.0057,
    },
    AED: {
      MAD: 2.53,
      USD: 0.27,
      EUR: 0.25,
      GBP: 0.22,
      AUD: 0.41,
      JPY: 42.9,
      CHF: 0.25,
    },
    CHF: {
      MAD: 10.21,
      USD: 1.1,
      EUR: 1.01,
      GBP: 0.87,
      AUD: 1.67,
      JPY: 173.1,
      AED: 4.03,
    },
  });

  const handleWhatsappNumberChange = (
    field: "countryCode" | "number",
    value: string
  ) => {
    setWhatsappNumber((prev) => ({ ...prev, [field]: value }));

    // Validate phone number when either field changes
    const newWhatsappNumber = {
      ...whatsappNumber,
      [field]: value,
    };

    validatePhoneNumber(
      newWhatsappNumber.countryCode,
      newWhatsappNumber.number
    );
  };

  // Function to validate phone number based on country code
  const validatePhoneNumber = (countryCode: string, number: string) => {
    if (!number) {
      setPhoneValidation({
        isValid: false,
        error: "",
        maxLength: getMaxLengthForCountry(countryCode),
      });
      return;
    }

    try {
      // Create full phone number for validation
      const fullNumber = `${countryCode}${number}`;
      const phoneNumber = parsePhoneNumber(fullNumber);

      if (phoneNumber && isValidPhoneNumber(fullNumber)) {
        setPhoneValidation({
          isValid: true,
          error: "",
          maxLength: getMaxLengthForCountry(countryCode),
        });
      } else {
        setPhoneValidation({
          isValid: false,
          error: `Invalid phone number for ${countryCode}`,
          maxLength: getMaxLengthForCountry(countryCode),
        });
      }
    } catch (error) {
      setPhoneValidation({
        isValid: false,
        error: `Invalid phone number format`,
        maxLength: getMaxLengthForCountry(countryCode),
      });
    }
  };

  // Function to get max length for different country codes
  const getMaxLengthForCountry = (countryCode: string): number => {
    const maxLengths: { [key: string]: number } = {
      "+212": 9, // Morocco
      "+33": 9, // France
      "+1": 10, // US/Canada
      "+44": 10, // UK
      "+49": 11, // Germany
      "+34": 9, // Spain
      "+39": 10, // Italy
      "+31": 9, // Netherlands
      "+32": 9, // Belgium
      "+41": 9, // Switzerland
      "+46": 9, // Sweden
      "+47": 8, // Norway
      "+45": 8, // Denmark
      "+358": 9, // Finland
      "+48": 9, // Poland
      "+420": 9, // Czech Republic
      "+36": 9, // Hungary
      "+43": 11, // Austria
      "+351": 9, // Portugal
      "+30": 10, // Greece
    };

    return maxLengths[countryCode] || 10; // Default to 10 if country not found
  };

  // Modify handleAddCity to remove dummy data generation
  const handleAddCity = async (city: string) => {
    if (!selectedCities.includes(city)) {
      try {
        // Fetch city data using the API service
        const cityData = await searchCities(city);
        console.log("API returned city data for", city, ":", cityData);
        console.log("City ID from API:", cityData?.id);

        // Transform the API response using our local interface
        if (cityData) {
          // Create a transformed city with exchanges
          const transformedCityData: CityWithExchanges = {
            city: cityData.name,
            cityId: cityData.id, // Store the city ID for the alert API
            numberOfOffices: cityData.numberOfOffices || 0,
            exchanges: (cityData.offices || []).map((office) => ({
              id: office.id,
              name: office.officeName,
              slug: office.slug,
              address: office.address,
              primaryPhoneNumber: office.primaryPhoneNumber,
              selected: true, // Select all offices by default
              isActive: office.isActive,
              isVerified: office.isVerified,
              isFeatured: office.isFeatured,
            })),
          };

          // Check if the city is already in the list
          const existingCityIndex = citiesWithExchanges.findIndex(
            (c) => c.city.toLowerCase() === city.toLowerCase()
          );

          if (existingCityIndex === -1) {
            // Add the new city if it doesn't exist
            setCitiesWithExchanges((prev) => {
              const updated = [...prev, transformedCityData];
              console.log("Updated citiesWithExchanges:", updated);
              return updated;
            });
          } else {
            // Update the existing city data
            setCitiesWithExchanges((prev) => {
              const updatedCities = [...prev];
              updatedCities[existingCityIndex] = transformedCityData;
              console.log(
                "Updated existing city in citiesWithExchanges:",
                updatedCities
              );
              return updatedCities;
            });
          }

          // Only add city to selectedCities if it has offices
          if (transformedCityData.exchanges.length > 0) {
            // Reset selected exchanges for this city
            setSelectedExchangesByCity((prev) => ({
              ...prev,
              [city]: transformedCityData.exchanges.length,
            }));

            setSelectedCities((prev) => [...prev, city]);
            setCurrentCity(city);
            setCurrentStep("exchanges");
          } else {
            console.log(
              `City ${city} has no offices, not adding to selectedCities`
            );
            setCurrentCity(city);
            setCurrentStep("exchanges");
          }
        } else {
          // Handle case where no city data is found
          console.warn(`No data found for city: ${city}`);
          toast.warning(`No exchange data found for ${city}`);
        }
      } catch (error) {
        console.error("Error adding city:", error);
        toast.error(
          `Error adding city: ${
            error instanceof Error ? error.message : "Unknown error"
          }`
        );
      }
    } else {
      handleRemoveCity(city);
    }
  };

  // Modify handleRemoveCity to clean up city-specific selected exchanges
  const handleRemoveCity = (cityToRemove: string) => {
    setSelectedCities(selectedCities.filter((city) => city !== cityToRemove));
    setCitiesWithExchanges((prev) =>
      prev.filter((cityData) => cityData.city !== cityToRemove)
    );

    // Remove the city from selected exchanges tracking
    setSelectedExchangesByCity((prev) => {
      const updatedExchanges = { ...prev };
      delete updatedExchanges[cityToRemove];
      return updatedExchanges;
    });
  };

  // Modify handleSaveExchanges to update city-specific selected exchanges
  const handleSaveExchanges = (selectedExchangeIds: string[]) => {
    console.log("Selected exchange IDs:", selectedExchangeIds);

    // Update selected exchanges for the current city
    setSelectedExchangesByCity((prev) => ({
      ...prev,
      [currentCity]: selectedExchangeIds.length,
    }));

    // If no city is found, create a default city object
    const cityToUpdate = currentCity || "Unknown City";

    setCitiesWithExchanges((prev) => {
      // Find the existing city or create a new one
      const existingCityIndex = prev.findIndex((c) => c.city === cityToUpdate);

      if (existingCityIndex !== -1) {
        // Update existing city
        const updatedCities = [...prev];
        updatedCities[existingCityIndex] = {
          ...updatedCities[existingCityIndex],
          exchanges: updatedCities[existingCityIndex].exchanges.map(
            (exchange) => ({
              ...exchange,
              selected: selectedExchangeIds.includes(exchange.id),
            })
          ),
        };

        return updatedCities;
      } else {
        // Create a new city with default values
        const defaultCity: CityWithExchanges = {
          city: cityToUpdate,
          numberOfOffices: 0,
          exchanges: [],
        };

        return [...prev, defaultCity];
      }
    });

    // If no offices were selected, remove the city from selectedCities
    if (selectedExchangeIds.length === 0) {
      setSelectedCities((prev) => prev.filter((city) => city !== currentCity));
      // Also remove from selectedExchangesByCity
      setSelectedExchangesByCity((prev) => {
        const updated = { ...prev };
        delete updated[currentCity];
        return updated;
      });
    }

    setCurrentStep("cities");
  };

  const handleSetReminder = async () => {
    // Set loading state
    setIsSubmitting(true);

    try {
      // Format the phone number with country code (remove any non-digit characters)
      const formattedWhatsAppNumber =
        `${whatsappNumber.countryCode}${whatsappNumber.number}`.replace(
          /[^\d+]/g,
          ""
        );

      // Determine trigger type based on the form type
      const triggerType = areaType === "area" ? "CITY" : "OFFICE";

      // Get all selected exchanges or cities
      let officeIds: string[] = [];
      let cityIds: string[] = [];

      if (triggerType === "OFFICE") {
        // For OFFICE trigger type, collect all selected exchange IDs
        citiesWithExchanges.forEach((cityData) => {
          cityData.exchanges.forEach((exchange) => {
            if (exchange.selected) {
              officeIds.push(exchange.id);
            }
          });
        });

        // If no offices are selected, show an error
        if (officeIds.length === 0) {
          toast.error("Please select at least one exchange office");
          setIsSubmitting(false);
          return;
        }
      } else {
        // For CITY trigger type, collect actual city IDs from the citiesWithExchanges data
        cityIds = [];

        // Fallback city IDs in case the API doesn't provide them
        const cityIdFallbacks: { [key: string]: string } = {
          Rabat: "cfa02218-94f5-459b-b7a5-8ca1aad69e7a",
          Casablanca: "70d4415d-eece-411d-9285-37c57145bafe",
          Marrakech: "7b01fa5b-21b2-4b87-a3b7-77d4f30c4bfb",
          Tanger: "9c2c0186-c2b0-4a5c-babc-5c4a1e3e3f3e",
          Fès: "8d4e17a3-7d76-4b8f-b690-d89e3d2f4e8e",
          Agadir: "a5e2f2c1-3b4c-4d5e-9f8a-7b6c5d4e3f2a",
        };

        // Loop through selected cities and find their IDs in our citiesWithExchanges data
        for (const cityName of selectedCities) {
          const cityData = citiesWithExchanges.find((c) => c.city === cityName);

          if (cityData && cityData.cityId) {
            console.log(
              `Found city ID for ${cityName} from API:`,
              cityData.cityId
            );
            cityIds.push(cityData.cityId);
          } else if (cityIdFallbacks[cityName]) {
            // Use fallback ID if available
            console.log(
              `Using fallback ID for ${cityName}:`,
              cityIdFallbacks[cityName]
            );
            cityIds.push(cityIdFallbacks[cityName]);
          } else {
            console.warn(`No city ID found for ${cityName} in:`, cityData);
          }
        }

        // If no valid city IDs are found, show error
        if (cityIds.length === 0) {
          toast.error(
            "Could not find valid IDs for selected cities. Please try again or use Exchange Office mode."
          );
          setIsSubmitting(false);
          return;
        }

        console.log("City IDs for alert:", cityIds);
      }

      // Create the alert request payload
      const alertData: AlertRequest = {
        triggerType,
        whatsAppNumber: formattedWhatsAppNumber,
        currency: sourceCurrency.code,
        baseCurrencyAmount: parseFloat(sourceCurrencyAmount),
        targetCurrencyAmount: parseFloat(targetRate),
        targetCurrency: targetCurrency.code,
      };

      // Add either offices or cities based on trigger type
      if (triggerType === "OFFICE") {
        alertData.offices = officeIds;
        console.log("Final OFFICE payload with office IDs:", officeIds);
      } else {
        alertData.cities = cityIds;
        console.log("Final CITY payload with city IDs:", cityIds);
      }

      console.log(
        "Submitting alert request:",
        JSON.stringify(alertData, null, 2)
      );

      // Call the API
      const response = await createAlert(alertData);

      if (response.success) {
        console.log("Alert created successfully:", response.data);

        // Store current values before showing success modal
        const currentData = {
          sourceCurrencyAmount: sourceCurrencyAmount,
          sourceCurrencyCode: sourceCurrency.code,
          targetRate: targetRate,
          targetCurrencyCode: targetCurrency.code,
          location: selectedCities.length > 0 ? selectedCities[0] : "Rabat",
        };

        // Store current form values for success modal
        localStorage.setItem("whatsappAlertData", JSON.stringify(currentData));

        // Show success modal
        setIsSuccessModalOpen(true);

        // Reset only the active form
        if (areaType === "area") {
          // Reset area form
          setAreaWhatsappNumber({
            countryCode: "+212",
            number: "",
          });
          setAreaSourceCurrencyAmount("1");
          setAreaTargetRate("0.11");
          setAreaSelectedCities([]);
          setAreaCitiesWithExchanges([]);
          setAreaSourceCurrency(
            currencies.find((c) => c.code === "MAD") || currencies[5]
          );
          setAreaTargetCurrency(
            currencies.find((c) => c.code === "USD") || currencies[0]
          );
        } else {
          // Reset exchange form
          setExchangeWhatsappNumber({
            countryCode: "+212",
            number: "",
          });
          setExchangeSourceCurrencyAmount("1");
          setExchangeTargetRate("0.11");
          setExchangeSelectedCities([]);
          setExchangeCitiesWithExchanges([]);
          setExchangeSourceCurrency(
            currencies.find((c) => c.code === "MAD") || currencies[5]
          );
          setExchangeTargetCurrency(
            currencies.find((c) => c.code === "USD") || currencies[0]
          );
        }

        // Reset common state
        setWhatsappNumber({
          countryCode: "+212",
          number: "",
        });
        setSourceCurrencyAmount("1");
        setTargetRate("0.11");
        setSelectedCities([]);
        setCitiesWithExchanges([]);
        setIsTermsAccepted(false);
        setSourceCurrency(
          currencies.find((c) => c.code === "MAD") || currencies[5]
        );
        setTargetCurrency(
          currencies.find((c) => c.code === "USD") || currencies[0]
        );
      } else {
        console.error("Failed to create alert:", response);

        // Extract more specific error information for debugging
        let errorDetails = "Unknown error";
        if (response.message) {
          errorDetails = response.message;
        } else if (response.error) {
          errorDetails =
            typeof response.error === "string"
              ? response.error
              : JSON.stringify(response.error);
        }

        // Display detailed error message
        toast.error(`Failed to set alert: ${errorDetails}`, {
          position: "top-center",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });

        // Log the full request for debugging
        console.log("Full alert request payload:", {
          url: "https://exchango.opineomanager.com/api/v1/alerts",
          method: "POST",
          payload: alertData,
          triggerType,
          error: errorDetails,
        });
      }
    } catch (error) {
      console.error("Error setting reminder:", error);
      toast.error(
        "An error occurred while setting the alert. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSuccessModal = () => {
    // Clean up stored data
    localStorage.removeItem("whatsappAlertData");
    setIsSuccessModalOpen(false);
    onClose();
  };

  // Modify getSelectedExchangesCount to use the new city-specific tracking
  const getSelectedExchangesCount = (city: string): number => {
    const cityData = citiesWithExchanges.find((c) => c.city === city);
    if (!cityData || !cityData.exchanges) return 0;

    // First, check if we have a tracked count for this city
    if (selectedExchangesByCity[city] !== undefined) {
      // If the tracked count is 0, don't show this city
      if (selectedExchangesByCity[city] === 0) {
        return -1; // Special value to indicate city should be hidden
      }
      return selectedExchangesByCity[city];
    }

    // Count exchanges that are explicitly marked as selected
    const selectedCount = cityData.exchanges.filter(
      (exchange) => exchange.selected === true
    ).length;

    // If no exchanges are explicitly selected but there are exchanges,
    // it means all are selected by default
    if (selectedCount === 0 && cityData.exchanges.length > 0) {
      return cityData.exchanges.length;
    }

    return selectedCount;
  };

  const isFormValid = (): boolean => {
    return (
      selectedCities.length > 0 &&
      whatsappNumber.number.trim() !== "" &&
      phoneValidation.isValid && // Add phone validation check
      sourceCurrencyAmount.trim() !== "" &&
      targetRate.trim() !== ""
    );
  };

  if (!isOpen) return null;

  if (isSuccessModalOpen) {
    // Retrieve the stored data for the success modal
    const storedDataString = localStorage.getItem("whatsappAlertData");
    let modalData = {
      sourceCurrencyAmount: "1",
      sourceCurrencyCode: "MAD",
      targetRate: "0.10",
      targetCurrencyCode: "USD",
      location: "Rabat",
    };

    if (storedDataString) {
      try {
        const parsedData = JSON.parse(storedDataString);
        modalData = {
          ...modalData,
          ...parsedData,
        };
      } catch (e) {
        console.error("Error parsing stored alert data:", e);
      }
    }

    return (
      <AlarmRateSuccessfullySetModal
        isOpen={isSuccessModalOpen}
        onClose={handleCloseSuccessModal}
        sourceCurrencyAmount={modalData.sourceCurrencyAmount}
        sourceCurrencyCode={modalData.sourceCurrencyCode}
        targetRate={modalData.targetRate}
        targetCurrencyCode={modalData.targetCurrencyCode}
        location={modalData.location}
      />
    );
  }

  const title =
    areaType === "area"
      ? "Whatsapp Alert By Entire Area"
      : "Whatsapp Alert By Exchange office";

  const handleCheckboxChange = (checked: boolean) => {
    setIsTermsAccepted(checked);
  };

  const handleSwapCurrencies = () => {
    setIsSwapping(true);
    const temp = sourceCurrency;
    setSourceCurrency(targetCurrency);
    setTargetCurrency(temp);
    setTimeout(() => setIsSwapping(false), 300);
  };

  // Add the missing currency change handlers
  const handleSourceCurrencyChange = (currency: Currency) => {
    if (currency.code === targetCurrency.code) {
      setTargetCurrency(sourceCurrency);
    } else if (currency.code !== "MAD" && targetCurrency.code !== "MAD") {
      setTargetCurrency(currencies.find((c) => c.code === "MAD")!);
    }
    setSourceCurrency(currency);
  };

  const handleTargetCurrencyChange = (currency: Currency) => {
    if (currency.code === sourceCurrency.code) {
      // Swap currencies.
      setSourceCurrency(targetCurrency);
    } else if (currency.code !== "MAD" && sourceCurrency.code !== "MAD") {
      setSourceCurrency(currencies.find((c) => c.code === "MAD")!);
    }
    setTargetCurrency(currency);
  };

  const formatDecimalInput = (value: string): string => {
    let cleaned = value.replace(/[^0-9.]/g, "");

    const parts = cleaned.split(".");

    if (parts.length > 2) {
      cleaned = parts[0] + "." + parts.slice(1).join("");
    }

    if (parts.length === 2 && parts[1].length > 2) {
      cleaned = parts[0] + "." + parts[1].substring(0, 2);
    }

    // Prevent values less than 1
    const numericValue = parseFloat(cleaned);
    if (!isNaN(numericValue) && numericValue < 1) {
      return "1";
    }

    // Handle edge cases
    if (cleaned === "0" || cleaned === "0.") {
      return "1";
    }

    if (cleaned.startsWith("0.") && parseFloat(cleaned) < 1) {
      return "1";
    }

    return cleaned;
  };

  // Modify the current step rendering to handle empty exchanges
  if (currentStep === "exchanges") {
    // Find the current city's data
    const currentCityData = citiesWithExchanges.find(
      (c) => c.city.toLowerCase() === currentCity.toLowerCase()
    );

    console.log("currentCityData", currentCityData);

    // If no city data is found, create a default object
    const safeCurrentCityData: CityWithExchanges = currentCityData || {
      city: currentCity || "Unknown City",
      numberOfOffices: 0,
      exchanges: [],
    };

    console.log("safeCurrentCityData", safeCurrentCityData);

    return (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/20 sm:p-4 p-2">
        <div className="bg-white rounded-[16px] sm:rounded-[20px] w-full max-w-full sm:w-[90%] sm:max-w-[529px] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto hide-scrollbar pt-4 sm:pt-6 md:pt-9">
          <ExchangeSelection
            city={safeCurrentCityData.city}
            cityData={safeCurrentCityData}
            onBack={(selectedCount) => {
              setCurrentStep("cities");
              // Pass the number of selected exchanges back to the parent
              // This is a placeholder, in a real scenario, you'd update the parent's state
              // For now, we'll just log it.
              setSelectedExchanges(selectedCount.length);
              console.log("Selected exchanges count:", selectedCount.length);
            }}
            onSave={handleSaveExchanges}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 sm:p-4 p-2">
      <div className="bg-white rounded-[16px] sm:rounded-[20px] w-full max-w-full sm:w-[90%] sm:max-w-[529px] max-h-[95vh] sm:max-h-[90vh] overflow-y-auto hide-scrollbar">
        <div className="px-3 sm:px-5 md:px-10 pt-4 sm:pt-6 md:pt-9 pb-4 sm:pb-5">
          <div className="mb-5 sm:mb-7 md:mb-4 flex justify-between items-center">
            <button
              onClick={onBack}
              className="flex items-center gap-1.5 cursor-pointer text-[#585858] text-[14px] sm:text-[16px] leading-[22px]"
            >
              <ArrowBack /> Back
            </button>
            <button
              onClick={onClose}
              className="cursor-pointer sm:block hidden"
            >
              <Image
                src="/assets/close-circle.svg"
                alt="close"
                width={24}
                height={24}
              />
            </button>
          </div>

          <h2 className="text-[18px] sm:text-[20px] leading-[22px] sm:leading-[24px] font-bold text-[#111111]">
            {title}
          </h2>
          <p className="mt-2 text-[13px] sm:text-[14px] leading-[18px] sm:leading-[20px] text-[#585858] max-w-full sm:max-w-[400px]">
            Get an immediate WhatsApp notification when your target rate becomes
            available near you.
          </p>

          <div className="w-full mt-3 sm:mt-4 md:mt-8">
            {/* City Input Field */}
            <div className="mb-1.5 sm:mb-2 w-full relative bg-white border border-[#DEDEDE] rounded-lg flex items-center px-3 sm:px-4 py-2 sm:py-2.5 min-h-[42px] sm:min-h-[46px] md:min-h-[56px]">
              <label className="absolute -top-2 left-2 sm:left-2.5 text-[#111111] bg-white px-1 sm:px-1.5 text-[10px] sm:text-xs leading-[14px] sm:leading-[17px] font-medium">
                City
              </label>
              <CitySearch
                selectedExchanges={selectedExchanges}
                onSelectCity={handleAddCity}
                selectedCities={selectedCities}
                getSelectedExchangesCount={getSelectedExchangesCount}
              />
            </div>
            <p className="mb-3 sm:mb-4 ml-3 sm:ml-4 text-[#585858] text-[11px] sm:text-[12px] leading-[15px] sm:leading-[17px] font-normal">
              *You can select multiple cities
            </p>

            {/* Rest of the form */}
            <div className="mb-3 sm:mb-4 md:mb-8 w-full relative bg-white border border-[#DEDEDE] rounded-lg flex items-center sm:py-[18px] px-3 sm:px-4 h-[42px] sm:h-[46px] md:h-[56px]">
              <label className="absolute -top-2 left-2 sm:left-2.5 text-[#111111] bg-white px-1 sm:px-1.5 text-[10px] sm:text-xs leading-[14px] sm:leading-[17px] font-medium">
                WhatsApp Number
              </label>
              <div className="flex items-center w-full">
                <CountryCodeDropdown
                  onChange={(value) =>
                    handleWhatsappNumberChange(
                      "countryCode",
                      value?.code || "+212"
                    )
                  }
                />
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="Type your WhatsApp number"
                  value={whatsappNumber.number}
                  maxLength={phoneValidation.maxLength}
                  onChange={(e) => {
                    const numericValue = e.target.value.replace(/[^0-9]/g, "");
                    // Limit input to max length for the selected country
                    const limitedValue = numericValue.slice(
                      0,
                      phoneValidation.maxLength
                    );
                    handleWhatsappNumberChange("number", limitedValue);
                  }}
                  onKeyPress={(e) => {
                    if (!/[0-9]/.test(e.key)) {
                      e.preventDefault();
                    }
                  }}
                  className={`ml-1 sm:ml-1.5 md:ml-4 flex-1 w-full sm:w-[300px] bg-transparent border-0 smaller outline-none text-[#111111] placeholder-[#585858] text-[13px] sm:text-sm leading-[18px] sm:leading-[20px] font-normal ${
                    isWhatsAppSame ? "opacity-50 cursor-not-allowed" : ""
                  } ${phoneValidation.error ? "text-red-500" : ""}`}
                  required
                />
              </div>
            </div>
            {/* Dropdowns */}
            <div className="mb-3 sm:mb-4 md:mb-6 w-full">
              <div className="w-full flex items-start sm:flex-row flex-col gap-3 sm:gap-4 md:gap-3 h-full">
                <motion.div
                  className="w-full sm:max-w-[200px]"
                  animate={
                    isSwapping ? { x: [0, 20, 0], scale: [1, 0.95, 1] } : {}
                  }
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <motion.div
                    animate={isSwapping ? { opacity: [1, 0.7, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <CurrencyDropdown
                      label="Source Currency"
                      selectedCurrency={sourceCurrency}
                      onCurrencyChange={handleSourceCurrencyChange}
                      placeholder="Select Currency"
                      isOpen={openDropdown === "source"}
                      onToggle={() =>
                        setOpenDropdown(
                          openDropdown === "source" ? null : "source"
                        )
                      }
                    />
                  </motion.div>
                  <h3 className="pl-3 sm:pl-4 mt-1 sm:mt-1.5 text-[#585858] text-[9px] sm:text-[10px] md:text-[12px] font-normal leading-[12px] sm:leading-[14px] md:leading-[17px]">
                    1 {sourceCurrency.code} ={" "}
                    {exchangeRates[sourceCurrency.code]?.[
                      targetCurrency.code
                    ] || "N/A"}{" "}
                    {targetCurrency.code}
                  </h3>
                </motion.div>

                {/* Swap Button */}
                <div className="sm:mt-4 flex items-center justify-center gap-2.5 sm:gap-3.5 md:gap-0 w-full sm:min-w-[24.33px] sm:w-[24.33px]">
                  <div className="w-full bg-[#DEDEDE] h-[1px] sm:hidden block"></div>
                  <motion.button
                    onClick={handleSwapCurrencies}
                    disabled={isSwapping}
                    aria-label="Swap currencies"
                    className="cursor-pointer"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    animate={isSwapping ? { rotate: 35 } : { rotate: 0 }}
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
                        isSwapping
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
                        src="/assets/refresh-circle.svg"
                        alt="refresh-circle"
                        width={24.33}
                        height={24.33}
                        className="min-w-[24.33px]"
                      />
                    </motion.div>
                  </motion.button>
                  <div className="w-full bg-[#DEDEDE] h-[1px] sm:hidden block"></div>
                </div>

                <motion.div
                  className="w-full sm:max-w-[200px]"
                  animate={
                    isSwapping ? { x: [0, -20, 0], scale: [1, 0.95, 1] } : {}
                  }
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <motion.div
                    animate={isSwapping ? { opacity: [1, 0.7, 1] } : {}}
                    transition={{ duration: 0.3 }}
                  >
                    <CurrencyDropdown
                      label="Target Currency"
                      selectedCurrency={targetCurrency}
                      onCurrencyChange={handleTargetCurrencyChange}
                      placeholder="Select Currency"
                      isOpen={openDropdown === "target"}
                      onToggle={() =>
                        setOpenDropdown(
                          openDropdown === "target" ? null : "target"
                        )
                      }
                    />
                  </motion.div>
                  <h3 className="pl-3 sm:pl-4 mt-1 sm:mt-1.5 text-[#585858] text-[9px] sm:text-[10px] md:text-[12px] font-normal leading-[12px] sm:leading-[14px] md:leading-[17px]">
                    1 {targetCurrency.code} ={" "}
                    {exchangeRates[targetCurrency.code]?.[
                      sourceCurrency.code
                    ] || "N/A"}{" "}
                    {sourceCurrency.code}
                  </h3>
                </motion.div>
              </div>
            </div>

            <div>
              <h2 className="mb-3 sm:mb-5 md:mb-[18px] text-[#111111] text-[13px] sm:text-[14px] leading-[16px] sm:leading-[17px] font-bold">
                Alert me when{" "}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 md:gap-[17px]">
                <CustomInput
                  label="Source Currency"
                  placeholder={`1 ${sourceCurrency.code}`}
                  value={sourceCurrencyAmount}
                  onChange={(e) => {
                    const formattedValue = formatDecimalInput(e.target.value);
                    setSourceCurrencyAmount(formattedValue);
                  }}
                  className="!h-[42px] sm:!h-[46px] md:!h-[56px] p-0 flex items-center"
                />
                <CustomInput
                  label="Your Target Rate"
                  placeholder={`${
                    exchangeRates[sourceCurrency.code]?.[targetCurrency.code] ||
                    "0.10"
                  }`}
                  value={targetRate}
                  onChange={(e) => {
                    const formattedValue = formatDecimalInput(e.target.value);
                    setTargetRate(formattedValue);
                  }}
                  className="!h-[42px] sm:!h-[46px] md:!h-[56px] p-0 flex items-center"
                />
              </div>
              <h3 className="sm:ml-0 ml-3 sm:ml-4 mt-1 sm:mt-1.5 md:mt-2.5 text-[#585858] text-[9px] sm:text-[10px] md:text-[12px] leading-[12px] sm:leading-[14px] md:leading-[17px] font-normal">
                Notify me when {sourceCurrencyAmount || "1"}{" "}
                {sourceCurrency.code} exceeds {targetRate || "0.10"}{" "}
                {targetCurrency.code}
              </h3>
            </div>

            <div className="mt-3 sm:mt-4 flex items-start gap-2 sm:gap-2.5 md:gap-1.5">
              <Checkbox
                checked={isTermsAccepted}
                onChange={handleCheckboxChange}
                className="w-4 sm:w-5 h-4 sm:h-5"
              />
              <h3 className="text-[#585858] text-[11px] sm:text-[12px] leading-[15px] sm:leading-[17px] font-normal text-left">
                Add me to your newsletter and keep me updated whenever you
                publish new exchange rates. By checking this box, I agree to the{" "}
                <a
                  href="/terms-and-conditions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#20523C] hover:underline"
                >
                  Terms of Service
                </a>{" "}
                and{" "}
                <a
                  href="/mentions-legales"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#20523C] hover:underline"
                >
                  Legal Notice
                </a>
                .
              </h3>
            </div>

            <div className="mt-4 sm:mt-5 md:mt-10 flex items-end justify-end">
              <GradientButton
                className="h-[42px] sm:h-[46px] w-full sm:w-fit"
                onClick={handleSetReminder}
                disabled={!isFormValid() || isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className="mr-2">Setting...</span>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  </>
                ) : (
                  "Set Reminder"
                )}
              </GradientButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatsAppAlertFormModal;
