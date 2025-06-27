import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export class DateTimeHelper {
  private static timezone: string = process.env.TIMEZONE || 'UTC';

  /**
   * Get current date only (without time) in the configured timezone
   * @returns String representing current date in YYYY-MM-DD format
   */
  static getDate(): string {
    const now = new Date();
    
    // Get the current date in the configured timezone and return as YYYY-MM-DD
    const localDateString = now.toLocaleDateString('en-CA', { timeZone: this.timezone }); // YYYY-MM-DD format
    
    return localDateString;
  }

  /**
   * Get current date and time in the configured timezone
   * @returns String representing current date and time in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)
   */
  static getDateTime(): string {
    const now = new Date();
    return now.toISOString(); // Return the current UTC datetime in ISO format
  }

  /**
   * Get current time only (hours, minutes, seconds) as a formatted string
   * @returns String representing current time in HH:MM:SS format
   */
  static getTime(): string {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
      timeZone: this.timezone,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
        return timeString;
  }

  /**
   * Format a date to a readable string in the configured timezone
   * @param date - Date to format
   * @returns Formatted date string
   */
  static formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', { 
      timeZone: this.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    });
  }

  /**
   * Format a datetime to a readable string in the configured timezone
   * @param date - Date to format
   * @returns Formatted datetime string
   */
  static formatDateTime(date: Date): string {
    return date.toLocaleString('en-US', { 
      timeZone: this.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  }

  /**
   * Get timezone info
   * @returns Current configured timezone
   */
  static getTimezone(): string {
    return this.timezone;
  }

  /**
   * Set timezone (useful for testing or runtime changes)
   * @param timezone - Timezone string (e.g., 'Asia/Kathmandu')
   */
  static setTimezone(timezone: string): void {
    this.timezone = timezone;
  }

  /**
   * Log timezone information for debugging
   */
  static logTimezoneInfo(): void {
    console.log(`Current Date: ${this.getDate()}`);
    console.log(`Current DateTime: ${this.getDateTime()}`);
    console.log(`Current Time: ${this.getTime()}`);
  }

  /**
   * Get current date as Date object (for database storage)
   * @returns Date object representing current date at midnight UTC
   */
  static getDateObject(): Date {
    const dateString = this.getDate();
    return new Date(dateString + 'T00:00:00.000Z');
  }

  /**
   * Get current date and time as Date object (for database storage)
   * @returns Date object representing current date and time
   */
  static getDateTimeObject(): Date {
    return new Date();
  }

}
