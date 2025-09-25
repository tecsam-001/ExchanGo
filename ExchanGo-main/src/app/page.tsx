"use client";
import React, { Suspense, useEffect, useState } from "react";
import Hero from "@/components/Phase1/HomePage/Hero";
import Partner from "@/components/Phase1/HomePage/Partner";
import TheBestReasons from "@/components/Phase1/HomePage/TheBestReasons";
import CityRanking from "@/components/Phase1/HomePage/CityRanking";
import QuickAndEasy from "@/components/Phase1/HomePage/QuickAndEasy";
import ExchangeSimplified from "@/components/Phase1/HomePage/ExchangeSimplified";
import Testimonials from "@/components/Phase1/HomePage/Testimonials";
import FAQ from "@/components/Phase1/HomePage/FAQ";
import BestDealsAreWaiting from "@/components/BestDealsAreWaiting";
import Footer from "@/components/Footer";
import { useRouter } from "next/navigation";
import MAPBOX_TOKEN from "@/components/Phase1/HomePage/mapboxConfig";

const Home: React.FC = () => {
  const [showFloatingButton, setShowFloatingButton] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShowFloatingButton(true);
      } else {
        setShowFloatingButton(false);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSearchRates = async () => {
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
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Hero />
      </Suspense>
      <Partner />
      <TheBestReasons />
      <CityRanking />
      <QuickAndEasy />
      <ExchangeSimplified />
      <Testimonials />
      <FAQ />
      <BestDealsAreWaiting />
      <Footer />
      {/* Floating Search Rates Button */}
      {showFloatingButton && (
        <button
          onClick={handleSearchRates}
          className="fixed cursor-pointer bottom-4 sm:bottom-6 right-4 sm:right-6 z-50 px-6 py-3 bg-black text-white rounded-[10px] text-[16px] leading-[22px] font-semibold shadow-lg transition-opacity duration-300"
          style={{
            boxShadow: "0px 20px 32px 0px #0000003D, 0px 2px 4px 0px #00000029",
          }}
        >
          Search Rates
        </button>
      )}
    </>
  );
};

export default Home;
