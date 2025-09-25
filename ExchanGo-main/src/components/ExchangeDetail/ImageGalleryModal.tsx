import React from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ImageGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
  currentIndex: number;
  onPrevious: () => void;
  onNext: () => void;
}

const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({
  isOpen,
  onClose,
  images,
  currentIndex,
  onPrevious,
  onNext,
}) => {
  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    if (e.key === "ArrowLeft") onPrevious();
    if (e.key === "ArrowRight") onNext();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-60 text-white hover:text-gray-300 transition-colors"
      >
        <X size={32} />
      </button>

      {/* Previous button */}
      {images.length > 1 && (
        <button
          onClick={onPrevious}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-60 text-white hover:text-gray-300 transition-colors"
        >
          <ChevronLeft size={48} />
        </button>
      )}

      {/* Next button */}
      {images.length > 1 && (
        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-60 text-white hover:text-gray-300 transition-colors"
        >
          <ChevronRight size={48} />
        </button>
      )}

      {/* Main image */}
      <div className="relative max-w-[90vw] max-h-[90vh] w-full h-full flex items-center justify-center">
        <Image
          src={images[currentIndex]}
          alt={`Gallery image ${currentIndex + 1}`}
          width={1200}
          height={800}
          className="object-contain max-w-full max-h-full"
          priority
          onError={(e) => {
            console.error("Image failed to load:", images[currentIndex]);
            e.currentTarget.src = "/assets/placeholder.png";
          }}
        />
      </div>

      {/* Image counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white bg-black bg-opacity-50 px-3 py-1 rounded">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="absolute bottom-16 left-1/2 transform -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto">
          {images.map((img, index) => (
            <button
              key={index}
              onClick={() => {
                // We'll handle this in the parent component
              }}
              className={`relative w-16 h-16 flex-shrink-0 rounded overflow-hidden border-2 ${
                index === currentIndex ? "border-white" : "border-transparent"
              }`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${index + 1}`}
                fill
                className="object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/assets/placeholder.png";
                }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGalleryModal;
