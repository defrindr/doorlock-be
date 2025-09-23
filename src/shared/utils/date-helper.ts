export class DateHelper {
  /**
   * Convert Unix timestamp (seconds) to JavaScript Date
   * @param unixTimestamp Unix timestamp in seconds
   * @returns Date object
   */
  static fromUnix(unixTimestamp: number): Date {
    return new Date(unixTimestamp * 1000); // JS Date expects milliseconds
  }

  /**
   * Convert Unix timestamp (milliseconds) to JavaScript Date
   * @param unixTimestampMillis Unix timestamp in milliseconds
   * @returns Date object
   */
  static fromUnixMillis(unixTimestampMillis: number): Date {
    return new Date(unixTimestampMillis);
  }

  /**
   * Convert Date to Unix timestamp (seconds)
   * @param date Date object
   * @returns Unix timestamp in seconds
   */
  static toUnix(date: Date): number {
    return Math.floor(date.getTime() / 1000);
  }

  /**
   * Convert Date to Unix timestamp (milliseconds)
   * @param date Date object
   * @returns Unix timestamp in milliseconds
   */
  static toUnixMillis(date: Date): number {
    return date.getTime();
  }

  static formatMachineDateTime(date: Date) {
    const pad = (num: number) => String(num).padStart(2, '0');

    // Convert to UTC+7 (WIB - Western Indonesian Time)
    const utcTime = date.getTime() + date.getTimezoneOffset() * 60000; // Convert to UTC
    const wibDate = new Date(utcTime + 7 * 60 * 60 * 1000); // Add 7 hours for WIB

    const day = pad(wibDate.getDate());
    const month = pad(wibDate.getMonth() + 1); // Months are 0-based
    const year = wibDate.getFullYear();

    const hours = pad(wibDate.getHours());
    const minutes = pad(wibDate.getMinutes());
    const seconds = pad(wibDate.getSeconds());

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
  }
}
