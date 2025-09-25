import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoiZXhjaGFuZ28yNCIsImEiOiJjbWJobzNtbXkwYzd2MmtzZ3M0Nmlhem1wIn0.WWU3U5Ur4wsdKokNEk1DZQ";

interface Location {
  id: string;
  name: string;
  country: string;
  flag: string;
  region?: string;
  coordinates?: {
    lng: number;
    lat: number;
  };
}

// Preloaded cities for quick access
const locations: Location[] = [
  {
    id: "1",
    name: "Casablanca",
    country: "Maroc",
    flag: "/assets/flags/ma.svg",
  },
  {
    id: "2",
    name: "Rabat",
    country: "Maroc",
    flag: "/assets/flags/ma.svg",
  },
  {
    id: "3",
    name: "Fès",
    country: "Maroc",
    flag: "/assets/flags/ma.svg",
  },
  {
    id: "4",
    name: "Tanger",
    country: "Maroc",
    flag: "/assets/flags/ma.svg",
  },
  {
    id: "5",
    name: "Agadir",
    country: "Maroc",
    flag: "/assets/flags/ma.svg",
  },
  {
    id: "6",
    name: "Marrakech",
    country: "Maroc",
    flag: "/assets/flags/ma.svg",
  },
];

interface LocationDropdownProps {
  label: string;
  selectedLocation: Location | null;
  onLocationChange: (location: Location | null) => void;
  placeholder?: string;
  isOpen: boolean;
  onToggle: () => void;
}

const LocationDropdown: React.FC<LocationDropdownProps> = ({
  label,
  selectedLocation,
  onLocationChange,
  placeholder = "Search cities in Morocco...",
  isOpen,
  onToggle,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
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

  // Filter the preloaded Morocco cities by search term
  const filteredLocations = locations.filter((loc) =>
    loc.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Fetch Mapbox suggestions if searchTerm is present
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 1) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    if (debounceTimeout) {
      clearTimeout(debounceTimeout);
    }

    // Reduced debounce from 300ms to 150ms for faster response
    const timeout = setTimeout(() => {
    setIsLoading(true);
      fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchTerm
        )}.json?access_token=${MAPBOX_TOKEN}&types=place&limit=5&country=MA&language=fr`
      )
        .then((response) => response.json())
        .then((data) => {
      if (data.features && data.features.length > 0) {
            const mapboxSuggestions: Location[] = data.features.map(
          (place: any, index: number) => {
                const country =
                  place.context?.find((ctx: any) =>
                    ctx.id.startsWith("country")
                  )?.text || "Morocco";
            const region =
              place.context?.find(
                (ctx: any) =>
                      ctx.id.startsWith("region") ||
                      ctx.id.startsWith("district")
              )?.text || "";
            const [lng, lat] = place.center;
            return {
              id: `mapbox-${index}-${place.id}`,
              name: place.text,
              country: country,
              region: region,
              flag: "/assets/flags/ma.svg",
              coordinates: { lng, lat },
            };
          }
        );
            // Remove duplicates (by name) with preloaded cities
            const uniqueMapbox = mapboxSuggestions.filter(
              (s) =>
                !filteredLocations.some(
                  (l) => l.name.toLowerCase() === s.name.toLowerCase()
                )
            );
            setSuggestions(uniqueMapbox);
      } else {
        setSuggestions([]);
      }
        })
        .catch(() => setSuggestions([]))
        .finally(() => setIsLoading(false));
    }, 150);

    setDebounceTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSelect = (location: Location) => {
    onLocationChange(location);
    onToggle();
    setSearchTerm("");
    // Fire event for map if coordinates exist
    if (location.coordinates) {
      const customEvent = new CustomEvent("userLocationChanged", {
        detail: {
          lat: location.coordinates.lat,
          lng: location.coordinates.lng,
          name: location.name,
        },
      });
      window.dispatchEvent(customEvent);
    }
  };

  const fetchCityName = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_TOKEN}&types=place&limit=1`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch city name");
      }
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        return data.features[0].text;
      }
      return "Current Location";
    } catch (error) {
      console.error("Error fetching city name:", error);
      return "Current Location";
    }
  };

  const handleGetCurrentLocation = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser.");
      return;
    }

    const handleSuccess = async (position: GeolocationPosition) => {
      const { latitude, longitude } = position.coords;
      const cityName = await fetchCityName(latitude, longitude);

      const currentLocation: Location = {
              id: "current",
              name: cityName,
        country: "Morocco",
              flag: "/assets/flags/ma.svg",
              coordinates: { lat: latitude, lng: longitude },
            };

      onLocationChange(currentLocation);
            onToggle();

      // Dispatch event for map
      const customEvent = new CustomEvent("userLocationChanged", {
        detail: {
          lat: latitude,
          lng: longitude,
          name: cityName,
        },
      });
      window.dispatchEvent(customEvent);
    };

    const handleError = (error: GeolocationPositionError) => {
      console.warn(
        `High accuracy failed (${error.message}), trying low accuracy.`
      );
      // If high accuracy fails, try with low accuracy
      navigator.geolocation.getCurrentPosition(
        handleSuccess,
        (finalError) => {
          console.error(
            "Error getting location (both high and low accuracy failed):",
            finalError
          );
        },
        { enableHighAccuracy: false } // Low accuracy
      );
    };

    // First attempt: High Accuracy
    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 5000, // 5 seconds
      maximumAge: 0,
    });
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label className="block text-[#111111] text-[12px] sm:text-[14px] font-medium leading-[17px] sm:leading-[20px] mb-1">
        {label}
      </label>
      <div
        className="w-full flex items-center justify-between cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2.5 flex-1">
          <Image
            src="/assets/location-icon.svg"
            alt="location"
            width={18}
            height={18}
            className="rounded-full w-[18px] h-[18px] object-cover"
          />
          <span className="text-[#585858] text-[14px] sm:text-[18px] leading-[20px] sm:leading-[25px] font-normal truncate max-w-[150px]">
            {selectedLocation
              ? `${selectedLocation.name} - ${
                  selectedLocation.region ||
                  selectedLocation.country.slice(0, 3)
                }`
              : "Select a city"}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="cursor-pointer" onClick={handleGetCurrentLocation}>
            <Image src="/assets/gps.svg" alt="gps" width={24} height={24} />
          </button>
        </div>
      </div>
      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute top-full left-0 py-1 right-0 mt-3 bg-white rounded-md z-50"
          style={{
            boxShadow: "0px 30px 80px 0px #00000029, 0px 4px 4px 0px #00000014",
          }}
        >
          {/* Search input at the top of dropdown */}
          <div className="px-3 pt-3 pb-2">
            <div className="relative w-full">
              <Image
                src="/assets/search-normal.svg"
                alt="search"
                width={17}
                height={17}
                className="absolute left-2 top-1/2 -translate-y-1/2"
              />
              <input
                type="text"
                placeholder={placeholder}
                value={searchTerm}
                onChange={handleSearchChange}
                className="w-full pl-8 pr-2 py-2 rounded-md border border-[#DEDEDE] smaller text-[14px] text-[#585858] placeholder:text-[#ACACAC] focus:outline-none"
                autoFocus
              />
            </div>
          </div>
          <div className="max-h-40 overflow-y-auto hide-scrollbar">
            {/* Use my current location option */}
            <button
              onClick={handleGetCurrentLocation}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#dcff8c] cursor-pointer text-left transition-colors border-b border-[#DEDEDE]"
            >
              <Image src="/assets/gps.svg" alt="gps" width={18} height={18} />
              <span className="text-[#20523C] text-[15px] font-medium">
                Use my current location
              </span>
            </button>
            {isLoading ? (
              <div className="flex items-center justify-center py-3">
                <div className="w-5 h-5 border-2 border-[#20523C] border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2 text-[#585858] text-[14px]">
                  Searching...
                </span>
              </div>
            ) : (
              <>
                {/* Display preloaded locations */}
                {filteredLocations.length > 0 &&
                  filteredLocations.map((location, index) => (
                    <button
                      key={location.id}
                      onClick={() => handleSelect(location)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#dcff8c] cursor-pointer text-left transition-colors ${
                        location.id === selectedLocation?.id
                          ? "bg-[#F1F1F1]"
                          : ""
                      } ${
                        index !== filteredLocations.length - 1 ||
                        suggestions.length > 0
                          ? "border-b border-[#DEDEDE]"
                          : ""
                      }`}
                    >
                      <Image
                        src="/assets/location-icon.svg"
                        alt="location"
                        width={18}
                        height={18}
                      />
                      <div className="flex flex-col items-start">
                        <span className="text-[#111111] text-[15px] font-semibold">
                          {location.name}
                        </span>
                        <span className="text-[#585858] text-[13px]">
                          {location.country}
                        </span>
                      </div>
                    </button>
                  ))}

                {/* Display API suggestions */}
                {suggestions.length > 0 &&
                  suggestions.map((location, index) => (
                <button
                  key={location.id}
                  onClick={() => handleSelect(location)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#dcff8c] cursor-pointer text-left transition-colors ${
                        location.id === selectedLocation?.id
                          ? "bg-[#F1F1F1]"
                          : ""
                  } ${
                        index !== suggestions.length - 1
                      ? "border-b border-[#DEDEDE]"
                      : ""
                  }`}
                >
                  <Image
                    src="/assets/location-icon.svg"
                    alt="location"
                    width={18}
                    height={18}
                  />
                  <div className="flex flex-col items-start">
                    <span className="text-[#111111] text-[15px] font-semibold">
                      {location.name}
                    </span>
                    {location.region && (
                      <span className="text-[#585858] text-[13px]">
                        {location.region}
                      </span>
                    )}
                  </div>
                </button>
                  ))}
              </>
            )}
            {filteredLocations.length === 0 &&
              suggestions.length === 0 &&
              !isLoading && (
              <div className="text-[#585858] text-center py-3 text-[14px]">
                No locations found in Morocco
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationDropdown;
