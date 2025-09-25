import Image from "next/image";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import KeyStatChart from "./KeyStatChart";
import { DashboardAnalyticsData, fetchDashboardAnalytics } from "@/services/api";
import { toast } from "react-toastify";

interface StatsCardProps {
  title: string;
  value: string | number;
  percentage: string | number;
  changeText: string;
  isPositive?: boolean;
  isLoading?: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  percentage,
  changeText,
  isPositive = true,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div
        className="rounded-lg animate-pulse"
        style={{
          boxShadow:
            "0px 4px 14px rgba(0, 0, 0, 0.10), 0px 4px 4px rgba(0, 0, 0, 0.08)",
        }}
      >
        <div className="relative bg-white rounded-lg overflow-hidden">
          <div className="p-4">
            <div className="h-5 bg-gray-200 rounded w-24 mb-4"></div>
            <div className="h-10 bg-gray-100 rounded w-16 mt-4"></div>
          </div>
          <div className="bg-[#F5F7F9] py-3 px-4 rounded-b-lg">
            <div className="h-5 bg-gray-200 rounded w-32"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="rounded-lg cursor-pointer transition-all duration-300 ease-out hover:scale-[1.02] hover:-translate-y-1 group"
      style={{
        boxShadow:
          "0px 4px 14px rgba(0, 0, 0, 0.10), 0px 4px 4px rgba(0, 0, 0, 0.08)",
      }}
    >
      <div
        className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          boxShadow:
            "0px 8px 25px rgba(0, 0, 0, 0.15), 0px 8px 8px rgba(0, 0, 0, 0.12)",
        }}
      />
      <div className="relative bg-white rounded-lg overflow-hidden">
        <div className="p-4 group-hover:bg-gray-50/30 transition-colors duration-300">
          <div className="flex items-center gap-1">
            <h2 className="text-[#585858] text-[14px] leading-[20px] font-normal group-hover:text-[#404040] transition-colors duration-200">
              {title}
            </h2>
            <div className="transition-transform duration-200 group-hover:scale-110">
              <Image src="/assets/info.svg" alt="info" width={14} height={14} />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5">
            <h2 className="text-[#111111] text-[42px] leading-[50px] font-semibold group-hover:text-black transition-colors duration-200">
              {value}
            </h2>
            <div
              className={`mt-2.5 ${
                isPositive
                  ? "bg-[#C2ECD2] group-hover:bg-[#B8E6C1]"
                  : "bg-[#FECACA] group-hover:bg-[#FEB8B8]"
              } rounded-[1000px] px-1.5 py-0.5 flex justify-center gap-0.5 transition-all duration-200 group-hover:scale-105`}
            >
              <div className="transition-transform duration-200 group-hover:scale-110">
                <Image
                  src={
                    isPositive
                      ? "/assets/arrow-up.svg"
                      : "/assets/arrow-down.svg"
                  }
                  alt={isPositive ? "arrow-up" : "arrow-down"}
                  width={14.19}
                  height={14.19}
                />
              </div>
              <h3
                className={`${
                  isPositive ? "text-[#20523C]" : "text-[#991B1B]"
                } text-[12px] leading-[17px] font-normal mt-[1px] transition-colors duration-200`}
              >
                {percentage}%
              </h3>
            </div>
          </div>
        </div>
        <div className="bg-[#F5F7F9] py-3 px-4 rounded-b-lg group-hover:bg-[#EDF2F7] transition-colors duration-300">
          <h2 className="text-[#585858] text-[14px] font-normal leading-[20px] group-hover:text-[#404040] transition-colors duration-200">
            {changeText}
          </h2>
        </div>
      </div>
    </div>
  );
};

interface DashboardUserProps {
  period?: '7days' | '30days' | '90days';
}

const DashboardUser: React.FC<DashboardUserProps> = ({ period = '7days' }) => {
  const [showSummary, setShowSummary] = useState(true);
  const router = useRouter();
  const [lastUpdateTime, setLastUpdateTime] = useState<string>("");
  const [dashboardData, setDashboardData] = useState<DashboardAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPeriod, setCurrentPeriod] = useState<'7days' | '30days' | '90days'>(period);

  // Fetch dashboard data
  const fetchDashboardData = async (selectedPeriod: '7days' | '30days' | '90days') => {
    setIsLoading(true);
    try {
      const response = await fetchDashboardAnalytics(selectedPeriod);
      
      if (response.success && response.data) {
        setDashboardData(response.data);
        
        // Format and set last update time
        if (response.data.lastUpdate) {
          const updateDate = new Date(response.data.lastUpdate);
          const formattedDate =
            updateDate.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            }) +
            " - " +
            updateDate.toLocaleTimeString("en-US", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });
          setLastUpdateTime(formattedDate);
        }
      } else {
        toast.error("Failed to load dashboard data");
        console.error("Failed to load dashboard data:", response.message);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("An error occurred while loading dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  // Update data when period changes
  useEffect(() => {
    fetchDashboardData(currentPeriod);
  }, [currentPeriod]);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData(period);
  }, [period]);

  const handleUpdateCurrency = () => {
    router.push("/exchange-leadboard");
  };

  // Handle period change from parent component
  useEffect(() => {
    if (period !== currentPeriod) {
      setCurrentPeriod(period);
    }
  }, [period]);

  return (
    <div className="mt-6 md:mt-8">
      <div className="border border-[#DEDEDE] rounded-lg p-4 hidden md:flex items-center justify-between">
        <h3 className="text-[#111111] text-[18px] leading-[22px] font-normal">
          <span className="font-bold">Last Update :</span> {lastUpdateTime || "Loading..."}
        </h3>
        <button
          onClick={handleUpdateCurrency}
          className="w-fit h-10 px-6 sm:h-[46px] cursor-pointer rounded-md relative text-[#20523C] text-base font-semibold leading-[22px]"
          style={{
            background:
              "radial-gradient(65.83% 94.77% at 50.34% 116.3%, #C3F63C 0%, #54D10E 100%)",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            boxShadow:
              "0px 4px 4px 0px #FFFFFF52 inset, 0px -4px 4px 0px #FFFFFF52 inset",
          }}
        >
          Update My Currency
        </button>
      </div>

      <div className="md:hidden flex items-center justify-between">
        <h3 className="text-[#111111] text-[14px] md:text-[18px] leading-[20px] md:leading-[22px] font-normal flex items-start flex-col">
          <span className="font-bold">Last Update :</span> {lastUpdateTime || "Loading..."}
        </h3>
        <button
          onClick={handleUpdateCurrency}
          className="w-fit h-10 px-6 sm:h-[46px] cursor-pointer rounded-md relative text-[#20523C] text-base font-semibold leading-[22px]"
          style={{
            background:
              "radial-gradient(65.83% 94.77% at 50.34% 116.3%, #C3F63C 0%, #54D10E 100%)",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            boxShadow:
              "0px 4px 4px 0px #FFFFFF52 inset, 0px -4px 4px 0px #FFFFFF52 inset",
          }}
        >
          Update
        </button>
      </div>

      {showSummary && dashboardData?.profileViews && (
        <div className="mt-6 md:mt-8">
          <h2 className="text-[#111111] text-[20px] font-bold leading-[24px] mb-4">
            Summary
          </h2>
          <div className="relative border border-[#DEDEDE] rounded-[16px] p-4 flex items-center justify-between gap-4">
            <div className="flex items-start sm:items-center gap-1">
              <Image
                src="/assets/congratulation.png"
                alt="congratulation"
                width={42}
                height={42}
              />
              <div className="w-[209px] sm:w-fit">
                <h2 className="text-[#111111] text-[16px] font-medium leading-[19px] mb-1">
                  Congratulation !
                </h2>
                <p className="text-[#585858] text-[14px] font-normal leading-[17px]">
                  Your profile was viewed {dashboardData.profileViews.total} times this {currentPeriod === '7days' ? 'week' : currentPeriod === '30days' ? 'month' : 'quarter'} {dashboardData.profileViews.percentageChange > 0 ? '+' : ''}{dashboardData.profileViews.percentageChange}% compared to last {currentPeriod === '7days' ? 'week' : currentPeriod === '30days' ? 'month' : 'quarter'}!
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowSummary(false)}
              className="cursor-pointer md:static absolute top-4 right-4"
            >
              <Image
                src="/assets/close-modal.svg"
                alt="close"
                width={24}
                height={24}
              />
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 md:mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatsCard
          title="Profile Review"
          value={dashboardData?.profileViews?.total || 0}
          percentage={dashboardData?.profileViews?.percentageChange || 0}
          changeText={`${(dashboardData?.profileViews?.changeFromLastMonth || 0) > 0 ? '+' : ''}${dashboardData?.profileViews?.changeFromLastMonth || 0} from last month`}
          isPositive={Number(dashboardData?.profileViews?.percentageChange || 0) >= 0}
          isLoading={isLoading}
        />
        <StatsCard
          title="Phone Calls"
          value={dashboardData?.phoneCalls?.total || 0}
          percentage={dashboardData?.phoneCalls?.percentageChange || 0}
          changeText={`${(dashboardData?.phoneCalls?.changeFromLastMonth || 0) > 0 ? '+' : ''}${dashboardData?.phoneCalls?.changeFromLastMonth || 0} from last month`}
          isPositive={Number(dashboardData?.phoneCalls?.percentageChange || 0) >= 0}
          isLoading={isLoading}
        />
        <StatsCard
          title="GPS Clicked"
          value={dashboardData?.gpsClicks?.total || 0}
          percentage={dashboardData?.gpsClicks?.percentageChange || 0}
          changeText={`${(dashboardData?.gpsClicks?.changeFromLastMonth || 0) > 0 ? '+' : ''}${dashboardData?.gpsClicks?.changeFromLastMonth || 0} from last month`}
          isPositive={Number(dashboardData?.gpsClicks?.percentageChange || 0) >= 0}
          isLoading={isLoading}
        />
      </div>

      <div className="mt-6 space-y-6">
        <KeyStatChart dashboardData={dashboardData || undefined} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default DashboardUser;
