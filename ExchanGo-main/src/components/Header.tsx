import React from "react";
import Image from "next/image";
import ArrowSteps from "./SvgIcons/ArrowSteps";
import Link from "next/link";

interface HeaderProps {
  step: number;
  maxStep: number;
  handleSignIn: () => void;
  handleStepChange: (step: number) => void;
}

const Header: React.FC<HeaderProps> = ({
  step,
  maxStep,
  handleSignIn,
  handleStepChange,
}) => {
  const SignInButton = () => {
    return (
      <button
        onClick={handleSignIn}
        className="sm:border border-[#20523C] text-nowrap sm:hover:bg-[#20523C] transition duration-300 sm:hover:text-white h-[46px] sm:px-6 rounded-[6px] text-[#20523C] text-sm sm:text-base font-bold sm:font-medium cursor-pointer"
      >
        Sign In
      </button>
    );
  };

  const handleStepClick = (targetStep: number) => {
    if (targetStep <= maxStep) {
      handleStepChange(targetStep);
    }
  };

  return (
    <header className="overflow-hidden lg:h-[94px] flex justify-between lg:flex-row flex-col items-center gap-4 py-5 sm:py-6 px-5 md:px-6 lg:px-8 border-b border-[#DEDEDE]">
      <div className="flex items-center w-full lg:w-fit justify-between">
        <Link href='/'>
          <Image
            src="/assets/logo.svg"
            alt="ExchanGo24"
            width={190}
            height={41}
            className="sm:w-[190px] w-[143px]"
          />
        </Link>
        <div className="lg:hidden block">
          <SignInButton />
        </div>
      </div>

      <div className="overflow-x-auto hide-scrollbar w-full lg:w-fit">
        <div className="flex items-center gap-3 lg:gap-4 text-nowrap">
          <div
            onClick={() => handleStepClick(1)}
            className={`flex items-center gap-1.5 text-sm leading-[20px] ${step >= 1 ? "text-[#111111]" : "text-[#6B7280]"
              } ${step === 1 ? "font-medium" : "font-normal"
              } cursor-pointer hover:opacity-80`}
          >
            <span
              className={`min-w-[20px] h-[20px] rounded-full border-[0.5px] border-[#DEDEDE] flex items-center justify-center text-[12px] font-medium ${step >= 1 ? "text-[#111111]" : "text-[#6B7280]"
                }`}
            >
              1
            </span>
            Register Account
          </div>
          <ArrowSteps />
          <div
            onClick={() => handleStepClick(2)}
            className={`flex items-center gap-1.5 text-sm leading-[20px] ${step >= 2 ? "text-[#111111]" : "text-[#6B7280]"
              } ${step === 2 ? "font-medium" : "font-normal"} ${maxStep >= 2 ? "cursor-pointer hover:opacity-80" : ""
              }`}
          >
            <span
              className={`min-w-[20px] h-[20px] rounded-full border-[0.5px] border-[#DEDEDE] flex items-center justify-center text-[12px] font-medium ${step >= 2 ? "text-[#111111]" : "text-[#6B7280]"
                }`}
            >
              2
            </span>
            Office Information
          </div>
          <ArrowSteps />
          <div
            onClick={() => handleStepClick(3)}
            className={`flex items-center gap-1.5 text-sm leading-[20px] ${step >= 3 ? "text-[#111111]" : "text-[#6B7280]"
              } ${step === 3 ? "font-medium" : "font-normal"} ${maxStep >= 3 ? "cursor-pointer hover:opacity-80" : ""
              }`}
          >
            <span
              className={`min-w-[20px] h-[20px] rounded-full border-[0.5px] border-[#DEDEDE] flex items-center justify-center text-[12px] font-medium ${step >= 3 ? "text-[#111111]" : "text-[#6B7280]"
                }`}
            >
              3
            </span>
            Set Location
          </div>
        </div>
      </div>

      <div className="lg:block hidden">
        <SignInButton />
      </div>
    </header>
  );
};

export default Header;
