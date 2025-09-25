"use client";
import React, { useState, useRef, useEffect } from "react";
import { currencies, Currency } from "../../../data/currencies";
import CityRankingTable from "./CityRankingTable";
import CurrencyDropdown from "./CheckRates/Dropdowns";
import { fetchCityRankingData } from "../../../services/api";

const CityRanking: React.FC = () => {
  // Default: EUR -> MAD
  const [fromCurrency, setFromCurrency] = useState<string>("EUR");
  const [toCurrency, setToCurrency] = useState<string>("MAD");
  const [fromDropdownOpen, setFromDropdownOpen] = useState<boolean>(false);
  const [toDropdownOpen, setToDropdownOpen] = useState<boolean>(false);
  const [amount, setAmount] = useState<string>("1");
  const [rankingData, setRankingData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fromDropdownRef = useRef<HTMLDivElement>(null);
  const toDropdownRef = useRef<HTMLDivElement>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch ranking data when component mounts or parameters change
    const fetchRankingData = async () => {
      try {
        setIsLoading(true);
        const data = await fetchCityRankingData({
          baseCurrencyCode: fromCurrency,
          targetCurrencyCode: toCurrency,
          amount: parseFloat(amount),
        });
        setRankingData(data);
      } catch (error) {
        console.error("Error fetching ranking data:", error);
        // Optionally set a default or empty array
        setRankingData([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRankingData();
  }, [fromCurrency, toCurrency, amount]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        fromDropdownRef.current &&
        !fromDropdownRef.current.contains(event.target as Node)
      ) {
        setFromDropdownOpen(false);
      }
      if (
        toDropdownRef.current &&
        !toDropdownRef.current.contains(event.target as Node)
      ) {
        setToDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleFromCurrencySelect = (currency: Currency): void => {
    const newFrom = currency.code;
    setFromDropdownOpen(false);

    if (newFrom === toCurrency) {
      // If the user selects the same currency, swap them.
      // `toCurrency` is the old `fromCurrency` value because state hasn't updated yet.
      setToCurrency(fromCurrency);
    } else if (newFrom !== "MAD" && toCurrency !== "MAD") {
      // If the new pair doesn't contain MAD, force 'to' to be MAD.
      setToCurrency("MAD");
    }
    setFromCurrency(newFrom);
  };

  const handleToCurrencySelect = (currency: Currency): void => {
    const newTo = currency.code;
    setToDropdownOpen(false);

    if (newTo === fromCurrency) {
      // Swap currencies. `fromCurrency` becomes the old `toCurrency`.
      setFromCurrency(toCurrency);
    } else if (newTo !== "MAD" && fromCurrency !== "MAD") {
      // If the new pair doesn't contain MAD, force 'from' to be MAD.
      setFromCurrency("MAD");
    }
    setToCurrency(newTo);
  };

  const handleFromDropdownToggle = (): void => {
    setFromDropdownOpen(!fromDropdownOpen);
    setToDropdownOpen(false);
  };

  const handleToDropdownToggle = (): void => {
    setToDropdownOpen(!toDropdownOpen);
    setFromDropdownOpen(false);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setAmount(e.target.value);
  };

  const getCurrencySymbol = (currencyCode: string): string => {
    const currency = currencies.find((c) => c.code === currencyCode);
    return currency?.symbol || currencyCode;
  };

  return (
    <div
      className="w-full py-[60px] md:py-[120px] px-5 md:px-8 bg-no-repeat bg-center bg-[url('/assets/city-ranking-bg.webp')]"
    >
      <div className="text-center max-w-[910px] mx-auto w-full">
        <h4 className="text-[#20523C] text-[14px] sm:text-[16px] leading-[14px] sm:leading-[16px] font-medium">
          City Ranking
        </h4>
        <h1 className="text-[#111111] text-[24px] sm:text-[32px] leading-[29px] sm:leading-[38px] font-bold mt-2 sm:mt-2.5 mb-4">
          Today's Best Rates
        </h1>
        <p className="text-[#585858] text-[14px] sm:text-[18px] leading-[20px] sm:leading-[25px] font-normal max-w-[510px] mx-auto">
          Track real-time exchange rates and never miss the best deal. Stay
          informed and exchange smarter!
        </p>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 text-left">
          <div
            ref={fromDropdownRef}
            className="bg-white rounded-[18px] border border-[#DEDEDE] px-8 py-[25px] cursor-pointer"
          >
            <CurrencyDropdown
              currencies={currencies}
              selectedCurrency={
                currencies.find((c) => c.code === fromCurrency)!
              }
              onCurrencyChange={handleFromCurrencySelect}
              isOpen={fromDropdownOpen}
              onToggle={handleFromDropdownToggle}
              label="Change from"
            />
          </div>

          <div
            ref={toDropdownRef}
            className="bg-white rounded-[18px] border border-[#DEDEDE] px-8 py-[25px] cursor-pointer"
          >
            <CurrencyDropdown
              currencies={currencies}
              selectedCurrency={currencies.find((c) => c.code === toCurrency)!}
              onCurrencyChange={handleToCurrencySelect}
              isOpen={toDropdownOpen}
              onToggle={handleToDropdownToggle}
              label="Change to"
            />
          </div>
          {/* Amount Input on Desktop */}
          <div
            className="md:block hidden border border-[#DEDEDE] bg-white rounded-[18px] px-8 py-[25px] cursor-pointer"
            onClick={() =>
              amountInputRef.current && amountInputRef.current.focus()
            }
          >
            <h4 className="text-[#111111] text-[14px] leading-[20px] font-medium mb-1">
              Amount
            </h4>
            <div className="flex items-center gap-1">
              <span className="text-[#585858] text-[18px] font-normal leading-[25px]">
                {getCurrencySymbol(fromCurrency)}
              </span>
              <input
                ref={amountInputRef}
                type="number"
                value={amount}
                onChange={handleAmountChange}
                className="flex-1 text-[#111111] placeholder:text-[#111111] text-[18px] font-normal leading-[25px] outline-none bg-transparent"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Amount Input on mobile */}
          <div className="block md:hidden mt-2 w-full relative bg-[#F6F6F6] border border-[#DEDEDE] rounded-lg px-4 h-[46.64px]">
            <label className="absolute -top-2 left-2.5 bg-[#F6F6F6] px-1.5 text-[12px] leading-[17px] font-medium text-[#111111]">
              Amount
            </label>
            <div className="h-full flex items-center justify-between gap-1">
              <span className="text-[#585858] text-[14px] leading-[20px]">
                {getCurrencySymbol(fromCurrency)}
              </span>
              <input
                type="number"
                placeholder="1"
                className="outline-none text-[#111111] placeholder:text-[#111111] smaller text-[14px] leading-[20px] bg-transparent w-full"
                value={amount}
                onChange={handleAmountChange}
              />
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="mt-6 text-center">
            <span>Loading ranking data...</span>
          </div>
        ) : (
          <CityRankingTable
            rankingData={rankingData.slice(0, 5)}
            fromCurrency={fromCurrency}
            toCurrency={toCurrency}
            amount={amount}
          />
        )}
      </div>
    </div>
  );
};

export default CityRanking;
