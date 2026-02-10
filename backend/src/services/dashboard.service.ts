import { prisma } from '../db.js';

const today = () => new Date(new Date().toISOString().slice(0, 10));
const startOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), 1);
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth() + 1, 0);

export const dashboardService = {
  async getOverview() {
    const [counts, activeRentals, recentItems, reservedItems] = await Promise.all([
      prisma.item.groupBy({ by: ['status'], _count: { id: true } }),
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
    ]);

    const countMap: Record<string, number> = {};
    for (const s of ['in_stock', 'listed', 'rented', 'sold', 'reserved', 'disposed']) {
      countMap[s] = counts.find((c) => c.status === s)?._count.id ?? 0;
    }

    const now = today();
    const inSevenDays = new Date(now);
    inSevenDays.setDate(inSevenDays.getDate() + 7);
    const overdueRentals = activeRentals.filter((r) => new Date(r.expectedEndDate) < now);
    const upcomingRentals = activeRentals.filter((r) => {
      const exp = new Date(r.expectedEndDate);
      return exp >= now && exp <= inSevenDays;
    });

    return {
      counts: countMap,
      activeRentalsCount: activeRentals.length,
      overdueCount: overdueRentals.length,
      upcomingReturnsCount: upcomingRentals.length,
      recentItems,
      reservedItems,
      overdueRentals: overdueRentals.map((r) => ({ ...r, isOverdue: true })),
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
