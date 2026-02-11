import { prisma } from '../db.js';

const today = () => new Date(new Date().toISOString().slice(0, 10));
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

/** Date 1 month ago (for in-stock "overdue" = in stock > 1 month) */
const oneMonthAgo = () => {
  const d = new Date();
  d.setMonth(d.getMonth() - 1);
  return d;
};

/** Date 1 month from now (for upcoming returns = ending within 1 month) */
const oneMonthFromNow = () => {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  return d;
};

export const dashboardService = {
  async getOverview() {
    const now = today();
    const cutoffStock = oneMonthAgo();
    const cutoffUpcoming = oneMonthFromNow();

    const [counts, listedCount, activeRentals, recentItems, reservedItems, overdueInStockCount] = await Promise.all([
      prisma.item.groupBy({ by: ['status'], _count: { id: true } }),
      prisma.item.count({ where: { isListed: true } }),
      prisma.rental.findMany({
        where: { status: 'active' },
        include: { item: true, customer: true },
      }),
      prisma.item.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { subCategory: { include: { mainCategory: true } } },
      }),
      prisma.item.findMany({
        take: 10,
        where: { status: 'reserved' },
        orderBy: { updatedAt: 'desc' },
        include: { subCategory: { include: { mainCategory: true } } },
      }),
      // Overdue = in-stock items that have been in stock for more than 1 month (by acquisitionDate or createdAt)
      prisma.item.count({
        where: {
          status: 'in_stock',
          OR: [
            { acquisitionDate: { lt: cutoffStock } },
            { acquisitionDate: null, createdAt: { lt: cutoffStock } },
          ],
        },
      }),
    ]);

    const countMap: Record<string, number> = {};
    for (const s of ['in_stock', 'rented', 'sold', 'reserved', 'disposed']) {
      countMap[s] = counts.find((c) => c.status === s)?._count.id ?? 0;
    }
    countMap['listed'] = listedCount;

    // Upcoming returns = active rentals ending within 1 month (expectedEndDate between today and today+1 month)
    const upcomingRentals = activeRentals.filter((r) => {
      const exp = new Date(r.expectedEndDate);
      return exp >= now && exp <= cutoffUpcoming;
    });

    return {
      counts: countMap,
      activeRentalsCount: activeRentals.length,
      overdueCount: overdueInStockCount,
      upcomingReturnsCount: upcomingRentals.length,
      recentItems,
      reservedItems,
      overdueRentals: [], // kept for API shape; overdue is now in-stock > 1 month, not rental past due
    };
  },

  async getFinance() {
    const now = new Date();
    const start = startOfMonth(now);
    const end = endOfMonth(now);

    const [sales, rentals, acquisitionCost] = await Promise.all([
      prisma.sale.aggregate({
        where: { saleDate: { gte: start, lte: end } },
        _sum: { salePrice: true },
      }),
      prisma.rental.findMany({
        where: {
          OR: [
            { startDate: { lte: end }, expectedEndDate: { gte: start }, status: 'active' },
            { status: 'ended', actualEndDate: { gte: start, lte: end } },
          ],
        },
      }),
      prisma.item.aggregate({
        where: { acquisitionDate: { gte: start, lte: end } },
        _sum: { acquisitionCost: true },
      }),
    ]);

    const salesIncome = Number(sales._sum.salePrice ?? 0);
    const rentalIncome = rentals.reduce((sum, r) => sum + Number(r.rentPriceMonthly ?? 0), 0);
    const revenue = salesIncome + rentalIncome;
    const acquisition = Number(acquisitionCost._sum.acquisitionCost ?? 0);
    const profitEstimate = revenue - acquisition;

    return {
      revenueThisMonth: revenue,
      rentalIncome,
      salesIncome,
      acquisitionCostSum: acquisition,
      profitEstimate,
    };
  },

  async getActivity(limit = 50) {
    return prisma.activityLog.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, email: true } } },
    });
  },
};
