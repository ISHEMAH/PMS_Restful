
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Calendar, Loader2, CheckCircle } from 'lucide-react';
import bookingService, { Booking } from '@/services/bookingService';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const UserBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [checkingOut, setCheckingOut] = useState<string | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const data = await bookingService.getUserBookings();
      setBookings(data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        variant: "destructive",
        title: "Failed to load bookings",
        description: "Please try again later."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckout = async (bookingId: string) => {
    try {
      setCheckingOut(bookingId);
      await bookingService.checkoutBooking(bookingId);
      
      toast({
        title: "Checkout successful",
        description: "Your vehicle has been checked out successfully."
      });
      
      // Refresh bookings list
      fetchBookings();
    } catch (error) {
      console.error('Error checking out:', error);
      toast({
        variant: "destructive",
        title: "Checkout failed",
        description: "There was an error checking out your vehicle. Please try again."
      });
    } finally {
      setCheckingOut(null);
    }
  };

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy - h:mm a');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
            <p className="text-muted-foreground">
              Manage your parking bookings
            </p>
          </div>
          <Button onClick={() => navigate('/user/bookings/new')}>
            Book a Slot
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg text-muted-foreground mb-4">
                    You don't have any bookings yet
                  </p>
                  <Button onClick={() => navigate('/user/bookings/new')}>
                    Book a Slot Now
                  </Button>
                </CardContent>
              </Card>
            ) : (
              bookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden">
                  <CardHeader className={`${
                    booking.status === 'approved' ? 'bg-green-100' : 
                    booking.status === 'pending' ? 'bg-amber-100' : 
                    booking.status === 'declined' ? 'bg-red-100' : 'bg-blue-100'
                  }`}>
                    <CardTitle className="flex items-center justify-between">
                      <span>Booking #{booking.id.substring(0, 8).toUpperCase()}</span>
                      <span className={`text-sm rounded-full px-2 py-1 ${
                        booking.status === 'approved' ? 'bg-green-500 text-white' : 
                        booking.status === 'pending' ? 'bg-amber-500 text-white' : 
                        booking.status === 'declined' ? 'bg-red-500 text-white' : 'bg-blue-500 text-white'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Vehicle</h3>
                        <p className="font-medium">{booking.vehicle?.licensePlate} ({booking.vehicle?.type} - {booking.vehicle?.color})</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Parking Slot</h3>
                        <p className="font-medium">#{booking.slot?.number} ({booking.slot?.type})</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Start Time</h3>
                        <p className="font-medium">{formatDate(booking.startTime)}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">End Time</h3>
                        <p className="font-medium">{formatDate(booking.endTime)}</p>
                      </div>
                    </div>
                    
                    {booking.status === 'approved' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button className="w-full">
                            Checkout
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Checkout</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to checkout your vehicle? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => handleCheckout(booking.id)}
                              disabled={checkingOut === booking.id}
                            >
                              {checkingOut === booking.id ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="mr-2 h-4 w-4" />
                                  Confirm Checkout
                                </>
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserBookings;
