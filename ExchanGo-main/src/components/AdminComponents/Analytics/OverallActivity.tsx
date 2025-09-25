import Image from "next/image";
import React, { useRef, useState, useEffect, useMemo } from "react";

interface ActivityData {
  officeName: string;
  city: string;
  lastUpdate: string;
  updates7days: number;
  activityStatus: "Very Active" | "Active" | "Low Activity";
}

interface OverallActivityProps {
  data: ActivityData[];
}

const OverallActivity: React.FC<OverallActivityProps> = ({ data }) => {
  const getActivityColor = (status: string): string => {
    switch (status) {
      case "Very Active":
        return "text-[#159536]";
      case "Active":
        return "text-[#D6A727]";
      case "Low Activity":
        return "text-[#BA1A1A]";
      default:
        return "text-gray-600";
    }
  };

  const getActivityDot = (status: string): string => {
    switch (status) {
      case "Very Active":
        return "bg-[#15BD40]";
      case "Active":
        return "bg-[#D2A220]";
      case "Low Activity":
        return "bg-[#DA1F1F]";
      default:
        return "bg-gray-500";
    }
  };

  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(true);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [sortBy, setSortBy] = useState<string>("officeName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const container = tableContainerRef.current;
    if (container) {
      const handleScroll = () => {
        const { scrollLeft } = container;
        setShowLeftShadow(scrollLeft > 2);
        setShowRightShadow(
          scrollLeft < container.scrollWidth - container.clientWidth - 2
        );
      };

      handleScroll();

      container.addEventListener("scroll", handleScroll);
      window.addEventListener("resize", handleScroll);

      return () => {
        container.removeEventListener("scroll", handleScroll);
        window.removeEventListener("resize", handleScroll);
      };
    }
  }, []);

  const handleSort = (column: string) => {
    if (column === sortBy) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
  };

  const parseRelativeTime = (str: string): number => {
    const hrMatch = str.match(/(\d+)\s*hr[s]?\s*ago/i);
    const minMatch = str.match(/(\d+)\s*min[s]?\s*ago/i);
    let minutes = 0;
    if (hrMatch) {
      minutes += parseInt(hrMatch[1], 10) * 60;
    }
    if (minMatch) {
      minutes += parseInt(minMatch[1], 10);
    }
    return minutes;
  };

  const sortedData = useMemo(() => {
    const sorted = [...data];
    sorted.sort((a, b) => {
      let aValue = a[sortBy as keyof ActivityData];
      let bValue = b[sortBy as keyof ActivityData];
      if (sortBy === "lastUpdate") {
        const aMinutes = parseRelativeTime(String(aValue));
        const bMinutes = parseRelativeTime(String(bValue));
        return sortOrder === "asc" ? aMinutes - bMinutes : bMinutes - aMinutes;
      }
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sortOrder === "asc"
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      } else {
        return 0;
      }
    });
    return sorted;
  }, [data, sortBy, sortOrder]);

  return (
    <div className="relative w-full bg-white rounded-lg border border-[#DEDEDE] overflow-hidden">
      <div
        ref={tableContainerRef}
        className="overflow-x-auto hide-scrollbar text-nowrap"
        style={{ position: "relative" }}
      >
        <table className="w-full min-w-full">
          <thead>
            <tr className="bg-[#F3F4F8] border-b border-[#DEDEDE] ">
              <th
                className="sticky left-0 bg-[#F3F4F8] z-10 px-4 py-3 text-left text-xs font-medium text-gray-700 min-w-[155px] select-none cursor-pointer group"
                onClick={() => handleSort("officeName")}
              >
                <div className="flex items-center space-x-1">
                  <Image
                    src="/assets/sort-table.svg"
                    alt="sort-table"
                    width={14.39}
                    height={14.39}
                    className={`transition-transform duration-200 ${
                      sortBy === "officeName"
                        ? sortOrder === "desc"
                          ? "rotate-180"
                          : ""
                        : "opacity-50"
                    }`}
                  />
                  <span className="text-[#111111] text-[14px] leading-[17px] font-bold">
                    Office Name
                  </span>
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 min-w-[150px] select-none cursor-pointer group"
                onClick={() => handleSort("city")}
              >
                <div className="flex items-center space-x-1">
                  <Image
                    src="/assets/sort-table.svg"
                    alt="sort-table"
                    width={14.39}
                    height={14.39}
                    className={`transition-transform duration-200 ${
                      sortBy === "city"
                        ? sortOrder === "desc"
                          ? "rotate-180"
                          : ""
                        : "opacity-50"
                    }`}
                  />
                  <span className="text-[#111111] text-[14px] leading-[17px] font-bold">
                    City
                  </span>
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 min-w-[150px] select-none cursor-pointer group"
                onClick={() => handleSort("lastUpdate")}
              >
                <div className="flex items-center space-x-1">
                  <Image
                    src="/assets/sort-table.svg"
                    alt="sort-table"
                    width={14.39}
                    height={14.39}
                    className={`transition-transform duration-200 ${
                      sortBy === "lastUpdate"
                        ? sortOrder === "desc"
                          ? "rotate-180"
                          : ""
                        : "opacity-50"
                    }`}
                  />
                  <span className="text-[#111111] text-[14px] leading-[17px] font-bold">
                    Last Update
                  </span>
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 min-w-[150px] select-none cursor-pointer group"
                onClick={() => handleSort("updates7days")}
              >
                <div className="flex items-center space-x-1">
                  <Image
                    src="/assets/sort-table.svg"
                    alt="sort-table"
                    width={14.39}
                    height={14.39}
                    className={`transition-transform duration-200 ${
                      sortBy === "updates7days"
                        ? sortOrder === "desc"
                          ? "rotate-180"
                          : ""
                        : "opacity-50"
                    }`}
                  />
                  <span className="text-[#111111] text-[14px] leading-[17px] font-bold">
                    Updates (7days)
                  </span>
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 min-w-[159px] select-none cursor-pointer group"
                onClick={() => handleSort("activityStatus")}
              >
                <div className="flex items-center space-x-1">
                  <Image
                    src="/assets/sort-table.svg"
                    alt="sort-table"
                    width={14.39}
                    height={14.39}
                    className={`transition-transform duration-200 ${
                      sortBy === "activityStatus"
                        ? sortOrder === "desc"
                          ? "rotate-180"
                          : ""
                        : "opacity-50"
                    }`}
                  />
                  <span className="text-[#111111] text-[14px] leading-[17px] font-bold">
                    Activity status
                  </span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {sortedData.map((item, index) => (
              <tr
                key={index}
                className="border-b border-[#DEDEDE] last:border-b-0 group"
              >
                <td className="sticky left-0 bg-white truncate z-10 px-4 py-3 text-[16.22px] leading-[19px] font-normal text-[#585858] min-w-[155px] group-hover:bg-gray-50 cursor-pointer transition duration-150">
                  {item.officeName}
                </td>
                <td className="px-4 py-3 text-[16.22px] leading-[19px] font-normal text-[#585858] group-hover:bg-gray-50 cursor-pointer transition duration-150">
                  {item.city}
                </td>
                <td className="px-4 py-3 text-[16.22px] leading-[19px] font-normal text-[#585858] group-hover:bg-gray-50 cursor-pointer transition duration-150">
                  {item.lastUpdate}
                </td>
                <td className="px-4 py-3 text-[16.22px] leading-[19px] font-normal text-[#585858] group-hover:bg-gray-50 cursor-pointer transition duration-150">
                  {item.updates7days} Times
                </td>
                <td className="px-4 py-3 group-hover:bg-gray-50 cursor-pointer transition duration-150">
                  <div
                    className={`inline-flex py-0.5 border border-[#DEDEDE] rounded-full px-1.5 items-center text-[12.33px] leading-[16px] font-medium ${getActivityColor(
                      item.activityStatus
                    )}`}
                  >
                    <div
                      className={`w-[5.14px] h-[5.14px] rounded-full mr-1 ${getActivityDot(
                        item.activityStatus
                      )}`}
                    ></div>
                    {item.activityStatus}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showLeftShadow && (
        <div
          className="absolute inset-y-0 left-[215px] w-[30px] pointer-events-none"
          style={{
            background:
              "linear-gradient(to right, rgba(0,0,0,0.10) 0%, rgba(0,0,0,0) 100%)",
            zIndex: 10,
          }}
        />
      )}
      {showRightShadow && (
        <div
          className="absolute inset-y-0 right-0 w-[30px] pointer-events-none sm:block hidden"
          style={{
            background:
              "linear-gradient(to left, rgba(0, 0, 0, 0.10) 0%, rgba(0,0,0,0) 100%)",
            zIndex: 10,
          }}
        />
      )}
    </div>
  );
};

export default OverallActivity;
