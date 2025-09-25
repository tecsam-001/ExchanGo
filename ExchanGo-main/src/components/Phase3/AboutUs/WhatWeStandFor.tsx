"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import MAPBOX_TOKEN from "../../Phase1/HomePage/mapboxConfig";
import Loader from "../../ui/Loader";

const WhatWeStandFor = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleFindBestRate = async () => {
    setIsLoading(true);

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_TOKEN}&types=place`
            );
            const data = await response.json();
            const cityName = data.features[0]?.text || "Casablanca";
            router.push(
              `/results?location=${encodeURIComponent(
                cityName
              )}&amount=1&source=EUR&target=MAD`
            );
          } catch (error) {
            console.error("Error getting city name:", error);
            router.push(
              "/results?location=Casablanca&amount=1&source=EUR&target=MAD"
            );
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          router.push(
            "/results?location=Casablanca&amount=1&source=EUR&target=MAD"
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      router.push(
        "/results?location=Casablanca&amount=1&source=EUR&target=MAD"
      );
    }
  };
  return (
    <div
      className="h-[400px] sm:h-[500px] flex justify-center items-center flex-col text-center px-5"
      style={{
        background: "url('/assets/what-we-stand-for-bg.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <h3 className="text-[#3BEE5C] text-[16px] leading-[16px] font-medium">
        EXCHANGEGO24
      </h3>
      <h1 className="text-white text-[25px] sm:text-[32px] leading-[32px] sm:leading-[38px] font-bold mt-2.5">
        What we stand for
      </h1>
      <p className="text-white/60 text-[16px] sm:text-[18px] leading-[22px] sm:leading-[25px] font-normal my-3 sm:my-4 max-w-[650px] w-full">
        At Exchango24, we believe a good service should not complicate things.
        It should simply help you do better… what you're already doing.
      </p>
      <h3 className="text-white text-[16px] sm:text-[18px] leading-[22px] sm:leading-[25px] font-medium mb-8">
        See Clearly. Choose Quickly. Act Freely.
      </h3>
      <button
        className="px-6 h-[46px] cursor-pointer rounded-md relative text-[#20523C] text-base font-semibold leading-[22px] flex items-center justify-center gap-2"
        style={{
          background:
            "radial-gradient(65.83% 94.77% at 50.34% 116.3%, #C3F63C 0%, #54D10E 100%)",
          border: "1px solid rgba(255, 255, 255, 0.4)",
          boxShadow:
            "0px 4px 4px 0px #FFFFFF52 inset, 0px -4px 4px 0px #FFFFFF52 inset",
        }}
        onClick={handleFindBestRate}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader isLoading={true} />
            Finding best rate...
          </>
        ) : (
          "Find the best rate"
        )}
      </button>
    </div>
  );
};

export default WhatWeStandFor;
