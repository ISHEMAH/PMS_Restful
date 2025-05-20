
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { vehicleApi } from "@/lib/api-client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import PageTransition from "@/components/layout/PageTransition";
import { Car, Plus, Edit, Trash, Loader2 } from "lucide-react";
import { VehicleType, CreateVehicle, UpdateVehicle } from "@/lib/types";

// Vehicle form schema
const vehicleFormSchema = z.object({
  plateNumber: z.string().min(2, "Plate number must be at least 2 characters"),
  type: z.enum(["CAR", "MOTORCYCLE", "BIKE"] as const),
});

type VehicleFormValues = z.infer<typeof vehicleFormSchema>;

export default function UserVehicles() {
  const queryClient = useQueryClient();
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [currentVehicle, setCurrentVehicle] = useState<any | null>(null);
  const [deleteVehicle, setDeleteVehicle] = useState<any | null>(null);
  
  // Create form
  const addForm = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      plateNumber: "",
      type: "CAR",
    },
  });
  
  // Edit form
  const editForm = useForm<VehicleFormValues>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      plateNumber: "",
      type: "CAR",
    },
  });
  
  // Fetch vehicles
  const { data: vehicles, isLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: vehicleApi.getAll,
  });
  
  // Create vehicle
  const createMutation = useMutation({
    mutationFn: (data: CreateVehicle) => vehicleApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle added successfully");
      setOpenAddDialog(false);
      addForm.reset();
    },
    onError: (error) => {
      toast.error(`Failed to add vehicle: ${error instanceof Error ? error.message : "Unknown error"}`);
    },
  });
  
  // Update vehicle
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateVehicle }) => 
      vehicleApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle updated successfully");
      setOpenEditDialog(false);
      setCurrentVehicle(null);
    },
    onError: (error) => {
      toast.error(`Failed to update vehicle: ${error instanceof Error ? error.message : "Unknown error"}`);
    },
  });
  
  // Delete vehicle
  const deleteMutation = useMutation({
    mutationFn: (id: string) => vehicleApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast.success("Vehicle deleted successfully");
      setDeleteVehicle(null);
    },
    onError: (error) => {
      toast.error(`Failed to delete vehicle: ${error instanceof Error ? error.message : "Unknown error"}`);
    },
  });
  
  // Handle create form submission
  const onAddSubmit = (data: VehicleFormValues) => {
    const vehicleData: CreateVehicle = {
      plateNumber: data.plateNumber,
      type: data.type
    };
    createMutation.mutate(vehicleData);
  };
  
  // Handle edit form submission
  const onEditSubmit = (data: VehicleFormValues) => {
    if (currentVehicle) {
      updateMutation.mutate({
        id: currentVehicle.id,
        data: data,
      });
    }
  };
  
  // Handle edit button click
  const handleEdit = (vehicle: any) => {
    setCurrentVehicle(vehicle);
    editForm.reset({
      plateNumber: vehicle.plateNumber,
      type: vehicle.type,
    });
    setOpenEditDialog(true);
  };
  
  // Get icon and color for vehicle type
  const getVehicleBadge = (type: VehicleType) => {
    switch (type) {
      case "CAR":
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Car</Badge>;
      case "MOTORCYCLE":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Motorcycle</Badge>;
      case "BIKE":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Bike</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">My Vehicles</h2>
            <p className="text-gray-500">Manage your registered vehicles</p>
          </div>
          <DialogTrigger asChild onClick={() => setOpenAddDialog(true)}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Vehicle
            </Button>
          </DialogTrigger>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                </CardContent>
                <CardFooter>
                  <div className="h-9 bg-gray-200 rounded w-full"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : vehicles && vehicles.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {vehicles.map((vehicle) => (
              <motion.div
                key={vehicle.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-xl">{vehicle.plateNumber}</CardTitle>
                        <CardDescription>
                          Added on {new Date(vehicle.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                      {getVehicleBadge(vehicle.type as VehicleType)}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center">
                      <Car className="h-5 w-5 text-gray-500 mr-2" />
                      <span className="text-sm text-gray-600">{vehicle.type}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(vehicle)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteVehicle(vehicle)}
                      >
                        <Trash className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <div className="rounded-full bg-gray-100 p-3 mb-4">
                <Car className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-1">No Vehicles Found</h3>
              <p className="text-gray-500 text-center mb-4">
                You haven't added any vehicles yet.
              </p>
              <DialogTrigger asChild onClick={() => setOpenAddDialog(true)}>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Your First Vehicle
                </Button>
              </DialogTrigger>
            </CardContent>
          </Card>
        )}

        {/* Add Vehicle Dialog */}
        <Dialog open={openAddDialog} onOpenChange={setOpenAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Vehicle</DialogTitle>
              <DialogDescription>
                Add your vehicle details below. You can add multiple vehicles.
              </DialogDescription>
            </DialogHeader>
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                <FormField
                  control={addForm.control}
                  name="plateNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Plate Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the plate number" {...field} />
                      </FormControl>
                      <FormDescription>
                        Enter your vehicle's license plate number
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vehicle type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CAR">Car</SelectItem>
                          <SelectItem value="MOTORCYCLE">Motorcycle</SelectItem>
                          <SelectItem value="BIKE">Bike</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Select the type of your vehicle
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpenAddDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add Vehicle"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Vehicle Dialog */}
        <Dialog open={openEditDialog} onOpenChange={setOpenEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Vehicle</DialogTitle>
              <DialogDescription>
                Update your vehicle details below.
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form
                onSubmit={editForm.handleSubmit(onEditSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={editForm.control}
                  name="plateNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Plate Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter the plate number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vehicle Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select vehicle type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="CAR">Car</SelectItem>
                          <SelectItem value="MOTORCYCLE">Motorcycle</SelectItem>
                          <SelectItem value="BIKE">Bike</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpenEditDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Are you sure you want to delete this vehicle?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the
                vehicle from your account.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setDeleteVehicle(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                className="bg-red-600 hover:bg-red-700"
                onClick={() => {
                  if (deleteVehicle) {
                    deleteMutation.mutate(deleteVehicle.id);
                  }
                }}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PageTransition>
  );
}
