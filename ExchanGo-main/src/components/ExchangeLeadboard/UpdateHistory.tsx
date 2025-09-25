import Image from "next/image";
import React, { useState, useMemo, useEffect } from "react";
import { fetchRateHistories, RateHistory, RateHistoryTimePeriod } from "@/services/api";
import { format } from "date-fns";
import Loader from "../ui/Loader";

interface GroupedRecords {
  date: string;
  records: RateHistory[];
}

interface UpdateHistoryProps {
  timePeriod?: string;
}

// Map from frontend timePeriod values to API enum values
const timeperiodToApiEnum: Record<string, RateHistoryTimePeriod> = {
  "last-7-days": RateHistoryTimePeriod.LAST_SEVEN_DAYS,
  "last-one-month": RateHistoryTimePeriod.LAST_ONE_MONTH,
  "last-6-month": RateHistoryTimePeriod.LAST_SIX_MONTHS,
  "last-one-year": RateHistoryTimePeriod.LAST_ONE_YEAR,
  "all-history": RateHistoryTimePeriod.ALL_HISTORY,
};

const UpdateHistory: React.FC<UpdateHistoryProps> = ({ timePeriod = "last-7-days" }) => {
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [historyData, setHistoryData] = useState<RateHistory[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch rate history data when component mounts or timeframe changes
  useEffect(() => {
    const fetchHistoryData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Convert the frontend timePeriod to the API enum value
        const apiTimePeriod = timeperiodToApiEnum[timePeriod] || RateHistoryTimePeriod.LAST_SEVEN_DAYS;
        console.log(`Fetching rate history data with time period: ${apiTimePeriod}`);
        
        let params: any = {
          limit: 100, // Adjust based on your needs
          sort: 'createdAt', 
          order: 'DESC',
          timePeriod: apiTimePeriod
        };

        const response = await fetchRateHistories(params);
        
        if (response.success && response.data) {
          console.log("Successfully fetched rate histories:", response.data);
          setHistoryData(response.data);
        } else {
          console.error("Failed to fetch rate histories:", response);
          setError(response.message || "Failed to fetch rate history data");
        }
      } catch (err) {
        console.error("Error fetching rate history data:", err);
        setError("An error occurred while fetching data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistoryData();
  }, [timePeriod]);

  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  // Format time for display
  const formatTime = (dateString: string) => {
    return format(new Date(dateString), "HH:mm");
  };

  // Group records by date
  const groupedData = useMemo(() => {
    if (!historyData.length) return [];

    const groups: { [key: string]: RateHistory[] } = {};

    historyData.forEach((record) => {
      // Format the date for grouping
      const date = formatDate(record.createdAt);
      
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(record);
    });

    return Object.entries(groups).map(([date, records]) => ({
      date,
      records,
    }));
  }, [historyData]);

  const toggleExpanded = (date: string) => {
    const newExpandedDates = new Set(expandedDates);
    if (newExpandedDates.has(date)) {
      newExpandedDates.delete(date);
    } else {
      newExpandedDates.add(date);
    }
    setExpandedDates(newExpandedDates);
  };

  const handleTimeframeChange = (option: { value: string; label: string }) => {
    // This function is no longer needed as timePeriod is passed as a prop
    // setTimeframe(option.value); 
  };

  return (
    <div className="w-full">
      {isLoading && (
        <Loader isLoading={isLoading} />
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative my-4">
          {error}
        </div>
      )}

      {!isLoading && !error && historyData.length === 0 && (
        <div className="bg-gray-50 border border-gray-200 text-gray-700 px-4 py-12 rounded text-center">
          No rate history data available.
        </div>
      )}

      {!isLoading && !error && historyData.length > 0 && (
      <div className="overflow-x-auto hide-scrollbar">
        <div className="min-w-[640px] sm:min-w-[776px]">
          <div className="grid grid-cols-8 md:grid-cols-14 gap-4 md:px-4 mb-2 md:mb-3">
            <div className="col-span-1"></div>
            <div className="col-span-2 md:col-span-3 text-[#111111] text-[14px] leading-[20px] font-medium">
              Date
            </div>
            <div className="col-span-3 md:col-span-5 text-[#111111] text-[14px] leading-[20px] font-medium">
              Last Update
            </div>
            <div className="col-span-2 md:col-span-5 text-[#111111] text-[14px] leading-[20px] font-medium">
                Office
            </div>
          </div>

          <div className="space-y-2">
            {groupedData.map((group) => (
              <div
                key={group.date}
                className="md:px-4 bg-white border-b md:border border-[#DEDEDE] md:rounded-xl"
              >
                <div
                  className="grid grid-cols-8 md:grid-cols-14 gap-4 py-4 md:py-5 items-start cursor-pointer transition-colors"
                  onClick={() => toggleExpanded(group.date)}
                >
                  <div className="col-span-1 flex items-center justify-start">
                    <svg
                      viewBox="0 0 19 19"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className={`md:w-[19px] md:h-[19px] w-[18px] h-[18px] transition-transform duration-200 mt-[1px] flex-shrink-0 ${
                        expandedDates.has(group.date) ? "rotate-180" : ""
                      }`}
                    >
                      <path
                        d="M15.1456 7.06763L10.1881 12.0252C9.60262 12.6106 8.64457 12.6106 8.0591 12.0252L3.10156 7.06763"
                        stroke="#292D32"
                        strokeWidth="1.14054"
                        strokeMiterlimit="10"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="col-span-2 md:col-span-3 text-[14px] sm:text-[16px] leading-[17px] sm:leading-[22px] font-normal text-[#111111] truncate">
                    {group.date}
                  </div>
                  <div className="col-span-3 md:col-span-5 text-[14px] sm:text-[16px] leading-[17px] sm:leading-[22px] font-normal text-[#111111] truncate">
                      Last update at {formatTime(group.records[0].createdAt)}
                  </div>
                  <div className="col-span-2 md:col-span-5 flex items-center space-x-2.5 min-w-0">
                    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-xs flex-shrink-0">
                        {group.records[0].office.officeName?.charAt(0) || "O"}
                    </div>
                    <span className="text-[15px] sm:text-[18px] leading-[22px] font-normal text-[#111111] truncate">
                        {group.records[0].office.officeName}
                    </span>
                  </div>
                </div>

                {expandedDates.has(group.date) && (
                  <div className="w-full bg-[#DEDEDE] h-[1px]"></div>
                )}

                {/* Expanded Content */}
                {expandedDates.has(group.date) && (
                  <div className="pb-0 md:pb-6 mt-[22px]">
                    {group.records.map((record, index) => (
                      <div key={record.id} className={index > 0 ? "mt-8" : ""}>
                            <div className="block md:hidden">
                            <div className="space-y-6 px-4 flex flex-col items-start gap-6">
                                <div className="flex flex-col items-start gap-3">
                                  <div className="text-[#111111] text-[14px] leading-[20px] font-medium min-w-[80px]">
                                    Currency:
                                  </div>
                                  <div className="flex items-center gap-3">
                                  <div>
                                    <Image
                                      src={record.targetCurrency.flag || "/assets/placeholder.png"}
                                      alt={`${record.targetCurrency.code} Flag`}
                                      width={24}
                                      height={24}
                                      className="rounded-full"
                                    />
                                  </div>
                                    <div>
                                      <div className="font-normal text-[#111111] text-[18px] leading-[22px]">
                                      {record.targetCurrency.code}
                                      </div>
                                      <div className="text-[10px] leading-[14px] font-normal text-[#585858]">
                                      {record.targetCurrency.name}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <div className="text-[#111111] text-[14px] leading-[20px] font-medium">
                                    Buying rate
                                  </div>
                                  <div className="flex items-start gap-3 justify-center">
                                    <div className="flex flex-col items-start gap-[10px]">
                                      <div className="border border-[#DEDEDE] rounded-lg h-[46px] w-[80px] md:w-[100px] flex items-center justify-center">
                                        <div className="text-[14px] sm:text-[16px] leading-[17px] sm:leading-[22px] font-normal text-[#111111]">
                                        {record.oldBuyRate}
                                        </div>
                                      </div>
                                      <div className="text-[10px] font-normal leading-[14px] text-[#585858]">
                                        Initial rate
                                      </div>
                                    </div>
                                    <div className=" mt-[15px]">
                                      <Image
                                        src="/assets/arrow-right.svg"
                                        alt="arrow-right"
                                        width={18}
                                        height={18}
                                      />
                                    </div>
                                    <div className="flex flex-col items-start gap-[10px]">
                                      <div className="border border-[#DEDEDE] rounded-lg h-[46px] w-[80px] md:w-[100px] flex items-center justify-center">
                                        <div className="text-[14px] sm:text-[16px] leading-[17px] sm:leading-[22px] font-normal text-[#111111]">
                                        {record.newBuyRate}
                                        </div>
                                      </div>
                                      <div className="text-[10px] font-normal leading-[14px] text-[#585858]">
                                        After update
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="space-y-3">
                                  <div className="text-[#111111] text-[14px] leading-[20px] font-medium">
                                    Selling rate
                                  </div>
                                  <div className="flex items-start gap-3 justify-center">
                                    <div className="flex flex-col items-start gap-[10px]">
                                      <div className="border border-[#DEDEDE] rounded-lg h-[46px] w-[80px] md:w-[100px] flex items-center justify-center">
                                        <div className="text-[14px] sm:text-[16px] leading-[17px] sm:leading-[22px] font-normal text-[#111111]">
                                        {record.oldSellRate}
                                        </div>
                                      </div>
                                      <div className="text-[10px] font-normal leading-[14px] text-[#585858]">
                                        Initial rate
                                      </div>
                                    </div>
                                    <div className="mt-[15px]">
                                      <Image
                                        src="/assets/arrow-right.svg"
                                        alt="arrow-right"
                                        width={18}
                                        height={18}
                                      />
                                    </div>
                                    <div className="flex flex-col items-start gap-[10px]">
                                      <div className="border border-[#DEDEDE] rounded-lg h-[46px] w-[80px] md:w-[100px] flex items-center justify-center">
                                        <div className="text-[14px] sm:text-[16px] leading-[17px] sm:leading-[22px] font-normal text-[#111111]">
                                        {record.newSellRate}
                                        </div>
                                      </div>
                                      <div className="text-[10px] font-normal leading-[14px] text-[#585858]">
                                        After update
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Desktop Layout */}
                            <div className="hidden md:block">
                              <div className="flex items-start gap-4 px-4 lg:pl-[55px] overflow-x-auto">
                                <div className="min-w-[154px] flex items-start flex-col gap-[17px] flex-shrink-0">
                                  <div className="text-[#111111] text-[14px] leading-[20px] font-medium">
                                    Currency
                                  </div>
                                  <div className="flex items-center gap-3">
                                  <div>
                                    <Image
                                      src={record.targetCurrency.flag || "/assets/placeholder.png"}
                                      alt={`${record.targetCurrency.code} Flag`}
                                      width={24}
                                      height={24}
                                      className="rounded-full"
                                    />
                                  </div>
                                    <div>
                                      <div className="font-normal text-[#111111] text-[18px] leading-[22px]">
                                      {record.targetCurrency.code}
                                      </div>
                                      <div className="text-[10px] leading-[14px] font-normal text-[#585858]">
                                      {record.targetCurrency.name}
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex-1 min-w-[200px] flex items-start gap-3 flex-col">
                                  <div className="text-[#111111] text-[14px] leading-[20px] font-medium">
                                    Buying rate
                                  </div>
                                  <div className="flex items-start gap-2.5 lg:gap-[15px]">
                                    <div className="flex flex-col items-start gap-[10px] flex-shrink-0">
                                      <div className="border border-[#DEDEDE] rounded-lg h-[46px] w-[100px] flex items-center justify-center">
                                        <div className="text-[16px] leading-[22px] font-normal text-[#111111]">
                                        {record.oldBuyRate}
                                        </div>
                                      </div>
                                      <div className="text-[10px] font-normal leading-[14px] text-[#585858]">
                                        Initial rate
                                      </div>
                                    </div>
                                    <div className="mt-[15px] min-w-[18px] flex-shrink-0">
                                      <Image
                                        src="/assets/arrow-right.svg"
                                        alt="arrow-right"
                                        width={18}
                                        height={18}
                                      />
                                    </div>
                                    <div className="flex flex-col items-start gap-[10px] flex-shrink-0">
                                      <div className="border border-[#DEDEDE] rounded-lg h-[46px] w-[100px] flex items-center justify-center">
                                        <div className="text-[16px] leading-[22px] font-normal text-[#111111]">
                                        {record.newBuyRate}
                                        </div>
                                      </div>
                                      <div className="text-[10px] font-normal leading-[14px] text-[#585858]">
                                        After update
                                      </div>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex-1 min-w-[200px] flex items-start gap-3 flex-col">
                                  <div className="text-[#111111] text-[14px] leading-[20px] font-medium">
                                    Selling rate
                                  </div>
                                  <div className="flex items-start gap-[15px]">
                                    <div className="flex flex-col items-start gap-[10px] flex-shrink-0">
                                      <div className="border border-[#DEDEDE] rounded-lg h-[46px] w-[100px] flex items-center justify-center">
                                        <div className="text-[16px] leading-[22px] font-normal text-[#111111]">
                                        {record.oldSellRate}
                                        </div>
                                      </div>
                                      <div className="text-[10px] font-normal leading-[14px] text-[#585858]">
                                        Initial rate
                                      </div>
                                    </div>
                                    <div className="mt-[15px] min-w-[18px] flex-shrink-0">
                                      <Image
                                        src="/assets/arrow-right.svg"
                                        alt="arrow-right"
                                        width={18}
                                        height={18}
                                      />
                                    </div>
                                    <div className="flex flex-col items-start gap-[10px] flex-shrink-0">
                                      <div className="border border-[#DEDEDE] rounded-lg h-[46px] w-[100px] flex items-center justify-center">
                                        <div className="text-[16px] leading-[22px] font-normal text-[#111111]">
                                        {record.newSellRate}
                                        </div>
                                      </div>
                                      <div className="text-[10px] font-normal leading-[14px] text-[#585858]">
                                        After update
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                        {index < group.records.length - 1 && (
                          <div className="w-full bg-[#DEDEDE] h-[1px] my-6"></div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

export default UpdateHistory;
