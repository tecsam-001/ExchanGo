import React from "react";
import GradientButton from "../ui/GradientButton";
import Image from "next/image";
import Link from "next/link";

type WhyCard = {
  id: number;
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
};

const whyCards: WhyCard[] = [
  {
    id: 1,
    title: "1. Live Rate",
    description: "Open the map and find nearby money changers",
    imageSrc: "/assets/live-rate.svg",
    imageAlt: "live-rate",
  },
  {
    id: 2,
    title: "2. All offices in Rabat on one map",
    description: "View the latest exchange rates and choose the best offer",
    imageSrc: "/assets/all-offices-in-rabat-on-one-map.svg",
    imageAlt: "all-offices-in-rabat-on-one-map",
  },
  {
    id: 3,
    title: "3. No Hidden Fee",
    description:
      "Go directly or make a reservation to ensure currency availability",
    imageSrc: "/assets/no-hidden-fee.svg",
    imageAlt: "no-hidden-fee",
  },
];

const Why: React.FC<{ city?: string }> = ({ city = "Rabat" }) => {
  return (
    <div className="w-full py-20 md:py-[100px] md:px-8 px-5">
      <div className="max-w-[1142px] mx-auto w-full text-center">
        <h4 className="text-[#20523C] text-[14px] sm:text-[16px] leading-[14px] sm:leading-[16px] font-medium">
          Why
        </h4>
        <h1 className="text-[#111111] text-[24px] sm:text-[32px] leading-[29px] sm:leading-[38px] font-bold mt-2 sm:mt-2.5 mb-4">
          Use ExchanGo24 in {city}?
        </h1>
        <p className="text-[#585858] text-[14px] sm:text-[18px] leading-[20px] sm:leading-[25px] font-normal max-w-[676px] mx-auto mb-4">
          Sed ut perspiciatis unde omnis iste natus error sit voluptatem
          accusantium doloremque laudantium, totam rem aperiam
        </p>
        <Link
          href={`/results?location=${encodeURIComponent(city.toLowerCase())}`}
        >
          <GradientButton>Start Comparing Now</GradientButton>
        </Link>

        <div className="mt-[52px] md:mt-[42px] w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[25px]">
          {whyCards.map(({ id, title, description, imageSrc, imageAlt }) => (
            <div
              key={id}
              className="border border-[#DEDEDE] rounded-[18px] bg-white pb-10 pt-10 md:pb-[38px] px-6 sm:px-8 flex items-center justify-center flex-col hover:shadow-lg transition duration-200"
            >
              <Image src={imageSrc} alt={imageAlt} width={120} height={120} />
              <div className="mt-8">
                <h2 className="mb-2 text-[#111111] text-[18px] leading-[22px] font-bold">
                  {title}
                </h2>
                <p className="text-[#585858] text-[16px] leading-[22px] font-normal">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Why;
