import { prisma } from '../lib/prisma';
import { DateTime } from 'luxon';
import crypto from 'crypto';

export interface VehicleTypeStats {
  id: string;
  analyticsId: string;
  type: string;
  count: number;
  percentage: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Analytics {
  id: string;
  date: Date;
  totalBookings: number;
  totalRevenue: number;
  occupancyRate: number;
  averageStay: number;
  peakHours: string;
  vehicleTypeStats: VehicleTypeStats[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Booking {
  id: string;
  userId: string;
  vehicleId: string;
  slotId: number | null;
  entryTime: Date | null;
  checkoutTime: Date | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  vehicle: {
    id: string;
    plateNumber: string;
    type: string;
    ownerId: string;
    slotId: number | null;
    checkIn: Date | null;
    checkOut: Date | null;
    paid: boolean;
  };
}

export class AnalyticsService {
  private async calculateVehicleTypeStats(bookings: Booking[]): Promise<VehicleTypeStats[]> {
    try {
      const stats: VehicleTypeStats[] = [];
      const totalBookings = bookings.length;
      const analyticsId = crypto.randomUUID();

      for (const type of ['CAR', 'MOTORCYCLE', 'BIKE']) {
        const count = bookings.filter(b => b.vehicle?.type === type).length;
        const percentage = totalBookings > 0 ? (count / totalBookings) * 100 : 0;
        
        stats.push({
          id: crypto.randomUUID(),
          analyticsId,
          type: type as string,
          count,
          percentage,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }

      return stats;
    } catch (error) {
      console.error('Error calculating vehicle type stats:', error);
      throw error;
    }
  }

  private calculateAverageStay(bookings: Booking[]): number {
    const durations = bookings
      .filter((booking: Booking) => booking.entryTime && booking.checkoutTime)
      .map((booking: Booking) => {
        const entry = DateTime.fromJSDate(booking.entryTime!);
        const checkout = DateTime.fromJSDate(booking.checkoutTime!);
        return checkout.diff(entry, 'minutes').minutes;
      });

    return durations.length > 0 ? Math.round(durations.reduce((a: number, b: number) => a + b) / durations.length) : 0;
  }

  private async calculatePeakHours(bookings: Booking[]): Promise<string> {
    try {
      const hourCounts = new Array(24).fill(0);

      bookings.forEach((booking: Booking) => {
        if (booking.entryTime) {
          const entryTime = DateTime.fromJSDate(booking.entryTime);
          const hour = entryTime.hour;
          hourCounts[hour]++;
        }
      });

      const max = Math.max(...hourCounts);
      const peakHour = hourCounts.findIndex(count => count === max);
      return `${peakHour}:00 - ${peakHour + 1}:00`;
    } catch (error) {
      console.error('Error calculating peak hours:', error);
      throw error;
    }
  }

  private async calculateMultiplePeakHours(bookings: Booking[]): Promise<string[]> {
    try {
      const hourCounts = new Array(24).fill(0);

      bookings.forEach((booking: Booking) => {
        if (booking.entryTime) {
          const entryTime = DateTime.fromJSDate(booking.entryTime);
          const hour = entryTime.hour;
          hourCounts[hour]++;
        }
      });

      const max = Math.max(...hourCounts);
      const peakHours = hourCounts
        .map((count, index) => count === max ? `${index}:00 - ${index + 1}:00` : null)
        .filter((hour): hour is string => hour !== null);
      return peakHours;
    } catch (error) {
      console.error('Error calculating peak hours:', error);
      throw error;
    }
  }

  async generateDailyAnalytics(): Promise<Analytics> {
    try {
      const todayDate = new Date();
      todayDate.setHours(0, 0, 0, 0);

      const [bookings, revenue, slots] = await Promise.all([
        prisma.booking.findMany({
          where: {
            entryTime: {
              gte: todayDate,
              lt: new Date(todayDate.getTime() + 24 * 60 * 60 * 1000)
            },
            status: 'CHECKED_OUT'
          },
          include: {
            vehicle: true
          }
        }),
        prisma.booking.aggregate({
          where: {
            entryTime: {
              gte: todayDate,
              lt: new Date(todayDate.getTime() + 24 * 60 * 60 * 1000)
            },
            status: 'CHECKED_OUT'
          },
          _sum: {
            amount: true
          }
        }),
        prisma.slot.findMany()
      ]);

      const totalBookings = bookings.length;
      const totalRevenue = revenue._sum.amount || 0;
      const totalSlots = slots.length;
      const occupiedSlots = slots.filter((slot: { status: string }) => slot.status === 'OCCUPIED').length;
      const occupancyRate = totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0;
      const averageStay = this.calculateAverageStay(bookings);
      const peakHours = await this.calculatePeakHours(bookings);
      const vehicleTypeStats = await this.calculateVehicleTypeStats(bookings);

      const analytics = await prisma.analytics.create({
        data: {
          date: todayDate,
          totalBookings,
          totalRevenue,
          occupancyRate,
          averageStay,
          peakHours,
          vehicleTypeStats: {
            create: vehicleTypeStats.map(stat => ({
              id: stat.id,
              analyticsId: stat.analyticsId,
              type: stat.type as string,
              count: stat.count,
              percentage: stat.percentage,
              createdAt: stat.createdAt,
              updatedAt: stat.updatedAt
            }))
          }
        },
        include: {
          vehicleTypeStats: true
        }
      });

      return analytics;
    } catch (error) {
      console.error('Error generating daily analytics:', error);
      throw error;
    }
  }

  async getAnalyticsForPeriod(startDate: Date, endDate: Date): Promise<Analytics[]> {
    try {
      return prisma.analytics.findMany({
        where: {
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        include: {
          vehicleTypeStats: true
        },
        orderBy: {
          date: 'asc'
        }
      });
    } catch (error) {
      console.error('Error fetching analytics for period:', error);
      throw error;
    }
  }
}
