import { toast } from "sonner";

const API_BASE_URL = "http://localhost:3000/api/v1";

// Basic fetch wrapper with authentication and error handling
const fetchWithAuth = async (endpoint: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error || `Error: ${response.status}`;
      throw new Error(errorMessage);
    }

    // For DELETE requests or other requests that don't return JSON
    if (response.status === 204) {
      return null;
    }

    return await response.json();
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error occurred";
    toast.error(message);
    throw error;
  }
};

// Auth endpoints
export const authApi = {
  login: (data: { email: string; password: string }) =>
    fetchWithAuth("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    fetchWithAuth("/auth/signup", { method: "POST", body: JSON.stringify(data) }),

  createAdmin: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    fetchWithAuth("/auth/create-admin", { method: "POST", body: JSON.stringify(data) }),
};

// User endpoints
export const userApi = {
  getProfile: () =>
    fetchWithAuth("/users/me"),

  updateProfile: (data: { firstName?: string; lastName?: string }) =>
    fetchWithAuth("/users/me", { method: "PATCH", body: JSON.stringify(data) }),

  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    fetchWithAuth("/users/change-password", { method: "POST", body: JSON.stringify(data) }),
};

// Parking endpoints
export const parkingApi = {
  getAll: () =>
    fetchWithAuth("/parking"),

  getById: (id: string) =>
    fetchWithAuth(`/parking/${id}`),

  create: (data: { name: string; location: string; totalSpaces: number; chargingFeePerHour: number }) =>
    fetchWithAuth("/parking", { method: "POST", body: JSON.stringify(data) }),

  update: (id: string, data: Partial<{ name: string; location: string; totalSpaces: number; chargingFeePerHour: number }>) =>
    fetchWithAuth(`/parking/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  delete: (id: string) =>
    fetchWithAuth(`/parking/${id}`, { method: "DELETE" }),
};

// Vehicle endpoints
export const vehicleApi = {
  getAll: () =>
    fetchWithAuth("/vehicles"),

  getById: (id: string) =>
    fetchWithAuth(`/vehicles/${id}`),

  create: (data: { plateNumber: string; type: 'CAR' | 'MOTORCYCLE' | 'BIKE' }) =>
    fetchWithAuth("/vehicles", { method: "POST", body: JSON.stringify(data) }),

  update: (id: string, data: Partial<{ plateNumber: string; type: 'CAR' | 'MOTORCYCLE' | 'BIKE' }>) =>
    fetchWithAuth(`/vehicles/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  delete: (id: string) =>
    fetchWithAuth(`/vehicles/${id}`, { method: "DELETE" }),
};

// Booking endpoints
export const bookingApi = {
  getAll: () =>
    fetchWithAuth("/bookings"),

  getById: (id: string) =>
    fetchWithAuth(`/bookings/${id}`),

  getHistory: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return fetchWithAuth(`/bookings/history?${params.toString()}`);
  },

  create: (data: { vehicleId: string; parkingId: string; entryTime: string; checkoutTime: string }) =>
    fetchWithAuth("/bookings", { method: "POST", body: JSON.stringify(data) }),

  cancel: (id: string) =>
    fetchWithAuth(`/bookings/${id}/cancel`, { method: "PUT" }),

  checkout: (id: string) =>
    fetchWithAuth(`/checkout/${id}`, { method: "POST" }),

  pay: (id: string, data: { paymentMethod: string }) =>
    fetchWithAuth(`/bookings/${id}/payment`, { method: "POST", body: JSON.stringify(data) }),

  adminGetAll: () =>
    fetchWithAuth("/admin/bookings"),

  approve: (bookingId: string) =>
    fetchWithAuth(`/admin/bookings/${bookingId}/approve`, { method: "PUT" }),

  decline: (bookingId: string) =>
    fetchWithAuth(`/admin/bookings/${bookingId}/decline`, { method: "PUT" }),
};

// Report endpoints
export const reportApi = {
  getParkingReport: (parkingId: string, startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    params.append("parkingId", parkingId);
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return fetchWithAuth(`/reports/parking?${params.toString()}`);
  },

  getVehicleReport: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return fetchWithAuth(`/reports/vehicles?${params.toString()}`);
  },

  getRevenueReport: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return fetchWithAuth(`/reports/revenue?${params.toString()}`);
  },

  getFinancialReport: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return fetchWithAuth(`/reports/financial?${params.toString()}`);
  },

  getOccupancyReport: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return fetchWithAuth(`/reports/occupancy?${params.toString()}`);
  },
};

// Admin endpoints
export const adminApi = {
  getHistory: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return fetchWithAuth(`/admin/history?${params.toString()}`);
  },

  getAnalytics: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return fetchWithAuth(`/analytics?${params.toString()}`);
  },
};

// Ticket endpoints
export const ticketApi = {
  getAll: (startDate?: string, endDate?: string) => {
    const params = new URLSearchParams();
    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    return fetchWithAuth(`/tickets?${params.toString()}`);
  },

  create: (data: { vehicleId: string; parkingId: string }) =>
    fetchWithAuth("/tickets", { method: "POST", body: JSON.stringify(data) }),

  getById: (id: string) =>
    fetchWithAuth(`/tickets/${id}`),

  update: (id: string, data: { exitTime: string }) =>
    fetchWithAuth(`/tickets/${id}`, { method: "PUT", body: JSON.stringify(data) }),
};

export const api = {
  // Bookings
  getBookings: async () => {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch bookings');
    return response.json();
  },

  // Vehicles
  getVehicles: async () => {
    const response = await fetch(`${API_BASE_URL}/vehicles`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch vehicles');
    return response.json();
  },

  // Parking History
  getParkingHistory: async () => {
    const response = await fetch(`${API_BASE_URL}/history`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch parking history');
    return response.json();
  },

  // Payments
  getPayments: async () => {
    const response = await fetch(`${API_BASE_URL}/payments`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem("token")}`
      }
    });
    if (!response.ok) throw new Error('Failed to fetch payments');
    return response.json();
  }
};
