"use client";
import React, { useState, useEffect } from "react";
import AdminLayout from "@/components/AdminComponents/AdminLayout";
import HistoryDropdown from "@/components/ExchangeLeadboard/HistoryDropdown";
import Image from "next/image";
import {
  fetchAdminDashboardStats,
  fetchAdminDashboardTable,
  DashboardStats,
  DashboardTableItem,
  DashboardTableResponse,
  DashboardPeriod,
} from "@/services/api";

interface StatsCardProps {
  title: string;
  value: string | number;
  percentage: string | number;
  changeText: string;
  isPositive?: boolean;
  loading?: boolean;
  hasData?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  percentage,
  changeText,
  isPositive = true,
  loading = false,
  hasData = true,
}) => {
  return (
    <div
      className="rounded-lg transition-all group duration-300 ease-out hover:scale-105 hover:-translate-y-2 cursor-pointer"
      style={{
        boxShadow: "0px 4px 14px rgba(0, 0, 0, 0.10), 0px 4px 4px rgba(0, 0, 0, 0.08)",
        transition: 'all 0.3s ease'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0px 8px 10px rgba(0, 0, 0, 0.15), 0px 4px 8px rgba(0, 0, 0, 0.12)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = "0px 4px 14px rgba(0, 0, 0, 0.10), 0px 4px 4px rgba(0, 0, 0, 0.08)";
      }}
    >
      <div className='p-4'>
        <div className="flex items-center gap-1">
          <h2 className="text-[#585858] text-[14px] leading-[20px] font-normal">
            {title}
          </h2>
          <Image src="/assets/info.svg" alt="info" width={14} height={14} />
        </div>
        <div className="mt-4 flex items-center gap-1.5">
          {loading ? (
            <div className="h-[50px] w-[120px] bg-gray-200 animate-pulse rounded"></div>
          ) : !hasData ? (
            <div className="h-[50px] flex items-center">
              <span className="text-[24px] text-gray-400">No data</span>
            </div>
          ) : (
            <>
              <h2 className="text-[#111111] text-[42px] leading-[50px] font-semibold">
                {value}
              </h2>
              <div
                className={`mt-2.5 ${
                  isPositive ? "bg-[#C2ECD2]" : "bg-[#FECACA]"
                } rounded-[1000px] px-1.5 py-0.5 flex justify-center gap-0.5`}
              >
                <Image
                  src={
                    isPositive ? "/assets/arrow-up.svg" : "/assets/arrow-down.svg"
                  }
                  alt={isPositive ? "arrow-up" : "arrow-down"}
                  width={14.19}
                  height={14.19}
                />
                <h3
                  className={`${
                    isPositive ? "text-[#20523C]" : "text-[#991B1B]"
                  } text-[12px] leading-[17px] font-normal mt-[1px]`}
                >
                  {percentage}%
                </h3>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="bg-[#F5F7F9] py-3 px-4 rounded-b-lg group-hover:bg-[#EDF2F7] transition-colors duration-300">
        {loading ? (
          <div className="h-[20px] w-[150px] bg-gray-200 animate-pulse rounded"></div>
        ) : !hasData ? (
          <h2 className="text-gray-400 text-[14px] font-normal leading-[20px]">
            No data available
          </h2>
        ) : (
          <h2 className="text-[#585858] text-[14px] font-normal leading-[20px]">
            {changeText}
          </h2>
        )}
      </div>
    </div>
  );
};

type SortKey = "office.officeName" | "alertsCount" | "viewsCount" | "updateRate";

const Dashboard: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPeriod, setSelectedPeriod] = useState<DashboardPeriod>("7days");
  
  // API state
  const [statsData, setStatsData] = useState<DashboardStats | null>(null);
  const [tableData, setTableData] = useState<DashboardTableItem[]>([]);
  const [statsLoading, setStatsLoading] = useState(true);
  const [tableLoading, setTableLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalItems, setTotalItems] = useState(0);

  const [sortConfig, setSortConfig] = useState<{
    key: SortKey | null;
    direction: "asc" | "desc" | null;
  }>({ key: null, direction: null });

  const historyOptions = [
    { value: "7days", label: "Last 7 days" },
    { value: "30days", label: "Last 30 days" },
    { value: "90days", label: "Last 90 days" },
  ];

  // Fetch dashboard stats
  const fetchStats = async (period: DashboardPeriod = selectedPeriod) => {
    try {
      setStatsLoading(true);
      setError(null);
      
      const response = await fetchAdminDashboardStats(period);
      
      if (response.success && response.data) {
        setStatsData(response.data);
      } else {
        setStatsData(null);
        throw new Error(response.message || "Failed to fetch dashboard stats");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch dashboard stats";
      setError(errorMessage);
      setStatsData(null);
      console.error("Error fetching dashboard stats:", err);
    } finally {
      setStatsLoading(false);
    }
  };

  // Fetch dashboard table data
  const fetchTableData = async (
    page: number = currentPage,
    limit: number = rowsPerPage,
    search: string = searchTerm,
    period: DashboardPeriod = selectedPeriod
  ) => {
    try {
      setTableLoading(true);
      setError(null);
      
      const response = await fetchAdminDashboardTable({
        page,
        limit,
        search: search || undefined,
        period,
      });
      
      if (response.success && response.data) {
        setTableData(response.data.data);
        setTotalPages(response.data.pagination.totalPages);
        setHasNextPage(response.data.pagination.hasNextPage);
        setTotalItems(response.data.pagination.totalItems);
      } else {
        setTableData([]);
        setTotalPages(1);
        setHasNextPage(false);
        setTotalItems(0);
        throw new Error(response.message || "Failed to fetch dashboard table data");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to fetch dashboard table data";
      setError(errorMessage);
      setTableData([]);
      setTotalPages(1);
      setHasNextPage(false);
      setTotalItems(0);
      console.error("Error fetching dashboard table data:", err);
    } finally {
      setTableLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchStats();
    fetchTableData(1, rowsPerPage, "", selectedPeriod);
  }, [selectedPeriod]);

  // Handle period change
  const handlePeriodChange = (option: { value: string; label: string }) => {
    const newPeriod = option.value as DashboardPeriod;
    setSelectedPeriod(newPeriod);
    setCurrentPage(1);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchTableData(page, rowsPerPage, searchTerm, selectedPeriod);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    fetchTableData(1, newRowsPerPage, searchTerm, selectedPeriod);
  };

  // Handle search with debouncing
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setCurrentPage(1);
      fetchTableData(1, rowsPerPage, searchTerm, selectedPeriod);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Local sorting (since API might not support all sorting options)
  const sortedData = [...tableData].sort((a, b) => {
    if (!sortConfig.key || !sortConfig.direction) return 0;

    let aValue: any;
    let bValue: any;

    switch (sortConfig.key) {
      case "office.officeName":
        aValue = a.office.officeName;
        bValue = b.office.officeName;
        break;
      case "alertsCount":
        aValue = a.alertsCount;
        bValue = b.alertsCount;
        break;
      case "viewsCount":
        aValue = a.viewsCount;
        bValue = b.viewsCount;
        break;
      case "updateRate":
        // Handle update rate sorting
        const aNum = parseFloat(a.updateRate.replace(/[^0-9.]/g, ""));
        const bNum = parseFloat(b.updateRate.replace(/[^0-9.]/g, ""));
        return sortConfig.direction === "asc" ? aNum - bNum : bNum - aNum;
    }

    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortConfig.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    if (typeof aValue === "number" && typeof bValue === "number") {
      return sortConfig.direction === "asc" ? aValue - bValue : bValue - aValue;
    }

    return 0;
  });

  const handleSort = (key: SortKey) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  // Helper function to format change text
  const formatChangeText = (changeFromLastPeriod: number, period: DashboardPeriod) => {
    const sign = changeFromLastPeriod >= 0 ? "+" : "";
    const periodText = period === "7days" ? "week" : period === "30days" ? "month" : "quarter";
    return `${sign}${changeFromLastPeriod} from last ${periodText}`;
  };

  // Clear error after some time
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  return (
    <AdminLayout>
      <div>
        <div className="flex items-start gap-6 justify-between md:flex-row flex-col">
          <div className="max-w-[485px]">
            <h1 className="text-[#111111] text-[26px] md:text-[32px] leading-[31px] md:leading-[38px] font-bold mb-2">
              Dashboard
            </h1>
            <p className="text-[#585858] text-[14px] leading-[20px] font-normal">
              Central hub for managing exchange office data, submissions, and
              updates across cities and countries.
            </p>
          </div>
          <HistoryDropdown
            options={historyOptions}
            defaultValue={
              historyOptions.find((opt) => opt.value === selectedPeriod)
                ?.label || "Last 7 days"
            }
            onSelect={handlePeriodChange}
          />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            <div className="flex items-center justify-between">
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="text-red-500 hover:text-red-700"
              >
                ×
              </button>
            </div>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatsCard
            title="Total Office"
            value={statsData?.totalOffices.total ?? ""}
            percentage={statsData?.totalOffices.percentageChange ?? ""}
            changeText={
              statsData
                ? formatChangeText(
                    statsData.totalOffices.changeFromLastPeriod,
                    selectedPeriod
                  )
                : ""
            }
            isPositive={
              statsData
                ? statsData.totalOffices.changeFromLastPeriod >= 0
                : true
            }
            loading={statsLoading}
            hasData={!!statsData}
          />
          <StatsCard
            title="Update This week"
            value={statsData?.updatesThisWeek.total ?? ""}
            percentage={statsData?.updatesThisWeek.percentageChange ?? ""}
            changeText={
              statsData
                ? formatChangeText(
                    statsData.updatesThisWeek.changeFromLastPeriod,
                    selectedPeriod
                  )
                : ""
            }
            isPositive={
              statsData
                ? statsData.updatesThisWeek.changeFromLastPeriod >= 0
                : true
            }
            loading={statsLoading}
            hasData={!!statsData}
          />
          <StatsCard
            title="Alerts"
            value={statsData?.alerts.total ?? ""}
            percentage={statsData?.alerts.percentageChange ?? ""}
            changeText={
              statsData
                ? formatChangeText(
                    statsData.alerts.changeFromLastPeriod,
                    selectedPeriod
                  )
                : ""
            }
            isPositive={
              statsData ? statsData.alerts.changeFromLastPeriod >= 0 : true
            }
            loading={statsLoading}
            hasData={!!statsData}
          />
        </div>

        <div className="mt-6 md:mt-8">
          <h2 className="text-[#111111] text-[20px] leading-[24px] font-bold mb-4">
            Updates Today
          </h2>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div className="relative w-full md:w-[300px]">
              <input
                type="text"
                placeholder="Search exchange office..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-[#DEDEDE] smaller rounded-lg pl-10 focus:outline-none focus:border-[#3BEE5C]"
                disabled={tableLoading}
              />
              <Image
                src="/assets/search-normal.svg"
                alt="search"
                width={20}
                height={20}
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-[#585858]">Rows per page:</span>
              <select
                value={rowsPerPage}
                onChange={(e) =>
                  handleRowsPerPageChange(Number(e.target.value))
                }
                className="border border-[#DEDEDE] rounded-lg px-2 py-1 focus:outline-none focus:border-[#3BEE5C]"
                disabled={tableLoading}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Loading State */}
          {tableLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3BEE5C]"></div>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block bg-white rounded-lg text-nowrap border border-[#DEDEDE]">
                <div className="grid grid-cols-4 gap-4 bg-[#F3F4F8] px-[16.22px] py-3.5 border-b border-[#DEDEDE]">
                  <button
                    onClick={() => handleSort("office.officeName")}
                    className="flex items-center gap-1 text-[#111111] text-[14px] font-bold leading-[17px] cursor-pointer"
                  >
                    <span>Exchange Office</span>
                    <Image
                      src="/assets/sort-table.svg"
                      alt="sort"
                      width={14.39}
                      height={14.39}
                      className={`transform ${
                        sortConfig.key === "office.officeName"
                          ? sortConfig.direction === "asc"
                            ? "rotate-180"
                            : "rotate-0"
                          : ""
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => handleSort("alertsCount")}
                    className="flex items-center gap-1 text-[#111111] text-[14px] font-bold leading-[17px] cursor-pointer"
                  >
                    <span>Alerts ({selectedPeriod.replace("days", " days")})</span>
                    <Image
                      src="/assets/sort-table.svg"
                      alt="sort"
                      width={14.39}
                      height={14.39}
                      className={`transform ${
                        sortConfig.key === "alertsCount"
                          ? sortConfig.direction === "asc"
                            ? "rotate-180"
                            : "rotate-0"
                          : ""
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => handleSort("viewsCount")}
                    className="flex items-center gap-1 text-[#111111] text-[14px] font-bold leading-[17px] cursor-pointer"
                  >
                    <span>Views ({selectedPeriod.replace("days", " days")})</span>
                    <Image
                      src="/assets/sort-table.svg"
                      alt="sort"
                      width={14.39}
                      height={14.39}
                      className={`transform ${
                        sortConfig.key === "viewsCount"
                          ? sortConfig.direction === "asc"
                            ? "rotate-180"
                            : "rotate-0"
                          : ""
                      }`}
                    />
                  </button>
                  <button
                    onClick={() => handleSort("updateRate")}
                    className="flex items-center gap-1 text-[#111111] text-[14px] font-bold leading-[17px] cursor-pointer"
                  >
                    <span>Update Rate</span>
                    <Image
                      src="/assets/sort-table.svg"
                      alt="sort"
                      width={14.39}
                      height={14.39}
                      className={`transform ${
                        sortConfig.key === "updateRate"
                          ? sortConfig.direction === "asc"
                            ? "rotate-180"
                            : "rotate-0"
                          : ""
                      }`}
                    />
                  </button>
                </div>

                <div>
                  {sortedData.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No data available
                    </div>
                  ) : (
                    sortedData.map((item) => (
                      <div
                        key={item.office.id}
                        className="grid grid-cols-4 gap-4 px-[16.22px] py-3.5 border-b border-[#DEDEDE] last:border-b-0 hover:bg-gray-50 cursor-pointer transition duration-150"
                      >
                        <div className="text-[#585858] text-[16.22px] leading-[19px] font-normal truncate">
                          {item.office.officeName}
                        </div>
                        <div className="text-[#585858] text-[16.22px] leading-[19px] font-normal">
                          {item.alertsCount}
                        </div>
                        <div className="text-[#585858] text-[16.22px] leading-[19px] font-normal">
                          {item.viewsCount}
                        </div>
                        <div className="text-[#585858] text-[16.22px] leading-[19px] font-normal">
                          {item.updateRate}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Pagination Controls */}
                {sortedData.length > 0 && (
                  <div className="flex justify-between items-center mt-4 px-4 pb-4">
                    <div className="text-[14px] text-[#585858]">
                      Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
                      {Math.min(currentPage * rowsPerPage, totalItems)} of{" "}
                      {totalItems} entries
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1 || tableLoading}
                        className={`px-3 py-1 rounded cursor-pointer border ${
                          currentPage === 1 || tableLoading
                            ? "border-[#DEDEDE] text-[#DEDEDE] cursor-not-allowed"
                            : "border-[#3BEE5C] text-[#3BEE5C] hover:bg-[#3BEE5C] hover:text-white"
                        }`}
                      >
                        Previous
                      </button>
                      
                      {/* Show current page */}
                      <div className="flex items-center gap-1">
                        <button className="w-8 h-8 rounded bg-[#3BEE5C] text-white">
                          {currentPage}
                        </button>
                        {hasNextPage && (
                          <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={tableLoading}
                            className="w-8 h-8 rounded border border-[#DEDEDE] text-[#585858] hover:border-[#3BEE5C] disabled:opacity-50"
                          >
                            {currentPage + 1}
                          </button>
                        )}
                      </div>

                      <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={!hasNextPage || tableLoading}
                        className={`px-3 py-1 rounded cursor-pointer border ${
                          !hasNextPage || tableLoading
                            ? "border-[#DEDEDE] text-[#DEDEDE] cursor-not-allowed"
                            : "border-[#3BEE5C] text-[#3BEE5C] hover:bg-[#3BEE5C] hover:text-white"
                        }`}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Card View */}
              <div className="md:hidden grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {sortedData.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No data available
                  </div>
                ) : (
                  sortedData.map((item) => (
                    <div
                      key={item.office.id}
                      className="p-4 w-full rounded-lg border border-[#DEDEDE]"
                    >
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-[114px] flex items-center gap-1 justify-between">
                            <h3 className="text-[14px] font-medium leading-[17px] text-[#111111]">
                              Exchange Office
                            </h3>
                            <h3 className="text-[14px] font-medium leading-[17px] text-[#111111]">
                              :
                            </h3>
                          </div>
                          <h2 className="text-[14px] font-normal leading-[17px] text-[#585858]">
                            {item.office.officeName}
                          </h2>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-[114px] flex items-center gap-1 justify-between">
                            <h3 className="text-[14px] font-medium leading-[17px] text-[#111111]">
                              Alerts ({selectedPeriod.replace("days", " days")})
                            </h3>
                            <h3 className="text-[14px] font-medium leading-[17px] text-[#111111]">
                              :
                            </h3>
                          </div>
                          <h2 className="text-[14px] font-normal leading-[17px] text-[#585858]">
                            {item.alertsCount}
                          </h2>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-[114px] flex items-center gap-1 justify-between">
                            <h3 className="text-[14px] font-medium leading-[17px] text-[#111111]">
                              Views ({selectedPeriod.replace("days", " days")})
                            </h3>
                            <h3 className="text-[14px] font-medium leading-[17px] text-[#111111]">
                              :
                            </h3>
                          </div>
                          <h2 className="text-[14px] font-normal leading-[17px] text-[#585858]">
                            {item.viewsCount}
                          </h2>
                        </div>
                        <div className="flex items-center gap-2.5">
                          <div className="w-[114px] flex items-center gap-1 justify-between">
                            <h3 className="text-[14px] font-medium leading-[17px] text-[#111111]">
                              Update Rate
                            </h3>
                            <h3 className="text-[14px] font-medium leading-[17px] text-[#111111]">
                              :
                            </h3>
                          </div>
                          <h2 className="text-[14px] font-normal leading-[17px] text-[#585858]">
                            {item.updateRate}
                          </h2>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
