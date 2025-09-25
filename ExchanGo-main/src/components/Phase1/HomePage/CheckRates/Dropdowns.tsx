import React, { useState, useEffect, useRef } from "react";
import { currencies, Currency } from "@/data/currencies";

interface CurrencyDropdownProps {
    label: string;
    selectedCurrency: Currency;
    onCurrencyChange: (currency: Currency) => void;
    placeholder?: string;
    isOpen: boolean;
    onToggle: () => void;
    currencies?: Currency[];
}

const CurrencyDropdown: React.FC<CurrencyDropdownProps> = ({
    label,
    selectedCurrency,
    onCurrencyChange,
    placeholder = "type of search",
    isOpen,
    onToggle,
    currencies: customCurrencies,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const dropdownRef = useRef<HTMLDivElement>(null);
    const dropdownListRef = useRef<HTMLDivElement>(null);
    const [showUpArrow, setShowUpArrow] = useState(false);
    const [showDownArrow, setShowDownArrow] = useState(false);

    const currencyList = customCurrencies || currencies;
    const filteredCurrencies = currencyList.filter((currency) =>
        currency.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                isOpen
            ) {
                onToggle();
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [isOpen, onToggle]);

    useEffect(() => {
        if (!isOpen) return;
        const el = dropdownListRef.current;
        if (!el) return;

        const updateArrows = () => {
            if (!el) return;
            setShowUpArrow(el.scrollTop > 0);
            setShowDownArrow(el.scrollTop + el.clientHeight < el.scrollHeight);
        };

        updateArrows();
        el.addEventListener("scroll", updateArrows);
        window.addEventListener("resize", updateArrows);

        return () => {
            el.removeEventListener("scroll", updateArrows);
            window.removeEventListener("resize", updateArrows);
        };
    }, [isOpen, filteredCurrencies.length]);

    const handleSelect = (currency: Currency) => {
        onCurrencyChange(currency);
        onToggle();
        setSearchTerm("");
    };

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <label className="block text-[#111111] text-[12px] sm:text-[14px] font-medium leading-[17px] sm:leading-[20px] mb-1">
                {label}
            </label>

            <div
                className={`w-full flex items-center justify-between cursor-pointer`}
                onClick={onToggle}
            >
                <div className="flex items-center gap-1.5 flex-1">
                    {!isOpen && (
                        <img
                            src={selectedCurrency.flag}
                            alt={selectedCurrency.code}
                            className="rounded-full w-[18px] h-[18px] object-cover"
                        />
                    )}
                    {isOpen ? (
                        <input
                            type="text"
                            placeholder={placeholder}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="flex-1 text-[14px] sm:text-[18px] leading-[20px] smaller sm:leading-[25px] font-normal text-[#9CA3AF] truncate w-[120px] bg-transparent border-none outline-none placeholder:text-[#ACACAC]"
                            autoFocus
                        />
                    ) : (
                        <span className="text-[#585858] mt-0.5 text-[14px] sm:text-[18px] leading-[20px] sm:leading-[25px] font-normal">
                            {selectedCurrency.code}
                        </span>
                    )}
                </div>

                <svg
                    width="25"
                    height="25"
                    className={` transition-transform ${isOpen ? "rotate-180" : ""}`}
                    viewBox="0 0 25 25"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M20.8595 9.74207L14.2495 16.3521C13.4689 17.1327 12.1915 17.1327 11.4108 16.3521L4.80078 9.74207"
                        stroke="#292D32"
                        strokeWidth="1.52072"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>

            {/* Dropdown Menu */}
            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 p-1 bg-white border border-black/10 rounded-xl z-50 shadow-lg min-w-[220px]">
                    {/* Top Arrow */}
                    {showUpArrow && (
                        <div
                            className="flex justify-center cursor-pointer"
                            onMouseEnter={() => {
                                if (dropdownListRef.current) {
                                    dropdownListRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                                }
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#292D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-up h-5 w-5" aria-hidden="true"><path d="m18 15-6-6-6 6"></path></svg>
                        </div>
                    )}
                    {/* Dropdown List */}
                    <div
                        ref={dropdownListRef}
                        className="max-h-64 overflow-y-auto hide-scrollbar"
                        style={{ scrollBehavior: "smooth" }}
                    >
                        {filteredCurrencies.map((currency) => (
                            <button
                                key={currency.code}
                                onClick={() => handleSelect(currency)}
                                className={`
                  w-full flex items-center hover:bg-[#dcff8c] px-2 py-2 transition-colors rounded-md
                  ${currency.code === selectedCurrency.code
                                        ? ""
                                        : ""}
                  text-left
                `}
                            >
                                <span className="w-6 flex justify-center items-center mr-2">
                                    {currency.code === selectedCurrency.code && (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check h-4 w-4" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>
                                    )}
                                </span>
                                {/* Flag */}
                                <img
                                    src={currency.flag}
                                    alt={currency.code}
                                    className="rounded-full w-6 h-6 object-cover mr-3"
                                />
                                {/* Code and Name */}
                                <div className="flex flex-col items-start">
                                    <span className="font-semibold text-[15px] text-[#111] leading-tight">{currency.code}</span>
                                    <span className="text-xs text-gray-500">{currency.name}</span>
                                </div>
                            </button>
                        ))}
                    </div>
                    {/* Bottom Arrow */}
                    {showDownArrow && (
                        <div
                            className="flex justify-center cursor-pointer"
                            onMouseEnter={() => {
                                if (dropdownListRef.current) {
                                    dropdownListRef.current.scrollTo({ top: dropdownListRef.current.scrollHeight, behavior: 'smooth' });
                                }
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#292D32" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-down h-5 w-5" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CurrencyDropdown;