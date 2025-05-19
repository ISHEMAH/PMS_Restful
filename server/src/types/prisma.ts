import { PrismaClient } from '@prisma/client';
import { Role, VehicleType, SlotStatus, BookingStatus, PaymentStatus, AuditAction, PaymentMethod } from '.prisma/client';

export const prisma = new PrismaClient();

export type User = {
  id: string;
  email: string;
  password: string;
  name: string;
  role: Role;
  vehicles: Vehicle[];
  bookings: Booking[];
  auditLogs: AuditLog[];
  createdAt: Date;
  updatedAt: Date;
};

export type Vehicle = {
  id: string;
  plateNumber: string;
  type: VehicleType;
  ownerId: string;
  slotId: number | null;
  checkIn: Date | null;
  checkOut: Date | null;
  paid: boolean;
  bookings: Booking[];
  auditLogs: AuditLog[];
};

export type Slot = {
  id: number;
  number: number;
  type: VehicleType;
  status: SlotStatus;
  bookings: Booking[];
  vehicle: Vehicle | null;
  analytics: Analytics[];
};

export type Booking = {
  id: string;
  userId: string;
  vehicleId: string;
  slotId: number | null;
  status: BookingStatus;
  entryTime: Date | null;
  checkoutTime: Date | null;
  paymentStatus: PaymentStatus;
  amount: number | null;
  paymentMethod: PaymentMethod | null;
  analytics: Analytics[];
  auditLogs: AuditLog[];
};

export type Analytics = {
  id: string;
  date: Date;
  totalBookings: number;
  totalRevenue: number;
  occupancyRate: number;
  averageStay: number;
  peakHours: string;
  vehicleTypeStats: VehicleTypeStats[];
  bookings: Booking[];
  slots: Slot[];
};

export type VehicleTypeStats = {
  id: string;
  analyticsId: string;
  type: string;
  count: number;
  percentage: number;
};

export type AuditLog = {
  id: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  userId: string;
  oldValue: any;
  newValue: any;
  booking: Booking | null;
  vehicle: Vehicle | null;
};

export type Context = {
  prisma: typeof prisma;
};

export type { Role, VehicleType, SlotStatus, BookingStatus, PaymentStatus, AuditAction, PaymentMethod };
