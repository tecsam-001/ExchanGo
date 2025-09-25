"use client";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ExchangeCard {
  id: string;
  title: string;
  description: string;
  mobileDescription: string;
  buttonText: string;
  icon: string;
  mobileIcon: string;
}

interface ExchangeCardProps {
  card: ExchangeCard;
  isHovered: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onButtonClick: () => void;
}

const exchangeCardsData: ExchangeCard[] = [
  {
    id: "expatriates",
    title: "Expatriates",
    description:
      "Exchange often? Don't lose out on every transaction. Compare nearby exchange offices and make the most of every transaction.",
    mobileDescription:
      "Exchange often? Don't miss out. Compare nearby exchange offices and get the best value",
    buttonText: "View rates near me",
    icon: "/assets/simplified/expatriates.svg",
    mobileIcon: "/assets/simplified/expatriates-mobile.svg",
  },
  {
    id: "traveler",
    title: "Traveler",
    description:
      "Convert as soon as you land, no more tourist traps. Find the best rates in every city you visit.",
    mobileDescription:
      "Land and convert. Skip tourist traps. Find the best rates nearby.",
    buttonText: "Star Searching",
    icon: "/assets/simplified/traveler.svg",
    mobileIcon: "/assets/simplified/traveler-mobile.svg",
  },
  {
    id: "investor",
    title: "Investor",
    description:
      "One point in the rates can mean hundreds. Compare side-by-side and get the best rate for large amounts.",
    mobileDescription:
      "A small rate difference can cost you hundreds. Compare and get the best deal.",
    buttonText: "Simulate Exchange",
    icon: "/assets/simplified/investor.svg",
    mobileIcon: "/assets/simplified/investor-mobile.svg",
  },
  {
    id: "international-student",
    title: "International student",
    description:
      "Small budget, big difference. Convert at the right time, in the right place, with no surprises.",
    mobileDescription:
      "Small budget? Make it go further. Convert at the right time and place.",
    buttonText: "Find nearby rates",
    icon: "/assets/simplified/international-student.svg",
    mobileIcon: "/assets/simplified/international-student-mobile.svg",
  },
];

const ExchangeCard: React.FC<ExchangeCardProps> = ({
  card,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onButtonClick,
}) => {
  return (
    <div
      className="max-w-[315px] mx-auto sm:max-w-full w-full border border-[#808080] sm:border-[#434343] rounded-[16px] py-6 md:py-[64px] px-[22px] sm:px-4 xl:px-[22px] relative overflow-hidden flex items-center justify-center flex-col sm:text-center"
      style={{
        background: "linear-gradient(180deg, #0F2B1C 0%, #20523C 100%)",
        backdropFilter: "blur(52.22947311401367px)",
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          isHovered ? "opacity-30" : "opacity-0"
        }`}
        style={{
          background: "linear-gradient(0deg, #2A6B4A 100%, #1A3D2B 0%)",
        }}
      />
      <div className="relative z-40 opacity-100 w-full h-full flex sm:items-center sm:justify-center flex-col justify-between">
        <div className="flex flex-col items-start sm:items-center flex-grow">
          <Image
            src={card.icon}
            alt={card.title}
            width={120}
            height={120}
            className="hidden sm:block"
          />
          <Image
            src={card.mobileIcon}
            alt={card.title}
            width={64}
            height={64}
            className="sm:hidden block"
          />
          <h1 className="mt-4 sm:mt-8 mb-2 text-white text-[18px] sm:text-[20px] leading-[22px] sm:leading-[24px] font-bold">
            {card.title}
          </h1>
          <p className="text-white/60 text-[16px] leading-[22px] font-normal hidden sm:block">
            {card.description}
          </p>
          <p className="text-white/60 text-[14px] sm:text-[16px] leading-[20px] sm:leading-[22px] font-normal sm:hidden block">
            {card.mobileDescription}
          </p>
        </div>
        <button
          onClick={onButtonClick}
          className="mt-6 sm:mt-8 px-2 w-full h-[46px] cursor-pointer text-nowrap rounded-md relative text-[#20523C] text-[16px] font-semibold leading-[22px] flex items-center gap-2.5 justify-center"
          style={{
            background:
              "radial-gradient(65.83% 94.77% at 50.34% 116.3%, #C3F63C 0%, #54D10E 100%)",
            border: "1px solid rgba(255, 255, 255, 0.4)",
            boxShadow:
              "0px 4px 4px 0px #FFFFFF52 inset, 0px -4px 4px 0px #FFFFFF52 inset",
          }}
        >
          {card.buttonText}
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12.0234 4.94141L17.0818 9.99974L12.0234 15.0581"
              stroke="#20523C"
              strokeWidth="2"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2.91797 10H16.943"
              stroke="#20523C"
              strokeWidth="2"
              strokeMiterlimit="10"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

const ExchangeSimplified: React.FC = () => {
  const [hoveredCardId, setHoveredCardId] = useState<string | null>(null);
  const router = useRouter();

  const handleCardButtonClick = () => {
    router.push("/results?location=Casablanca&amount=1&source=EUR&target=MAD");
  };

  return (
    <div
      className="w-full px-5 md:px-8 py-[60px] md:py-20 lg:py-[140px]"
      style={{
        background: "url('/assets/exchange-simplified-bg.webp')",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-[1142px] mx-auto w-full">
        <div className="sm:text-left text-center">
          <h3 className="text-[#3BEE5C] text-[14px] sm:text-[16px] leading-[14px] sm:leading-[16px] font-medium">
            Exchange, Simplified.
          </h3>
          <h1 className="text-[24px] sm:text-[32px] text-white leading-[29px] sm:leading-[38px] font-bold mb-4 sm:mb-2 mt-2 sm:mt-2.5">
            Smart tools for smarter currency exchange.
          </h1>
          <p className="text-white/60 text-[14px] sm:text-[18px] leading-[20px] sm:leading-[25px] font-normal">
            We help you make better currency decisions, no matter where life
            takes you.
          </p>
        </div>
        <div className="mt-6 md:mt-[42px] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 xl:gap-[22px]">
          {exchangeCardsData.map((card) => (
            <ExchangeCard
              key={card.id}
              card={card}
              isHovered={hoveredCardId === card.id}
              onMouseEnter={() => setHoveredCardId(card.id)}
              onMouseLeave={() => setHoveredCardId(null)}
              onButtonClick={handleCardButtonClick}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ExchangeSimplified;
