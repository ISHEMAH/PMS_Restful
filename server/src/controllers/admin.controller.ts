import { Request, Response } from 'express';
import { prisma } from '../types/prisma';
import { calculateDuration, calculateAmount } from '../utils/parking.utils';

// Get all bookings
export const getAllBookings = async (req: Request, res: Response) => {
    try {
        const bookings = await prisma.booking.findMany({
            include: {
                vehicle: true,
                parking: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        res.json(bookings);
    } catch (error) {
        console.error('Error fetching bookings:', error);
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
};

// Approve a booking
export const approveBooking = async (req: Request, res: Response) => {
    const { bookingId } = req.params;

    try {
        const booking = await prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'APPROVED' },
            include: {
                vehicle: true,
                parking: true
            }
        });

        res.json(booking);
    } catch (error) {
        console.error('Error approving booking:', error);
        res.status(500).json({ error: 'Failed to approve booking' });
    }
};

// Decline a booking
export const declineBooking = async (req: Request, res: Response) => {
    const { bookingId } = req.params;

    try {
        const booking = await prisma.booking.update({
            where: { id: bookingId },
            data: { status: 'DECLINED' },
            include: {
                vehicle: true,
                parking: true
            }
        });

        res.json(booking);
    } catch (error) {
        console.error('Error declining booking:', error);
        res.status(500).json({ error: 'Failed to decline booking' });
    }
};

// Get parking history
export const getParkingHistory = async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;
    const adminId = req.user.id;

    try {
        // Get all parkings managed by this admin
        const parkings = await prisma.parking.findMany({
            where: { adminId }
        });

        const parkingIds = parkings.map(p => p.id);

        // Get all bookings for these parkings
        const bookings = await prisma.booking.findMany({
            where: {
                parkingId: { in: parkingIds },
                ...(startDate && endDate ? {
                    createdAt: {
                        gte: new Date(startDate as string),
                        lte: new Date(endDate as string)
                    }
                } : {})
            },
            include: {
                vehicle: true,
                parking: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // Calculate statistics
        const totalBookings = bookings.length;
        const totalRevenue = bookings.reduce((sum, booking) => {
            if (booking.status === 'COMPLETED') {
                const duration = calculateDuration(booking.startTime, booking.endTime);
                const amount = calculateAmount(duration, booking.parking.chargingFeePerHour);
                return sum + amount;
            }
            return sum;
        }, 0);

        const completedBookings = bookings.filter(b => b.status === 'COMPLETED');
        const averageStayDuration = completedBookings.length > 0
            ? completedBookings.reduce((sum, booking) => {
                const duration = calculateDuration(booking.startTime, booking.endTime);
                return sum + duration;
            }, 0) / completedBookings.length
            : 0;

        res.json({
            bookings,
            totalBookings,
            totalRevenue,
            averageStayDuration
        });
    } catch (error) {
        console.error('Error fetching parking history:', error);
        res.status(500).json({ error: 'Failed to fetch parking history' });
    }
};

// Get analytics data
export const getAnalytics = async (req: Request, res: Response) => {
    const adminId = req.user.id;

    try {
        // Get all parkings managed by this admin
        const parkings = await prisma.parking.findMany({
            where: { adminId },
            include: {
                slots: true
            }
        });

        const parkingIds = parkings.map(p => p.id);

        // Get all bookings for these parkings
        const bookings = await prisma.booking.findMany({
            where: {
                parkingId: { in: parkingIds }
            },
            include: {
                vehicle: true,
                parking: true
            }
        });

        // Calculate analytics
        const totalSlots = parkings.reduce((sum, parking) => sum + parking.slots.length, 0);
        const occupiedSlots = parkings.reduce((sum, parking) =>
            sum + parking.slots.filter(slot => slot.status === 'OCCUPIED').length, 0
        );
        const occupancyRate = totalSlots > 0 ? (occupiedSlots / totalSlots) * 100 : 0;

        // Revenue by vehicle type
        const revenueByType = bookings.reduce((acc, booking) => {
            if (booking.status === 'COMPLETED') {
                const duration = calculateDuration(booking.startTime, booking.endTime);
                const amount = calculateAmount(duration, booking.parking.chargingFeePerHour);
                const type = booking.vehicle.type;
                acc[type] = (acc[type] || 0) + amount;
            }
            return acc;
        }, {} as Record<string, number>);

        // Bookings by status
        const bookingsByStatus = bookings.reduce((acc, booking) => {
            acc[booking.status] = (acc[booking.status] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        // Peak hours analysis (last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const recentBookings = bookings.filter(b => b.createdAt >= sevenDaysAgo);
        const peakHours = recentBookings.reduce((acc, booking) => {
            const hour = new Date(booking.createdAt).getHours();
            acc[hour] = (acc[hour] || 0) + 1;
            return acc;
        }, {} as Record<number, number>);

        res.json({
            totalSlots,
            occupiedSlots,
            occupancyRate,
            revenueByType,
            bookingsByStatus,
            peakHours
        });
    } catch (error) {
        console.error('Error fetching analytics:', error);
        res.status(500).json({ error: 'Failed to fetch analytics data' });
    }
}; 