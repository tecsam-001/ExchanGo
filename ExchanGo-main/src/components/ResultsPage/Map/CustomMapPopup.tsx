import React from "react";
import Image from "next/image";
import { ExchangeOffice } from "../types";
import { getCurrencySymbol } from "@/utils/currencyUtils";

interface CustomMapPopupProps {
  office: ExchangeOffice;
  position: {
    lat: number;
    lng: number;
  };
}

const CustomMapPopup: React.FC<CustomMapPopupProps> = ({
  office,
  position,
}) => {
  // Get the target currency from the rates data for dynamic symbol display
  // const getTargetCurrencyFromRates = () => {
  //   if (!office.targetCurrency || office.targetCurrency.length === 0)
  //     return "kukukuku"; // Default fallback

  //   // Get the first active rate's target currency
  //   const activeRate = office.targetCurrency.find((rate) => rate.isActive);
  //   if (activeRate) {
  //     return activeRate.targetCurrency.symbol;
  //   }

  //   return "kukukuku"; // Default fallback
  // };

  // const dynamicTargetCurrency = getTargetCurrencyFromRates();

  return (
    <div className="flex flex-col py-2">
      <div className="space-y-3">
        <div className="flex flex-col">
          <h3 className="text-sm font-semibold">{office.officeName}</h3>
          <p className="text-sm font-bold text-green-500 mt-1">
            {office.targetCurrency?.symbol || "MAD"}{" "}
            {office.equivalentValue ?? office.buyRate ?? "N/A"}
          </p>
        </div>

        <div className="text-xs text-gray-600 space-y-1">
          <p>{office.address}</p>
          <p>
            {typeof office?.todayWorkingHours === "string"
              ? office?.todayWorkingHours
              : `${office?.todayWorkingHours?.fromTime} - ${office?.todayWorkingHours?.toTime}`}
          </p>
        </div>

        <div>
          <a
            href={`https://maps.google.com/maps?daddr=${position.lat},${position.lng}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-xs text-green-700 font-medium hover:underline"
          >
            <span>Get Direction</span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-1"
            >
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default CustomMapPopup;
