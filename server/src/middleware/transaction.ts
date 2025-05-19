import { Request, Response, NextFunction } from 'express';
import { prisma } from '../types/prisma';

export const transaction = async (req: Request & { prisma?: typeof prisma }, res: Response, next: NextFunction) => {
  try {
    const transaction = await prisma.$transaction(async (tx: typeof prisma) => {
      // Store transaction in request
      req.prisma = tx;
      next();
    });

    // If we reach here, transaction was successful
    await transaction;
  } catch (error: unknown) {
    console.error('Transaction failed:', error);
    res.status(500).json({
      error: 'Transaction failed',
      message: error instanceof Error ? error.message : 'Unknown error occurred',
    });
  }
};
