import { WorkingHour } from '../../working-hours/domain/working-hour';

/**
 * Utility functions for handling office working hours
 */
export class OfficeHoursUtil {
  /**
   * Check if an office is currently open based on its working hours
   * @param workingHours Array of working hours for the office
   * @param currentTime Optional current time (defaults to now)
   * @returns boolean indicating if the office is open
   */
  static isOfficeOpen(
    workingHours: WorkingHour[],
    currentTime?: Date,
  ): boolean {
    if (!workingHours || workingHours.length === 0) {
      return false;
    }

    const now = currentTime || new Date();
    const currentDay = this.getCurrentDayOfWeek(now);
    const currentTimeString = this.formatTimeToHHMM(now);

    // Find working hours for current day
    const todayWorkingHours = workingHours.find(
      (wh) => wh.dayOfWeek.toUpperCase() === currentDay && wh.isActive,
    );

    if (!todayWorkingHours) {
      return false;
    }

    // Check if current time is within working hours
    const isWithinWorkingHours = this.isTimeInRange(
      currentTimeString,
      todayWorkingHours.fromTime,
      todayWorkingHours.toTime,
    );

    if (!isWithinWorkingHours) {
      return false;
    }

    // Check if it's during break time
    if (
      todayWorkingHours.hasBreak &&
      todayWorkingHours.breakFromTime &&
      todayWorkingHours.breakToTime
    ) {
      const isDuringBreak = this.isTimeInRange(
        currentTimeString,
        todayWorkingHours.breakFromTime,
        todayWorkingHours.breakToTime,
      );

      if (isDuringBreak) {
        return false;
      }
    }

    return true;
  }

  /**
   * Get current day of week in uppercase format
   * @param date Date object
   * @returns Day of week string (e.g., 'MONDAY')
   */
  private static getCurrentDayOfWeek(date: Date): string {
    const days = [
      'SUNDAY',
      'MONDAY',
      'TUESDAY',
      'WEDNESDAY',
      'THURSDAY',
      'FRIDAY',
      'SATURDAY',
    ];
    return days[date.getDay()];
  }

  /**
   * Format time to HH:MM format
   * @param date Date object
   * @returns Time string in HH:MM format
   */
  private static formatTimeToHHMM(date: Date): string {
    return date.toTimeString().slice(0, 5);
  }

  /**
   * Check if a time is within a given range
   * @param time Time to check (HH:MM format)
   * @param startTime Start time (HH:MM format)
   * @param endTime End time (HH:MM format)
   * @returns boolean indicating if time is in range
   */
  private static isTimeInRange(
    time: string,
    startTime: string,
    endTime: string,
  ): boolean {
    if (!startTime || !endTime) {
      return false;
    }

    // Convert times to minutes for easier comparison
    const timeMinutes = this.timeToMinutes(time);
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);

    // Handle case where end time is next day (e.g., 22:00 to 02:00)
    if (endMinutes < startMinutes) {
      return timeMinutes >= startMinutes || timeMinutes <= endMinutes;
    }

    return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
  }

  /**
   * Convert time string (HH:MM) to minutes since midnight
   * @param timeString Time in HH:MM format
   * @returns Number of minutes since midnight
   */
  private static timeToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  /**
   * Get today's working hours for an office
   * @param workingHours Array of working hours
   * @param currentTime Optional current time (defaults to now)
   * @returns Today's working hours or null if not found
   */
  static getTodayWorkingHours(
    workingHours: WorkingHour[],
    currentTime?: Date,
  ): WorkingHour | null {
    if (!workingHours || workingHours.length === 0) {
      return null;
    }

    const now = currentTime || new Date();
    const currentDay = this.getCurrentDayOfWeek(now);

    return (
      workingHours.find(
        (wh) => wh.dayOfWeek.toUpperCase() === currentDay && wh.isActive,
      ) || null
    );
  }
}
