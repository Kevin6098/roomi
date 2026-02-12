/**
 * Tailwind classes for item status badges. Uses theme colors where possible.
 */
const STATUS_STYLES: Record<string, string> = {
  overdue: 'bg-orange-200 text-orange-900 border border-orange-400/80',
  in_stock: 'bg-emerald-100 text-emerald-800 border border-emerald-200/80',
  listed: 'bg-roomi-yellowLight/90 text-roomi-brown border border-roomi-yellow/60',
  reserved: 'bg-amber-100 text-amber-800 border border-amber-200/80',
  rented: 'bg-roomi-orange/20 text-roomi-brown border border-roomi-orange/50',
  sold: 'bg-slate-200 text-slate-700 border border-slate-300/80',
  disposed: 'bg-red-100 text-red-800 border border-red-200/80',
};

const DEFAULT_STATUS_STYLE = 'bg-roomi-peach/80 text-roomi-brown border border-roomi-peach';

export function getStatusBadgeClass(status: string): string {
  const base = 'text-xs font-medium px-2 py-0.5 rounded-roomi inline-block';
  const style = STATUS_STYLES[status] ?? DEFAULT_STATUS_STYLE;
  return `${base} ${style}`;
}
