"use client";
// List of Moroccan cities for autocomplete (copied from Step3Form.tsx)
const MOROCCAN_CITIES = [
  "Agadir",
  "Al Hoceima",
  "Asilah",
  "Azrou",
  "Beni Mellal",
  "Berkane",
  "Berrechid",
  "Boujdour",
  "Casablanca",
  "Chefchaouen",
  "Dakhla",
  "El Jadida",
  "Errachidia",
  "Essaouira",
  "Fès",
  "Figuig",
  "Guelmim",
  "Ifrane",
  "Kenitra",
  "Khemisset",
  "Khenifra",
  "Khouribga",
  "Laayoune",
  "Larache",
  "Marrakech",
  "Martil",
  "Meknès",
  "Mohammedia",
  "Nador",
  "Ouarzazate",
  "Oujda",
  "Rabat",
  "Safi",
  "Salé",
  "Settat",
  "Sidi Ifni",
  "Sidi Kacem",
  "Sidi Slimane",
  "Skhirat",
  "Tanger",
  "Tan-Tan",
  "Taourirt",
  "Taroudant",
  "Taza",
  "Témara",
  "Tétouan",
  "Tiznit",
];

import React, { useState, useRef, useEffect } from "react";
import ToggleButton from "../ui/ToggleButton";
import CustomInput from "../ui/CustomInput";
import AboutNumber from "../Register/AboutNumber";
import { useVisibility } from "@/context/VisibilityContext";
import WorkHours, { WorkHoursRef } from "./WorkHours";
import Map from "../SvgIcons/Map";
import GPS from "../SvgIcons/GPS";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import GradientButton from "../ui/GradientButton";
import Loader from "../ui/Loader";
import { toast } from "react-toastify";
import {
  OfficeDetails,
  fetchOwnedOffice,
  updateOfficeDetails,
} from "@/services/api";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZXhjaGFuZ28yNCIsImEiOiJjbWJobzNtbXkwYzd2MmtzZ3M0Nmlhem1wIn0.WWU3U5Ur4wsdKokNEk1DZQ";

const ToggleBtn = () => {
  const { isVisible, setIsVisible, isLoading } = useVisibility();
  return (
    <ToggleButton
      checked={isVisible}
      size="lg"
      onChange={setIsVisible}
      disabled={isLoading}
      aria-label="Visible for user"
    />
  );
};

const OfficeInformation = () => {
  const [officeName, setOfficeName] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [streetAddress, setStreetAddress] = useState("");
  const [addressSuggestions, setAddressSuggestions] = useState<string[]>([]);
  const [showAddressSuggestions, setShowAddressSuggestions] = useState(false);
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [coordinates, setCoordinates] = useState<[number, number]>([-74.5, 40]);
  // Form is initially clean (not dirty)
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [officeData, setOfficeData] = useState<OfficeDetails | null>(null);

  // Create ref for WorkHours component
  const workHoursRef = useRef<WorkHoursRef>(null);

  // Fetch office data on component mount
  useEffect(() => {
    const getOfficeData = async () => {
      setIsFetching(true);
      try {
        const response = await fetchOwnedOffice();
        if (response.success && response.data) {
          setOfficeData(response.data);

          // Populate form fields with data
          setOfficeName(response.data.officeName || "");
          setFullAddress(response.data.address || "");
          setCity(response.data.city?.name || "");
          setProvince(response.data.state || "");
          setContactEmail(response.data.email || "");
          setStreetAddress(response.data.address || "");

          // Set coordinates if available
          if (response.data.location && response.data.location.coordinates) {
            setCoordinates(response.data.location.coordinates);
          }

          // Form is initially clean after loading data
          setIsDirty(false);
        } else {
          toast.error("Failed to load office data");
          console.error("Failed to load office data:", response.message);
        }
      } catch (error) {
        console.error("Error fetching office data:", error);
        toast.error("An error occurred while loading office data");
      } finally {
        setIsFetching(false);
      }
    };

    getOfficeData();
  }, []);

  // Debug logging for isDirty state changes
  useEffect(() => {
    console.log("isDirty state changed:", isDirty);
  }, [isDirty]);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const marker = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    let initial = coordinates;
    if (map.current) {
      map.current.setCenter(initial);
      if (marker.current) marker.current.setLngLat(initial);
      return;
    }

    // This is the initial map load - make sure isDirty is false
    setIsDirty(false);

    // --- Mapbox Map Initialization ---
    const mapInstance = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11", // Use colored style (blue oceans, visible roads)
      center: initial,
      zoom: 13,
      attributionControl: false,
      projection: "mercator", // Force classic 2D mercator projection, disables globe
    });
    map.current = mapInstance;

    mapInstance.addControl(new mapboxgl.NavigationControl(), "top-right");

    // --- Remove Western Sahara border (JS approach, both possible layers) ---
    mapInstance.on("load", () => {
      // Try to hide the Western Sahara border (disputed boundary and normal boundary)
      try {
        mapInstance.setFilter("admin-0-boundary-disputed", [
          "!=",
          ["get", "iso_3166_1"],
          "EH",
        ]);
      } catch (e) {}
      try {
        mapInstance.setFilter("admin-0-boundary", [
          "!=",
          ["get", "iso_3166_1"],
          "EH",
        ]);
      } catch (e) {}

      // Hide Western Sahara border line
      mapInstance.setLayoutProperty(
        "admin-0-boundary-disputed",
        "visibility",
        "none"
      );
    });

    const markerInstance = new mapboxgl.Marker({ draggable: true })
      .setLngLat(initial)
      .addTo(mapInstance);
    marker.current = markerInstance;

    // Helper to suppress dropdown after map/marker move
    const suppressDropdownAfterMapMove = () => {
      if (window) {
        if (typeof mapMoveSuppressRef === "undefined") return;
        mapMoveSuppressRef.current = true;
      }
    };

    markerInstance.on("dragend", () => {
      const lngLat = markerInstance.getLngLat();
      setCoordinates([lngLat.lng, lngLat.lat]);
      suppressDropdownAfterMapMove();
      updateAddress([lngLat.lng, lngLat.lat], false); // Don't set isDirty on map interactions
      // Close dropdown on marker drag
      setShowCitySuggestions(false);
      setShowAddressSuggestions(false);
    });

    // When map is moved, move marker to center
    mapInstance.on("moveend", () => {
      if (!mapInstance || !markerInstance) return;
      const center = mapInstance.getCenter();
      markerInstance.setLngLat([center.lng, center.lat]);
      setCoordinates([center.lng, center.lat]);
      suppressDropdownAfterMapMove();
      updateAddress([center.lng, center.lat], false); // Don't set isDirty on map interactions
      // Prevent dropdown from opening on map move
      setShowCitySuggestions(false);
      setShowAddressSuggestions(false);
    });

    return () => {
      mapInstance.remove();
      map.current = null;
    };
    // eslint-disable-next-line
  }, [mapContainer.current, coordinates]);

  const updateAddress = async (
    coords: [number, number],
    shouldSetDirty = false
  ) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${coords[0]},${coords[1]}.json?country=MA&access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        setStreetAddress(data.features[0].place_name);
        // Only set isDirty if explicitly requested (user action)
        if (shouldSetDirty) {
          setIsDirty(true);
        }
      }
    } catch (error) {
      console.error("Error fetching address:", error);
    }
  };

  // Remove persistent error state, use toast instead
  // const [locationError, setLocationError] = useState<string | null>(null);
  const getCurrentLocation = async () => {
    setIsLoading(true);
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.", {
        position: "bottom-center",
        autoClose: 2600,
      });
      setIsLoading(false);
      return;
    }

    // User explicitly requested to use current location by clicking the button - mark form as dirty
    setIsDirty(true);
    console.log(
      "User clicked Get Current Location button, setting isDirty to true"
    );

    // Try high accuracy first
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setCoordinates([longitude, latitude]);

        if (map.current && marker.current) {
          map.current.flyTo({ center: [longitude, latitude], zoom: 15 });
          marker.current.setLngLat([longitude, latitude]);
        }
        // Fetch address and update input
        try {
          const response = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?country=MA&access_token=${mapboxgl.accessToken}`
          );
          const data = await response.json();
          if (data.features && data.features.length > 0) {
            setStreetAddress(data.features[0].place_name);
          }
        } catch (err) {
          toast.error("Could not fetch address for your location.", {
            position: "bottom-center",
            autoClose: 2600,
          });
        }
        setIsLoading(false);
      },
      (error) => {
        // Retry with low accuracy if high accuracy fails
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const { latitude, longitude } = position.coords;
            setCoordinates([longitude, latitude]);

            if (map.current && marker.current) {
              map.current.flyTo({ center: [longitude, latitude], zoom: 15 });
              marker.current.setLngLat([longitude, latitude]);
            }
            try {
              const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?country=MA&access_token=${mapboxgl.accessToken}`
              );
              const data = await response.json();
              if (data.features && data.features.length > 0) {
                setStreetAddress(data.features[0].place_name);
              }
            } catch (err) {
              toast.error("Could not fetch address for your location.", {
                position: "bottom-center",
                autoClose: 2600,
              });
            }
            setIsLoading(false);
          },
          (finalError) => {
            toast.error(
              "Unable to retrieve your location. Please check your browser settings and try again.",
              { position: "bottom-center", autoClose: 2600 }
            );
            setIsLoading(false);
          },
          {
            enableHighAccuracy: false,
            timeout: 10000,
            maximumAge: 0,
          }
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  // Unified autocomplete: always show both city and Mapbox suggestions
  // Prevent suggestions from reopening after selection or map move for a short time
  const suppressSuggestionsRef = useRef(false);
  // Use correct type for setTimeout in browser
  const suppressTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mapMoveSuppressRef = useRef(false);
  useEffect(() => {
    if (suppressSuggestionsRef.current || mapMoveSuppressRef.current) {
      // If suppressed, do not show suggestions
      if (suppressSuggestionsRef.current) {
        if (suppressTimeoutRef.current)
          clearTimeout(suppressTimeoutRef.current);
        suppressTimeoutRef.current = setTimeout(() => {
          suppressSuggestionsRef.current = false;
        }, 800); // 800ms window after selection
      }
      if (mapMoveSuppressRef.current) {
        setTimeout(() => {
          mapMoveSuppressRef.current = false;
        }, 0);
      }
      return;
    }
    if (streetAddress.length > 0) {
      const filtered = MOROCCAN_CITIES.filter(
        (city) =>
          city.toLowerCase().startsWith(streetAddress.toLowerCase()) ||
          streetAddress.toLowerCase().includes(city.toLowerCase())
      );
      setCitySuggestions(filtered);
      setShowCitySuggestions(true);
      // Always fetch Mapbox suggestions as well
      fetchMapboxSuggestions(streetAddress);
    } else {
      setCitySuggestions([]);
      setShowCitySuggestions(false);
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
    }
  }, [streetAddress]);

  const fetchMapboxSuggestions = async (query: string) => {
    if (!query) return;
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?country=MA&access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        setAddressSuggestions(data.features.map((f: any) => f.place_name));
        setShowAddressSuggestions(true);
      } else {
        setAddressSuggestions([]);
        setShowAddressSuggestions(false);
      }
    } catch (error) {
      setAddressSuggestions([]);
      setShowAddressSuggestions(false);
      console.error("Error searching address:", error);
    }
  };

  // When user selects a suggestion
  // When user selects a Mapbox suggestion
  const handleSelectSuggestion = async (suggestion: string) => {
    suppressSuggestionsRef.current = true;
    if (suppressTimeoutRef.current) clearTimeout(suppressTimeoutRef.current);
    suppressTimeoutRef.current = setTimeout(() => {
      suppressSuggestionsRef.current = false;
    }, 600); // 600ms window after selection
    setStreetAddress(suggestion);
    setShowAddressSuggestions(false);
    setShowCitySuggestions(false); // Ensure both dropdowns are closed

    // User selected a suggestion - mark form as dirty
    setIsDirty(true);

    // Geocode to get coordinates, limit to Morocco
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          suggestion
        )}.json?country=MA&access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        setCoordinates([lng, lat]);
        if (map.current && marker.current) {
          map.current.flyTo({ center: [lng, lat], zoom: 15 });
          marker.current.setLngLat([lng, lat]);
        }
      }
    } catch (err) {
      // fail silently
    }
  };

  // When user selects a Moroccan city
  const handleSelectCity = async (city: string) => {
    suppressSuggestionsRef.current = true;
    if (suppressTimeoutRef.current) clearTimeout(suppressTimeoutRef.current);
    suppressTimeoutRef.current = setTimeout(() => {
      suppressSuggestionsRef.current = false;
    }, 600); // 600ms window after selection
    setStreetAddress(city);
    setShowCitySuggestions(false);
    setShowAddressSuggestions(false); // Ensure both dropdowns are closed

    // User selected a city - mark form as dirty
    setIsDirty(true);

    // Update map to city location
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          city + ", Morocco"
        )}.json?access_token=${mapboxgl.accessToken}`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        setCoordinates([lng, lat]);
        if (map.current && marker.current) {
          map.current.flyTo({ center: [lng, lat], zoom: 13 });
          marker.current.setLngLat([lng, lat]);
        }
      }
    } catch (err) {
      // fail silently
    }
  };

  const handleInputChange =
    (setter: (val: string) => void) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setter(e.target.value);
      setIsDirty(true); // Mark form as dirty when input changes
      console.log("Input changed, setting isDirty to true");
    };

  // State to track AboutNumber validity
  const [aboutNumberValid, setAboutNumberValid] = useState(true);
  // State to trigger AboutNumber error display
  const [showAboutNumberErrors, setShowAboutNumberErrors] = useState(false);
  // Track phone numbers
  const [phoneNumbers, setPhoneNumbers] = useState<{
    primary: { countryCode: string; number: string; fullNumber?: string };
    whatsapp: { countryCode: string; number: string; fullNumber?: string };
    other?: { countryCode: string; number: string; fullNumber?: string };
  } | null>(null);

  const handleAboutNumberChange = (numbers: any) => {
    console.log("Phone numbers changed:", numbers);
    setPhoneNumbers(numbers);
    setIsDirty(true);
  };

  // Memoize the initial values for AboutNumber to prevent unnecessary re-renders
  const aboutNumberInitialValues = React.useMemo(() => {
    if (!officeData) return {};
    return {
      primaryNumber: officeData.primaryPhoneNumber || "",
      whatsappNumber: officeData.whatsappNumber || "",
      otherNumber: officeData.secondaryPhoneNumber || "",
      isWhatsAppSame:
        officeData.primaryPhoneNumber === officeData.whatsappNumber,
    };
  }, [officeData]);

  // Track if work hours have changed
  const handleWorkHoursChange = () => {
    setIsDirty(true);
  };

  return (
    <div className="w-full space-y-6">
      {isFetching ? (
        // Loading skeleton
        <div className="animate-pulse">
          <div className="h-12 bg-gray-200 rounded mb-6"></div>
          <div className="h-24 bg-gray-200 rounded mb-6"></div>
          <div className="h-24 bg-gray-200 rounded mb-6"></div>
          <div className="h-24 bg-gray-200 rounded mb-6"></div>
          <div className="h-24 bg-gray-200 rounded mb-6"></div>
          <div className="h-24 bg-gray-200 rounded mb-6"></div>
          <div className="h-24 bg-gray-200 rounded mb-6"></div>
          <div className="h-64 bg-gray-200 rounded mb-6"></div>
        </div>
      ) : (
        <>
          {/* OFFICE Visibility */}
          <div className="w-full flex items-start flex-col lg:flex-row gap-6 lg:gap-[97px] border-b border-[#DEDEDE] pb-6 lg:pb-3">
            <div className="w-full lg:max-w-[291px]">
              <div className="mb-1.5 lg:mb-[4.5px] flex items-center gap-4 justify-between">
                <h3 className="text-[#000000] text-[16px] leading-[24px] font-semibold">
                  Office Visibility
                </h3>
                <div className="lg:hidden">
                  <ToggleBtn />
                </div>
              </div>
              <p className="text-[#424242] text-[14px] leading-[21px] font-normal">
                you can quickly set visibility on your exchange office. user
                can't see your office if switch off
              </p>
            </div>
            <div className="lg:flex items-center gap-2 hidden">
              <ToggleBtn />
              <h2 className="text-[#111111] text-[16px] font-normal">
                Visible for user
              </h2>
            </div>
          </div>

          {/* OFFICE INFO */}
          <div className="flex items-start gap-6 lg:flex-row flex-col lg:gap-[97px] border-b border-[#DEDEDE] pb-6 lg:pb-8">
            <div className="min-w-[291px]">
              <h3 className="text-[#000000] text-[16px] leading-[24px] font-semibold mb-[4.5px]">
                Office Information
              </h3>
              <p className="text-[#424242] text-[14px] leading-[21px] font-normal">
                Set the official name of your exchange office as it will appear
                to users and partners.
              </p>
            </div>
            <div className="w-full flex items-center gap-2">
              <CustomInput
                type="text"
                name="officeName"
                label="Office Name"
                placeholder="Placeholder"
                required
                className="w-full"
                value={officeName}
                onChange={handleInputChange(setOfficeName)}
              />
            </div>
          </div>

          {/* ADDRESS */}
          <div className="flex items-start gap-6 lg:flex-row flex-col lg:gap-[97px] border-b border-[#DEDEDE] pb-6 lg:pb-8">
            <div className="min-w-[291px]">
              <h3 className="text-[#000000] text-[16px] leading-[24px] font-semibold mb-1.5 lg:mb-[4.5px]">
                Address
              </h3>
              <p className="text-[#424242] text-[14px] leading-[21px] font-normal">
                Provide the complete address to help users locate your physical
                exchange office easily.
              </p>
            </div>
            <div className="w-full flex flex-col items-center gap-5 md:gap-8">
              <CustomInput
                type="text"
                name="fullAddress"
                label="Full Address"
                placeholder="Placeholder"
                required
                className="w-full"
                value={fullAddress}
                onChange={handleInputChange(setFullAddress)}
              />
              <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
                <CustomInput
                  type="text"
                  name="city"
                  label="City"
                  placeholder="Placeholder"
                  required
                  value={city}
                  onChange={handleInputChange(setCity)}
                />

                <CustomInput
                  type="text"
                  name="province"
                  label="Province"
                  placeholder="Placeholder"
                  required
                  value={province}
                  onChange={handleInputChange(setProvince)}
                />
              </div>
            </div>
          </div>

          {/* CONTACT EMAIL */}
          <div className="flex items-start gap-6 lg:flex-row flex-col lg:gap-[97px] border-b border-[#DEDEDE] pb-6 lg:pb-8">
            <div className="lg:min-w-[291px]">
              <h3 className="text-[#000000] text-[16px] leading-[24px] font-semibold mb-1.5 lg:mb-[4.5px]">
                Contact Email
              </h3>
              <p className="text-[#424242] text-[14px] leading-[21px] font-normal">
                Enter a valid email address for customer support, business
                inquiries, or notifications.
              </p>
            </div>
            <div className="w-full">
              <CustomInput
                type="text"
                name="contactEmail"
                label="Contact Email"
                placeholder="Placeholder"
                required
                className="w-full"
                value={contactEmail}
                onChange={handleInputChange(setContactEmail)}
              />
            </div>
          </div>

          {/* CALL NUMBER */}
          <div className="flex items-start gap-6 lg:flex-row flex-col lg:gap-[97px] border-b border-[#DEDEDE] pb-6 md:pb-8">
            <div className="min-w-[291px]">
              <h3 className="text-[#000000] text-[16px] leading-[24px] font-semibold mb-1.5 lg:mb-[4.5px]">
                Call Number
              </h3>
              <p className="text-[#424242] text-[14px] leading-[21px] font-normal">
                Add a phone number where customers or partners can reach your
                office directly.
              </p>
            </div>
            <div className="w-full">
              {officeData && (
                <>
                  <AboutNumber
                    onChange={handleAboutNumberChange}
                    onValidityChange={setAboutNumberValid}
                    showErrors={showAboutNumberErrors}
                    initialValues={aboutNumberInitialValues}
                  />
                </>
              )}
            </div>
          </div>

          {/* WORK HOURS */}
          <div className="flex items-start gap-6 lg:flex-row flex-col lg:gap-[97px] border-b border-[#DEDEDE] pb-6 md:pb-8">
            <div className="min-w-[291px]">
              <h3 className="text-[#000000] text-[16px] leading-[24px] font-semibold mb-1.5 lg:mb-[4.5px]">
                Work hours
              </h3>
              <p className="text-[#424242] text-[14px] leading-[21px] font-normal">
                Define your daily operating hours so users know when your
                services are available.
              </p>
            </div>
            <div className="w-full">
              <WorkHours
                ref={workHoursRef}
                onAnyChange={handleWorkHoursChange}
              />
            </div>
          </div>

          {/* SET LOCATION */}
          <div className="flex items-start gap-6 lg:flex-row flex-col lg:gap-[97px] pb-6 md:pb-8">
            <div className="min-w-[291px]">
              <h3 className="text-[#000000] text-[16px] leading-[24px] font-semibold mb-1.5 lg:mb-[4.5px]">
                Set location
              </h3>
              <p className="text-[#424242] text-[14px] leading-[21px] font-normal">
                Provide your office's location details to complete your profile.
              </p>
            </div>
            <div className="w-full">
              <div className="mb-4">
                <div className="w-full relative bg-white border border-[#DEDEDE] rounded-lg py-[18px] px-4 max-w-[398px] mx-auto h-[56px]">
                  <label className="absolute -top-2 left-2.5 bg-white px-1.5 text-xs leading-[17px] font-medium text-[#111111]">
                    Street Address
                  </label>
                  <div className="flex items-center">
                    <div className="mr-1">
                      <Map />
                    </div>
                    <input
                      type="text"
                      value={streetAddress}
                      onChange={(e) => {
                        setStreetAddress(e.target.value);
                        // Explicitly set isDirty when user types in the address field
                        setIsDirty(true);
                        console.log(
                          "Street address changed, setting isDirty to true"
                        );
                      }}
                      onFocus={() => {
                        setShowCitySuggestions(true);
                        setShowAddressSuggestions(true);
                      }}
                      onBlur={() => {
                        // Close dropdown on blur
                        setTimeout(() => {
                          setShowAddressSuggestions(false);
                          setShowCitySuggestions(false);
                        }, 100);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter")
                          fetchMapboxSuggestions(streetAddress);
                      }}
                      placeholder="Type your office address (start typing city name)"
                      className="flex-1 bg-transparent border-0 outline-none smaller text-[#111111] placeholder-[#585858] text-sm leading-[20px] font-normal"
                      autoComplete="off"
                    />
                    <button
                      onClick={getCurrentLocation}
                      className="focus:outline-none hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                      title="Use my current location"
                    >
                      <GPS />
                    </button>
                    {isLoading && <Loader isLoading={true} />}

                    {/* Unified dropdown: Moroccan cities and Mapbox suggestions */}
                    {(showCitySuggestions || showAddressSuggestions) &&
                      (citySuggestions.length > 0 ||
                        addressSuggestions.length > 0) && (
                        <div className="absolute left-0 right-0 top-[56px] bg-white border border-[#DEDEDE] rounded-b-lg shadow-lg z-10 max-h-64 overflow-y-auto">
                          {citySuggestions.length > 0 && (
                            <>
                              {citySuggestions.map((city) => (
                                <div
                                  key={city}
                                  className="px-4 py-2 cursor-pointer hover:bg-[#f3f3f3] text-left"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    setShowCitySuggestions(false);
                                    setShowAddressSuggestions(false);
                                    setTimeout(() => handleSelectCity(city), 0);
                                  }}
                                >
                                  {city}
                                </div>
                              ))}
                            </>
                          )}
                          {addressSuggestions.length > 0 && (
                            <>
                              {addressSuggestions.map((suggestion, idx) => (
                                <div
                                  key={idx}
                                  className="px-4 py-2 cursor-pointer hover:bg-[#f3f3f3] text-left"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    setShowCitySuggestions(false);
                                    setShowAddressSuggestions(false);
                                    setTimeout(
                                      () => handleSelectSuggestion(suggestion),
                                      0
                                    );
                                  }}
                                >
                                  {suggestion}
                                </div>
                              ))}
                            </>
                          )}
                        </div>
                      )}
                  </div>
                </div>
              </div>
              <div
                ref={mapContainer}
                className="w-full h-[200px] rounded-lg overflow-hidden"
              />
            </div>
          </div>

          {/* Save Update Button */}
          <div className="w-full flex items-end justify-end">
            <GradientButton
              className={`h-10 sm:h-[46px] sm:w-fit w-full ${
                !isDirty || isSaving || isFetching
                  ? "opacity-60 cursor-not-allowed"
                  : ""
              }`}
              disabled={!isDirty || isSaving || isFetching}
              onClick={async () => {
                // Double check isDirty state before proceeding
                if (!isDirty) {
                  console.log(
                    "Button clicked but form is not dirty - ignoring click"
                  );
                  return;
                }
                console.log(
                  "Button clicked, isDirty:",
                  isDirty,
                  "isSaving:",
                  isSaving
                );
                // Validate AboutNumber before saving
                if (!aboutNumberValid) {
                  setShowAboutNumberErrors(true);
                  toast.error("Please fix phone number errors before saving.", {
                    position: "top-right",
                    autoClose: 2500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                  });
                  return;
                }

                setShowAboutNumberErrors(false);
                setIsSaving(true);
                console.log("Saving changes, isDirty:", isDirty);

                // Prepare data for update
                const updatedData: Partial<OfficeDetails> = {
                  officeName,
                  address: fullAddress,
                  state: province,
                  email: contactEmail,
                  location: {
                    type: "Point",
                    coordinates: coordinates,
                  },
                };

                // Add phone numbers from the AboutNumber component if available
                if (phoneNumbers) {
                  if (phoneNumbers.primary?.fullNumber) {
                    updatedData.primaryPhoneNumber =
                      phoneNumbers.primary.fullNumber;
                  }
                  if (phoneNumbers.whatsapp?.fullNumber) {
                    updatedData.whatsappNumber =
                      phoneNumbers.whatsapp.fullNumber;
                  }
                  if (phoneNumbers.other?.fullNumber) {
                    updatedData.secondaryPhoneNumber =
                      phoneNumbers.other.fullNumber;
                  }
                }

                console.log("Sending update data:", updatedData);

                try {
                  // First, save the office details
                  const response = await updateOfficeDetails(updatedData);

                  if (!response.success) {
                    toast.error(
                      response.message || "Failed to update office details",
                      {
                        position: "top-right",
                        autoClose: 2500,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                      }
                    );
                    setIsSaving(false);
                    return;
                  }

                  // If we have work hours changes, save those too
                  if (workHoursRef.current?.hasChanges()) {
                    const workHoursSaved =
                      await workHoursRef.current.saveAllWorkingHours();
                    if (!workHoursSaved) {
                      toast.error("Failed to update some working hours", {
                        position: "top-right",
                        autoClose: 2500,
                        hideProgressBar: false,
                        closeOnClick: true,
                        pauseOnHover: true,
                        draggable: true,
                        progress: undefined,
                      });
                      setIsSaving(false);
                      return;
                    }
                  }

                  // If all saves were successful
                  setIsDirty(false);
                  toast.success("Office details updated successfully.", {
                    position: "top-right",
                    autoClose: 2500,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                  });

                  // Update local state with the new data
                  setOfficeData(response.data);
                } catch (error) {
                  console.error("Error updating office details:", error);
                  toast.error(
                    "An error occurred while updating office details",
                    {
                      position: "top-right",
                      autoClose: 2500,
                      hideProgressBar: false,
                      closeOnClick: true,
                      pauseOnHover: true,
                      draggable: true,
                      progress: undefined,
                    }
                  );
                } finally {
                  setIsSaving(false);
                }
              }}
            >
              {isSaving ? "Saving..." : "Save Update"}
            </GradientButton>
          </div>
        </>
      )}
    </div>
  );
};

export default OfficeInformation;
