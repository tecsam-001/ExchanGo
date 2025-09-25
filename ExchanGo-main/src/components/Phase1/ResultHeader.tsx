"use client";
import Image from "next/image";
import Link from "next/link";
import React, { useState } from "react";
import Dashboard from "../SvgIcons/Dashboard";
import ToggleButton from "../ui/ToggleButton";
import { useAuth } from "@/context/AuthContext";

interface NavigationLink {
  href: string;
  label: string;
}

const ResultHeader: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const { logout, user } = useAuth();

  const navigationLinks: NavigationLink[] = [
    { href: "/about-us", label: "About" },
    { href: "/faq", label: "FAQ" },
    { href: "/home", label: "Register my office" },
    { href: "https://blog.exchango24.com", label: "Blog" },
  ];

  const toggleMenu = (): void => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = (): void => {
    setIsMenuOpen(false);
  };

  const handleLogout = async () => {
    try {
      closeMenu();
      await logout();
      // The AuthContext logout function already handles redirection
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <>
      <div className="w-full md:px-8 px-5">
        <div className="w-full h-[42px] mt-4 sm:mt-8 md:mt-[42px] mb-8 flex items-center justify-between max-w-[1376px] mx-auto">
          <div className="flex items-center gap-10">
            <Link href="/">
              <Image
                src="/assets/logo.svg"
                alt="Logo"
                width={190}
                height={41.05}
                className="md:w-[190px] w-[143px]"
              />
            </Link>

            {/* Desktop Menu */}
            <ul className="hidden lg:flex items-center gap-4">
              {navigationLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[#585858] text-[16px] leading-[22px] font-normal hover:text-[#20523C] transition-colors duration-300"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <Link
            href="/login"
            className="hidden lg:flex items-center justify-center h-[46px] px-6 border border-[#20523C] rounded-md text-[#20523C] text-[16px] leading-[22px] font-medium cursor-pointer transition duration-300 hover:bg-[#20523C] hover:text-white"
          >
            Exchange office Space
          </Link>

          <button
            onClick={toggleMenu}
            className="lg:hidden flex flex-col items-center justify-center w-8 h-8 space-y-1.5 cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            <svg
              width="24"
              height="25"
              viewBox="0 0 24 25"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 7.64893H21"
                stroke="#111111"
                strokeWidth="1.35"
                strokeLinecap="round"
              />
              <path
                d="M3 12.6489H21"
                stroke="#111111"
                strokeWidth="1.35"
                strokeLinecap="round"
              />
              <path
                d="M3 17.6489H21"
                stroke="#111111"
                strokeWidth="1.35"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={closeMenu}
        ></div>
      )}

      <div
        className={`fixed top-0 right-0 py-6 px-5 h-full w-[296px] bg-white z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="mb-4 flex items-center justify-between py-2">
          <Link href="/">
            <Image src="/assets/logo.svg" alt="logo" width={144} height={31} />
          </Link>
          <button onClick={closeMenu} aria-label="Close menu">
            <Image
              src="/assets/close-modal.svg"
              alt="close"
              width={24}
              height={24}
            />
          </button>
        </div>

        <div className="mb-5 flex items-center gap-2">
          <Image
            src={user?.photo?.path || "/assets/profile.svg"}
            alt="profile"
            width={42}
            height={42}
            className="rounded-full object-cover"
          />
          <div>
            <h1 className="text-[#111111] text-[14px] font-medium leading-[17px] mb-0.5">
              Welcome, {user?.firstName || user?.email?.split("@")[0] || "User"}
            </h1>
            <h3 className="text-[#585858] text-[12px] font-normal leading-[17px]">
              {user?.role?.name === "admin" ? "Admin" : ""} office
            </h3>
          </div>
        </div>

        <div className="border border-[#DEDEDE] rounded-[12px] px-4 py-3.5 flex items-center justify-between">
          <h3 className="text-[#111111] text-[14px] leading-[17px] font-normal">
            Visible for user
          </h3>
          <ToggleButton />
        </div>

        <div className="mt-6">
          <Link
            href="/admin/dashboard"
            className="py-2.5 flex items-center gap-2"
          >
            <Image
              src="/assets/update-rates-icon.svg"
              alt="update-rates"
              width={20}
              height={20}
            />
            <h3 className="text-[#585858] text-[14px] font-normal leading-[20px]">
              Update Rates
            </h3>
          </Link>
          <Link
            href="/admin/dashboard"
            className="py-2.5 flex items-center gap-2"
          >
            <Image
              src="/assets/dashboard-icon.svg"
              alt="dashboard"
              width={20}
              height={20}
            />
            <h3 className="text-[#585858] text-[14px] font-normal leading-[20px]">
              Dashboard
            </h3>
          </Link>
          <button
            onClick={handleLogout}
            className="py-2.5 flex items-center gap-2 w-full text-left"
          >
            <Image
              src="/assets/logout-icon.svg"
              alt="logout"
              width={20}
              height={20}
            />
            <h3 className="text-[#585858] text-[14px] font-normal leading-[20px]">
              Logout
            </h3>
          </button>
        </div>

        <div className="w-full bg-[#DEDEDE] h-[1px] my-4"></div>

        <div className="">
          {navigationLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={closeMenu}
              className="block py-2.5 text-[#585858] text-[14px] leading-[20px] font-normal"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default ResultHeader;
