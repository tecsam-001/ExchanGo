"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { JSX } from "@emotion/react/jsx-runtime";
import AdminLayout from "@/components/AdminComponents/AdminLayout";
import AboutExchangeOffice from "@/components/AdminComponents/Analytics/AboutExchangeOffice";
import OfficeEngagement from "@/components/AdminComponents/Analytics/OfficeEngagement";
import OverallActivity from "@/components/AdminComponents/Analytics/OverallActivity";
import StatsCard from "@/components/AdminComponents/Analytics/StatsCard";
import HistoryDropdown from "@/components/ExchangeLeadboard/HistoryDropdown";
import AboutOfficeFilterModal from "@/components/AdminComponents/Analytics/AboutOfficeFilterModal";
import OfficeEngagementFilterModal from "@/components/AdminComponents/Analytics/OfficeEngagementFilterModal";
import TableWrapper from "@/components/AdminComponents/Analytics/TableWrapper";
import {
  fetchAdminAnalyticsStats,
  fetchAdminActivityList,
  fetchAdminOfficeEngagement,
  fetchAdminAboutOffices,
  fetchAdminFilterCities,
  AdminAnalyticsStats,
  ActivityListItem,
  OfficeEngagementItem,
  AboutOfficeItem,
  FilterCity,
  AnalyticsPeriod,
  AboutOfficeStatus,
  AboutOfficeDuration,
} from "@/services/api";

interface HistoryOption {
  value: string;
  label: string;
}

interface TabType {
  id: string;
  label: string;
}

interface AboutOfficeActivityData {
  officeName: string;
  city: string;
  country: string;
  registrationDate: string;
  status: "Validated" | "Pending" | "Rejected";
  duration: number;
  registeredCount: string;
}

interface OfficeEngagementActivityData {
  officeName: string;
  city: string;
  profileViews: number;
  phoneCalls: number;
  gpsClick: number;
  share: number;
  waAlerts: number;
}

interface OverallActivityData {
  officeName: string;
  city: string;
  lastUpdate: string;
  updates7days: number;
  activityStatus: "Very Active" | "Active" | "Low Activity";
}

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("Overall Activity");
  const [selectedPeriod, setSelectedPeriod] =
    useState<AnalyticsPeriod>("7days");
  const [showAboutOfficeFilterModal, setShowAboutOfficeFilterModal] =
    useState(false);
  const [showOfficeEngagementFilterModal, setShowOfficeEngagementFilterModal] =
    useState(false);

  const [aboutOfficeFilters, setAboutOfficeFilters] = useState({
    status: "",
    country: "",
    city: [] as string[],
    dateRange: "",
  });

  const [officeEngagementFilters, setOfficeEngagementFilters] = useState({
    city: [] as string[],
    dateRange: "",
  });

  // API state
  const [statsData, setStatsData] = useState<AdminAnalyticsStats | null>(null);
  const [activityListData, setActivityListData] = useState<ActivityListItem[]>(
    []
  );
  const [officeEngagementData, setOfficeEngagementData] = useState<
    OfficeEngagementItem[]
  >([]);
  const [aboutOfficesData, setAboutOfficesData] = useState<AboutOfficeItem[]>(
    []
  );
  const [availableCities, setAvailableCities] = useState<FilterCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state for About Exchange Office
  const [aboutOfficePagination, setAboutOfficePagination] = useState({
    currentPage: 1,
    pageSize: 10,
    totalPages: 1,
    totalItems: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [aboutOfficeLoading, setAboutOfficeLoading] = useState(false);

  // Legacy data for About Office (until API is available)
  const [filteredAboutOfficeData, setFilteredAboutOfficeData] = useState<
    AboutOfficeActivityData[]
  >([]);
  const [filteredOfficeEngagementData, setFilteredOfficeEngagementData] =
    useState<OfficeEngagementActivityData[]>([]);
  const [filteredOverallActivityData, setFilteredOverallActivityData] =
    useState<OverallActivityData[]>([]);

  // Fetch all analytics data
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [
        statsResponse,
        activityResponse,
        engagementResponse,
        aboutOfficesResponse,
        citiesResponse,
      ] = await Promise.all([
        fetchAdminAnalyticsStats(selectedPeriod),
        fetchAdminActivityList({ period: selectedPeriod }),
        fetchAdminOfficeEngagement({ period: selectedPeriod }),
        fetchAdminAboutOffices(),
        fetchAdminFilterCities(),
      ]);

      if (statsResponse.success && statsResponse.data) {
        setStatsData(statsResponse.data);
      }

      if (activityResponse.success && activityResponse.data) {
        setActivityListData(activityResponse.data.data);
        // Convert to legacy format for overall activity
        const overallData = activityResponse.data.data.map((item) => ({
          officeName: item.office.officeName,
          city: item?.office?.city?.name,
          lastUpdate: item.lastUpdate,
          updates7days: item.updates7days,
          activityStatus: item.activityStatus,
        }));
        setFilteredOverallActivityData(overallData);
      }

      if (engagementResponse.success && engagementResponse.data) {
        setOfficeEngagementData(engagementResponse.data.data);
        // Convert to legacy format for office engagement
        const engagementData = engagementResponse.data.data.map((item) => ({
          officeName: item.office.officeName,
          city: item?.office?.city?.name,
          profileViews: item.profileViews,
          phoneCalls: item.phoneCalls,
          gpsClick: item.gpsClick,
          share: item.share,
          waAlerts: item.waAlerts,
        }));
        setFilteredOfficeEngagementData(engagementData);
      }

      if (aboutOfficesResponse.success && aboutOfficesResponse.data) {
        setAboutOfficesData(aboutOfficesResponse.data.data);
        // Convert to legacy format for about exchange office
        const aboutOfficeData = aboutOfficesResponse.data.data.map((item) => ({
          officeName: item.officeName,
          city: item.city,
          country: item.country,
          registrationDate: item.registrationDate,
          status: (item.status === "ACCEPTED"
            ? "Validated"
            : item.status === "REQUESTED"
            ? "Pending"
            : item.status === "REJECTED"
            ? "Rejected"
            : "Pending") as "Validated" | "Pending" | "Rejected",
          duration: item.duration,
          registeredCount: "N/A", // Not available in API response
        }));
        setFilteredAboutOfficeData(aboutOfficeData);

        // Set pagination information from API response
        if (aboutOfficesResponse.data.pagination) {
          setAboutOfficePagination({
            currentPage: aboutOfficesResponse.data.pagination.currentPage,
            pageSize: aboutOfficesResponse.data.pagination.pageSize,
            totalPages: aboutOfficesResponse.data.pagination.totalPages,
            totalItems: aboutOfficesResponse.data.pagination.totalItems,
            hasNextPage: aboutOfficesResponse.data.pagination.hasNextPage,
            hasPreviousPage:
              aboutOfficesResponse.data.pagination.hasPreviousPage,
          });
        }
      }

      if (citiesResponse.success && citiesResponse.data) {
        setAvailableCities(citiesResponse.data);
      }
    } catch (err) {
      setError("Failed to fetch analytics data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchAnalyticsData();
  }, [selectedPeriod]);

  // Handle period change
  const handleHistorySelect = (option: HistoryOption): void => {
    const newPeriod = option.value as AnalyticsPeriod;
    setSelectedPeriod(newPeriod);
  };

  const historyOptions: HistoryOption[] = [
    { value: "7days", label: "Last 7 days" },
    { value: "30days", label: "Last 30 days" },
    { value: "90days", label: "Last 90 days" },
  ];

  // Helper function to format change text
  const formatChangeText = (
    changeFromLastMonth: number,
    period: AnalyticsPeriod
  ) => {
    const sign = changeFromLastMonth >= 0 ? "+" : "";
    const periodText =
      period === "7days" ? "week" : period === "30days" ? "month" : "quarter";
    return `${sign}${changeFromLastMonth} vs last ${periodText}`;
  };

  // Clear error after some time
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Remove the old useEffect that was causing issues

  useEffect(() => {
    if (officeEngagementData.length > 0) {
      const newFilteredData = filterOfficeEngagementData(
        officeEngagementData.map((item) => ({
          officeName: item.office.officeName,
          city: item?.office?.city?.name,
          profileViews: item.profileViews,
          phoneCalls: item.phoneCalls,
          gpsClick: item.gpsClick,
          share: item.share,
          waAlerts: item.waAlerts,
        })),
        officeEngagementFilters
      );
      setFilteredOfficeEngagementData(newFilteredData);
    }
  }, [officeEngagementFilters, officeEngagementData]);

  const tabs: TabType[] = [
    { id: "Overall Activity", label: "Overall Activity" },
    { id: "Office Engagement", label: "Office Engagement" },
    { id: "About Exchange Office", label: "About Exchange Office" },
  ];

  const handleTabClick = (tabId: string): void => {
    setActiveTab(tabId);
    setShowAboutOfficeFilterModal(false);
    setShowOfficeEngagementFilterModal(false);
  };

  const handleFilterButtonClick = () => {
    if (activeTab === "About Exchange Office") {
      setShowAboutOfficeFilterModal(true);
    } else if (activeTab === "Office Engagement") {
      setShowOfficeEngagementFilterModal(true);
    }
  };

  const filterAboutOfficeData = (
    data: AboutOfficeActivityData[],
    filters: typeof aboutOfficeFilters
  ): AboutOfficeActivityData[] => {
    let filtered = data;

    if (filters.status) {
      filtered = filtered.filter((item) => item.status === filters.status);
    }

    if (filters.country) {
      filtered = filtered.filter(
        (item) => item.country.toLowerCase() === filters.country.toLowerCase()
      );
    }

    if (filters.city && filters.city.length > 0) {
      filtered = filtered.filter((item) =>
        filters.city.some(
          (city) => item.city.toLowerCase() === city.toLowerCase()
        )
      );
    }

    if (
      filters.dateRange &&
      filters.dateRange !== "" &&
      filters.dateRange !== "alltime"
    ) {
      const today = new Date();
      let startDate = new Date();

      switch (filters.dateRange) {
        case "last7days":
          startDate.setDate(today.getDate() - 7);
          break;
        case "last1month":
          startDate.setMonth(today.getMonth() - 1);
          break;
        case "last6month":
          startDate.setMonth(today.getMonth() - 6);
          break;
        case "last1year":
          startDate.setFullYear(today.getFullYear() - 1);
          break;
      }

      startDate.setHours(0, 0, 0, 0);

      filtered = filtered.filter((item) => {
        const registrationDate = new Date(item.registrationDate);
        registrationDate.setHours(0, 0, 0, 0);
        return registrationDate >= startDate;
      });
    }

    return filtered;
  };

  // Function to fetch filtered about offices data from API
  const fetchFilteredAboutOfficesData = async (
    filters: typeof aboutOfficeFilters,
    page: number = 1,
    limit: number = 10
  ) => {
    try {
      setAboutOfficeLoading(true);
      const params: any = {
        page,
        limit,
      };

      if (filters.status) {
        // Convert UI status to API status
        const statusMap: Record<string, AboutOfficeStatus> = {
          Validated: "ACCEPTED",
          Pending: "REQUESTED",
          Rejected: "REJECTED",
        };
        params.status = statusMap[filters.status];
      }

      if (filters.city && filters.city.length > 0) {
        // Get city IDs from available cities
        const cityIds = availableCities
          .filter((city) => filters.city.includes(city.name))
          .map((city) => city.id);
        if (cityIds.length > 0) {
          params.cityIds = cityIds.join(",");
        }
      }

      if (
        filters.dateRange &&
        filters.dateRange !== "" &&
        filters.dateRange !== "alltime"
      ) {
        // Convert UI date range to API duration
        const durationMap: Record<string, AboutOfficeDuration> = {
          last7days: "LAST_7_DAYS",
          last1month: "LAST_1_MONTH",
          last6month: "LAST_6_MONTHS",
        };
        params.duration = durationMap[filters.dateRange];
      }

      const response = await fetchAdminAboutOffices(params);

      if (response.success && response.data) {
        const aboutOfficeData = response.data.data.map((item) => ({
          officeName: item.officeName,
          city: item.city,
          country: item.country,
          registrationDate: item.registrationDate,
          status: (item.status === "ACCEPTED"
            ? "Validated"
            : item.status === "REQUESTED"
            ? "Pending"
            : item.status === "REJECTED"
            ? "Rejected"
            : "Pending") as "Validated" | "Pending" | "Rejected",
          duration: item.duration,
          registeredCount: "N/A", // Not available in API response
        }));
        setFilteredAboutOfficeData(aboutOfficeData);

        // Update pagination information
        if (response.data.pagination) {
          setAboutOfficePagination({
            currentPage: response.data.pagination.currentPage,
            pageSize: response.data.pagination.pageSize,
            totalPages: response.data.pagination.totalPages,
            totalItems: response.data.pagination.totalItems,
            hasNextPage: response.data.pagination.hasNextPage,
            hasPreviousPage: response.data.pagination.hasPreviousPage,
          });
        }
      }
    } catch (error) {
      console.error("Error fetching filtered about offices data:", error);
    } finally {
      setAboutOfficeLoading(false);
    }
  };

  // Handle page change for About Exchange Office
  const handleAboutOfficePageChange = (page: number) => {
    fetchFilteredAboutOfficesData(
      aboutOfficeFilters,
      page,
      aboutOfficePagination.pageSize
    );
  };

  // Handle rows per page change for About Exchange Office
  const handleAboutOfficeRowsPerPageChange = (rowsPerPage: number) => {
    fetchFilteredAboutOfficesData(aboutOfficeFilters, 1, rowsPerPage);
  };

  const filterOfficeEngagementData = (
    data: OfficeEngagementActivityData[],
    filters: typeof officeEngagementFilters
  ): OfficeEngagementActivityData[] => {
    return data.filter((item) => {
      if (
        filters.city &&
        filters.city.length > 0 &&
        !filters.city.includes(item.city)
      ) {
        return false;
      }
      return true;
    });
  };

  const handleCloseAboutOfficeModal = () => {
    setShowAboutOfficeFilterModal(false);
  };

  const handleAboutOfficeFilterChange = (
    filterType: keyof typeof aboutOfficeFilters,
    value: string | string[]
  ) => {
    setAboutOfficeFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleApplyAboutOfficeFilters = () => {
    console.log("Applying About Exchange Office filters:", aboutOfficeFilters);
    fetchFilteredAboutOfficesData(
      aboutOfficeFilters,
      1,
      aboutOfficePagination.pageSize
    );
    setShowAboutOfficeFilterModal(false);
  };

  const handleClearAboutOfficeFilters = () => {
    setAboutOfficeFilters({
      status: "",
      country: "",
      city: [],
      dateRange: "",
    });
    // Reset to original data
    if (aboutOfficesData.length > 0) {
      const aboutOfficeData = aboutOfficesData.map((item) => ({
        officeName: item.officeName,
        city: item.city,
        country: item.country,
        registrationDate: item.registrationDate,
        status: (item.status === "ACCEPTED"
          ? "Validated"
          : item.status === "REQUESTED"
          ? "Pending"
          : item.status === "REJECTED"
          ? "Rejected"
          : "Pending") as "Validated" | "Pending" | "Rejected",
        duration: item.duration,
        registeredCount: "N/A", // Not available in API response
      }));
      setFilteredAboutOfficeData(aboutOfficeData);
    }
    setShowAboutOfficeFilterModal(false);
  };

  const handleCloseOfficeEngagementModal = () => {
    setShowOfficeEngagementFilterModal(false);
  };

  const handleOfficeEngagementFilterChange = (
    filterType: keyof typeof officeEngagementFilters,
    value: string | string[]
  ) => {
    setOfficeEngagementFilters((prev) => ({
      ...prev,
      [filterType]: value,
    }));
  };

  const handleApplyOfficeEngagementFilters = () => {
    console.log("Applying Office Engagement filters:", officeEngagementFilters);
    setShowOfficeEngagementFilterModal(false);
  };

  const handleClearOfficeEngagementFilters = () => {
    setOfficeEngagementFilters({
      city: [],
      dateRange: "",
    });
    setFilteredOfficeEngagementData(filteredOfficeEngagementData);
    setShowOfficeEngagementFilterModal(false);
  };

  const renderTabContent = (): JSX.Element => {
    switch (activeTab) {
      case "Overall Activity":
        return (
          <TableWrapper
            data={filteredOverallActivityData}
            setData={setFilteredOverallActivityData}
            sortableColumns={[
              { key: "officeName", label: "Office Name" },
              { key: "city", label: "City" },
              { key: "lastUpdate", label: "Last Update" },
              { key: "updates7days", label: "Updates (7 days)" },
              { key: "activityStatus", label: "Activity Status" },
            ]}
            filterOptions={[
              {
                key: "activityStatus",
                label: "Activity Status",
                options: ["Very Active", "Active", "Low Activity"],
              },
              {
                key: "city",
                label: "City",
                options: Array.isArray(availableCities)
                  ? availableCities.map((city) => city.name)
                  : [],
              },
            ]}
          >
            <OverallActivity data={filteredOverallActivityData} />
          </TableWrapper>
        );
      case "About Exchange Office":
        return (
          <TableWrapper
            data={filteredAboutOfficeData}
            setData={setFilteredAboutOfficeData}
            sortableColumns={[
              { key: "officeName", label: "Office Name" },
              { key: "city", label: "City" },
              { key: "country", label: "Country" },
              { key: "registrationDate", label: "Registration Date" },
              { key: "status", label: "Status" },
              { key: "duration", label: "Duration" },
              { key: "registeredCount", label: "Registered Count" },
            ]}
            filterOptions={[
              {
                key: "status",
                label: "Status",
                options: ["Validated", "Pending", "Rejected"],
              },
              {
                key: "country",
                label: "Country",
                options: Array.from(
                  new Set(filteredAboutOfficeData.map((data) => data.country))
                ),
              },
            ]}
            pagination={aboutOfficePagination}
            onPageChange={handleAboutOfficePageChange}
            onRowsPerPageChange={handleAboutOfficeRowsPerPageChange}
            isLoading={aboutOfficeLoading}
          >
            <AboutExchangeOffice data={filteredAboutOfficeData} />
          </TableWrapper>
        );
      case "Office Engagement":
        return (
          <TableWrapper
            data={filteredOfficeEngagementData}
            setData={setFilteredOfficeEngagementData}
            sortableColumns={[
              { key: "officeName", label: "Office Name" },
              { key: "city", label: "City" },
              { key: "profileViews", label: "Profile Views" },
              { key: "phoneCalls", label: "Phone Calls" },
              { key: "gpsClick", label: "GPS Click" },
              { key: "share", label: "Share" },
              { key: "waAlerts", label: "WA Alerts" },
            ]}
            filterOptions={[
              {
                key: "city",
                label: "City",
                options: Array.isArray(availableCities)
                  ? availableCities.map((city) => city.name)
                  : [],
              },
            ]}
          >
            <OfficeEngagement data={filteredOfficeEngagementData} />
          </TableWrapper>
        );
      default:
        return (
          <div className="">
            <h1>Select a tab</h1>
          </div>
        );
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3BEE5C]"></div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <div className="flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => {
                setError(null);
                fetchAnalyticsData();
              }}
              className="text-red-500 hover:text-red-700"
            >
              Retry
            </button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div>
        <div className="flex items-start gap-6 justify-between md:flex-row flex-col">
          <div className="max-w-[485px]">
            <h1 className="text-[#111111] text-[26px] md:text-[32px] leading-[31px] md:leading-[38px] font-bold mb-2">
              User Engagement Analysis
            </h1>
            <p className="text-[#585858] text-[14px] leading-[20px] font-normal">
              Track user interactions, behavior patterns, and retention metrics
              to better understand engagement and drive product improvements.
            </p>
          </div>
          <HistoryDropdown
            options={historyOptions}
            defaultValue={
              historyOptions.find((opt) => opt.value === selectedPeriod)
                ?.label || "Last 7 days"
            }
            onSelect={handleHistorySelect}
          />
        </div>

        <div className="py-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
          <StatsCard
            title="Profile Review"
            value={statsData ? statsData.profileViews.total.toString() : "N/A"}
            percentage={
              statsData
                ? statsData.profileViews.percentageChange.toString()
                : "0"
            }
            changeText={
              statsData
                ? formatChangeText(
                    statsData.profileViews.changeFromLastMonth,
                    selectedPeriod
                  )
                : "Loading..."
            }
            isPositive={
              statsData ? statsData.profileViews.changeFromLastMonth >= 0 : true
            }
          />
          <StatsCard
            title="Phone Calls"
            value={statsData ? statsData.phoneCalls.total.toString() : "N/A"}
            percentage={
              statsData ? statsData.phoneCalls.percentageChange.toString() : "0"
            }
            changeText={
              statsData
                ? formatChangeText(
                    statsData.phoneCalls.changeFromLastMonth,
                    selectedPeriod
                  )
                : "Loading..."
            }
            isPositive={
              statsData ? statsData.phoneCalls.changeFromLastMonth >= 0 : true
            }
          />
          <StatsCard
            title="GPS Clicked"
            value={statsData ? statsData.gpsClicks.total.toString() : "N/A"}
            percentage={
              statsData ? statsData.gpsClicks.percentageChange.toString() : "0"
            }
            changeText={
              statsData
                ? formatChangeText(
                    statsData.gpsClicks.changeFromLastMonth,
                    selectedPeriod
                  )
                : "Loading..."
            }
            isPositive={
              statsData ? statsData.gpsClicks.changeFromLastMonth >= 0 : true
            }
          />
          <StatsCard
            title="WA Alert Price"
            value={statsData ? statsData.waAlertPrice.total.toString() : "N/A"}
            percentage={
              statsData
                ? statsData.waAlertPrice.percentageChange.toString()
                : "0"
            }
            changeText="No data available"
            isPositive={true}
          />
          <StatsCard
            title="Agency"
            value="N/A"
            percentage="0"
            changeText="No data available"
            isPositive={true}
          />
        </div>

        <div className="">
          <div className="md:border-b border-[#DEDEDE] mb-6 sm:mb-8 overflow-hidden relative">
            <div
              className="flex overflow-x-auto items-center justify-between hide-scrollbar"
              style={{
                background:
                  "linear-gradient(270deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)",
              }}
            >
              <div className="flex items-center hide-scrollbar pr-[50px]">
                {tabs.map((tab: TabType) => (
                  <button
                    key={tab.id}
                    onClick={() => handleTabClick(tab.id)}
                    className={`flex-shrink-0 px-0 pb-[8px] cursor-pointer pt-[8.11px] mr-6 last:mr-0 text-[14.19px] font-medium leading-[18px] transition-colors whitespace-nowrap ${
                      activeTab === tab.id
                        ? "text-[#111111] border-b-2 border-[#20523C]"
                        : "text-[#585858] border-transparent hover:text-[#585858]"
                    }`}
                    type="button"
                    aria-selected={activeTab === tab.id}
                    role="tab"
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              {(activeTab === "About Exchange Office" ||
                activeTab === "Office Engagement") && (
                <button
                  className="absolute -right-1 md:right-0 bottom-0 p-2.5 text-nowrap md:w-[94px] h-[37px] flex items-center gap-1 cursor-pointer bg-white"
                  onClick={handleFilterButtonClick}
                >
                  <div
                    className="absolute inset-y-0 -left-6 w-[20px] pointer-events-none sm:hidden block"
                    style={{
                      background:
                        "linear-gradient(to left, rgba(0, 0, 0, 0.20) 0%, rgba(0,0,0,0) 100%)",
                      zIndex: 10,
                    }}
                  />
                  <Image
                    src="/assets/filter.svg"
                    alt="filter"
                    width={14}
                    height={14}
                    className="md:w-[14px] md:h-[14px] w-[20px] md:-mt-0.5"
                  />
                  <h3 className="text-[#20523C] text-[14px] font-medium leading-[18px] md:block hidden">
                    Filter by
                  </h3>
                </button>
              )}
            </div>
          </div>

          <div role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
            {renderTabContent()}
          </div>
        </div>
      </div>

      <AboutOfficeFilterModal
        show={showAboutOfficeFilterModal}
        onClose={handleCloseAboutOfficeModal}
        filters={aboutOfficeFilters}
        onFilterChange={handleAboutOfficeFilterChange}
        onApply={handleApplyAboutOfficeFilters}
        onClear={handleClearAboutOfficeFilters}
        availableCities={
          Array.isArray(availableCities)
            ? availableCities.map((city) => city.name)
            : []
        }
      />

      <OfficeEngagementFilterModal
        show={showOfficeEngagementFilterModal}
        onClose={handleCloseOfficeEngagementModal}
        filters={officeEngagementFilters}
        onFilterChange={handleOfficeEngagementFilterChange}
        onApply={handleApplyOfficeEngagementFilters}
        onClear={handleClearOfficeEngagementFilters}
        availableCities={
          Array.isArray(availableCities)
            ? availableCities.map((city) => city.name)
            : []
        }
      />
    </AdminLayout>
  );
};

export default Analytics;
