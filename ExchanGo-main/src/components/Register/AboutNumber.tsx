"use client";

import type React from "react";
import { useState, useEffect, useCallback, useRef } from "react";
import PhoneInput from "react-phone-number-input";
import { isValidPhoneNumber } from "react-phone-number-input";
import "react-phone-number-input/style.css";
import "../../styles/phone-input.css";

interface PhoneNumber {
  countryCode: string;
  number: string;
  fullNumber?: string;
}

interface AboutNumberProps {
  onChange?: (
    numbers: {
      primary: PhoneNumber;
      whatsapp: PhoneNumber;
      other?: PhoneNumber;
    },
    isWhatsAppSame?: boolean
  ) => void;
  onValidityChange?: (isValid: boolean) => void;
  showErrors?: boolean;
}

const AboutNumber: React.FC<
  AboutNumberProps & {
    initialValues?: {
      primaryNumber?: string;
      whatsappNumber?: string;
      isWhatsAppSame?: boolean;
      otherNumber?: string;
    };
  }
> = ({ onChange, onValidityChange, showErrors = false, initialValues }) => {
  // Add debug logging
  console.log("AboutNumber: initialValues received:", initialValues);

  const [isWhatsAppSame, setIsWhatsAppSame] = useState<boolean>(
    initialValues?.isWhatsAppSame || false
  );
  const [showOtherNumber, setShowOtherNumber] = useState<boolean>(
    !!initialValues?.otherNumber
  );
  const [errors, setErrors] = useState<{
    primary?: string;
    whatsapp?: string;
    other?: string;
  }>({});

  const [primaryNumber, setPrimaryNumber] = useState<string>(
    initialValues?.primaryNumber || ""
  );
  const [whatsappNumber, setWhatsappNumber] = useState<string>(
    initialValues?.whatsappNumber || ""
  );
  const [otherNumber, setOtherNumber] = useState<string>(
    initialValues?.otherNumber || ""
  );

  // Log the state values after initialization
  useEffect(() => {
    console.log("AboutNumber: initialized state values:", {
      primaryNumber,
      whatsappNumber,
      otherNumber,
      isWhatsAppSame
    });
  }, []);

  // Initialize values from props only on first render
  // Use a ref to track if we've already initialized
  const initializedRef = useRef(false);
  
  useEffect(() => {
    // Only initialize from props on the first render
    if (!initializedRef.current && initialValues) {
      console.log("AboutNumber: Initializing from props first time");
      if (initialValues.primaryNumber) setPrimaryNumber(initialValues.primaryNumber);
      if (initialValues.whatsappNumber) setWhatsappNumber(initialValues.whatsappNumber);
      if (initialValues.otherNumber) {
        setOtherNumber(initialValues.otherNumber);
        setShowOtherNumber(true);
      }
      if (initialValues.isWhatsAppSame !== undefined) setIsWhatsAppSame(initialValues.isWhatsAppSame);
      
      initializedRef.current = true;
    }
  }, [initialValues]);
  
  // Remove the old effect that was overwriting user edits
  // useEffect(() => {
  //   if (initialValues) {
  //     console.log("AboutNumber: initialValues changed, updating state:", initialValues);
  //     if (initialValues.primaryNumber) setPrimaryNumber(initialValues.primaryNumber);
  //     if (initialValues.whatsappNumber) setWhatsappNumber(initialValues.whatsappNumber);
  //     if (initialValues.otherNumber) setOtherNumber(initialValues.otherNumber);
  //     if (initialValues.isWhatsAppSame !== undefined) setIsWhatsAppSame(initialValues.isWhatsAppSame);
  //     if (initialValues.otherNumber) setShowOtherNumber(true);
  //   }
  // }, [initialValues]);

  const onChangeRef = useRef(onChange);
  const onValidityChangeRef = useRef(onValidityChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onValidityChangeRef.current = onValidityChange;
  }, [onValidityChange]);

  const parsePhoneNumber = (phoneNumber: string): PhoneNumber => {
    if (!phoneNumber) {
      return { countryCode: "+212", number: "", fullNumber: "" };
    }

    const match = phoneNumber.match(/^(\+\d{1,4})(.*)$/);
    if (match) {
      return {
        countryCode: match[1],
        number: match[2],
        fullNumber: phoneNumber,
      };
    }

    return {
      countryCode: "+212",
      number: phoneNumber,
      fullNumber: phoneNumber,
    };
  };

  useEffect(() => {
    if (isWhatsAppSame) {
      setWhatsappNumber(primaryNumber);
    }
  }, [isWhatsAppSame, primaryNumber]);

  useEffect(() => {
    const newErrors: { primary?: string; whatsapp?: string; other?: string } =
      {};

    // --- PRIMARY ---
    if (!primaryNumber) {
      newErrors.primary = "Primary phone number is required";
    } else if (!isValidPhoneNumber(primaryNumber)) {
      newErrors.primary = "Please enter a valid phone number";
    }

    // --- WHATSAPP ---
    if (!isWhatsAppSame) {
      if (!whatsappNumber) {
        newErrors.whatsapp = "WhatsApp number is required";
      } else if (!isValidPhoneNumber(whatsappNumber)) {
        newErrors.whatsapp = "Please enter a valid WhatsApp number";
      }
    }

    // --- OTHER ---
    if (showOtherNumber && otherNumber) {
      if (!isValidPhoneNumber(otherNumber)) {
        newErrors.other = "Please enter a valid phone number";
      }
    }

    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;

    if (onValidityChangeRef.current) {
      onValidityChangeRef.current(isValid);
    }

    // Only call onChange if initialization is complete
    // This prevents unnecessary calls during the initialization phase
    if (initializedRef.current && onChangeRef.current) {
      const effectiveWhatsapp = isWhatsAppSame ? primaryNumber : whatsappNumber;

      // Parse phone numbers to include countryCode and number
      const parsePrimaryNumber = parsePhoneNumber(primaryNumber);
      const parseWhatsappNumber = parsePhoneNumber(effectiveWhatsapp);
      const parseOtherNumber = parsePhoneNumber(otherNumber);

      onChangeRef.current(
        {
          primary: parsePrimaryNumber,
          whatsapp: parseWhatsappNumber,
          ...(showOtherNumber && otherNumber
            ? { other: parseOtherNumber }
            : {}),
        },
        isWhatsAppSame
      );
    }
  }, [
    primaryNumber,
    whatsappNumber,
    otherNumber,
    isWhatsAppSame,
    showOtherNumber,
  ]);

  const handleCheckboxChange = useCallback((checked: boolean): void => {
    setIsWhatsAppSame(checked);
  }, []);

  const handleAddNewNumber = useCallback((): void => {
    setShowOtherNumber(true);
  }, []);

  const handleCancelNewNumber = useCallback((): void => {
    setShowOtherNumber(false);
    setOtherNumber("");
  }, []);

  return (
    <div className="w-full space-y-6">
      <div className="w-full">
        <div className="relative bg-white border border-[#DEDEDE] rounded-lg">
          <label className="absolute -top-2 left-2.5 bg-white text-[#111111] px-1.5 text-xs leading-[17px] font-medium z-10">
            Primary Phone Number
          </label>
          <div className="p-4">
            <PhoneInput
              international
              defaultCountry="MA"
              value={primaryNumber}
              onChange={(value) => setPrimaryNumber(value || "")}
              className="phone-input-custom"
              placeholder="e.g. 612345678"
              countrySelectProps={{
                className: "country-select-custom",
              }}
              numberInputProps={{
                className: "number-input-custom",
              }}
            />
          </div>
        </div>
        {showErrors && errors.primary && (
          <p className="mt-2 text-red-500 text-xs md:text-sm text-left">
            {errors.primary}
          </p>
        )}
      </div>

      <div className="flex items-start md:items-center justify-between gap-4">
        <div className="flex items-start md:items-center gap-1.5">
          <div
            className={`w-4 h-4 border border-[#DEDEDE] rounded cursor-pointer flex items-center justify-center mt-0.5 md:mt-0 transition-colors ${
              isWhatsAppSame
                ? "bg-[#20523C] border-[#20523C]"
                : "bg-white hover:border-[#20523C]"
            }`}
            onClick={() => handleCheckboxChange(!isWhatsAppSame)}
            role="checkbox"
            aria-checked={isWhatsAppSame}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleCheckboxChange(!isWhatsAppSame);
              }
            }}
          >
            {isWhatsAppSame && (
              <svg
                width="10"
                height="8"
                viewBox="0 0 10 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1 4L3.5 6.5L9 1"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </div>
          <label
            className="text-[#585858] text-[12px] leading-[17px] font-normal text-left cursor-pointer"
            onClick={() => handleCheckboxChange(!isWhatsAppSame)}
          >
            Is this also your WhatsApp number?
          </label>
        </div>

        <div className="flex items-start md:items-center gap-4">
          {!showOtherNumber ? (
            <button
              type="button"
              onClick={handleAddNewNumber}
              className="text-[#20523C] text-[12px] text-nowrap sm:text-[14px] leading-[17px] sm:leading-[20px] font-medium cursor-pointer flex items-center gap-1 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#20523C] focus:ring-opacity-50 rounded"
            >
              <svg
                width="17"
                height="18"
                viewBox="0 0 17 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.16406 9H13.6263"
                  stroke="#20523C"
                  strokeWidth="1.01381"
                  strokeLinecap="round"
                />
                <path
                  d="M8.89062 13.731V4.2688"
                  stroke="#20523C"
                  strokeWidth="1.01381"
                  strokeLinecap="round"
                />
              </svg>
              Add new Number
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCancelNewNumber}
              className="text-[#20523C] text-[14px] leading-[20px] font-medium cursor-pointer flex items-center gap-1 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-[#20523C] focus:ring-opacity-50 rounded"
            >
              <svg
                width="17"
                height="18"
                viewBox="0 0 17 18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.16406 9H13.6263"
                  stroke="#20523C"
                  strokeWidth="1.01381"
                  strokeLinecap="round"
                />
              </svg>
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="w-full">
        <div className="relative bg-white border border-[#DEDEDE] rounded-lg">
          <label className="absolute -top-2 left-2.5 text-[#111111] bg-white px-1.5 text-xs leading-[17px] font-medium z-10">
            WhatsApp Number
          </label>
          <div className="p-4">
            <PhoneInput
              international
              defaultCountry="MA"
              value={isWhatsAppSame ? primaryNumber : whatsappNumber}
              onChange={(value) =>
                !isWhatsAppSame && setWhatsappNumber(value || "")
              }
              className={`phone-input-custom ${
                isWhatsAppSame ? "opacity-50" : ""
              }`}
              placeholder="Type your WhatsApp number"
              disabled={isWhatsAppSame}
              countrySelectProps={{
                className: "country-select-custom",
                disabled: isWhatsAppSame,
              }}
              numberInputProps={{
                className: "number-input-custom",
                disabled: isWhatsAppSame,
              }}
            />
          </div>
        </div>
        {showErrors && errors.whatsapp && (
          <p className="mt-2 text-red-500 text-xs md:text-sm text-left">
            {errors.whatsapp}
          </p>
        )}
      </div>

      {showOtherNumber && (
        <div className="w-full">
          <div className="relative bg-white border border-[#DEDEDE] rounded-lg">
            <label className="absolute -top-2 left-2.5 bg-white px-1.5 text-xs leading-[17px] font-medium text-[#111111] z-10">
              Other Number
            </label>
            <div className="p-4">
              <PhoneInput
                international
                defaultCountry="MA"
                value={otherNumber}
                onChange={(value) => setOtherNumber(value || "")}
                className="phone-input-custom"
                placeholder="Type your other number"
                countrySelectProps={{
                  className: "country-select-custom",
                }}
                numberInputProps={{
                  className: "number-input-custom",
                }}
              />
            </div>
          </div>
          {showErrors && errors.other && (
            <p className="mt-2 text-red-500 text-xs md:text-sm text-left">
              {errors.other}
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default AboutNumber;
