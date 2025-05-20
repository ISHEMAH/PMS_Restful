import { Request, Response } from 'express';
import { prisma } from '../types/prisma';
import { calculateDuration } from '../utils/parking.utils';
import { BookingStatus } from '@prisma/client';

export const getAnalytics = async (req: Request, res: Response) => {
  try {
    // Validate user authentication
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Validate and parse query parameters
    const { startDate, endDate } = req.query;
    let parsedStartDate: Date | undefined;
    let parsedEndDate: Date | undefined;

    if (startDate) {
      parsedStartDate = new Date(startDate as string);
      if (isNaN(parsedStartDate.getTime())) {
        return res.status(400).json({ error: 'Invalid startDate format' });
      }
    }

    if (endDate) {
      parsedEndDate = new Date(endDate as string);
      if (isNaN(parsedEndDate.getTime())) {
        return res.status(400).json({ error: 'Invalid endDate format' });
      }
    }

    const userId = req.user.id;

    // Get all parkings managed by this admin
    const parkings = await prisma.parking.findMany({
      where: { adminId: userId }
    });

    if (!parkings.length) {
      return res.json({
        totalBookings: 0,
        totalRevenue: 0,
        occupancyRate: 0,
        averageStayDuration: 0,
        peakHours: [],
        vehicleTypeStats: []
      });
    }

    const parkingIds = parkings.map(p => p.id);

    // Get all bookings for these parkings
    const bookings = await prisma.booking.findMany({
      where: {
        slot: {
          parkingId: { in: parkingIds }
        },
        ...(parsedStartDate && parsedEndDate ? {
          createdAt: {
            gte: parsedStartDate,
            lte: parsedEndDate
          }
        } : {})
      },
      include: {
        vehicle: true,
        slot: { include: { parking: true } }
      }
    });

    // Calculate statistics
    const totalBookings = bookings.length;
    const totalRevenue = bookings.reduce((sum, booking) => {
      if (booking.status === BookingStatus.CHECKED_OUT && booking.amount) {
        return sum + booking.amount;
      }
      return sum;
    }, 0);

    // Calculate occupancy rate
    const totalSpaces = parkings.reduce((sum, parking) => sum + parking.totalSpaces, 0);
    const occupiedSpaces = bookings.filter(b => b.status === BookingStatus.APPROVED).length;
    const occupancyRate = totalSpaces > 0 ? (occupiedSpaces / totalSpaces) * 100 : 0;

    // Calculate average stay duration
    const completedBookings = bookings.filter(b =>
      b.status === BookingStatus.CHECKED_OUT &&
      b.entryTime &&
      b.checkoutTime
    );

    const averageStayDuration = completedBookings.length > 0
      ? completedBookings.reduce((sum, booking) => {
        try {
          const duration = calculateDuration(
            booking.entryTime as Date,
            booking.checkoutTime as Date
          );
          return sum + duration;
        } catch (error) {
          console.error('Error calculating duration:', error);
          return sum;
        }
      }, 0) / completedBookings.length
      : 0;

    // Calculate vehicle type distribution
    const vehicleTypes = ['CAR', 'MOTORCYCLE', 'BIKE'] as const;
    const vehicleTypeStats = vehicleTypes.map(type => {
      const count = bookings.filter(b => b.vehicle.type === type).length;
      return {
        type,
        count,
        percentage: totalBookings > 0 ? (count / totalBookings) * 100 : 0
      };
    });

    // Calculate peak hours
    const hourlyBookings = new Array(24).fill(0);
    bookings.forEach(booking => {
      if (booking.entryTime) {
        try {
          const hour = new Date(booking.entryTime).getHours();
          hourlyBookings[hour]++;
        } catch (error) {
          console.error('Error processing entry time:', error);
        }
      }
    });

    const peakHours = hourlyBookings
      .map((count, hour) => ({ hour, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)
      .map(({ hour }) => `${hour}:00`);

    res.json({
      totalBookings,
      totalRevenue,
      occupancyRate,
      averageStayDuration,
      peakHours,
      vehicleTypeStats
    });
  } catch (error) {
    console.error('Error in getAnalytics:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
};