"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { getCurrencySymbol } from "@/utils/currencyUtils";

interface CustomMapMarkerProps {
  rate: string | number;
  imageSrc: string;
  isSelected?: boolean;
  isBestOffice?: boolean;
  // Add rates data from API instead of just targetCurrency
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
  targetCurrency: {
    code: string;
    symbol: string;
  };
}

const CustomMapMarker: React.FC<CustomMapMarkerProps> = ({
  rate,
  imageSrc,
  isSelected = false,
  isBestOffice = false,
  rates = [], // Add rates from API
  targetCurrency = { code: "", symbol: "" },
}) => {
  const [isHovered, setIsHovered] = useState(false);

  // Combine the local hover state with the isSelected prop that will be driven by the context
  const isHighlighted = isHovered || isSelected;

  // Best office gets the same highlighting as normal offices
  const isBestOfficeHighlighted = isHighlighted;

  // Get the target currency from the rates data for dynamic symbol display
  // const getTargetCurrencyFromRates = () => {
  //   if (!rates || rates.length === 0) return "MAD"; // Default fallback

  //   // Get the first active rate's target currency
  //   const activeRate = rates.find((rate) => rate.isActive);
  //   if (activeRate) {
  //     return activeRate.targetCurrency.code;
  //   }

  //   return "MAD"; // Default fallback
  // };

  // const dynamicTargetCurrency = getTargetCurrencyFromRates();

  // Apply animation effect when selected state changes
  useEffect(() => {
    const markerElement = document.getElementById(`marker-${rate}`);
    if (markerElement && isSelected) {
      markerElement.classList.add("marker-bounce");
      setTimeout(() => {
        markerElement.classList.remove("marker-bounce");
      }, 800);
    }
  }, [isSelected, rate]);

  return (
    <div
      id={`marker-${rate}`}
      className={`relative flex flex-col items-center justify-center group cursor-pointer ${
        isSelected ? "z-10" : "z-1"
      }`}
    >
      <div
        className={`relative rounded-full shadow-md flex items-center justify-center w-[44px] h-[44px] ${
          isSelected ? "scale-110" : ""
        }`}
        style={{
          background: isHighlighted ? "#3BEE5C" : "white",
          border: `3px solid ${isHighlighted ? "#3BEE5C" : "white"}`,
          boxShadow: `inset 0 0 0 2px ${
            isHighlighted ? "white" : "#e5e7eb"
          }, 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)`,
          transform: isSelected ? "scale(1.1)" : "scale(1)",
          transformOrigin: "center bottom",
          willChange: "transform",
        }}
      >
        <div
          className="absolute inset-0 flex items-center justify-center cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative w-5 h-5">
            <Image
              src={isHighlighted ? "/assets/X-white-logo.svg" : imageSrc}
              alt="Exchange office"
              width={20}
              height={20}
              className="object-contain"
            />
          </div>
        </div>
      </div>

      <div className="absolute -top-12 flex flex-col items-center">
        <div
          className={`px-3 py-2 ${
            isHighlighted ? "bg-[#333] text-white" : "bg-white text-[#333]"
          } rounded-lg shadow-lg text-sm text-nowrap font-medium ${
            isHighlighted ? "scale-110 shadow-xl" : ""
          } border ${isHighlighted ? "border-[#333]" : "border-gray-200"}`}
        >
          {(() => {
            const n = typeof rate === "number" ? rate : parseFloat(String(rate));
            const text = Number.isFinite(n) ? n.toFixed(2) : String(rate);
            if (targetCurrency.symbol) {
              return (
                <>
                  {targetCurrency.symbol} {text}
                </>
              );
            }
            return <>{text}</>;
          })()}
        </div>
        <div
          className={`w-0 h-0 border-l-[8px] border-r-[8px] border-t-[10px] border-l-transparent border-r-transparent ${
            isHighlighted ? "border-t-[#333]" : "border-t-white"
          }`}
          style={{
            filter: isHighlighted
              ? "drop-shadow(0 2px 4px rgba(0,0,0,0.1))"
              : "drop-shadow(0 1px 2px rgba(0,0,0,0.1))",
          }}
        />
      </div>

      <style jsx>{`
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .marker-bounce {
          animation: bounce 0.8s ease;
        }
      `}</style>
    </div>
  );
};

export default CustomMapMarker;
