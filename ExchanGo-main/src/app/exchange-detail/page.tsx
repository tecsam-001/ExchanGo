import BestDealsAreWaiting from "@/components/BestDealsAreWaiting";
import Footer from "@/components/Footer";
import Navbar from "@/components/Phase1/Navbar";
import React, { Suspense } from "react";
import ExchangeDetailWrapper from "./ExchangeDetailWrapper";
import { HoverProvider } from "@/context/HoverContext";

const Page = () => {
  return (
    <>
      <div className="py-6 md:py-[42px] border-b border-[#DEDEDE] md:px-8 px-5">
        <Navbar />
      </div>
      <Suspense
        fallback={
          <div className="flex justify-center items-center min-h-[50vh]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#20523C]"></div>
          </div>
        }
      >
        <HoverProvider>
          <ExchangeDetailWrapper />
        </HoverProvider>
      </Suspense>
      <BestDealsAreWaiting />
      <Footer />
    </>
  );
};

export default Page;
