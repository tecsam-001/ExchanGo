"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import WhatsAppAlertModal from "../ResultsPage/WhatsappAlert/WhatsAppAlertModal";
import { trackGpsClick, trackPhoneCall } from "@/services/api";

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

interface Rate {
  id: string;
  baseCurrency: Currency;
  targetCurrency: Currency;
  buyRate: string;
  sellRate: string;
  isActive: boolean;
}

interface ExchangeInfoProps {
  name?: string;
  description?: string;
  hours?: string;
  whatsappNumber?: string;
  primaryPhoneNumber?: string;
  address?: string;
  rating?: number;
  reviewCount?: number;
  isPopular?: boolean;
  isVerified?: boolean;
  officeId?: string;
  logo?: { id: string; path: string } | null;
  rates?: Rate[];
}

interface CurrencyRate {
  code: string;
  flag: any;
  buyingRate: string;
  sellingRate: string;
  isHighlighted?: boolean;
}

// Transform API rates to component format
const transformRatesToCurrencyRates = (rates: Rate[]): CurrencyRate[] => {
  if (!rates || rates.length === 0) {
    return [];
  }

  const activeRates = rates.filter((rate) => rate.isActive);

  return activeRates.map((rate) => ({
    code: rate.targetCurrency.code,
    flag:
      rate.targetCurrency.flag ||
      `https://flagcdn.com/w40/${rate.targetCurrency.code.toLowerCase()}.png`,
    buyingRate: rate.buyRate,
    sellingRate: rate.sellRate,
  }));
};

const ExchangeInfo: React.FC<ExchangeInfoProps> = ({
  name = "",
  hours = "",
  whatsappNumber = "",
  primaryPhoneNumber = "",
  description = "",
  address = "",
  rating = 4.8,
  reviewCount = 120,
  isPopular = false,
  isVerified = false, // Add isVerified
  officeId = "", // Default to empty string
  logo = null,
  rates = [], // Default to empty array
}) => {
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [isWhatsAppAlertModalOpen, setIsWhatsAppAlertModalOpen] =
    useState(false);
  const [isWhatsAppDropdownOpen, setIsWhatsAppDropdownOpen] = useState(false);
  const [isMobileWhatsAppDropdownOpen, setIsMobileWhatsAppDropdownOpen] =
    useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState<string>(
    "April 30, 2024 – 09:45"
  );
  const whatsAppDropdownRef = React.useRef<HTMLDivElement>(null);
  const mobileWhatsAppDropdownRef = React.useRef<HTMLDivElement>(null);

  // Transform API rates to component format
  const currencyRates = transformRatesToCurrencyRates(rates);

  // Load the last update time from localStorage on client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTime = localStorage.getItem("lastRateUpdateTime");
      if (savedTime) {
        try {
          const date = new Date(savedTime);
          const formattedDate =
            date.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            }) +
            " – " +
            date.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });
          setLastUpdateTime(formattedDate);
        } catch (error) {
          console.error("Error parsing date from localStorage:", error);
        }
      }
    }
  }, []);

  const handleWhatsAppAlertClick = () => {
    setIsWhatsAppDropdownOpen(!isWhatsAppDropdownOpen);
  };

  const handleMobileWhatsAppAlertClick = () => {
    setIsMobileWhatsAppDropdownOpen(!isMobileWhatsAppDropdownOpen);
  };

  const toggleAlertModal = () => {
    setIsWhatsAppAlertModalOpen(!isWhatsAppAlertModalOpen);
  };

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        whatsAppDropdownRef.current &&
        !whatsAppDropdownRef.current.contains(event.target as Node)
      ) {
        setIsWhatsAppDropdownOpen(false);
      }
      if (
        mobileWhatsAppDropdownRef.current &&
        !mobileWhatsAppDropdownRef.current.contains(event.target as Node)
      ) {
        setIsMobileWhatsAppDropdownOpen(false);
      }
    };

    if (isWhatsAppDropdownOpen || isMobileWhatsAppDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isWhatsAppDropdownOpen, isMobileWhatsAppDropdownOpen]);

  // Detect iOS Safari
  const isIOSSafari = () => {
    const ua = navigator.userAgent;
    return /iPad|iPhone|iPod/.test(ua) && /Safari/.test(ua) && !/CriOS|FxiOS|OPiOS|mercury/.test(ua);
  };

  // Handle click on "Get Directions" button
  const handleGetDirectionsClick = async (e: React.MouseEvent) => {
    // Only prevent default on non-iOS browsers to avoid double opening
    if (!isIOSSafari()) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log("Get Directions clicked!");
    
    if (officeId) {
      try {
        // Track GPS click before opening map
        await trackGpsClick(officeId);
      } catch (error) {
        console.warn("Error tracking GPS click:", error);
      }
    }

    // Only open programmatically on non-iOS browsers
    if (!isIOSSafari()) {
      // Open map with address
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
    }
  };

  // Get the URLs for the buttons
  const getGoogleMapsUrl = () => {
    const addressEncoded = encodeURIComponent(address);
    return `https://www.google.com/maps/dir/?api=1&destination=${addressEncoded}`;
  };

  const getWhatsAppUrl = () => {
    // Clean the phone number - remove any non-digit characters except +
    const cleanNumber = whatsappNumber.replace(/[^\d+]/g, '');
    // Ensure the number starts with country code if it doesn't have +
    const finalNumber = cleanNumber.startsWith('+') ? cleanNumber : `+${cleanNumber}`;
    return `https://wa.me/${finalNumber}`;
  };

  // Handle click on "Call by WhatsApp" button
  const handleWhatsAppCallClick = async (e: React.MouseEvent) => {
    // Only prevent default on non-iOS browsers to avoid double opening
    if (!isIOSSafari()) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log("WhatsApp Call clicked!");
    
    if (officeId) {
      try {
        // Track phone call before opening WhatsApp with the phone number
        await trackPhoneCall(officeId, whatsappNumber);
      } catch (error) {
        console.warn("Error tracking phone call:", error);
      }
    }

    // Only open programmatically on non-iOS browsers
    if (!isIOSSafari()) {
      // Open WhatsApp with cleaned number
      const cleanNumber = whatsappNumber.replace(/[^\d+]/g, '');
      const finalNumber = cleanNumber.startsWith('+') ? cleanNumber : `+${cleanNumber}`;
      window.open(`https://wa.me/${finalNumber}`, "_blank");
    }
  };

  return (
    <div className="bg-white w-full">
      <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
        {/* Left column */}
        <div className="w-full lg:max-w-[710px]">
          <HeaderSection
            name={name}
            rating={rating}
            reviewCount={reviewCount}
            isPopular={isPopular}
            isVerified={isVerified}
            logo={logo}
          />

          <div className="block lg:hidden">
            <h3 className="text-[18px] sm:text-[24px] leading-[22px] sm:leading-[29px] font-bold text-[#111111] mb-2.5 sm:mb-6">
              Let's connect
            </h3>
            <div className="space-y-2.5 sm:space-y-[15px]">
              <a
                href={getGoogleMapsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleGetDirectionsClick}
                className="w-full border border-[#DEDEDE] rounded-lg px-[18px] py-4 sm:p-[18px] flex items-center justify-between transition duration-300 hover:shadow-[0px_30px_40px_0px_rgba(0,0,0,0.04)] cursor-pointer text-left bg-white"
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                  touchAction: 'manipulation',
                  WebkitTouchCallout: 'none',
                  outline: 'none',
                  border: '1px solid #DEDEDE',
                  minHeight: '60px',
                  background: 'white',
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  textDecoration: 'none',
                  color: 'inherit'
                } as React.CSSProperties}
              >
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="min-w-[36px] min-h-[36px] sm:min-w-[52px] sm:min-h-[52px] bg-[#F0F3F5] rounded-md flex items-center justify-center">
                    <Image
                      src="/assets/google-maps.svg"
                      alt="maps"
                      width={24}
                      height={24}
                      className="sm:w-[24px] sm:h-[24px] w-4 h-4"
                    />
                  </div>
                  <div className="max-w-[278px]">
                    <h4 className="text-[14px] sm:text-[18px] leading-[17px] sm:leading-[22px] font-bold text-[#111111]">
                      Get Direction
                    </h4>
                    <p className="mt-0.5 sm:mt-1.5 font-normal leading-[14px] sm:leading-[19px] text-[12px] sm:text-[16px] text-[#585858]">
                      we will guide you to the location
                    </p>
                  </div>
                </div>
                <div className="cursor-pointer ml-4">
                  <svg
                    width="32"
                    height="32"
                    className="sm:w-[32px] sm:h-[32px] w-[24px] h-[24px]"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19.2402 7.90625L27.3336 15.9996L19.2402 24.0929"
                      stroke="#20523C"
                      strokeWidth="2"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4.66602 16H27.106"
                      stroke="#20523C"
                      strokeWidth="2"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </a>
              
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWhatsAppCallClick}
                className="w-full border border-[#DEDEDE] rounded-lg px-[18px] py-4 sm:p-[18px] flex items-center justify-between transition duration-300 hover:shadow-[0px_30px_40px_0px_rgba(0,0,0,0.04)] cursor-pointer text-left bg-white"
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                  touchAction: 'manipulation',
                  WebkitTouchCallout: 'none',
                  outline: 'none',
                  border: '1px solid #DEDEDE',
                  minHeight: '60px',
                  background: 'white',
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  textDecoration: 'none',
                  color: 'inherit'
                } as React.CSSProperties}
              >
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="min-w-[36px] min-h-[36px] sm:min-w-[52px] sm:min-h-[52px] bg-[#F0F3F5] rounded-md flex items-center justify-center">
                    <Image
                      src="/assets/whatsapp-modal.png"
                      alt="whatsapp"
                      width={24}
                      height={24}
                      className="sm:w-[24px] sm:h-[24px] w-4 h-4"
                    />
                  </div>
                  <div className="max-w-[278px]">
                    <h4 className="text-[14px] sm:text-[18px] leading-[17px] sm:leading-[22px] font-bold text-[#111111]">
                      Call by Whatsapp
                    </h4>
                    <p className="mt-0.5 sm:mt-1.5 font-normal leading-[14px] sm:leading-[19px] text-[12px] sm:text-[16px] text-[#585858]">
                      Contact us for more info
                    </p>
                  </div>
                </div>
                <div className="cursor-pointer ml-4">
                  <svg
                    width="32"
                    height="32"
                    className="sm:w-[32px] sm:h-[32px] w-[24px] h-[24px]"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19.2402 7.90625L27.3336 15.9996L19.2402 24.0929"
                      stroke="#20523C"
                      strokeWidth="2"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4.66602 16H27.106"
                      stroke="#20523C"
                      strokeWidth="2"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </a>
              <div className="relative" ref={mobileWhatsAppDropdownRef}>
                <WhatsAppAlertCard
                  onClick={handleMobileWhatsAppAlertClick}
                />
                {isMobileWhatsAppDropdownOpen && (
                  <div
                    className="absolute right-0 top-[60px] z-50 bg-white rounded w-[137px] px-2 py-1.5"
                    style={{ boxShadow: "0px 0px 24px 0px #00000014" }}
                  >
                    <button
                      className="text-[#111111] text-[14px] leading-[18px] font-normal cursor-pointer"
                      onClick={() => {
                        setIsMobileWhatsAppDropdownOpen(false);
                        toggleAlertModal();
                      }}
                    >
                      Create a rate alert via WhatsApp
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 lg:mt-0">
            <h3 className="text-[#111111] text-[18px] sm:text-[24px] leading-[22px] sm:leading-[29px] font-bold mb-4">
              About {name}
            </h3>
            <p className="text-[14px] sm:text-[18px] font-normal text-[#585858] leading-[20px] sm:leading-[25px] whitespace-pre-line">
              {isDescriptionExpanded
                ? description
                : `${description.split("\n\n")[0]}... `}
              {description.split("\n\n").length > 1 && (
                <button
                  onClick={() =>
                    setIsDescriptionExpanded(!isDescriptionExpanded)
                  }
                  className="text-[#20523C] font-normal sm:font-bold cursor-pointer ml-0.5 sm:ml-1 transition duration-150 hover:underline"
                >
                  {isDescriptionExpanded ? "Show Less" : "Show More"}
                </button>
              )}
            </p>
          </div>

          {/* Office Information Section */}
          <div className="mt-5 lg:mt-10">
            <h3 className="text-[#111111] text-[18px] sm:text-[24px] leading-[22px] sm:leading-[29px] font-bold mb-4">
              Office Information
            </h3>

            <div className="lg:mt-0 mt-4 grid grid-cols-2 gap-5 sm:gap-6">
              <div className="border border-[#DEDEDE] rounded-lg px-3 sm:px-[42px] py-6 sm:py-8 text-center transition duration-300 hover:shadow-[0px_30px_40px_0px_rgba(0,0,0,0.04)]">
                <h4 className="text-[12px] sm:text-[18px] leading-[14px] sm:leading-[22px] font-medium text-[#111111] mb-1 sm:mb-4">
                  Opening Hours
                </h4>
                <p className="text-[14px] sm:text-[24px] leading-[20px] sm:leading-[34px] font-normal text-[#585858]">
                  {hours}
                </p>
              </div>
              <a
                href={`tel:${primaryPhoneNumber}`}
                className="block border border-[#DEDEDE] rounded-lg px-3 sm:px-[42px] py-6 sm:py-8 text-center transition duration-300 hover:shadow-[0px_30px_40px_0px_rgba(0,0,0,0.04)] group"
              >
                <h4 className="text-[12px] sm:text-[18px] leading-[14px] sm:leading-[22px] font-medium text-[#111111] mb-1 sm:mb-4">
                  Phone Number
                </h4>
                <p className="text-[14px] sm:text-[24px] leading-[20px] sm:leading-[34px] font-normal text-[#585858] group-hover:text-[#20523C] transition-colors">
                  {primaryPhoneNumber}
                </p>
              </a>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-[32px] w-full lg:max-w-[498px]">
          <div
            className="p-8 bg-white rounded-lg lg:block hidden"
            style={{ boxShadow: "0px 30px 40px 0px #0000000A" }}
          >
            <h3 className="text-[24px] leading-[29px] font-bold text-[#111111] mb-6">
              Let's connect
            </h3>
            <div className="space-y-[15px]">
              <a
                href={getGoogleMapsUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleGetDirectionsClick}
                className="w-full border border-[#DEDEDE] rounded-lg px-[18px] py-4 sm:p-[18px] flex items-center justify-between transition duration-300 hover:shadow-[0px_30px_40px_0px_rgba(0,0,0,0.04)] cursor-pointer text-left bg-white"
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                  touchAction: 'manipulation',
                  WebkitTouchCallout: 'none',
                  outline: 'none',
                  border: '1px solid #DEDEDE',
                  minHeight: '60px',
                  background: 'white',
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  textDecoration: 'none',
                  color: 'inherit'
                } as React.CSSProperties}
              >
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="min-w-[36px] min-h-[36px] sm:min-w-[52px] sm:min-h-[52px] bg-[#F0F3F5] rounded-md flex items-center justify-center">
                    <Image
                      src="/assets/google-maps.svg"
                      alt="maps"
                      width={24}
                      height={24}
                      className="sm:w-[24px] sm:h-[24px] w-4 h-4"
                    />
                  </div>
                  <div className="max-w-[278px]">
                    <h4 className="text-[14px] sm:text-[18px] leading-[17px] sm:leading-[22px] font-bold text-[#111111]">
                      Get Direction
                    </h4>
                    <p className="mt-0.5 sm:mt-1.5 font-normal leading-[14px] sm:leading-[19px] text-[12px] sm:text-[16px] text-[#585858]">
                      we will guide you to the location
                    </p>
                  </div>
                </div>
                <div className="cursor-pointer ml-4">
                  <svg
                    width="32"
                    height="32"
                    className="sm:w-[32px] sm:h-[32px] w-[24px] h-[24px]"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19.2402 7.90625L27.3336 15.9996L19.2402 24.0929"
                      stroke="#20523C"
                      strokeWidth="2"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4.66602 16H27.106"
                      stroke="#20523C"
                      strokeWidth="2"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </a>
              
              <a
                href={getWhatsAppUrl()}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleWhatsAppCallClick}
                className="w-full border border-[#DEDEDE] rounded-lg px-[18px] py-4 sm:p-[18px] flex items-center justify-between transition duration-300 hover:shadow-[0px_30px_40px_0px_rgba(0,0,0,0.04)] cursor-pointer text-left bg-white"
                style={{ 
                  WebkitTapHighlightColor: 'transparent',
                  WebkitUserSelect: 'none',
                  userSelect: 'none',
                  touchAction: 'manipulation',
                  WebkitTouchCallout: 'none',
                  outline: 'none',
                  border: '1px solid #DEDEDE',
                  minHeight: '60px',
                  background: 'white',
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  textDecoration: 'none',
                  color: 'inherit'
                } as React.CSSProperties}
              >
                <div className="flex items-center gap-2 sm:gap-4">
                  <div className="min-w-[36px] min-h-[36px] sm:min-w-[52px] sm:min-h-[52px] bg-[#F0F3F5] rounded-md flex items-center justify-center">
                    <Image
                      src="/assets/whatsapp-modal.png"
                      alt="whatsapp"
                      width={24}
                      height={24}
                      className="sm:w-[24px] sm:h-[24px] w-4 h-4"
                    />
                  </div>
                  <div className="max-w-[278px]">
                    <h4 className="text-[14px] sm:text-[18px] leading-[17px] sm:leading-[22px] font-bold text-[#111111]">
                      Call by Whatsapp
                    </h4>
                    <p className="mt-0.5 sm:mt-1.5 font-normal leading-[14px] sm:leading-[19px] text-[12px] sm:text-[16px] text-[#585858]">
                      Contact us for more info
                    </p>
                  </div>
                </div>
                <div className="cursor-pointer ml-4">
                  <svg
                    width="32"
                    height="32"
                    className="sm:w-[32px] sm:h-[32px] w-[24px] h-[24px]"
                    viewBox="0 0 32 32"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M19.2402 7.90625L27.3336 15.9996L19.2402 24.0929"
                      stroke="#20523C"
                      strokeWidth="2"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4.66602 16H27.106"
                      stroke="#20523C"
                      strokeWidth="2"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </a>
              <div className="relative" ref={whatsAppDropdownRef}>
                <WhatsAppAlertCard
                  onClick={handleWhatsAppAlertClick}
                />
                {isWhatsAppDropdownOpen && (
                  <div
                    className="absolute right-0 top-[70px] z-40 bg-white rounded w-[137px] px-2 py-1.5"
                    style={{ boxShadow: "0px 0px 24px 0px #00000014" }}
                  >
                    <button
                      className="text-[#111111] text-[14px] leading-[18px] font-normal cursor-pointer"
                      onClick={() => {
                        setIsWhatsAppDropdownOpen(false);
                        toggleAlertModal();
                      }}
                    >
                      Create a rate alert via WhatsApp
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:bg-white lg:p-8 lg:rounded-lg lg:shadow-[0px_30px_40px_0px_rgba(0,0,0,0.04)]">
            <div className="mb-4 sm:mb-6">
              <h2 className="text-[18px] sm:text-[24px] leading-[22px] sm:leading-[29px] font-bold text-[#111111] mb-2">
                Exchange Rate
              </h2>
              <p className="text-[12px] sm:text-[16px] font-normal leading-[14px] sm:leading-[19px] text-[#111111]">
                <span className="font-bold">Last Update</span> :{" "}
                {lastUpdateTime}
              </p>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-separate border-spacing-y-1">
                <thead>
                  <tr className="bg-[#F0F3F5] rounded-lg h-[36px]">
                    <th className="text-left sm:text-center py-2.5 px-4 text-[12px] leading-[17px] font-medium text-[#111111] first:rounded-l-lg last:rounded-r-lg">
                      Currency
                    </th>
                    <th className="text-center py-2.5 px-4 text-[12px] leading-[17px] font-medium text-[#111111]">
                      Buying Rate
                    </th>
                    <th className="text-center py-2.5 px-4 text-[12px] leading-[17px] font-medium text-[#111111] first:rounded-l-lg last:rounded-r-lg">
                      Selling Rate
                    </th>
                  </tr>
                </thead>
                <tbody className="space-y-1 sm:space-y-1.5">
                  {currencyRates.map((currency, index) => (
                    <tr
                      key={index}
                      className={
                        index % 2 === 0
                          ? "bg-white hover:bg-[#F0F3F5] rounded-lg transition duration-150"
                          : "bg-[#F0F3F5] rounded-lg"
                      }
                    >
                      <td className="px-4 pt-2 md:pt-[9px] pb-2 first:rounded-l-lg last:rounded-r-lg">
                        <div className="flex items-center gap-1.5 sm:gap-3">
                          <Image
                            src={currency.flag}
                            alt={currency.code}
                            width={24}
                            height={24}
                            className="rounded-full bg-cover w-[18px] h-[18px] sm:w-[24px] sm:h-[24px]"
                          />
                          <span
                            className={`text-[14px] sm:text-[18px] leading-[20px] sm:leading-[25px] font-normal text-[#585858]`}
                          >
                            {currency.code}
                          </span>
                        </div>
                      </td>
                      <td
                        className={`pt-2 md:pt-[9px] pb-[8px] px-4 text-center text-[14px] sm:text-[18px] leading-[20px] sm:leading-[25px] font-normal text-[#585858]`}
                      >
                        {currency.buyingRate}
                      </td>
                      <td
                        className={`pt-2 md:pt-[9px] pb-[8px] px-4 text-center text-[14px] sm:text-[18px] leading-[20px] sm:leading-[25px] font-normal text-[#585858] rounded-r-lg`}
                      >
                        {currency.sellingRate}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <WhatsAppAlertModal
        isOpen={isWhatsAppAlertModalOpen}
        onClose={() => setIsWhatsAppAlertModalOpen(false)}
        exchangeName={name}
      />
    </div>
  );
};

const HeaderSection: React.FC<{
  name: string;
  rating: number;
  reviewCount: number;
  isPopular?: boolean;
  isVerified?: boolean;
  logo?: { id: string; path: string } | null;
}> = ({ name, rating, reviewCount, isPopular, isVerified, logo }) => {
  return (
    <div className="border-b border-[#DEDEDE] pb-4 md:pb-8 mb-6 md:mb-[35px] flex items-center gap-2.5 sm:gap-4">
      <div className="w-[48px] h-[48px] sm:w-[100px] sm:h-[100px] rounded-full overflow-hidden flex items-center justify-center bg-gray-200">
        <Image
          src={
            logo?.path
              ? `https://exchango.opineomanager.com${logo.path}`
              : "/assets/profile.svg"
          }
          alt="logo"
          width={100}
          height={100}
          className="w-full h-full object-cover rounded-full"
          style={{ aspectRatio: "1/1" }} // Force square aspect ratio
          onError={(e) => {
            e.currentTarget.src = "/assets/profile.svg";
          }}
        />
      </div>
      <div className="w-full flex flex-col gap-2">
        <h2 className="text-[20px] sm:text-[52px] font-bold leading-[24px] sm:leading-[62px] text-[#111111]">
          {name}
        </h2>
        {isPopular && (
          <h2 className="sm:hidden block text-[#111111] text-[12px] leading-[17px] font-normal">
            🔥 Popular Exchange
          </h2>
        )}
      </div>
    </div>
  );
};


// WhatsApp Alert Card Component
const WhatsAppAlertCard: React.FC<{
  onClick: () => void;
}> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="w-full border border-[#DEDEDE] rounded-lg px-[18px] py-4 sm:p-[18px] flex items-center justify-between transition duration-300 hover:shadow-[0px_30px_40px_0px_rgba(0,0,0,0.04)] cursor-pointer text-left bg-white"
      style={{ 
        WebkitTapHighlightColor: 'transparent',
        WebkitUserSelect: 'none',
        userSelect: 'none',
        touchAction: 'manipulation',
        WebkitTouchCallout: 'none',
        outline: 'none',
        border: '1px solid #DEDEDE',
        minHeight: '60px'
      } as React.CSSProperties}
    >
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="min-w-[36px] min-h-[36px] sm:min-w-[52px] sm:min-h-[52px] bg-[#F0F3F5] rounded-md flex items-center justify-center">
          <Image
            src="/assets/whatsapp-mobile-alert.svg"
            alt="notification"
            width={24}
            height={24}
            className="sm:w-[24px] sm:h-[24px] w-4 h-4"
          />
        </div>
        <div className="max-w-[278px]">
          <h4 className="text-[14px] sm:text-[18px] leading-[17px] sm:leading-[22px] font-bold text-[#111111]">
            Whatsapp Alert
          </h4>
          <p className="mt-0.5 sm:mt-1.5 font-normal leading-[14px] sm:leading-[19px] text-[12px] sm:text-[16px] text-[#585858]">
            Get notified when rates change
          </p>
        </div>
      </div>
      <div className="cursor-pointer ml-4">
        <svg
          width="32"
          height="32"
          className="sm:w-[32px] sm:h-[32px] w-[24px] h-[24px]"
          viewBox="0 0 32 32"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M19.2402 7.90625L27.3336 15.9996L19.2402 24.0929"
            stroke="#20523C"
            strokeWidth="2"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M4.66602 16H27.106"
            stroke="#20523C"
            strokeWidth="2"
            strokeMiterlimit="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
};

export default ExchangeInfo;
