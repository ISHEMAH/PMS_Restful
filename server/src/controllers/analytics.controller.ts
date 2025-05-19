import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    const totalBookings = await prisma.booking.count();
    const totalRevenue = await prisma.booking.aggregate({
      _sum: { amount: true },
    });
    const occupiedSlots = await prisma.slot.count({ where: { status: 'OCCUPIED' } });
    const totalSlots = await prisma.slot.count();

    const analytics = {
      totalBookings,
      totalRevenue: totalRevenue._sum.amount || 0,
      occupancyRate: totalSlots ? (occupiedSlots / totalSlots) * 100 : 0,
    };

    res.status(200).json({ analytics });
  } catch (err) {
    res.status(500).json({ error: 'Analytics fetch failed', details: err });
  }
};