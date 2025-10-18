// src/app/utils/date-utils.ts
export class DateUtils {
  /** Convert Local Date to UTC string */
  static toUtc(localDate: string | Date): string {
    const date = typeof localDate === 'string' ? new Date(localDate) : localDate;
    return new Date(Date.UTC(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      date.getHours(),
      date.getMinutes(),
      date.getSeconds()
    )).toISOString();
  }

  /** Convert UTC string to Local Date string (yyyy-MM-dd for date inputs) */
  static toLocal(utcDate: string | Date): string {
    const date = typeof utcDate === 'string' ? new Date(utcDate) : utcDate;
    const offsetDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
    // Format as yyyy-MM-dd for Angular date inputs
    return offsetDate.toISOString().split('T')[0];
  }
}
