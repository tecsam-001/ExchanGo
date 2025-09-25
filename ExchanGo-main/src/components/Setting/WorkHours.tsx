"use client";
import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
} from "react";
import ToggleButton from "../ui/ToggleButton";
import Checkbox from "../ui/Checkbox";
import Image from "next/image";
import { toast } from "react-toastify";
import { updateWorkingHours, getAllWorkingHours } from "@/services/api";
import Loader from "../ui/Loader";

interface Break {
  from: string;
  to: string;
}

interface DayHours {
  id?: string; // Optional ID from API
  isOpen: boolean;
  from: string;
  to: string;
  breaks: Break[];
}

interface WorkHoursState {
  monday: DayHours;
  tuesday: DayHours;
  wednesday: DayHours;
  thursday: DayHours;
  friday: DayHours;
  saturday: DayHours;
  sunday: DayHours;
}

interface TimePickerProps {
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
}

interface WorkHoursProps {
  onAnyChange?: () => void;
}

// Add public methods for WorkHours component
export interface WorkHoursRef {
  saveAllWorkingHours: () => Promise<boolean>;
  hasChanges: () => boolean;
}

const TimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  onClose,
}) => {
  const [selectedHour, setSelectedHour] = useState(value.split(":")[0]);
  const [selectedMinute, setSelectedMinute] = useState(value.split(":")[1]);

  const handleHourSelect = (hour: string) => {
    setSelectedHour(hour);
    onChange(`${hour}:${selectedMinute}`);
  };

  const handleMinuteSelect = (minute: string) => {
    setSelectedMinute(minute);
    onChange(`${selectedHour}:${minute}`);
    onClose();
  };

  return (
    <div className="absolute top-full left-1/2 transform -translate-x-1/2 z-30 mt-2 bg-white border border-[#DEDEDE] rounded-lg shadow-lg px-2 py-2 max-h-60 overflow-y-auto">
      <div className="flex flex-row">
        <div className="flex-1 pr-2 bg-white">
          <div className="font-medium text-[12px] leading-[20px] mb-1 text-center">
            Hour
          </div>
          {Array.from({ length: 24 }, (_, i) => i).map((hour) => (
            <div
              key={hour}
              className="cursor-pointer hover:bg-[#DEDEDE] rounded text-[12px] px-2 py-1 text-center text-[#111111] bg-white"
              onClick={() => handleHourSelect(String(hour).padStart(2, "0"))}
            >
              {String(hour).padStart(2, "0")}
            </div>
          ))}
        </div>
        <div className="flex-1">
          <div className="font-medium text-[12px] leading-[20px] mb-1 text-center">
            Minute
          </div>
          {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
            <div
              key={minute}
              className="cursor-pointer hover:bg-[#DEDEDE] rounded text-[12px] px-2 py-1 text-center text-[#111111] bg-white"
              onClick={() =>
                handleMinuteSelect(String(minute).padStart(2, "0"))
              }
            >
              {String(minute).padStart(2, "0")}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

interface TimeInputProps {
  value: string;
  label: string;
  onClick: () => void;
  showPicker: boolean;
  onTimeChange: (value: string) => void;
  onClose: () => void;
}

const TimeInput: React.FC<TimeInputProps> = ({
  value,
  label,
  onClick,
  showPicker,
  onTimeChange,
  onClose,
}) => {
  return (
    <div className="relative flex-col flex items-center ">
      <span className="absolute text-[#111111] -top-2 left-3 text-[12px] font-medium bg-white px-1 z-10">
        {label}
      </span>
      <input
        type="text"
        value={value}
        readOnly
        onClick={onClick}
        className="border border-[#DEDEDE] h-[56px] rounded-lg px-3.5 smaller text-[14px] leading-[20px] font-normal outline-none text-[#585858] w-full sm:w-[104px] cursor-pointer"
      />
      {showPicker && (
        <TimePicker value={value} onChange={onTimeChange} onClose={onClose} />
      )}
    </div>
  );
};

const WorkHours = forwardRef<WorkHoursRef, WorkHoursProps>(
  ({ onAnyChange }, ref) => {
    // Default working hours state
    const defaultWorkHours: WorkHoursState = {
      monday: { isOpen: true, from: "00:00", to: "00:00", breaks: [] },
      tuesday: { isOpen: true, from: "00:00", to: "00:00", breaks: [] },
      wednesday: { isOpen: true, from: "00:00", to: "00:00", breaks: [] },
      thursday: { isOpen: true, from: "00:00", to: "00:00", breaks: [] },
      friday: { isOpen: true, from: "00:00", to: "00:00", breaks: [] },
      saturday: { isOpen: false, from: "00:00", to: "00:00", breaks: [] },
      sunday: { isOpen: false, from: "00:00", to: "00:00", breaks: [] },
    };

    const [originalWorkHours, setOriginalWorkHours] =
      useState<WorkHoursState>(defaultWorkHours);
    const [workHours, setWorkHours] =
      useState<WorkHoursState>(defaultWorkHours);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const daysOfWeek: (keyof WorkHoursState)[] = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    // Expose methods to parent component via ref
    useImperativeHandle(ref, () => ({
      // Method to save all working hours
      saveAllWorkingHours: async () => {
        setIsSaving(true);

        try {
          // Get days that have changes
          const changedDays = daysOfWeek.filter((day) => {
            const current = JSON.stringify(workHours[day]);
            const original = JSON.stringify(originalWorkHours[day]);
            return current !== original;
          });

          console.log("Saving changes for days:", changedDays);

          if (changedDays.length === 0) {
            console.log("No changes to save");
            return true;
          }

          // Prepare data for API - send all changed days in single request
          const workingHoursData = changedDays.map((day) => {
            const dayHours = workHours[day];
            const apiData: any = {
              dayOfWeek: day,
              isActive: dayHours.isOpen,
            };

            // Only include time fields if the day is active
            if (dayHours.isOpen) {
              apiData.fromTime = dayHours.from;
              apiData.toTime = dayHours.to;
              apiData.hasBreak = dayHours.breaks.length > 0;

              if (dayHours.breaks.length > 0) {
                apiData.breakFromTime = dayHours.breaks[0].from;
                apiData.breakToTime = dayHours.breaks[0].to;
              }
            }

            return apiData;
          });

          console.log("Sending working hours data:", workingHoursData);

          // Save all changes in single API call
          const response = await updateWorkingHours(workingHoursData);

          if (!response.success) {
            console.error("Error saving working hours:", response);
            toast.error(response.message || "Failed to save working hours");
            return false;
          }

          // Update original state to match current state
          setOriginalWorkHours({ ...workHours });
          return true;
        } catch (error) {
          console.error("Error saving working hours:", error);
          toast.error("Failed to save working hours");
          return false;
        } finally {
          setIsSaving(false);
        }
      },

      // Method to check if there are unsaved changes
      hasChanges: () => {
        return daysOfWeek.some((day) => {
          const current = JSON.stringify(workHours[day]);
          const original = JSON.stringify(originalWorkHours[day]);
          return current !== original;
        });
      },
    }));

    // Fetch working hours on component mount
    useEffect(() => {
      const fetchWorkingHours = async () => {
        try {
          setIsLoading(true);

          // Fetch working hours for the authenticated user's office
          const response = await getAllWorkingHours();
          if (response.success && response.data) {
            // The API returns working hours for the authenticated user's office
            const workingHoursData = Array.isArray(response.data)
              ? response.data
              : [response.data];

            // Map API data to component state
            const updatedWorkHours: Partial<WorkHoursState> = {};

            // Process each day from the API response
            workingHoursData.forEach((dayData: any) => {
              const day = dayData.dayOfWeek.toLowerCase();
              if (day in defaultWorkHours) {
                const dayKey = day as keyof WorkHoursState;
                updatedWorkHours[dayKey] = {
                  id: dayData.id,
                  isOpen: dayData.isActive,
                  from: dayData.fromTime?.substring(0, 5) || "00:00", // Format as HH:MM
                  to: dayData.toTime?.substring(0, 5) || "00:00", // Format as HH:MM
                  breaks: dayData.hasBreak
                    ? [
                        {
                          from:
                            dayData.breakFromTime?.substring(0, 5) || "00:00",
                          to: dayData.breakToTime?.substring(0, 5) || "00:00",
                        },
                      ]
                    : [],
                };
              }
            });

            const newWorkHours = {
              ...defaultWorkHours,
              ...updatedWorkHours,
            };

            // Set both current and original state
            setWorkHours(newWorkHours);
            setOriginalWorkHours(newWorkHours);
            console.log("Loaded working hours:", newWorkHours);
          } else {
            console.log("No working hours data found, using defaults");
          }
        } catch (error) {
          console.error("Error fetching working hours:", error);
          toast.error("Failed to load working hours");
        } finally {
          setIsLoading(false);
        }
      };

      fetchWorkingHours();
    }, []);

    const [openPicker, setOpenPicker] = useState<{
      day: keyof WorkHoursState | null;
      type:
        | "from"
        | "to"
        | `break-from-${number}`
        | `break-to-${number}`
        | null;
    }>({
      day: null,
      type: null,
    });

    // Modified handlers to only update local state, not call API
    const handleToggle = (day: keyof WorkHoursState) => {
      setWorkHours((prev) => ({
        ...prev,
        [day]: { ...prev[day], isOpen: !prev[day].isOpen, breaks: [] },
      }));
      if (onAnyChange) onAnyChange();
    };

    const handleTimeChange = (
      day: keyof WorkHoursState,
      type: "from" | "to",
      value: string
    ) => {
      setWorkHours((prev) => ({
        ...prev,
        [day]: { ...prev[day], [type]: value },
      }));
      if (onAnyChange) onAnyChange();
    };

    const handleBreakTimeChange = (
      day: keyof WorkHoursState,
      index: number,
      type: "from" | "to",
      value: string
    ) => {
      setWorkHours((prev) => {
        const newBreaks = [...prev[day].breaks];
        newBreaks[index] = { ...newBreaks[index], [type]: value };
        return {
          ...prev,
          [day]: { ...prev[day], breaks: newBreaks },
        };
      });
      if (onAnyChange) onAnyChange();
    };

    const handleAddBreak = (day: keyof WorkHoursState) => {
      setWorkHours((prev) => ({
        ...prev,
        [day]: {
          ...prev[day],
          breaks: [...prev[day].breaks, { from: "00:00", to: "00:00" }],
        },
      }));
      if (onAnyChange) onAnyChange();
    };

    const handleRemoveBreak = (day: keyof WorkHoursState, index: number) => {
      setWorkHours((prev) => ({
        ...prev,
        [day]: {
          ...prev[day],
          breaks: prev[day].breaks.filter((_, i) => i !== index),
        },
      }));
      if (onAnyChange) onAnyChange();
    };

    const handleClearBreaks = (day: keyof WorkHoursState) => {
      setWorkHours((prev) => ({
        ...prev,
        [day]: { ...prev[day], breaks: [] },
      }));
      if (onAnyChange) onAnyChange();
    };

    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-[300px]">
          <Loader isLoading={true} />
        </div>
      );
    }

    return (
      <div className="relative">
        {isSaving && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-20">
            <Loader isLoading={true} />
          </div>
        )}
        {daysOfWeek.map((day) => (
          <div
            key={day}
            className="w-full flex items-start justify-between sm:flex-row flex-col gap-5 sm:gap-2 mb-4 relative"
          >
            <div className="sm:mt-[22px] flex items-center gap-2 justify-between w-full max-w-full sm:min-w-[148px] sm:max-w-[148px]">
              <div className="w-[90px] text-[#000000] text-[14px] leading-[18px] font-semibold capitalize">
                {day}
              </div>

              <ToggleButton
                checked={workHours[day].isOpen}
                size="md"
                onChange={() => handleToggle(day)}
                className="min-w-[36.5px] max-w-[36.5px]"
              />
            </div>

            {workHours[day].isOpen ? (
              <div className="flex items-start flex-col">
                <div className="flex start gap-3 sm:gap-4">
                  <TimeInput
                    value={workHours[day].from}
                    label="From"
                    onClick={() => setOpenPicker({ day, type: "from" })}
                    showPicker={
                      openPicker.day === day && openPicker.type === "from"
                    }
                    onTimeChange={(value) =>
                      handleTimeChange(day, "from", value)
                    }
                    onClose={() => setOpenPicker({ day: null, type: null })}
                  />
                  <TimeInput
                    value={workHours[day].to}
                    label="To"
                    onClick={() => setOpenPicker({ day, type: "to" })}
                    showPicker={
                      openPicker.day === day && openPicker.type === "to"
                    }
                    onTimeChange={(value) => handleTimeChange(day, "to", value)}
                    onClose={() => setOpenPicker({ day: null, type: null })}
                  />
                </div>

                <div className="mt-2 sm:mt-1.5 flex items-start flex-col w-full">
                  <div className="w-full flex items-center gap-1.5 justify-between sm:mb-2">
                    <div className="flex items-center gap-1">
                      <Checkbox
                        checked={workHours[day].breaks.length > 0}
                        onChange={(isChecked: boolean) => {
                          if (workHours[day].breaks.length === 0 && isChecked) {
                            handleAddBreak(day);
                          } else if (
                            workHours[day].breaks.length > 0 &&
                            !isChecked
                          ) {
                            handleClearBreaks(day);
                          }
                        }}
                      />
                      <span className="text-[#585858] text-[12px] font-normal leading-[17px]">
                        {workHours[day].breaks.length === 0
                          ? "Add a break"
                          : workHours[day].breaks.length > 1
                          ? `Multiple Break Added (${workHours[day].breaks.length})`
                          : "Single Break Added"}
                      </span>
                    </div>
                    <div>
                      {workHours[day].breaks.length > 0 && (
                        <button
                          onClick={() => handleAddBreak(day)}
                          className="cursor-pointer"
                        >
                          <svg
                            width="20"
                            height="21"
                            viewBox="0 0 20 21"
                            className="mt-1"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M4.16406 10.2627H15.8307"
                              stroke="#20523C"
                              strokeWidth="1.01381"
                              strokeLinecap="round"
                            />
                            <path
                              d="M10 15.1048V5.64258"
                              stroke="#20523C"
                              strokeWidth="1.01381"
                              strokeLinecap="round"
                            />
                          </svg>
                        </button>
                      )}
                    </div>
                  </div>

                  {workHours[day].breaks.length > 0 &&
                    workHours[day].breaks.map((dayBreak, index) => (
                      <div
                        key={index}
                        className="mt-4 sm:mt-3 flex items-center gap-3 sm:gap-4 mb-2 relative"
                      >
                        <button
                          onClick={() => handleRemoveBreak(day, index)}
                          className="cursor-pointer absolute -left-9 sm:block hidden"
                        >
                          <Image
                            src="/assets/close-modal.svg"
                            alt="close"
                            width={20}
                            height={20}
                            className="min-w-[20px] max-w-[20px]"
                          />
                        </button>
                        <TimeInput
                          value={dayBreak.from}
                          label="Break From"
                          onClick={() =>
                            setOpenPicker({ day, type: `break-from-${index}` })
                          }
                          showPicker={
                            openPicker.day === day &&
                            openPicker.type === `break-from-${index}`
                          }
                          onTimeChange={(value) =>
                            handleBreakTimeChange(day, index, "from", value)
                          }
                          onClose={() =>
                            setOpenPicker({ day: null, type: null })
                          }
                        />
                        <TimeInput
                          value={dayBreak.to}
                          label="Finish"
                          onClick={() =>
                            setOpenPicker({ day, type: `break-to-${index}` })
                          }
                          showPicker={
                            openPicker.day === day &&
                            openPicker.type === `break-to-${index}`
                          }
                          onTimeChange={(value) =>
                            handleBreakTimeChange(day, index, "to", value)
                          }
                          onClose={() =>
                            setOpenPicker({ day: null, type: null })
                          }
                        />
                        <button
                          onClick={() => handleRemoveBreak(day, index)}
                          className="cursor-pointer sm:hidden"
                        >
                          <Image
                            src="/assets/close-modal.svg"
                            alt="close"
                            width={20}
                            height={20}
                            className="min-w-[20px] max-w-[20px]"
                          />
                        </button>
                      </div>
                    ))}

                  {workHours[day].breaks.length > 0 && (
                    <p className="w-full sm:w-[224px] text-[12px] leading-[17px] font-normal text-[#585858] sm:mb-1.5">
                      *Breaks can only be taken during working hours
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="w-full sm:w-[224px] bg-[#F1F1F1] h-[56px] rounded-lg px-4 text-[#585858] text-[14px] leading-[20px] font-normal flex items-center">
                Closed
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }
);

// Add display name for React DevTools
WorkHours.displayName = "WorkHours";

export default WorkHours;
