import React, { useState, useEffect, useMemo, cloneElement } from "react";
import Image from "next/image";

interface PaginationInfo {
  currentPage: number;
  pageSize: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface TableWrapperProps {
  children: React.ReactElement<{ data: any[] }>;
  data: any[];
  setData?: (data: any[]) => void;
  searchPlaceholder?: string;
  sortableColumns: {
    key: string;
    label: string;
  }[];
  filterOptions?: {
    key: string;
    label: string;
    options: string[];
  }[];
  // Server-side pagination props
  pagination?: PaginationInfo;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  isLoading?: boolean;
}

const TableWrapper: React.FC<TableWrapperProps> = ({
  children,
  data,
  setData,
  searchPlaceholder = "Search by office name or city...",
  sortableColumns,
  filterOptions = [],
  pagination,
  onPageChange,
  onRowsPerPageChange,
  isLoading = false,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key: string | null;
    direction: "asc" | "desc" | null;
  }>({ key: null, direction: null });
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Use server-side pagination if available, otherwise fall back to client-side
  const isServerSidePagination = !!pagination;
  
  const filteredAndSortedData = useMemo(() => {
    if (isServerSidePagination) {
      // For server-side pagination, we don't filter/sort client-side
      // The server handles this
      return data;
    }

    // Client-side filtering and sorting
    let result = [...data];

    if (searchTerm) {
      result = result.filter((item) =>
        Object.values(item).some((val) =>
          String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        result = result.filter((item) => String(item[key]) === value);
      }
    });

    if (sortConfig.key && sortConfig.direction) {
      result.sort((a, b) => {
        const aVal = a[sortConfig.key!];
        const bVal = b[sortConfig.key!];

        if (typeof aVal === "string" && typeof bVal === "string") {
          return sortConfig.direction === "asc"
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal);
        }

        if (typeof aVal === "number" && typeof bVal === "number") {
          return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
        }

        return 0;
      });
    }

    return result;
  }, [data, searchTerm, sortConfig, filters, isServerSidePagination]);

  const paginatedData = useMemo(() => {
    if (isServerSidePagination) {
      // For server-side pagination, use the data as-is
      return filteredAndSortedData;
    }

    // Client-side pagination
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredAndSortedData.slice(startIndex, endIndex);
  }, [filteredAndSortedData, currentPage, rowsPerPage, isServerSidePagination]);

  // Calculate pagination info
  const paginationInfo = useMemo(() => {
    if (isServerSidePagination && pagination) {
      return pagination;
    }

    // Client-side pagination calculation
    const totalPages = Math.ceil(filteredAndSortedData.length / rowsPerPage);
    return {
      currentPage,
      pageSize: rowsPerPage,
      totalPages,
      totalItems: filteredAndSortedData.length,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    };
  }, [isServerSidePagination, pagination, currentPage, rowsPerPage, filteredAndSortedData.length]);

  useEffect(() => {
    if (isServerSidePagination && pagination) {
      setCurrentPage(pagination.currentPage);
      setRowsPerPage(pagination.pageSize);
    } else {
      setCurrentPage(1);
    }
  }, [isServerSidePagination, pagination]);

  useEffect(() => {
    if (!isServerSidePagination && currentPage > paginationInfo.totalPages) {
      setCurrentPage(Math.max(1, paginationInfo.totalPages));
    }
  }, [currentPage, paginationInfo.totalPages, isServerSidePagination]);

  const handleSort = (key: string) => {
    if (isServerSidePagination) {
      // For server-side pagination, sorting should be handled by the server
      // This would require additional API calls
      return;
    }

    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const handlePageChange = (newPage: number) => {
    if (isServerSidePagination && onPageChange) {
      onPageChange(newPage);
    } else {
      setCurrentPage(newPage);
    }
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    if (isServerSidePagination && onRowsPerPageChange) {
      onRowsPerPageChange(newRowsPerPage);
    } else {
      setRowsPerPage(newRowsPerPage);
    }
  };

  const tableContent = useMemo(() => {
    if (!children) return null;
    if (React.isValidElement(children)) {
      return React.cloneElement(children, {
        ...children.props,
        data: paginatedData,
      });
    }
    return null;
  }, [children, paginatedData]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        {/* Search */}
        <div className="relative w-full md:w-[300px]">
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-[#DEDEDE] rounded-lg  smaller pl-10 focus:outline-none focus:border-[#20523C]"
          />
          <Image
            src="/assets/search-normal.svg"
            alt="search"
            width={20}
            height={20}
            className="absolute left-3 top-1/2 transform -translate-y-1/2"
          />
        </div>
      </div>

      <div className="relative overflow-x-auto rounded-lg border border-[#DEDEDE]">
        <div className="group/table">
          <div className="absolute inset-0 pointer-events-none transition-colors duration-150 ease-in-out group-hover/table:bg-black/[0.01]"></div>
          {tableContent}
        </div>
      </div>

      {/* Pagination */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mt-4 px-4">
        <div className="flex items-center gap-4">
          <div className="text-[14px] text-[#585858]">
            Show
            <select
              value={paginationInfo.pageSize}
              onChange={(e) => handleRowsPerPageChange(Number(e.target.value))}
              className="mx-2 border border-[#DEDEDE] rounded px-2 py-1 focus:outline-none focus:border-[#20523C]"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            entries
          </div>
          <div className="text-[14px] text-[#585858]">
            Showing{" "}
            {Math.min(
              (paginationInfo.currentPage - 1) * paginationInfo.pageSize + 1,
              paginationInfo.totalItems
            )}{" "}
            to{" "}
            {Math.min(paginationInfo.currentPage * paginationInfo.pageSize, paginationInfo.totalItems)}{" "}
            of {paginationInfo.totalItems} entries
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handlePageChange(paginationInfo.currentPage - 1)}
            disabled={!paginationInfo.hasPreviousPage || isLoading}
            className={`px-3 py-1 rounded cursor-pointer border ${
              !paginationInfo.hasPreviousPage || isLoading
                ? "border-[#DEDEDE] text-[#DEDEDE] cursor-not-allowed"
                : "border-[#20523C] text-[#20523C] hover:bg-[#20523C] hover:text-white"
            }`}
          >
            Previous
          </button>
          
          {/* Page numbers - show limited pages for server-side pagination */}
          {isServerSidePagination ? (
            // For server-side pagination, show current page and next page if available
            <>
              <button
                onClick={() => handlePageChange(paginationInfo.currentPage)}
                className="w-8 h-8 rounded bg-[#20523C] text-white"
              >
                {paginationInfo.currentPage}
              </button>
              {paginationInfo.hasNextPage && (
                <button
                  onClick={() => handlePageChange(paginationInfo.currentPage + 1)}
                  disabled={isLoading}
                  className="w-8 h-8 rounded border border-[#DEDEDE] text-[#585858] hover:border-[#20523C] disabled:opacity-50"
                >
                  {paginationInfo.currentPage + 1}
                </button>
              )}
            </>
          ) : (
            // For client-side pagination, show all pages
            Array.from({ length: paginationInfo.totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`w-8 h-8 rounded cursor-pointer ${
                  paginationInfo.currentPage === page
                    ? "bg-[#20523C] text-white"
                    : "border border-[#DEDEDE] text-[#585858] hover:border-[#20523C]"
                }`}
              >
                {page}
              </button>
            ))
          )}
          
          <button
            onClick={() => handlePageChange(paginationInfo.currentPage + 1)}
            disabled={!paginationInfo.hasNextPage || isLoading}
            className={`px-3 py-1 rounded cursor-pointer border ${
              !paginationInfo.hasNextPage || isLoading
                ? "border-[#DEDEDE] text-[#DEDEDE] cursor-not-allowed"
                : "border-[#20523C] text-[#20523C] hover:bg-[#20523C] hover:text-white"
            }`}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default TableWrapper;
