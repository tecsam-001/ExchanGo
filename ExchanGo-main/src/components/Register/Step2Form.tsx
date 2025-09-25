"use client";
import React, { useState, useEffect } from "react";
import CustomInput from "../ui/CustomInput";
import ImageUpload from "../ImageUpload";
import AboutNumber from "./AboutNumber";
import Image from "next/image";
import GradientButton from "../ui/GradientButton";
import { uploadFile, searchCities } from "@/services/api";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";

interface FormData {
  email: string;
  password: string;
  officeName: string;
  registrationNumber: string;
  licenseNumber: string;
  streetAddress: string;
  city: string;
  cityId: string;
  cityName: string;
  province: string;
  phoneNumber: string;
  whatsappNumber: string;
  otherNumber?: string;
  isWhatsAppSame?: boolean;
  logo?: string | { id: string; file?: any };
  logoPreviewUrl?: string;
}

interface PhoneNumber {
  countryCode: string;
  number: string;
}

interface PhoneNumbers {
  primary: PhoneNumber;
  whatsapp: PhoneNumber;
  other?: PhoneNumber;
}

interface City {
  id: string;
  name: string;
  country?: {
    name: string;
    emoji: string;
  };
}

interface Step2FormProps {
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNext: (formData: FormData) => void;
  handleStepChange: (step: number) => void;
  setFormData: React.Dispatch<React.SetStateAction<FormData>>;
}

const Step2Form: React.FC<Step2FormProps> = ({
  formData,
  handleInputChange,
  handleNext,
  handleStepChange,
  setFormData,
}) => {
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<{
    [key: string]: string;
  }>({});
  const [showErrors, setShowErrors] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPhoneNumbersValid, setIsPhoneNumbersValid] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState<string>("");
  const [citySearchResults, setCitySearchResults] = useState<City[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState<boolean>(false);
  const [citySearchTimeout, setCitySearchTimeout] =
    useState<NodeJS.Timeout | null>(null);
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<
    string | null | undefined
  >(null);

  // Check if user is authenticated
  useEffect(() => {
    const token =
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken");
    if (!token) {
      toast.error("Authentication required. Please complete step 1 first.");
      handleStepChange(1);
    }

    // Check if we have a logo preview URL directly in formData
    if (formData.logoPreviewUrl) {
      setLogoPreviewUrl(formData.logoPreviewUrl);
    }
    // Otherwise check if we have a logo in formData and set the preview URL
    else if (formData.logo) {
      if (typeof formData.logo === "string") {
        // If logo is a string URL, use it directly
        setLogoPreviewUrl(formData.logo);
      } else if (typeof formData.logo === "object" && formData.logo.id) {
        // If logo is an object with ID, construct the URL
        // Use the API base URL to construct the image URL
        const baseUrl = "https://exchango.opineomanager.com";
        setLogoPreviewUrl(`${baseUrl}/files/${formData.logo.id}`);
      }
    }
  }, [formData.logo, formData.logoPreviewUrl, handleStepChange]);

  // Helper to parse phone number for AboutNumber initial values
  const parseNumber = (full: string) => {
    if (!full || !full.startsWith("+"))
      return { countryCode: "+212", number: "", full: "" };
    const code = full.slice(0, 4);
    const number = full.slice(4);
    return { countryCode: code, number, full };
  };

  // For AboutNumber initial values
  const aboutNumberInitialValues = {
    primaryNumber: formData.phoneNumber || "",
    whatsappNumber: formData.whatsappNumber || "",
    isWhatsAppSame:
      typeof formData.isWhatsAppSame === "boolean"
        ? formData.isWhatsAppSame
        : !!(
            formData.phoneNumber &&
            formData.whatsappNumber &&
            formData.phoneNumber === formData.whatsappNumber
          ),
    otherNumber: formData.otherNumber || "",
  };

  const handleImageUpload = async (file: File, previewUrl: string) => {
    setUploadedFile(file);
    setError("");
    // Save the preview URL to state so we can display it
    setLogoPreviewUrl(previewUrl);

    try {
      setIsUploading(true);

      // Check if token exists
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      if (!token) {
        console.error("No authentication token found");
        toast.error("Authentication required. Please complete step 1 first.");
        handleStepChange(1);
        return;
      }

      console.log("Uploading file with token:", token.substring(0, 10) + "...");

      // Upload the file to the server
      const response = await uploadFile(file);

      if (!response.success) {
        // Check if unauthorized
        if (response.statusCode === 401) {
          console.error("Unauthorized response:", response);
          toast.error("Your session has expired. Please log in again.");
          // Clear storage and redirect to step 1
          localStorage.removeItem("authToken");
          sessionStorage.removeItem("authToken");
          handleStepChange(1);
          return;
        }

        console.error("Upload error response:", response);
        setError(
          response.message || "Failed to upload logo. Please try again."
        );
        toast.error(
          response.message || "Failed to upload logo. Please try again."
        );
        return;
      }

      console.log("Upload success response:", response.data);

      // Save the logo ID to formData
      const logoId = response.data.file.id;

      // Update formData with logo ID in the format needed for API
      const logoValue = { id: logoId };

      // Also save the preview URL to ensure we keep displaying the logo
      setFormData((prev) => ({
        ...prev,
        logo: logoValue,
        logoPreviewUrl: previewUrl, // Save preview URL in formData
      }));

      console.log("Logo value:", logoValue, logoId);

      toast.success("Logo uploaded successfully!");
    } catch (error) {
      console.error("Error uploading logo:", error);
      setError("An unexpected error occurred. Please try again.");
      toast.error(
        "An unexpected error occurred while uploading the logo. Please try again."
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleImageError = (errorMessage: string) => {
    setError(errorMessage);
    toast.error(errorMessage);
  };

  const handlePhoneNumbersChange = (
    numbers: {
      primary: { fullNumber?: string };
      whatsapp: { fullNumber?: string };
      other?: { fullNumber?: string };
    },
    isWhatsAppSame?: boolean
  ) => {
    console.log("Phone numbers received in Step2Form:", numbers);

    // Store the complete phone numbers in formData
    const updatedFormData = {
      ...formData,
      phoneNumber: numbers.primary.fullNumber || "",
      whatsappNumber: numbers.whatsapp.fullNumber || "",
      otherNumber: numbers.other?.fullNumber || "",
      isWhatsAppSame: isWhatsAppSame,
    };

    console.log("Updated formData with phone numbers:", updatedFormData);

    // Directly update the formData state
    setFormData(updatedFormData);
    setIsPhoneNumbersValid(true);
  };

  // Handle city search input change
  const handleCitySearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setCitySearchQuery(query);

    // Update the visible city name in the form
    const cityNameEvent = {
      target: {
        name: "cityName",
        value: query,
      },
    } as React.ChangeEvent<HTMLInputElement>;
    handleInputChange(cityNameEvent);

    // Clear previous timeout
    if (citySearchTimeout) {
      clearTimeout(citySearchTimeout);
    }

    // Set new timeout for API call
    if (query.length >= 2) {
      const timeout = setTimeout(() => {
        searchCitiesFromAPI(query);
      }, 500);
      setCitySearchTimeout(timeout);
      setShowCityDropdown(true);
    } else {
      setCitySearchResults([]);
      setShowCityDropdown(false);
    }
  };

  // Search cities from API
  const searchCitiesFromAPI = async (query: string) => {
    try {
      const response = await searchCities(query);
      if (response && response.id) {
        const cities = [
          {
            id: response.id,
            name: response.name,
            country: {
              name: response.country.name,
              emoji: response.country.emoji,
            },
          },
        ];
        setCitySearchResults(cities);
      } else {
        console.error("City search failed: No results found");
        setCitySearchResults([]);
      }
    } catch (error) {
      console.error("Error searching cities:", error);
      setCitySearchResults([]);
    }
  };

  // Handle city selection from dropdown
  const handleCitySelect = (city: City) => {
    console.log("City selected:", city);

    // Update form data directly with all city-related fields
    const updatedFormData = {
      ...formData,
      city: city.id, // Set city to the ID for API submission
      cityId: city.id, // Also set cityId to match the interface in Register.tsx
      cityName: city.name,
    };

    // Update the form data state
    setFormData(updatedFormData);

    // Clear any city field errors
    setFieldErrors((prev) => ({
      ...prev,
      city: "",
    }));

    // Hide dropdown
    setShowCityDropdown(false);
    setCitySearchQuery(city.name);

    console.log("Updated form data after city selection:", updatedFormData);
  };

  // Check if the form is valid
  const isFormValid = (data = formData) => {
    console.log("Checking form validity with data:", data);

    const errors: { [key: string]: string } = {};
    let isValid = true;

    // Validate required fields
    if (!data.officeName.trim()) {
      errors.officeName = "Office name is required";
      isValid = false;
    }

    if (!data.registrationNumber.trim()) {
      errors.registrationNumber = "Registration number is required";
      isValid = false;
    }

    if (!data.licenseNumber.trim()) {
      errors.licenseNumber = "License number is required";
      isValid = false;
    }

    if (!data.streetAddress.trim()) {
      errors.streetAddress = "Street address is required";
      isValid = false;
    }

    // For city, if we have either cityId or city, consider it
    const hasCity = !!(data.city && data.city.trim() !== "");

    // If either cityId or city is set, the city is considered selected
    if (!hasCity) {
      errors.city = "City selection is required";
      isValid = false;
    }

    if (!data.province.trim()) {
      errors.province = "Province is required";
      isValid = false;
    }

    if (!data.phoneNumber || !data.whatsappNumber) {
      errors.phoneNumber = "Phone numbers are required";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid && isPhoneNumbersValid;
  };

  const handleNextClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log("Current form data before validation:", formData);

    // Ensure phone numbers are properly set before submitting
    let currentFormData = { ...formData };
    if (!currentFormData.phoneNumber || !currentFormData.whatsappNumber) {
      console.log(
        "Phone numbers not set, checking if they're available in the form"
      );
      const phoneInputs = document.querySelectorAll(
        ".phone-input-custom input"
      );
      if (phoneInputs.length > 0) {
        console.log("Found phone inputs:", phoneInputs);
        // Try to get values directly from inputs
        const primaryPhone = (phoneInputs[0] as HTMLInputElement).value;
        const whatsappPhone = (phoneInputs[1] as HTMLInputElement).value;

        if (primaryPhone || whatsappPhone) {
          console.log("Found phone values in inputs:", {
            primaryPhone,
            whatsappPhone,
          });
          // Update formData with these values
          currentFormData = {
            ...currentFormData,
            phoneNumber: primaryPhone || currentFormData.phoneNumber,
            whatsappNumber: whatsappPhone || currentFormData.whatsappNumber,
          };
          setFormData(currentFormData);
        }
      }
    }

    // Check form validity
    if (!isFormValid(currentFormData)) {
      console.log("Form is not valid, showing errors");
      setShowErrors(true);
      toast.error("Please fill in all required fields");
      return;
    }

    // Prepare data for API submission
    const apiFormData = {
      ...currentFormData,
      // Ensure city is using the ID
      city: currentFormData.city,
      // Make sure cityId is set
      cityId: currentFormData.city || currentFormData.cityId || "",
      // Format logo as expected by API
      logo:
        typeof currentFormData.logo === "string"
          ? { id: currentFormData.logo }
          : currentFormData.logo,
      // Map to expected API field names
      currencyExchangeLicenseNumber: currentFormData.licenseNumber,
      address: currentFormData.streetAddress,
      primaryPhoneNumber: currentFormData.phoneNumber,
      secondaryPhoneNumber: currentFormData.otherNumber || "",
      thirdPhoneNumber: "",
      state: currentFormData.province,
      location: {
        type: "Point",
        coordinates: [-6.8416, 34.0084], // Default coordinates
      },
    };

    console.log(
      "Form is valid, proceeding to next step with data:",
      apiFormData
    );
    handleNext(apiFormData);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    handleNextClick(e as unknown as React.MouseEvent);
  };

  return (
    <div className="overflow-hidden w-full flex items-start md:flex-row flex-col justify-between max-w-[1440px] gap-8 mx-auto md:px-10 lg:px-20">
      <div className="flex-shrink-0 mt-2">
        <button
          onClick={() => handleStepChange(1)}
          className="flex items-center gap-1.5 text-[#111111] text-[18px] leading-[25px] font-normal cursor-pointer"
        >
          <Image
            src="/assets/arrow-back.svg"
            alt="arrow-back"
            width={24}
            height={24}
            className="rotate-180"
          />
          Back
        </button>
      </div>

      <div className="w-full text-center max-w-[398px] mx-auto ">
        <h3 className="text-[#111111] font-bold text-[24px] md:text-[32px] leading-[29px] md:leading-[38px] mb-2.5">
          Office Information
        </h3>
        <p className="text-[#585858] text-[14px] md:text-base leading-[20px] md:leading-[22px] mb-6 px-2">
          Let us know more about your office by completing the details below
        </p>

        <div className="">
          <ImageUpload
            onImageUpload={handleImageUpload}
            onError={handleImageError}
            maxSizeInMB={8}
            recommendedSize="256x256"
            acceptedFormats={[".png", ".jpeg", ".jpg", ".gif"]}
            initialPreview={logoPreviewUrl}
          />
          {error && (
            <div className="mt-2 text-red-500 text-xs md:text-sm text-left">
              {error}
            </div>
          )}
          <div className="mt-[28px]">
            <CustomInput
              type="text"
              name="officeName"
              label="Office Name"
              placeholder="Placeholder"
              value={formData.officeName}
              onChange={handleInputChange}
              required
            />
            {fieldErrors.officeName && (
              <div className="mt-1 text-red-500 text-xs md:text-sm text-left">
                {fieldErrors.officeName}
              </div>
            )}
          </div>

          <div className="mt-6">
            <CustomInput
              type="text"
              name="registrationNumber"
              label="Commercial Registration Number"
              placeholder="Placeholder"
              value={formData.registrationNumber}
              onChange={handleInputChange}
              required
            />
            {fieldErrors.registrationNumber && (
              <div className="mt-1 text-red-500 text-xs md:text-sm text-left">
                {fieldErrors.registrationNumber}
              </div>
            )}
          </div>

          <div className="mt-6">
            <CustomInput
              type="text"
              name="licenseNumber"
              label="Currency Exchange License Number"
              placeholder="Placeholder"
              value={formData.licenseNumber}
              onChange={handleInputChange}
              required
            />
            {fieldErrors.licenseNumber && (
              <div className="mt-1 text-red-500 text-xs md:text-sm text-left">
                {fieldErrors.licenseNumber}
              </div>
            )}
          </div>

          <div className="mt-6">
            <CustomInput
              type="text"
              name="streetAddress"
              label="Street Address"
              placeholder="Placeholder"
              value={formData.streetAddress}
              onChange={handleInputChange}
              required
            />
            {fieldErrors.streetAddress && (
              <div className="mt-1 text-red-500 text-xs md:text-sm text-left">
                {fieldErrors.streetAddress}
              </div>
            )}
          </div>

          <div className="w-full grid grid-cols-2 gap-6">
            <div className="mt-6 relative">
              <CustomInput
                type="text"
                name="cityName"
                label="City"
                placeholder="Search for a city"
                value={formData.cityName || citySearchQuery}
                onChange={handleCitySearchChange}
                required
              />
              {fieldErrors.city && (
                <div className="mt-1 text-red-500 text-xs md:text-sm text-left">
                  {fieldErrors.city}
                </div>
              )}
              {showCityDropdown && citySearchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 bg-white shadow-lg rounded-md mt-1 z-50 max-h-60 overflow-y-auto">
                  {citySearchResults.map((city) => (
                    <div
                      key={city.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                      onClick={() => handleCitySelect(city)}
                    >
                      <span>{city.name}</span>
                      {city.country && (
                        <span className="ml-2 text-sm text-gray-500">
                          {city.country.emoji} {city.country.name}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {/* Add hidden input to store the city ID */}
              <input type="hidden" name="city" value={formData.city || ""} />
            </div>

            <div className="mt-6">
              <CustomInput
                type="text"
                name="province"
                label="Province"
                placeholder="Placeholder"
                value={formData.province}
                onChange={handleInputChange}
                required
              />
              {fieldErrors.province && (
                <div className="mt-1 text-red-500 text-xs md:text-sm text-left">
                  {fieldErrors.province}
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <AboutNumber
              onChange={handlePhoneNumbersChange}
              onValidityChange={setIsPhoneNumbersValid}
              showErrors={showErrors}
              initialValues={aboutNumberInitialValues}
            />
          </div>

          <GradientButton className="mt-6 w-full" onClick={handleNextClick}>
            Next
          </GradientButton>
        </div>
      </div>
    </div>
  );
};

export default Step2Form;
