"use client";
import React, { JSX, useState, useRef, useEffect } from "react";
import DashboardLayout from "@/components/DashboardLayout";
import RateSetting, {
  CurrencyRate,
} from "@/components/ExchangeLeadboard/RateSetting";
import UpdateHistory from "@/components/ExchangeLeadboard/UpdateHistory";
import HistoryDropdown from "@/components/ExchangeLeadboard/HistoryDropdown";
import UpdateCurrencies from "@/components/ExchangeLeadboard/UpdateCurrencies";
import EditList from "@/components/ExchangeLeadboard/EditList";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface TabType {
  id: string;
  label: string;
}

const ExchangeLeadboard = () => {
  const [activeTab, setActiveTab] = useState<string>("Rate Setting");
  const [showTable, setShowTable] = useState(false);
  const [showTableView, setShowTableView] = useState(false);
  const [isUpdateDisabled, setIsUpdateDisabled] = useState(false);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("last-7-days");

  // Lift state up to preserve currency data between tab switches
  const [currencyRates, setCurrencyRates] = useState<CurrencyRate[]>([]);
  const [savedCurrencyRates, setSavedCurrencyRates] = useState<CurrencyRate[]>(
    []
  );

  // Initialize lastUpdateTime from localStorage if available, otherwise use current date
  const [lastUpdateTime, setLastUpdateTime] = useState<Date>(() => {
    if (typeof window !== "undefined") {
      const savedTime = localStorage.getItem("lastRateUpdateTime");
      return savedTime ? new Date(savedTime) : new Date();
    }
    return new Date();
  });

  // Reference to RateSetting component's methods
  const rateSettingRef = useRef({
    updateCurrencies: () => {},
    handleEdit: () => {},
  });

  // Load saved currency rates from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      console.log("Checking localStorage for saved rates...");
      const savedRates = localStorage.getItem("savedCurrencyRates");
      if (savedRates) {
        console.log("Found saved rates in localStorage:", savedRates);
        try {
          const parsedRates = JSON.parse(savedRates);
          console.log("Successfully parsed rates:", parsedRates);
          setSavedCurrencyRates(parsedRates);
          setCurrencyRates(parsedRates);

          // Since we have data, show the table in view mode
          setShowTable(true);
          setShowTableView(true);
        } catch (error) {
          console.error("Error parsing saved currency rates:", error);
        }
      } else {
        console.log("No saved rates found in localStorage");
      }
    }
  }, []);

  // Save currency rates to localStorage when they change
  useEffect(() => {
    if (typeof window !== "undefined" && savedCurrencyRates.length > 0) {
      try {
        // Ensure the data is serializable by creating a clean object
        const serializableCurrencyRates = savedCurrencyRates.map((rate) => ({
          id: rate.id,
          currency: rate.currency,
          buyingRateBase: rate.buyingRateBase,
          buyingRateCustom: rate.buyingRateCustom,
          sellingRateBase: rate.sellingRateBase,
          sellingRateCustom: rate.sellingRateCustom,
          isActive: rate.isActive,
        }));

        localStorage.setItem(
          "savedCurrencyRates",
          JSON.stringify(serializableCurrencyRates)
        );
        console.log(
          "Saved currency rates to localStorage:",
          serializableCurrencyRates
        );
      } catch (error) {
        console.error("Error saving currency rates to localStorage:", error);
      }
    }
  }, [savedCurrencyRates]);

  // Handle update button click - update rates, show view mode
  const handleUpdateClick = () => {
    // Call the updateCurrencies method from the RateSetting component
    rateSettingRef.current.updateCurrencies();

    // Update the timestamp when rates are updated
    const newUpdateTime = new Date();
    setLastUpdateTime(newUpdateTime);

    // Save to localStorage
    if (typeof window !== "undefined") {
      localStorage.setItem("lastRateUpdateTime", newUpdateTime.toISOString());
    }
  };

  // Handle edit button click - make table editable
  const handleEditListClick = () => {
    // Call the handleEdit method from the RateSetting component
    rateSettingRef.current.handleEdit();
  };

  const tabs: TabType[] = [
    { id: "Rate Setting", label: "Rate Setting" },
    { id: "Update History", label: "Update History" },
  ];

  const handleTabClick = (tabId: string): void => {
    setActiveTab(tabId);
  };

  const renderTabContent = (): JSX.Element => {
    switch (activeTab) {
      case "Rate Setting":
        return (
          <RateSetting
            showTable={showTable}
            showTableView={showTableView}
            setShowTable={setShowTable}
            setShowTableView={setShowTableView}
            setIsUpdateDisabled={setIsUpdateDisabled}
            currencyRates={currencyRates}
            setCurrencyRates={setCurrencyRates}
            savedCurrencyRates={savedCurrencyRates}
            setSavedCurrencyRates={setSavedCurrencyRates}
            ref={rateSettingRef}
          />
        );
      case "Update History":
        return <UpdateHistory timePeriod={selectedTimePeriod} />;
      default:
        return (
          <div className="">
            <h1>Select a tab</h1>
          </div>
        );
    }
  };
  const historyOptions = [
    { value: "last-7-days", label: "Last seven days" },
    { value: "last-one-month", label: "Last one month" },
    { value: "last-6-month", label: "Last 6 month" },
    { value: "last-one-year", label: "Last one year" },
    { value: "all-history", label: "All history" },
  ];
  return (
    <DashboardLayout>
      <ToastContainer />
      <div className="w-full">
        {activeTab === "Rate Setting" && (
          <div className="w-full flex items-start justify-between lg:flex-row flex-col gap-6">
            <div>
              <h1 className="text-[#111111] text-[26px] md:text-[32px] leading-[31px] md:leading-[38px] font-bold">
                Exchange Leadboard
              </h1>
              <p className="max-w-[509px] text-[#585858] text-[14px] leading-[20px] font-normal mt-2">
                Manage exchange rates with precision. Update rates in real-time
                to ensure transparency and competitiveness in the market.
              </p>
            </div>
            <div className="md:block hidden">
              {showTableView && <EditList onEdit={handleEditListClick} />}
              {showTable && !showTableView && (
                <UpdateCurrencies
                  onUpdate={handleUpdateClick}
                  disabled={isUpdateDisabled}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === "Update History" && (
          <div className="w-full flex items-start justify-between lg:flex-row flex-col gap-4 sm:gap-6">
            <div>
              <h1 className="text-[#111111] text-[26px] md:text-[32px] leading-[31px] md:leading-[38px] font-bold">
                Exchange Update History{" "}
              </h1>
              <p className="text-[#585858] text-[14px] leading-[20px] font-normal mt-2">
                Here's a record of all the changes you've made to your exchange
                rates
              </p>
            </div>
            <HistoryDropdown
              options={historyOptions}
              defaultValue="Last Seven days"
              onSelect={(option) => {
                console.log("Selected time period:", option);
                setSelectedTimePeriod(option.value);
              }}
            />
          </div>
        )}

        {activeTab === "Rate Setting" && (
          <div className="flex items-start justify-between w-full gap-4 pt-4 md:pt-8">
            <h3 className="text-[#111111] text-[14px] md:text-[18px] leading-[20px] md:leading-[22px] font-normal">
              <span className="font-bold">Last Update</span> :{" "}
              <span className="md:hidden ">
                <br />{" "}
              </span>{" "}
              {lastUpdateTime.toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}{" "}
              -{" "}
              {lastUpdateTime.toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false,
              })}
            </h3>
            <div className="flex md:hidden">
              {showTableView && <EditList onEdit={handleEditListClick} />}
              {showTable && !showTableView && (
                <UpdateCurrencies
                  onUpdate={handleUpdateClick}
                  disabled={isUpdateDisabled}
                />
              )}
            </div>
          </div>
        )}

        <div className="mt-6 sm:mt-8">
          <div className="border-b border-[#DEDEDE] mb-6 sm:mb-8 overflow-hidden relative">
            <div
              className="flex overflow-x-auto hide-scrollbar"
              style={{
                background:
                  "linear-gradient(270deg, #FFFFFF 0%, rgba(255, 255, 255, 0) 100%)",
              }}
            >
              {tabs.map((tab: TabType) => (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  className={`flex-shrink-0 px-0 pb-[9.12px] cursor-pointer pt-[8.11px] mr-6 last:mr-0 text-[14px] font-medium leading-[18px] transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? "text-[#111111] border-b-2 border-[#20523C]"
                      : "text-[#585858] border-transparent hover:text-[#585858]"
                  }`}
                  type="button"
                  aria-selected={activeTab === tab.id}
                  role="tab"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div role="tabpanel" aria-labelledby={`tab-${activeTab}`}>
            {renderTabContent()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ExchangeLeadboard;
