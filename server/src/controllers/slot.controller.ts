// controllers/slot.controller.ts
import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export const createSlots = async (req: Request, res: Response) => {
  const { total } = req.body;

  try {
    const existing = await prisma.slot.findMany();
    if (existing.length > 0) {
      res.status(400).json({ message: 'Slots already created' });
      return;
    }

    const slots = Array.from({ length: total }).map((_, i) => ({
      number: i + 1,
      status: 'AVAILABLE' as const,
      type: 'CAR' as const
    }));

    const created = await prisma.slot.createMany({ data: slots });
    res.status(201).json({ message: `${created.count} slots created.` });
  } catch (err) {
    res.status(500).json({ message: 'Error creating slots', error: err });
  }
};

export const getSlots = async (_: Request, res: Response) => {
  try {
    const slots = await prisma.slot.findMany();
    res.json(slots);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching slots', error: err });
  }
};

export const updateSlotStatus = async (req: Request, res: Response) => {
  const { status } = req.body;
  const { id } = req.params;

  try {
    const slot = await prisma.slot.update({
      where: { id: parseInt(id) },
      data: { status },
    });
    res.json(slot);
  } catch (err) {
    res.status(400).json({ message: 'Error updating slot status', error: err });
  }
};
