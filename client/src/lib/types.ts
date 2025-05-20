// User types
export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

// Authentication related types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

// Vehicle types
export type VehicleType = 'CAR' | 'MOTORCYCLE' | 'BIKE';

export interface Vehicle {
  id: string;
  userId: string;
  plateNumber: string;
  type: VehicleType;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicle {
  plateNumber: string;
  type: VehicleType;
}

export interface UpdateVehicle {
  plateNumber?: string;
  type?: VehicleType;
}

// Parking types
export interface Parking {
  id: string;
  name: string;
  location: string;
  totalSpaces: number;
  chargingFeePerHour: number;
  createdAt: string;
  updatedAt: string;
  slots: Slot[];
}

export interface CreateParking {
  name: string;
  location: string;
  totalSpaces: number;
  chargingFeePerHour: number;
}

export interface UpdateParking {
  name?: string;
  location?: string;
  totalSpaces?: number;
  chargingFeePerHour?: number;
}

// Slot types
export type SlotStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';

export interface Slot {
  id: string;
  parkingId: string;
  number: number;
  status: SlotStatus;
  createdAt: string;
  updatedAt: string;
}

// Booking types
export type BookingStatus = 'PENDING' | 'APPROVED' | 'DECLINED' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'UNPAID';
export type PaymentMethod = 'CASH' | 'CARD' | 'ONLINE';

export interface Booking {
  id: string;
  userId: string;
  vehicleId: string;
  slotId: string;
  status: BookingStatus;
  entryTime: string;
  checkoutTime: string;
  paymentStatus: PaymentStatus;
  amount: number;
  paymentMethod: PaymentMethod;
  createdAt: string;
  updatedAt: string;
  vehicle: Vehicle;
  slot: Slot;
}

export interface CreateBooking {
  vehicleId: string;
  parkingId: string;
  entryTime: string;
  checkoutTime: string;
}

// Ticket types
export interface Ticket {
  id: string;
  ticketNumber: string;
  vehicleId: string;
  parkingId: string;
  entryTime: string;
  exitTime: string;
  amount: number;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  createdAt: string;
  updatedAt: string;
}

export interface CreateTicket {
  vehicleId: string;
  parkingId: string;
}

export interface UpdateTicket {
  exitTime: string;
}

// Report types
export interface ParkingReport {
  parkingDetails: {
    name: string;
    location: string;
    totalSpaces: number;
    availableSpaces: number;
  };
  bookingStats: {
    total: number;
    byStatus: {
      pending: number;
      approved: number;
      declined: number;
      checkedOut: number;
      cancelled: number;
    };
    byPaymentStatus: {
      pending: number;
      paid: number;
      unpaid: number;
    };
  };
  revenueStats: {
    total: number;
    byPaymentMethod: {
      cash: number;
      card: number;
      online: number;
    };
  };
  bookings: Array<{
    id: string;
    status: string;
    entryTime: string;
    checkoutTime: string;
    amount: number;
    paymentStatus: string;
    paymentMethod: string;
    vehicle: {
      plateNumber: string;
      type: string;
    };
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
    slot: {
      number: number;
    };
  }>;
}

export interface FinancialReport {
  totalRevenue: number;
  byParking: Array<{
    parkingName: string;
    totalBookings: number;
    revenue: number;
    byPaymentMethod: {
      cash: number;
      card: number;
      online: number;
    };
  }>;
}

export interface OccupancyReport {
  byParking: Array<{
    parkingName: string;
    totalSlots: number;
    occupiedSlots: number;
    maintenanceSlots: number;
    availableSlots: number;
    occupancyRate: number;
    byVehicleType: {
      car: number;
      motorcycle: number;
      bike: number;
    };
  }>;
}

export interface VehicleReport {
  totalVehicles: number;
  activeVehicles: number;
  vehicleTypes: Array<VehicleTypeStats>;
  averageStayDuration: number;
  mostFrequentUsers: Array<UserStats>;
}

export interface RevenueReport {
  totalRevenue: number;
  revenueByParking: Array<{
    parkingId: string;
    parkingName: string;
    revenue: number;
  }>;
  revenueByDate: Array<{
    date: string;
    revenue: number;
  }>;
  averageRevenuePerVehicle: number;
}

export interface VehicleTypeStats {
  type: string;
  count: number;
  percentage: number;
}

export interface UserStats {
  userId: string;
  firstName: string;
  lastName: string;
  totalVisits: number;
  totalSpent: number;
  averageStayDuration: number;
}

// Analytics types
export interface Analytics {
  totalBookings: number;
  totalRevenue: number;
  occupancyRate: number;
  averageStayDuration: number;
  vehicleTypeDistribution: {
    type: VehicleType;
    count: number;
  }[];
  peakHours: {
    hour: number;
    count: number;
  }[];
}

export interface Report {
  id: string;
  type: 'PARKING' | 'VEHICLE' | 'REVENUE' | 'FINANCIAL' | 'OCCUPANCY';
  startDate: string;
  endDate: string;
  data: any;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
