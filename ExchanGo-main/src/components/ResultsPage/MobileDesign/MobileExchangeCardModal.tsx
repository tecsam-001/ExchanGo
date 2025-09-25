"use client";
import Image from "next/image";
import ExchangeList from "../ExchangeList";
import React, { useRef, useState, useCallback, useEffect } from "react";
import { HoverProvider } from "@/context/HoverContext";
import WhatsAppAlertModal from "../WhatsappAlert/WhatsAppAlertModal";

interface MobileExchangeCardModalProps {
  onClose: () => void;
  resultCount?: number;
  cityOffices?: {
    offices: any[];
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
  } | null;
  filteredOffices?: any[];
}

const MobileExchangeCardModal: React.FC<MobileExchangeCardModalProps> = ({
  onClose,
  resultCount,
  cityOffices,
  filteredOffices,
}) => {
  const MIN_HEIGHT = 70;
  const [maxHeight, setMaxHeight] = useState(500);
  const [height, setHeight] = useState(MIN_HEIGHT);
  const [isDragging, setIsDragging] = useState(false);
  const startYRef = useRef<number | null>(null);
  const startHeightRef = useRef<number>(MIN_HEIGHT);
  const finalHeightRef = useRef(height);
  const [city, setCity] = useState(cityOffices?.cityInfo?.name || "Casablanca");
  const [lastUpdate, setLastUpdate] = useState("just now");
  const lastUpdateTimeRef = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const openness = Math.max(
    0,
    Math.min(1, (height - MIN_HEIGHT) / Math.max(1, maxHeight - MIN_HEIGHT))
  );
  const overlayOpacity = 0.4 * openness;
  const isFullyExpanded = height >= maxHeight - 10; // Allow some tolerance for rounding errors

  const minimizeToBottom = useCallback(() => {
    setHeight(MIN_HEIGHT);
    finalHeightRef.current = MIN_HEIGHT;
  }, [MIN_HEIGHT]);

  const handleDragMove = useCallback(
    (e: TouchEvent | MouseEvent) => {
      if (startYRef.current === null) return;

      const clientY =
        "touches" in e
          ? (e as TouchEvent).touches[0].clientY
          : (e as MouseEvent).clientY;
      const delta = startYRef.current - clientY;
      let newHeight = startHeightRef.current + delta;

      newHeight = Math.max(MIN_HEIGHT - 80, Math.min(maxHeight, newHeight));
      if ("touches" in e && (e as TouchEvent).cancelable) {
        (e as TouchEvent).preventDefault();
      }
      setHeight(newHeight);
      finalHeightRef.current = newHeight;
    },
    [maxHeight, MIN_HEIGHT]
  );

  const handleDragEnd = useCallback(() => {
    setIsDragging(false);
    startYRef.current = null;
    document.body.style.userSelect = "";

    const finalHeight = finalHeightRef.current;

    if (finalHeight < MIN_HEIGHT - 50) {
      // Only close if dragged significantly below minimum height
      onClose();
    } else if (finalHeight < MIN_HEIGHT) {
      setHeight(MIN_HEIGHT);
      finalHeightRef.current = MIN_HEIGHT;
    } else {
      setHeight(
        finalHeight > (MIN_HEIGHT + maxHeight) / 2 ? maxHeight : MIN_HEIGHT
      );
    }

    window.removeEventListener("mousemove", handleDragMove);
    window.removeEventListener("mouseup", handleDragEnd);
    window.removeEventListener("touchmove", handleDragMove);
    window.removeEventListener("touchend", handleDragEnd);
  }, [handleDragMove, MIN_HEIGHT, maxHeight, onClose]);

  const handleDragStart = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      setIsDragging(true);
      if ("touches" in e) {
        startYRef.current = e.touches[0].clientY;
      } else {
        startYRef.current = e.clientY;
      }
      startHeightRef.current = height;
      document.body.style.userSelect = "none";

      if ("touches" in e) {
        window.addEventListener("touchmove", handleDragMove, {
          passive: false,
        });
        window.addEventListener("touchend", handleDragEnd);
      } else {
        window.addEventListener("mousemove", handleDragMove);
        window.addEventListener("mouseup", handleDragEnd);
      }
    },
    [height, handleDragMove, handleDragEnd]
  );

  // Allow swipe from header area only when not fully expanded
  const handleDragStartFromHeader = useCallback(
    (e: React.TouchEvent | React.MouseEvent) => {
      // Only allow dragging from the header area, not from content
      const target = e.target as HTMLElement;
      const isHeaderArea = target.closest('.modal-header') || target.closest('.drag-handle');
      
      if (!isHeaderArea && isFullyExpanded) {
        return; // Don't start drag from content area when expanded
      }

      handleDragStart(e);
    },
    [isFullyExpanded, handleDragStart]
  );

  // Update city when cityOffices changes
  useEffect(() => {
    console.log("MobileModal: cityOffices changed:", cityOffices);
    console.log("MobileModal: filteredOffices:", filteredOffices);
    if (cityOffices?.cityInfo?.name) {
      setCity(cityOffices.cityInfo.name);
      setLastUpdate("just now");
      lastUpdateTimeRef.current = Date.now();
    }
  }, [cityOffices, filteredOffices]);

  useEffect(() => {
    const handleUserLocationChanged = (event: any) => {
      if (event.detail && event.detail.name) {
        setCity(event.detail.name);
        setLastUpdate("just now");
        lastUpdateTimeRef.current = Date.now();
      }
    };
    window.addEventListener("userLocationChanged", handleUserLocationChanged);
    return () =>
      window.removeEventListener(
        "userLocationChanged",
        handleUserLocationChanged
      );
  }, []);

  // Listen for close modal event from map - but only when modal is minimized
  useEffect(() => {
    const handleCloseModal = (event: any) => {
      if (event.detail && event.detail.isVisible === false && height <= MIN_HEIGHT) {
        onClose();
      }
    };
    window.addEventListener("closeExchangeListModal", handleCloseModal);
    return () =>
      window.removeEventListener("closeExchangeListModal", handleCloseModal);
  }, [onClose, height, MIN_HEIGHT]);

  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const diff = Math.floor((Date.now() - lastUpdateTimeRef.current) / 60000);
      if (diff === 0) setLastUpdate("just now");
      else if (diff === 1) setLastUpdate("1 min ago");
      else setLastUpdate(`${diff} min ago`);
    }, 1000 * 10); // update every 10 seconds for demo, use 60000 for 1 min
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    return () => {
      window.removeEventListener("mousemove", handleDragMove);
      window.removeEventListener("mouseup", handleDragEnd);
      window.removeEventListener("touchmove", handleDragMove);
      window.removeEventListener("touchend", handleDragEnd);
    };
  }, [handleDragMove, handleDragEnd]);

  // Compute dynamic max height based on viewport, update on resize/orientation
  useEffect(() => {
    const updateMaxHeight = () => {
      const vh = window.innerHeight || 700;
      const topMargin = 146; // keep a small visible margin at the top
      const computed = Math.max(MIN_HEIGHT + 1, vh - topMargin);
      setMaxHeight(computed);
      if (finalHeightRef.current > computed) {
        setHeight(computed);
        finalHeightRef.current = computed;
      }
    };
    updateMaxHeight();
    window.addEventListener("resize", updateMaxHeight);
    window.addEventListener("orientationchange", updateMaxHeight);
    return () => {
      window.removeEventListener("resize", updateMaxHeight);
      window.removeEventListener("orientationchange", updateMaxHeight);
    };
  }, [MIN_HEIGHT]);

  return (
    <>
      {/* Background overlay that dims when expanded and is click-through when minimized */}
      <div
        className="fixed inset-0 z-[9998]"
        style={{
          backgroundColor: `rgba(0,0,0,${overlayOpacity})`,
          transition: isDragging
            ? "none"
            : "background-color 0.2s ease, opacity 0.2s ease",
          pointerEvents: height > MIN_HEIGHT ? "auto" : "none",
        }}
        onClick={(e) => {
          // Only minimize if clicking directly on overlay, not when modal is expanded
          if (height > MIN_HEIGHT + 50) {
            minimizeToBottom();
          }
        }}
      />

      {/* Bottom sheet container */}
      <div className="fixed inset-x-0 bottom-0 z-[10000] flex items-end justify-center">
        <div
          className="bg-white rounded-t-lg shadow-lg w-full max-w-md mx-auto lg:hidden flex flex-col"
          style={{
            maxHeight: maxHeight,
            height: height,
            transition: isDragging ? "none" : "height 0.3s ease-out",
            touchAction: isFullyExpanded ? "auto" : "none",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* <div
          className="w-full mx-auto max-w-[42px] h-[5px] bg-[#E3E3E3] rounded-full p-0 m-0 cursor-ns-resize"
        /> */}
          <div className="px-5 modal-header">
            <div className="mb-[19px] mt-2">
              <div
                className="w-full mx-auto max-w-[42px] h-[5px] bg-[#E3E3E3] rounded-full p-0 m-0 cursor-ns-resize drag-handle"
                onMouseDown={handleDragStart}
                onTouchStart={handleDragStart}
              />
            </div>
            <div 
              className="w-full flex items-center justify-between gap-3 pb-4"
              onMouseDown={handleDragStartFromHeader}
              onTouchStart={handleDragStartFromHeader}
            >
              <div>
                <p className="text-[#585858] text-[11px] sm:text-[14px] font-normal leading-[15px] sm:leading-[20px]">
                  Showing{" "}
                  <span className="text-[#20523C] font-bold">
                    {cityOffices?.cityInfo?.totalOffices || resultCount || 0}
                  </span>{" "}
                  Exchange office listing in{" "}
                  <span className="text-[#20523C] font-bold">{city}</span>{" "}
                </p>
                <h3 className="text-[#585858] text-[11px] sm:text-[14px] font-normal leading-[15px] sm:leading-[20px] mt-1">
                  Last update{" "}
                  <span className="text-[#20523C] font-bold">{lastUpdate}</span>
                </h3>
              </div>
              <button
                className="cursor-pointer"
                onClick={() => setShowWhatsAppModal(true)}
              >
                <Image
                  src="/assets/whatsapp-mobile-alert.svg"
                  alt="whatsapp"
                  width={24.33}
                  height={24.33}
                />
              </button>
            </div>
          </div>

          <div
            className={`flex-1 px-5 ${
              isFullyExpanded ? "overflow-y-auto" : "overflow-hidden"
            }`}
            ref={contentRef}
            style={{
              minHeight: 0, // Ensure flex child can shrink
              maxHeight: isFullyExpanded ? "none" : "0px",
              height: isFullyExpanded ? "auto" : "0px",
              WebkitOverflowScrolling: "touch", // Enable smooth scrolling on iOS
            }}
          >
            <HoverProvider>
              <ExchangeList
                cityOffices={cityOffices}
                filteredOffices={filteredOffices}
              />
            </HoverProvider>
          </div>
        </div>
      </div>

      <div>
        <WhatsAppAlertModal
          isOpen={showWhatsAppModal}
          onClose={() => setShowWhatsAppModal(false)}
          exchangeName="this exchange"
        />
      </div>
    </>
  );
};

export default MobileExchangeCardModal;
