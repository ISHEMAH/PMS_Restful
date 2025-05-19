import { Request, Response } from 'express';
import { prisma } from '../types/prisma';
import nodemailer from 'nodemailer';

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

const calculateAmount = (entry: Date, checkout: Date) => {
  const duration = Math.ceil((checkout.getTime() - entry.getTime()) / (1000 * 60 * 60));
  const ratePerHour = 2;
  return duration * ratePerHour;
};

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

export const checkoutVehicle = async (bookingId: string) => {
  if (!bookingId) {
    throw new Error('Booking ID is required');
  }

  try {
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        user: {
          include: {
            vehicles: {
              where: {
                id: bookingId
              }
            }
          }
        },
        slot: true
      }
    });

    if (!booking) {
      throw new Error('Booking not found');
    }

    if (booking.status !== 'APPROVED') {
      throw new Error('Booking is not approved');
    }

    if (!booking.slot) {
      throw new Error('No slot assigned to this booking');
    }

    const checkoutTime = new Date();
    const amount = calculateAmount(booking.entryTime || new Date(), checkoutTime);

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'CHECKED_OUT',
        checkoutTime,
        amount,
        paymentMethod: 'CASH'
      }
    });

    const vehicle = booking.user.vehicles[0]; // Get the first vehicle since we filtered by bookingId
    if (!vehicle) {
      throw new Error('Vehicle not found for this booking');
    }

    await sendCheckoutEmail(booking.user.email, {
      name: booking.user.name,
      plateNumber: vehicle.plateNumber,
      slotNumber: booking.slot.number,
      entryTime: booking.entryTime || new Date(),
      checkoutTime,
      amount,
      paymentMethod: 'CASH'
    });

    return { success: true, booking };
  } catch (error) {
    console.error('Checkout error:', error);
    throw error;
  }
};
