import React from "react";
import Navbar from "../Phase1/Navbar";
import CheckRatesSpesific from "./CheckRates/CheckRatesSpesific";

interface HeroProps {
  city?: string;
  onCheckRates?: (params: {
    source: string;
    target: string;
    amount: string;
    location: string;
    lat?: number;
    lng?: number;
  }) => void;
}

const Hero: React.FC<HeroProps> = ({ city = "Rabat", onCheckRates }) => {
  return (
    <div className="w-full">
      <div
        className="relative pt-6 md:pt-[42px] h-[350px] sm:h-[450px] px-5 md:px-8"
        style={{ backgroundImage: "url(/assets/spesific-hero-bg.jpg)" }}
      >
        <div
          className="absolute inset-0 top-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0, 0, 0, 0.8) 20.71%, rgba(0, 0, 0, 0) 100%)",
            height: "140px",
          }}
        />

        <div className="relative z-10">
          <Navbar />
          <div className="text-center mt-[25.35px] sm:mt-[76px]">
            <h4 className="text-[#3BEE5C] text-[16px] leading-[16px] font-medium mb-2.5">
              Bureau de change à {city}
            </h4>
            <h1 className="text-white text-[26px] sm:text-[52px] leading-[29px] sm:leading-[62px] font-bold mb-1.5">
              Comparez les meilleurs taux de change
            </h1>
            <p className="text-white/60 text-[14px] sm:text-[18px] leading-[20px] sm:leading-[25px] font-normal">
              Safe, trusted, and offering competitive rates for your dirham
              conversions.
            </p>
          </div>
        </div>
      </div>
      <div className="md:px-8 px-5 relative -mt-[80px]">
        <CheckRatesSpesific onCheckRates={onCheckRates} />
      </div>
    </div>
  );
};

export default Hero;
