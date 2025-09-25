import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";

// Define the access token properly
const MAPBOX_TOKEN =
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
  },
  {
    id: "2",
    name: "Rabat",
    country: "Maroc",
    flag: "/assets/location-icon.svg",
  },
  {
    id: "3",
    name: "Fès",
    country: "Maroc",
    flag: "/assets/location-icon.svg",
  },
  {
    id: "4",
    name: "Tanger",
    country: "Maroc",
    flag: "/assets/location-icon.svg",
  },
  {
    id: "5",
    name: "Agadir",
    country: "Maroc",
    flag: "/assets/location-icon.svg",
  },
  {
    id: "6",
    name: "Marrakech",
    country: "Maroc",
    flag: "/assets/location-icon.svg",
  },
];

interface LocationDropdownProps {
  label: string;
  selectedLocation: Location;
  onLocationChange: (location: Location) => void;
  placeholder?: string;
  isOpen: boolean;
  onToggle: () => void;
}

const LocationDropdown: React.FC<LocationDropdownProps> = ({
  label,
  selectedLocation,
  onLocationChange,
  placeholder = "Place holder",
  isOpen,
  onToggle,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [suggestions, setSuggestions] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
    if (!searchTerm) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }
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
                place.context?.find((ctx: any) => ctx.id.startsWith("country"))
                  ?.text || "";
              const [lng, lat] = place.center;
              return {
                id: `mapbox-${index}-${place.id}`,
                name: place.text,
                country: country,
                flag: "/assets/location-icon.svg",
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
  }, [searchTerm]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSelect = async (location: Location) => {
    // Always pass the location to parent - let SearchBar handle geocoding
    onLocationChange(location);
    onToggle();
    setSearchTerm("");
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

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        const cityName = await fetchCityName(latitude, longitude);

        const currentLocation: Location = {
          id: "current-location",
          name: `${cityName}`,
          country: "Based on your browser",
          flag: "/assets/location-icon.svg",
          coordinates: { lat: latitude, lng: longitude },
        };

        onLocationChange(currentLocation);
        onToggle();
        // We no longer dispatch events here - the parent SearchBar component will handle this when Check Rates is clicked
      });
    } else {
      console.error("Geolocation is not supported by this browser.");
      // Handle the case where geolocation is not available
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <label
        className={`absolute -top-2 left-3 z-10 bg-white px-1.5 text-[#111111] text-[12px] font-medium leading-[17px]`}
      >
        {label}
      </label>
      <div
        className={`w-full flex items-center justify-between cursor-pointer rounded-[10px] min-w-[157px] h-[46px] md:h-[56px] px-4 transition duration-200 ${
          isOpen
            ? "border border-[#20523C]"
            : "border-[#DEDEDE] border hover:border-[#20523C]"
        }`}
        onClick={onToggle}
      >
        <div className="flex items-center gap-1 sm:gap-2.5 flex-1">
          <Image
            src="/assets/location-icon.svg"
            alt="location"
            width={18.25}
            height={18.25}
            className="md:w-[18.25px] w-[16.22px]"
          />
          {isOpen ? (
            <input
              type="text"
              placeholder={placeholder}
              value={searchTerm}
              onChange={handleSearchChange}
              onClick={(e) => e.stopPropagation()}
              className="flex-1 text-[14px] leading-[20px] font-normal smaller text-[#9CA3AF] placeholder:text-[#ACACAC] text-nowrap truncate bg-transparent border-none outline-none"
              autoFocus
            />
          ) : (
            <span className="text-[#585858] text-[14px] leading-[20px] font-normal truncate ">
              {selectedLocation.name}
            </span>
          )}
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className="absolute top-full left-0 py-1 right-0 mt-1 sm:mt-3 bg-white rounded-md z-50"
          style={{
            boxShadow: "0px 30px 80px 0px #00000029, 0px 4px 4px 0px #00000014",
          }}
        >
          <div className="max-h-60 overflow-y-auto hide-scrollbar">
            {/* Search Input */}
            <div className="p-2">
              <div className="flex items-center gap-2 border border-[#DEDEDE] rounded-md px-3 py-2">
                <Image
                  src="/assets/search-normal.svg"
                  width={18}
                  height={18}
                  alt="search"
                />
                <input
                  type="text"
                  placeholder={placeholder}
                  value={searchTerm}
                  onChange={handleSearchChange}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full text-[14px] leading-[20px] font-normal smaller text-[#9CA3AF] placeholder:text-[#ACACAC] bg-transparent border-none outline-none"
                  autoFocus
                />
              </div>
            </div>

            {/* Use Current Location */}
            <button
              onClick={handleUseCurrentLocation}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-[#20523C] hover:bg-[#F1F1F1] transition-colors border-b border-[#DEDEDE]"
            >
              <Image src="/assets/gps.svg" width={18} height={18} alt="gps" />
              <span className="text-[14px] leading-[20px] font-medium">
                Use my current location
              </span>
            </button>

            {filteredLocations.length > 0 &&
              filteredLocations.map((location, index) => (
                <button
                  key={location.id}
                  onClick={() => handleSelect(location)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#F1F1F1] text-left transition-colors ${
                    location.id === selectedLocation.id ? "bg-[#F1F1F1]" : ""
                  } ${
                    index !== filteredLocations.length - 1 ||
                    suggestions.length > 0
                      ? "border-b border-[#DEDEDE]"
                      : ""
                  }`}
                >
                  <Image
                    src={location.flag}
                    width={18}
                    height={18}
                    alt={location.name}
                  />
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
                </button>
              ))}
            {isLoading ? (
              <div className="flex items-center justify-center py-3">
                <div className="w-5 h-5 border-2 border-[#20523C] border-t-transparent rounded-full animate-spin"></div>
                <span className="ml-2 text-[#585858] text-[14px]">
                  Searching...
                </span>
              </div>
            ) : (
              suggestions.length > 0 &&
              suggestions.map((location, index) => (
                <button
                  key={location.id}
                  onClick={() => handleSelect(location)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 hover:bg-[#F1F1F1] text-left transition-colors ${
                    location.id === selectedLocation.id ? "bg-[#F1F1F1]" : ""
                  } ${
                    index !== suggestions.length - 1
                      ? "border-b border-[#DEDEDE]"
                      : ""
                  }`}
                >
                  <Image
                    src={location.flag}
                    width={18}
                    height={18}
                    alt={location.name}
                  />
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
                </button>
              ))
            )}
            {filteredLocations.length === 0 &&
              suggestions.length === 0 &&
              !isLoading && (
                <div className="px-3 py-2 text-[#9CA3AF] text-[14px]">
                  No cities found
                </div>
              )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LocationDropdown;
