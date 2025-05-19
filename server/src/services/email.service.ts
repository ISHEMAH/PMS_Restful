import nodemailer from 'nodemailer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
import path from 'path';
import fs from 'fs';
import hbs from 'nodemailer-express-handlebars';

interface EmailOptions {
  to: string;
  subject: string;
  template: string;
  context: any;
}

export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      }
    });

    // Setup handlebars templates
    const handlebarsOptions = {
      viewEngine: {
        extname: '.hbs',
        layoutsDir: path.join(__dirname, '../../templates/emails/layouts/'),
        defaultLayout: 'main',
        partialsDir: path.join(__dirname, '../../templates/emails/partials/'),
      },
      viewPath: path.join(__dirname, '../../templates/emails/'),
      extName: '.hbs',
    };

    this.transporter.use('compile', hbs(handlebarsOptions));
  }

  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await this.transporter.sendMail({
        ...options,
        from: process.env.SMTP_FROM,
      });
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }

  async sendBookingConfirmation(bookingId: string): Promise<void> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          user: true,
          slot: true,
          vehicle: true
        }
      });

      if (!booking || !booking.user || !booking.vehicle) {
        throw new Error('Booking or related data not found');
      }

      const mailOptions = {
        to: booking.user.email,
        subject: 'Parking Booking Confirmation',
        template: 'booking-confirmation',
        context: {
          name: booking.user.name,
          plateNumber: booking.vehicle.plateNumber,
          vehicleType: booking.vehicle.type,
          slotNumber: booking.slot?.number ?? 'N/A',
          entryTime: booking.entryTime?.toISOString(),
          status: booking.status
        }
      };

      await this.sendEmail(mailOptions);
    } catch (error) {
      console.error('Failed to send booking confirmation:', error);
      throw error;
    }
  }

  async sendCheckoutReceipt(bookingId: string): Promise<void> {
    try {
      const booking = await prisma.booking.findUnique({
        where: { id: bookingId },
        include: {
          user: true,
          slot: true,
          vehicle: true
        }
      });

      if (!booking || !booking.user || !booking.vehicle) {
        throw new Error('Booking or related data not found');
      }

      if (!process.env.SMTP_FROM) {
        throw new Error('SMTP_FROM environment variable is not set');
      }

      const mailOptions = {
        from: process.env.SMTP_FROM,
        to: booking.user.email,
        subject: 'Parking Checkout Receipt',
        template: 'checkout-receipt',
        context: {
          name: booking.user.name,
          plateNumber: booking.vehicle.plateNumber,
          vehicleType: booking.vehicle.type,
          slotNumber: booking.slot?.number ?? 'N/A',
          entryTime: booking.entryTime?.toISOString() ?? 'N/A',
          checkoutTime: booking.checkoutTime?.toISOString() ?? 'N/A',
          amount: String(booking.amount ?? 0),
          paymentMethod: booking.paymentMethod ?? 'N/A'
        }
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Failed to send checkout receipt:', error);
      throw error;
    }
  }

  async sendAdminNotification(action: string, details: any): Promise<void> {
    await this.sendEmail({
      to: process.env.ADMIN_EMAIL || '',
      subject: `Parking System Notification - ${action}`,
      template: 'admin-notification',
      context: {
        action,
        details,
      },
    });
  }
}
