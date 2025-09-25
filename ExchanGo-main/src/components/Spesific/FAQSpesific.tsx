"use client";
import Image from "next/image";
import React, { useState } from "react";
interface FAQItem {
  id: number;
  question: string;
  answer: string;
}
const FAQSpesific: React.FC<{ city?: string }> = ({ city = "Rabat" }) => {
  const [openFAQ, setOpenFAQ] = useState<number | null>(1);
  const faqData: FAQItem[] = [
    {
      id: 1,
      question: "Where can I find a trusted exchange office in Rabat?",
      answer:
        "To complete KYC (Know Your Customer) verification, users from Rabat City need to provide a valid national ID or passport, along with proof of residence such as a utility bill or bank statement issued within the last 3 months.",
    },
    {
      id: 2,
      question:
        "What documents are required for KYC verification in Rabat City?",
      answer:
        "To complete KYC (Know Your Customer) verification, users from Rabat City need to provide a valid national ID or passport, along with proof of residence such as a utility bill or bank statement issued within the last 3 months.",
    },
    {
      id: 3,
      question: "Can I deposit or withdraw using Moroccan dirhams (MAD)?",
      answer:
        "To complete KYC (Know Your Customer) verification, users from Rabat City need to provide a valid national ID or passport, along with proof of residence such as a utility bill or bank statement issued within the last 3 months.",
    },
    {
      id: 4,
      question: "Are all exchange rates the same in Rabat?",
      answer:
        "To complete KYC (Know Your Customer) verification, users from Rabat City need to provide a valid national ID or passport, along with proof of residence such as a utility bill or bank statement issued within the last 3 months.",
    },
    {
      id: 5,
      question: "Can I exchange euros for dirhams?",
      answer:
        "To complete KYC (Know Your Customer) verification, users from Rabat City need to provide a valid national ID or passport, along with proof of residence such as a utility bill or bank statement issued within the last 3 months.",
    },
  ];
  const toggleFAQ = (faqId: number) => {
    setOpenFAQ((prev) => (prev === faqId ? null : faqId));
  };
  return (
    <div className="py-20 md:pt-[150px] md:pb-[120px] relative h-auto overflow-hidden">
      <Image
        src="/assets/faq-arrows-bg.svg"
        alt="arrows"
        width={600}
        height={700}
        className="absolute right-0 bottom-10 md:block hidden"
      />
      <div className="max-w-[910px] mx-auto w-full relative z-40 px-4">
        <div className="text-center">
          <h4 className="text-[#20523C] text-[14px] sm:text-[16px] leading-[14px] sm:leading-[16px] font-medium">
            FAQ
          </h4>
          <h1 className="text-[#111111] text-[24px] sm:text-[32px] leading-[29px] sm:leading-[38px] font-bold mt-2 sm:mt-2.5 mb-4">
            Money Exchange Made Easy in {city} City
          </h1>
          <p className="text-[#585858] text-[14px] sm:text-[18px] leading-[20px] sm:leading-[25px] font-normal max-w-[676px] mx-auto">
            Learn how to exchange currency, verify your identity, and access
            local support in {city} City. A quick guide for first-time and
            returning users.
          </p>
        </div>

        {/* FAQ */}
        <div className="mt-6 md:mt-8 space-y-4 md:space-y-6">
          {faqData.map((faq) => (
            <div
              key={faq.id}
              onClick={() => toggleFAQ(faq.id)}
              className={`p-6 md:px-[42px] md:py-[38px] bg-white rounded-[16px] md:rounded-[24px] w-full transition-all duration-500 ease-in-out cursor-pointer ${
                openFAQ === faq.id
                  ? "shadow-[0px_20px_32px_0px_#00000014] border border-transparent"
                  : "border border-[#DEDEDE] hover:shadow-[0px_8px_16px_0px_#00000008]"
              }`}
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="text-[#111111] text-[14px] md:text-[20px] leading-[20px] md:leading-[24px] font-medium">
                  {faq.question}
                </h3>
                <div
                  className="flex-shrink-0 transition-all duration-500 ease-in-out hover:scale-110"
                  style={{
                    transform:
                      openFAQ === faq.id ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <svg
                    width="25"
                    height="25"
                    viewBox="0 0 25 25"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M20.8595 9.07227L14.2495 15.6823C13.4689 16.4629 12.1915 16.4629 11.4108 15.6823L4.80078 9.07227"
                      stroke="#292D32"
                      strokeWidth="1.52072"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
              </div>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out origin-top ${
                  openFAQ === faq.id
                    ? "max-h-96 opacity-100 transform scale-y-100"
                    : "max-h-0 opacity-0 transform scale-y-0"
                }`}
              >
                <div className="pt-2.5">
                  <p className="text-[#585858] text-[14px] md:text-[18px] leading-[20px] md:leading-[25px] font-normal">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQSpesific;
