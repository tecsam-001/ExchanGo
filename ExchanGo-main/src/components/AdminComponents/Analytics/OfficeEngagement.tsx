import Image from "next/image";
import React, { useRef, useState, useEffect, useMemo } from "react";

interface ActivityData {
  officeName: string;
  city: string;
  profileViews: number;
  phoneCalls: number;
  gpsClick: number;
  share: number;
  waAlerts: number;
}

interface OfficeEngagementProps {
  data: ActivityData[];
}

const OfficeEngagement: React.FC<OfficeEngagementProps> = ({ data }) => {
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(true);

  const [sortBy, setSortBy] = useState<string>("officeName");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    const container = tableContainerRef.current;
    if (container) {
      const handleScroll = () => {
        const { scrollLeft, scrollWidth, clientWidth } = container;
        setShowLeftShadow(scrollLeft > 2);
        setShowRightShadow(scrollLeft + clientWidth < scrollWidth - 2);
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

  const sortedData = useMemo(() => {
    const sorted = [...data];
    sorted.sort((a, b) => {
      let aValue = a[sortBy as keyof ActivityData];
      let bValue = b[sortBy as keyof ActivityData];
      const numericColumns = [
        "profileViews",
        "phoneCalls",
        "gpsClick",
        "share",
        "waAlerts",
      ];
      if (numericColumns.includes(sortBy)) {
        const aNum = Number(aValue);
        const bNum = Number(bValue);
        return sortOrder === "asc" ? aNum - bNum : bNum - aNum;
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
        className="overflow-x-auto hide-scrollbar text-nowrap"
        style={{ position: "relative" }}
        ref={tableContainerRef}
      >
        <table className="w-full min-w-full">
          <thead>
            <tr className="bg-[#F3F4F8] border-b border-[#DEDEDE]">
              <th
                className="sticky border-r border-[#DEDEDE] left-0 bg-[#F3F4F8] z-20 px-4 py-3 text-left text-xs font-medium text-gray-700 min-w-[155px] select-none cursor-pointer group"
                style={{ backgroundColor: "#F3F4F8" }}
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
                onClick={() => handleSort("profileViews")}
              >
                <div className="flex items-center space-x-1">
                  <Image
                    src="/assets/sort-table.svg"
                    alt="sort-table"
                    width={14.39}
                    height={14.39}
                    className={`transition-transform duration-200 ${
                      sortBy === "profileViews"
                        ? sortOrder === "desc"
                          ? "rotate-180"
                          : ""
                        : "opacity-50"
                    }`}
                  />
                  <span className="text-[#111111] text-[14px] leading-[17px] font-bold">
                    Profile Views
                  </span>
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 min-w-[150px] select-none cursor-pointer group"
                onClick={() => handleSort("phoneCalls")}
              >
                <div className="flex items-center space-x-1">
                  <Image
                    src="/assets/sort-table.svg"
                    alt="sort-table"
                    width={14.39}
                    height={14.39}
                    className={`transition-transform duration-200 ${
                      sortBy === "phoneCalls"
                        ? sortOrder === "desc"
                          ? "rotate-180"
                          : ""
                        : "opacity-50"
                    }`}
                  />
                  <span className="text-[#111111] text-[14px] leading-[17px] font-bold">
                    Phone Calls
                  </span>
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 min-w-[150px] select-none cursor-pointer group"
                onClick={() => handleSort("gpsClick")}
              >
                <div className="flex items-center space-x-1">
                  <Image
                    src="/assets/sort-table.svg"
                    alt="sort-table"
                    width={14.39}
                    height={14.39}
                    className={`transition-transform duration-200 ${
                      sortBy === "gpsClick"
                        ? sortOrder === "desc"
                          ? "rotate-180"
                          : ""
                        : "opacity-50"
                    }`}
                  />
                  <span className="text-[#111111] text-[14px] leading-[17px] font-bold">
                    GPS Click
                  </span>
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 min-w-[150px] select-none cursor-pointer group"
                onClick={() => handleSort("share")}
              >
                <div className="flex items-center space-x-1">
                  <Image
                    src="/assets/sort-table.svg"
                    alt="sort-table"
                    width={14.39}
                    height={14.39}
                    className={`transition-transform duration-200 ${
                      sortBy === "share"
                        ? sortOrder === "desc"
                          ? "rotate-180"
                          : ""
                        : "opacity-50"
                    }`}
                  />
                  <span className="text-[#111111] text-[14px] leading-[17px] font-bold">
                    Share
                  </span>
                </div>
              </th>
              <th
                className="px-4 py-3 text-left text-xs font-medium text-gray-700 min-w-[150px] select-none cursor-pointer group"
                onClick={() => handleSort("waAlerts")}
              >
                <div className="flex items-center space-x-1">
                  <Image
                    src="/assets/sort-table.svg"
                    alt="sort-table"
                    width={14.39}
                    height={14.39}
                    className={`transition-transform duration-200 ${
                      sortBy === "waAlerts"
                        ? sortOrder === "desc"
                          ? "rotate-180"
                          : ""
                        : "opacity-50"
                    }`}
                  />
                  <span className="text-[#111111] text-[14px] leading-[17px] font-bold">
                    WA Alerts
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
                <td
                  className="group-hover:bg-gray-50 cursor-pointer transition duration-150 sticky border-r border-[#DEDEDE] left-0 bg-white z-20 px-4 py-3 text-[16.22px] leading-[19px] font-normal text-[#585858] min-w-[155px]"
                  style={{
                    backgroundColor: "white",
                  }}
                >
                  {item.officeName}
                </td>
                <td className="group-hover:bg-gray-50 cursor-pointer transition duration-150 px-4 py-3 text-[16.22px] leading-[19px] font-normal text-[#585858]">
                  {item.city}
                </td>
                <td className="group-hover:bg-gray-50 cursor-pointer transition duration-150 px-4 py-3 text-[16.22px] leading-[19px] font-normal text-[#585858]">
                  {item.profileViews}
                </td>
                <td className="group-hover:bg-gray-50 cursor-pointer transition duration-150 px-4 py-3 text-[16.22px] leading-[19px] font-normal text-[#585858]">
                  {item.phoneCalls}
                </td>
                <td className="group-hover:bg-gray-50 cursor-pointer transition duration-150 px-4 py-3 text-[16.22px] leading-[19px] font-normal text-[#585858]">
                  {item.gpsClick}
                </td>
                <td className="group-hover:bg-gray-50 cursor-pointer transition duration-150 px-4 py-3 text-[16.22px] leading-[19px] font-normal text-[#585858]">
                  {item.share} Times
                </td>
                <td className="group-hover:bg-gray-50 cursor-pointer transition duration-150 px-4 py-3 text-[16.22px] leading-[19px] font-normal text-[#585858]">
                  {item.waAlerts} Times
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

export default OfficeEngagement;
