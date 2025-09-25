"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { useMenu } from "@/context/MenuContext";
import { usePathname } from "next/navigation";

interface NavigationLink {
  href: string;
  label: string;
}

const MobileMenu: React.FC = () => {
  const { isMenuOpen, closeMenu } = useMenu();
  const pathname = usePathname();

  const navigationLinks: NavigationLink[] = [
    { href: "/about-us", label: "About" },
    { href: "/faq", label: "FAQ" },
    { href: "/home", label: "Register my office" },
    { href: "https://blog.exchango24.com", label: "Blog" },
  ];

  const isSpecificPage = pathname?.startsWith("/spesific");

  return (
    <>
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

        {isSpecificPage ? (
          <div className="mt-4 space-y-3">
            <Link
              href="/login"
              className="flex items-center justify-center h-[46px] w-full px-6 border border-[#20523C] rounded-md text-[#20523C] text-[16px] leading-[22px] font-medium cursor-pointer transition duration-300 hover:bg-[#20523C] hover:text-white"
            >
              Register
            </Link>
            <Link
              href="/admin"
              className="flex items-center justify-center h-[46px] w-full px-6 border border-[#20523C] rounded-md text-[#20523C] text-[16px] leading-[22px] font-medium cursor-pointer transition duration-300 hover:bg-[#20523C] hover:text-white"
            >
              Login
            </Link>
          </div>
        ) : (
          <Link
            href="/login"
            className="mt-4 flex items-center justify-center h-[46px] w-full px-6 border border-[#20523C] rounded-md text-[#20523C] text-[16px] leading-[22px] font-medium cursor-pointer transition duration-300 hover:bg-[#20523C] hover:text-white"
          >
            Exchange office Space
          </Link>
        )}
      </div>
    </>
  );
};

export default MobileMenu;
