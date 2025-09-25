"use client";

import type React from "react";
import { useRef, useEffect, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import Image from "next/image";
import ReactDOM from "react-dom/client";
import CustomMapMarker from "./CustomMapMarker";
import type { ExchangeOffice } from "../types";
import ExchangeCard from "../ExchangeCard";
import { useHover, HoverProvider } from "@/context/HoverContext";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZXhjaGFuZ28yNCIsImEiOiJjbWJobzNtbXkwYzd2MmtzZ3M0Nmlhem1wIn0.WWU3U5Ur4wsdKokNEk1DZQ";

interface LocationSuggestion {
  id: string;
  name: string;
  country: string;
  coordinates: {
    lng: number;
    lat: number;
  };
}

interface MapViewProps {
  filteredOffices?: ExchangeOffice[];
  onMapCardVisibilityChange?: (isVisible: boolean) => void;
  showBestOffice?: boolean;
  selectedCityCoordinates?: { lng: number; lat: number };
}

// Add predefined Moroccan cities
const predefinedLocations: LocationSuggestion[] = [
  {
    id: "1",
    name: "Casablanca",
    country: "Maroc",
    coordinates: { lng: -7.5898, lat: 33.5731 },
  },
  {
    id: "2",
    name: "Rabat",
    country: "Maroc",
    coordinates: { lng: -6.8498, lat: 34.0209 },
  },
  {
    id: "3",
    name: "Fès",
    country: "Maroc",
    coordinates: { lng: -5.0078, lat: 34.0333 },
  },
  {
    id: "4",
    name: "Tanger",
    country: "Maroc",
    coordinates: { lng: -5.8129, lat: 35.7595 },
  },
  {
    id: "5",
    name: "Agadir",
    country: "Maroc",
    coordinates: { lng: -9.5982, lat: 30.4278 },
  },
  {
    id: "6",
    name: "Marrakech",
    country: "Maroc",
    coordinates: { lng: -8.0083, lat: 31.6295 },
  },
];

// Add this type definition near the top of the file, after other type definitions
interface WorkingHoursObject {
  fromTime: string;
  toTime: string;
}

// Add this function before the MapView component definition
const renderWorkingHours = (
  hours: string | WorkingHoursObject | undefined
): string => {
  if (!hours) return "";
  if (typeof hours === "string") return hours;
  return `${hours.fromTime} - ${hours.toTime}`;
};

const MapView: React.FC<MapViewProps> = ({
  filteredOffices = [],
  onMapCardVisibilityChange,
  showBestOffice = false,
  selectedCityCoordinates,
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const userLocationMarker = useRef<mapboxgl.Marker | null>(null);
  const [selectedExchangeId, setSelectedExchangeId] = useState<
    string | number | null
  >(null);
  const { hoveredExchangeId, setHoveredExchangeId } = useHover();
  const [hoveredExchangeIdInternal, setHoveredExchangeIdInternal] = useState<
    string | number | null
  >(null);
  const markerElements = useRef<{ [key: string]: HTMLElement }>({});
  const markerUpdateFunctions = useRef<{
    [key: string]: (
      hoveredId: string | number | null,
      selectedId: string | number | null
    ) => void;
  }>({});
  // When switching pages in the results list, we want to auto-fit the markers once
  const shouldFitOnNextMarkersRenderRef = useRef(false);
  // Ensure we auto-open the best office only once (when bestOffice=true)
  const hasAutoOpenedBestOfficeRef = useRef(false);

  const [initialLocation, setInitialLocation] = useState<{
    lng: number;
    lat: number;
    zoom: number;
  }>({
    lng: -7.6, // Center of Casablanca
    lat: 33.58, // Center of Casablanca
    zoom: 12, // Zoom level to show the city
  });
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(
    null
  );
  const [isCustomFullscreen, setIsCustomFullscreen] = useState(false);
  const [hoverCardPosition, setHoverCardPosition] = useState<{
    top?: number;
    left: number;
  } | null>(null);
  const [hoveredOffice, setHoveredOffice] = useState<ExchangeOffice | null>(
    null
  );
  const [isTouchDevice, setIsTouchDevice] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  // --- Map interaction and fetch control ---
  const isUserInteractingRef = useRef(false);
  const isProgrammaticMoveRef = useRef(false);
  const lastFetchedBoundsRef = useRef<mapboxgl.LngLatBounds | null>(null);
  const moveDebounceRef = useRef<NodeJS.Timeout | null>(null);
  // Track when we emitted a user-initiated coordinate change to avoid feedback loops
  const lastUserCoordEmitAtRef = useRef<number | null>(null);

  const toRadians = (deg: number) => (deg * Math.PI) / 180;
  const haversineMeters = (a: mapboxgl.LngLatLike, b: mapboxgl.LngLatLike) => {
    const [lng1, lat1] = mapboxgl.LngLat.convert(a).toArray();
    const [lng2, lat2] = mapboxgl.LngLat.convert(b).toArray();
    const R = 6371000; // meters
    const dLat = toRadians(lat2 - lat1);
    const dLng = toRadians(lng2 - lng1);
    const s1 = Math.sin(dLat / 2);
    const s2 = Math.sin(dLng / 2);
    const aa =
      s1 * s1 + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * s2 * s2;
    const c = 2 * Math.atan2(Math.sqrt(aa), Math.sqrt(1 - aa));
    return R * c;
  };
  const boundsDiagonalMeters = (b: mapboxgl.LngLatBounds) => {
    const sw = b.getSouthWest();
    const ne = b.getNorthEast();
    return haversineMeters([sw.lng, sw.lat], [ne.lng, ne.lat]);
  };
  const dispatchViewportRadius = () => {
    if (!map.current) return;
    try {
      const b = map.current.getBounds();
      const diagMeters = boundsDiagonalMeters(b as mapboxgl.LngLatBounds);
      const radiusInKm = Math.max(0.1, Math.round((diagMeters / 2) / 100) / 10);
      const evt = new CustomEvent("mapViewportMetricsChanged", {
        detail: { radiusInKm },
      });
      window.dispatchEvent(evt);
    } catch (_) {
      // no-op
    }
  };
  const hasSignificantBoundsChange = (
    newBounds: mapboxgl.LngLatBounds,
    oldBounds: mapboxgl.LngLatBounds | null
  ) => {
    const newDiag = boundsDiagonalMeters(newBounds);
    if (!oldBounds) return true;
    const oldDiag = boundsDiagonalMeters(oldBounds);
    const centerMove = haversineMeters(
      newBounds.getCenter(),
      oldBounds.getCenter()
    );
    const sizeChangeRatio = Math.abs(newDiag - oldDiag) / (oldDiag || 1);
    const minCenterShift = Math.max(oldDiag * 0.25, 300); // 25% of viewport diagonal or 300m
    const minSizeChange = 0.15; // 15% zoom/size change
    return centerMove > minCenterShift || sizeChangeRatio > minSizeChange;
  };
  const debounceUserMoveCommit = () => {
    if (moveDebounceRef.current) clearTimeout(moveDebounceRef.current);
    moveDebounceRef.current = setTimeout(async () => {
      if (!map.current) return;
      const bounds = map.current.getBounds();
      const last = lastFetchedBoundsRef.current;
      if (last) {
        const newDiag = boundsDiagonalMeters(bounds as mapboxgl.LngLatBounds);
        const oldDiag = boundsDiagonalMeters(last);
        const centerMove = haversineMeters(
          (bounds as mapboxgl.LngLatBounds).getCenter(),
          last.getCenter()
        );
        const sizeChangeRatio = Math.abs(newDiag - oldDiag) / (oldDiag || 1);
        const minCenterShift = Math.max(oldDiag * 0.25, 300);
        const minSizeChange = 0.15;
        const significant =
          centerMove > minCenterShift || sizeChangeRatio > minSizeChange;
        if (!significant) return;
      }
      const center = map.current.getCenter();
      // Compute dynamic radius from current viewport (half the diagonal)
      const diagMeters = boundsDiagonalMeters(bounds as mapboxgl.LngLatBounds);
      const radiusInKm = Math.max(0.1, Math.round((diagMeters / 2) / 100) / 10); // one decimal, min 0.1km
      lastFetchedBoundsRef.current = bounds;
      lastUserCoordEmitAtRef.current = Date.now();

      // Fetch city name from coordinates using reverse geocoding
      let cityName = "Unknown";
      try {
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${center.lng},${center.lat}.json?access_token=${mapboxgl.accessToken}&types=place&limit=1&language=fr`
        );
        if (response.ok) {
          const data = await response.json();
          if (data.features && data.features.length > 0) {
            cityName = data.features[0].text;
          }
        }
      } catch (error) {
        console.error("Error fetching city name on map move:", error);
      }

      const userPanEvent = new CustomEvent("mapLocationChanged", {
        detail: {
          lat: center.lat,
          lng: center.lng,
          name: cityName,
          userInitiated: true,
          radiusInKm,
        },
      });
      window.dispatchEvent(userPanEvent);
    }, 400);
  };
  const markProgrammaticMove = <T extends any[]>(fn: (...args: T) => void) => {
    return (...args: T) => {
      isProgrammaticMoveRef.current = true;
      fn(...args);
    };
  };

  useEffect(() => {
    const isTouchEnabled =
      "ontouchstart" in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(isTouchEnabled);

    if (isTouchEnabled) {
      document.body.classList.add("is-touch-device");
    }

    return () => {
      document.body.classList.remove("is-touch-device");
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node) &&
        showSearch
      ) {
        setShowSearch(false);
        setSuggestions([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSearch]);

  // Handle click outside map card
  useEffect(() => {
    const handleMapCardClickOutside = (event: MouseEvent) => {
      if (hoveredOffice && hoverCardPosition) {
        const target = event.target as Element;
        // Check if click is outside the map card, not on a marker, and not on WhatsApp modals
        if (
          !target.closest(".absolute.z-40") &&
          !target.closest(".custom-marker-container") &&
          !target.closest("[style*='z-index: 99999']") &&
          !target.closest(".fixed.inset-0.z-\\[99999\\]")
        ) {
          setHoveredExchangeIdInternal(null);
          setSelectedExchangeId(null);
          setHoveredOffice(null);
          setHoverCardPosition(null);
          setHoveredExchangeId(null);
          if (onMapCardVisibilityChange) {
            onMapCardVisibilityChange(false);
          }
        }
      }
    };

    document.addEventListener("mousedown", handleMapCardClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleMapCardClickOutside);
    };
  }, [hoveredOffice, hoverCardPosition, onMapCardVisibilityChange]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const locationParam = params.get("location");

      if (locationParam) {
        geocodeLocationName(locationParam);
      }
    }
  }, []);

  // Update initial location when selected city coordinates change
  useEffect(() => {
    if (selectedCityCoordinates) {
      // Do not alter initial zoom here; changing this has no effect after init
      // and can be misleading when debugging zoom resets.
      setInitialLocation((prev) => ({
        ...prev,
        lng: selectedCityCoordinates.lng,
        lat: selectedCityCoordinates.lat,
      }));

      // If map is already loaded, fly to the new location
      if (map.current && mapLoaded) {
        // If this coordinate update was emitted by a recent user pan/zoom, skip flyTo to avoid zoom snap
        const recentlyUserEmitted =
          typeof lastUserCoordEmitAtRef.current === "number" &&
          Date.now() - lastUserCoordEmitAtRef.current < 1500;
        if (recentlyUserEmitted) {
          // Clear the flag so future programmatic updates can proceed
          lastUserCoordEmitAtRef.current = null;
        } else {
          // If the new center is effectively the same as current, skip to avoid interrupting zoom gestures
          const currentCenter = map.current.getCenter();
          const sameCenter =
            Math.abs(currentCenter.lng - selectedCityCoordinates.lng) < 1e-6 &&
            Math.abs(currentCenter.lat - selectedCityCoordinates.lat) < 1e-6;
          if (!sameCenter) {
            isProgrammaticMoveRef.current = true;
            map.current.setCenter([
              selectedCityCoordinates.lng,
              selectedCityCoordinates.lat,
            ]);

            // Programmatic center change: emit mapLocationChanged so lists fetch immediately
            try {
              const bounds = map.current.getBounds();
              const diagMeters = boundsDiagonalMeters(bounds as mapboxgl.LngLatBounds);
              const radiusInKm = Math.max(0.1, Math.round((diagMeters / 2) / 100) / 10);
              const evt = new CustomEvent("mapLocationChanged", {
                detail: {
                  lat: selectedCityCoordinates.lat,
                  lng: selectedCityCoordinates.lng,
                  userInitiated: false,
                  radiusInKm,
                },
              });
              window.dispatchEvent(evt);
            } catch (_) {
              // no-op
            }
          }
        }
      }
    }
  }, [selectedCityCoordinates, mapLoaded]);

  const geocodeLocationName = async (locationName: string) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          locationName
        )}.json?access_token=${mapboxgl.accessToken}&types=place&country=MA` // Added &country=MA
      );

      if (!response.ok) {
        throw new Error(`Failed to geocode location: ${response.status}`);
      }

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;

        setInitialLocation({
          lng,
          lat,
          zoom: 13,
        });

        if (map.current && mapLoaded) {
          isProgrammaticMoveRef.current = true;
          map.current.setCenter([lng, lat]);

          addUserLocationMarker(lat, lng, locationName);

          // Emit mapLocationChanged so data fetch happens without needing a user drag
          try {
            const bounds = map.current.getBounds();
            const diagMeters = boundsDiagonalMeters(bounds as mapboxgl.LngLatBounds);
            const radiusInKm = Math.max(0.1, Math.round((diagMeters / 2) / 100) / 10);
            const evt = new CustomEvent("mapLocationChanged", {
              detail: {
                lat,
                lng,
                userInitiated: false,
                radiusInKm,
              },
            });
            window.dispatchEvent(evt);
          } catch (_) {
            // no-op
          }
        }
      }
    } catch (error) {
      console.error("Error geocoding location from URL:", error);
    }
  };

  const addUserLocationMarker = (lat: number, lng: number, name: string) => {
    if (!map.current) return;

    // Ensure any existing marker is removed, but do not render a new one
    if (userLocationMarker.current) {
      userLocationMarker.current.remove();
      userLocationMarker.current = null;
    }
    // Intentionally do nothing else to hide the user location blue dot
  };
  // Targeted function to remove ONLY Morocco-Western Sahara boundary
  const hideWesternSaharaBoundary = (mapInstance: mapboxgl.Map) => {
    if (!mapInstance || !mapInstance.getStyle()?.layers) return;

    const layers = mapInstance.getStyle().layers;

    layers.forEach((layer) => {
      if (!layer.id || typeof layer.id !== "string") return;

      const layerId = layer.id.toLowerCase();

      // Target ONLY Western Sahara specific layers - very specific patterns
      const westernSaharaPatterns = [
        "western-sahara",
        "western_sahara",
        "sahara-boundary",
        "sahara_boundary",
      ];

      // Check for exact Western Sahara matches
      if (westernSaharaPatterns.some((pattern) => layerId.includes(pattern))) {
        try {
          mapInstance.setLayoutProperty(layer.id, "visibility", "none");
        } catch (error) {
          console.warn(`Could not hide layer ${layer.id}:`, error);
        }
        return;
      }

      // Target only disputed boundary layers (not all admin boundaries)
      const disputedOnlyPatterns = [
        "admin-0-boundary-disputed",
        "boundary-disputed",
        "disputed-boundary",
        "boundary_disputed",
        "disputed_boundary",
      ];

      if (disputedOnlyPatterns.some((pattern) => layerId === pattern)) {
        try {
          mapInstance.setLayoutProperty(layer.id, "visibility", "none");
        } catch (error) {
          console.warn(`Could not hide layer ${layer.id}:`, error);
        }
      }
    });
  };

  // Replace your existing map initialization useEffect with this:
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    try {
      const mapInstance = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/light-v11",
        center: [initialLocation.lng, initialLocation.lat],
        zoom: initialLocation.zoom,
        attributionControl: false,
        projection: "mercator",
        transformRequest: (url, resourceType) => {
          return { url };
        },
      });

      mapInstance.on("load", () => {
        map.current = mapInstance;
        setMapLoaded(true);

        // Customize water and land colors
        try {
          // Make water more vibrant blue
          mapInstance.setPaintProperty("water", "fill-color", "#46bcec");

          // Make waterway (rivers) more blue
          mapInstance.setPaintProperty("waterway", "line-color", "#46bcec");

          // Make land light grey
          mapInstance.setPaintProperty("land", "fill-color", "#f5f5f5");

          // Make landcover (parks, etc.) light grey
          mapInstance.setPaintProperty("landcover", "fill-color", "#f5f5f5");

          // Make landuse (residential, commercial, etc.) light grey
          mapInstance.setPaintProperty("landuse", "fill-color", "#f5f5f5");
        } catch (error) {
          console.log(
            "Some map layers not available for custom styling:",
            error
          );
        }

        // Set map language to French
        if (mapInstance.getStyle().layers) {
          const layers = mapInstance.getStyle().layers;
          layers.forEach((layer) => {
            if (
              layer.type === "symbol" &&
              layer.layout &&
              layer.layout["text-field"]
            ) {
              mapInstance.setLayoutProperty(layer.id, "text-field", [
                "get",
                `name_fr`,
              ]);
            }
          });
        }

        // TARGETED: Hide only Morocco-Western Sahara boundary
        hideWesternSaharaBoundary(mapInstance);

        // Hide Western Sahara border line
        mapInstance.setLayoutProperty(
          "admin-0-boundary-disputed",
          "visibility",
          "none"
        );

        // Add click handler to close hover card when clicking on the map (not on a marker)
        mapInstance.on("click", () => {
          // Only close if the click is directly on the map (not bubbled from a marker)
          if (selectedExchangeId) {
            setSelectedExchangeId(null);
            setHoveredExchangeIdInternal(null);
            setHoveredOffice(null);
            setHoverCardPosition(null);

            // Notify parent component about map card visibility change
            if (onMapCardVisibilityChange) {
              onMapCardVisibilityChange(false);
            }
          }
        });

        // Track user interaction start/end
        mapInstance.on("mousedown", () => {
          isUserInteractingRef.current = true;
        });
        mapInstance.on("touchstart", () => {
          isUserInteractingRef.current = true;
        });
        mapInstance.on("dragstart", () => {
          isUserInteractingRef.current = true;
        });
        // Fire fetch only when user pans, not when programmatic move ends
        mapInstance.on("moveend", () => {
          if (isProgrammaticMoveRef.current) {
            isProgrammaticMoveRef.current = false;
            return;
          }
          if (!isUserInteractingRef.current) return;
          debounceUserMoveCommit();
          // Clear the user interaction flag after handling this move
          isUserInteractingRef.current = false;
        });
      });

      // Re-check when style updates (but only for Western Sahara)
      mapInstance.on("styledata", () => {
        setTimeout(() => {
          hideWesternSaharaBoundary(mapInstance);
        }, 100);
      });

      mapInstance.on("error", (e) => {
        const errorMessage = e.error
          ? e.error.message || JSON.stringify(e.error)
          : "Unknown map error";
        console.error("Mapbox error:", errorMessage);
        setMapError(errorMessage);
      });

      const nav = new mapboxgl.NavigationControl({
        showCompass: false,
        visualizePitch: false,
      });
      mapInstance.addControl(nav, "bottom-right");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unknown error initializing map";
      console.error("Error initializing map:", errorMessage);
      setMapError(errorMessage);
    }

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []); // Remove initialLocation dependency to prevent reinitialization

  useEffect(() => {
    if (map.current && mapLoaded) {
      // Handle fullscreen resize with a more robust approach
      const resizeMap = () => {
        if (map.current) {
          map.current.resize();
        }
      };

      // Use a longer timeout and multiple resize calls for better reliability
      setTimeout(resizeMap, 100);
      setTimeout(resizeMap, 300);
      setTimeout(resizeMap, 500);
    }
  }, [isCustomFullscreen, mapLoaded]);

  useEffect(() => {
    const handleUserLocationChange = (e: CustomEvent) => {
      if (!map.current || !mapLoaded) return;

      const { lat, lng, name, userInitiated } = e.detail as {
        lat: number;
        lng: number;
        name?: string;
        userInitiated?: boolean;
      };

      if (typeof lat === "number" && typeof lng === "number") {
        // Ignore our own user-drag events to prevent zoom changes on pan
        if (userInitiated) return;

        addUserLocationMarker(lat, lng, name || "");

        isProgrammaticMoveRef.current = true;
        map.current.setCenter([lng, lat]);
      }
    };

    window.addEventListener(
      "mapLocationChanged",
      handleUserLocationChange as EventListener
    );

    return () => {
      window.removeEventListener(
        "mapLocationChanged",
        handleUserLocationChange as EventListener
      );
    };
  }, [mapLoaded]);

  // Listen for page changes from the results list to trigger a one-time auto-fit
  useEffect(() => {
    const handleResultsPageChanged = () => {
      shouldFitOnNextMarkersRenderRef.current = true;
    };

    window.addEventListener("resultsPageChanged", handleResultsPageChanged as EventListener);
    return () => {
      window.removeEventListener("resultsPageChanged", handleResultsPageChanged as EventListener);
    };
  }, []);

  // Add effect to handle hoveredExchangeId changes from context
  useEffect(() => {
    // Always update internal state when context state changes
    setHoveredExchangeIdInternal(hoveredExchangeId);

    // Only update marker styles if we have markers
    if (Object.keys(markerElements.current).length > 0) {
      // Update marker styles and rendering based on hover state
      Object.keys(markerElements.current).forEach((idStr) => {
        const el = markerElements.current[idStr]; // Use string key directly

        if (el) {
          if (hoveredExchangeId === idStr) {
            // Compare strings directly
            // Apply hover styles
            el.classList.add("marker-hovered");
            // Bring to front
            el.style.zIndex = "10";
            // Don't apply CSS transforms here - let CustomMapMarker handle visual changes
          } else {
            // Remove hover styles
            el.classList.remove("marker-hovered");
            el.style.zIndex = "1";
            // Don't apply CSS transforms here - let CustomMapMarker handle visual changes
          }

          // Update marker rendering if update function exists
          if (markerUpdateFunctions.current[idStr]) {
            markerUpdateFunctions.current[idStr](
              hoveredExchangeId,
              selectedExchangeId
            );
          }
        }
      });
    }
  }, [hoveredExchangeId, selectedExchangeId]);

  // Update the markers creation logic
  useEffect(() => {
    if (!map.current || !mapLoaded) return;

    console.log("Adding markers to map");

    try {
      markers.current.forEach((marker) => marker.remove());
      markers.current = [];
      markerElements.current = {};
      markerUpdateFunctions.current = {};

      const bounds = new mapboxgl.LngLatBounds();
      let hasValidMarkers = false;

      filteredOffices.forEach((office) => {
        // Only create markers for offices with real coordinates
        if (
          !office.location ||
          !office.location.coordinates ||
          office.location.coordinates.length !== 2
        ) {
          return;
        }

        const [lng, lat] = office.location.coordinates;

        // If coordinates are 0,0 (invalid/placeholder), place in selected city center
        let position: { lng: number; lat: number };
        if (lng === 0 && lat === 0) {
          // Use selected city coordinates if available, otherwise fallback to Casablanca
          if (selectedCityCoordinates) {
            position = selectedCityCoordinates;
            console.log(
              `Using selected city center for ${office.officeName}: ${selectedCityCoordinates.lng}, ${selectedCityCoordinates.lat}`
            );
          } else {
            // Default to Casablanca city center for 0,0 coordinates if no city selected
            position = { lng: -7.5898, lat: 33.5731 };
            console.log(
              `Using Casablanca center for ${office.officeName}: 0,0 coordinates found, no city selected`
            );
          }
        } else {
          position = { lng, lat };
          console.log(`Adding marker for ${office.officeName}: ${lng}, ${lat}`);
        }

        const el = document.createElement("div");
        el.className = "custom-marker-container";

        // Store reference to marker element (use string ID)
        markerElements.current[String(office.id)] = el;

        // Store the root for later updates
        const root = ReactDOM.createRoot(el);

        // Function to update marker rendering
        const updateMarker = (
          hoveredId: string | number | null = null,
          selectedId: string | number | null = null
        ) => {
          // Derive currency code from rates (prefer active rate), since office.targetCurrency only has symbol in types
          const derivedCode =
            office.rates?.find((r) => r.isActive)?.targetCurrency?.code ??
            office.rates?.[0]?.targetCurrency?.code ??
            "";
          root.render(
            <CustomMapMarker
              rate={office.equivalentValue ?? office.buyRate ?? "0"}
              imageSrc="/assets/map-pin-logo.svg"
              isSelected={
                (selectedId !== null && selectedId === office.id) ||
                hoveredId === office.id
              }
              isBestOffice={showBestOffice && office.bestOffice === true}
              rates={office.rates || []}
              targetCurrency={{
                code: derivedCode,
                symbol: office?.targetCurrency?.symbol || "",
              }}
            />
          );
        };

        // Store update function
        markerUpdateFunctions.current[String(office.id)] = updateMarker;

        // Initial render
        updateMarker(hoveredExchangeId, selectedExchangeId);

        const marker = new mapboxgl.Marker({
          element: el,
          anchor: "bottom",
        })
          .setLngLat(position)
          .addTo(map.current!);

        // Add click event listener to show full exchange card
        el.addEventListener("click", () => {
          setHoveredExchangeIdInternal(office.id);
          setSelectedExchangeId(office.id);
          setHoveredOffice(office);

          // Update global hover context to sync with results list
          setHoveredExchangeId(office.id);

          // Close exchange list modal on mobile when card is opened
          if (window.innerWidth < 768) {
            const closeModalEvent = new CustomEvent("closeExchangeListModal", {
              detail: { isVisible: false },
            });
            window.dispatchEvent(closeModalEvent);

            // Notify parent component about map card visibility
            if (onMapCardVisibilityChange) {
              onMapCardVisibilityChange(true);
            }
          }

          // Calculate position for click card
          if (mapContainer.current) {
            const rect = el.getBoundingClientRect();
            const mapRect = mapContainer.current.getBoundingClientRect();
            const isMobile = window.innerWidth < 768; // md breakpoint

            let left: number;
            let top = rect.top - mapRect.top - 350; // Position above marker

            if (isMobile) {
              // On mobile, center the card horizontally
              const cardWidth = mapRect.width * 0.9; // 90% of viewport width
              left = (mapRect.width - cardWidth) / 2;
            } else {
              // On desktop, center relative to marker
              left = rect.left - mapRect.left - 125;
              const cardWidth = 250;

              // Keep card within map bounds
              if (left < 10) left = 10;
              if (left + cardWidth > mapRect.width - 10) {
                left = mapRect.width - cardWidth - 10;
              }
            }

            if (top < 10) {
              top = rect.bottom - mapRect.top + 10; // Position below marker if no space above
            }

            setHoverCardPosition({ top, left });
          }
        });

        el.addEventListener("dblclick", () => {
          if (office.slug) {
            // Use slug for navigation - this is the preferred method
            window.location.href = `/exchange-detail?slug=${encodeURIComponent(
              office.slug
            )}`;
          } else {
            console.warn(
              `No slug available for office ${office.officeName}, using ID fallback`
            );
            const params = new URLSearchParams();
            params.append("id", office.id.toString());
            params.append("name", office.officeName || "");
            params.append(
              "rate",
              String(office.equivalentValue ?? office.buyRate ?? "N/A")
            );
            params.append("address", office.address || "");
            params.append(
              "hours",
              renderWorkingHours(office.todayWorkingHours)
            );
            params.append("isPopular", (office.isPopular || false).toString());
            params.append("images", (office.images || []).join(","));
            params.append("country", office.country?.name || "Morocco");

            window.location.href = `/exchange-detail?${params.toString()}`;
          }
        });

        markers.current.push(marker);

        bounds.extend(position);
        hasValidMarkers = true;
      });

      // Disabled automatic fitBounds - let users navigate freely
      // On page switches only, fit to markers once
      if (
        hasValidMarkers &&
        shouldFitOnNextMarkersRenderRef.current &&
        map.current &&
        !isUserInteractingRef.current
      ) {
        // Recenter without any zoom change or animation
        isProgrammaticMoveRef.current = true;
        try {
          const targetCenter = bounds.getCenter();
          map.current.setCenter(targetCenter);
        } finally {
          shouldFitOnNextMarkersRenderRef.current = false;
        }
      }

      // Always notify current viewport radius after markers render/update
      dispatchViewportRadius();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error adding markers";
      console.error("Error adding markers:", errorMessage);
      setMapError(errorMessage);
    }
  }, [
    mapLoaded,
    isTouchDevice,
    isCustomFullscreen,
    filteredOffices,
    // Re-render markers when selected city center changes so 0,0 offices reposition correctly
    selectedCityCoordinates,
    // Removed selectedExchangeId and hoveredExchangeId to prevent marker recreation
  ]);

  // Auto-open best office card only once when filteredOffices first arrive (when showBestOffice is true)
  useEffect(() => {
    if (
      filteredOffices.length > 0 &&
      mapLoaded &&
      showBestOffice &&
      !hasAutoOpenedBestOfficeRef.current
    ) {
      const bestOffice = filteredOffices.find(
        (office) => office.bestOffice === true
      );
      if (bestOffice) {
        // Find the marker element for the best office
        const markerEl = markerElements.current[String(bestOffice.id)];
        if (markerEl && mapContainer.current) {
          // Simulate clicking on the best office marker
          setHoveredExchangeIdInternal(bestOffice.id);
          setSelectedExchangeId(bestOffice.id);
          setHoveredOffice(bestOffice);
          setHoveredExchangeId(bestOffice.id);
          // Mark as opened to prevent future automatic openings
          hasAutoOpenedBestOfficeRef.current = true;

          // Close exchange list modal on mobile when best office card is opened
          if (window.innerWidth < 768) {
            const closeModalEvent = new CustomEvent("closeExchangeListModal", {
              detail: { isVisible: false },
            });
            window.dispatchEvent(closeModalEvent);

            // Notify parent component about map card visibility
            if (onMapCardVisibilityChange) {
              onMapCardVisibilityChange(true);
            }
          }

          // Calculate position for the best office card
          const rect = markerEl.getBoundingClientRect();
          const mapRect = mapContainer.current.getBoundingClientRect();
          const isMobile = window.innerWidth < 768;

          let left: number;
          let top = rect.top - mapRect.top - 350;

          if (isMobile) {
            const cardWidth = mapRect.width * 0.9;
            left = (mapRect.width - cardWidth) / 2;
          } else {
            left = rect.left - mapRect.left - 125;
            const cardWidth = 250;

            if (left < 10) left = 10;
            if (left + cardWidth > mapRect.width - 10) {
              left = mapRect.width - cardWidth - 10;
            }
          }

          if (top < 10) {
            top = rect.bottom - mapRect.top + 10;
          }

          setHoverCardPosition({ top, left });
        }
      }
    }
  }, [filteredOffices, mapLoaded, onMapCardVisibilityChange, showBestOffice]);

  const handleZoom = (distance: number) => {
    if (!map.current) return;

    let zoom = 12;
    if (distance === 5) zoom = 13;
    if (distance === 1) zoom = 15;

    map.current.zoomTo(zoom, { duration: 500 });
  };

  const fetchCityName = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}&types=place&limit=1&language=fr`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch city name");
      }
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        return data.features[0].text;
      }
      return "Votre position";
    } catch (error) {
      console.error("Error fetching city name:", error);
      return "Votre position";
    }
  };

  const handleUseCurrentLocation = () => {
    setLocationError(null);
    setIsSearching(true);

    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser.");
      setIsSearching(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const cityName = await fetchCityName(latitude, longitude);

        if (map.current) {
          isProgrammaticMoveRef.current = true;
          map.current.setCenter([longitude, latitude]);
        }

        addUserLocationMarker(latitude, longitude, cityName);

        const customEvent = new CustomEvent("mapLocationChanged", {
          detail: {
            lat: latitude,
            lng: longitude,
            name: cityName,
            country: "Maroc",
            userInitiated: false,
          },
        });
        window.dispatchEvent(customEvent);

        setSearchTerm("");
        setSuggestions([]);
        setShowSearch(false);
        setIsSearching(false);
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
        }
        setLocationError(errorMessage);
        setIsSearching(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleGetCurrentLocation = () => {
    if (!map.current) return;

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          isProgrammaticMoveRef.current = true;
          map.current?.setCenter([longitude, latitude]);

          // Reverse geocode to get the place name in French
          fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${mapboxgl.accessToken}&language=fr&types=place`
          )
            .then((res) => res.json())
            .then((data) => {
              let placeName = "Votre position";
              if (data.features && data.features.length > 0) {
                placeName =
                  data.features[0].text_fr ||
                  data.features[0].text ||
                  placeName;
              }
              const customEvent = new CustomEvent("mapLocationChanged", {
                detail: {
                  lat: latitude,
                  lng: longitude,
                  name: placeName,
                  userInitiated: false,
                },
              });
              window.dispatchEvent(customEvent);
            });
        },
        (error) => {
          console.error("Error getting location:", error);
        }
      );
    }
  };

  const handleFullscreen = () => {
    setIsCustomFullscreen(!isCustomFullscreen);

    const fullscreenEvent = new CustomEvent("mapFullscreenToggle", {
      detail: { isFullscreen: !isCustomFullscreen },
    });
    window.dispatchEvent(fullscreenEvent);

    // Remove the redundant resize call here since we handle it in the useEffect
  };

  const renderFallbackMap = () => {
    return (
      <div className="relative w-full h-full flex flex-col items-center justify-center bg-gray-50">
        <Image
          src="/assets/map-area.svg"
          alt="Static Map"
          width={800}
          height={500}
          className="w-full h-full object-cover rounded-lg"
        />
      </div>
    );
  };

  // Now update the fetchLocationSuggestions function
  const fetchLocationSuggestions = async (query: string) => {
    // Always show predefined locations, even with empty search
    if (!query.trim()) {
      setSuggestions(predefinedLocations);
      return;
    }

    setIsSearching(true);

    // First filter predefined locations
    const filteredPredefined = predefinedLocations.filter(
      (location: LocationSuggestion) =>
        location.name.toLowerCase().includes(query.toLowerCase())
    );

    // If the query is very short, just show filtered predefined locations
    if (query.length < 2) {
      setSuggestions(filteredPredefined);
      setIsSearching(false);
      return;
    }

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          query
        )}.json?access_token=${
          mapboxgl.accessToken
        }&types=place&limit=5&country=MA&language=fr`
      );

      if (!response.ok) {
        throw new Error(`Failed to geocode location: ${response.status}`);
      }

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const mapboxSuggestions: LocationSuggestion[] = data.features.map(
          (place: any, index: number) => {
            const country =
              place.context?.find((ctx: any) => ctx.id.startsWith("country"))
                ?.text || "Maroc";

            const [lng, lat] = place.center;

            return {
              id: `mapbox-${index}-${place.id}`,
              name: place.text,
              country: country,
              coordinates: { lng, lat },
            };
          }
        );

        // Remove duplicates (by name) with predefined cities
        const uniqueMapbox = mapboxSuggestions.filter(
          (s: LocationSuggestion) =>
            !filteredPredefined.some(
              (l: LocationSuggestion) =>
                l.name.toLowerCase() === s.name.toLowerCase()
            )
        );

        setSuggestions([...filteredPredefined, ...uniqueMapbox]);
      } else {
        setSuggestions(filteredPredefined);
      }
    } catch (error) {
      console.error("Error fetching location suggestions:", error);
      setSuggestions(filteredPredefined);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (!value.trim()) {
      // Show all predefined locations when search is cleared
      setSuggestions(predefinedLocations);
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

  useEffect(() => {
    return () => {
      if (debounceTimeout) {
        clearTimeout(debounceTimeout);
      }
    };
  }, [debounceTimeout]);

  const handleSelectLocation = (suggestion: LocationSuggestion) => {
    if (map.current) {
      isProgrammaticMoveRef.current = true;
      map.current.setCenter([
        suggestion.coordinates.lng,
        suggestion.coordinates.lat,
      ]);
    }

    addUserLocationMarker(
      suggestion.coordinates.lat,
      suggestion.coordinates.lng,
      suggestion.name
    );

    const searchUpdateEvent = new CustomEvent("mapLocationChanged", {
      detail: {
        lat: suggestion.coordinates.lat,
        lng: suggestion.coordinates.lng,
        name: suggestion.name,
        country: suggestion.country,
        userInitiated: false,
      },
    });
    window.dispatchEvent(searchUpdateEvent);

    setSearchTerm("");
    setSuggestions([]);
    setShowSearch(false);
  };

  // Now update the handleSearch function
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!searchTerm.trim()) return;

    if (suggestions.length > 0) {
      handleSelectLocation(suggestions[0]);
      return;
    }

    setIsSearching(true);

    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          searchTerm
        )}.json?access_token=${
          mapboxgl.accessToken
        }&types=place&limit=1&country=MA&language=fr`
      );

      if (!response.ok) {
        throw new Error(`Failed to geocode location: ${response.status}`);
      }

      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const [lng, lat] = feature.center;
        const locationName = feature.text;
        const country =
          feature.context?.find((ctx: any) => ctx.id.startsWith("country"))
            ?.text || "Maroc";

        if (map.current) {
          isProgrammaticMoveRef.current = true;
          map.current.setCenter([lng, lat]);
        }

        addUserLocationMarker(lat, lng, locationName);

        const searchUpdateEvent = new CustomEvent("mapLocationChanged", {
          detail: {
            lat,
            lng,
            name: locationName,
            country,
            userInitiated: false,
          },
        });
        window.dispatchEvent(searchUpdateEvent);

        setSearchTerm("");
        setSuggestions([]);
        setShowSearch(false);
      } else {
        console.warn("No results found for search term:", searchTerm);
      }
    } catch (error) {
      console.error("Error searching for location:", error);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
      // Show predefined locations when search is opened
      setSuggestions(predefinedLocations);
    }
  }, [showSearch]);

  useEffect(() => {
    if (!isCustomFullscreen) {
      setHoveredExchangeIdInternal(null);
      setHoveredOffice(null);
      setHoverCardPosition(null);

      // Notify parent component about map card visibility change
      if (onMapCardVisibilityChange) {
        onMapCardVisibilityChange(false);
      }
    }
  }, [isCustomFullscreen, onMapCardVisibilityChange]);

  useEffect(() => {
    // Only show hover card if we have a selected office
    if (!hoveredOffice) {
      setHoverCardPosition(null);
      return;
    }

    // If we have a hovered office and no position yet, calculate position
    if (hoveredOffice && !hoverCardPosition && hoveredExchangeIdInternal) {
      const el = markerElements.current[hoveredExchangeIdInternal];
      if (el && mapContainer.current) {
        const rect = el.getBoundingClientRect();
        const mapRect = mapContainer.current.getBoundingClientRect();
        const isMobile = window.innerWidth < 768; // md breakpoint

        let left: number;
        let top: number | undefined;

        if (isMobile) {
          // On mobile, center the card horizontally and NO TOP positioning
          const cardWidth = mapRect.width * 0.9;
          left = (mapRect.width - cardWidth) / 2;
          // Don't set top for mobile - let CSS bottom-4 handle it
          top = undefined; // Explicitly set top to undefined for mobile
        } else {
          // On desktop, calculate both top and left with better boundary checking
          const cardWidth = 250;
          const cardHeight = 400; // Approximate card height

          // Start with center position relative to marker
          left = rect.left - mapRect.left - cardWidth / 2;
          top = rect.top - mapRect.top - cardHeight - 20; // Position above marker with offset

          // Ensure card doesn't go off left edge
          if (left < 10) {
            left = 10;
          }

          // Ensure card doesn't go off right edge
          if (left + cardWidth > mapRect.width - 10) {
            left = mapRect.width - cardWidth - 10;
          }

          // If card goes off top edge, position it below the marker
          if (top < 10) {
            top = rect.bottom - mapRect.top + 20;
          }

          // If card goes off bottom edge, position it above the marker
          if (top + cardHeight > mapRect.height - 10) {
            top = rect.top - mapRect.top - cardHeight - 20;
          }

          // Final safety check - if still off screen, center it
          if (top < 10 || top + cardHeight > mapRect.height - 10) {
            top = (mapRect.height - cardHeight) / 2;
          }
          if (left < 10 || left + cardWidth > mapRect.width - 10) {
            left = (mapRect.width - cardWidth) / 2;
          }
        }

        setHoverCardPosition({ top, left });
      }
    }
  }, [
    hoveredOffice,
    hoverCardPosition,
    hoveredExchangeIdInternal,
    selectedExchangeId,
  ]);

  return (
    <div
      className={`relative w-full h-full ${
        isCustomFullscreen ? "fixed top-0 left-0 right-0 bottom-0 z-50" : ""
      }`}
      style={{
        ...(isCustomFullscreen && {
          top: 0,
          left: 0,
          width: "100vw",
          height: "100vh",
        }),
      }}
    >
      {mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md">
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              Map Error
            </h3>
            <p className="text-gray-700">{mapError}</p>
            <p className="text-gray-600 mt-2 text-sm">
              Please try refreshing the page or using a different browser.
            </p>
          </div>
        </div>
      )}

      {!mapLoaded && !mapError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-20">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-gray-500 text-sm">Loading map...</p>
          </div>
        </div>
      )}

      {/* No Results Message */}
      {/* {filteredOffices.length === 0 && mapLoaded && !mapError && (
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-lg z-10 text-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 mx-auto mb-2 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 14h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-medium text-gray-800">
            No Results Found
          </h3>
          <p className="text-gray-600 mt-1">
            Try adjusting your filters to see more offices
          </p>
        </div>
      )} */}

      <div
        ref={mapContainer}
        className="absolute inset-0 w-full h-full overflow-hidden"
        style={{
          display: mapError ? "none" : "block",
        }}
      />

      <div
        className="absolute top-4 right-4 z-10 md:flex items-center hidden "
        ref={searchContainerRef}
      >
        {showSearch && (
          <div className="mr-2 animate-fadeIn relative">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                  <Image
                    src="/assets/location-icon.svg"
                    alt="location"
                    width={18}
                    height={18}
                  />
                </div>
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder="Search city..."
                  className="w-[220px] md:w-[320px] h-12 pl-12 pr-12 rounded-xl smaller bg-white border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#20523C] focus:border-transparent text-gray-700 placeholder-gray-400"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchTerm("");
                      setSuggestions(predefinedLocations);
                    }}
                    className="absolute right-3 top-1/2 w-[16px] h-[16px] transform -translate-y-1/2 rounded-full flex items-center justify-center transition-colors cursor-pointer"
                  >
                    <Image
                      src="/assets/close-circle.svg"
                      alt="close"
                      width={16}
                      height={16}
                    />
                  </button>
                )}
              </div>
            </form>

            {/* Dropdown Menu */}
            {showSearch && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-gray-100 z-50 w-[320px] overflow-hidden">
                {/* Use Current Location Button */}
                <button
                  onClick={handleUseCurrentLocation}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-left text-[#20523C] hover:bg-[#F1F1F1] transition-colors border-b border-[#DEDEDE]"
                >
                  <Image
                    src="/assets/gps.svg"
                    width={18}
                    height={18}
                    alt="gps"
                  />
                  <span className="text-[14px] leading-[20px] font-medium">
                    Use my current location
                  </span>
                </button>

                <div className="max-h-60 overflow-y-auto">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-3">
                      <div className="w-5 h-5 border-2 border-[#20523C] border-t-transparent rounded-full animate-spin"></div>
                      <span className="ml-2 text-[#585858] text-[14px]">
                        Searching...
                      </span>
                    </div>
                  ) : suggestions.length > 0 ? (
                    suggestions.map((suggestion, index) => (
                      <button
                        key={suggestion.id}
                        onClick={() => handleSelectLocation(suggestion)}
                        className={`w-full flex items-center px-4 py-3 hover:bg-gray-50 text-left transition-colors ${
                          index === 0 ? "bg-gray-100" : ""
                        } ${
                          index !== suggestions.length - 1
                            ? "border-b border-gray-100"
                            : ""
                        }`}
                      >
                        <div className="flex flex-col w-full">
                          <span className="text-gray-700 text-[15px] font-medium">
                            {suggestion.name}
                          </span>
                          {suggestion.country && (
                            <span className="text-gray-500 text-[13px] mt-0.5">
                              {suggestion.country}
                            </span>
                          )}
                        </div>
                      </button>
                    ))
                  ) : searchTerm && !isSearching ? (
                    <div className="px-4 py-3 text-gray-500">
                      No locations found
                    </div>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        )}
        <button
          onClick={() => {
            setShowSearch(!showSearch);
            if (!showSearch) {
              setSuggestions(predefinedLocations);
            } else {
              setSuggestions([]);
            }
          }}
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
          aria-label="Search"
        >
          {showSearch ? (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M18 6L6 18"
                stroke="#333"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M6 6L18 18"
                stroke="#333"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : (
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M11 19C15.4183 19 19 15.4183 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11C3 15.4183 6.58172 19 11 19Z"
                stroke="#333"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 21L16.65 16.65"
                stroke="#333"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>

      <div
        className={`absolute space-y-[10px] ${
          isCustomFullscreen ? "bottom-[130px]" : "bottom-20 md:bottom-4"
        }  right-4 z-10`}
      >
        {/* Zoom controls */}
        <div className=" flex flex-col gap-2">
          {/* Location button */}
          <button
            onClick={handleGetCurrentLocation}
            className="w-10 cursor-pointer h-10 bg-white rounded-sm flex items-center justify-center shadow-md"
            aria-label="Get current location"
          >
            <Image src="/assets/gps.svg" alt="gps" width={24} height={24} />
          </button>
          <div className="bg-white rounded-md shadow-md">
            <button
              onClick={() => map.current?.zoomIn()}
              className="w-10 h-10 flex cursor-pointer items-center justify-center"
              aria-label="Zoom in"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M12 5V19"
                  stroke="#333"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M5 12H19"
                  stroke="#333"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
            <hr className="border-t mx-2.5 border-[#DDDDDD]" />
            <button
              onClick={() => map.current?.zoomOut()}
              className="w-10 cursor-pointer h-10 flex items-center justify-center"
              aria-label="Zoom out"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 12H19"
                  stroke="#333"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Distance filters */}
        <div className=" transform  flex items-center gap-[10px] z-10">
          {/* <button
          onClick={() => handleZoom(10)}
          className="px-3 hidden md:block cursor-pointer py-1.5 w-auto h-[40px] bg-white rounded-md text-[16px] font-medium shadow-md "
        >
          10Km
        </button>
        <button
          onClick={() => handleZoom(5)}
          className="px-3 cursor-pointer py-1.5 w-auto h-[40px] bg-white rounded-md text-[16px] font-medium shadow-md "
        >
          5Km
        </button>
        <button
          onClick={() => handleZoom(1)}
          className="px-3 cursor-pointer py-1.5 w-auto h-[40px] bg-white rounded-md text-[16px] font-medium shadow-md "
        >
          1Km
        </button>
        <button className="px-3 hidden md:block cursor-pointer py-1.5 w-[40px] h-[40px] bg-white rounded-md text-[16px] font-medium shadow-md ">
          ...
        </button> */}
          <button
            onClick={handleFullscreen}
            className="w-[40px] hidden md:flex cursor-pointer h-[40px] bg-white rounded-md  items-center justify-center shadow-md"
            aria-label={
              isCustomFullscreen ? "Exit fullscreen" : "Enter fullscreen"
            }
          >
            {isCustomFullscreen ? (
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 0 2-2h3M3 16h3a2 2 0 0 0 2 2v3"
                  stroke="#333"
                  strokeWidth="2"
                />
              </svg>
            ) : (
              <Image
                src="/assets/maximize.svg"
                alt="Fullscreen"
                width={24}
                height={24}
              />
            )}
          </button>
        </div>
      </div>

      {hoveredOffice && hoverCardPosition && (
        <div
          className="absolute bottom-4 left-4 right-4 z-40 md:bottom-auto md:left-auto md:right-auto md:z-40 w-[90vw] md:w-[250px] transform origin-bottom-left transition-all duration-200 ease-out"
          style={{
            ...(isTouchDevice ? {} : { top: `${hoverCardPosition.top}px` }),
            left: `${hoverCardPosition.left}px`,
            opacity: 1,
            scale: "1",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)",
          }}
        >
          <button
            className="absolute -top-2 -right-2 w-8 h-8 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center z-50 hover:bg-gray-50 transition-colors"
            onClick={() => {
              setHoveredExchangeIdInternal(null);
              setHoveredOffice(null);
              setHoverCardPosition(null);
              setSelectedExchangeId(null);
              setHoveredExchangeId(null);

              // Notify parent component about map card visibility change
              if (onMapCardVisibilityChange) {
                onMapCardVisibilityChange(false);
              }
            }}
            title="Close"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#333333"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
          <ExchangeCard
            id={hoveredOffice.id}
            name={hoveredOffice.officeName || ""}
            rate={String(
              hoveredOffice.equivalentValue ?? hoveredOffice.buyRate ?? "N/A"
            )}
            address={hoveredOffice.address || ""}
            hours={renderWorkingHours(hoveredOffice.todayWorkingHours)}
            images={hoveredOffice.images || []}
            isPopular={hoveredOffice.isPopular || false}
            country={hoveredOffice.country?.name || "Morocco"}
            slug={hoveredOffice.slug}
            bestOffice={hoveredOffice.bestOffice || false}
            rates={hoveredOffice.rates || []}
            targetCurrencySymbol={hoveredOffice.targetCurrency?.symbol || "MAD"}
          />
        </div>
      )}

      <style jsx global>{`
        .mapboxgl-ctrl-logo {
          display: none !important;
        }
        .mapboxgl-ctrl-attrib {
          display: none !important;
        }
        .mapboxgl-ctrl-bottom-right {
          bottom: 110px !important;
          right: 15px !important;
        }
        .mapboxgl-ctrl-group {
          background-color: transparent !important;
          box-shadow: none !important;
        }
        .mapboxgl-ctrl-group button {
          display: none !important;
        }
        .mapboxgl-popup {
          z-index: 5;
        }
        .mapboxgl-popup-content {
          border-radius: 8px;
          padding: 12px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
        }
        .marker-hovered {
          filter: drop-shadow(0 0 8px rgba(32, 82, 60, 0.8));
        }
        .custom-marker-container {
          transform-origin: center bottom;
          will-change: transform;
        }
      `}</style>
    </div>
  );
};

export default MapView;
