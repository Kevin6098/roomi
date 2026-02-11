import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { api } from '../api/client';

const PIE_COLORS = ['#D88E4B', '#9ACFC0', '#A67C52', '#F8DB68', '#7AB8A8', '#FCE8DE', '#8B5A2B', '#F0A05A'];

export default function Sales() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');

  const { data: salesRaw, isLoading, error } = useQuery({
    queryKey: ['sales'],
    queryFn: () => api.sales.getMany(),
  });

  const sales = useMemo(() => salesRaw ?? [], [salesRaw]);

  const categoryOptions = useMemo(() => {
    const set = new Set<string>();
    sales.forEach((s) => {
      const main = s.item?.subCategory?.mainCategory?.name;
      if (main) set.add(main);
    });
    return ['', ...Array.from(set).sort()];
  }, [sales]);

  const filteredSales = useMemo(() => {
    return sales.filter((s) => {
      if (categoryFilter && s.item?.subCategory?.mainCategory?.name !== categoryFilter) return false;
      const d = (s.saleDate || '').slice(0, 10);
      if (dateFrom && d < dateFrom) return false;
      if (dateTo && d > dateTo) return false;
      return true;
    });
  }, [sales, categoryFilter, dateFrom, dateTo]);

  const pieData = useMemo(() => {
    const byCategory: Record<string, number> = {};
    filteredSales.forEach((s) => {
      const main = s.item?.subCategory?.mainCategory?.name ?? '—';
      byCategory[main] = (byCategory[main] ?? 0) + Number(s.salePrice ?? 0);
    });
    return Object.entries(byCategory).map(([name, value]) => ({ name, value }));
  }, [filteredSales]);

  const totals = useMemo(() => {
    let revenue = 0;
    let cost = 0;
    filteredSales.forEach((s) => {
      revenue += Number(s.salePrice ?? 0);
      cost += Number(s.item?.acquisitionCost ?? 0);
    });
    return { revenue, cost, profit: revenue - cost };
  }, [filteredSales]);

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.sales.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['items'] });
      setDeleteId(null);
    },
  });

  if (isLoading) return <p className="text-roomi-brownLight">{t('dashboard.loading')}</p>;
  if (error) return <div className="card p-4 text-red-600 bg-red-50 border-red-200">{(error as Error).message}</div>;

  return (
    <div className="space-y-8 w-full max-w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-roomi-brown">{t('nav.sales')}</h1>
        <Link to="/sales/new" className="btn-primary shrink-0">
          {t('actions.add')} {t('nav.sales')}
        </Link>
      </div>

      {/* Filters */}
      <div className="rounded-roomiLg border-2 border-roomi-peach bg-white px-4 py-3 shadow-roomi">
        <p className="text-sm font-semibold text-roomi-brown mb-3">{t('salesAnalytics.filters')}</p>
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <label className="label text-xs">{t('salesAnalytics.category')}</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="input-field min-w-[140px]"
            >
              <option value="">{t('salesAnalytics.allCategories')}</option>
              {categoryOptions.filter(Boolean).map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label text-xs">{t('salesAnalytics.dateFrom')}</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="input-field min-w-[140px]"
            />
          </div>
          <div>
            <label className="label text-xs">{t('salesAnalytics.dateTo')}</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="input-field min-w-[140px]"
            />
          </div>
        </div>
      </div>

      {filteredSales.length === 0 ? (
        <div className="card p-8 text-center text-roomi-brownLight">
          {sales.length === 0 ? t('empty.noSales') : t('salesAnalytics.noDataForPeriod')}
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="card p-4 border-l-4 border-roomi-orange">
              <p className="text-sm font-semibold text-roomi-brownLight">{t('salesAnalytics.totalRevenue')}</p>
              <p className="text-xl font-bold text-roomi-brown">{totals.revenue.toLocaleString()}</p>
            </div>
            <div className="card p-4 border-l-4 border-roomi-brownLight">
              <p className="text-sm font-semibold text-roomi-brownLight">{t('salesAnalytics.totalCost')}</p>
              <p className="text-xl font-bold text-roomi-brown">{totals.cost.toLocaleString()}</p>
            </div>
            <div className="card p-4 border-l-4 border-roomi-mint">
              <p className="text-sm font-semibold text-roomi-brownLight">{t('salesAnalytics.totalProfit')}</p>
              <p className={`text-xl font-bold ${totals.profit >= 0 ? 'text-emerald-700' : 'text-red-600'}`}>
                {totals.profit.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Pie chart + Profit list */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-4">
              <h2 className="text-lg font-semibold text-roomi-brown mb-4">{t('salesAnalytics.soldByCategory')}</h2>
              {pieData.length === 0 ? (
                <p className="text-roomi-brownLight text-sm py-8 text-center">{t('salesAnalytics.noDataForPeriod')}</p>
              ) : (
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      >
                        {pieData.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number | undefined) => (value ?? 0).toLocaleString()} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
            <div className="card p-4">
              <h2 className="text-lg font-semibold text-roomi-brown mb-4">{t('salesAnalytics.profitList')}</h2>
              <div className="space-y-2 max-h-[320px] overflow-y-auto">
                {filteredSales.map((s) => {
                  const buyCost = Number(s.item?.acquisitionCost ?? 0);
                  const salePrice = Number(s.salePrice ?? 0);
                  const profit = salePrice - buyCost;
                  return (
                    <div
                      key={s.id}
                      className="flex items-center justify-between py-2 px-3 rounded-roomi bg-roomi-cream/50 border border-roomi-peach/40"
                    >
                      <div className="min-w-0">
                        <p className="font-medium text-roomi-brown truncate">{s.item?.title ?? s.itemId}</p>
                        <p className="text-xs text-roomi-brownLight">
                          {(s.saleDate || '').slice(0, 10)} · {s.item?.subCategory?.mainCategory?.name ?? '—'} → {s.item?.displaySubCategory ?? s.item?.subCategory?.name ?? '—'}
                        </p>
                      </div>
                      <div className="text-right shrink-0 ml-2">
                        <p className="text-sm text-roomi-brown">
                          {salePrice.toLocaleString()} − {buyCost.toLocaleString()} = <span className={profit >= 0 ? 'font-semibold text-emerald-700' : 'font-semibold text-red-600'}>{profit.toLocaleString()}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* Sales table */}
      <div className="card overflow-hidden max-w-full min-w-0">
        <h2 className="text-lg font-semibold text-roomi-brown px-4 pt-4 pb-2">{t('salesAnalytics.allSales')}</h2>
        <table className="min-w-full divide-y divide-roomi-peach/60 table-fixed sm:table-auto">
          <thead className="bg-roomi-cream/80">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-semibold text-roomi-brown uppercase">{t('table.item')}</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-roomi-brown uppercase">{t('table.customer')}</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-roomi-brown uppercase">{t('table.saleDate')}</th>
              <th className="px-4 py-2 text-left text-xs font-semibold text-roomi-brown uppercase">{t('table.price')}</th>
              <th className="px-4 py-2 text-right text-xs font-semibold text-roomi-brown uppercase">{t('actions.edit')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-roomi-peach/60 bg-white">
            {(sales ?? []).map((s) => (
              <tr key={s.id} className="hover:bg-roomi-cream/40">
                <td className="px-4 py-2 font-medium text-roomi-brown min-w-0 truncate" title={s.item?.title ?? s.itemId}>{s.item?.title ?? s.itemId}</td>
                <td className="px-4 py-2 text-sm text-roomi-brownLight min-w-0 truncate" title={s.customer?.name ?? s.customerId}>{s.customer?.name ?? s.customerId}</td>
                <td className="px-4 py-2 text-sm text-roomi-brownLight shrink-0">{(s.saleDate || '').slice(0, 10)}</td>
                <td className="px-4 py-2 text-sm text-roomi-brown">{s.salePrice != null ? Number(s.salePrice).toLocaleString() : t('common.na')}</td>
                <td className="px-4 py-2 text-right text-sm">
                  {deleteId === s.id ? (
                    <span className="flex items-center justify-end gap-2">
                      <span className="text-roomi-brownLight">{t('form.confirmDelete')}</span>
                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate(s.id)}
                        disabled={deleteMutation.isPending}
                        className="text-red-600 hover:underline font-medium"
                      >
                        {t('common.yes')}
                      </button>
                      <button type="button" onClick={() => setDeleteId(null)} className="text-roomi-brownLight hover:underline">
                        {t('common.cancel')}
                      </button>
                    </span>
                  ) : (
                    <>
                      <Link to={`/sales/${s.id}/edit`} className="text-roomi-orange hover:underline font-medium mr-3">
                        {t('actions.edit')}
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteId(s.id)}
                        className="text-red-600 hover:underline"
                      >
                        {t('actions.delete')}
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(sales?.length ?? 0) === 0 && (
          <p className="px-4 py-8 text-center text-roomi-brownLight">{t('empty.noSales')}</p>
        )}
      </div>
    </div>
  );
}
