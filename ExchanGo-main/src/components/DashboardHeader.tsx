"use client";

import Image from "next/image";
import React from "react";
import ToggleButton from "./ui/ToggleButton";
import { useVisibility } from "@/context/VisibilityContext";
import ProfileDropdown from "./ui/ProfileDropdown";
import Link from "next/link";

const DashboardHeader = () => {
  const { isVisible, setIsVisible, isLoading } = useVisibility();

  return (
    <div className="mt-6 lg:mt-[42px] mb-[32px] lg:mb-[52px] max-w-[1160px] px-5 mx-auto w-full flex items-center justify-between">
      <Link href="/">
        <Image
          src="/assets/logo.svg"
          alt="logo"
          width={190}
          height={41}
          className="md:w-[190px] w-[143px]"
        />
      </Link>
      <div className="flex items-center gap-3 md:gap-6">
        <div className="flex items-center gap-2">
          <ToggleButton
            checked={isVisible}
            size="lg"
            onChange={setIsVisible}
            disabled={isLoading}
            aria-label="Visible for user"
          />
          <h2 className="text-[#111111] cursor-pointer text-[16px] font-normal md:block hidden">
            Visible for user
          </h2>
        </div>
        <ProfileDropdown />
      </div>
    </div>
  );
};

export default DashboardHeader;
