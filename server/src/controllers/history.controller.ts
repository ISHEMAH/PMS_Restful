import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const getParkingHistory = async (req: Request, res: Response) => {
  try {
    const history = await prisma.booking.findMany({
      where: { status: 'CHECKED_OUT' },
      include: { user: true, vehicle: true, slot: true },
      orderBy: { checkoutTime: 'desc' },
    });

    res.status(200).json({ history });
  } catch (err) {
    res.status(500).json({ error: 'Could not fetch history', details: err });
  }
};
