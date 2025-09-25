import Image from "next/image";
import React, { useRef, useState } from "react";
import Link from "next/link";

// Remove hardcoded ranking data
const medalIcons = [
  <Image
    key="gold"
    src="/assets/rank1.svg"
    alt="Gold Medal"
    width={36}
    height={36}
  />,
  <Image
    key="silver"
    src="/assets/rank2.svg"
    alt="Silver Medal"
    width={36}
    height={36}
  />,
  <Image
    key="bronze"
    src="/assets/rank3.svg"
    alt="Bronze Medal"
    width={36}
    height={36}
  />,
];

const OutlinedNumber = ({ number }: { number: number }) => (
  <div className="w-6 h-6 flex items-center justify-center rounded-full border border-[#DEDEDE] text-[#111111] font-medium text-[12px] leading-[17px] bg-white">
    {number}
  </div>
);

interface CityRankingTableProps {
  rankingData: Array<{
    rank: number;
    city: string;
    averageRate: number;
    bestRate: number;
    exchangeOffice: string;
    exchangeOfficeSlug: string;
  }>;
  fromCurrency: string;
  toCurrency: string;
  amount: string;
}

const CityRankingTable: React.FC<CityRankingTableProps> = ({
  rankingData = [],
  fromCurrency,
  toCurrency,
  amount,
}) => {
  const mobileTableRef = useRef<HTMLDivElement>(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);

  const handleMobileScroll = () => {
    if (mobileTableRef.current) {
      setShowLeftShadow(mobileTableRef.current.scrollLeft > 0);
    }
  };

  return (
    <div className="w-full mt-6 md:mt-[42px]">
      {/* Desktop Table */}
      <div className="hidden md:block">
        <div className="flex items-center text-left justify-between text-[#111111] font-medium text-[14px] leading-[20px] px-8 pb-5">
          <div style={{ width: "50px" }} className="mr-5 lg:mr-0">
            Rank
          </div>
          <div style={{ width: "150px" }}>City</div>
          <div style={{ width: "150px" }}>Average Rate</div>
          <div style={{ width: "150px" }}>Best Rate</div>
          <div style={{ width: "150px" }}>Exchange office</div>
        </div>
        <div className="flex flex-col gap-2">
          {rankingData.map((row) => (
            <div
              key={row.rank}
              className="group flex items-center text-left justify-between bg-white rounded-[16px] px-8 py-4 min-h-[64px] transition-shadow duration-200"
            >
              <div
                style={{ width: "50px" }}
                className="flex items-center mr-5 lg:mr-0"
              >
                {row.rank <= 3 ? (
                  <span className="mr-2">{medalIcons[row.rank - 1]}</span>
                ) : (
                  <span className="mr-2">
                    <OutlinedNumber number={row.rank} />
                  </span>
                )}
              </div>
              <Link
                href={
                  row.city ? `/spesific?city=${row.city.toLowerCase()}` : "#"
                }
                passHref
                legacyBehavior
              >
                <a
                  style={{ width: "150px" }}
                  className={`font-medium text-[#585858] text-[18px] leading-[25px] ${
                    row.city
                      ? "hover:text-[#0093FB] transition duration-300 cursor-pointer hover:underline underline-offset-2"
                      : "text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {row.city || "N/A"}
                </a>
              </Link>
              <div
                style={{ width: "150px" }}
                className="font-medium text-[#585858] text-[18px] leading-[25px]"
              >
                {row.averageRate.toFixed(2)}
              </div>
              <div
                style={{ width: "150px" }}
                className="font-medium text-[#585858] text-[18px] leading-[25px]"
              >
                {row.bestRate.toFixed(2)}
              </div>
              <Link
                href={{
                  pathname: "/exchange-detail",
                  query: {
                    slug: row.exchangeOfficeSlug,
                    name: row.exchangeOffice,
                  },
                }}
                passHref
                legacyBehavior
              >
                <a
                  style={{ width: "150px" }}
                  className="font-medium text-[#585858] text-[18px] leading-[25px] hover:text-[#0093FB] transition duration-300 cursor-pointer hover:underline underline-offset-2"
                  title={row.exchangeOffice}
                >
                  {(() => {
                    const name = row.exchangeOffice;
                    if (name.length <= 20) return name;

                    const words = name.split(" ");
                    if (words.length <= 2) {
                      return name.length > 20
                        ? name.substring(0, 20) + "..."
                        : name;
                    }

                    return words.slice(0, 2).join(" ") + "...";
                  })()}
                </a>
              </Link>
              <style jsx>{`
                .group:hover {
                  box-shadow: 0px 20px 32px 0px #00000014;
                  background: rgba(250, 250, 250, 0.91) !important;
                }
              `}</style>
            </div>
          ))}
        </div>
      </div>

      {/* Mobile Table */}
      <div className="relative w-full bg-white rounded-lg border border-[#DEDEDE] overflow-hidden md:hidden mt-6">
        {showLeftShadow && (
          <div
            className="pointer-events-none absolute top-0 left-[60px] h-full w-10 z-30"
            style={{
              background:
                "linear-gradient(to right, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0) 100%)",
            }}
          />
        )}
        <div
          className="overflow-x-auto text-nowrap relative"
          ref={mobileTableRef}
          onScroll={handleMobileScroll}
        >
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-[#F3F4F8] border-b border-[#DEDEDE] h-[45px]">
                <th className="sticky left-0 bg-[#F3F4F8] z-20 text-left px-[16.22px] text-[14px] leading-[17px] font-bold text-[#111111] w-[70px]">
                  Rank
                </th>
                <th className="px-4 text-left text-[14px] leading-[17px] font-bold text-[#111111] w-[130px] ">
                  City
                </th>
                <th className="px-4 text-left text-[14px] leading-[17px] font-bold text-[#111111] w-[100px]">
                  Average Rate
                </th>
                <th className="px-4 text-left text-[14px] leading-[17px] font-bold text-[#111111] w-[100px]">
                  Best Rate
                </th>
                <th className="px-4 text-left text-[14px] leading-[17px] font-bold text-[#111111] w-[150px]">
                  Exchange office
                </th>
              </tr>
            </thead>
            <tbody className="bg-white">
              {rankingData.map((row) => (
                <tr
                  key={row.rank}
                  className="border-b border-[#DEDEDE] last:border-b-0"
                >
                  <td className="sticky left-0 bg-white z-20 text-left px-[16.22px] py-3 w-[70px] font-normal text-[#585858] text-[16.22px] leading-[19px]">
                    {row.rank < 10 ? `0${row.rank}` : row.rank}
                  </td>
                  <td className="text-left px-4 py-3 w-[130px] text-[#585858] text-[16.22px] font-normal ">
                    <Link
                      href={
                        row.city
                          ? `/results?bestOffice=true&source=${fromCurrency}&target=${toCurrency}&amount=${amount}&location=${row.city.toLowerCase()}`
                          : "#"
                      }
                      passHref
                      legacyBehavior
                    >
                      <a
                        className={`text-[#585858] text-[16.22px] font-normal ${
                          row.city
                            ? "hover:text-[#0093FB] transition duration-300 cursor-pointer hover:underline underline-offset-2"
                            : "text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        {row.city || "N/A"}
                      </a>
                    </Link>
                  </td>
                  <td className="px-4 py-3 w-[100px] text-[#585858] text-[16.22px] font-normal text-left">
                    {row.averageRate.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 w-[100px] text-[#585858] text-[16.22px] font-normal text-left">
                    {row.bestRate.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 w-[150px] text-[#585858] text-[16.22px] font-normal text-left">
                    <Link
                      href={{
                        pathname: "/exchange-detail",
                        query: {
                          slug: row.exchangeOfficeSlug,
                          name: row.exchangeOffice,
                        },
                      }}
                      passHref
                      legacyBehavior
                    >
                      <a
                        style={{ width: "150px" }}
                        className="font-medium text-[#585858] text-[16.22px] leading-[19px] hover:text-[#0093FB] transition duration-300 cursor-pointer hover:underline underline-offset-2"
                        title={row.exchangeOffice}
                      >
                        {(() => {
                          const name = row.exchangeOffice;
                          if (name.length <= 20) return name;

                          const words = name.split(" ");
                          if (words.length <= 2) {
                            return name.length > 20
                              ? name.substring(0, 20) + "..."
                              : name;
                          }

                          return words.slice(0, 2).join(" ") + "...";
                        })()}
                      </a>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CityRankingTable;
