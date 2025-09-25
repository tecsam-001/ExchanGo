"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";
import { useMenu } from "@/context/MenuContext";

interface NavigationLink {
  href: string;
  label: string;
}

const Navbar: React.FC = () => {
  const { isMenuOpen, toggleMenu, closeMenu } = useMenu();
  const pathname = usePathname();

  const navigationLinks: NavigationLink[] = [
    { href: "/about-us", label: "About" },
    { href: "/faq", label: "FAQ" },
    { href: "/home", label: "Register my office" },
    { href: "https://blog.exchango24.com", label: "Blog" },
  ];

  const isSpecificPage = pathname?.startsWith("/spesific");
  const isHomePage = pathname === "/";
  const isExchangeDetailPage = pathname === "/exchange-detail";

  return (
    <>
      <div className="w-full sm:h-[42px] flex items-center justify-between max-w-[1240px] mx-auto">
        <div className="flex items-center gap-10">
          <Link href="/">
            {pathname === "/exchange-detail" ? (
              <Image
                src="/assets/logo.svg"
                alt="Logo"
                width={190}
                height={41.05}
                className="md:w-[190px] w-[143px]"
              />
            ) : (
              <Image
                src="/assets/white-logo.svg"
                alt="Logo"
                width={190}
                height={41.05}
                className="md:w-[190px] w-[143px]"
              />
            )}
          </Link>

          {/* Desktop Menu */}
          <ul className="hidden lg:flex items-center gap-4">
            {navigationLinks.map((link) => {
              const isExchangeDetail = pathname === "/exchange-detail";
              const isActive = pathname === link.href;

              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={`text-[16px] leading-[22px] font-normal transition-colors duration-300
                                        ${
                                          isExchangeDetail
                                            ? "text-[#111111] hover:text-[#20523C]"
                                            : "text-white hover:text-[#3BEE5C]"
                                        }
                                        `}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="hidden lg:flex items-center gap-3">
          {isSpecificPage ? (
            <>
              <Link
                href="/login"
                className="flex items-center justify-center h-[46px] px-6 border border-[#3BEE5C] rounded-md text-[#3BEE5C] text-[16px] leading-[22px] font-medium cursor-pointer transition duration-300 hover:bg-[#3BEE5C] hover:text-black"
              >
                Register
              </Link>
              <Link
                href="/admin"
                className="flex items-center justify-center h-[46px] px-6 border border-[#3BEE5C] rounded-md text-[#3BEE5C] text-[16px] leading-[22px] font-medium cursor-pointer transition duration-300 hover:bg-[#3BEE5C] hover:text-black"
              >
                Login
              </Link>
            </>
          ) : (
            <Link
              href="/login"
              className={`flex items-center justify-center border h-[46px] px-6 rounded-md text-[16px] leading-[22px] font-medium cursor-pointer transition duration-200  
                            ${
                              pathname === "/exchange-detail"
                                ? "border-[#20523C] text-[#20523C] hover:bg-[#20523C] hover:text-white"
                                : "border-[#3BEE5C] text-[#3BEE5C] hover:bg-[#3BEE5C] hover:text-black"
                            }`}
            >
              Exchange office Space
            </Link>
          )}
        </div>

        <button
          onClick={toggleMenu}
          className="lg:hidden flex flex-col items-center justify-center w-8 h-8 cursor-pointer"
          aria-label="Toggle mobile menu"
        >
          {isSpecificPage || isHomePage ? (
            <Image src="/assets/menu.svg" alt="menu" width={32} height={32} />
          ) : (
            <Image
              src="/assets/menu-black.svg"
              alt="menu"
              width={32}
              height={32}
            />
          )}
        </button>
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

export default Navbar;
