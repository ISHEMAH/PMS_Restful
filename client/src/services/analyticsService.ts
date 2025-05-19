
import api from './api';

export interface AnalyticsData {
  totalBookings: number;
  revenueData: {
    period: string;
    amount: number;
  }[];
  occupancyRates: {
    period: string;
    rate: number;
  }[];
  vehicleTypes: {
    type: string;
    count: number;
  }[];
}

const analyticsService = {
  getAnalyticsData: async () => {
    const response = await api.get<AnalyticsData>('/api/analytics');
    return response.data;
  },
};

export default analyticsService;
