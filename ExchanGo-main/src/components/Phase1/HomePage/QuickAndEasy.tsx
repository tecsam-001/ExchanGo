"use client";
import GradientButton from "@/components/ui/GradientButton";
import Image from "next/image";
import React from "react";
import { useRouter } from "next/navigation";
import MAPBOX_TOKEN from "./mapboxConfig";
import Loader from "@/components/ui/Loader";

interface StepData {
  id: number;
  title: string;
  desktopDescription: string;
  mobileDescription: string;
  desktopImage: string;
  mobileImage: string;
  alt: string;
}

const QuickAndEasy: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = React.useState(false);

  const stepsData: StepData[] = [
    {
      id: 1,
      title: "1. Search by city or nearby offices",
      desktopDescription:
        "Find money changers around you. Enter a city or enable geolocation to instantly see the closest exchange offices and their current rates.",
      mobileDescription:
        "Find nearby money changers. Enter a city or turn on location to see rates.",
      desktopImage: "/assets/search-by-city-or-nearby-offices.png",
      mobileImage: "/assets/search-by-city-mobile.svg",
      alt: "Search by city or nearby offices",
    },
    {
      id: 2,
      title: "2. Compare real-time rates",
      desktopDescription:
        "Pick the best available deal. Browse updated rates from multiple exchange offices, along with their distance, opening hours, and live status.",
      mobileDescription:
        "Compare live rates, distance, and hours to get the best deal.",
      desktopImage: "/assets/compare-real-time-rates.png",
      mobileImage: "/assets/compare-real-time-rates-mobile.svg",
      alt: "Compare real-time rates",
    },
    {
      id: 3,
      title: "3. Visit with confidence",
      desktopDescription:
        "Head straight to your chosen exchange office. Use the interactive map and reliable details to make your exchange without stress or surprises.",
      mobileDescription:
        "Find your exchange fast. Clear map and info make it easy",
      desktopImage: "/assets/visit-with-confidence.png",
      mobileImage: "/assets/visit-with-confidence-mobile.svg",
      alt: "Visit with confidence",
    },
  ];

  const handleSeeRatesNearMe = async () => {
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
    <div className="w-full py-20 md:py-[140px] md:px-8 px-5">
      <Loader isLoading={isLoading} />
      <div className="max-w-[1142px] mx-auto w-full text-center">
        <h4 className="text-[#20523C] text-[14px] sm:text-[16px] leading-[14px] sm:leading-[16px] font-medium">
          Quick and Easy
        </h4>
        <h1 className="text-[#111111] text-[24px] sm:text-[32px] leading-[29px] sm:leading-[38px] font-bold mt-2 sm:mt-2.5 mb-4">
          Exchange at the best rate in 3 simple steps
        </h1>
        <p className="text-[#585858] text-[14px] sm:text-[18px] leading-[20px] sm:leading-[25px] font-normal max-w-[600px] mx-auto mb-4">
          Finding the best exchange rate has never been easier! Search, compare,
          and exchange. all in just a few clicks
        </p>
        <GradientButton onClick={handleSeeRatesNearMe}>
          See rates near me
        </GradientButton>

        <div className="mt-8 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[25px]">
          {stepsData.map((step) => (
            <div
              key={step.id}
              className="border border-[#DEDEDE] rounded-[18px] bg-white pt-6 sm:pt-0 flex items-center justify-center flex-col"
            >
              <Image
                src={step.desktopImage}
                alt={step.alt}
                width={364}
                height={180}
                className="w-full hidden sm:block"
              />
              <Image
                src={step.mobileImage}
                alt={step.alt}
                width={120}
                height={120}
                className="sm:hidden block"
              />
              <div className="px-6 md:px-8 pb-6 md:pb-[34px] mt-6 sm:mt-[18px]">
                <h2 className="mb-2 text-[#111111] text-[18px] leading-[22px] font-bold">
                  {step.title}
                </h2>
                <p className="text-[#585858] text-[14px] sm:text-[16px] leading-[20px] sm:leading-[22px] font-normal hidden sm:block">
                  {step.desktopDescription}
                </p>
                <p className="text-[#585858] text-[14px] sm:text-[16px] leading-[20px] sm:leading-[22px] font-normal sm:hidden block">
                  {step.mobileDescription}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default QuickAndEasy;
