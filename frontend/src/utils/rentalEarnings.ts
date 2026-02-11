import type { Rental } from '../api/client';

/**
 * Compute rent earned for a rental from start to end (actualEndDate or expectedEndDate).
 * Uses rentPriceMonthly or rentPriceAnnually based on rentPeriod.
 */
export function getRentalEarnings(r: Rental): number {
  const end = r.actualEndDate || r.expectedEndDate;
  const start = r.startDate;
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  const days = Math.max(0, (endMs - startMs) / (24 * 60 * 60 * 1000));

  const monthly = Number(r.rentPriceMonthly ?? 0);
  const annually = Number(r.rentPriceAnnually ?? 0);

  if (r.rentPeriod === 'annually' && annually > 0) {
    return (days / 365) * annually;
  }
  if (monthly > 0) {
    return (days / 30) * monthly;
  }
  if (annually > 0) {
    return (days / 365) * annually;
  }
  return 0;
}
