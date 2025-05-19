
import api from './api';

export interface VehicleRequest {
  licensePlate: string;
  type: string;
  color: string;
}

export interface Vehicle {
  id: string;
  userId: string;
  licensePlate: string;
  type: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

const vehicleService = {
  createVehicle: async (vehicleData: VehicleRequest) => {
    const response = await api.post<Vehicle>('/api/vehicles', vehicleData);
    return response.data;
  },

  getUserVehicles: async () => {
    const response = await api.get<Vehicle[]>('/api/vehicles');
    return response.data;
  },

  getAllVehicles: async () => {
    const response = await api.get<Vehicle[]>('/api/admin/vehicles');
    return response.data;
  },

  updateVehicle: async (id: string, vehicleData: Partial<VehicleRequest>) => {
    const response = await api.patch<Vehicle>(`/api/vehicles/${id}`, vehicleData);
    return response.data;
  },

  deleteVehicle: async (id: string) => {
    const response = await api.delete(`/api/vehicles/${id}`);
    return response.data;
  },
};

export default vehicleService;
