
import api from './api';

export interface ParkingSlot {
  id: number;
  number: number;
  type: string;
  status: 'available' | 'occupied' | 'maintenance';
  createdAt: string;
  updatedAt: string;
}

const slotService = {
  getAvailableSlots: async () => {
    const response = await api.get<ParkingSlot[]>('/api/slots/available');
    return response.data;
  },

  getAllSlots: async () => {
    const response = await api.get<ParkingSlot[]>('/api/admin/slots');
    return response.data;
  },

  createSlot: async (slotData: { number: number; type: string }) => {
    const response = await api.post<ParkingSlot>('/api/admin/slots', slotData);
    return response.data;
  },

  updateSlotStatus: async (slotId: number, status: 'available' | 'occupied' | 'maintenance') => {
    const response = await api.patch<ParkingSlot>(`/api/admin/slots/${slotId}`, { status });
    return response.data;
  },

  deleteSlot: async (slotId: number) => {
    const response = await api.delete(`/api/admin/slots/${slotId}`);
    return response.data;
  },
};

export default slotService;
