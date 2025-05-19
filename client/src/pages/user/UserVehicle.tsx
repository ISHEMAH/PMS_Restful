
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import vehicleService, { Vehicle, VehicleRequest } from '@/services/vehicleService';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Pencil, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const VehicleForm = ({ 
  onSubmit, 
  vehicle, 
  isEditing, 
  isLoading 
}: { 
  onSubmit: (data: VehicleRequest) => void, 
  vehicle?: Vehicle,
  isEditing?: boolean,
  isLoading: boolean
}) => {
  const [licensePlate, setLicensePlate] = useState(vehicle?.licensePlate || '');
  const [type, setType] = useState(vehicle?.type || 'sedan');
  const [color, setColor] = useState(vehicle?.color || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      licensePlate,
      type,
      color
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label htmlFor="license-plate">License Plate</Label>
          <Input
            id="license-plate"
            placeholder="e.g. ABC-123"
            value={licensePlate}
            onChange={(e) => setLicensePlate(e.target.value)}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Vehicle Type</Label>
          <Select value={type} onValueChange={setType} required>
            <SelectTrigger>
              <SelectValue placeholder="Select vehicle type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="sedan">Sedan</SelectItem>
              <SelectItem value="suv">SUV</SelectItem>
              <SelectItem value="hatchback">Hatchback</SelectItem>
              <SelectItem value="truck">Truck</SelectItem>
              <SelectItem value="motorcycle">Motorcycle</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="color">Vehicle Color</Label>
          <Input
            id="color"
            placeholder="e.g. Red"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            required
          />
        </div>
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            {isEditing ? 'Updating...' : 'Registering...'}
          </>
        ) : (
          isEditing ? 'Update Vehicle' : 'Register Vehicle'
        )}
      </Button>
    </form>
  );
};

const UserVehicle = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      setIsLoading(true);
      const data = await vehicleService.getUserVehicles();
      setVehicles(data);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      toast({
        variant: "destructive",
        title: "Failed to load vehicles",
        description: "Please try again later."
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddVehicle = async (vehicleData: VehicleRequest) => {
    try {
      setFormLoading(true);
      const newVehicle = await vehicleService.createVehicle(vehicleData);
      setVehicles([...vehicles, newVehicle]);
      toast({
        title: "Vehicle registered successfully",
        description: "Your vehicle has been added to your account."
      });
      setDialogOpen(false);
    } catch (error) {
      console.error('Error adding vehicle:', error);
      toast({
        variant: "destructive",
        title: "Failed to register vehicle",
        description: "Please check your information and try again."
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdateVehicle = async (vehicleData: VehicleRequest) => {
    if (!editingVehicle) return;
    
    try {
      setFormLoading(true);
      const updatedVehicle = await vehicleService.updateVehicle(editingVehicle.id, vehicleData);
      
      setVehicles(vehicles.map(v => 
        v.id === updatedVehicle.id ? updatedVehicle : v
      ));
      
      toast({
        title: "Vehicle updated successfully",
        description: "Your vehicle information has been updated."
      });
      
      setEditingVehicle(null);
      setDialogOpen(false);
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast({
        variant: "destructive",
        title: "Failed to update vehicle",
        description: "Please try again later."
      });
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteVehicle = async (id: string) => {
    try {
      await vehicleService.deleteVehicle(id);
      setVehicles(vehicles.filter(v => v.id !== id));
      toast({
        title: "Vehicle deleted",
        description: "Your vehicle has been removed from your account."
      });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      toast({
        variant: "destructive",
        title: "Failed to delete vehicle",
        description: "Please try again later."
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">My Vehicles</h1>
            <p className="text-muted-foreground">
              Manage your registered vehicles
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Register New Vehicle</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Register a New Vehicle</DialogTitle>
                <DialogDescription>
                  Enter your vehicle details below to register it with our parking system.
                </DialogDescription>
              </DialogHeader>
              <VehicleForm 
                onSubmit={handleAddVehicle} 
                isLoading={formLoading}
              />
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.length === 0 ? (
              <div className="md:col-span-2 lg:col-span-3">
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <p className="text-lg text-muted-foreground mb-4">
                      You haven't registered any vehicles yet
                    </p>
                    <DialogTrigger asChild>
                      <Button>Register Your First Vehicle</Button>
                    </DialogTrigger>
                  </CardContent>
                </Card>
              </div>
            ) : (
              vehicles.map((vehicle) => (
                <Card key={vehicle.id}>
                  <CardHeader>
                    <CardTitle className="text-xl">{vehicle.licensePlate}</CardTitle>
                    <CardDescription>
                      {vehicle.type.charAt(0).toUpperCase() + vehicle.type.slice(1)} · {vehicle.color}
                    </CardDescription>
                  </CardHeader>
                  <CardFooter className="flex justify-between">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setEditingVehicle(vehicle)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Vehicle</DialogTitle>
                          <DialogDescription>
                            Update your vehicle information below.
                          </DialogDescription>
                        </DialogHeader>
                        {editingVehicle && (
                          <VehicleForm
                            vehicle={editingVehicle}
                            onSubmit={handleUpdateVehicle}
                            isEditing
                            isLoading={formLoading}
                          />
                        )}
                      </DialogContent>
                    </Dialog>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="icon">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will permanently delete your vehicle registration.
                            This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteVehicle(vehicle.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserVehicle;
