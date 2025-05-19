export type Role = 'USER' | 'ADMIN';

// Define types that match Prisma enums
export type BookingStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'CHECKED_OUT' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'UNPAID';
export type PaymentMethod = 'CASH' | 'CARD' | 'ONLINE';

// Local types
export type VehicleType = 'CAR' | 'MOTORCYCLE' | 'BIKE';
export type SlotStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'APPROVE' | 'REJECT';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  vehicles?: {
    id: string;
    plateNumber: string;
    type: VehicleType;
    owner: User;
    ownerId: string;
    slot?: {
      id: number;
      number: number;
      type: VehicleType;
      status: SlotStatus;
      createdAt: Date;
      updatedAt: Date;
    };
    slotId?: number;
    checkIn?: Date;
    checkOut?: Date;
    paid: boolean;
    bookings: {
      id: string;
      vehicleId: string;
      status: BookingStatus;
      entryTime?: Date;
      checkoutTime?: Date;
      paymentStatus: PaymentStatus;
      amount?: number;
      paymentMethod?: PaymentMethod;
      createdAt: Date;
    }[];
    auditLogs: {
      id: string;
      userId: string;
      action: AuditAction;
      data: string;
      createdAt: Date;
    }[];
  }[];
  bookings?: {
    id: string;
    user: User;
    userId: string;
    vehicle: {
      id: string;
      plateNumber: string;
      type: VehicleType;
      owner: User;
      ownerId: string;
      slot?: {
        id: number;
        number: number;
        type: VehicleType;
        status: SlotStatus;
        createdAt: Date;
        updatedAt: Date;
      };
      slotId?: number;
      checkIn?: Date;
      checkOut?: Date;
      paid: boolean;
      bookings: {
        id: string;
        vehicleId: string;
        status: BookingStatus;
        entryTime?: Date;
        checkoutTime?: Date;
        paymentStatus: PaymentStatus;
        amount?: number;
        paymentMethod?: PaymentMethod;
        createdAt: Date;
      }[];
      auditLogs: {
        id: string;
        userId: string;
        action: AuditAction;
        data: string;
        createdAt: Date;
      }[];
    };
    vehicleId: string;
    slot?: {
      id: number;
      number: number;
      type: VehicleType;
      status: SlotStatus;
      createdAt: Date;
      updatedAt: Date;
    };
    slotId?: number;
    status: BookingStatus;
    entryTime?: Date;
    checkoutTime?: Date;
    paymentStatus: PaymentStatus;
    amount?: number;
    paymentMethod?: PaymentMethod;
    createdAt: Date;
  }[];
}
