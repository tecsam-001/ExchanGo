"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/pagination";
import DropdownMenuItem from "./DropdownMenuItem";
import ShareExchangeModal from "./ShareExchangeModal";
import WhatsAppAlertModal from "./WhatsappAlert/WhatsAppAlertModal";
import Link from "next/link";
import { useHover } from "@/context/HoverContext";
import { getCurrencySymbol } from "@/utils/currencyUtils";

interface ExchangeCardProps {
  id?: number | string;
  name: string;
  rate: string;
  address: string;
  hours: string;
  images?: Array<{ id: string; path: string }> | string[] | null; // Changed from 'image'
  country: string;
  isPopular?: boolean;
  isVerified?: boolean; // Add isVerified
  bestOffice?: boolean; // Add bestOffice for highlighting
  lastUpdate?: string;
  availableCurrencies?: string[];
  searchCount?: number;
  distance?: number;
  isCurrentlyOpen?: boolean;
  slug?: string;
  phoneNumber?: string; // Add phone number for call functionality
  // Add new required fields for sharing
  baseAmount?: string;
  sourceCurrency?: string;
  targetCurrency?: string;
  targetCurrencySymbol?: string;
  city?: string;
  // Add rates data from API
  rates?: Array<{
    id: string;
    baseCurrency: {
      id: string;
      code: string;
      name: string;
      namePlural: string;
      symbol: string;
      symbolNative: string;
      decimalDigits: number;
      rounding: string;
      createdAt: string;
      updatedAt: string;
      flag: string;
    };
    targetCurrency: {
      id: string;
      code: string;
      name: string;
      namePlural: string;
      symbol: string;
      symbolNative: string;
      decimalDigits: number;
      rounding: string;
      createdAt: string;
      updatedAt: string;
      flag: string;
    };
    buyRate: string;
    sellRate: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
  }>;
}

// Utility function to truncate name
export const truncateName = (name: string, maxLength: number = 17): string => {
  if (!name) return "Unnamed Office";
  return name.length > maxLength ? `${name.slice(0, maxLength)}...` : name;
};

// Type guard to check if an item is an image object
const isImageObject = (item: any): item is { id: string; path: string } => {
  return (
    item &&
    typeof item === "object" &&
    "path" in item &&
    typeof item.path === "string"
  );
};

// Utility function to get first image path
const getFirstImagePath = (
  images?: Array<{ id: string; path: string }> | string[] | null
): string => {
  if (!images || images.length === 0) return "/assets/placeholder.png";

  const firstItem = images[0];

  let imagePath = "";

  // If it's a string array, return first string
  if (typeof firstItem === "string") {
    imagePath = firstItem || "/assets/placeholder.png";
  }
  // If it's an object with path, return path
  else if (isImageObject(firstItem)) {
    imagePath = firstItem.path || "/assets/placeholder.png";
  } else {
    return "/assets/placeholder.png";
  }

  // If it's already a full URL, return as is
  if (imagePath.startsWith("http")) {
    return imagePath;
  }

  // If it's a placeholder, return as is
  if (imagePath === "/assets/placeholder.png") {
    return imagePath;
  }

  // If it's a relative path, construct the full URL
  const API_BASE_URL = "https://exchango.opineomanager.com";
  return `${API_BASE_URL}${imagePath}`;
};

// Helper function to get image paths
const getImagePaths = (
  images?: Array<{ id: string; path: string }> | string[] | null
): string[] => {
  if (!images || images.length === 0) return ["/assets/placeholder.png"];

  const API_BASE_URL = "https://exchango.opineomanager.com";

  // Helper function to convert path to full URL
  const convertToFullUrl = (path: string): string => {
    // If it's already a full URL, return as is
    if (path.startsWith("http")) {
      return path;
    }

    // If it's a placeholder, return as is
    if (path === "/assets/placeholder.png") {
      return path;
    }

    // If it's a relative path, construct the full URL
    return `${API_BASE_URL}${path}`;
  };

  // If it's a string array, convert each path
  if (typeof images[0] === "string") {
    const validPaths = images.filter(Boolean) as string[];
    return validPaths.length > 0
      ? validPaths.map(convertToFullUrl)
      : ["/assets/placeholder.png"];
  }

  // If it's an array of objects with path, extract and convert paths
  const paths = images
    .filter(isImageObject)
    .map((img) => img.path)
    .filter(Boolean)
    .map(convertToFullUrl);

  return paths.length > 0 ? paths : ["/assets/placeholder.png"];
};

const ExchangeCard: React.FC<ExchangeCardProps> = ({
  id = 1,
  name,
  rate,
  address,
  hours,
  images,
  country,
  isPopular = false,
  isVerified = false, // Add isVerified
  bestOffice = false, // Add bestOffice for highlighting
  lastUpdate = "16 April 2025",
  availableCurrencies = [],
  searchCount,
  distance,
  isCurrentlyOpen = true,
  slug,
  phoneNumber,
  baseAmount,
  sourceCurrency,
  targetCurrency,
  targetCurrencySymbol,
  city,
  rates = [], // Add rates from API
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isWhatsAppAlertModalOpen, setIsWhatsAppAlertModalOpen] =
    useState(false);
  const { hoveredExchangeId, setHoveredExchangeId } = useHover();

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
    console.log("object");
    setActiveItem(null);
  };

  const handleMenuItemClick = (itemName: string) => {
    setActiveItem(itemName);

    if (itemName === "Share this Exchange") {
      setIsShareModalOpen(true);
      setIsDropdownOpen(false);
    } else if (itemName === "Rate Alert") {
      setIsWhatsAppAlertModalOpen(true);
      setIsDropdownOpen(false);
    } else if (itemName === "Call Atlas exchange ( Mobile )") {
      // Handle call functionality
      if (phoneNumber) {
        // Use tel: protocol to initiate phone call
        window.location.href = `tel:${phoneNumber}`;
      } else {
        // Fallback: show alert if no phone number available
        alert("Phone number not available for this exchange office.");
      }
      setIsDropdownOpen(false);
    }
  };

  const handleDropdownToggle = () => {
    // Add a small delay to prevent accidental touches
    console.log("3 dots dropdown clicked!"); // Debug log
    toggleDropdown();
    // setTimeout(() => {
    // }, 50);
  };

  // Get image paths
  const imagePaths = getImagePaths(images);

  // Determine display currency symbol without hardcoded fallbacks
  // Prefer API-provided symbol, else derive from code, else empty
  const derivedSymbolFromCode = targetCurrency
    ? getCurrencySymbol(targetCurrency)
    : undefined;
  const displayCurrencySymbol = targetCurrencySymbol || derivedSymbolFromCode || "";

  const createExchangeDetailUrl = () => {
    // If slug exists, use it directly
    if (slug) {
      // Option 2: Slug as query parameter
      return `/exchange-detail?slug=${encodeURIComponent(slug)}`;
    }

    // Fallback to old method if no slug
    const params = new URLSearchParams();
    if (id) params.append("id", id.toString());
    params.append("name", name);
    params.append("rate", rate);
    params.append("address", address);
    params.append("hours", hours);

    // Handle image with new format or old string format
    params.append("images", getFirstImagePath(images));

    if (lastUpdate) params.append("lastUpdate", lastUpdate);
    if (isPopular) params.append("isPopular", "true");

    if (availableCurrencies && availableCurrencies.length > 0) {
      params.append("availableCurrencies", availableCurrencies.join(","));
    }

    if (searchCount) params.append("searchCount", searchCount.toString());
    if (distance) params.append("distance", distance.toString());
    if (isCurrentlyOpen) params.append("isCurrentlyOpen", "true");

    return `/exchange-detail?${params.toString()}`;
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [dropdownRef]);

  const handleMouseEnter = () => {
    setHoveredExchangeId(id);
  };

  const handleMouseLeave = () => {
    setHoveredExchangeId(null);
  };

  return (
    <>
      <div
        className={`bg-white rounded-lg border ${
          hoveredExchangeId === id
            ? "border-[#20523C] shadow-lg"
            : "border-[#DEDEDE]"
        } w-full flex flex-col justify-between h-full transition-all duration-200`}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Link href={createExchangeDetailUrl()}>
          <div className="relative">
            <Swiper
              pagination={{
                clickable: true,
                bulletClass:
                  "swiper-pagination-bullet swiper-pagination-bullet-custom",
                bulletActiveClass:
                  "swiper-pagination-bullet-active swiper-pagination-bullet-active-custom",
              }}
              modules={[Pagination]}
              className="mySwiper w-full h-[121px] object-cover"
            >
              {imagePaths.map((imgSrc, index) => (
                <SwiperSlide key={index}>
                  <Image
                    src={imgSrc || "/assets/placeholder.png"}
                    alt={name}
                    width={400}
                    height={200}
                    className="w-full h-[121px] object-cover rounded-t-lg"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
            {isPopular && (
              <h3
                className="absolute top-3 left-3 z-30 bg-white text-[#111111] text-[10.28px] leading-[12px] font-medium px-1.5 py-1 rounded-[4.11px] flex items-center"
                style={{ boxShadow: "0px 6.17px 24.67px 0px #00000029" }}
              >
                🔥 Popular Exchange
              </h3>
            )}

            {isVerified && (
              <h3
                className={`absolute ${
                  isPopular ? "top-10" : "top-3"
                } left-3 z-30 bg-white text-[#111111] text-[10.28px] leading-[12px] font-medium px-1.5 py-1 rounded-[4.11px] flex items-center`}
                style={{ boxShadow: "0px 6.17px 24.67px 0px #00000029" }}
              >
                ✅ Verified Office
              </h3>
            )}

            <h3
              className="absolute flex items-center gap-0.5 top-3 right-3 z-30 bg-white text-[#111111] text-[10.28px] leading-[12px] font-medium px-1.5 py-1 rounded-[4.11px]"
              style={{ boxShadow: "0px 6.17px 24.67px 0px #00000029" }}
            >
              <Image
                src="/assets/timer.svg"
                alt="Open"
                width={12.33}
                height={12.33}
              />{" "}
              {isCurrentlyOpen ? "Open" : "Closed"}
            </h3>
          </div>

          <div className="px-[18.25px] pt-[18.25px] sm:p-[18.25px] ">
            <h3 className="text-[16.22px] leading-[19px] font-normal text-[#111111]">
              {truncateName(name)}
            </h3>
            <h1 className="text-[20.28px] leading-[24px] font-bold text-[#111111] mt-1">
              {rate === "N/A" ? (
                "N/A"
              ) : (
                <>
                  {displayCurrencySymbol && `${displayCurrencySymbol} `}
                  {(() => {
                    const n =
                      typeof rate === "number"
                        ? rate
                        : parseFloat(String(rate));
                    return Number.isFinite(n) ? n.toFixed(2) : rate;
                  })()}
                </>
              )}
            </h1>
            <h3 className="text-[14.19px] font-normal leading-[20px] text-[#585858] mt-[12.17px]">
              {address}
            </h3>
            <h3 className="text-[14.19px] font-normal leading-[20px] text-[#585858] ">
              {country}
            </h3>
            <h3 className="text-[14.19px] font-normal leading-[20px] text-[#585858] mt-1">
              {hours}
            </h3>
          </div>
        </Link>

        <div className="mt-6 flex items-center justify-between gap-[12.17px] p-[18.25px] pt-0">
          <button
            className="border w-full border-[#20523C] cursor-pointer hover:bg-[#20523C] hover:text-white rounded-md h-[47px] px-4 text-[16.22px] leading-[23px] font-medium text-[#20523C] transition duration-200"
            onClick={() => {
              const addressEncoded = encodeURIComponent(address);
              // Try to open Google Maps app (mobile) or web
              const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${addressEncoded}`;
              const wazeUrl = `https://waze.com/ul?ll=&q=${addressEncoded}`;
              // Try Google Maps first
              const win = window.open(googleMapsUrl, "_blank");
              if (win) {
                win.focus();
              } else {
                // If popup blocked or failed, try Waze
                window.open(wazeUrl, "_blank");
              }
            }}
          >
            Get Direction
          </button>

          <div
            className="relative flex-shrink-0 dropdown-container"
            ref={dropdownRef}
          >
            <button
              className={`w-[47px] h-[47px] flex items-center justify-center border rounded-md hover:bg-[#f4f5f5] cursor-pointer transition duration-300 border-[#20523C] ${
                isDropdownOpen ? "" : ""
              }`}
              onClick={handleDropdownToggle}
              onTouchEnd={(e) => {
                e.preventDefault();
                handleDropdownToggle();
              }}
            >
              <Image
                src="/assets/dot-circle.svg"
                alt="dot-circle"
                width={24.33}
                height={24.33}
              />
            </button>

            {isDropdownOpen && (
              <div
                className="absolute right-0 bottom-full mb-2 w-[250px] bg-white rounded-md z-[9999] shadow-lg dropdown-content"
                style={{
                  boxShadow:
                    "0px 30px 80px 0px #00000029, 0px 4px 4px 0px #00000014",
                }}
                onClick={(e) => e.stopPropagation()}
              >
                <ul className="py-1 ">
                  <DropdownMenuItem
                    iconSrc="/assets/rate-alert.svg"
                    altText="Rate Alert"
                    label="Rate Alert"
                    onClick={() => handleMenuItemClick("Rate Alert")}
                    isActive={activeItem === "Rate Alert"}
                    isLast={false}
                  />
                  <DropdownMenuItem
                    iconSrc="/assets/share-this-exchange.svg"
                    altText="Share"
                    label="Share this Exchange"
                    onClick={() => handleMenuItemClick("Share this Exchange")}
                    isActive={activeItem === "Share this Exchange"}
                    isLast={false}
                  />
                  <DropdownMenuItem
                    iconSrc="/assets/call.svg"
                    altText="Call"
                    label="Call Atlas exchange ( Mobile )"
                    onClick={() =>
                      handleMenuItemClick("Call Atlas exchange ( Mobile )")
                    }
                    isActive={activeItem === "Call Atlas exchange ( Mobile )"}
                    isLast={true}
                  />
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Exchange Modal */}
      <ShareExchangeModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        exchangeData={{
          name: name,
          location: address,
          lastUpdate: lastUpdate || "Unknown",
          rate: rate,
          image:
            images && images.length > 0
              ? typeof images[0] === "string"
                ? images[0]
                : isImageObject(images[0])
                ? images[0].path
                : undefined
              : undefined,
          // Add new required fields for sharing
          baseAmount: baseAmount || "1",
          sourceCurrency: sourceCurrency || "EUR",
          targetCurrency: targetCurrency || "MAD",
          city: city || "Unknown City",
          exchangeOfficeLink: slug
            ? `https://www.exchango24.com/exchange-detail?slug=${slug}`
            : `https://www.exchango24.com/exchange-detail?id=${id}`,
        }}
      />

      {/* WhatsApp Alert Modal */}
      <WhatsAppAlertModal
        isOpen={isWhatsAppAlertModalOpen}
        onClose={() => setIsWhatsAppAlertModalOpen(false)}
      />
    </>
  );
};

export default ExchangeCard;
