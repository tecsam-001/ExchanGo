"use client";

import type React from "react";
import { useRef, useEffect } from "react";
import Image from "next/image";

export interface SortDropdownProps {
  options: string[];
  selected: string | null;
  onSelect: (option: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  isMobile?: boolean;
  onOpenModal?: () => void;
  onCloseModal?: () => void;
}

const SortDropdown: React.FC<SortDropdownProps> = ({
  options,
  selected,
  onSelect,
  open,
  setOpen,
  isMobile = false,
  onOpenModal,
  onCloseModal,
}) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Function to get compact label for selected option
  const getCompactLabel = (option: string | null): string => {
    if (!option) return "Sort";

    const lowerOption = option.toLowerCase();

    if (lowerOption.includes("highest") && lowerOption.includes("rate")) {
      return "Sort: Rate ↓";
    }
    if (lowerOption.includes("lowest") && lowerOption.includes("rate")) {
      return "Sort: Rate ↑";
    }
    if (
      lowerOption.includes("geographic") ||
      lowerOption.includes("proximity")
    ) {
      return "Sort: Nearby";
    }
    if (lowerOption.includes("open") || lowerOption.includes("closed")) {
      return "Sort: Open";
    }

    // Fallback for other options - show first word after "Sort: "
    const words = option.split(" ");
    const firstWord = words[0];
    return `Sort: ${firstWord}`;
  };

  useEffect(() => {
    if (!open || isMobile) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open, setOpen, isMobile]);

  const handleOverlayClick = () => {
    if (isMobile) {
      setOpen(false);
      if (onCloseModal) {
        onCloseModal();
      }
    }
  };

  const compactLabel = getCompactLabel(selected);

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        className="cursor-pointer lg:border border-[#20523C] lg:h-[46px] lg:rounded-lg lg:px-5 flex items-center justify-center gap-2 lg:hover:bg-gray-100 transition-colors duration-300"
        onClick={() => {
          setOpen(!open);
          if (!open && onOpenModal) {
            onOpenModal();
          }
        }}
        type="button"
      >
        <h4 className="text-[#20523C] text-[16px] leading-[22px] font-medium lg:block hidden whitespace-nowrap">
          {compactLabel}
        </h4>
        {/* Mobile: Show compact label when option is selected */}
        {selected && isMobile && (
          <span className="text-[#20523C] text-[14px] leading-[20px] font-medium lg:hidden">
            {compactLabel}
          </span>
        )}
        {/* Only show sort icon when no option is selected */}
        {!selected && (
          <Image
            src="/assets/sort.svg"
            alt="Sort"
            width={24}
            height={24}
            className="min-w-[24px] min-h-[24px]"
          />
        )}
      </button>

      {open && isMobile && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/40"
            onClick={handleOverlayClick}
          />
          <div
            ref={dropdownRef}
            className="fixed left-0 right-0 bottom-0 z-50 bg-white rounded-t-[16px] max-w-full mx-auto w-full pb-3"
            style={{
              boxShadow: "0px 0px 24px 0px #00000014",
              minHeight: 180,
            }}
          >
            <div className="flex flex-col items-center">
              <button
                className="bg-[#E3E3E3] cursor-default w-[42px] h-[5px] rounded-full mt-2 max-w-full mx-auto mb-3"
                tabIndex={-1}
                aria-hidden
              />
              <h3 className="text-[#111111] text-[16px] leading-[19px] font-bold w-full px-5 text-left mb-[9px]">
                Sort by
              </h3>
            </div>

            <ul className="w-full mt-2">
              {options.map((option) => (
                <li
                  key={option}
                  className={`px-5 py-3 text-[#585858] text-[14px] leading-[20px] font-normal border-b border-[#E3E3E3] last:border-b-0 ${
                    selected === option ? "bg-[#F1F1F1] font-bold" : ""
                  }`}
                  onClick={() => {
                    onSelect(option);
                    setOpen(false);
                    if (onCloseModal) {
                      onCloseModal();
                    }
                  }}
                  style={{ cursor: "pointer" }}
                >
                  {option}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}

      {open && !isMobile && (
        <div
          ref={dropdownRef}
          className="absolute top-[50px] z-40 right-0 bg-white rounded-md w-[217px]"
          style={{
            boxShadow: "0px 30px 80px 0px #00000029, 0px 4px 4px 0px #00000014",
          }}
        >
          <ul className="py-1">
            {options.map((option) => (
              <li
                key={option}
                className={`px-4 py-2.5 text-[#585858] cursor-pointer text-[14px] border-b border-[#DEDEDE] last:border-b-0 leading-[20px] font-normal ${
                  selected === option ? "bg-[#F1F1F1]" : ""
                }`}
                onClick={() => {
                  onSelect(option);
                  setOpen(false);
                  if (onCloseModal) {
                    onCloseModal();
                  }
                }}
              >
                {option}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default SortDropdown;
