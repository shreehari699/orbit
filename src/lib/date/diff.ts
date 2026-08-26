/** Calendar-aware difference — years/months/days the way a human counts a birthday, not an averaged division. */
export interface CalendarDiff {
  years: number;
  months: number;
  days: number;
  totalDays: number;
}

export function calendarDiff(from: Date, to: Date): CalendarDiff {
  const start = from < to ? from : to;
  const end = from < to ? to : from;

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    const daysInPrevMonth = new Date(end.getFullYear(), end.getMonth(), 0).getDate();
    days += daysInPrevMonth;
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  const totalDays = Math.round((end.getTime() - start.getTime()) / 86_400_000);

  return { years, months, days, totalDays };
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
