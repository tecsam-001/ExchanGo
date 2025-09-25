"use client";
import { useEffect, useRef } from "react";
import type React from "react";

interface CustomDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const CustomDrawer: React.FC<CustomDrawerProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 min-h-screen">
      <div className="fixed inset-0 bg-black/50 transition-opacity duration-300" onClick={handleBackdropClick}/>

      <div ref={drawerRef} className={` fixed left-0 right-0 bottom-0 bg-white rounded-t-2xl rounded-b-none shadow-2xl duration-300 ease-out w-full ${isOpen ? " " : "translate-y-full"} `}>
        <div className="flex justify-center pt-2 pb-3">
          <div className="w-[42px] h-[5px] bg-[#E3E3E3] rounded-full" />
        </div>

        <div className="overflow-y-auto hide-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};
