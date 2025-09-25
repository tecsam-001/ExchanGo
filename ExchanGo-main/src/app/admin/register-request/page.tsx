"use client";
import AdminLayout from "@/components/AdminComponents/AdminLayout";
import ThreeDots from "@/components/SvgIcons/ThreeDots";
import React, { useState, useEffect, useRef } from "react";
import RejectThisRequest from "@/components/AdminComponents/RegisterRequest/RejectThisRequest";
import RejectSuccessModal from "@/components/AdminComponents/RegisterRequest/RejectSuccessModal";
import ApproveModal from "@/components/AdminComponents/RegisterRequest/ApproveModal";
import ApproveSuccessModal from "@/components/AdminComponents/RegisterRequest/ApproveSuccessModal";
import Image from "next/image";
import {
  getRegistrationRequests,
  acceptRegistrationRequest,
  rejectRegistrationRequest,
  holdRegistrationRequest,
  RegistrationRequest,
  RegistrationRequestsResponse,
} from "@/services/api";
import { toast } from "react-toastify";

// Helper function to format status for display
const formatStatus = (status: string) => {
  switch (status) {
    case "REQUESTED":
      return "Requested";
    case "ON_HOLD":
      return "On Hold";
    case "ACCEPTED":
      return "Approved";
    case "REJECTED":
      return "Reject";
    default:
      return status;
  }
};

// Helper function to format date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const RegisterRequest: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState<{
    key:
      | keyof RegistrationRequest
      | "office.officeName"
      | "office.address"
      | null;
    direction: "asc" | "desc" | null;
  }>({ key: null, direction: null });

  // API state
  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalPages, setTotalPages] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(false);

  // Modal states
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showMobileModal, setShowMobileModal] = useState<string | null>(null);
  const [rejectingRequestId, setRejectingRequestId] = useState<string | null>(
    null
  );
  const [successRequestId, setSuccessRequestId] = useState<string | null>(null);
  const [rejectLoading, setRejectLoading] = useState(false);
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<RegistrationRequest | null>(null);
  const [showRejectFromApprove, setShowRejectFromApprove] = useState(false);
  const [approveSuccessModalOpen, setApproveSuccessModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch requests from API
  const fetchRequests = async (
    page: number = currentPage,
    limit: number = rowsPerPage
  ) => {
    try {
      setLoading(true);
      setError(null);

      const response = await getRegistrationRequests({ page, limit });

      if (response.success && response.data) {
        setRequests(response.data.data);
        setHasNextPage(response.data.hasNextPage);

        // Calculate total pages if not provided
        if (response.data.total) {
          setTotalPages(Math.ceil(response.data.total / limit));
        } else {
          // Estimate total pages based on hasNextPage
          setTotalPages(response.data.hasNextPage ? page + 1 : page);
        }
      } else {
        throw new Error(response.message || "Failed to fetch requests");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to fetch registration requests";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error fetching requests:", err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchRequests(1, rowsPerPage);
  }, []);

  // Filter and sort data locally (since API handles pagination)
  const filteredData = requests.filter(
    (request) =>
      request.office.officeName
        .toLowerCase()
        .includes(searchTerm.toLowerCase()) ||
      request.office.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.office.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortConfig.key || !sortConfig.direction) return 0;

    let aValue: any;
    let bValue: any;

    if (sortConfig.key === "office.officeName") {
      aValue = a.office.officeName;
      bValue = b.office.officeName;
    } else if (sortConfig.key === "office.address") {
      aValue = a.office.address;
      bValue = b.office.address;
    } else if (sortConfig.key === "status") {
      // Custom status ordering
      const statusOrder: Record<RegistrationRequest["status"], number> = {
        ACCEPTED: 1,
        ON_HOLD: 2,
        REQUESTED: 3,
        REJECTED: 4,
      };
      aValue = statusOrder[a.status];
      bValue = statusOrder[b.status];
    } else {
      aValue = a[sortConfig.key as keyof RegistrationRequest];
      bValue = b[sortConfig.key as keyof RegistrationRequest];
    }

    if (sortConfig.direction === "asc") {
      return String(aValue).localeCompare(String(bValue));
    } else {
      return String(bValue).localeCompare(String(aValue));
    }
  });

  const handleSort = (
    key: keyof RegistrationRequest | "office.officeName" | "office.address"
  ) => {
    setSortConfig((prevConfig) => ({
      key,
      direction:
        prevConfig.key === key && prevConfig.direction === "asc"
          ? "desc"
          : "asc",
    }));
  };

  const closeAllModals = () => {
    setOpenDropdown(null);
    setShowMobileModal(null);
    setRejectingRequestId(null);
    setSuccessRequestId(null);
    setApproveModalOpen(false);
    setSelectedRequest(null);
    setShowRejectFromApprove(false);
    setApproveSuccessModalOpen(false);
    setActionLoading(null);
  };

  const handleApprove = async (id: string): Promise<void> => {
    try {
      setActionLoading(id);
      const response = await acceptRegistrationRequest(id);

      if (response.success) {
        // Update local state
        setRequests((prev) =>
          prev.map((request) =>
            request.id === id
              ? { ...request, status: "ACCEPTED" as const }
              : request
          )
        );
        closeAllModals();
        toast.success("Request approved successfully!");
      } else {
        throw new Error(response.message || "Failed to approve request");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to approve request";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error approving request:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleHold = async (id: string): Promise<void> => {
    try {
      setActionLoading(id);
      const response = await holdRegistrationRequest(id);

      if (response.success) {
        // Update local state
        setRequests((prev) =>
          prev.map((request) =>
            request.id === id
              ? { ...request, status: "ON_HOLD" as const }
              : request
          )
        );
        closeAllModals();
        toast.success("Request put on hold successfully!");
      } else {
        throw new Error(response.message || "Failed to put request on hold");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to put request on hold";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error putting request on hold:", err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleRejectSubmit = async (
    requestId: string,
    reason: string,
    message: string
  ) => {
    try {
      setRejectLoading(true);

      const response = await rejectRegistrationRequest(requestId, {
        rejectReason: reason,
        additionalMessage: message || undefined,
      });

      if (response.success) {
        // Update local state
        setRequests((prev) =>
          prev.map((request) =>
            request.id === requestId
              ? {
                  ...request,
                  status: "REJECTED" as const,
                  rejectReason: reason,
                  additionalMessage: message,
                }
              : request
          )
        );

        setRejectingRequestId(null);
        setShowRejectFromApprove(false);
        setSuccessRequestId(requestId);
        toast.success("Request rejected successfully!");
      } else {
        throw new Error(response.message || "Failed to reject request");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to reject request";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Error rejecting request:", err);
    } finally {
      setRejectLoading(false);
    }
  };

  const toggleDropdown = (id: string): void => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  const openMobileModal = (id: string): void => {
    if (successRequestId !== null) return;
    closeAllModals();
    setShowMobileModal(id);
  };

  const closeMobileModal = (): void => {
    setShowMobileModal(null);
  };

  const openRejectModal = (id: string) => {
    if (successRequestId !== null) return;
    closeAllModals();
    setRejectingRequestId(id);
  };

  const closeRejectModal = () => {
    setRejectingRequestId(null);
  };

  const handleCloseSuccessModal = () => {
    setSuccessRequestId(null);
    closeAllModals();
  };

  const handleCloseApproveSuccessModal = () => {
    setApproveSuccessModalOpen(false);
  };

  const handleOpenApproveModal = (request: RegistrationRequest) => {
    closeAllModals();
    setSelectedRequest(request);
    setApproveModalOpen(true);
  };

  const handleApproveFromModal = () => {
    if (selectedRequest) {
      handleApprove(selectedRequest.id);
      setApproveSuccessModalOpen(true);
    }
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchRequests(page, rowsPerPage);
  };

  const handleRowsPerPageChange = (newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setCurrentPage(1);
    fetchRequests(1, newRowsPerPage);
  };

  // Effects for modal handling
  useEffect(() => {
    if (successRequestId !== null) {
      setShowMobileModal(null);
    }
  }, [successRequestId]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMobileModal !== null) {
        const target = event.target as HTMLElement;
        if (target.classList.contains("modal-backdrop")) {
          closeMobileModal();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showMobileModal]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown !== null) {
        const dropdown = dropdownRef.current;
        const target = event.target as Node;
        if (dropdown && !dropdown.contains(target)) {
          setOpenDropdown(null);
        }
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [openDropdown]);

  return (
    <AdminLayout>
      <div>
        <h1 className="text-[#111111] text-[26px] md:text-[32px] leading-[31px] md:leading-[38px] font-bold mb-2">
          Exchange Registration Request
        </h1>
        <p className="text-[#585858] text-[14px] leading-[20px] font-normal">
          Review and validate new exchange office registrations submitted to the
          platform.
        </p>

        <div className="mt-6 lg:mt-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-4">
            <div className="relative w-full lg:w-[300px]">
              <input
                type="text"
                placeholder="Search by name, address, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-[#DEDEDE] smaller rounded-lg pl-10 focus:outline-none focus:border-[#3BEE5C]"
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
                disabled={loading}
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3BEE5C]"></div>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block">
                <div className="bg-white text-nowrap">
                  <div className="grid grid-cols-13 gap-3 lg:gap-0 py-3 pr-4">
                    <button
                      onClick={() => handleSort("office.officeName")}
                      className="col-span-3 pl-6 flex items-center gap-1 text-[14px] leading-[20px] font-medium text-[#111111] cursor-pointer"
                    >
                      <span>Name</span>
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
                    <div className="col-span-5">
                      <span className="text-[14px] leading-[20px] font-medium text-[#111111]">
                        Address
                      </span>
                    </div>
                    <button
                      onClick={() => handleSort("status")}
                      className="col-span-2 flex items-center gap-1 text-[14px] leading-[20px] font-medium text-[#111111] cursor-pointer"
                    >
                      <span>Status</span>
                      <Image
                        src="/assets/sort-table.svg"
                        alt="sort"
                        width={14.39}
                        height={14.39}
                        className={`transform ${
                          sortConfig.key === "status"
                            ? sortConfig.direction === "asc"
                              ? "rotate-180"
                              : "rotate-0"
                            : ""
                        }`}
                      />
                    </button>
                    <div className="col-span-3"></div>
                  </div>
                  <div className="space-y-2">
                    {sortedData.map((request) => (
                      <div
                        key={request.id}
                        className={`grid grid-cols-13 gap-3 lg:gap-0 items-center py-3 pr-3 border border-[#DEDEDE] rounded-[12px] ${
                          actionLoading === request.id ? "opacity-50" : ""
                        }`}
                      >
                        <div className="col-span-3 truncate pl-6">
                          <span className="text-[14px] leading-[20px] font-normal text-[#111111] truncate">
                            {request.office.officeName}
                          </span>
                        </div>
                        <div className="col-span-5 flex items-start justify-start">
                          <span className="text-[14px] font-normal leading-[20px] text-[#111111] truncate">
                            {request.office.address}
                          </span>
                        </div>
                        <div className="col-span-2">
                          <span className="text-[14px] leading-[20px] font-normal text-[#111111]">
                            {formatStatus(request.status)}
                          </span>
                        </div>
                        <div className="col-span-3 flex items-center justify-end gap-4">
                          {request.status !== "ACCEPTED" && (
                            <button
                              onClick={() => handleOpenApproveModal(request)}
                              disabled={actionLoading === request.id}
                              className="w-[98px] h-[38px] cursor-pointer rounded-md relative text-[#20523C] text-[16px] font-semibold leading-[22px] disabled:opacity-50 disabled:cursor-not-allowed"
                              style={{
                                background:
                                  "radial-gradient(65.83% 94.77% at 50.34% 116.3%, #C3F63C 0%, #54D10E 100%)",
                                border: "1px solid rgba(255, 255, 255, 0.4)",
                                boxShadow:
                                  "0px 4px 4px 0px #FFFFFF52 inset, 0px -4px 4px 0px #FFFFFF52 inset",
                              }}
                            >
                              {actionLoading === request.id ? "..." : "Approve"}
                            </button>
                          )}
                          <div
                            className="flex justify-end relative"
                            ref={dropdownRef}
                          >
                            <button
                              onClick={() => toggleDropdown(request.id)}
                              disabled={actionLoading === request.id}
                              className="text-[#585858] hover:text-[#111111] transition-colors cursor-pointer disabled:opacity-50"
                            >
                              <ThreeDots />
                            </button>
                            {openDropdown === request.id && (
                              <div
                                className="absolute right-0 flex flex-col top-8 mt-1 h-fit w-48 bg-white border border-[#DEDEDE] rounded-md shadow-lg z-10"
                                role="menu"
                                aria-orientation="vertical"
                                aria-labelledby="options-menu"
                                ref={dropdownRef}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="py-1 flex-col flex">
                                  {request.status !== "ON_HOLD" && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleHold(request.id);
                                      }}
                                      className="w-full cursor-pointer text-left px-4 py-2.5 text-[14px] text-[#111111] hover:bg-[#F1F1F1] transition-colors"
                                      role="menuitem"
                                    >
                                      Hold for a moment
                                    </button>
                                  )}
                                  {request.status !== "REJECTED" && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openRejectModal(request.id);
                                      }}
                                      className="w-full cursor-pointer text-left px-4 py-2.5 text-[14px] text-[#111111] hover:bg-[#F1F1F1] transition-colors"
                                      role="menuitem"
                                    >
                                      Reject request
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {sortedData.length > 0 && (
                    <div className="flex justify-between items-center mt-4 px-4">
                      <div className="text-[14px] text-[#585858]">
                        Showing {(currentPage - 1) * rowsPerPage + 1} to{" "}
                        {Math.min(
                          currentPage * rowsPerPage,
                          (currentPage - 1) * rowsPerPage + sortedData.length
                        )}{" "}
                        of {requests.length} entries
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1 || loading}
                          className={`px-3 py-1 rounded cursor-pointer border ${
                            currentPage === 1 || loading
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
                              disabled={loading}
                              className="w-8 h-8 rounded border border-[#DEDEDE] text-[#585858] hover:border-[#3BEE5C] disabled:opacity-50"
                            >
                              {currentPage + 1}
                            </button>
                          )}
                        </div>

                        <button
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={!hasNextPage || loading}
                          className={`px-3 py-1 rounded border cursor-pointer ${
                            !hasNextPage || loading
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
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden space-y-4">
                {sortedData.map((request) => (
                  <div
                    key={request.id}
                    className={`bg-white rounded-[10px] border border-[#DEDEDE] p-4 ${
                      actionLoading === request.id ? "opacity-50" : ""
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-[14px] font-normal leading-[20px] text-[#111111] mb-2">
                          {request.office.officeName}
                        </h3>
                        <p className="text-[14px] font-normal leading-[20px] text-[#111111] mb-2">
                          {request.office.address}
                        </p>
                        <span className="text-[14px] font-medium leading-[20px] text-[#111111] mb-2">
                          {formatStatus(request.status)}
                        </span>
                        <p className="text-[12px] text-[#585858]">
                          Created: {formatDate(request.createdAt)}
                        </p>
                      </div>
                      <div className="relative ml-2">
                        <button
                          onClick={() => openMobileModal(request.id)}
                          disabled={actionLoading === request.id}
                          className="transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <ThreeDots />
                        </button>
                      </div>
                    </div>
                    <div className="mt-4 flex items-end justify-end">
                      {request.status !== "ACCEPTED" && (
                        <button
                          onClick={() => handleOpenApproveModal(request)}
                          disabled={actionLoading === request.id}
                          className="w-[98px] h-[38px] cursor-pointer rounded-md relative text-[#20523C] text-[16px] font-semibold leading-[22px] disabled:opacity-50 disabled:cursor-not-allowed"
                          style={{
                            background:
                              "radial-gradient(65.83% 94.77% at 50.34% 116.3%, #C3F63C 0%, #54D10E 100%)",
                            border: "1px solid rgba(255, 255, 255, 0.4)",
                            boxShadow:
                              "0px 4px 4px 0px #FFFFFF52 inset, 0px -4px 4px 0px #FFFFFF52 inset",
                          }}
                        >
                          {actionLoading === request.id ? "..." : "Approve"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Mobile Bottom Sheet Modal */}
        {showMobileModal !== null && successRequestId === null && (
          <div
            className="lg:hidden fixed inset-0 z-50 modal-backdrop"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          >
            <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[20px] shadow-2xl transform transition-transform duration-300 ease-out">
              <div className="flex justify-center pt-2 pb-[19px]">
                <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
              </div>

              <div className="space-y-1 mb-6">
                {(() => {
                  const request = requests.find(
                    (r) => r.id === showMobileModal
                  );
                  if (!request) return null;

                  return (
                    <>
                      {request.status !== "ON_HOLD" && (
                        <button
                          onClick={() =>
                            showMobileModal && handleHold(showMobileModal)
                          }
                          className="px-5 w-full cursor-pointer text-left py-3 text-[14px] font-normal leading-[20px] text-[#111111] border-b border-[#DEDEDE] transition-colors hover:bg-gray-50"
                        >
                          Hold for a moment
                        </button>
                      )}
                      {request.status !== "REJECTED" && (
                        <button
                          onClick={() =>
                            showMobileModal && openRejectModal(showMobileModal)
                          }
                          className="px-5 w-full cursor-pointer text-left py-3 text-[14px] font-normal leading-[20px] text-[#111111] border-b border-[#DEDEDE] transition-colors hover:bg-gray-50"
                        >
                          Reject request
                        </button>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}
      </div>

      {rejectingRequestId !== null && (
        <RejectThisRequest
          open={true}
          onClose={closeRejectModal}
          onSend={(reason, message) => {
            if (rejectingRequestId !== null) {
              handleRejectSubmit(rejectingRequestId, reason, message);
            }
          }}
          loading={rejectLoading}
        />
      )}

      {successRequestId !== null && (
        <RejectSuccessModal open={true} onClose={handleCloseSuccessModal} />
      )}

      {approveModalOpen && selectedRequest && (
        <ApproveModal
          open={approveModalOpen}
          onClose={() => {
            setApproveModalOpen(false);
            setSelectedRequest(null);
          }}
          onApprove={handleApproveFromModal}
          onReject={() => {
            setApproveModalOpen(false);
            if (selectedRequest) {
              setShowRejectFromApprove(true);
            }
          }}
          data={{
            email: selectedRequest.office.email,
            officeName: selectedRequest.office.officeName,
            commercialRegNumber: selectedRequest.office.registrationNumber,
            currencyLicenseNumber:
              selectedRequest.office.currencyExchangeLicenseNumber,
            address: selectedRequest.office.address,
            city: selectedRequest.office.city.name,
            province: selectedRequest.office.state,
            primaryPhone: selectedRequest.office.primaryPhoneNumber,
            whatsapp: selectedRequest.office.whatsappNumber,
            geolocation: selectedRequest.office.location
              ? `${selectedRequest.office.location.coordinates[1]}, ${selectedRequest.office.location.coordinates[0]}`
              : "",
          }}
        />
      )}

      {showRejectFromApprove && selectedRequest && (
        <RejectThisRequest
          open={showRejectFromApprove}
          onClose={() => setShowRejectFromApprove(false)}
          onSend={(reason, message) => {
            if (selectedRequest) {
              handleRejectSubmit(selectedRequest.id, reason, message);
            }
          }}
          loading={rejectLoading}
        />
      )}

      {approveSuccessModalOpen && (
        <ApproveSuccessModal
          open={true}
          onClose={handleCloseApproveSuccessModal}
        />
      )}
    </AdminLayout>
  );
};

export default RegisterRequest;
