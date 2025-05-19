
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ParkingSquare, Loader2 } from 'lucide-react';
import slotService, { ParkingSlot } from '@/services/slotService';
import { useToast } from '@/hooks/use-toast';

const UserSlots = () => {
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSlots = async () => {
      try {
        setIsLoading(true);
        const data = await slotService.getAvailableSlots();
        setSlots(data);
      } catch (error) {
        console.error('Error fetching slots:', error);
        toast({
          variant: "destructive",
          title: "Failed to load available slots",
          description: "Please try again later."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlots();
  }, [toast]);

  const handleBookSlot = (slotId: number) => {
    navigate('/user/bookings/new', { state: { slotId } });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Available Slots</h1>
            <p className="text-muted-foreground">
              View and book available parking slots
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {slots.length === 0 ? (
              <div className="md:col-span-2 lg:col-span-3">
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <ParkingSquare className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-lg text-muted-foreground mb-4">
                      No parking slots are available at the moment
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              slots.map((slot) => (
                <Card key={slot.id} className="overflow-hidden">
                  <CardHeader className={`${
                    slot.status === 'available' ? 'bg-green-100' : 
                    slot.status === 'occupied' ? 'bg-red-100' : 'bg-amber-100'
                  }`}>
                    <CardTitle className="flex items-center justify-between">
                      <span>Slot #{slot.number}</span>
                      <span className={`text-sm rounded-full px-2 py-1 ${
                        slot.status === 'available' ? 'bg-green-500 text-white' : 
                        slot.status === 'occupied' ? 'bg-red-500 text-white' : 'bg-amber-500 text-white'
                      }`}>
                        {slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}
                      </span>
                    </CardTitle>
                    <CardDescription>
                      Type: {slot.type.charAt(0).toUpperCase() + slot.type.slice(1)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-4">
                    <Button 
                      onClick={() => handleBookSlot(slot.id)}
                      disabled={slot.status !== 'available'}
                      className="w-full"
                    >
                      {slot.status === 'available' ? 'Book Now' : 'Unavailable'}
                    </Button>
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

export default UserSlots;
