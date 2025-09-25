"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Link2 } from "lucide-react";
import GradientButton from "../ui/GradientButton";
import { createPortal } from "react-dom";

interface ShareExchangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  exchangeData: {
    name: string;
    location: string;
    lastUpdate: string;
    rate: string;
    image?: string;
    baseAmount: string;
    sourceCurrency: string;
    targetCurrency: string;
    city: string;
    exchangeOfficeLink: string;
  };
}

interface ShareOptionCardProps {
  icon: string;
  iconAlt: string;
  title: string;
  description: string;
  buttonColor: string;
  onShare: () => void;
  iconWidth?: number;
  iconHeight?: number;
}

const ShareOptionCard: React.FC<ShareOptionCardProps> = ({
  icon,
  iconAlt,
  title,
  description,
  buttonColor,
  onShare,
}) => {
  const handleIconClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    // Only trigger onShare on mobile
    if (window.innerWidth < 640) {
      onShare();
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onShare();
  };

  return (
    <div className="w-full flex items-center justify-between sm:py-[10px]">
      <div className="flex items-center sm:flex-row flex-col gap-1.5 sm:gap-2.5">
        <div
          className="bg-white w-[59px] sm:w-[46px] h-[59px] sm:h-[46px] flex items-center justify-center border border-[#DEDEDE] rounded-[16px] sm:rounded-md cursor-pointer sm:cursor-default"
          onClick={handleIconClick}
          onTouchEnd={(e) => {
            e.stopPropagation();
            e.preventDefault();
            if (window.innerWidth < 640) {
              onShare();
            }
          }}
        >
          <Image
            src={icon}
            alt={iconAlt}
            width={26}
            height={26}
            className="sm:w-[26px] w-[32px]"
          />
        </div>
        <p className="text-[10px] leading-[12px] font-normal text-[#111111] sm:hidden block">
          {title}
        </p>
        <div className="sm:block hidden">
          <p className="text-[16px] leading-[19px] font-bold text-[#111111]">
            {title}
          </p>
          <p className="mt-1 text-[14px] leading-[20px] font-normal text-[#585858]">
            {description}
          </p>
        </div>
      </div>
      <button
        onClick={handleButtonClick}
        onTouchEnd={(e) => {
          e.stopPropagation();
          e.preventDefault();
          onShare();
        }}
        className={`${buttonColor} cursor-pointer text-white hidden sm:flex items-center gap-1.5 rounded-lg px-5 h-[46px] text-[16px] leading-[22px] font-medium`}
      >
        <Image src="/assets/share.svg" alt="Share" width={16} height={16} />
        Share
      </button>
    </div>
  );
};

const ShareExchangeModal: React.FC<ShareExchangeModalProps> = ({
  isOpen,
  onClose,
  exchangeData,
}) => {
  const [copied, setCopied] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const shareUrl = exchangeData.exchangeOfficeLink;
  const shareText = `I just came across this exchange office on ExchanGo24\n${exchangeData.baseAmount} ${exchangeData.sourceCurrency} = ${exchangeData.rate} ${exchangeData.targetCurrency}\n${exchangeData.name}, ${exchangeData.city}\n${exchangeData.exchangeOfficeLink}`;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isDownSwipe = distance < -50; // Swipe down threshold

    if (isDownSwipe) {
      onClose();
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    // Don't reset copied state - let it stay until modal closes
  };

  // Reset copied state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
    }
  }, [isOpen]);

  const handleShare = (platform: string) => {
    let shareLink = "";
    switch (platform) {
      case "whatsapp":
        shareLink = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        break;
      case "telegram":
        shareLink = `https://t.me/share/url?url=${encodeURIComponent(
          shareUrl
        )}&text=${encodeURIComponent(shareText)}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
          shareUrl
        )}&quote=${encodeURIComponent(shareText)}`;
        break;
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
          shareUrl
        )}&text=${encodeURIComponent(shareText)}`;
        break;
      default:
        console.error("Unknown platform:", platform);
        return;
    }
    if (shareLink) {
      window.open(shareLink, "_blank", "noopener,noreferrer");
    }
    setTimeout(() => {
      onClose();
    }, 500);
  };

  const shareOptions = [
    {
      platform: "whatsapp",
      icon: "/assets/whatsapp-modal.png",
      iconAlt: "whatsapp",
      title: "Whatsapp",
      description: "Share this exchange to whatsapp",
      buttonColor: "bg-[#44C554]",
    },
    {
      platform: "telegram",
      icon: "/assets/telegram-modal.svg",
      iconAlt: "Telegram",
      title: "Telegram",
      description: "Share this exchange to Telegram",
      buttonColor: "bg-[#2BA3D6]",
    },
    {
      platform: "facebook",
      icon: "/assets/facebook.svg",
      iconAlt: "Facebook",
      title: "Facebook",
      description: "Share this exchange to facebook",
      buttonColor: "bg-[#3B5998]",
    },
    {
      platform: "twitter",
      icon: "/assets/x-modal.svg",
      iconAlt: "X",
      title: "Twitter",
      description: "Share this exchange to X",
      buttonColor: "bg-black",
    },
  ];

  if (!isOpen) return null;

  // Use portal to render modal at document body level
  return createPortal(
    <div
      className="fixed inset-0 bg-black/50 flex items-end md:items-center justify-center"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        pointerEvents: "auto",
      }}
      onClick={onClose}
    >
      <div
        className="bg-white px-5 sm:px-10 pb-6 sm:py-9 rounded-lg w-full max-w-[529px]"
        style={{
          position: "relative",
          zIndex: 100000,
          pointerEvents: "auto",
        }}
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onClose();
          }}
          onTouchEnd={(e) => {
            e.stopPropagation();
            e.preventDefault();
            onClose();
          }}
          className="bg-[#E3E3E3] cursor-pointer w-[42px] h-[5px] rounded-full mt-2 max-w-full mx-auto mb-[17px] sm:hidden block"
        ></button>
        <div className=" flex justify-between items-center gap-2">
          <h2 className="text-[16px] sm:text-[20px] leading-[19px] sm:leading-[24px] font-bold text-[#111111]">
            Share This Exchange
          </h2>
          <button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onClose();
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onClose();
            }}
            className="cursor-pointer sm:block hidden"
          >
            <Image
              src="/assets/close-circle.svg"
              alt="Close"
              width={24}
              height={24}
            />
          </button>
        </div>
        <div className="pt-1 sm:pt-2">
          <div
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onTouchEnd={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            <p className="text-[12px] sm:text-[14px] leading-[17px] sm:leading-[20px] font-normal text-[#585858] mb-4 sm:max-w-full max-w-[300px]">
              Quickly share the exchange details — via message, email, or link.
            </p>
            <div className="flex gap-4 sm:gap-[18px] border border-[#DEDEDE] rounded-lg mb-4 sm:mb-6 min-h-fit overflow-hidden">
              <div className="min-w-[120px] max-w-[120px] h-auto relative">
                {exchangeData.image ? (
                  <Image
                    src={exchangeData.image}
                    alt={exchangeData.name}
                    width={120}
                    height={120}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-[#D9D9D9]"></div>
                )}
              </div>
              <div className="pl-0 p-3">
                <div className="space-y-0.5">
                  <h3 className="font-bold leading-[18px] text-[14px] text-[#111111]">
                    {exchangeData.name}
                  </h3>
                  <p className="text-[14px] leading-[18px] font-normal text-[#585858]">
                    {exchangeData.city}
                  </p>
                  <p className="text-[14px] leading-[18px] font-normal text-[#585858]">
                    last update, {exchangeData.lastUpdate}
                  </p>
                </div>
                <p className="text-[20px] leading-[26px] font-bold mt-1.5 text-[#111111]">
                  {exchangeData.baseAmount} {exchangeData.sourceCurrency} ={" "}
                  {exchangeData.rate} {exchangeData.targetCurrency}
                </p>
              </div>
            </div>

            <div className="hidden sm:flex w-full justify-between gap-4 mb-6">
              <div className="flex items-center gap-3 border border-[#DEDEDE] rounded-lg px-4 py-[13px] bg-[#F5F7F9] min-w-0">
                <Link2 className="w-4 h-4 flex-shrink-0 text-[#20523C]" />
                <h3 className="overflow-hidden text-[14px] leading-[20px] font-normal text-ellipsis whitespace-nowrap text-[#111111]">
                  {shareUrl}
                </h3>
              </div>
              <div className="relative">
                <GradientButton
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleCopyLink();
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleCopyLink();
                  }}
                  className="text-nowrap"
                >
                  {copied ? "Copied!" : "Copy Link"}
                </GradientButton>
              </div>
            </div>

            <div className="w-full sm:flex items-start flex-col justify-between grid grid-cols-5 gap-2.5 sm:gap-1.5">
              <div className="sm:hidden flex flex-col items-center relative w-fit mx-auto">
                <div
                  className="border border-[#DEDEDE] w-[59px] h-[59px] rounded-[16px] flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleCopyLink();
                  }}
                  onTouchEnd={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    handleCopyLink();
                  }}
                >
                  <Link2 className="w-8 h-8 flex-shrink-0 text-[#20523C]" />
                </div>
                <h2 className="text-[#111111] text-[10px] leading-[12px] font-normal mt-1.5">
                  {copied ? "Copied!" : "Link"}
                </h2>
              </div>
              {shareOptions.map((option) => (
                <ShareOptionCard
                  key={option.platform}
                  icon={option.icon}
                  iconAlt={option.iconAlt}
                  title={option.title}
                  description={option.description}
                  buttonColor={option.buttonColor}
                  onShare={() => handleShare(option.platform)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ShareExchangeModal;
