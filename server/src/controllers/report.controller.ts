import { Request, Response } from 'express';
import { prisma } from '../types/prisma';
import { BookingStatus, PaymentStatus } from '@prisma/client';

export const generateParkingReport = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate, parkingId } = req.query;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Verify user is admin of the parking
        const parking = await prisma.parking.findFirst({
            where: {
                id: parkingId as string,
                adminId: userId
            }
        });

        if (!parking) {
            return res.status(404).json({ error: 'Parking not found or not authorized' });
        }

        const bookings = await prisma.booking.findMany({
            where: {
                slot: {
                    parkingId: parkingId as string
                },
                entryTime: {
                    gte: startDate ? new Date(startDate as string) : undefined,
                    lte: endDate ? new Date(endDate as string) : undefined
                }
            },
            include: {
                vehicle: true,
                slot: true,
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            }
        });

        const report = {
            parkingDetails: {
                name: parking.name,
                location: parking.location,
                totalSpaces: parking.totalSpaces,
                availableSpaces: parking.availableSpaces
            },
            bookingStats: {
                total: bookings.length,
                byStatus: {
                    pending: bookings.filter(b => b.status === BookingStatus.PENDING).length,
                    approved: bookings.filter(b => b.status === BookingStatus.APPROVED).length,
                    declined: bookings.filter(b => b.status === BookingStatus.DECLINED).length,
                    checkedOut: bookings.filter(b => b.status === BookingStatus.CHECKED_OUT).length,
                    cancelled: bookings.filter(b => b.status === BookingStatus.CANCELLED).length
                },
                byPaymentStatus: {
                    pending: bookings.filter(b => b.paymentStatus === PaymentStatus.PENDING).length,
                    paid: bookings.filter(b => b.paymentStatus === PaymentStatus.PAID).length,
                    unpaid: bookings.filter(b => b.paymentStatus === PaymentStatus.UNPAID).length
                }
            },
            revenueStats: {
                total: bookings.reduce((sum, booking) => sum + (booking.amount || 0), 0),
                byPaymentMethod: {
                    cash: bookings.filter(b => b.paymentMethod === 'CASH').reduce((sum, b) => sum + (b.amount || 0), 0),
                    card: bookings.filter(b => b.paymentMethod === 'CARD').reduce((sum, b) => sum + (b.amount || 0), 0),
                    online: bookings.filter(b => b.paymentMethod === 'ONLINE').reduce((sum, b) => sum + (b.amount || 0), 0)
                }
            },
            bookings: bookings.map(booking => ({
                id: booking.id,
                status: booking.status,
                entryTime: booking.entryTime,
                checkoutTime: booking.checkoutTime,
                amount: booking.amount,
                paymentStatus: booking.paymentStatus,
                paymentMethod: booking.paymentMethod,
                vehicle: {
                    plateNumber: booking.vehicle.plateNumber,
                    type: booking.vehicle.type
                },
                user: booking.user,
                slot: {
                    number: booking.slot?.number
                }
            }))
        };

        res.json(report);
    } catch (error) {
        console.error('Error generating parking report:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
};

export const generateFinancialReport = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Get all parkings managed by the admin
        const parkings = await prisma.parking.findMany({
            where: {
                adminId: userId
            }
        });

        const parkingIds = parkings.map(p => p.id);

        const bookings = await prisma.booking.findMany({
            where: {
                slot: {
                    parkingId: {
                        in: parkingIds
                    }
                },
                entryTime: {
                    gte: startDate ? new Date(startDate as string) : undefined,
                    lte: endDate ? new Date(endDate as string) : undefined
                }
            },
            include: {
                slot: {
                    include: {
                        parking: true
                    }
                }
            }
        });

        const report = {
            totalRevenue: bookings.reduce((sum, booking) => sum + (booking.amount || 0), 0),
            byParking: parkings.map(parking => {
                const parkingBookings = bookings.filter(b => b.slot?.parkingId === parking.id);
                return {
                    parkingName: parking.name,
                    totalBookings: parkingBookings.length,
                    revenue: parkingBookings.reduce((sum, booking) => sum + (booking.amount || 0), 0),
                    byPaymentMethod: {
                        cash: parkingBookings.filter(b => b.paymentMethod === 'CASH').reduce((sum, b) => sum + (b.amount || 0), 0),
                        card: parkingBookings.filter(b => b.paymentMethod === 'CARD').reduce((sum, b) => sum + (b.amount || 0), 0),
                        online: parkingBookings.filter(b => b.paymentMethod === 'ONLINE').reduce((sum, b) => sum + (b.amount || 0), 0)
                    }
                };
            })
        };

        res.json(report);
    } catch (error) {
        console.error('Error generating financial report:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
};

export const generateOccupancyReport = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'User not authenticated' });
        }

        // Get all parkings managed by the admin
        const parkings = await prisma.parking.findMany({
            where: {
                adminId: userId
            },
            include: {
                slots: true
            }
        });

        const report = {
            byParking: parkings.map(parking => {
                const totalSlots = parking.slots.length;
                const occupiedSlots = parking.slots.filter(slot => slot.status === 'OCCUPIED').length;
                const maintenanceSlots = parking.slots.filter(slot => slot.status === 'MAINTENANCE').length;
                const availableSlots = parking.slots.filter(slot => slot.status === 'AVAILABLE').length;

                return {
                    parkingName: parking.name,
                    totalSlots,
                    occupiedSlots,
                    maintenanceSlots,
                    availableSlots,
                    occupancyRate: (occupiedSlots / totalSlots) * 100,
                    byVehicleType: {
                        car: parking.slots.filter(slot => slot.type === 'CAR').length,
                        motorcycle: parking.slots.filter(slot => slot.type === 'MOTORCYCLE').length,
                        bike: parking.slots.filter(slot => slot.type === 'BIKE').length
                    }
                };
            })
        };

        res.json(report);
    } catch (error) {
        console.error('Error generating occupancy report:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
};

export const getAllReports = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate, type } = req.query;
        // Implementation for getting all reports
        res.json({ message: 'Get all reports' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get reports' });
    }
};

export const exportReports = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate, format } = req.query;
        // Implementation for exporting reports
        res.json({ message: 'Export reports' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to export reports' });
    }
};

export const getRevenueReport = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate, groupBy } = req.query;
        // Implementation for revenue report
        res.json({ message: 'Get revenue report' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get revenue report' });
    }
};

export const getOccupancyReport = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate, parkingId } = req.query;
        // Implementation for occupancy report
        res.json({ message: 'Get occupancy report' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get occupancy report' });
    }
};

export const getVehicleTypeReport = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate } = req.query;
        // Implementation for vehicle type report
        res.json({ message: 'Get vehicle type report' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get vehicle type report' });
    }
};

export const getPeakHoursReport = async (req: Request, res: Response) => {
    try {
        const { startDate, endDate, parkingId } = req.query;
        // Implementation for peak hours report
        res.json({ message: 'Get peak hours report' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to get peak hours report' });
    }
}; 