import { Request, Response } from "express";
import { prisma } from "../types/prisma";
import nodemailer from "nodemailer";
import { AuthenticatedRequest } from "../middleware/auth";
import { calculateDuration, calculateAmount } from '../utils/parking.utils';

export const bookSlot = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  const userId = req.user.id;
  const { vehicleId } = req.body;

  try {
    const booking = await prisma.booking.create({
      data: {
        userId,
        vehicleId,
      },
    });

    res.status(201).json({ message: "Booking request submitted", booking });
  } catch (err) {
    res.status(500).json({ error: "Booking failed", details: err });
  }
};

export const getAllBookings = async (req: Request, res: Response) => {
  try {
    const bookings = await prisma.booking.findMany({
      include: {
        user: true,
        vehicle: true,
        slot: true,
      },
    });

    res.status(200).json({ bookings });
  } catch (err) {
    res.status(500).json({ error: "Could not fetch bookings", details: err });
  }
};

export const approveBooking = async (req: Request, res: Response) => {
  const { bookingId } = req.params;

  try {
    // Find an available slot
    const slot = await prisma.slot.findFirst({
      where: { status: 'AVAILABLE' },
    });

    if (!slot) {
      await prisma.booking.update({
        where: { id: bookingId },
        data: { status: "DECLINED" },
      });
      return res.status(400).json({ message: "No available slots. Booking declined." });
    }

    // Update booking
    const approved = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: "APPROVED",
        slotId: slot.id,
        entryTime: new Date(),
      },
      include: {
        user: true,
        vehicle: true,
        slot: true,
      },
    });

    // Update slot status
    await prisma.slot.update({
      where: { id: slot.id },
      data: { status: 'OCCUPIED' },
    });

    // (Optional) Send confirmation email
    // sendEmail(approved.user.email, 'Your booking has been approved!');

    res.status(200).json({ message: "Booking approved", approved });
  } catch (err) {
    res.status(500).json({ error: "Failed to approve", details: err });
  }
};

export const declineBooking = async (req: Request, res: Response) => {
  const { bookingId } = req.params;

  try {
    const declined = await prisma.booking.update({
      where: { id: bookingId },
      data: { status: "DECLINED" },
    });

    res.status(200).json({ message: "Booking declined", declined });
  } catch (err) {
    res.status(500).json({ error: "Failed to decline", details: err });
  }
};

// Create a new booking
export const createBooking = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'User not authenticated' });
  }
  const { vehicleId, parkingId, entryTime, checkoutTime } = req.body;
  const userId = req.user.id;
  let bookingData: any = {};

  try {
    // Check if vehicle belongs to user
    const vehicle = await prisma.vehicle.findFirst({
      where: {
        id: vehicleId,
        ownerId: userId
      }
    });

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found or not owned by user' });
    }

    // Check if parking exists and has available spaces
    const parking = await prisma.parking.findUnique({
      where: { id: parkingId },
      include: { slots: true }
    });

    if (!parking) {
      return res.status(404).json({ error: 'Parking not found' });
    }

    if (parking.availableSpaces <= 0) {
      return res.status(400).json({ error: 'No available spaces in this parking' });
    }

    // Find an available slot in the parking
    const availableSlot = await prisma.slot.findFirst({
      where: {
        parkingId: parkingId,
        status: 'AVAILABLE'
      }
    });

    if (!availableSlot) {
      return res.status(400).json({ error: 'No available slot in this parking' });
    }

    // Create booking with slotId
    bookingData = {
      vehicleId,
      slotId: availableSlot.id,
      entryTime: new Date(entryTime),
      checkoutTime: new Date(checkoutTime),
      status: 'PENDING',
      userId,
      paymentStatus: 'PENDING'
    };
    console.log('Booking data:', bookingData);
    const booking = await prisma.booking.create({
      data: bookingData,
      include: {
        vehicle: true,
        slot: true
      }
    });

    // Update slot status to OCCUPIED
    await prisma.slot.update({
      where: { id: availableSlot.id },
      data: { status: 'OCCUPIED' }
    });

    // Update available spaces
    await prisma.parking.update({
      where: { id: parkingId },
      data: {
        availableSpaces: parking.availableSpaces - 1
      }
    });

    res.status(201).json(booking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking', details: error, bookingData, errorStack: error instanceof Error ? error.stack : error });
  }
};

// Get all bookings for a user
export const getBookings = async (req: Request, res: Response) => {
  const userId = req.user.id;

  try {
    const bookings = await prisma.booking.findMany({
      where: { userId },
      include: {
        vehicle: true,
        slot: { include: { parking: true } }
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

// Get booking by ID
export const getBookingById = async (req: Request, res: Response) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const booking = await prisma.booking.findFirst({
      where: {
        id,
        userId
      },
      include: {
        vehicle: true,
        slot: { include: { parking: true } }
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    res.json(booking);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
};

// Update booking
export const updateBooking = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { startTime, endTime } = req.body;
  const userId = req.user.id;

  try {
    const booking = await prisma.booking.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status !== 'PENDING') {
      return res.status(400).json({ error: 'Cannot update non-pending booking' });
    }

    const updatedBooking = await prisma.booking.update({
      where: { id },
      data: {
        startTime: startTime ? new Date(startTime) : undefined,
        endTime: endTime ? new Date(endTime) : undefined
      },
      include: {
        vehicle: true,
        parking: true
      }
    });

    res.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
};
