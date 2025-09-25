"use client";

import React, { useState, useRef, ChangeEvent, useEffect } from "react";
import Image from "next/image";
import FileUpload from "./SvgIcons/FileUpload";

interface ImageUploadProps {
  onImageUpload?: (file: File, previewUrl: string) => void;
  onError?: (error: string) => void;
  maxSizeInMB?: number;
  recommendedSize?: string;
  acceptedFormats?: string[];
  isLoading?: boolean;
  initialPreview?: string | null;
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  onImageUpload,
  onError,
  maxSizeInMB = 8,
  recommendedSize = "256x256",
  acceptedFormats = [".png", ".jpeg", ".jpg", ".gif"],
  isLoading = false,
  initialPreview = null,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(initialPreview);
  const [isDragging, setIsDragging] = useState(false);
  const [internalIsUploading, setInternalIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialPreview) {
      setPreviewUrl(initialPreview);
    }
  }, [initialPreview]);

  const uploading = isLoading || internalIsUploading;

  const validateFile = (file: File): string | null => {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      return `File size must be less than ${maxSizeInMB}MB`;
    }

    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    if (!acceptedFormats.includes(fileExtension)) {
      return `Unsupported format (.png, .jpeg, .jpg, .gif only).`;
    }

    return null;
  };

  const handleFileSelect = async (file: File) => {
    setInternalIsUploading(true);

    const error = validateFile(file);
    if (error) {
      onError?.(error);
      setInternalIsUploading(false);
      return;
    }

    try {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      onImageUpload?.(file, url);
    } catch (err) {
      onError?.("Failed to process the image");
    } finally {
      setInternalIsUploading(false);
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="flex justify-center items-center  gap-5">
      <div
        className={`min-w-[86px] min-h-[86px] sm:min-w-[100px] sm:min-h-[100px] rounded-full flex items-center justify-center border transition-all duration-200 relative overflow-hidden ${
          isDragging
            ? "border-[#20523C] bg-green-50"
            : previewUrl
            ? "border-[#DEDEDE] bg-[#F0F3F5]"
            : "border-[#DEDEDE] hover:border-[#20523C]"
        } ${uploading ? "cursor-not-allowed" : "cursor-pointer"}`}
        onDragOver={!uploading ? handleDragOver : undefined}
        onDragLeave={!uploading ? handleDragLeave : undefined}
        onDrop={!uploading ? handleDrop : undefined}
        onClick={handleClick}
      >
        {uploading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#20523C]"></div>
          </div>
        ) : previewUrl ? (
          <>
            <Image
              src={previewUrl}
              alt="Uploaded logo"
              fill
              className="object-cover"
              sizes="100px"
            />
          </>
        ) : (
          <div className="cursor-pointer">
            <FileUpload />
          </div>
        )}
      </div>

      <div className="flex flex-col items-start gap-1.5">
        <button
          onClick={handleClick}
          disabled={uploading}
          className={`border border-[#20523C] cursor-pointer rounded-md h-[32px] sm:h-[38px] px-3.5 sm:px-4 text-[#20523C] text-[13.81px] sm:text-[16px] leading-[19px] sm:leading-[22px] font-medium transition duration-300 ${
            uploading
              ? "opacity-50 cursor-not-allowed"
              : "hover:bg-[#20523C] hover:text-white"
          }`}
        >
          {uploading
            ? "Uploading..."
            : previewUrl
            ? "Replace image"
            : "Upload Logo"}
        </button>
        <p className="text-left text-[#585858] text-[12px] sm:text-sm leading-[17px] sm:leading-[20px] font-normal">
          {acceptedFormats.join(", ")} files up to {maxSizeInMB}MB. Recommended
          size {recommendedSize}
        </p>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/gif"
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />
    </div>
  );
};

export default ImageUpload;
