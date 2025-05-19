
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, CarIcon, CreditCardIcon, ParkingSquare, CheckCircleIcon, ClockIcon } from 'lucide-react';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import bookingService from '@/services/bookingService';
import vehicleService from '@/services/vehicleService';
import analyticsService, { AnalyticsData } from '@/services/analyticsService';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [bookingsCount, setBookingsCount] = useState(0);
  const [pendingBookings, setPendingBookings] = useState(0);
  const [vehiclesCount, setVehiclesCount] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch analytics data
        const analytics = await analyticsService.getAnalyticsData();
        setAnalyticsData(analytics);

        // Fetch bookings for pending count
        const bookings = await bookingService.getAllBookings();
        setBookingsCount(bookings.length);
        setPendingBookings(bookings.filter(b => b.status === 'pending').length);

        // Fetch vehicles count
        const vehicles = await vehicleService.getAllVehicles();
        setVehiclesCount(vehicles.length);

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Hello, {user?.name}!</h1>
        <p className="text-muted-foreground">
          Welcome to the Admin Dashboard. Here's an overview of your parking system.
        </p>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analyticsData?.totalBookings || bookingsCount}</div>
                  <p className="text-xs text-muted-foreground">
                    Total bookings in the system
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                  <ClockIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingBookings}</div>
                  <p className="text-xs text-muted-foreground">
                    Bookings waiting for approval
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Registered Vehicles</CardTitle>
                  <CarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{vehiclesCount}</div>
                  <p className="text-xs text-muted-foreground">
                    Vehicles in the system
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Current Occupancy</CardTitle>
                  <ParkingSquare className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analyticsData ? `${Math.round(analyticsData.occupancyRates[0]?.rate || 0)}%` : 'N/A'}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Current parking occupancy rate
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-2 md:col-span-1">
                <CardHeader>
                  <CardTitle>Revenue Over Time</CardTitle>
                  <CardDescription>
                    Monthly revenue from parking fees
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {analyticsData ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analyticsData.revenueData}>
                        <XAxis
                          dataKey="period"
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="amount"
                          stroke="#8B5CF6"
                          strokeWidth={2}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No revenue data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="col-span-2 md:col-span-1">
                <CardHeader>
                  <CardTitle>Occupancy Rates</CardTitle>
                  <CardDescription>
                    Average parking occupancy per period
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {analyticsData ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={analyticsData.occupancyRates}>
                        <XAxis
                          dataKey="period"
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#888888"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip />
                        <Line
                          type="monotone"
                          dataKey="rate"
                          stroke="#D946EF"
                          strokeWidth={2}
                          activeDot={{ r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <p className="text-muted-foreground">No occupancy data available</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
