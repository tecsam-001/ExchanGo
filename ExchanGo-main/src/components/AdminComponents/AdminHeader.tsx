"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

const AdminHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { logout, user } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      // The AuthContext logout function already handles redirection
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

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
      <div className="relative" ref={dropdownRef}>
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center md:gap-4 cursor-pointer"
        >
          <div>
            <Image
              src={user?.photo?.path || "/assets/admin-profile.svg"}
              alt="admin-profile"
              width={52}
              height={52}
              className="md:w-[52px] w-[32px] rounded-full object-cover"
            />
          </div>
          <div className="flex items-start flex-col gap-0.5">
            <div className="flex items-center gap-2.5">
              <h2 className="text-[#111111] text-[16px] font-medium leading-[19px] md:block hidden">
                {user?.firstName && user?.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email?.split("@")[0] || "Admin User"}
              </h2>
              <svg
                width="25"
                height="26"
                className="ml-5 md:block hidden"
                viewBox="0 0 25 26"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20.8713 9.90625L14.2612 16.5163C13.4806 17.2969 12.2032 17.2969 11.4225 16.5163L4.8125 9.90625"
                  stroke="#292D32"
                  strokeWidth="1.52072"
                  strokeMiterlimit="10"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className="text-[#585858] text-[16px] font-normal leading-[22px] md:block hidden">
              {user?.role?.name === "admin" ? "Admin" : ""} ExchangeGo24
            </div>
          </div>
        </div>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-50">
            <button
              onClick={handleLogout}
              className="w-full cursor-pointer px-4 py-2 text-left text-[#BF1212] hover:bg-[#FFF5F5] flex items-center gap-2 text-[14px] font-medium"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M7.41699 6.3002C7.67533 3.3002 9.21699 2.0752 12.592 2.0752H12.7003C16.4253 2.0752 17.917 3.56686 17.917 7.29186V12.7252C17.917 16.4502 16.4253 17.9419 12.7003 17.9419H12.592C9.24199 17.9419 7.70033 16.7335 7.42533 13.7835"
                  stroke="#BF1212"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12.499 10H3.01562"
                  stroke="#BF1212"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4.87467 7.20801L2.08301 9.99967L4.87467 12.7913"
                  stroke="#BF1212"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminHeader;
