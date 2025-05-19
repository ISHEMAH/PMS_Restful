
import api from './api';

export interface BookingRequest {
  vehicleId: string;
  slotId: number;
  startTime: string;
  endTime: string;
}

export interface Booking {
  id: string;
  vehicleId: string;
  slotId: number;
  userId: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'approved' | 'declined' | 'completed';
  vehicle?: {
    licensePlate: string;
    type: string;
    color: string;
  };
  slot?: {
    number: number;
    type: string;
  };
  user?: {
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

const bookingService = {
  createBooking: async (bookingData: BookingRequest) => {
    const response = await api.post<Booking>('/api/bookings', bookingData);
    return response.data;
  },

  getUserBookings: async () => {
    const response = await api.get<Booking[]>('/api/bookings');
    return response.data;
  },

  getAllBookings: async () => {
    const response = await api.get<Booking[]>('/api/admin/bookings');
    return response.data;
  },

  approveBooking: async (bookingId: string) => {
    const response = await api.put(`/api/admin/bookings/${bookingId}/approve`);
    return response.data;
  },

  declineBooking: async (bookingId: string, reason?: string) => {
    const response = await api.put(`/api/admin/bookings/${bookingId}/decline`, { reason });
    return response.data;
  },

  checkoutBooking: async (bookingId: string) => {
    const response = await api.post(`/api/checkout/${bookingId}`);
    return response.data;
  },

  getBookingHistory: async () => {
    const response = await api.get('/api/admin/history');
    return response.data;
  },
};

export default bookingService;
