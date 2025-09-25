import Image from "next/image";
import React from "react";

const frequentlySearched: string[] = [
  "Euro to dirham exchange rate today",
  "Currency exchange in Rabat city center",
  "Exchange euros to Moroccan dirhams with no fees",
  "Where to exchange euros in Rabat at the best rate",
];

const platformBenefits: string[] = [
  "Exchange Compare live exchange rates for EUR/MAD or USD/MAD",
  "Find nearby exchange offices that are currently open",
  "Set a WhatsApp alert to be notified when your target rate is reached",
];

const CurrencyExchangeRabat: React.FC<{ city?: string }> = ({
  city = "Rabat",
}) => {
  return (
    <div>
      <div className="sm:h-[648px] py-[60px] sm:py-[120px] md:px-8 px-5 bg-[url('/assets/rabat-bg-mobile.svg')] sm:bg-[url('/assets/rabat-bg.svg')] bg-center bg-cover bg-no-repeat">
        <div className="max-w-[910px] mx-auto w-full">
          <div className="text-center mb-8">
            <h4 className="text-[#3BEE5C] text-[14px] sm:text-[16px] leading-[14px] sm:leading-[16px] font-medium">
              Currency Exchange in {city}
            </h4>
            <h1 className="text-white text-[24px] sm:text-[32px] font-bold leading-[29px] sm:leading-[38px] mt-2 sm:mt-1.5 mb-4 sm:mb-3">
              Euro to Dirham Exchange Rates
            </h1>
            <p className="text-white/60 sm:text-white/70 text-[14px] sm:text-[18px] leading-[20px] sm:leading-[25px] font-normal">
              Looking for a currency exchange office in Rabat to convert your
              euros, dollars, or other foreign currencies at the best rate?
              ExchanGo24 allows you to compare euro to dirham (MAD) exchange
              rates in real time, office by office.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h2 className="text-white text-[14px] sm:text-[18px] leading-[20px] sm:leading-[25px] font-normal">
                Our users frequently search for :
              </h2>
              <ul className="mt-4 space-y-1.5 sm:space-y-2.5">
                {frequentlySearched.map((text, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Image
                      src="/assets/checkbox-arrow.svg"
                      alt="arrow"
                      width={24}
                      height={25}
                      className="w-[20px] sm:w-[24px]"
                    />
                    <h3 className="text-white text-[14px] sm:text-[18px] leading-[20px] sm:leading-[25px] font-normal">
                      {text}
                    </h3>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-white text-[14px] sm:text-[18px] leading-[20px] sm:leading-[25px] font-normal">
                With our platform :
              </h2>
              <ul className="mt-4 space-y-1.5 sm:space-y-2.5">
                {platformBenefits.map((text, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Image
                      src="/assets/checkbox-arrow.svg"
                      alt="arrow"
                      width={24}
                      height={25}
                      className="w-[20px] sm:w-[24px]"
                    />
                    <h3 className="text-white text-[14px] sm:text-[18px] leading-[20px] sm:leading-[25px] font-normal">
                      {text}
                    </h3>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-5 md:px-8">
        <div className="w-full max-w-[1142px] mx-auto">
          <div className="w-full flex items-center justify-between lg:flex-row flex-col-reverse gap-8 py-[60px] lg:py-[110px]">
            <div className="lg:max-w-[442px] w-full">
              <div className="sm:text-left text-center">
                <h3 className="text-[#20523C] text-[14px] sm:text-[16px] leading-[14px] sm:leading-[16px] font-medium">
                  Why use
                </h3>
                <h1 className="text-[#111111] text-[24px] sm:text-[32px] leading-[29px] sm:leading-[33px] font-bold mt-2 sm:mt-2.5 mb-4">
                  ExchanGo24 to exchange money in {city}?
                </h1>
                <p className="text-[#585858] text-[14px] sm:text-[18px] leading-[20px] sm:leading-[25px] font-normal lg:max-w-[350px]">
                  As a major administrative and tourist hub, it’s common for
                  both locals and visitors in Rabat to:
                </p>
              </div>
              <ul className="mt-6 max-w-[350px] w-full space-y-1.5 sm:space-y-2.5">
                <li className="flex items-center gap-3">
                  <Image
                    src="/assets/checklist.svg"
                    alt="checklist"
                    width={24}
                    height={24}
                    className="w-[20px] sm:w-[24px]"
                  />
                  <h3 className="text-[#585858] text-[14px] sm:text-[18px] leading-[20px] sm:leading-[25px] font-normal">
                    Convert euros into Moroccan dirhams
                  </h3>
                </li>
                <li className="flex items-center gap-3">
                  <Image
                    src="/assets/checklist.svg"
                    alt="checklist"
                    width={24}
                    height={24}
                    className="w-[20px] sm:w-[24px]"
                  />
                  <h3 className="text-[#585858] text-[14px] sm:text-[18px] leading-[20px] sm:leading-[25px] font-normal">
                    Identify a trusted exchange office with a good rate
                  </h3>
                </li>
                <li className="flex items-center gap-3">
                  <Image
                    src="/assets/checklist.svg"
                    alt="checklist"
                    width={24}
                    height={24}
                    className="w-[20px] sm:w-[24px]"
                  />
                  <h3 className="text-[#585858] text-[14px] sm:text-[18px] leading-[20px] sm:leading-[25px] font-normal">
                    Avoid bad exchange rates or long waiting lines
                  </h3>
                </li>
              </ul>
            </div>
            <Image
              src="/assets/exchango24-to-exchange-money-in-rabat.webp"
              alt="exchango24-to-exchange-money-in-rabat"
              width={559}
              height={644}
            />
          </div>

          <div className="w-full flex items-center justify-between lg:flex-row flex-col gap-8 py-[60px] lg:py-[110px]">
            <Image
              src="/assets/euro-to-dirham-exchange-rates.webp"
              alt="euro-to-dirham-exchange-rates"
              width={559}
              height={644}
            />
            <div className="lg:max-w-[442px] w-full">
              <div className="sm:text-left text-center lg:max-w-[350px] ">
                <h3 className="text-[#20523C] text-[14px] sm:text-[16px] leading-[14px] sm:leading-[16px] font-medium">
                  We only list reliable exchange offices
                </h3>
                <h1 className="text-[#111111] text-[24px] sm:text-[32px] leading-[29px] sm:leading-[33px] font-bold mt-2 sm:mt-2.5 mb-4">
                  Euro to Dirham Exchange Rates
                </h1>
                <p className="text-[#585858] text-[14px] sm:text-[18px] leading-[20px] sm:leading-[25px] font-normal">
                  with rates updated daily. And the best part? No hidden fees,
                  no reservation required. Examples of common searches we cover:
                </p>
              </div>
              <ul className="lg:max-w-[350px] mt-6 w-full space-y-1.5 sm:space-y-2.5">
                <li className="flex items-center gap-3">
                  <Image
                    src="/assets/checklist.svg"
                    alt="checklist"
                    width={24}
                    height={24}
                    className="w-[20px] sm:w-[24px]"
                  />
                  <h3 className="text-[#585858] text-[14px] sm:text-[18px] leading-[20px] sm:leading-[25px] font-normal">
                    Euro to dirham exchange rate Morocco
                  </h3>
                </li>
                <li className="flex items-center gap-3">
                  <Image
                    src="/assets/checklist.svg"
                    alt="checklist"
                    width={24}
                    height={24}
                    className="w-[20px] sm:w-[24px]"
                  />
                  <h3 className="text-[#585858] text-[14px] sm:text-[18px] leading-[20px] sm:leading-[25px] font-normal">
                    Euro dirham converter Morocco
                  </h3>
                </li>
                <li className="flex items-center gap-3">
                  <Image
                    src="/assets/checklist.svg"
                    alt="checklist"
                    width={24}
                    height={24}
                    className="w-[20px] sm:w-[24px]"
                  />
                  <h3 className="text-[#585858] text-[14px] sm:text-[18px] leading-[20px] sm:leading-[25px] font-normal">
                    Currency exchange office open in Rabat today
                  </h3>
                </li>
                <li className="flex items-center gap-3">
                  <Image
                    src="/assets/checklist.svg"
                    alt="checklist"
                    width={24}
                    height={24}
                    className="w-[20px] sm:w-[24px]"
                  />
                  <h3 className="text-[#585858] text-[14px] sm:text-[18px] leading-[20px] sm:leading-[25px] font-normal">
                    Dirham to euro exchange rate
                  </h3>
                </li>
                <li className="flex items-center gap-3">
                  <Image
                    src="/assets/checklist.svg"
                    alt="checklist"
                    width={24}
                    height={24}
                    className="w-[20px] sm:w-[24px]"
                  />
                  <h3 className="text-[#585858] text-[14px] sm:text-[18px] leading-[20px] sm:leading-[25px] font-normal">
                    Euro to Moroccan dirham live rate
                  </h3>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrencyExchangeRabat;
