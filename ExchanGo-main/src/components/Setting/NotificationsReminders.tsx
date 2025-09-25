import React, { useState, useEffect } from "react";
import ToggleButton from "../ui/ToggleButton";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import GradientButton from "../ui/GradientButton";
import {
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../../services/api";

const NotificationsReminders = () => {
  const [toggleChecked, setToggleChecked] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load notification preferences on component mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setIsLoading(true);
        console.log("Loading notification preferences...");
        const result = await getNotificationPreferences();
        console.log("Notification preferences result:", result);

        if (result.success && result.data) {
          const isEnabled = result.data.rateUpdateReminderWhatsApp || false;
          console.log("Setting toggle to:", isEnabled);
          setToggleChecked(isEnabled);
        } else {
          console.log("Failed to load preferences:", result.message);
          toast.error(
            result.message || "Failed to load notification preferences"
          );
        }
      } catch (error) {
        console.error("Error loading notification preferences:", error);
        toast.error("Failed to load notification preferences");
      } finally {
        setIsLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const handleToggleChange = (checked: boolean) => {
    setToggleChecked(checked);
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const result = await updateNotificationPreferences({
        rateUpdateReminderWhatsApp: toggleChecked,
      });

      if (result.success) {
        setIsDirty(false);
        toast.success("Notification preferences updated successfully.", {
          position: "top-right",
          autoClose: 2500,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      } else {
        toast.error(
          result.message || "Failed to update notification preferences"
        );
      }
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      toast.error("Failed to update notification preferences");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="flex items-start gap-6 justify-between mb-8">
        <div>
          <h2 className="text-[16px] font-semibold leading-[24px]">
            Update Rate
          </h2>
          <p className="text-[#424242] text-[14px] leading-[21px] font-normal max-w-[295px] mt-1">
            Notify me (via WhatsApp or Email) if exchange rates haven't been
            updated for 24h
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isLoading && (
            <div className="w-4 h-4 border-2 border-[#20523C] border-t-transparent rounded-full animate-spin"></div>
          )}
          <ToggleButton
            checked={toggleChecked}
            size="md"
            onChange={handleToggleChange}
            className="w-[37px]"
            disabled={isLoading}
          />
        </div>
      </div>
      <div className="bg-[#DEDEDE] w-full h-[1px] mb-6"></div>
      <div className="flex items-end justify-end w-full">
        <GradientButton
          className="h-[46px]"
          disabled={!isDirty || isSaving}
          onClick={handleSave}
        >
          {" "}
          {isSaving ? "Saving..." : "Save Update"}
        </GradientButton>
      </div>
    </div>
  );
};

export default NotificationsReminders;
