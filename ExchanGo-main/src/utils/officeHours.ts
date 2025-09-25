interface WorkingHours {
  isActive: boolean;
  fromTime: string;
  toTime: string;
  hasBreak?: boolean;
  breakFromTime?: string;
  breakToTime?: string | null;
}

interface Office {
  todayWorkingHours?: WorkingHours;
}

/**
 * Calculates if an office is currently open based on today's working hours
 * @param office - Office object containing todayWorkingHours
 * @returns boolean - true if office is currently open, false otherwise
 */
export const isOfficeCurrentlyOpen = (office: Office): boolean => {
  if (!office.todayWorkingHours || !office.todayWorkingHours.isActive) {
    return false;
  }

  const now = new Date();
  const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes

  const { fromTime, toTime, hasBreak, breakFromTime, breakToTime } = office.todayWorkingHours;

  // Parse time strings (format: "HH:MM:SS" or "HH:MM")
  const parseTime = (timeStr: string): number => {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const openTime = parseTime(fromTime);
  const closeTime = parseTime(toTime);

  // Check if currently within operating hours
  let isWithinOperatingHours = false;
  
  if (closeTime > openTime) {
    // Normal case: same day (e.g., 09:00 to 21:00)
    isWithinOperatingHours = currentTime >= openTime && currentTime < closeTime;
  } else {
    // Overnight case: spans midnight (e.g., 22:00 to 06:00)
    isWithinOperatingHours = currentTime >= openTime || currentTime < closeTime;
  }

  // If not within operating hours, definitely closed
  if (!isWithinOperatingHours) {
    return false;
  }

  // Check if currently on break
  if (hasBreak && breakFromTime && breakToTime) {
    const breakStart = parseTime(breakFromTime);
    const breakEnd = parseTime(breakToTime);
    
    let isOnBreak = false;
    if (breakEnd > breakStart) {
      // Normal break: same day
      isOnBreak = currentTime >= breakStart && currentTime < breakEnd;
    } else {
      // Overnight break: spans midnight
      isOnBreak = currentTime >= breakStart || currentTime < breakEnd;
    }
    
    if (isOnBreak) {
      return false;
    }
  }

  return true;
};

/**
 * Adds isCurrentlyOpen property to office data
 * @param office - Office object
 * @returns Office object with isCurrentlyOpen property added
 */
export const enrichOfficeWithOpenStatus = <T extends Office>(office: T): T & { isCurrentlyOpen: boolean } => {
  return {
    ...office,
    isCurrentlyOpen: isOfficeCurrentlyOpen(office),
  };
};

/**
 * Enriches an array of offices with open/closed status
 * @param offices - Array of office objects
 * @returns Array of offices with isCurrentlyOpen property added
 */
export const enrichOfficesWithOpenStatus = <T extends Office>(offices: T[]): (T & { isCurrentlyOpen: boolean })[] => {
  return offices.map(enrichOfficeWithOpenStatus);
};
