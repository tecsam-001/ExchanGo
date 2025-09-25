// Utility to prevent unwanted keys in number inputs
const preventInvalidNumberInput = (
  e: React.KeyboardEvent<HTMLInputElement>
) => {
  // Block comma, period, plus, minus, and numpad/IME equivalents
  if (
    e.key === "," ||
    e.key === "+" ||
    e.key === "-" ||
    e.key === "Decimal" ||
    e.key === "numpadDecimal" ||
    e.key === "Add" ||
    e.key === "Subtract"
  ) {
    e.preventDefault();
  }
};
import Image from "next/image";
import React, {
  useState,
  useEffect,
  forwardRef,
  useImperativeHandle,
  Dispatch,
  SetStateAction,
} from "react";
import SelectCurrencyDropdown, {
  currency,
  DropdownOption,
  getFlagCode,
} from "./SelectCurrencyDropdown";
import ToggleButton from "../ui/ToggleButton";
import { toast } from "react-toastify";
import {
  createOfficeRate,
  fetchOfficeRates,
  updateOfficeRate,
  deleteOfficeRate,
} from "@/services/api";

export interface CurrencyRate {
  id: string;
  currency: DropdownOption | null;
  buyingRateBase: number;
  buyingRateCustom: number;
  sellingRateBase: number;
  sellingRateCustom: number;
  isActive: boolean;
}

// API response interfaces
interface ApiCurrency {
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
}

interface ApiRate {
  id: string;
  baseCurrency: ApiCurrency;
  targetCurrency: ApiCurrency;
  buyRate: string;
  sellRate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ApiRatesResponse {
  lastUpdatedAt: string;
  rates: ApiRate[];
}

interface RateSettingProps {
  showTable: boolean;
  showTableView: boolean;
  setShowTable: React.Dispatch<React.SetStateAction<boolean>>;
  setShowTableView: React.Dispatch<React.SetStateAction<boolean>>;
  setIsUpdateDisabled: React.Dispatch<React.SetStateAction<boolean>>;
  currencyRates: CurrencyRate[];
  setCurrencyRates: Dispatch<SetStateAction<CurrencyRate[]>>;
  savedCurrencyRates: CurrencyRate[];
  setSavedCurrencyRates: Dispatch<SetStateAction<CurrencyRate[]>>;
}

export interface RateSettingHandles {
  updateCurrencies: () => void;
  handleEdit: () => void;
}

const RateSetting = forwardRef<RateSettingHandles, RateSettingProps>(
  (
    {
      showTable,
      showTableView,
      setShowTable,
      setShowTableView,
      setIsUpdateDisabled,
      currencyRates,
      setCurrencyRates,
      savedCurrencyRates,
      setSavedCurrencyRates,
    },
    ref
  ) => {
    const [lastUpdate, setLastUpdate] = useState<string>("");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [rateToDelete, setRateToDelete] = useState<CurrencyRate | null>(null);
    const [draggedItem, setDraggedItem] = useState<string | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [showAddNewCurrency, setShowAddNewCurrency] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [localIsUpdateDisabled, setLocalIsUpdateDisabled] = useState(true);

    // Simplified toast function that dismisses all existing toasts first
    const showToast = (
      message: string,
      type: "info" | "success" | "error" | "warning"
    ) => {
      // Dismiss ALL existing toasts first
      toast.dismiss();

      // Small delay to ensure toasts are properly dismissed
      setTimeout(() => {
        // Then show the new toast
        toast[type](message, {
          position: "top-right",
          autoClose: 2500,
        });
      }, 100);
    };

    // Loading toast with ID for updating
    const showLoadingToast = (message: string) => {
      // Dismiss ALL existing toasts first
      toast.dismiss();

      // Small delay to ensure toasts are properly dismissed
      setTimeout(() => {
        return toast.loading(message, {
          position: "top-right",
        });
      }, 100);
    };

    // Expose methods to parent component
    useImperativeHandle(ref, () => ({
      updateCurrencies,
      handleEdit,
    }));

    // Load rates from API on component mount
    useEffect(() => {
      loadRatesFromApi();
    }, []);

    // Sync the local state with the parent state
    useEffect(() => {
      // Keep the parent state in sync with our local state
      setIsUpdateDisabled(localIsUpdateDisabled);
    }, [localIsUpdateDisabled, setIsUpdateDisabled]);

    const loadRatesFromApi = async () => {
      setIsLoading(true);

      try {
        const response = await fetchOfficeRates();

        if (response.success && response.data) {
          const apiData = response.data as ApiRatesResponse;

          // Format the last update time
          if (apiData.lastUpdatedAt) {
            const updateDate = new Date(apiData.lastUpdatedAt);
            setLastUpdate(
              updateDate.toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "2-digit",
              }) +
                " - " +
                updateDate.toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: false,
                })
            );
          }

          // Convert API rates to component format
          if (apiData.rates && apiData.rates.length > 0) {
            const formattedRates: CurrencyRate[] = apiData.rates.map(
              (rate) => ({
                id: rate.id,
                currency: {
                  id: rate.targetCurrency.id,
                  label: rate.targetCurrency.name,
                  value: rate.targetCurrency.code,
                  flag: null, // Don't use API flag, use the component's flag handling
                },
                buyingRateBase: parseFloat(rate.buyRate),
                buyingRateCustom: parseFloat(rate.buyRate),
                sellingRateBase: parseFloat(rate.sellRate),
                sellingRateCustom: parseFloat(rate.sellRate),
                isActive: rate.isActive,
              })
            );

            setCurrencyRates(formattedRates);
            setSavedCurrencyRates(formattedRates);

            if (formattedRates.length > 0) {
              setShowTable(true);
              setShowTableView(true);
              setShowAddNewCurrency(false);
            }
          }
        } else {
          showToast("Failed to load exchange rates", "error");
        }
      } catch (error) {
        console.error("Error loading rates:", error);
        showToast("Failed to load exchange rates", "error");
      } finally {
        setIsLoading(false);
      }
    };

    const handleAddCurrency = () => {
      setShowTable(true);
      setIsEditMode(true);
      setShowAddNewCurrency(true);

      // Always add a new row when this function is called
        addNewCurrencyRow();
    };

    const addNewCurrencyRow = () => {
      // Keep the Add New Currency button visible
      setShowAddNewCurrency(true);
      const newRate: CurrencyRate = {
        id: Date.now().toString(),
        currency: null,
        buyingRateBase: 0,
        buyingRateCustom: 0,
        sellingRateBase: 0,
        sellingRateCustom: 0,
        isActive: false,
      };
      setCurrencyRates((prev) => [...prev, newRate]);
      setLocalIsUpdateDisabled(false);
    };

    const handleAddNewCurrencyToAPI = async () => {
      // Validate that all currencies are complete
      const incompleteCurrencies = currencyRates.filter(
        (rate) =>
          !rate.currency ||
          (!rate.buyingRateCustom && !rate.buyingRateBase) ||
          (!rate.sellingRateCustom && !rate.sellingRateBase)
      );

      if (incompleteCurrencies.length > 0) {
        showToast(
          "Please complete all currency details before saving",
          "error"
        );
        return;
      }

      // Use the same updateCurrencies function for consistency
      await updateCurrencies();
    };

    const handleCurrencySelect = (rateId: string, option: DropdownOption) => {
      setCurrencyRates((prev) =>
        prev.map((rate) =>
          rate.id === rateId ? { ...rate, currency: option } : rate
        )
      );

      // Find if this currency already exists in our saved rates
      const existingRate = savedCurrencyRates.find(
        (rate) => rate.currency?.value === option.value
      );

      if (existingRate) {
        // Use the existing rate values
        setCurrencyRates((prev) =>
          prev.map((rate) =>
            rate.id === rateId
              ? {
                  ...rate,
                  buyingRateBase: existingRate.buyingRateBase,
                  buyingRateCustom: existingRate.buyingRateCustom,
                  sellingRateBase: existingRate.sellingRateBase,
                  sellingRateCustom: existingRate.sellingRateCustom,
                }
              : rate
          )
        );
      } else {
        // Use mock base rates as fallback
      setTimeout(() => {
        const mockBaseRates: Record<
          string,
          { buying: number; selling: number }
        > = {
          GIP: { buying: 12.1, selling: 12.2 },
          QAR: { buying: 2.5, selling: 2.55 },
          CAD: { buying: 7.1, selling: 7.2 },
          GBP: { buying: 14.5, selling: 14.6 },
          BHD: { buying: 24.0, selling: 24.1 },
          OMR: { buying: 23.8, selling: 23.9 },
          SAR: { buying: 2.45, selling: 2.5 },
          AED: { buying: 2.65, selling: 2.7 },
          EUR: { buying: 11.0, selling: 11.1 },
          USD: { buying: 10.0, selling: 10.1 },
          CHF: { buying: 11.2, selling: 11.3 },
          JPY: { buying: 0.065, selling: 0.066 },
          KWD: { buying: 32.0, selling: 32.1 },
          AUD: { buying: 6.5, selling: 6.6 },
        };

        const baseRate = mockBaseRates[option.value as string];
        if (baseRate) {
          setCurrencyRates((prev) =>
            prev.map((rate) =>
              rate.id === rateId
                ? {
                    ...rate,
                    buyingRateBase: baseRate.buying,
                    buyingRateCustom: baseRate.buying,
                    sellingRateBase: baseRate.selling,
                    sellingRateCustom: baseRate.selling,
                  }
                : rate
            )
          );
        }
          setLocalIsUpdateDisabled(false);
      }, 500);
      }
    };

    const updateBuyingRate = (rateId: string, value: string) => {
      if (value === "") {
        setCurrencyRates((prev) =>
          prev.map((rate) =>
            rate.id === rateId ? { ...rate, buyingRateCustom: 0 } : rate
          )
        );
        setLocalIsUpdateDisabled(false);
        return;
      }

      const decimalIndex = value.indexOf(".");
      if (decimalIndex !== -1 && value.length - decimalIndex - 1 > 2) {
        const truncatedValue = value.substring(0, decimalIndex + 3);
        const numValue = parseFloat(truncatedValue) || 0;
        setCurrencyRates((prev) =>
          prev.map((rate) =>
            rate.id === rateId ? { ...rate, buyingRateCustom: numValue } : rate
          )
        );
      } else {
        const numValue = parseFloat(value) || 0;
        setCurrencyRates((prev) =>
          prev.map((rate) =>
            rate.id === rateId ? { ...rate, buyingRateCustom: numValue } : rate
          )
        );
      }
      setLocalIsUpdateDisabled(false);
    };

    const updateSellingRate = (rateId: string, value: string) => {
      if (value === "") {
        setCurrencyRates((prev) =>
          prev.map((rate) =>
            rate.id === rateId ? { ...rate, sellingRateCustom: 0 } : rate
          )
        );
        setLocalIsUpdateDisabled(false);
        return;
      }

      const decimalIndex = value.indexOf(".");
      if (decimalIndex !== -1 && value.length - decimalIndex - 1 > 2) {
        const truncatedValue = value.substring(0, decimalIndex + 3);
        const numValue = parseFloat(truncatedValue) || 0;
        setCurrencyRates((prev) =>
          prev.map((rate) =>
            rate.id === rateId ? { ...rate, sellingRateCustom: numValue } : rate
          )
        );
      } else {
        const numValue = parseFloat(value) || 0;
        setCurrencyRates((prev) =>
          prev.map((rate) =>
            rate.id === rateId ? { ...rate, sellingRateCustom: numValue } : rate
          )
        );
      }
      setLocalIsUpdateDisabled(false);
    };

    const toggleActive = (rateId: string, isActive: boolean) => {
      setCurrencyRates((prev) =>
        prev.map((rate) => (rate.id === rateId ? { ...rate, isActive } : rate))
      );
      setLocalIsUpdateDisabled(false);
    };

    const deleteRate = async (rateId: string) => {
      // Check if this is an existing rate from the API (has a saved version)
      const isExistingRate = savedCurrencyRates.some(
        (rate) => rate.id === rateId
      );

      if (isExistingRate) {
        try {
          // Show loading toast
          const loadingToastId = showLoadingToast("Deleting currency...");

          // Call the API to delete the rate
          const response = await deleteOfficeRate(rateId);

          // Dismiss all toasts including the loading one
          toast.dismiss();

          if (response.success) {
            // Remove from local state
            setCurrencyRates((prev) =>
              prev.filter((rate) => rate.id !== rateId)
            );

            // If this was the last rate, update UI state
            if (currencyRates.length === 1) {
              setShowTable(false);
              setIsEditMode(false);
            }

            // Show success toast
            showToast("Currency deleted successfully", "success");
          } else {
            // Show error toast
            showToast(
              `Failed to delete rate: ${response.message || "Unknown error"}`,
              "error"
            );
          }
        } catch (error) {
          console.error("Error deleting rate:", error);
          toast.dismiss(); // Ensure all toasts are dismissed
          showToast(
            "An unexpected error occurred while deleting the rate",
            "error"
          );
        }
      } else {
        // For new rates that haven't been saved to the API yet, just remove from local state
      setCurrencyRates((prev) => prev.filter((rate) => rate.id !== rateId));

      if (currencyRates.length === 1) {
        setShowTable(false);
        setIsEditMode(false);
        }
      }
    };

    const moveRate = (rateId: string, direction: "up" | "down") => {
      setCurrencyRates((prev) => {
        const index = prev.findIndex((rate) => rate.id === rateId);
        if (index === -1) return prev;

        const newIndex = direction === "up" ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= prev.length) return prev;

        const newRates = [...prev];
        const [removed] = newRates.splice(index, 1);
        newRates.splice(newIndex, 0, removed);
        return newRates;
      });
      setLocalIsUpdateDisabled(false);
    };

    const getAvailableCurrencies = (currentRateId: string) => {
      const selectedCurrencies = currencyRates
        .filter((rate) => rate.id !== currentRateId && rate.currency)
        .map((rate) => rate.currency!.id);

      return currency.filter((curr) => !selectedCurrencies.includes(curr.id));
    };

    const handleDragStart = (
      e: React.DragEvent<HTMLDivElement>,
      rateId: string
    ) => {
      setDraggedItem(rateId);
      e.currentTarget.classList.add("opacity-50");
    };

    const handleDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
      e.currentTarget.classList.remove("opacity-50");
      setDraggedItem(null);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
    };

    const handleDrop = (
      e: React.DragEvent<HTMLDivElement>,
      targetId: string
    ) => {
      e.preventDefault();
      if (!draggedItem || draggedItem === targetId) return;

      setCurrencyRates((prev) => {
        const items = [...prev];
        const draggedIndex = items.findIndex((item) => item.id === draggedItem);
        const targetIndex = items.findIndex((item) => item.id === targetId);

        const [draggedItemContent] = items.splice(draggedIndex, 1);
        items.splice(targetIndex, 0, draggedItemContent);

        return items;
      });
      setLocalIsUpdateDisabled(false);
    };

    const resetRates = () => {
      // Reset to saved state or clear if nothing saved
      if (savedCurrencyRates.length > 0) {
        setCurrencyRates([...savedCurrencyRates]);
        setShowTableView(true);
        setIsEditMode(false);
        setShowAddNewCurrency(false);
        showToast("Changes reset successfully", "info");
      } else {
        setCurrencyRates([]);
        setShowTable(false);
        setShowAddNewCurrency(true);
      }

      setLocalIsUpdateDisabled(true);
    };

    const updateCurrencies = async () => {
      // Create a deep copy of the current rates to ensure clean objects
      const ratesCopy = currencyRates.map((rate) => ({
        id: rate.id,
        currency: rate.currency,
        buyingRateBase: rate.buyingRateBase,
        buyingRateCustom: rate.buyingRateCustom,
        sellingRateBase: rate.sellingRateBase,
        sellingRateCustom: rate.sellingRateCustom,
        isActive: rate.isActive,
      }));

      try {
        // Show loading toast
        const loadingToastId = showLoadingToast("Updating rates...");

        // Separate new rates (no API ID) from existing rates (have API ID)
        const newRates = ratesCopy.filter(
          (rate) => !savedCurrencyRates.some((saved) => saved.id === rate.id)
        );
        const existingRates = ratesCopy.filter((rate) =>
          savedCurrencyRates.some((saved) => saved.id === rate.id)
        );

        // Track all API calls
        const apiCalls = [];

        // Process new rates - create them
        for (const rate of newRates) {
          if (!rate.currency) continue;

        const rateData = {
          targetCurrency: rate.currency.value,
          buyRate: rate.buyingRateCustom || rate.buyingRateBase,
          sellRate: rate.sellingRateCustom || rate.sellingRateBase,
          isActive: rate.isActive,
        };

          apiCalls.push(createOfficeRate(rateData));
        }

        // Process existing rates - update them if changed
        for (const rate of existingRates) {
          if (!rate.currency) continue;

          // Find the saved version to compare
          const savedRate = savedCurrencyRates.find(
            (saved) => saved.id === rate.id
          );
          if (!savedRate) continue;

          // Only update if values have changed
          const buyRateChanged =
            rate.buyingRateCustom !== savedRate.buyingRateCustom;
          const sellRateChanged =
            rate.sellingRateCustom !== savedRate.sellingRateCustom;
          const activeChanged = rate.isActive !== savedRate.isActive;

          if (buyRateChanged || sellRateChanged || activeChanged) {
            const updateData: any = {};

            if (buyRateChanged) {
              updateData.buyRate = rate.buyingRateCustom || rate.buyingRateBase;
            }

            if (sellRateChanged) {
              updateData.sellRate =
                rate.sellingRateCustom || rate.sellingRateBase;
            }

            if (activeChanged) {
              updateData.isActive = rate.isActive;
            }

            apiCalls.push(updateOfficeRate(rate.id, updateData));
          }
        }

        // Dismiss all toasts including the loading one
        toast.dismiss();

        // If no API calls needed, show a message and return
        if (apiCalls.length === 0) {
          showToast("No changes to update", "info");
          return;
        }

        // Wait for all API calls to complete
        const results = await Promise.all(apiCalls);

        // Check if all operations were successful
        const allSucceeded = results.every((result) => result.success);

        if (allSucceeded) {
          // Show a single success toast
          showToast("All rates updated successfully", "success");

          // Reload rates from API to get the latest data
          await loadRatesFromApi();

        // Switch to view mode
        setShowTableView(true);
        setIsEditMode(false);
        setShowAddNewCurrency(false);
          setLocalIsUpdateDisabled(true);
      } else {
          // If any operation failed, show an error
          const failedCount = results.filter(
            (result) => !result.success
          ).length;
          showToast(
            `Failed to update ${failedCount} rates. Please try again.`,
            "error"
          );
        }
      } catch (error) {
        console.error("Error updating currencies:", error);
        // Dismiss all toasts
        toast.dismiss();
        showToast("An unexpected error occurred while updating rates", "error");
      }
    };

    const handleEdit = () => {
      setShowTableView(false);
      setShowTable(true);
      setIsEditMode(true);
      setShowAddNewCurrency(true);
    };

    const checkUpdateDisabled = () => {
      // If no currencies or some without selection, disable update
      if (
        currencyRates.length === 0 ||
        currencyRates.some((rate) => !rate.currency)
      ) {
        setLocalIsUpdateDisabled(true);
        return true;
      }

      // If in edit mode and there are no changes, disable update
      if (isEditMode && savedCurrencyRates.length > 0) {
        const hasChanges =
          JSON.stringify(currencyRates) !== JSON.stringify(savedCurrencyRates);
        setLocalIsUpdateDisabled(!hasChanges);
        return !hasChanges;
      }

      // For new currencies, enable update
      setLocalIsUpdateDisabled(false);
      return false;
    };

    useEffect(() => {
      // Check if update should be disabled
      if (
        currencyRates.length === 0 ||
        currencyRates.some((rate) => !rate.currency)
      ) {
        setLocalIsUpdateDisabled(true);
        return;
      }

      // If in edit mode and there are no changes, disable update
      if (isEditMode && savedCurrencyRates.length > 0) {
        const hasChanges =
          JSON.stringify(currencyRates) !== JSON.stringify(savedCurrencyRates);
        setLocalIsUpdateDisabled(!hasChanges);
      } else {
        // For new currencies, enable update
        setLocalIsUpdateDisabled(false);
      }
    }, [currencyRates, isEditMode, savedCurrencyRates]);

    // Define gradient style for buttons
    const gradientButtonStyle = {
      background:
        "radial-gradient(65.83% 94.77% at 50.34% 116.3%, #C3F63C 0%, #54D10E 100%)",
      border: "1px solid rgba(255, 255, 255, 0.4)",
      boxShadow:
        "0px 4px 4px 0px #FFFFFF52 inset, 0px -4px 4px 0px #FFFFFF52 inset",
    };

    return (
      <div className="w-full h-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#20523C]"></div>
          </div>
        ) : !showTable && !showTableView ? (
          <div className="max-w-[585px] mx-auto flex items-center justify-center flex-col mt-12 md:-mt-8 text-center">
            <Image
              src="/assets/rate-setting.svg"
              alt="rate-setting"
              width={250}
              height={250}
              className="md:w-[250px] md:h-[250px] w-[200px] h-[200px]"
            />
            <h3 className="text-[#111111] text-[20px] leading-[24px] font-bold mt-4">
              You haven't set any exchange rates yet.
            </h3>
            <p className="text-[#585858] text-[14px] leading-[20px] font-normal mt-2 md:mt-1 mb-6">
              Please create a list of the currencies you offer so your customers
              can see accurate pricing
            </p>

            <button
              onClick={handleAddCurrency}
              className="w-[191px] h-10 sm:h-[46px] cursor-pointer rounded-md relative text-[#20523C] text-base font-semibold leading-[22px]"
              style={gradientButtonStyle}
            >
              Add new Currency
            </button>
          </div>
        ) : showTableView ? (
          <div>
            <div className="w-full bg-white border-b border-[#DEDEDE]">
              <div className="grid grid-cols-4 gap-4 md:px-6 pb-4 border-b border-[#DEDEDE]">
                <div className="text-[12px] md:text-[14px] leading-[17px] md:leading-[20px] font-medium text-[#111111]">
                  Currency
                </div>
                <div className="text-[12px] md:text-[14px] leading-[17px] md:leading-[20px] font-medium text-[#111111]">
                  Buying rate
                </div>
                <div className="text-[12px] md:text-[14px] leading-[17px] md:leading-[20px] font-medium text-[#111111]">
                  Selling rate
                </div>
                <div className="text-[12px] md:text-[14px] leading-[17px] md:leading-[20px] font-medium text-[#111111] text-end md:text-center">
                  Activate
                </div>
              </div>

              <div className="divide-y divide-[#DEDEDE]">
                {currencyRates.length === 0 ? (
                  <div className="px-6 py-4 text-center text-[#111111]">
                    No data
                  </div>
                ) : (
                  currencyRates.map((rate) => (
                    <div
                      key={rate.id}
                      className="grid grid-cols-4 gap-4 md:px-6 py-[11px] md:py-4 items-center"
                    >
                      <div className="flex items-center space-x-1.5 md:space-x-3">
                        <div className="min-w-6 min-h-6 w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-lg">
                          {rate.currency && (
                            <Image
                              src={`https://flagcdn.com/w20/${getFlagCode(
                                rate.currency.value
                              )}.png`}
                              alt={rate.currency.label}
                              width={1280}
                              height={1280}
                              className="rounded-full object-cover h-full w-full"
                            />
                          )}
                        </div>
                        <span className="text-[14px] leading-[17px] font-normal text-[#111111]">
                          {rate.currency ? rate.currency.label : "-"}
                        </span>
                      </div>

                      <div className="text-[14px] font-normal leading-[17px] md:leading-[20px] text-[#111111]">
                        {rate.buyingRateCustom || rate.buyingRateBase}
                      </div>

                      <div className="text-[14px] font-normal leading-[17px] md:leading-[20px] text-[#111111]">
                        {rate.sellingRateCustom || rate.sellingRateBase}
                      </div>

                      <div className="text-[14px] font-normal leading-[17px] md:leading-[20px] text-[#111111] flex items-center justify-center">
                        <ToggleButton
                          checked={rate.isActive}
                          size="md"
                          onChange={() => {}}
                        />
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full relative h-full">
            <div className="w-full md:block hidden min-h-full">
              <div className="h-full grid grid-cols-[24px_142px_168px_168px_100px_auto] gap-4 text-left items-center px-6 py-3 border-b border-[#DEDEDE]">
                <div></div>
                <h2 className="text-[#111111] text-[14px] font-medium leading-[20px]">
                  Currency
                </h2>
                <h2 className="text-[#111111] text-[14px] font-medium leading-[20px]">
                  Buying rate
                </h2>
                <h2 className="text-[#111111] text-[14px] font-medium leading-[20px]">
                  Selling rate
                </h2>
                <h2 className="text-[#111111] text-[14px] font-medium leading-[20px] text-center">
                  Activate
                </h2>
                <div></div>
              </div>

              {currencyRates.map((rate, index) => (
                <div
                  key={rate.id}
                  className="grid grid-cols-[24px_142px_168px_168px_100px_auto] gap-4 items-center px-6 py-3 border-b border-[#DEDEDE]"
                  draggable
                  onDragStart={(e) => handleDragStart(e, rate.id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, rate.id)}
                >
                  <button
                    className="min-w-[24px] cursor-move hover:bg-gray-100 rounded p-1 transition-colors"
                    onMouseDown={(e) =>
                      e.currentTarget
                        .closest("div")
                        ?.setAttribute("draggable", "true")
                    }
                    onMouseUp={(e) =>
                      e.currentTarget
                        .closest("div")
                        ?.setAttribute("draggable", "false")
                    }
                  >
                    <Image
                      src="/assets/swipe.svg"
                      alt="swipe"
                      width={24}
                      height={24}
                    />
                  </button>

                  <div>
                    <SelectCurrencyDropdown
                      options={getAvailableCurrencies(rate.id).map(
                        (currency) => ({
                          ...currency,
                          flag: null,
                        })
                      )}
                      placeholder="Select Curr..."
                      selectedOption={rate.currency}
                      onSelect={(option) =>
                        handleCurrencySelect(rate.id, option)
                      }
                      width="142px"
                      className="h-full"
                    />
                  </div>

                  <div className="flex items-center gap-2 justify-center">
                    <input
                      type="number"
                      value={rate.buyingRateBase.toFixed(2)}
                      readOnly
                      className="outline-none flex items-center smaller border border-[#DEDEDE] opacity-70 rounded-lg w-[80px] px-4 h-[42px] text-[#585858] text-[14px] leading-[20px] font-normal"
                    />
                    <input
                      type="number"
                      value={rate.buyingRateCustom || ""}
                      onChange={(e) =>
                        updateBuyingRate(
                          rate.id,
                          e.target.value.replace(/,/g, "")
                        )
                      }
                      onKeyDown={preventInvalidNumberInput}
                      placeholder="0.00"
                      step="0.01"
                      className="outline-none flex items-center smaller border border-[#DEDEDE] rounded-lg w-[80px] px-4 h-[42px] text-[#111111] placeholder:text-[#111111] text-[14px] leading-[20px] font-normal focus:border-[#20523C] transition-colors"
                    />
                  </div>

                  <div className="flex items-center gap-2 justify-center">
                    <input
                      type="number"
                      value={rate.sellingRateBase.toFixed(2)}
                      readOnly
                      className="outline-none flex items-center smaller border border-[#DEDEDE] opacity-70 rounded-lg w-[80px] px-4 h-[42px] text-[#585858] text-[14px] leading-[20px] font-normal"
                    />
                    <input
                      type="number"
                      value={rate.sellingRateCustom || ""}
                      onChange={(e) =>
                        updateSellingRate(
                          rate.id,
                          e.target.value.replace(/,/g, "")
                        )
                      }
                      onKeyDown={preventInvalidNumberInput}
                      placeholder="0.00"
                      step="0.01"
                      className="outline-none flex items-center smaller border border-[#DEDEDE] rounded-lg w-[80px] px-4 h-[42px] text-[#111111] placeholder:text-[#111111] text-[14px] leading-[20px] font-normal focus:border-[#20523C] transition-colors"
                    />
                  </div>

                  <div className="flex items-center justify-center h-[42px]">
                    <ToggleButton
                      checked={rate.isActive}
                      size="md"
                      onChange={(checked) => toggleActive(rate.id, checked)}
                    />
                  </div>

                  <button
                    className="min-w-[24px] cursor-pointer"
                    onClick={() => {
                      setRateToDelete(rate);
                      setShowDeleteModal(true);
                    }}
                    title="Delete currency"
                  >
                    <Image
                      src="/assets/trash.svg"
                      alt="trash"
                      width={24}
                      height={24}
                      className="group-hover:scale-110 transition-transform "
                    />
                  </button>
                </div>
              ))}
            </div>

            <div className="block md:hidden space-y-2">
              {currencyRates.map((rate, index) => (
                <div
                  key={rate.id}
                  className="pt-4 first:pt-0 pb-6 border-b border-[#DEDEDE]"
                  draggable
                  onDragStart={(e) => handleDragStart(e, rate.id)}
                  onDragEnd={handleDragEnd}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, rate.id)}
                >
                  <div className="flex items-center justify-between gap-4">
                    <button
                      className="min-w-[20px] cursor-move rounded transition-colors"
                      onMouseDown={(e) =>
                        e.currentTarget
                          .closest("div")
                          ?.setAttribute("draggable", "true")
                      }
                      onMouseUp={(e) =>
                        e.currentTarget
                          .closest("div")
                          ?.setAttribute("draggable", "false")
                      }
                    >
                      <Image
                        src="/assets/swipe.svg"
                        alt="swipe.svg"
                        width={20}
                        height={20}
                      />
                    </button>
                    <button
                      className="min-w-[20px]"
                      onClick={() => {
                        setRateToDelete(rate);
                        setShowDeleteModal(true);
                      }}
                      title="Delete currency"
                    >
                      <Image
                        src="/assets/trash.svg"
                        alt="trash"
                        width={20}
                        height={20}
                        className="group-hover:scale-110 transition-transform"
                      />
                    </button>
                  </div>

                  <div className="my-3">
                    <h3 className="text-[12px] leading-[17px] font-medium text-[#111111] mb-1.5">
                      Currency
                    </h3>
                    <div className="flex items-center gap-4 justify-between">
                      <SelectCurrencyDropdown
                        options={getAvailableCurrencies(rate.id).map(
                          (currency) => ({
                            ...currency,
                            flag: null,
                          })
                        )}
                        placeholder="Select Currency"
                        selectedOption={rate.currency}
                        onSelect={(option) =>
                          handleCurrencySelect(rate.id, option)
                        }
                      />

                      <ToggleButton
                        checked={rate.isActive}
                        size="md"
                        onChange={(checked) => toggleActive(rate.id, checked)}
                        className="min-w-[36.5px] cursor-pointer"
                      />
                    </div>
                  </div>
                  <div className="mb-3">
                    <h3 className="text-[12px] leading-[17px] font-medium text-[#111111] mb-1.5">
                      Buying rate
                    </h3>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={rate.buyingRateBase.toFixed(2)}
                        readOnly
                        className="outline-none flex items-center smaller border border-[#DEDEDE] opacity-70 rounded-lg w-full md:w-[80px] px-4 h-[42px] text-[#585858] text-[14px] leading-[20px] font-normal"
                      />
                      <input
                        type="number"
                        value={rate.buyingRateCustom || ""}
                        onChange={(e) =>
                          updateBuyingRate(
                            rate.id,
                            e.target.value.replace(/,/g, "")
                          )
                        }
                        onKeyDown={preventInvalidNumberInput}
                        placeholder="0.00"
                        step="0.01"
                        className="outline-none flex items-center smaller border border-[#DEDEDE] rounded-lg md:w-[80px] px-4 w-full h-[42px] text-[#111111] placeholder:text-[#111111] text-[14px] leading-[20px] font-normal focus:border-[#20523C] transition-colors"
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[12px] leading-[17px] font-medium text-[#111111] mb-1.5">
                      Selling rate
                    </h3>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={rate.sellingRateBase.toFixed(2)}
                        readOnly
                        className="outline-none flex items-center smaller border border-[#DEDEDE] opacity-70 rounded-lg w-full md:w-[80px] px-4 h-[42px] text-[#585858] text-[14px] leading-[20px] font-normal"
                      />
                      <input
                        type="number"
                        value={rate.sellingRateCustom || ""}
                        onChange={(e) =>
                          updateSellingRate(
                            rate.id,
                            e.target.value.replace(/,/g, "")
                          )
                        }
                        onKeyDown={preventInvalidNumberInput}
                        placeholder="0.00"
                        step="0.01"
                        className="outline-none flex items-center smaller border border-[#DEDEDE] rounded-lg w-full md:w-[80px] px-4 h-[42px] text-[#111111] placeholder:text-[#111111] text-[14px] leading-[20px] font-normal focus:border-[#20523C] transition-colors"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="w-full mt-6 flex items-center gap-3 md:gap-6 justify-between md:flex-row flex-col">
              <div className="w-full flex items-center gap-2">
                {isEditMode && savedCurrencyRates.length > 0 ? (
                  <button
                    onClick={resetRates}
                    className="cursor-pointer w-full md:w-fit border border-[#20523C] rounded-md h-[40px] md:h-[46px] px-6 text-[#20523C] text-[16px] font-medium leading-[22px] hover:bg-[#20523C] hover:text-white transition-all duration-200"
                  >
                    Reset
                  </button>
                ) : (
                  <p className="text-[#111111] text-[14px] md:text-[18px] leading-[18px] md:leading-[22px] font-normal">
                    <span className="font-bold">Last Update:</span> {lastUpdate}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
              {showAddNewCurrency && (
                <button
                    onClick={addNewCurrencyRow}
                  className="cursor-pointer w-full md:w-fit text-nowrap rounded-md h-[40px] md:h-[46px] px-6 text-[#20523C] text-[16px] font-medium leading-[22px] flex items-center justify-center gap-1"
                  style={gradientButtonStyle}
                >
                  <svg
                    width="19"
                    height="19"
                    viewBox="0 0 19 19"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M4.55469 9.26245H15.1997"
                      stroke="#20523C"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                    <path
                      d="M9.875 14.585V3.93994"
                      stroke="#20523C"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Add new Currency
                </button>
              )}
              </div>
            </div>
          </div>
        )}
        {showDeleteModal && rateToDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
            <div className="bg-white rounded-[16px] md:rounded-lg shadow-lg p-5 md:pt-[36px] md:pb-[42px] md:px-10 max-w-[529px] w-full ">
              <h2 className="text-[16px] md:text-[20px] leading-[19px] md:leading-[24px] font-bold mb-1 md:mb-2 text-[#111111] md:text-left text-center">
                Delete this Exchange ?
              </h2>
              <p className="mb-4 md:mb-9 text-[#585858] text-[14px] font-normal leading-[20px] md:text-left text-center">
                Are you sure you want to Delete "
                {rateToDelete.currency?.label || "this currency"}" from your
                rateboard list?
              </p>
              <div className="flex justify-center md:justify-end gap-2">
                <button
                  className="cursor-pointer px-6 w-fit h-[40px] md:h-[46px] rounded-md border border-[#20523C] text-[#20523C] bg-white text-[16px] leading-[22px] font-semibold"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="cursor-pointer px-6 w-fit h-[40px] md:h-[46px] rounded-md bg-[#BF1212] text-white text-[16px] leading-[22px] font-semibold"
                  onClick={async () => {
                    if (rateToDelete) {
                      // Dismiss any existing toasts
                      toast.dismiss();

                      // Close the modal first
                    setShowDeleteModal(false);
                    setRateToDelete(null);

                      // Call the delete function which now handles its own toasts
                      await deleteRate(rateToDelete.id);
                    }
                  }}
                >
                  Yes, Remove {rateToDelete?.currency?.label || "currency"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }
);

export default RateSetting;
