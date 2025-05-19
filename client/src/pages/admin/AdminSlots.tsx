
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import slotService, { ParkingSlot } from '@/services/slotService';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ParkingSquare, Plus, Pencil, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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

const AdminSlots = () => {
  const [slots, setSlots] = useState<ParkingSlot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Form states
  const [dialogOpen, setDialogOpen] = useState(false);
  const [slotNumber, setSlotNumber] = useState('');
  const [slotType, setSlotType] = useState('standard');
  const [slotStatus, setSlotStatus] = useState('available');
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingSlotId, setEditingSlotId] = useState<number | null>(null);
  
  const { toast } = useToast();

  const fetchSlots = async () => {
    try {
      setIsLoading(true);
      const data = await slotService.getAllSlots();
      setSlots(data);
    } catch (error) {
      console.error('Error fetching slots:', error);
      toast({
        variant: "destructive",
        title: "Failed to load slots",
        description: "Please try again later."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSlots();
  }, [toast]);

  const handleCreateOrUpdate = async () => {
    if (!slotNumber || !slotType || !slotStatus) {
      toast({
        variant: "destructive",
        title: "Missing information",
        description: "Please fill in all fields."
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      if (isEditMode && editingSlotId) {
        // Update existing slot status
        await slotService.updateSlotStatus(
          editingSlotId, 
          slotStatus as 'available' | 'occupied' | 'maintenance'
        );
        toast({
          title: "Slot updated",
          description: `Slot #${slotNumber} has been updated successfully.`
        });
      } else {
        // Create new slot
        await slotService.createSlot({
          number: parseInt(slotNumber),
          type: slotType
        });
        toast({
          title: "Slot created",
          description: `Slot #${slotNumber} has been created successfully.`
        });
      }
      
      // Reset form and fetch updated slots
      resetForm();
      fetchSlots();
    } catch (error) {
      console.error('Error creating/updating slot:', error);
      toast({
        variant: "destructive",
        title: isEditMode ? "Failed to update slot" : "Failed to create slot",
        description: "Please try again later."
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (slotId: number, slotNumber: number) => {
    try {
      await slotService.deleteSlot(slotId);
      toast({
        title: "Slot deleted",
        description: `Slot #${slotNumber} has been deleted successfully.`
      });
      fetchSlots();
    } catch (error) {
      console.error('Error deleting slot:', error);
      toast({
        variant: "destructive",
        title: "Failed to delete slot",
        description: "Please try again later."
      });
    }
  };

  const handleEdit = (slot: ParkingSlot) => {
    setIsEditMode(true);
    setEditingSlotId(slot.id);
    setSlotNumber(slot.number.toString());
    setSlotType(slot.type);
    setSlotStatus(slot.status);
    setDialogOpen(true);
  };

  const resetForm = () => {
    setDialogOpen(false);
    setSlotNumber('');
    setSlotType('standard');
    setSlotStatus('available');
    setIsEditMode(false);
    setEditingSlotId(null);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Parking Slots</h1>
            <p className="text-muted-foreground">
              Manage parking slots in your facility
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add New Slot
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {isEditMode ? 'Update Parking Slot' : 'Create New Parking Slot'}
                </DialogTitle>
                <DialogDescription>
                  {isEditMode 
                    ? 'Update the details of this parking slot.' 
                    : 'Enter the details for the new parking slot.'}
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="number">Slot Number</Label>
                  <Input
                    id="number"
                    type="number"
                    placeholder="e.g. 101"
                    value={slotNumber}
                    onChange={(e) => setSlotNumber(e.target.value)}
                    disabled={isEditMode}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Slot Type</Label>
                  <Select 
                    value={slotType} 
                    onValueChange={setSlotType}
                    disabled={isEditMode}
                  >
                    <SelectTrigger id="type">
                      <SelectValue placeholder="Select slot type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="handicap">Handicap</SelectItem>
                      <SelectItem value="electric">Electric</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Slot Status</Label>
                  <Select value={slotStatus} onValueChange={setSlotStatus}>
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select slot status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="occupied">Occupied</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={handleCreateOrUpdate} disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isEditMode ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    isEditMode ? 'Update Slot' : 'Create Slot'
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>All Parking Slots</CardTitle>
            </CardHeader>
            <CardContent>
              {slots.length === 0 ? (
                <div className="text-center py-8">
                  <ParkingSquare className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <p className="text-lg text-muted-foreground mb-4">
                    No parking slots have been created yet
                  </p>
                  <Button onClick={() => setDialogOpen(true)}>
                    Create Your First Slot
                  </Button>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Slot Number</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Last Updated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {slots.map((slot) => (
                        <TableRow key={slot.id}>
                          <TableCell className="font-medium">#{slot.number}</TableCell>
                          <TableCell>
                            {slot.type.charAt(0).toUpperCase() + slot.type.slice(1)}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              slot.status === 'available' ? 'bg-green-100 text-green-800' : 
                              slot.status === 'occupied' ? 'bg-red-100 text-red-800' : 
                              'bg-amber-100 text-amber-800'
                            }`}>
                              {slot.status.charAt(0).toUpperCase() + slot.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {new Date(slot.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            {new Date(slot.updatedAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button 
                                size="icon" 
                                variant="outline" 
                                onClick={() => handleEdit(slot)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="icon" variant="destructive">
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Parking Slot</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete Slot #{slot.number}?
                                      This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDelete(slot.id, slot.number)}
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminSlots;
