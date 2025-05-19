import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import nodemailer from "nodemailer";
import { AuthenticatedRequest } from "../middleware/auth";

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
