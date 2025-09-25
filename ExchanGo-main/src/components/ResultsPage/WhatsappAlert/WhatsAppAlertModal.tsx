import React, { useState, useEffect } from "react";
import Image from "next/image";
import WhatsAppAlertFormModal from "./WhatsAppAlertFormModal";
import { createPortal } from "react-dom";

interface CustomRadioProps {
  checked: boolean;
}

const CustomRadio: React.FC<CustomRadioProps> = ({ checked }) => {
  return (
    <div className="absolute top-[14px] right-[14px]">
      {checked ? (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            x="0.25"
            y="0.25"
            width="15.5"
            height="15.5"
            rx="7.75"
            fill="white"
          />
          <rect
            x="0.25"
            y="0.25"
            width="15.5"
            height="15.5"
            rx="7.75"
            fill="#20523C"
          />
          <rect
            x="0.25"
            y="0.25"
            width="15.5"
            height="15.5"
            rx="7.75"
            stroke="#DEDEDE"
            strokeWidth="0.5"
          />
          <path
            d="M11.3307 5.49951L6.7474 10.0828L4.66406 7.99951"
            stroke="white"
            strokeWidth="1.3"
            strokeLinecap="square"
          />
        </svg>
      ) : (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect x="0.5" y="0.5" width="15" height="15" rx="7.5" fill="white" />
          <rect
            x="0.5"
            y="0.5"
            width="15"
            height="15"
            rx="7.5"
            stroke="#DEDEDE"
          />
        </svg>
      )}
    </div>
  );
};

interface OptionCardProps {
  isSelected: boolean;
  onClick: () => void;
  iconSrc: string;
  iconAlt: string;
  title: string;
  description: string;
}

const OptionCard: React.FC<OptionCardProps> = ({
  isSelected,
  onClick,
  iconSrc,
  iconAlt,
  title,
  description,
}) => {
  return (
    <div
      className={`${
        isSelected ? "bg-[#20523c0e]" : ""
      } rounded-[12px] sm:rounded-[20px] p-[7px] sm:p-1.5`}
    >
      <div
        className={`relative w-full h-full group transition-all border duration-200 rounded-lg sm:rounded-[16px] flex flex-col items-center justify-between py-5 sm:py-10 px-3.5 sm:px-5 cursor-pointer ${
          isSelected
            ? "bg-white border-transparent"
            : "bg-white border-[#DEDEDE]"
        }`}
        style={
          isSelected
            ? {
                boxShadow:
                  "0px 20px 80px 0px #0000001A, 0px 4px 4px 0px #00000014",
              }
            : {}
        }
        onClick={onClick}
      >
        <CustomRadio checked={isSelected} />
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <Image
            src={iconSrc}
            alt={iconAlt}
            width={52}
            height={52}
            className="sm:w-[52px] w-[36px]"
          />
          <h3 className="font-medium text-[12px] sm:text-[16px] leading-[12px] sm:leading-[16px] text-[#111111] mt-3.5 sm:mt-5">
            {title}
          </h3>
          <p className="text-[10px] sm:text-[12px] leading-[14px] sm:leading-[17px] text-[#585858] mt-1 sm:mt-1.5 text-center">
            {description}
          </p>
        </div>
      </div>
    </div>
  );
};

interface WhatsAppAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  exchangeName?: string;
}

const WhatsAppAlertModal: React.FC<WhatsAppAlertModalProps> = ({
  isOpen,
  onClose,
  exchangeName = "this exchange",
}) => {
  const [selectedOption, setSelectedOption] = useState<"area" | "exchange">(
    "area"
  );
  const [showFormModal, setShowFormModal] = useState(false);
  const [formType, setFormType] = useState<"area" | "exchange">("area");

  const handleOptionSelect = (option: "area" | "exchange") => {
    if (selectedOption === option) {
      return;
    }
    setSelectedOption(option);
  };

  const handleSubmit = () => {
    if (selectedOption) {
      setFormType(selectedOption);
      setShowFormModal(true);
    }
  };

  const options = [
    {
      id: "area" as const,
      iconSrc: "/assets/entire-area.svg",
      iconAlt: "Area map",
      title: "Entire Area",
      description: "Get alerts for all nearby exchanges",
    },
    {
      id: "exchange" as const,
      iconSrc: "/assets/exchange-office.svg",
      iconAlt: "Exchange office",
      title: "Exchange Office",
      description: "Alerts only from this exchange",
    },
  ];

  const modalContent = (
    <>
      <div
        className={`fixed inset-0 z-[99999] flex items-center justify-center bg-black/40 ${
          isOpen && !showFormModal ? "" : "hidden"
        }`}
        style={{ position: "fixed", zIndex: 99999 }}
      >
        <div
          className="bg-white rounded-[16px] sm:rounded-[20px] w-[90%] max-w-[335px] sm:max-w-[529px] max-h-[90vh] mx-4 overflow-hidden pt-4 sm:pt-[36px] pb-[30px] sm:pb-[42px] px-5 sm:px-10 relative"
          style={{ width: "90%", maxWidth: "529px" }}
        >
          <div className="flex items-start sm:flex-row flex-col-reverse justify-between sm:gap-4">
            <div className="max-w-[320px] sm:max-w-[400px] mx-auto sm:mb-2 sm:text-left text-center">
              <h2 className="text-[20px] sm:text-[22px] leading-[24px] sm:leading-[28px] font-bold text-[#111]">
                Receive Whatsapp Alert
              </h2>
              <p className="text-[14px] sm:text-[15px] font-normal leading-[20px] sm:leading-[22px] text-[#585858] mt-2">
                Get an immediate WhatsApp notification when your target rate
                becomes available near you.
              </p>
            </div>
            <button
              onClick={onClose}
              className="cursor-pointer w-full sm:w-fit flex items-end justify-end"
            >
              <Image
                src="/assets/close-circle.svg"
                alt="close-circle"
                width={24}
                height={24}
              />
            </button>
          </div>

          <div className="mt-4 sm:mt-[26px] grid grid-cols-2 gap-2.5 sm:gap-[11px]">
            {options.map((option) => (
              <OptionCard
                key={option.id}
                isSelected={selectedOption === option.id}
                onClick={() => {
                  handleOptionSelect(option.id);
                }}
                iconSrc={option.iconSrc}
                iconAlt={option.iconAlt}
                title={option.title}
                description={option.description}
              />
            ))}
          </div>

          <div className="mt-6 sm:mt-8 flex justify-center">
            <button
              onClick={handleSubmit}
              disabled={!selectedOption}
              className={`px-6 py-3 rounded-lg cursor-pointer font-medium text-white ${
                !selectedOption
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-[#20523C] hover:bg-[#1a4432] transition-colors"
              }`}
            >
              Continue
            </button>
          </div>
        </div>
      </div>
      <WhatsAppAlertFormModal
        isOpen={isOpen && showFormModal}
        onClose={() => {
          setShowFormModal(false);
          onClose();
        }}
        areaType={formType}
        exchangeName={exchangeName}
        onBack={() => setShowFormModal(false)}
      />
    </>
  );

  // Use portal to render modal outside of parent container constraints
  if (typeof window !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
};

export default WhatsAppAlertModal;
