"use client";

import Image from "next/image";
import type React from "react";
import { type ChangeEvent, useState, useEffect, useRef, Suspense } from "react";
import { currencies, type Currency } from "@/data/currencies";
import mapboxgl from "mapbox-gl";
import { useRouter, useSearchParams } from "next/navigation";
import Loader from "../../../ui/Loader";
import LocationDropdown from "./Location";
import CurrencyDropdown from "./Dropdowns";
import AmountInput from "./Amount";
import { motion } from "framer-motion";

mapboxgl.accessToken =
  "pk.eyJ1IjoiZXhjaGFuZ28yNCIsImEiOiJjbWJobzNtbXkwYzd2MmtzZ3M0Nmlhem1wIn0.WWU3U5Ur4wsdKokNEk1DZQ";

interface Location {
  id: string;
  name: string;
  country: string;
  flag: string;
  region?: string;
  coordinates?: {
    lng: number;
    lat: number;
  };
}

// Common Moroccan cities
const moroccanCities: Location[] = [
  {
    id: "casablanca",
    name: "Casablanca",
    country: "Morocco",
    flag: "/assets/mad.svg",
  },
  {
    id: "rabat",
    name: "Rabat",
    country: "Morocco",
    flag: "/assets/mad.svg",
  },
  {
    id: "marrakech",
    name: "Marrakech",
    country: "Morocco",
    flag: "/assets/mad.svg",
  },
  {
    id: "agadir",
    name: "Agadir",
    country: "Morocco",
    flag: "/assets/mad.svg",
  },
  {
    id: "tanger",
    name: "Tanger",
    country: "Morocco",
    flag: "/assets/mad.svg",
  },
];

const CheckRates = () => {
  const componentRef = useRef<HTMLDivElement>(null);
  const searchParams = useSearchParams();
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(
    null
  );
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [amountError, setAmountError] = useState(false);
  const [isSwapping, setIsSwapping] = useState(false);
  const router = useRouter();
  const [amount, setAmount] = useState<string>("1");
  const [sourceCurrency, setSourceCurrency] = useState<Currency>(
    currencies.find((c) => c.code === "EUR")!
  );
  const [targetCurrency, setTargetCurrency] = useState<Currency>(
    currencies.find((c) => c.code === "MAD")!
  );

  useEffect(() => {
    // Get location from URL parameters
    const locationParam = searchParams.get("location");
    if (locationParam) {
      // Find the matching city in our predefined list
      const foundCity = moroccanCities.find(
        (city) => city.name.toLowerCase() === locationParam.toLowerCase()
      );
      if (foundCity) {
        setSelectedLocation(foundCity);
      }
      // Scroll to this component
      if (componentRef.current) {
        setTimeout(() => {
          componentRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 500);
      }
    }
  }, [searchParams]);

  const handleSourceCurrencyChange = (currency: Currency) => {
    if (currency.code === targetCurrency.code) {
      // If the user selects the same currency, swap them.
      setTargetCurrency(sourceCurrency);
    } else if (currency.code !== "MAD" && targetCurrency.code !== "MAD") {
      // If the new pair doesn't contain MAD, force 'to' to be MAD.
      setTargetCurrency(currencies.find((c) => c.code === "MAD")!);
    }
    setSourceCurrency(currency);
  };

  const handleTargetCurrencyChange = (currency: Currency) => {
    if (currency.code === sourceCurrency.code) {
      // Swap currencies.
      setSourceCurrency(targetCurrency);
    } else if (currency.code !== "MAD" && sourceCurrency.code !== "MAD") {
      // If the new pair doesn't contain MAD, force 'from' to be MAD.
      setSourceCurrency(currencies.find((c) => c.code === "MAD")!);
    }
    setTargetCurrency(currency);
  };

  const handleAmountChange = (e: ChangeEvent<HTMLInputElement>): void => {
    const value: string = e.target.value;
    if (value === "" || /^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
    if (amountError) {
      setAmountError(false);
    }
  };

  const handleSwapCurrencies = () => {
    setIsSwapping(true);
    const temp = sourceCurrency;
    setSourceCurrency(targetCurrency);
    setTargetCurrency(temp);
    setTimeout(() => setIsSwapping(false), 300);
  };

  const handleCheckRates = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!amount) {
      setAmountError(true);
      return;
    }
    setIsLoading(true);
    const href = `/results?source=${sourceCurrency.code}&target=${
      targetCurrency.code
    }&amount=${amount}&location=${selectedLocation?.name ?? "Casablanca"}${
      selectedLocation?.coordinates
        ? `&lat=${selectedLocation.coordinates.lat}&lng=${selectedLocation.coordinates.lng}`
        : ""
    }`;
    setTimeout(() => {
      router.push(href);
    }, 1500);
  };

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Loader isLoading={isLoading} />
      <div
        ref={componentRef}
        className="py-5 md:py-8 -mt-[40px] md:-mt-[55px] px-6 rounded-[16px] bg-white w-full max-w-[1240px] mx-auto"
        style={{
          boxShadow: "0px 20px 80px 0px #0000001A, 0px 4px 4px 0px #00000014",
        }}
      >
        <div className="h-full w-full flex items-center max-w-[1160px] mx-auto gap-3 md:gap-5 flex-wrap justify-center md:justify-start">
          {/* Location Dropdown */}
          <div className="w-full md:w-[250px] md:max-w-[250px] md:pb-0 pb-3 border-b md:border-b-0 md:border-r border-[#D1D1D1] md:pr-4">
            <LocationDropdown
              label="Location"
              selectedLocation={selectedLocation}
              onLocationChange={setSelectedLocation}
              placeholder="Search location"
              isOpen={openDropdown === "location"}
              onToggle={() =>
                setOpenDropdown(openDropdown === "location" ? null : "location")
              }
            />
          </div>

          {/* Amount to exchange */}
          <div className="w-full md:w-[200px] md:max-w-[200px] md:pb-0 pb-3 border-b md:border-b-0 md:border-r border-[#D1D1D1]">
            <AmountInput
              value={amount}
              onChange={handleAmountChange}
              error={amountError}
              symbol={sourceCurrency.symbol}
            />
          </div>

          {/* Currency Swap Section */}
          <div className="w-full md:w-fit flex items-center sm:flex-row flex-col sm:gap-5 h-full">
            <motion.div
              className="w-full md:w-[200px] md:max-w-[200px] pb-3 sm:pb-0"
              animate={isSwapping ? { x: [0, 20, 0], scale: [1, 0.95, 1] } : {}}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <motion.div
                animate={isSwapping ? { opacity: [1, 0.7, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <CurrencyDropdown
                  label="Source Currency"
                  selectedCurrency={sourceCurrency}
                  onCurrencyChange={handleSourceCurrencyChange}
                  placeholder="type of search"
                  isOpen={openDropdown === "source"}
                  onToggle={() =>
                    setOpenDropdown(openDropdown === "source" ? null : "source")
                  }
                />
              </motion.div>
            </motion.div>

            {/* Swap Button */}
            <div className="relative flex items-center justify-center sm:h-[49px] w-full gap-4 sm:gap-0 sm:min-w-[32px] sm:w-[32px]">
              <div className="w-full bg-[#DEDEDE] h-[1px] sm:hidden"></div>
              <motion.button
                onClick={handleSwapCurrencies}
                disabled={isSwapping}
                aria-label="Swap currencies"
                className="cursor-pointer bg-white relative z-40 rounded-full p-2 hover:bg-gray-50 transition-colors duration-200"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                animate={isSwapping ? { rotate: 35 } : { rotate: 0 }}
                transition={{
                  duration: 0.5,
                  ease: "easeInOut",
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                }}
              >
                <motion.div
                  animate={
                    isSwapping
                      ? {
                          scale: [1, 1.2, 1],
                          filter: [
                            "hue-rotate(0deg)",
                            "hue-rotate(45deg)",
                            "hue-rotate(0deg)",
                          ],
                        }
                      : {}
                  }
                  transition={{ duration: 0.4 }}
                >
                  <Image
                    src="/assets/exchange-rotate.svg"
                    alt="refresh-circle"
                    width={32.44}
                    height={32.44}
                    className="min-w-[32.44px] p-1.5 bg-green-50 rounded-full border border-[#D1D1D1] h-[32.44px]"
                  />
                </motion.div>
              </motion.button>
              <div className="w-full bg-[#DEDEDE] h-[1px] sm:hidden"></div>
              <div className="h-[49px] w-[2px] bg-[#D1D1D1] absolute top-0 left-4 sm:block hidden"></div>
            </div>

            <motion.div
              className="w-full md:w-[200px] md:max-w-[200px] pb-3 sm:pb-0"
              animate={
                isSwapping ? { x: [0, -20, 0], scale: [1, 0.95, 1] } : {}
              }
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <motion.div
                animate={isSwapping ? { opacity: [1, 0.7, 1] } : {}}
                transition={{ duration: 0.3 }}
              >
                <CurrencyDropdown
                  label="Target Currency"
                  selectedCurrency={targetCurrency}
                  onCurrencyChange={handleTargetCurrencyChange}
                  placeholder="type of search"
                  isOpen={openDropdown === "target"}
                  onToggle={() =>
                    setOpenDropdown(openDropdown === "target" ? null : "target")
                  }
                  currencies={currencies}
                />
              </motion.div>
            </motion.div>
          </div>

          {/* Check Rates Button */}
          <button
            onClick={handleCheckRates}
            disabled={isLoading}
            className="sm:mt-0 mt-1 text-nowrap flex sm:w-fit w-full items-center gap-2 justify-center px-4 sm:px-6 h-10 sm:h-[46px] cursor-pointer rounded-md relative text-[#20523C] text-[14px] sm:text-[16px] font-semibold leading-[22px]"
            style={{
              background:
                "radial-gradient(65.83% 94.77% at 50.34% 116.3%, #C3F63C 0%, #54D10E 100%)",
              border: "1px solid rgba(255, 255, 255, 0.4)",
              boxShadow:
                "0px 4px 4px 0px #FFFFFF52 inset, 0px -4px 4px 0px #FFFFFF52 inset",
            }}
          >
            <Image src="/assets/clock.svg" alt="clock" width={18} height={18} />
            Check Rates
          </button>
        </div>
      </div>
    </Suspense>
  );
};

export default CheckRates;
