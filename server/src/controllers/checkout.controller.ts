import { Request, Response } from 'express';
import { prisma } from '../types/prisma';
import nodemailer from 'nodemailer';
import { calculateDuration, calculateAmount } from '../utils/parking.utils';

interface CheckoutDetails {
  slotNumber: number;
  plateNumber: string;
  entryTime: Date;
  checkoutTime: Date;
  amount: number;
  paymentMethod: 'CASH' | 'CARD' | 'ONLINE';
  name: string;
  email: string;
}

const sendCheckoutEmail = async (email: string, details: any) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Parking Checkout Confirmation',
    html: `
      <h3>Checkout Summary</h3>
      <p><strong>Slot Number:</strong> ${details.slotNumber}</p>
      <p><strong>Plate Number:</strong> ${details.plate}</p>
      <p><strong>Entry Time:</strong> ${details.entryTime}</p>
      <p><strong>Checkout Time:</strong> ${details.checkoutTime}</p>
      <p><strong>Amount Paid:</strong> $${details.amount}</p>
      <p><strong>Payment Method:</strong> ${details.paymentMethod}</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};

export const checkoutVehicle = async (req: Request, res: Response) => {
  const { bookingId } = req.params;
  const userId = req.user.id;

  try {
    // Find the booking
    const booking = await prisma.booking.findFirst({
      where: {
        id: bookingId,
        userId
      },
      include: {
        vehicle: true,
        parking: true
      }
    });

    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    if (booking.status !== 'APPROVED') {
      return res.status(400).json({ error: 'Can only checkout approved bookings' });
    }

    // Calculate duration and amount
    const duration = calculateDuration(booking.startTime, new Date());
    const amount = calculateAmount(duration, booking.parking.chargingFeePerHour);

    // Update booking status and add checkout time
    const updatedBooking = await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'COMPLETED',
        endTime: new Date(),
        amount
      },
      include: {
        vehicle: true,
        parking: true
      }
    });

    // Update available spaces in parking
    await prisma.parking.update({
      where: { id: booking.parkingId },
      data: {
        availableSpaces: {
          increment: 1
        }
      }
    });

    res.json(updatedBooking);
  } catch (error) {
    console.error('Error during checkout:', error);
    res.status(500).json({ error: 'Failed to process checkout' });
  }
};
