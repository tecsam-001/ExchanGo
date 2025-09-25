"use client";
import DashboardUser from "@/components/Dashboard/DashboardUser";
import DashboardLayout from "@/components/DashboardLayout";
import HistoryDropdown from "@/components/ExchangeLeadboard/HistoryDropdown";
import { useState } from "react";

export default function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState<
    "7days" | "30days" | "90days"
  >("7days");

  const historyOptions = [
    { value: "7days", label: "Last 7 days" },
    { value: "30days", label: "Last 30 days" },
    { value: "90days", label: "Last 90 days" },
  ];

  const handlePeriodChange = (option: { value: string; label: string }) => {
    // Type assertion since we know the value is one of the allowed periods
    setSelectedPeriod(option.value as "7days" | "30days" | "90days");
  };

  return (
    <DashboardLayout>
      <div>
        <div className="flex items-start gap-6 justify-between md:flex-row flex-col">
          <div className="max-w-[485px]">
            <h1 className="text-[#111111] text-[26px] md:text-[32px] leading-[31px] md:leading-[38px] font-bold mb-2">
              Dashboard
            </h1>
            <p className="text-[#585858] text-[14px] leading-[20px] font-normal">
              Central hub for managing exchange office data, submissions, and
              updates across cities and countries.
            </p>
          </div>
          <HistoryDropdown
            options={historyOptions}
            defaultValue={
              historyOptions.find((opt) => opt.value === selectedPeriod)
                ?.label || "Last 7 days"
            }
            onSelect={handlePeriodChange}
          />
        </div>
        <DashboardUser period={selectedPeriod} />
      </div>
    </DashboardLayout>
  );
}
