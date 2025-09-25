"use client";

import type React from "react";
import { useState, useEffect, Suspense, useCallback, useRef } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";

import SearchBar from "./SearchBar";
import ExchangeList from "./ExchangeList";
import MapView from "./Map/MapView";
import Filters from "./Filters/Filters";
import ResultHeader from "../Phase1/ResultHeader";
import MobileHeader from "./MobileDesign/MobileHeader";
import MobileExchangeCardModal from "./MobileDesign/MobileExchangeCardModal";
import MobileMenu from "./MobileDesign/MobileMenu";
import { FilterState, ExchangeOffice } from "./types";
import { useMenu } from "@/context/MenuContext";
import { HoverProvider } from "@/context/HoverContext";
import { enrichOfficesWithOpenStatus } from "@/utils/officeHours";
import { fetchNearbyOffices } from "@/services/api";
import MAPBOX_TOKEN from "../Phase1/HomePage/mapboxConfig";

export const ResultsPage: React.FC = () => {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const initialLocation = params.get("location");
  const initialLatParam = params.get("lat");
  const initialLngParam = params.get("lng");
  const showBestOffice = params.get("bestOffice") === "true";

  const [location, setLocation] = useState(
    initialLocation ? initialLocation : "Casablanca"
  );
  const [coordinates, setCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>({
    lat:
      initialLatParam !== null && !Number.isNaN(parseFloat(initialLatParam))
        ? parseFloat(initialLatParam)
        : 33.594074,
    lng:
      initialLngParam !== null && !Number.isNaN(parseFloat(initialLngParam))
        ? parseFloat(initialLngParam)
        : -7.621656,
  }); // Default coordinates for Casablanca
  const [amount, setAmount] = useState<number | undefined>(undefined);
  const [baseCurrency, setBaseCurrency] = useState<string>("EUR");
  const [targetCurrency, setTargetCurrency] = useState<string>("MAD");
  const [targetCurrencyRateValue, setTargetCurrencyRateValue] = useState<
    number | undefined
  >(undefined);
  const [filteredOffices, setFilteredOffices] = useState<ExchangeOffice[]>([]);
  const [count, setCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOfficesInArea, setTotalOfficesInArea] = useState(0);
  // Dynamic radius reported by MapView (derived from viewport)
  const [dynamicRadiusKm, setDynamicRadiusKm] = useState<number | null>(null);
  const [lastUpdate, setLastUpdate] = useState("3 days Ago");
  const [isMapFullscreen, setIsMapFullscreen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [sortOption, setSortOption] = useState<string | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    selectedCurrencies: [],
    selectedTrends: [],
    showOpenOfficesOnly: false,
  });
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
  const [mapVisibleOffices, setMapVisibleOffices] = useState<ExchangeOffice[]>(
    []
  );
  const [isMapCardOpen, setIsMapCardOpen] = useState(false);
  const [isCurrencyDropdownOpen, setIsCurrencyDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  // Track if the latest coordinate change was user-initiated (via map event)
  const lastCoordChangeWasUser = useRef(false);
  // Monotonic counter: increment on each Check Rates press to always trigger a fetch
  const [refetchTick, setRefetchTick] = useState(0);
  // If we are geocoding a location from URL (without explicit lat/lng), skip the default init fetch
  const [skipInitialFetch, setSkipInitialFetch] = useState(false);

  // Handle map card visibility changes
  const handleMapCardVisibilityChanged = useCallback((isVisible: boolean) => {
    setIsMapCardOpen(isVisible);
  }, []);

  // Stable callback for ExchangeList to report visible offices (must be declared at top-level)
  const handleVisibleOfficesChange = useCallback(
    (offices: ExchangeOffice[]) => setMapVisibleOffices(offices),
    []
  );

  // On mount, hydrate state from real window.location. If only location is present, geocode it to coordinates.
  useEffect(() => {
    if (typeof window !== "undefined") {
      const checkDesktop = () => setIsDesktop(window.innerWidth >= 1024);
      checkDesktop();
      window.addEventListener("resize", checkDesktop);
      // cleanup resize
      return () => window.removeEventListener("resize", checkDesktop);
    }
  }, []);

  // On mount, hydrate state from real window.location. If only location is present, geocode it to coordinates.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sp = new URLSearchParams(window.location.search);
    const loc = sp.get("location");
    const latStr = sp.get("lat");
    const lngStr = sp.get("lng");
    const latNum = latStr !== null ? parseFloat(latStr) : NaN;
    const lngNum = lngStr !== null ? parseFloat(lngStr) : NaN;

    // Also hydrate currencies and amount to avoid default MAD/EUR flashes
    const src = sp.get("source");
    const tgt = sp.get("target");
    const amtStr = sp.get("amount");
    const amtNum = amtStr !== null ? parseFloat(amtStr) : NaN;

    const finalizeInit = () => setIsInitialized(true);

    if (loc) {
      setLocation(loc);
    }
    if (src && typeof src === "string") {
      setBaseCurrency(src);
    }
    if (tgt && typeof tgt === "string") {
      setTargetCurrency(tgt);
    }
    if (!Number.isNaN(amtNum)) {
      setAmount(amtNum);
      setTargetCurrencyRateValue(amtNum);
    }

    // If lat/lng are present and valid, use them directly
    if (!Number.isNaN(latNum) && !Number.isNaN(lngNum)) {
      setCoordinates({ lat: latNum, lng: lngNum });
      finalizeInit();
      return;
    }

    // If we have only location name, geocode to get coordinates so we don't default to Casablanca
    if (loc && MAPBOX_TOKEN) {
      // We intend to fetch after geocoding, so skip the default initial fetch
      setSkipInitialFetch(true);
      (async () => {
        try {
          const res = await fetch(
            `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
              loc
            )}.json?access_token=${MAPBOX_TOKEN}&types=place&country=MA`
          );
          if (res.ok) {
            const data = await res.json();
            if (Array.isArray(data?.features) && data.features.length > 0) {
              const [lng, lat] = data.features[0].center as [number, number];
              setCoordinates({ lat, lng });
              // Trigger a fetch for these new coordinates without requiring user interaction
              setRefetchTick((t) => t + 1);
            }
          }
        } catch (err) {
          // no-op; fall back to defaults
        } finally {
          finalizeInit();
        }
      })();
      return;
    }

    // No location info, proceed with defaults
    finalizeInit();
  }, []);

  // Keep URL in sync with selected location/coordinates so state persists on navigation
  useEffect(() => {
    try {
      if (typeof window === "undefined" || !isInitialized) return;

      // Build params from current URL to preserve ordering and avoid churn
      const fromWindow = new URLSearchParams(window.location.search);
      if (location) {
        fromWindow.set("location", location);
      } else {
        fromWindow.delete("location");
      }
      if (
        coordinates &&
        typeof coordinates.lat === "number" &&
        typeof coordinates.lng === "number"
      ) {
        fromWindow.set("lat", String(coordinates.lat));
        fromWindow.set("lng", String(coordinates.lng));
      } else {
        fromWindow.delete("lat");
        fromWindow.delete("lng");
      }

      // Sync currency and amount so mobile header text and back/forward reflect changes
      if (baseCurrency) {
        fromWindow.set("source", baseCurrency);
      } else {
        fromWindow.delete("source");
      }
      if (targetCurrency) {
        fromWindow.set("target", targetCurrency);
      } else {
        fromWindow.delete("target");
      }
      if (typeof amount === "number" && !Number.isNaN(amount)) {
        fromWindow.set("amount", String(amount));
      } else {
        fromWindow.delete("amount");
      }

      const queryString = fromWindow.toString();
      const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;
      const currentFull = `${window.location.pathname}${window.location.search}`;
      if (currentFull !== nextUrl) {
        router.replace(nextUrl, { scroll: false });
      }
    } catch (_) {
      // no-op
    }
  }, [
    location,
    coordinates,
    baseCurrency,
    targetCurrency,
    amount,
    isInitialized,
  ]);

  // Update filtered offices and count when location changes or filters are applied
  useEffect(() => {
    // Get base offices from API data or use empty array
    let offices = cityOffices?.offices ? [...cityOffices.offices] : [];

    // Apply filters
    if (filters.selectedCurrencies.length > 0) {
      // Filter by available currencies
      offices = offices.filter((office) => {
        if (!office.availableCurrencies) return false;
        return filters.selectedCurrencies.some((currency) =>
          office.availableCurrencies?.includes(currency)
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
        .sort((a, b) => (a.distanceInKm || 999) - (b.distanceInKm || 999))
        .slice(0, 7);
    }

    // Apply sorting if a sort option is selected
    if (sortOption) {
      offices = sortOffices(offices, sortOption);
    }

    setFilteredOffices(offices);
    setCount(offices.length);
  }, [cityOffices, sortOption, filters]);

  // Initial fetch when component mounts - use initial coordinates
  useEffect(() => {
    const fetchOfficesData = async () => {
      setIsLoading(true);
      console.log("[ResultsPage] init fetch: start", {
        baseCurrency,
        targetCurrency,
        amount,
        targetCurrencyRateValue,
        initialLatParam,
        initialLngParam,
        currentPage,
      });
      try {
        // Use initial coordinates from URL params or defaults
        const initialCoords = {
          lat:
            initialLatParam !== null &&
            !Number.isNaN(parseFloat(initialLatParam))
              ? parseFloat(initialLatParam)
              : 33.594074,
          lng:
            initialLngParam !== null &&
            !Number.isNaN(parseFloat(initialLngParam))
              ? parseFloat(initialLngParam)
              : -7.621656,
        };

        const initParams: any = {
          latitude: initialCoords.lat,
          longitude: initialCoords.lng,
          radiusInKm: dynamicRadiusKm ?? 10,
          baseCurrency,
          targetCurrency,
          isActive: false,
          page: currentPage,
          limit: window.innerWidth < 1024 ? 100 : 9,
        };
        if (
          typeof targetCurrencyRateValue === "number" &&
          !Number.isNaN(targetCurrencyRateValue)
        ) {
          initParams.targetCurrencyRate = targetCurrencyRateValue;
        }
        console.log("[ResultsPage] init fetch: params", initParams);
        const data = await fetchNearbyOffices(initParams);

        // Normalize various possible response shapes
        const officesArray = Array.isArray(data)
          ? data
          : Array.isArray((data as any)?.offices)
          ? (data as any).offices
          : Array.isArray((data as any)?.data)
          ? (data as any).data
          : Array.isArray((data as any)?.data?.offices)
          ? (data as any).data.offices
          : [];

        // Extract pagination and totals from API
        const apiTotalOffices =
          (data as any)?.totalOfficesInArea ??
          (data as any)?.totalCount ??
          (data as any)?.pagination?.totalItems ??
          (data as any)?.data?.totalCount ??
          officesArray.length;
        const apiTotalPages =
          (data as any)?.totalPages ??
          (data as any)?.pagination?.totalPages ??
          1;
        const apiCurrentPage =
          (data as any)?.currentPage ??
          (data as any)?.pagination?.currentPage ??
          currentPage;

        // Enrich offices with open/closed status
        const enrichedOffices = enrichOfficesWithOpenStatus(officesArray);

        const wrappedData = {
          offices: enrichedOffices as ExchangeOffice[],
          totalCount: apiTotalOffices,
          cityInfo: {
            name: initialLocation || "Casablanca",
            totalOffices: apiTotalOffices,
            activeOffices: enrichedOffices.filter((o: any) => o?.isActive)
              .length,
            verifiedOffices: enrichedOffices.filter((o: any) => o?.isVerified)
              .length,
            featuredOffices: enrichedOffices.filter((o: any) => o?.isFeatured)
              .length,
            availableCurrencies: [],
          },
          pagination: {
            page: apiCurrentPage,
            limit: 9,
            totalPages: apiTotalPages,
            hasNextPage:
              (data as any)?.hasMore ?? apiCurrentPage < Number(apiTotalPages),
            hasPreviousPage: apiCurrentPage > 1,
          },
        } as typeof cityOffices;

        setCityOffices(wrappedData || null);
        setTotalOfficesInArea(apiTotalOffices);
        setTotalPages(apiTotalPages);
        setCurrentPage(apiCurrentPage);
        setCount(apiTotalOffices || officesArray.length || 0);
      } catch (error) {
        console.error("Error fetching initial offices:", error);
        setCityOffices(null);
        setCount(0);
      } finally {
        setIsLoading(false);
        console.log("[ResultsPage] init fetch: end", { isLoading: false });
      }
    };
    if (isInitialized && !skipInitialFetch) {
      fetchOfficesData();
    }
  }, [isInitialized, skipInitialFetch]); // Skip when geocoding path is used

  // Handle coordinate changes after initial load, but only when Check Rates was pressed
  useEffect(() => {
    if (!isInitialized || !coordinates) return;
    // Do not fetch on passive location changes unless user pressed Check Rates or explicitly moved the map
    if (refetchTick === 0 && !lastCoordChangeWasUser.current) return;

    const fetchOfficesForNewCoordinates = async () => {
      setIsLoading(true);
      console.log("[ResultsPage] coord fetch: start", {
        coordinates,
        baseCurrency,
        targetCurrency,
        targetCurrencyRateValue,
        currentPage,
        refetchTick,
        userInitiated: lastCoordChangeWasUser.current,
      });
      try {
        // Reset to page 1 ONLY if the change was user-initiated (from map)
        const pageToLoad = lastCoordChangeWasUser.current ? 1 : currentPage;
        if (lastCoordChangeWasUser.current) {
          setCurrentPage(pageToLoad);
        }
        const coordParams: any = {
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          radiusInKm: dynamicRadiusKm ?? 10,
          baseCurrency,
          targetCurrency,
          isActive: false,
          page: pageToLoad,
          limit: window.innerWidth < 1024 ? 100 : 9,
        };
        if (
          typeof targetCurrencyRateValue === "number" &&
          !Number.isNaN(targetCurrencyRateValue)
        ) {
          coordParams.targetCurrencyRate = targetCurrencyRateValue;
        }
        console.log("[ResultsPage] coord fetch: params", coordParams);
        const data = await fetchNearbyOffices(coordParams);

        // Normalize various possible response shapes
        const officesArray = Array.isArray(data)
          ? data
          : Array.isArray((data as any)?.offices)
          ? (data as any).offices
          : Array.isArray((data as any)?.data)
          ? (data as any).data
          : Array.isArray((data as any)?.data?.offices)
          ? (data as any).data.offices
          : [];

        // Extract pagination and totals from API
        const apiTotalOffices =
          (data as any)?.totalOfficesInArea ??
          (data as any)?.totalCount ??
          (data as any)?.pagination?.totalItems ??
          (data as any)?.data?.totalCount ??
          officesArray.length;
        const apiTotalPages =
          (data as any)?.totalPages ??
          (data as any)?.pagination?.totalPages ??
          1;
        const apiCurrentPage =
          (data as any)?.currentPage ??
          (data as any)?.pagination?.currentPage ??
          currentPage;

        // Enrich offices with open/closed status
        const enrichedOffices = enrichOfficesWithOpenStatus(officesArray);

        const wrappedData = {
          offices: enrichedOffices as ExchangeOffice[],
          totalCount: apiTotalOffices,
          cityInfo: {
            name: location,
            totalOffices: apiTotalOffices,
            activeOffices: enrichedOffices.filter((o: any) => o?.isActive)
              .length,
            verifiedOffices: enrichedOffices.filter((o: any) => o?.isVerified)
              .length,
            featuredOffices: enrichedOffices.filter((o: any) => o?.isFeatured)
              .length,
            availableCurrencies: [],
          },
          pagination: {
            page: apiCurrentPage,
            limit: 9,
            totalPages: apiTotalPages,
            hasNextPage:
              (data as any)?.hasMore ?? apiCurrentPage < Number(apiTotalPages),
            hasPreviousPage: apiCurrentPage > 1,
          },
        } as typeof cityOffices;

        setCityOffices(wrappedData || null);
        setTotalOfficesInArea(apiTotalOffices);
        setTotalPages(apiTotalPages);
        setCurrentPage(apiCurrentPage);
        setCount(apiTotalOffices || officesArray.length || 0);
      } catch (error) {
        console.error("Error fetching offices for new coordinates:", error);
        setCityOffices(null);
        setCount(0);
      } finally {
        setIsLoading(false);
        console.log("[ResultsPage] coord fetch: end", { isLoading: false });
      }
    };

    fetchOfficesForNewCoordinates();
    // Reset the flag after handling a coordinate change
    if (lastCoordChangeWasUser.current) {
      lastCoordChangeWasUser.current = false;
    }
  }, [coordinates, location, refetchTick]);

  // Refetch when filters change (immediate). Currency/amount/location changes are gated by Check Rates.
  useEffect(() => {
    if (!cityOffices || !isInitialized) return;
    if (!coordinates) return;

    const refetchWithFilters = async () => {
      try {
        setIsLoading(true);
        console.log("[ResultsPage] filter fetch: start", {
          coordinates,
          baseCurrency,
          targetCurrency,
          targetCurrencyRateValue,
          filters,
        });
        // Reset to first page when filters or currency change
        const pageToLoad = 1;
        setCurrentPage(pageToLoad);
        const filterParams: any = {
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          radiusInKm: dynamicRadiusKm ?? 10,
          baseCurrency,
          targetCurrency,
          isActive: false,
          page: pageToLoad,
          limit: window.innerWidth < 1024 ? 100 : 9,
          availableCurrencies:
            filters.selectedCurrencies.length > 0
              ? filters.selectedCurrencies
              : undefined,
          trend:
            filters.selectedTrends.length > 0
              ? (filters.selectedTrends[0] as
                  | "featured"
                  | "verified"
                  | "newest")
              : undefined,
          showOnlyOpenNow: filters.showOpenOfficesOnly,
        };
        if (
          typeof targetCurrencyRateValue === "number" &&
          !Number.isNaN(targetCurrencyRateValue)
        ) {
          filterParams.targetCurrencyRate = targetCurrencyRateValue;
        }
        console.log("[ResultsPage] filter fetch: params", filterParams);
        const data = await fetchNearbyOffices(filterParams);

        const officesArray = Array.isArray(data)
          ? data
          : Array.isArray((data as any)?.offices)
          ? (data as any).offices
          : Array.isArray((data as any)?.data)
          ? (data as any).data
          : Array.isArray((data as any)?.data?.offices)
          ? (data as any).data.offices
          : [];

        const apiTotalOffices =
          (data as any)?.totalOfficesInArea ??
          (data as any)?.totalCount ??
          (data as any)?.pagination?.totalItems ??
          (data as any)?.data?.totalCount ??
          officesArray.length;
        const apiTotalPages =
          (data as any)?.totalPages ??
          (data as any)?.pagination?.totalPages ??
          1;
        const apiCurrentPage =
          (data as any)?.currentPage ??
          (data as any)?.pagination?.currentPage ??
          pageToLoad;

        // Enrich offices with open/closed status
        const enrichedOffices = enrichOfficesWithOpenStatus(officesArray);

        const wrappedData = {
          offices: enrichedOffices as ExchangeOffice[],
          totalCount: apiTotalOffices,
          cityInfo: {
            name: location,
            totalOffices: apiTotalOffices,
            activeOffices: enrichedOffices.filter((o: any) => o?.isActive)
              .length,
            verifiedOffices: enrichedOffices.filter((o: any) => o?.isVerified)
              .length,
            featuredOffices: enrichedOffices.filter((o: any) => o?.isFeatured)
              .length,
            availableCurrencies: [],
          },
          pagination: {
            page: apiCurrentPage,
            limit: 9,
            totalPages: apiTotalPages,
            hasNextPage:
              (data as any)?.hasMore ?? apiCurrentPage < Number(apiTotalPages),
            hasPreviousPage: apiCurrentPage > 1,
          },
        } as typeof cityOffices;

        setCityOffices(wrappedData || null);
        setTotalOfficesInArea(apiTotalOffices);
        setTotalPages(apiTotalPages);
        setCurrentPage(apiCurrentPage);
        setCount(apiTotalOffices || officesArray.length || 0);
      } catch (error) {
        console.error("Error refetching with filters:", error);
        // Don't update state on filter error to preserve existing data
      } finally {
        setIsLoading(false);
        console.log("[ResultsPage] filter fetch: end", { isLoading: false });
      }
    };

    refetchWithFilters();
  }, [filters]);

  // Disable implicit refetch on target rate updates; wait for Check Rates
  useEffect(() => {
    return; // no-op; rate changes are applied on next explicit fetch
  }, [targetCurrencyRateValue]);

  // Fetch when currentPage changes (do NOT reset page)
  useEffect(() => {
    if (!cityOffices || !isInitialized) return;
    if (!coordinates) return;

    const fetchPage = async () => {
      try {
        setIsLoading(true);
        console.log("[ResultsPage] page fetch: start", {
          page: currentPage,
          coordinates,
          baseCurrency,
          targetCurrency,
          targetCurrencyRateValue,
          filters,
        });
        const pageParams: any = {
          latitude: coordinates.lat,
          longitude: coordinates.lng,
          radiusInKm: dynamicRadiusKm ?? 10,
          baseCurrency,
          targetCurrency,
          isActive: false,
          page: currentPage,
          limit: window.innerWidth < 1024 ? 100 : 9,
          availableCurrencies:
            filters.selectedCurrencies.length > 0
              ? filters.selectedCurrencies
              : undefined,
          trend:
            filters.selectedTrends.length > 0
              ? (filters.selectedTrends[0] as
                  | "featured"
                  | "verified"
                  | "newest")
              : undefined,
          showOnlyOpenNow: filters.showOpenOfficesOnly,
        };
        if (
          typeof targetCurrencyRateValue === "number" &&
          !Number.isNaN(targetCurrencyRateValue)
        ) {
          pageParams.targetCurrencyRate = targetCurrencyRateValue;
        }
        console.log("[ResultsPage] page fetch: params", pageParams);
        const data = await fetchNearbyOffices(pageParams);

        const officesArray = Array.isArray(data)
          ? data
          : Array.isArray((data as any)?.offices)
          ? (data as any).offices
          : Array.isArray((data as any)?.data)
          ? (data as any).data
          : Array.isArray((data as any)?.data?.offices)
          ? (data as any).data.offices
          : [];

        const apiTotalOffices =
          (data as any)?.totalOfficesInArea ??
          (data as any)?.totalCount ??
          (data as any)?.pagination?.totalItems ??
          (data as any)?.data?.totalCount ??
          officesArray.length;
        const apiTotalPages =
          (data as any)?.totalPages ??
          (data as any)?.pagination?.totalPages ??
          1;
        const apiCurrentPage =
          (data as any)?.currentPage ??
          (data as any)?.pagination?.currentPage ??
          currentPage;

        // Enrich offices with open/closed status
        const enrichedOffices = enrichOfficesWithOpenStatus(officesArray);

        const wrappedData = {
          offices: enrichedOffices as ExchangeOffice[],
          totalCount: apiTotalOffices,
          cityInfo: {
            name: location,
            totalOffices: apiTotalOffices,
            activeOffices: enrichedOffices.filter((o: any) => o?.isActive)
              .length,
            verifiedOffices: enrichedOffices.filter((o: any) => o?.isVerified)
              .length,
            featuredOffices: enrichedOffices.filter((o: any) => o?.isFeatured)
              .length,
            availableCurrencies: [],
          },
          pagination: {
            page: apiCurrentPage,
            limit: 9,
            totalPages: apiTotalPages,
            hasNextPage:
              (data as any)?.hasMore ?? apiCurrentPage < Number(apiTotalPages),
            hasPreviousPage: apiCurrentPage > 1,
          },
        } as typeof cityOffices;

        setCityOffices(wrappedData || null);
        setTotalOfficesInArea(apiTotalOffices);
        setTotalPages(apiTotalPages);
        setCurrentPage(apiCurrentPage);
        setCount(apiTotalOffices || officesArray.length || 0);
      } catch (error) {
        console.error("Error fetching page:", error);
      } finally {
        setIsLoading(false);
        console.log("[ResultsPage] page fetch: end", { isLoading: false });
      }
    };

    fetchPage();
  }, [currentPage]);

  // Function to sort offices based on the selected option
  const sortOffices = (offices: typeof filteredOffices, option: string) => {
    const sortedOffices = [...offices];

    if (option === "Highest to Lowest Rate") {
      sortedOffices.sort((a, b) => {
        const rateA = Number.isFinite(a.equivalentValue as number)
          ? (a.equivalentValue as number)
          : 0;
        const rateB = Number.isFinite(b.equivalentValue as number)
          ? (b.equivalentValue as number)
          : 0;

        return rateB - rateA; // Descending order
      });
    } else if (option === "Geographic proximity") {
      sortedOffices.sort((a, b) => {
        const distanceA =
          (typeof a.distanceInKm === "number" ? a.distanceInKm : undefined) ??
          (typeof a.distance === "number" ? a.distance : undefined) ??
          999;
        const distanceB =
          (typeof b.distanceInKm === "number" ? b.distanceInKm : undefined) ??
          (typeof b.distance === "number" ? b.distance : undefined) ??
          999;

        return distanceA - distanceB;
      });
    } else if (option === "Currently open/closed") {
      sortedOffices.sort((a, b) => {
        if (a.isCurrentlyOpen && !b.isCurrentlyOpen) return -1;
        if (!a.isCurrentlyOpen && b.isCurrentlyOpen) return 1;
        return 0;
      });
    }

    return sortedOffices;
  };

  // Explicit fetch used by Check Rates to guarantee a call every time
  const runExplicitCheckRatesFetch = useCallback(async () => {
    if (!coordinates) return;
    try {
      setIsLoading(true);
      console.log("[ResultsPage] explicit fetch: start", {
        coordinates,
        baseCurrency,
        targetCurrency,
        amount,
        targetCurrencyRateValue,
        filters,
      });
      const pageToLoad = 1; // Reset to first page on explicit check
      setCurrentPage(pageToLoad);
      const explicitParams: any = {
        latitude: coordinates.lat,
        longitude: coordinates.lng,
        radiusInKm: dynamicRadiusKm ?? 10,
        baseCurrency,
        targetCurrency,
        isActive: false,
        page: pageToLoad,
        limit: 9,
        availableCurrencies:
          filters.selectedCurrencies.length > 0
            ? filters.selectedCurrencies
            : undefined,
        trend:
          filters.selectedTrends.length > 0
            ? (filters.selectedTrends[0] as "featured" | "verified" | "newest")
            : undefined,
        showOnlyOpenNow: filters.showOpenOfficesOnly,
      };
      if (
        typeof targetCurrencyRateValue === "number" &&
        !Number.isNaN(targetCurrencyRateValue)
      ) {
        explicitParams.targetCurrencyRate = targetCurrencyRateValue;
      }
      console.log("[ResultsPage] explicit fetch: params", explicitParams);
      const data = await fetchNearbyOffices(explicitParams);

      const officesArray = Array.isArray(data)
        ? data
        : Array.isArray((data as any)?.offices)
        ? (data as any).offices
        : Array.isArray((data as any)?.data)
        ? (data as any).data
        : Array.isArray((data as any)?.data?.offices)
        ? (data as any).data.offices
        : [];

      const apiTotalOffices =
        (data as any)?.totalOfficesInArea ??
        (data as any)?.totalCount ??
        (data as any)?.pagination?.totalItems ??
        (data as any)?.data?.totalCount ??
        officesArray.length;
      const apiTotalPages =
        (data as any)?.totalPages ?? (data as any)?.pagination?.totalPages ?? 1;
      const apiCurrentPage =
        (data as any)?.currentPage ??
        (data as any)?.pagination?.currentPage ??
        pageToLoad;

      // Enrich offices with open/closed status
      const enrichedOffices = enrichOfficesWithOpenStatus(officesArray);

      const wrappedData = {
        offices: enrichedOffices as ExchangeOffice[],
        totalCount: apiTotalOffices,
        cityInfo: {
          name: location,
          totalOffices: apiTotalOffices,
          activeOffices: enrichedOffices.filter((o: any) => o?.isActive).length,
          verifiedOffices: enrichedOffices.filter((o: any) => o?.isVerified)
            .length,
          featuredOffices: enrichedOffices.filter((o: any) => o?.isFeatured)
            .length,
          availableCurrencies: [],
        },
        pagination: {
          page: apiCurrentPage,
          limit: 9,
          totalPages: apiTotalPages,
          hasNextPage:
            (data as any)?.hasMore ?? apiCurrentPage < Number(apiTotalPages),
          hasPreviousPage: apiCurrentPage > 1,
        },
      } as typeof cityOffices;

      setCityOffices(wrappedData || null);
      setTotalOfficesInArea(apiTotalOffices);
      setTotalPages(apiTotalPages);
      setCurrentPage(apiCurrentPage);
      setCount(apiTotalOffices || officesArray.length || 0);
    } catch (error) {
      console.error("Error fetching on explicit Check Rates:", error);
    } finally {
      setIsLoading(false);
      console.log("[ResultsPage] explicit fetch: end", { isLoading: false });
    }
  }, [
    coordinates,
    baseCurrency,
    targetCurrency,
    targetCurrencyRateValue,
    filters,
    location,
  ]);

  const handleCheckRates = () => {
    // Run an explicit fetch immediately and also bump the counter for effect-driven paths
    void runExplicitCheckRatesFetch();
    setRefetchTick((t) => t + 1);
  };

  const handleSort = (option: string) => {
    setSortOption(option);
  };

  const handleApplyFilters = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      selectedCurrencies: [],
      selectedTrends: [],
      showOpenOfficesOnly: false,
    });
  };

  // Pagination handler for ExchangeList
  const handlePageChange = (page: number) => {
    if (page < 1) return;
    setCurrentPage(page);
  };

  useEffect(() => {
    const handleMapFullscreenToggle = (e: CustomEvent) => {
      setIsMapFullscreen(e.detail.isFullscreen);
    };

    const handleMapLocationChanged = (e: CustomEvent) => {
      // Accept ONLY explicitly user-initiated updates to avoid background resets
      if (!e.detail || e.detail.userInitiated !== true) {
        return;
      }
      lastCoordChangeWasUser.current = true;
      if (e.detail && e.detail.name) {
        setLocation(e.detail.name);
      }
      if (e.detail && e.detail.lat && e.detail.lng) {
        setCoordinates({ lat: e.detail.lat, lng: e.detail.lng });
      }
      if (e.detail && typeof e.detail.radiusInKm === "number") {
        setDynamicRadiusKm(e.detail.radiusInKm);
      }
    };

    window.addEventListener(
      "mapFullscreenToggle",
      handleMapFullscreenToggle as EventListener
    );

    window.addEventListener(
      "mapLocationChanged",
      handleMapLocationChanged as EventListener
    );

    return () => {
      window.removeEventListener(
        "mapFullscreenToggle",
        handleMapFullscreenToggle as EventListener
      );
      window.removeEventListener(
        "mapLocationChanged",
        handleMapLocationChanged as EventListener
      );
    };
  }, []);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="w-full h-screen flex flex-col">
        <MobileMenu />
        <div className="lg:block hidden flex-shrink-0 border-b border-[#DEDEDE]">
          <ResultHeader />
        </div>
        <div className="w-full lg:hidden block">
          <MobileHeader
            onSortClick={handleSort}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            onCheckRates={handleCheckRates}
            cityOffices={cityOffices}
            filteredOffices={filteredOffices}
            resultCount={count}
            isMapCardOpen={isMapCardOpen}
            onAmountCurrencyChange={({
              amount,
              baseCurrency,
              targetCurrency,
            }) => {
              setAmount(amount);
              setBaseCurrency(baseCurrency);
              setTargetCurrency(targetCurrency);
              setTargetCurrencyRateValue(amount);
            }}
          />
        </div>

        <HoverProvider>
          <div className="flex overflow-hidden w-full relative h-[calc(100vh-125px)] lg:h-screen">
            {/* left side */}
            {isDesktop && (
              <div
                className={` lg:block hidden overflow-y-auto hide-scrollbar pt-6 transition-all duration-300 ${
                  isMapFullscreen ? "w-[0px]" : "flex-1 min-w-0"
                }`}
              >
                <SearchBar
                  setShowSearchDrawer={() => {}}
                  onLocationChange={(locationName) => {
                    setLocation(locationName);
                    // Coordinates will be updated when Check Rates is clicked via mapLocationChanged event
                  }}
                  onCheckRates={handleCheckRates}
                  onAmountCurrencyChange={({
                    amount,
                    baseCurrency,
                    targetCurrency,
                  }) => {
                    setAmount(amount);
                    setBaseCurrency(baseCurrency);
                    setTargetCurrency(targetCurrency);
                    setTargetCurrencyRateValue(amount);
                  }}
                  onCurrencyDropdownChange={setIsCurrencyDropdownOpen}
                />
                <div className="w-full h-[1px] bg-[#DEDEDE] my-6"></div>
                <div className="w-full px-8 max-w-[1020px] mx-auto">
                  <Filters
                    count={totalOfficesInArea || count}
                    cityOffices={cityOffices}
                    onSort={handleSort}
                    onApplyFilters={handleApplyFilters}
                    onClearFilters={handleClearFilters}
                    location={location}
                  />
                  <ExchangeList
                    cityOffices={cityOffices}
                    filteredOffices={filteredOffices}
                    onVisibleOfficesChange={handleVisibleOfficesChange}
                    isLoading={isLoading}
                    baseAmount={
                      amount !== undefined ? String(amount) : undefined
                    }
                    sourceCurrency={baseCurrency}
                    targetCurrency={targetCurrency}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalOfficesInArea={totalOfficesInArea || count}
                    onPageChange={handlePageChange}
                  />
                </div>
              </div>
            )}

            {/* right side */}
            <div
              className={`${
                isMapFullscreen
                  ? "w-screen md:w-[450px] lg:w-[500px]"
                  : "w-screen lg:w-[450px] xl:w-[497px]"
              } h-full flex-shrink-0 border-l border-[#DEDEDE] transition-all duration-300`}
            >
              <div className="h-full ">
                <MapView
                  filteredOffices={
                    mapVisibleOffices && mapVisibleOffices.length > 0
                      ? mapVisibleOffices
                      : filteredOffices
                  }
                  onMapCardVisibilityChange={handleMapCardVisibilityChanged}
                  showBestOffice={showBestOffice}
                  selectedCityCoordinates={coordinates || undefined}
                />
              </div>
            </div>
          </div>
        </HoverProvider>
      </div>
    </Suspense>
  );
};
