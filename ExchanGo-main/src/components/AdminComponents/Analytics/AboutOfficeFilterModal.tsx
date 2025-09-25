import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Location from "@/components/SvgIcons/Location";

interface AboutOfficeFilterModalProps {
  show: boolean;
  onClose: () => void;
  filters: {
    status: string;
    country: string;
    city: string[];
    dateRange: string;
  };
  onFilterChange: (
    filterType: keyof AboutOfficeFilterModalProps["filters"],
    value: string | string[]
  ) => void;
  onApply: () => void;
  onClear: () => void;
  availableCities: string[];
}

interface Option {
  value: string;
  label: string;
}

const AboutOfficeFilterModal: React.FC<AboutOfficeFilterModalProps> = ({
  show,
  onClose,
  filters,
  onFilterChange,
  onApply,
  onClear,
  availableCities,
}) => {
  const [isDurationDropdownOpen, setIsDurationDropdownOpen] = useState(false);
  const durationDropdownRef = useRef<HTMLDivElement>(null);
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  const durationOptions: Option[] = [
    { value: "alltime", label: "All time duration" },
    { value: "last7days", label: "Last 7 days" },
    { value: "last1month", label: "Last 1 month" },
    { value: "last6month", label: "Last 6 month" },
  ];

  const countryOptions: Option[] = [
    { value: "", label: "All Countries" },
    { value: "Pakistan", label: "Pakistan" },
    { value: "Morocco", label: "Morocco" },
  ];

  const [selectedDurationOption, setSelectedDurationOption] = useState<Option>({
    value: filters.dateRange,
    label:
      durationOptions.find((opt) => opt.value === filters.dateRange)?.label ||
      "Set Duration",
  });

  const [selectedCountryOption, setSelectedCountryOption] = useState<Option>({
    value: filters.country,
    label: filters.country || "All Countries",
  });

  useEffect(() => {
    setSelectedDurationOption({
      value: filters.dateRange,
      label:
        durationOptions.find((opt) => opt.value === filters.dateRange)?.label ||
        "Set Duration",
    });
  }, [filters.dateRange]);

  useEffect(() => {
    setSelectedCountryOption({
      value: filters.country,
      label: filters.country || "All Countries",
    });
  }, [filters.country]);

  const handleDurationOptionSelect = (option: Option) => {
    setSelectedDurationOption(option);
    onFilterChange("dateRange", option.value);
    setIsDurationDropdownOpen(false);
  };

  const handleCountryOptionSelect = (option: Option) => {
    setSelectedCountryOption(option);
    onFilterChange("country", option.value);
    setIsCountryDropdownOpen(false);
  };

  const handleDurationDropdownClick = () => {
    setIsDurationDropdownOpen((prev) => !prev);
  };

  const handleCountryDropdownClick = () => {
    setIsCountryDropdownOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        durationDropdownRef.current &&
        !durationDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDurationDropdownOpen(false);
      }
      if (
        countryDropdownRef.current &&
        !countryDropdownRef.current.contains(event.target as Node)
      ) {
        setIsCountryDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [durationDropdownRef, countryDropdownRef]);

  const [isCityDropdownOpen, setIsCityDropdownOpen] = useState(false);
  const [cityInput, setCityInput] = useState("");
  const cityFilterRef = useRef<HTMLDivElement>(null);
  const cityInputRef = useRef<HTMLInputElement>(null);
  const cityDropdownRef = useRef<HTMLDivElement>(null);

  const handleCityFilterClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsCityDropdownOpen((prev) => !prev);
  };

  const handleCityInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCityInput(value);
    if (value.trim()) {
      const suggestions = availableCities.filter((city) =>
        city.toLowerCase().includes(value.toLowerCase())
      );
      setIsCityDropdownOpen(suggestions.length > 0);
    } else {
      setIsCityDropdownOpen(false);
    }
  };

  const handleAddCity = (city: string) => {
    if (!filters.city.includes(city)) {
      onFilterChange("city", [...filters.city, city]);
    }
    setCityInput("");
    setIsCityDropdownOpen(false);
  };

  const handleRemoveCity = (city: string) => {
    onFilterChange(
      "city",
      filters.city.filter((c) => c !== city)
    );
  };

  const handleInputFocus = () => {
    setIsCityDropdownOpen(true);
  };

  if (!show) {
    return null;
  }

  return (
    <div className="fixed bottom-0 inset-0 bg-black/40 flex items-center justify-center z-50 px-5">
      <div className="bg-white absolute bottom-0 sm:static rounded-t-lg sm:rounded-lg mx-auto w-full max-w-[529px]">
        <div className=" w-full max-w-[42px] mx-auto">
          <button
            onClick={onClose}
            className="bg-[#E3E3E3] h-[5px] w-[42px] rounded-full mt-2 sm:hidden block"
          ></button>
        </div>
        <div className="flex justify-between items-center mb-8 px-5 sm:px-10 pt-[13px] sm:py-[18px] sm:border-b border-[#DEDEDE]">
          <h3 className="text-[20px] leading-[24px] font-bold text-[#111111]">
            Filter
          </h3>
          <button
            onClick={onClear}
            className="text-[#20523C] cursor-pointer text-[14px] leading-[20px] font-bold sm:hidden block"
          >
            Clear All
          </button>
          <button
            onClick={onClose}
            className="text-gray-500 cursor-pointer hover:text-gray-700 sm:block hidden"
          >
            <Image
              src="/assets/close-modal.svg"
              alt="close"
              width={24}
              height={24}
            />
          </button>
        </div>

        <div className="space-y-6 px-5 sm:px-10">
          <div className="w-full relative" ref={countryDropdownRef}>
            <label className="absolute -top-2 left-2.5 bg-white px-1.5 text-xs leading-[17px] font-medium text-[#111111]">
              Filter by Country
            </label>
            <button
              className="border border-[#DEDEDE] cursor-pointer rounded-lg h-[56px] px-4 flex items-center justify-between gap-2 text-[#585858] text-[14px] font-normal leading-[20px] w-full"
              onClick={handleCountryDropdownClick}
            >
              {selectedCountryOption.label}
              <svg
                className={`transition-transform duration-200 ${
                  isCountryDropdownOpen ? "" : "-rotate-180"
                }`}
                width="19"
                height="19"
                viewBox="0 0 19 19"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.1456 11.4435L10.1881 6.48598C9.60262 5.90051 8.64457 5.90051 8.0591 6.48598L3.10156 11.4435"
                  stroke="currentColor"
                  strokeWidth="1.14054"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* On desktop */}
            {isCountryDropdownOpen && (
              <div
                className="mt-3 py-1 bg-white w-full absolute top-[50px] z-40 rounded-md border border-gray-200 hidden lg:block"
                style={{
                  boxShadow:
                    "0px 5px 5px 0px #00000029, 0px 4px 4px 0px #00000014",
                }}
                role="listbox"
              >
                {countryOptions.map((option, index) => (
                  <button
                    key={option.value}
                    className={`w-full cursor-pointer py-2.5 text-left px-4 text-[#585858] text-[14px] font-normal leading-[20px] hover:bg-[#F1F1F1] transition-colors duration-150 ${
                      index < countryOptions.length - 1
                        ? "border-b border-[#DEDEDE]"
                        : ""
                    } ${
                      option.label === selectedCountryOption.label
                        ? "bg-[#F1F1F1]"
                        : ""
                    }`}
                    onClick={() => handleCountryOptionSelect(option)}
                    role="option"
                    aria-selected={option.label === selectedCountryOption.label}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}

            {/* On mobile */}
            {isCountryDropdownOpen && (
              <div
                className="lg:hidden fixed inset-0 z-50 modal-backdrop"
                style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                onClick={() => setIsCountryDropdownOpen(false)}
              >
                <div
                  className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[20px] shadow-2xl transform transition-transform duration-300 ease-out"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-center pt-2 pb-[19px]">
                    <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                  </div>
                  <div className="space-y-1 mb-6">
                    {countryOptions.map((option, index) => (
                      <button
                        key={option.value}
                        onClick={() => handleCountryOptionSelect(option)}
                        className={`px-5 w-full cursor-pointer text-left py-3 text-[14px] font-normal leading-[20px] text-[#111111] border-b border-[#DEDEDE] transition-colors hover:bg-[#F1F1F1] ${
                          option.label === selectedCountryOption.label
                            ? "bg-[#F1F1F1]"
                            : ""
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <label className="absolute -top-2 left-2.5 bg-white px-1.5 text-xs leading-[17px] font-medium text-[#111111]">
              City
            </label>
            <div
              className="flex items-center min-h-[56px] py-2.5 border border-[#DEDEDE] rounded-lg px-4 cursor-text w-full text-left"
              onClick={handleCityFilterClick}
              ref={cityFilterRef}
            >
              <Location />
              <div className="ml-1.5 flex items-center flex-wrap gap-2 flex-grow">
                {filters.city.map((city) => (
                  <div
                    key={city}
                    className="flex items-center bg-white border border-[#DEDEDE] rounded-full h-[29px] px-3 text-[14px] leading-[17px] font-normal text-[#111111]"
                  >
                    {city}
                    <button
                      className="ml-1 focus:outline-none cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveCity(city);
                      }}
                    >
                      <Image
                        src="/assets/close-modal.svg"
                        alt="remove"
                        width={16}
                        height={16}
                      />
                    </button>
                  </div>
                ))}
                <input
                  type="text"
                  className="flex-1 outline-none text-[#585858] text-[14px] smaller font-normal leading-[20px] min-w-[100px] bg-transparent"
                  placeholder={
                    filters.city.length === 0 && cityInput === ""
                      ? "Type city"
                      : ""
                  }
                  value={cityInput}
                  onChange={handleCityInputChange}
                  ref={cityInputRef}
                  onFocus={handleInputFocus}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
              <svg
                className={`text-[#292D32] transition-transform duration-200 ${
                  isCityDropdownOpen ? "" : "-rotate-180"
                }`}
                width="19"
                height="19"
                viewBox="0 0 19 19"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M15.1456 11.4435L10.1881 6.48598C9.60262 5.90051 8.64457 5.90051 8.0591 6.48598L3.10156 11.4435"
                  stroke="currentColor"
                  strokeWidth="1.14054"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>

            {isCityDropdownOpen && (
              <div
                className="py-1 absolute z-30 w-full bg-white border border-[#DEDEDE] rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto"
                ref={cityDropdownRef}
              >
                {availableCities
                  .filter((city) =>
                    city.toLowerCase().includes(cityInput.toLowerCase())
                  )
                  .map((city) => (
                    <button
                      key={city}
                      type="button"
                      className="w-full text-left cursor-pointer px-4 py-2.5 text-[#585858] text-[14px] font-normal leading-[20px] hover:bg-[#F1F1F1] border-b border-[#DEDEDE] last:border-b-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddCity(city);
                      }}
                    >
                      {city}
                    </button>
                  ))}
              </div>
            )}
            <p className="mt-2 text-[12px] leading-[17px] font-normal text-[#585858]">
              *You can select multiple cities
            </p>
          </div>

          <div>
            <label className="block text-[16px] font-bold leading-[16px] text-[#111111] mb-4">
              Status
            </label>
            <div className="flex space-x-2">
              <button
                className={`px-4 py-3 rounded-[1000px] text-[14px] leading-[17px] font-normal cursor-pointer ${
                  filters.status === "Validated"
                    ? "bg-[#A7F0BA] text-[#159536] border border-[#159536]"
                    : "border border-[#DEDEDE] text-[#111111]"
                }`}
                onClick={() => onFilterChange("status", "Validated")}
              >
                Validated
              </button>
              <button
                className={`px-4 py-3 rounded-[1000px] text-[14px] leading-[17px] font-normal cursor-pointer ${
                  filters.status === "Pending"
                    ? "bg-[#9EF0F0] text-[#088888] border border-[#088888]"
                    : "border border-[#DEDEDE] text-[#111111]"
                }`}
                onClick={() => onFilterChange("status", "Pending")}
              >
                Pending
              </button>
              <button
                className={`px-4 py-3 rounded-[1000px]  text-[14px] leading-[17px] font-normal  cursor-pointer ${
                  filters.status === "Rejected"
                    ? "bg-[#E0E0E0] border border-[#E0E0E0] text-[#777777]"
                    : "border border-[#DEDEDE] text-[#111111]"
                }`}
                onClick={() => onFilterChange("status", "Rejected")}
              >
                Rejected
              </button>
            </div>
          </div>

          <div>
            <div className="w-full relative" ref={durationDropdownRef}>
              <label className="absolute -top-2 left-2.5 bg-white px-1.5 text-xs leading-[17px] font-medium text-[#111111]">
                Duration on the platform
              </label>
              <div
                className="flex items-center min-h-[56px] py-2.5 border border-[#DEDEDE] rounded-lg px-4 cursor-pointer w-full text-left"
                onClick={handleDurationDropdownClick}
              >
                <div className="flex-grow text-[#585858] text-[14px] font-normal leading-[20px]">
                  {selectedDurationOption.label}
                </div>
                <svg
                  className={`text-[#292D32] transition-transform duration-200 ${
                    isDurationDropdownOpen ? "" : "-rotate-180"
                  }`}
                  width="19"
                  height="19"
                  viewBox="0 0 19 19"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M15.1456 11.4435L10.1881 6.48598C9.60262 5.90051 8.64457 5.90051 8.0591 6.48598L3.10156 11.4435"
                    stroke="currentColor"
                    strokeWidth="1.14054"
                    strokeMiterlimit="10"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              {isDurationDropdownOpen && (
                <div className="py-1 absolute z-10 w-full bg-white sm:block hidden border border-[#DEDEDE] rounded-md shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {durationOptions.map((option, index) => (
                    <button
                      key={option.value}
                      className={`w-full text-left px-4 py-2.5 cursor-pointer text-[#585858] text-[14px] font-normal leading-[20px] hover:bg-[#F1F1F1] ${
                        index < durationOptions.length - 1
                          ? "border-b border-[#DEDEDE]"
                          : ""
                      }`}
                      onClick={() => handleDurationOptionSelect(option)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}

              {/* On mobile */}
              {isDurationDropdownOpen && (
                <div
                  className="lg:hidden fixed inset-0 z-50 modal-backdrop"
                  style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
                  onClick={() => setIsCountryDropdownOpen(false)}
                >
                  <div
                    className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[20px] shadow-2xl transform transition-transform duration-300 ease-out"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-center pt-2 pb-[10px]">
                      <div className="w-12 h-1 bg-gray-300 rounded-full"></div>
                    </div>
                    <div className="space-y-1 mb-6">
                      {durationOptions.map((option, index) => (
                        <button
                          key={option.value}
                          onClick={() => handleDurationOptionSelect(option)}
                          className={`px-5 w-full cursor-pointer text-left py-3 text-[14px] font-normal leading-[20px] text-[#111111] border-b border-[#DEDEDE] transition-colors hover:bg-[#F1F1F1] ${
                            option.label === selectedCountryOption.label
                              ? "bg-[#F1F1F1]"
                              : ""
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 sm:mt-8 w-full sm:border-t border-[#DEDEDE] px-5 sm:px-10 pb-7 sm:py-5 flex justify-between space-x-3">
          <button
            onClick={onClear}
            className="px-5 h-[46px] cursor-pointer sm:block hidden border border-[#20523C] rounded-lg text-[#20523C] text-[16px] leading-[22px] font-medium hover:bg-[#20523C] hover:text-white transition duration-300"
          >
            Clear All
          </button>
          <button
            onClick={onApply}
            className="sm:w-fit w-full px-6 h-[40px] sm:h-[46px] cursor-pointer rounded-md relative text-[#20523C] text-[16px] font-semibold leading-[22px]"
            style={{
              background:
                "radial-gradient(65.83% 94.77% at 50.34% 116.3%, #C3F63C 0%, #54D10E 100%)",
              border: "1px solid rgba(255, 255, 255, 0.4)",
              boxShadow:
                "0px 4px 4px 0px #FFFFFF52 inset, 0px -4px 4px 0px #FFFFFF52 inset",
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutOfficeFilterModal;
