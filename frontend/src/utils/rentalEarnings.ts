import type { Rental } from '../api/client';

/**
 * Count full calendar months between start and end (inclusive of end month only if end day > start day).
 * E.g. Jan 1 → Mar 1 = 2 months (Jan, Feb); Jan 1 → Mar 6 = 3 months (Jan, Feb, Mar); Jan 1 → Feb 28 = 2 months.
 */
function fullCalendarMonths(startDate: string, endDate: string): number {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const startY = start.getFullYear();
  const startM = start.getMonth();
  const startD = start.getDate();
  const endY = end.getFullYear();
  const endM = end.getMonth();
  const endD = end.getDate();

  let months = (endY - startY) * 12 + (endM - startM);
  if (endD > startD) months += 1;
  return Math.max(0, months);
}

/**
 * Compute rent earned for a rental from start to end (actualEndDate or expectedEndDate).
 * Uses full calendar months (or full years for annual), not days or proration.
 * - Monthly: earnings = full calendar months × rentPriceMonthly.
 * - Annual: earnings = full years (floor(months/12)) × rentPriceAnnually.
 */
export function getRentalEarnings(r: Rental): number {
  const end = r.actualEndDate || r.expectedEndDate;
  const start = r.startDate;
  if (!start || !end) return 0;

  const months = fullCalendarMonths(start, end);
  const monthly = Number(r.rentPriceMonthly ?? 0);
  const annually = Number(r.rentPriceAnnually ?? 0);

  if (r.rentPeriod === 'annually' && annually > 0) {
    const fullYears = Math.floor(months / 12);
    return fullYears * annually;
  }
  if (monthly > 0) {
    return months * monthly;
  }
  if (annually > 0) {
    const fullYears = Math.floor(months / 12);
    return fullYears * annually;
  }
  return 0;
}
