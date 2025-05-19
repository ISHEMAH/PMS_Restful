
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, CarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import vehicleService, { Vehicle } from '@/services/vehicleService';
import bookingService, { Booking } from '@/services/bookingService';
import { Loader2 } from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [isLoading, setIsLoading] = useState(true);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch user vehicles
        const vehiclesData = await vehicleService.getUserVehicles();
        setVehicles(vehiclesData);
        
        // Fetch user bookings
        const bookingsData = await bookingService.getUserBookings();
        setBookings(bookingsData);
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, []);
  
  // Calculate stats
  const activeBookings = bookings.filter(b => b.status === 'approved').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const registeredVehicles = vehicles.length;
  
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Hello, {user?.name}!</h1>
        <p className="text-muted-foreground">
          Welcome to the Parking Management System. Here's your overview.
        </p>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{activeBookings}</div>
                  <p className="text-xs text-muted-foreground">
                    {activeBookings === 1 ? 'Booking' : 'Bookings'} currently active
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending Bookings</CardTitle>
                  <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{pendingBookings}</div>
                  <p className="text-xs text-muted-foreground">
                    {pendingBookings === 1 ? 'Booking' : 'Bookings'} awaiting approval
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Registered Vehicles</CardTitle>
                  <CarIcon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{registeredVehicles}</div>
                  <p className="text-xs text-muted-foreground">
                    {registeredVehicles === 1 ? 'Vehicle' : 'Vehicles'} registered
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="col-span-2 md:col-span-1">
                <CardHeader>
                  <CardTitle>My Vehicles</CardTitle>
                  <CardDescription>
                    Manage your registered vehicles
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {vehicles.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground mb-4">You haven't registered any vehicles yet</p>
                      <Button onClick={() => navigate('/user/vehicle')}>
                        Register Vehicle
                      </Button>
                    </div>
                  ) : (
                    <>
                      {vehicles.slice(0, 2).map((vehicle) => (
                        <div key={vehicle.id} className="flex items-center justify-between border-b pb-2">
                          <div>
                            <p className="font-medium">{vehicle.licensePlate}</p>
                            <p className="text-sm text-muted-foreground">
                              {vehicle.type} · {vehicle.color}
                            </p>
                          </div>
                          <Button variant="ghost" onClick={() => navigate('/user/vehicle')}>
                            Manage
                          </Button>
                        </div>
                      ))}
                      {vehicles.length > 2 && (
                        <Button variant="link" onClick={() => navigate('/user/vehicle')}>
                          View all vehicles
                        </Button>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
              
              <Card className="col-span-2 md:col-span-1">
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                  <CardDescription>
                    Your most recent parking bookings
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {bookings.length === 0 ? (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground mb-4">You haven't made any bookings yet</p>
                      <Button onClick={() => navigate('/user/bookings')}>
                        Book a Slot
                      </Button>
                    </div>
                  ) : (
                    <>
                      {bookings.slice(0, 2).map((booking) => (
                        <div key={booking.id} className="flex items-center justify-between border-b pb-2">
                          <div>
                            <p className="font-medium">Slot #{booking.slotId}</p>
                            <p className="text-sm text-muted-foreground">
                              Status: <span className={`font-medium ${
                                booking.status === 'approved' ? 'text-green-500' : 
                                booking.status === 'pending' ? 'text-amber-500' : 
                                booking.status === 'declined' ? 'text-red-500' : 
                                'text-blue-500'
                              }`}>
                                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                              </span>
                            </p>
                          </div>
                          <Button variant="ghost" onClick={() => navigate('/user/bookings')}>
                            View
                          </Button>
                        </div>
                      ))}
                      {bookings.length > 2 && (
                        <Button variant="link" onClick={() => navigate('/user/bookings')}>
                          View all bookings
                        </Button>
                      )}
                    </>
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

export default UserDashboard;
