import React, { useState, useRef, useEffect } from "react";
import ImageUpload from "../ImageUpload";
import Image from "next/image";
import GradientButton from "../ui/GradientButton";
import { toast } from "react-toastify";
import {
  fetchOwnedOffice,
  uploadFile,
  updateOfficeDetails,
  attachLogoToOffice,
  attachImagesToOffice,
} from "@/services/api";
import Loader from "../ui/Loader";

interface UploadedImage {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
  apiId?: string; // Add apiId as optional property
  apiPath?: string; // Add apiPath as optional property
}

interface ApiFile {
  id: string;
  path: string;
  __entity?: string;
}

// Base API URL for constructing full image URLs
const API_BASE_URL = "https://exchango.opineomanager.com";

// Function to convert API path to absolute URL for use in img src
const getAbsoluteImageUrl = (relativePath: string) => {
  if (!relativePath) return "/assets/placeholder.png";
  return `${API_BASE_URL}${relativePath}`;
};

const ImageLogo = () => {
  // State for loading the initial data
  const [isFetching, setIsFetching] = useState<boolean>(true);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [officeImages, setOfficeImages] = useState<UploadedImage[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [dropTarget, setDropTarget] = useState<number | null>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const officeInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    name: string;
  } | null>(null);
  const [hasChanges, setHasChanges] = useState(false);
  const [logoDragOver, setLogoDragOver] = useState(false);
  const [hasLogoChanged, setHasLogoChanged] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // State to store API data
  const [officeData, setOfficeData] = useState<any>(null);
  const [existingLogo, setExistingLogo] = useState<ApiFile | null>(null);
  const [existingImages, setExistingImages] = useState<ApiFile[]>([]);
  const [newLogoId, setNewLogoId] = useState<string | null>(null);

  // Add state for logo URL
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // Fetch office data on component mount
  useEffect(() => {
    const getOfficeData = async () => {
      setIsFetching(true);
      try {
        const response = await fetchOwnedOffice();
        console.log("Full API response:", response);

        if (response.success && response.data) {
          console.log("Office data received:", response.data);
          setOfficeData(response.data);

          // Set existing logo
          if (response.data.logo) {
            console.log("Logo found:", response.data.logo);
            console.log("Logo ID:", response.data.logo.id);
            const logoPath = response.data.logo.path;
            const fullLogoUrl = `${API_BASE_URL}${logoPath}`;
            console.log("Full logo URL:", fullLogoUrl);
            setExistingLogo(response.data.logo);
            setLogoUrl(fullLogoUrl);

            // Preload image
            const img = new window.Image();
            img.crossOrigin = "anonymous";
            img.onload = () => console.log("Logo image preloaded successfully");
            img.onerror = (e) =>
              console.error("Error preloading logo image:", e);
            img.src = fullLogoUrl;

            // For API updates, we need the logo ID
            console.log(
              "Logo update format would be:",
              JSON.stringify({
                logo: { id: response.data.logo.id },
              })
            );
          } else {
            console.log("No logo found in office data");
          }

          // Set existing images
          if (response.data.images && Array.isArray(response.data.images)) {
            console.log("Images found:", response.data.images.length);
            setExistingImages(response.data.images);
          }
        } else {
          toast.error("Failed to load office data");
        }
      } catch (error) {
        console.error("Error fetching office data:", error);
        toast.error("Failed to load office data");
      } finally {
        setIsFetching(false);
      }
    };

    getOfficeData();
  }, []);

  // Logo upload handler (logo only, not office media)
  const handleLogoUpload = async (file: File) => {
    try {
      setIsSaving(true);

      // Upload the file to get file data (but don't attach to office yet)
      const uploadResponse = await uploadFile(file);
      console.log("Logo upload response:", uploadResponse);

      if (uploadResponse.success && uploadResponse.data) {
        // Extract file data from the response
        const fileData = uploadResponse.data.file || uploadResponse.data;
        console.log("Uploaded logo file data:", fileData);

        // Set the new logo data and mark as changed (to be saved later)
        setNewLogoId(fileData.id);
        setUploadedFile(file);
        setHasLogoChanged(true);

        // Store the file path for later use in saveChanges
        // We need to add the logo to officeImages temporarily so saveChanges can find it
        const logoImage: UploadedImage = {
          id: "temp-logo-" + Date.now(),
          file,
          previewUrl: URL.createObjectURL(file),
          name: file.name,
          apiId: fileData.id,
          apiPath: fileData.path,
        };
        setOfficeImages((prev) => [
          ...prev.filter((img) => !img.id.startsWith("temp-logo-")),
          logoImage,
        ]);

        // Create file preview URL for display
        const previewUrl = URL.createObjectURL(file);
        console.log("Created preview URL for logo:", previewUrl);

        // Don't show toast here - will show when user saves
      } else {
        toast.error("Failed to upload logo");
      }
    } catch (error) {
      console.error("Error uploading logo:", error);
      toast.error("Failed to upload logo");
    } finally {
      setIsSaving(false);
    }
  };

  // Remove logo handler
  const handleRemoveLogo = () => {
    setUploadedFile(null);
    setNewLogoId(null);
    setHasLogoChanged(true);
    console.log("Logo removed, newLogoId set to null");
  };

  const isFileAlreadyUploaded = (newFile: File) => {
    return officeImages.some(
      (image) =>
        image.name === newFile.name &&
        image.file.size === newFile.size &&
        image.file.lastModified === newFile.lastModified
    );
  };

  // Helper to check for duplicate images
  const isDuplicateImage = (file: File) => {
    return officeImages.some(
      (img) =>
        img.name === file.name &&
        img.file.size === file.size &&
        img.file.lastModified === file.lastModified
    );
  };

  // Updated handleOfficeImageUpload to prevent duplicates
  // Office Media upload handler (gallery only, not logo)
  const handleOfficeImageUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles = fileArray.filter((file) => {
      const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/gif"];
      const maxSize = 8 * 1024 * 1024; // 8MB
      const isValid = validTypes.includes(file.type) && file.size <= maxSize;
      const isDuplicate = isDuplicateImage(file);
      return isValid && !isDuplicate;
    });

    if (validFiles.length === 0) return;

    try {
      setIsSaving(true);

      // Upload each file and collect responses (but don't attach to office yet)
      const uploadPromises = validFiles.map(async (file) => {
        const uploadResponse = await uploadFile(file);
        console.log("Image upload response:", uploadResponse);

        if (uploadResponse.success && uploadResponse.data) {
          const fileData = uploadResponse.data.file || uploadResponse.data;
          return {
            id: Date.now() + Math.random().toString(36),
            file,
            previewUrl: URL.createObjectURL(file),
            name: file.name,
            apiId: fileData.id,
            apiPath: fileData.path,
          } as UploadedImage;
        }
        return null;
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(
        (item): item is UploadedImage => item !== null
      );

      if (successfulUploads.length > 0) {
        setOfficeImages((prev) => [...prev, ...successfulUploads]);
        setHasChanges(true);
        // Don't show toast here - will show when user saves
      } else {
        toast.error("Failed to upload images");
      }
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images");
    } finally {
      setIsSaving(false);
    }
  };

  // Office Media input change
  const handleOfficeFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleOfficeImageUpload(files);
    }
    if (event.target) {
      event.target.value = "";
    }
  };

  // Logo input change
  const handleLogoFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      handleLogoUpload(files[0]);
    }
    if (event.target) {
      event.target.value = "";
    }
  };

  // Drag-and-drop reordering logic
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleImageDragStart = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleImageDragOver = (
    e: React.DragEvent<HTMLDivElement>,
    index: number
  ) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleImageDrop = (
    e: React.DragEvent<HTMLDivElement>,
    dropIndex: number
  ) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDragOverIndex(null);
      setDraggedIndex(null);
      return;
    }
    setOfficeImages((prev) => {
      const newImages = [...prev];
      const [removed] = newImages.splice(draggedIndex, 1);
      newImages.splice(dropIndex, 0, removed);
      return newImages;
    });
    setHasChanges(true);
    setDragOverIndex(null);
    setDraggedIndex(null);
  };

  const handleImageDragEnd = () => {
    setDragOverIndex(null);
    setDraggedIndex(null);
  };

  // Prevent duplicate when dragging existing image onto upload area
  const handleUploadAreaDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    // If dragging from grid, do nothing (no duplicate)
    const draggedIdx = Number(e.dataTransfer.getData("text/plain"));
    if (!isNaN(draggedIdx) && officeImages[draggedIdx]) {
      // Do not add duplicate
      return;
    }
    // If file(s) dropped from outside
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleOfficeImageUpload(e.dataTransfer.files);
    }
  };

  const handleOfficeUploadClick = () => {
    officeInputRef.current?.click();
  };

  const handleImageClick = (image: { previewUrl: string; name: string }) => {
    setSelectedImage({ url: image.previewUrl, name: image.name });
  };

  const handleDeleteImage = (imageId: string) => {
    setOfficeImages((prev) => prev.filter((img) => img.id !== imageId));
    setHasChanges(true);
  };

  // Handle drop from Office Media to Logo
  const handleLogoAreaDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setLogoDragOver(true);
  };

  const handleLogoAreaDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setLogoDragOver(false);
  };

  const handleLogoAreaDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setLogoDragOver(false);
    // Check for Office Media drag
    const indexStr = e.dataTransfer.getData("office-image-index");
    const index = Number(indexStr);
    if (!isNaN(index) && officeImages[index]) {
      setUploadedFile(officeImages[index].file);
      return;
    }
    // If file is dropped directly, let ImageUpload handle it
  };

  // Save all changes to the office
  const saveChanges = async () => {
    if (!(hasChanges || hasLogoChanged)) {
      return;
    }

    setIsSaving(true);

    try {
      let logoAttached = false;
      let imagesAttached = false;

      // Handle logo changes first
      if (hasLogoChanged) {
        console.log("Logo has changed, newLogoId:", newLogoId);

        let logoData;
        if (newLogoId) {
          // Find the uploaded logo file data
          const logoFile = officeImages.find((img) => img.apiId === newLogoId);
          if (logoFile && logoFile.apiPath && logoFile.apiId) {
            logoData = {
              logo: {
                file: {
                  path: logoFile.apiPath,
                  id: logoFile.apiId,
                },
              },
            };
        } else {
            // This should be set from handleLogoUpload
            logoData = {
              logo: {
                file: {
                  path: "", // We need to store this from upload
                  id: newLogoId,
                },
              },
            };
          }
        } else {
          // Remove logo
          logoData = {
            logo: {
              file: {
                path: "",
                id: "",
              },
            },
          };
        }

        const logoResponse = await attachLogoToOffice(logoData);
        if (logoResponse.success) {
          logoAttached = true;
          console.log("Logo attached successfully");
        } else {
          throw new Error("Failed to attach logo");
        }
      }

      // Handle images changes
      if (hasChanges && officeImages.length > 0) {
        const validImages = officeImages.filter(
          (img): img is UploadedImage & { apiId: string; apiPath: string } =>
            img.apiId !== undefined && img.apiPath !== undefined
        );

        const imagesData = {
          images: validImages.map((img) => ({
            file: {
              path: img.apiPath,
              id: img.apiId,
            },
          })),
        };

        if (imagesData.images.length > 0) {
          const imagesResponse = await attachImagesToOffice(imagesData);
          if (imagesResponse.success) {
            imagesAttached = true;
            console.log("Images attached successfully");

            // Update existing images from response if provided
            if (imagesResponse.data && imagesResponse.data.images) {
              setExistingImages(imagesResponse.data.images);
            }
          } else {
            throw new Error("Failed to attach images");
          }
        }
      }

      // If we made any changes successfully
      if (logoAttached || imagesAttached || (!hasLogoChanged && !hasChanges)) {
        setHasChanges(false);
        setHasLogoChanged(false);
        setNewLogoId(null);
        setOfficeImages([]); // Clear uploaded images since they're now saved

        toast.success("Changes saved successfully");

        // Refresh office data to get the latest state
        try {
          const response = await fetchOwnedOffice();
          if (response.success && response.data) {
          setOfficeData(response.data);

          if (response.data.logo) {
            setExistingLogo(response.data.logo);
            setLogoUrl(`${API_BASE_URL}${response.data.logo.path}`);
          } else {
            setExistingLogo(null);
            setLogoUrl(null);
          }

          if (response.data.images && Array.isArray(response.data.images)) {
            setExistingImages(response.data.images);
          } else {
            setExistingImages([]);
          }
        }
        } catch (refreshError) {
          console.error("Error refreshing office data:", refreshError);
          // Don't throw here, the save was successful
        }
      }
    } catch (error) {
      console.error("Error saving changes:", error);
      toast.error("Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  // Function to get full image URL
  const getFullImageUrl = (path: string) => {
    // If path is already a full URL, return it as is
    if (path.startsWith("http://") || path.startsWith("https://")) {
      return path;
    }

    // Otherwise, construct the full URL
    return `${API_BASE_URL}${path}`;
  };

  // Function specifically to save logo changes
  const saveLogoChanges = async () => {
    if (!hasLogoChanged) {
      console.log("No logo changes to save");
      return;
    }

    setIsSaving(true);
    console.log("Starting logo save with newLogoId:", newLogoId);

    try {
      // Always explicitly log what we're doing
      if (newLogoId) {
        console.log(`Saving logo with ID: ${newLogoId}`);
      } else {
        console.log("Removing logo (sending null)");
      }

      // Prepare the logo update data in the exact format required by the API
      // This MUST be { logo: { id: "your-id" } } for updating or { logo: null } for removing
      const updateData: any = {
        logo: newLogoId ? { id: newLogoId } : null,
      };

      console.log("Saving logo with payload:", JSON.stringify(updateData));

      // Call the API to update the office
      const response = await updateOfficeDetails(updateData);
      console.log("Logo update response:", response);

      if (response.success) {
        setHasLogoChanged(false);
        // Clear the newLogoId after successful save
        setNewLogoId(null);
        toast.success("Logo updated successfully");

        // Update the local state with the new data
        if (response.data) {
          setOfficeData(response.data);

          if (response.data.logo) {
            setExistingLogo(response.data.logo);
            const fullLogoUrl = `${API_BASE_URL}${response.data.logo.path}`;
            setLogoUrl(fullLogoUrl);

            // Preload image
            const img = new window.Image();
            img.src = fullLogoUrl;
            console.log(
              "Logo updated successfully with path:",
              response.data.logo.path
            );
            console.log("Full logo URL:", fullLogoUrl);
          } else {
            setExistingLogo(null);
            setLogoUrl(null);
            console.log("Logo was removed (set to null in response)");
          }
        }
      } else {
        toast.error(
          `Failed to update logo: ${response.message || "Unknown error"}`
        );
        console.error("API error response:", response);
      }
    } catch (error) {
      console.error("Error updating logo:", error);
      toast.error("Failed to update logo due to an error");
    } finally {
      setIsSaving(false);
    }
  };

  React.useEffect(() => {
    return () => {
      officeImages.forEach((image) => {
        URL.revokeObjectURL(image.previewUrl);
      });
    };
  }, [officeImages]);

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-[300px]">
        <Loader isLoading={true} />
      </div>
    );
  }

  return (
    <>
      <div className="flex items-start sm:flex-row flex-col gap-4 justify-between">
        <div>
          <h2 className="text-[16px] font-semibold leading-[24px] mb-1">
            Update Logo
          </h2>
          <p className="sm:max-w-[291px] text-[#424242] text-[14px] font-normal leading-[21px]">
            Upload a image and add it to your logo. .png, .jpeg, .gif, files up
            to 8MB. Recommended size 256x256
          </p>
        </div>
        <div
          className={`sm:max-w-[388px] flex items-center gap-5 border-2 rounded-md transition-colors ${
            logoDragOver
              ? "border-[#54D10E] bg-[#F0F8F0]"
              : "border-transparent"
          }`}
          onDragOver={handleLogoAreaDragOver}
          onDragLeave={handleLogoAreaDragLeave}
          onDrop={handleLogoAreaDrop}
        >
          <div
            style={{ width: "100%" }}
            className="relative flex flex-col items-center"
          >
            {/* Logo preview or placeholder */}
            <div className="flex flex-row items-center w-full gap-4">
              {/* Logo dashed circle */}
              <div className="relative w-[100px] h-[100px] flex-shrink-0">
                <div className="w-[100px] h-[100px] rounded-full border-2 border-dashed border-[#DEDEDE] flex items-center justify-center overflow-hidden bg-white">
                  {uploadedFile ? (
                    <img
                      src={URL.createObjectURL(uploadedFile)}
                      alt="Logo Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : logoUrl ? (
                    <div className="w-full h-full">
                      <img
                        src={logoUrl}
                        alt="Logo"
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          console.error("Logo failed to load:", logoUrl);
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/assets/placeholder.png";
                        }}
                      />
                    </div>
                  ) : existingLogo ? (
                    <div className="w-full h-full">
                      <img
                        src={`${API_BASE_URL}${existingLogo.path}`}
                        alt="Logo"
                        crossOrigin="anonymous"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const failedUrl = `${API_BASE_URL}${existingLogo.path}`;
                          console.error("Logo failed to load:", failedUrl);
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/assets/placeholder.png";
                        }}
                      />
                    </div>
                  ) : (
                    <Image
                      src="/assets/document-upload.svg"
                      alt="document-upload"
                      width={32}
                      height={32}
                    />
                  )}
                </div>
                {/* Remove logo button (top right) */}
                {(uploadedFile || existingLogo) && (
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 z-10 border border-[#DEDEDE] cursor-pointer"
                    title="Remove Logo"
                  >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                      <path
                        d="M6 6l12 12M6 18L18 6"
                        stroke="#BF1212"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}
              </div>
              {/* Right side: Upload/Replace button and info */}
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => logoInputRef.current?.click()}
                    className="border border-[#20523C] rounded-md py-2 px-4 text-[#20523C] text-[16px] font-medium leading-[22px] flex items-center gap-1 justify-center cursor-pointer w-fit"
                  >
                    {uploadedFile || existingLogo
                      ? "Replace image"
                      : "Upload image"}
                  </button>
                </div>
                <span className="text-[#424242] text-[13px] font-normal leading-[18px] mt-1">
                  .png, .jpeg, .jpg, .gif files up to 8MB.
                  <br />
                  Recommended size 256x256
                </span>
                {hasLogoChanged && newLogoId && (
                  <span className="text-blue-500 text-[12px] mt-1">
                    New logo uploaded! Click "Save Update" to apply changes.
                  </span>
                )}
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept=".png,.jpeg,.jpg,.gif"
                className="hidden"
                onChange={handleLogoFileSelect}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[#DEDEDE] w-full h-[1px] mt-6 sm:mt-8 mb-6"></div>

      <div className="flex items-start sm:flex-row flex-col gap-4 justify-between">
        <div>
          <h2 className="text-[16px] font-semibold leading-[24px] mb-1">
            Office Media
          </h2>
          <p className="sm:max-w-[291px] text-[#424242] text-[#424242] text-[14px] font-normal leading-[21px]">
            To enhance visibility and user trust, kindly provide images showing
            the exterior and interior of your office, including a clear front
            view.
          </p>
        </div>
        <div className="sm:max-w-[386px] w-full">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragOver(false);
            }}
            onDrop={handleUploadAreaDrop}
            onClick={handleOfficeUploadClick}
            className={`w-full sm:min-w-full border-dashed border rounded-md cursor-pointer h-[150px] flex items-center justify-center flex-col transition-colors ${
              isDragOver
                ? "border-[#20523C] bg-[#F0F8F0]"
                : "border-[#DEDEDE] hover:border-[#20523C] hover:bg-[#FAFAFA]"
            }`}
          >
            <Image
              src="/assets/document-upload.svg"
              alt="document-upload"
              width={32}
              height={32}
            />
            <h3 className="mt-2 text-[12px] leading-[16px] font-normal text-[#424242]">
              <span className="text-[#20523C] font-medium">
                Click to upload
              </span>{" "}
              or drag and drop
            </h3>
          </div>

          <input
            ref={officeInputRef}
            type="file"
            multiple
            accept=".png,.jpeg,.jpg,.gif"
            onChange={handleOfficeFileSelect}
            className="hidden"
          />

          <div className="mt-4 sm:mt-3 grid grid-cols-4 sm:grid-cols-5 gap-2.5 sm:gap-[6.5px]">
            {/* Display uploaded office images */}
            {officeImages.map((image, index) => (
              <div
                key={image.id}
                draggable
                onDragStart={(e) => handleImageDragStart(e, index)}
                onDragOver={(e) => handleImageDragOver(e, index)}
                onDrop={(e) => handleImageDrop(e, index)}
                onDragEnd={handleImageDragEnd}
                className={`relative group cursor-move transition-opacity ${
                  draggedIndex === index ? "opacity-50" : ""
                } ${
                  dragOverIndex === index &&
                  draggedIndex !== null &&
                  draggedIndex !== index
                    ? "border-2 border-[#54D10E] border-dashed scale-105 z-10"
                    : ""
                }`}
                style={{ minHeight: 50 }}
              >
                <div
                  onClick={() => handleImageClick(image)}
                  className={`w-full border border-solid rounded-md h-[50px] overflow-hidden bg-white transition-all ${
                    index === 0
                      ? "border-[#20523C]"
                      : dragOverIndex === index &&
                        draggedIndex !== null &&
                        draggedIndex !== index
                      ? "border-2 border-[#54D10E] border-dashed"
                      : "border-[#DEDEDE]"
                  }`}
                >
                  <img
                    src={image.previewUrl}
                    alt={image.name}
                    draggable={false}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </div>
                {index === 0 && (
                  <div className="absolute top-0 left-0 bg-[#20523C] text-white text-[9px] leading-[12px] pl-1 pr-0.5 py-[1.5px] rounded-tl-md rounded-br-[4px] text-center pointer-events-none">
                    Main Photo
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteImage(image.id);
                  }}
                  className="absolute cursor-pointer -top-2 -right-2 w-5 h-5 bg-white rounded-full shadow-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-gray-50 z-10"
                >
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M1.5 3H2.5H10.5"
                      stroke="#BF1212"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9.5 3V10C9.5 10.2652 9.39464 10.5196 9.20711 10.7071C9.01957 10.8946 8.76522 11 8.5 11H3.5C3.23478 11 2.98043 10.8946 2.79289 10.7071C2.60536 10.5196 2.5 10.2652 2.5 10V3M4 3V2C4 1.73478 4.10536 1.48043 4.29289 1.29289C4.48043 1.10536 4.73478 1 5 1H7C7.26522 1 7.51957 1.10536 7.70711 1.29289C7.89464 1.48043 8 1.73478 8 2V3"
                      stroke="#BF1212"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            ))}

            {/* Display existing API images if available */}
            {existingImages.map((image, index) => (
              <div
                key={image.id}
                className="relative group"
                style={{ minHeight: 50 }}
              >
                <div
                  onClick={() =>
                    handleImageClick({
                      previewUrl: `${API_BASE_URL}${image.path}`,
                      name: `Image ${index + 1}`,
                    })
                  }
                  className={`w-full border border-solid rounded-md h-[50px] overflow-hidden bg-white`}
                >
                  <img
                    src={`${API_BASE_URL}${image.path}`}
                    alt={`Image ${index + 1}`}
                    crossOrigin="anonymous"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const failedUrl = `${API_BASE_URL}${image.path}`;
                      console.error("Image failed to load:", failedUrl);
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = "/assets/placeholder.png";
                    }}
                  />
                </div>
                {/* Add delete button if needed */}
              </div>
            ))}

            {/* Placeholder images */}
            {Array.from({
              length: Math.max(
                0,
                5 - officeImages.length - existingImages.length
              ),
            }).map((_, index) => (
              <div
                key={`placeholder-${index}`}
                className="w-full border border-dashed border-[#DEDEDE] bg-[#F8F8F8] rounded-md h-[50px] flex items-center justify-center"
              >
                <Image
                  src="/assets/random-image.svg"
                  alt="placeholder"
                  width={20}
                  height={20}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[#DEDEDE] w-full h-[1px] mt-6 sm:mt-8 mb-6"></div>

      <div className="flex items-end justify-end w-full">
        <GradientButton
          className={`h-10 sm:h-[46px] sm:w-fit w-full max-w-[150px] ${
            !(hasChanges || hasLogoChanged) || isSaving
              ? "opacity-60 cursor-not-allowed"
              : ""
          }`}
          disabled={!(hasChanges || hasLogoChanged) || isSaving}
          onClick={saveChanges}
        >
          {isSaving ? "Saving..." : "Save Update"}
        </GradientButton>
      </div>

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-hidden relative">
            <div className="p-4 border-b border-[#DEDEDE] flex items-center justify-between">
              <h3 className="text-[16px] leading-[19px] font-bold text-[#111111]">
                {selectedImage.name}
              </h3>
              <button
                onClick={() => setSelectedImage(null)}
                className="text-[#585858] hover:text-[#111111] transition-colors"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
            <div className="p-4 flex items-center justify-center">
              <img
                src={selectedImage.url}
                alt={selectedImage.name}
                className="max-w-full max-h-[70vh] object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageLogo;
