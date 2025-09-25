import Image from "next/image";
import React, { useState, useRef, useEffect, ReactNode } from "react";

export interface DropdownOption {
  flag: ReactNode;
  id: string | number;
  label: string;
  icon?: string;
  value?: any;
}

export interface DropdownProps {
  options: DropdownOption[];
  placeholder?: string;
  selectedOption?: DropdownOption | null;
  onSelect: (option: DropdownOption) => void;
  width?: string;
  disabled?: boolean;
  className?: string;
  dropdownClassName?: string;
}

export const currency = [
  { id: "aud", label: "AUD", value: "AUD" },
  { id: "eur", label: "EUR", value: "EUR" },
  { id: "usd", label: "USD", value: "USD" },
  { id: "gip", label: "GIP", value: "GIP" },
  { id: "qar", label: "QAR", value: "QAR" },
  { id: "cad", label: "CAD", value: "CAD" },
  { id: "gbp", label: "GBP", value: "GBP" },
  { id: "bhd", label: "BHD", value: "BHD" },
  { id: "omr", label: "OMR", value: "OMR" },
  { id: "sar", label: "SAR", value: "SAR" },
  { id: "aed", label: "AED", value: "AED" },
  { id: "chf", label: "CHF", value: "CHF" },
  { id: "jpy", label: "JPY", value: "JPY" },
  { id: "kwd", label: "KWD", value: "KWD" },
];

export const getFlagCode = (currencyCodeOrName: string) => {
  // Use ISO 3166-1 alpha-2 code for flagcdn, fallback to label in lowercase
  // Map known currency codes to country codes
  const map: Record<string, string> = {
    USD: "us",
    EUR: "eu",
    GBP: "gb",
    AUD: "au",
    CAD: "ca",
    CHF: "ch",
    JPY: "jp",
    KWD: "kw",
    BHD: "bh",
    OMR: "om",
    SAR: "sa",
    AED: "ae",
    QAR: "qa",
    GIP: "gi",
    // Add name-to-code mappings for better fallback
    "US Dollar": "us",
    Euro: "eu",
    "British Pound": "gb",
    "Australian Dollar": "au",
    "Canadian Dollar": "ca",
    "Swiss Franc": "ch",
    "Japanese Yen": "jp",
    "Kuwaiti Dinar": "kw",
    "Bahraini Dinar": "bh",
    "Omani Rial": "om",
    "Saudi Riyal": "sa",
    "UAE Dirham": "ae",
    "Qatari Riyal": "qa",
    "Gibraltar Pound": "gi",
  };

  // Try to get the country code from the map
  const code = map[currencyCodeOrName];

  // If found, return it, otherwise convert to uppercase (for currency codes) and try again
  if (code) return code;

  const upperCaseCode = currencyCodeOrName.toUpperCase();
  return map[upperCaseCode] || currencyCodeOrName.toLowerCase();
};

const SelectCurrencyDropdown: React.FC<DropdownProps> = ({
  options,
  placeholder = "Select...",
  selectedOption = null,
  onSelect,
  width = "100%",
  disabled = false,
  className = "",
  dropdownClassName = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleOptionSelect = (option: DropdownOption) => {
    onSelect(option);
    setIsOpen(false);
  };

  const displayText = selectedOption ? selectedOption.label : placeholder;
  const shouldTruncate = displayText.length > 12;

  return (
    <div className="w-full">
      {selectedOption ? (
        <div
          className={`flex cursor-pointer items-center gap-1.5 md:border-0 border border-[#DEDEDE] rounded-lg h-[42px] px-2.5 md:px-0 ${className}`}
        >
          <span className="flex items-center h-[24px] w-[24px]">
            <Image
              src={`https://flagcdn.com/w20/${getFlagCode(
                selectedOption.label
              )}.png`}
              alt={selectedOption.label}
              width={1280}
              height={720}
              className="rounded-full flex-shrink-0 object-cover h-full w-full"
              onError={(e: any) => {
                e.target.onerror = null;
                e.target.src = selectedOption.icon || "";
              }}
            />
          </span>
          <span className="text-[#111111] text-[14px] font-normal leading-[17px]">
            {selectedOption.label}
          </span>
        </div>
      ) : (
        <div
          className={`w-full relative cursor-pointer ${className}`}
          ref={dropdownRef}
        >
          <button
            onClick={handleToggle}
            disabled={disabled}
            className={`w-full cursor-pointer border border-[#20523C] bg-white h-[42px] rounded-lg flex items-center justify-center gap-2 text-[#585858] text-[14px] font-normal leading-[20px] pl-4 pr-2 transition-colors duration-200 ${
              disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
            }`}
            style={{ width }}
          >
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              <span className={shouldTruncate ? "truncate" : ""}>
                {displayText}
              </span>
            </div>
            <svg
              width="25"
              height="25"
              viewBox="0 0 25 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`transition-transform duration-200 flex-shrink-0 ${
                isOpen ? "" : "rotate-180"
              }`}
            >
              <path
                d="M20.1994 15.52L13.5893 8.90994C12.8087 8.1293 11.5313 8.1293 10.7507 8.90994L4.14062 15.52"
                stroke="#292D32"
                strokeWidth="1.52072"
                strokeMiterlimit="10"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {/* Dropdown options */}
          {isOpen && (
            <div
              className={`py-1 h-[140px] overflow-y-auto bg-white w-full absolute top-[50px] z-50 rounded-md border border-gray-200 overflow-visible ${dropdownClassName}`}
              style={{
                boxShadow:
                  "0px 5px 5px 0px #00000029, 0px 4px 4px 0px #00000014",
              }}
            >
              {options.map((option, index) => {
                const isLast = index === options.length - 1;
                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(option)}
                    className={`py-2.5 pl-4 w-full cursor-pointer flex items-center gap-1.5 text-[14px] leading-[20px] font-normal text-[#585858] transition-colors duration-150 hover:bg-gray-50 text-left ${
                      !isLast ? "border-b border-[#DEDEDE]" : ""
                    }`}
                  >
                    <span className="flex items-center h-[18px] w-[18px]">
                      <Image
                        src={`https://flagcdn.com/w20/${getFlagCode(
                          option.label
                        )}.png`}
                        alt={option.label}
                        width={1280}
                        height={720}
                        className="rounded-full flex-shrink-0 object-cover h-full w-full"
                        onError={(e: any) => {
                          e.target.onerror = null;
                          e.target.src = option.icon || "";
                        }}
                      />
                    </span>
                    <span className="truncate">{option.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectCurrencyDropdown;
