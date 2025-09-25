import React from "react";
import Navbar from "../Navbar";
import CheckRates from "./CheckRates/CheckRates";

const Hero = () => {
  return (
    <div className="w-full">
      <div
        className="w-full pt-6 lg:pt-[42px] px-5 md:px-8"
        style={{
          background: "url('/assets/homepage-bg.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        <Navbar />
        <div className="md:text-left text-center pb-[75px] md:pb-[124px] mt-8 sm:mt-12 md:mt-[102px] max-w-[1240px] mx-auto w-full flex items-start justify-between md:flex-row flex-col gap-4">
          <div className="w-full">
            <h4 className="text-[#3BEE5C] text-[14px] sm:text-[24px] leading-[14px] sm:leading-[24px] font-medium">
              Live. Smart. Transparent
            </h4>
            <h1
              className="mt-2 md:mt-0 md:min-w-[430px] text-[32px] sm:text-[60px] lg:text-[85px] xl:text-[112px] leading-[35px] sm:leading-[70px] lg:leading-[100px] xl:leading-[123px] font-extrabold text-white"
              style={{ textShadow: "0px 10px 10px 0px #0000003D" }}
            >
              Your Money <br /> Deserves More
            </h1>
          </div>
          <p className="md:mt-6 lg:mt-[59px] text-white/60 text-[14px] sm:text-[18px] leading-[20px] sm:leading-[25px] font-normal max-w-[600px] mx-auto md:max-w-[397px]">
            Search & compare the best exchange rates around you, displayed on an
            interactive map. Find the best rates near you in just seconds.
          </p>
        </div>
      </div>
      {/* check rates */}
      <div className="md:px-8 px-5">
        <CheckRates />
      </div>
    </div>
  );
};

export default Hero;
