import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { api } from '../api/client';
import { getRentalEarnings } from '../utils/rentalEarnings';

export default function Rentals() {
  const { t } = useTranslation();
  const [status, setStatus] = useState<string>('active');
  const [endedDateFrom, setEndedDateFrom] = useState<string>('');
  const [endedDateTo, setEndedDateTo] = useState<string>('');

  const { data: rentals, isLoading, error } = useQuery({
    queryKey: ['rentals', status],
    queryFn: () => api.rentals.getMany({ status: status || undefined }),
  });

  const endedRentals = useMemo(() => rentals ?? [], [rentals]);
  const filteredEnded = useMemo(() => {
    if (status !== 'ended') return [];
    return endedRentals.filter((r) => {
      const endDate = (r.actualEndDate || r.expectedEndDate || '').slice(0, 10);
      if (endedDateFrom && endDate < endedDateFrom) return false;
      if (endedDateTo && endDate > endedDateTo) return false;
      return true;
    });
  }, [status, endedRentals, endedDateFrom, endedDateTo]);

  const endedTotals = useMemo(() => {
    let totalEarnings = 0;
    filteredEnded.forEach((r) => {
      totalEarnings += getRentalEarnings(r);
    });
    return { totalEarnings, count: filteredEnded.length };
  }, [filteredEnded]);

  if (isLoading) return <p className="text-roomi-brownLight">{t('dashboard.loading')}</p>;
  if (error) return <div className="card p-4 text-red-600 bg-red-50 border-red-200">{(error as Error).message}</div>;

  return (
    <div className="space-y-8 w-full max-w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-roomi-brown">{t('nav.rentals')}</h1>
        <Link to="/rentals/new" className="btn-primary shrink-0">
          {t('form.startRental')}
        </Link>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setStatus('active')}
          className={`px-4 py-2 rounded-roomi text-sm font-semibold transition-colors ${
            status === 'active'
              ? 'bg-roomi-orange text-white shadow-roomi'
              : 'bg-roomi-cream/80 text-roomi-brownLight hover:bg-roomi-peach/60 hover:text-roomi-brown border border-roomi-peach/60'
          }`}
        >
          {t('status.active')}
        </button>
        <button
          type="button"
          onClick={() => setStatus('ended')}
          className={`px-4 py-2 rounded-roomi text-sm font-semibold transition-colors ${
            status === 'ended'
              ? 'bg-roomi-orange text-white shadow-roomi'
              : 'bg-roomi-cream/80 text-roomi-brownLight hover:bg-roomi-peach/60 hover:text-roomi-brown border border-roomi-peach/60'
          }`}
        >
          {t('status.ended')}
        </button>
      </div>

      {status === 'active' && (
        <div className="card overflow-hidden max-w-full min-w-0">
          <table className="min-w-full divide-y divide-roomi-peach/60 table-fixed sm:table-auto">
            <thead className="bg-roomi-cream/80">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-roomi-brown uppercase">{t('table.item')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-roomi-brown uppercase">{t('table.customer')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-roomi-brown uppercase">{t('table.start')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-roomi-brown uppercase">{t('table.expectedEnd')}</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-roomi-brown uppercase">{t('table.overdue')}</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-roomi-brown uppercase">{t('actions.endRental')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-roomi-peach/60 bg-white">
              {(rentals ?? []).map((r) => (
                <tr key={r.id} className="hover:bg-roomi-cream/40">
                  <td className="px-4 py-3 font-medium text-roomi-brown min-w-0 truncate" title={r.item?.title ?? r.itemId}>{r.item?.title ?? r.itemId}</td>
                  <td className="px-4 py-3 text-sm text-roomi-brownLight min-w-0 truncate" title={r.customer?.name ?? r.customerId}>{r.customer?.name ?? r.customerId}</td>
                  <td className="px-4 py-3 text-sm text-roomi-brownLight shrink-0">{(r.startDate || '').slice(0, 10)}</td>
                  <td className="px-4 py-3 text-sm text-roomi-brownLight shrink-0">{(r.expectedEndDate || '').slice(0, 10)}</td>
                  <td className="px-4 py-3">
                    {r.isOverdue ? <span className="text-orange-600 font-medium">{t('common.yes')}</span> : <span className="text-roomi-brownLight">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/rentals/${r.id}/end`} className="text-roomi-orange hover:underline font-medium text-sm">
                      {t('actions.endRental')}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {(rentals?.length ?? 0) === 0 && (
            <p className="px-4 py-8 text-center text-roomi-brownLight">{t('empty.noRentals')}</p>
          )}
        </div>
      )}

      {status === 'ended' && (
        <>
          {/* Filters for ended */}
          <div className="rounded-roomiLg border-2 border-roomi-peach bg-white px-4 py-3 shadow-roomi">
            <p className="text-sm font-semibold text-roomi-brown mb-3">{t('rentalAnalytics.filters')}</p>
            <div className="flex flex-wrap items-end gap-4">
              <div>
                <label className="label text-xs">{t('rentalAnalytics.endedFrom')}</label>
                <input
                  type="date"
                  value={endedDateFrom}
                  onChange={(e) => setEndedDateFrom(e.target.value)}
                  className="input-field min-w-[140px]"
                />
              </div>
              <div>
                <label className="label text-xs">{t('rentalAnalytics.endedTo')}</label>
                <input
                  type="date"
                  value={endedDateTo}
                  onChange={(e) => setEndedDateTo(e.target.value)}
                  className="input-field min-w-[140px]"
                />
              </div>
            </div>
          </div>

          {filteredEnded.length === 0 ? (
            <div className="card p-8 text-center text-roomi-brownLight">
              {endedRentals.length === 0 ? t('empty.noRentals') : t('rentalAnalytics.noEndedInPeriod')}
            </div>
          ) : (
            <>
              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="card p-5 border-l-4 border-roomi-mint">
                  <p className="text-sm font-semibold text-roomi-brownLight">{t('rentalAnalytics.totalEarnings')}</p>
                  <p className="text-2xl font-bold text-roomi-brown">{endedTotals.totalEarnings.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div className="card p-5 border-l-4 border-roomi-orange/60">
                  <p className="text-sm font-semibold text-roomi-brownLight">{t('rentalAnalytics.endedCount')}</p>
                  <p className="text-2xl font-bold text-roomi-brown">{endedTotals.count}</p>
                </div>
              </div>

              {/* Ended rentals list - card layout */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-roomi-brown">{t('rentalAnalytics.endedList')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredEnded.map((r) => {
                    const earnings = getRentalEarnings(r);
                    const start = (r.startDate || '').slice(0, 10);
                    const end = (r.actualEndDate || r.expectedEndDate || '').slice(0, 10);
                    return (
                      <div key={r.id} className="card p-4 flex flex-col gap-2 hover:shadow-roomiMd transition-shadow">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-semibold text-roomi-brown truncate">{r.item?.title ?? r.itemId}</p>
                            <p className="text-sm text-roomi-brownLight">{r.customer?.name ?? r.customerId}</p>
                          </div>
                          <span className="shrink-0 text-lg font-bold text-roomi-mintDark">
                            {earnings.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-roomi-brownLight">
                          <span>{t('table.start')}: {start}</span>
                          <span>{t('rentalAnalytics.endedOn')}: {end}</span>
                        </div>
{r.item?.subCategory && (
                            <p className="text-xs text-roomi-brownLight">
                              {r.item.subCategory.mainCategory?.name} → {r.item.displaySubCategory ?? r.item.subCategory.name}
                            </p>
                          )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
