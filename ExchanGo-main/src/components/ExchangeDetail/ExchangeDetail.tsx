import Image from "next/image";
import React, { useState } from "react";
import ExchangeInfo from "./ExchangeInfo";
import ImageGalleryModal from "./ImageGalleryModal";

interface Currency {
  id: string;
  code: string;
  name: string;
  symbol: string;
  flag: string;
}

interface Rate {
  id: string;
  baseCurrency: Currency;
  targetCurrency: Currency;
  buyRate: string;
  sellRate: string;
  isActive: boolean;
}

interface ExchangeData {
  id: number;
  name: string;
  rate: string;
  address: string;
  hours: string;
  whatsappNumber: string;
  primaryPhoneNumber: string;
  images: Array<{ id: string; path: string }>;
  logo?: { id: string; path: string } | null;
  isPopular: boolean;
  isVerified: boolean; // Make it required
  lastUpdate: string;
  description?: string;
  slug?: string;
  officeId?: string;
  rates?: Rate[]; // Add rates
}

interface ExchangeDetailProps {
  exchangeData: ExchangeData;
}

const ExchangeDetail: React.FC<ExchangeDetailProps> = ({ exchangeData }) => {
  const {
    name,
    rate,
    address,
    hours,
    images,
    logo,
    isPopular,
    isVerified,
    whatsappNumber,
    primaryPhoneNumber,
    lastUpdate,
    description,
    officeId,
    rates,
  } = exchangeData;

  // Extract image paths
  const imagePaths = images.map((img) => img.path);

  // Ensure we have at least one image, fallback to placeholder if none
  const validImagePaths =
    imagePaths.length > 0 ? imagePaths : ["/assets/placeholder.png"];

  console.log("ExchangeDetail - Total images:", images.length);
  console.log("ExchangeDetail - Image paths:", imagePaths);
  console.log("ExchangeDetail - Valid image paths:", validImagePaths);

  const totalImages = validImagePaths.length;
  const displayedImages = validImagePaths.slice(0, 5);
  const remainingCount = totalImages > 5 ? totalImages - 4 : 0;

  const [selectedImageIdx, setSelectedImageIdx] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getImageSrc = (img?: string) => {
    if (!img) {
      console.log("No image provided, using placeholder");
      return "/assets/placeholder.png";
    }

    // Images are already full URLs from the wrapper, so return as is
    return img;
  };

  const processedImages = validImagePaths.map((img) => getImageSrc(img));

  const openGallery = (index: number) => {
    setSelectedImageIdx(index);
    setIsModalOpen(true);
  };

  const closeGallery = () => {
    setIsModalOpen(false);
  };

  const goToPrevious = () => {
    setSelectedImageIdx((prev) => 
      prev === 0 ? processedImages.length - 1 : prev - 1
    );
  };

  const goToNext = () => {
    setSelectedImageIdx((prev) => 
      prev === processedImages.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="w-full px-5 md:px-8">
      <div className="max-w-[1240px] w-full mx-auto mt-[18px] sm:mt-10 md:mt-[60px]">
        <div className="flex items-center justify-between gap-1 sm:gap-4 mb-4">
          <div className="flex items-center gap-0.5">
            <h3 className="text-[#585858] text-[10px] sm:text-[20px] leading-[14px] sm:leading-[28px] font-normal">
              Home
            </h3>
            <Image
              src="/assets/arrow-right-detail.svg"
              alt="arrow-right"
              width={24.33}
              height={24.33}
              className="sm:w-[24px] w-[14px]"
            />
            <h3 className="text-[#585858] text-[10px] sm:text-[20px] leading-[14px] sm:leading-[28px] font-normal">
              Exchange in Rabat
            </h3>
            <Image
              src="/assets/arrow-right-detail.svg"
              alt="arrow-right"
              width={24.33}
              height={24.33}
              className="sm:w-[24px] w-[14px]"
            />
            <h3 className="text-[#111111] text-[10px] sm:text-[20px] leading-[14px] sm:leading-[28px] font-medium">
              {name}
            </h3>
          </div>
          {exchangeData?.isVerified && (
            <button className="border-[0.8px] border-[#DEDEDE] rounded-lg py-1.5 sm:py-2 px-2 sm:px-3 bg-white text-[#111111] text-[12px] sm:text-[16px] leading-[14px] sm:leading-[19px] font-medium">
              Verified Office
            </button>
          )}
        </div>

        {/* Desktop Grid */}
        <div className="w-full hidden md:flex gap-2.5 h-[400px] rounded-lg overflow-hidden mb-6 sm:mb-10 md:mb-[62px]">
          <div
            className="w-full md:min-w-[400px] relative rounded-l-lg overflow-hidden"
            onClick={() => openGallery(0)}
          >
            <Image
              src={getImageSrc(displayedImages[0])}
              alt="Exchange main view"
              fill
              priority
              className="object-cover cursor-pointer"
            />
          </div>

          <div
            className="flex-1 grid gap-3 [--col1:1fr] [--col2:1fr] md:[--col1:320px] md:[--col2:188px]"
            style={{ gridTemplateColumns: "var(--col1) var(--col2)" }}
          >
            <div
              className="relative rounded-lg overflow-hidden"
              onClick={() => openGallery(1)}
            >
              <Image
                src={getImageSrc(displayedImages[1])}
                alt="Exchange view 2"
                fill
                className="object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                onError={() => {
                  // Fallback to placeholder if image fails
                  console.error(
                    "Image 2 failed to load:",
                    getImageSrc(displayedImages[1])
                  );
                }}
              />
            </div>

            <div
              className="relative rounded-lg overflow-hidden"
              onClick={() => openGallery(2)}
            >
              <Image
                src={getImageSrc(displayedImages[2])}
                alt="Exchange view 3"
                fill
                className="object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                onError={() => {
                  // Fallback to placeholder if image fails
                  console.error(
                    "Image 3 failed to load:",
                    getImageSrc(displayedImages[2])
                  );
                }}
              />
            </div>

            <div
              className="relative rounded-lg overflow-hidden"
              onClick={() => openGallery(3)}
            >
              <Image
                src={getImageSrc(displayedImages[3])}
                alt="Exchange view 4"
                fill
                className="object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                onError={() => {
                  // Fallback to placeholder if image fails
                  console.error(
                    "Image 4 failed to load:",
                    getImageSrc(displayedImages[3])
                  );
                }}
              />
              {remainingCount > 0 && (
                <div
                  className="absolute inset-0 flex items-center justify-center cursor-pointer bg-black/30 transition-opacity duration-300 rounded-lg"
                  onClick={(e) => {
                    e.stopPropagation();
                    openGallery(4);
                  }}
                >
                  <div className="text-center text-white">
                    <div className="text-[63px] leading-[74px] font-normal mb-2">
                      {remainingCount}+
                    </div>
                    <div className="text-[24px] font-normal leading-[29px]">
                      More photo
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div
              className="relative rounded-lg overflow-hidden"
              onClick={() => openGallery(4)}
            >
              <Image
                src={getImageSrc(displayedImages[4])}
                alt="Exchange view 5"
                fill
                className="object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                onError={() => {
                  // Fallback to placeholder if image fails
                  console.error(
                    "Image 5 failed to load:",
                    getImageSrc(displayedImages[4])
                  );
                }}
              />
            </div>
          </div>
        </div>

        {/* Mobile Grid */}
        <div className="md:hidden block mb-6">
          <div
            className="w-full aspect-video h-[200px] rounded-lg overflow-hidden mb-2.5 cursor-pointer relative"
            onClick={() => openGallery(selectedImageIdx)}
          >
            <Image
              src={getImageSrc(validImagePaths[selectedImageIdx])}
              alt="Exchange main view"
              fill
              priority
              className="object-cover"
            />
          </div>

          {/* Thumbnails */}
          <div className="grid grid-cols-4 gap-2.5 pb-2">
            {validImagePaths.slice(0, 4).map((img, idx) => (
              <div
                key={idx}
                className={`relative min-w-[76px] h-[52px] rounded overflow-hidden flex-shrink-0 cursor-pointer border ${
                  selectedImageIdx === idx
                    ? "border-[#DEDEDE]"
                    : "border-transparent"
                }`}
                onClick={() => setSelectedImageIdx(idx)}
              >
                <img
                  src={getImageSrc(img)}
                  alt={`Exchange thumbnail ${idx + 1}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error(
                      `Thumbnail ${idx + 1} failed to load:`,
                      getImageSrc(img)
                    );
                    e.currentTarget.src = "/assets/placeholder.png";
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        <ExchangeInfo
          name={name}
          whatsappNumber={whatsappNumber}
          primaryPhoneNumber={primaryPhoneNumber}
          hours={hours.toString()}
          description={description || ``}
          address={address}
          rating={4.8}
          reviewCount={120}
          isPopular={isPopular}
          isVerified={isVerified}
          officeId={officeId || exchangeData.id?.toString()}
          logo={logo}
          rates={rates}
        />
        <ImageGalleryModal
          isOpen={isModalOpen}
          onClose={closeGallery}
          images={processedImages}
          currentIndex={selectedImageIdx}
          onPrevious={goToPrevious}
          onNext={goToNext}
        />
      </div>
    </div>
  );
};

export default ExchangeDetail;
