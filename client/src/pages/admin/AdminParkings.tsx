import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { parkingApi } from "@/lib/api-client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Parking, CreateParking } from "@/lib/types";
import { PlusCircle, Edit, Trash2, MapPin, Tag, DollarSign } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import PageTransition from "@/components/layout/PageTransition";

const parkingFormSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  location: z.string().min(5, "Location must be at least 5 characters"),
  totalSpaces: z.coerce.number().int().min(1, "Must have at least 1 space"),
  chargingFeePerHour: z.coerce.number().min(0, "Fee cannot be negative")
});

type ParkingFormValues = z.infer<typeof parkingFormSchema>;

export default function AdminParkings() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedParking, setSelectedParking] = useState<Parking | null>(null);

  const queryClient = useQueryClient();

  // Fetch parkings
  const { data: parkings, isLoading } = useQuery({
    queryKey: ["parkings"],
    queryFn: parkingApi.getAll,
  });

  // Create parking form
  const createForm = useForm<ParkingFormValues>({
    resolver: zodResolver(parkingFormSchema),
    defaultValues: {
      name: "",
      location: "",
      totalSpaces: 10,
      chargingFeePerHour: 5,
    },
  });

  // Edit parking form
  const editForm = useForm<ParkingFormValues>({
    resolver: zodResolver(parkingFormSchema),
    defaultValues: {
      name: "",
      location: "",
      totalSpaces: 10,
      chargingFeePerHour: 5,
    },
  });

  // Create parking mutation
  const createMutation = useMutation({
    mutationFn: (data: CreateParking) => parkingApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parkings"] });
      toast.success("Parking created successfully!");
      setIsCreateDialogOpen(false);
      createForm.reset();
    },
    onError: (error) => {
      toast.error("Failed to create parking. Please try again.");
      console.error(error);
    },
  });

  // Update parking mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Parking> }) => 
      parkingApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parkings"] });
      toast.success("Parking updated successfully!");
      setIsEditDialogOpen(false);
      setSelectedParking(null);
    },
    onError: (error) => {
      toast.error("Failed to update parking. Please try again.");
      console.error(error);
    },
  });

  // Delete parking mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => parkingApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parkings"] });
      toast.success("Parking deleted successfully!");
      setIsDeleteDialogOpen(false);
      setSelectedParking(null);
    },
    onError: (error) => {
      toast.error("Failed to delete parking. Please try again.");
      console.error(error);
    },
  });

  // Handle create form submission
  const onCreateSubmit = (data: ParkingFormValues) => {
    const createData: CreateParking = {
      name: data.name,
      location: data.location,
      totalSpaces: data.totalSpaces,
      chargingFeePerHour: data.chargingFeePerHour
    };
    createMutation.mutate(createData);
  };

  // Handle edit form submission
  const onEditSubmit = (data: ParkingFormValues) => {
    if (selectedParking) {
      updateMutation.mutate({
        id: selectedParking.id,
        data,
      });
    }
  };

  // Handle delete confirmation
  const onDeleteConfirm = () => {
    if (selectedParking) {
      deleteMutation.mutate(selectedParking.id);
    }
  };

  // Open edit dialog and populate form
  const handleEditClick = (parking: Parking) => {
    setSelectedParking(parking);
    editForm.reset({
      name: parking.name,
      location: parking.location,
      totalSpaces: parking.totalSpaces,
      chargingFeePerHour: parking.chargingFeePerHour,
    });
    setIsEditDialogOpen(true);
  };

  // Open delete dialog
  const handleDeleteClick = (parking: Parking) => {
    setSelectedParking(parking);
    setIsDeleteDialogOpen(true);
  };

  const isPending = createMutation.isPending || updateMutation.isPending || deleteMutation.isPending;

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Manage Parkings</h2>
            <p className="text-gray-500">
              Create, update, and manage parking locations
            </p>
          </div>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Parking
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="h-6 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parkings?.length ? (
              parkings.map((parking) => (
                <motion.div
                  key={parking.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle>{parking.name}</CardTitle>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEditClick(parking)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="text-red-500"
                            onClick={() => handleDeleteClick(parking)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>Code: {parking.code}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{parking.location}</span>
                        </div>
                        <div className="flex items-center">
                          <Tag className="h-4 w-4 mr-2 text-gray-500" />
                          <span>
                            {parking.availableSpaces} / {parking.totalSpaces}{" "}
                            spaces available
                          </span>
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
                          <span>${parking.chargingFeePerHour.toFixed(2)} / hour</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-500">No parking locations found.</p>
                <p className="text-gray-500 text-sm">
                  Click the "Add Parking" button to create one.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Create Parking Dialog */}
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Parking</DialogTitle>
              <DialogDescription>
                Add a new parking location to the system
              </DialogDescription>
            </DialogHeader>
            <Form {...createForm}>
              <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                <FormField
                  control={createForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter parking name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={createForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter location address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={createForm.control}
                    name="totalSpaces"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Spaces</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="chargingFeePerHour"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fee per Hour ($)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    disabled={isPending || !createForm.formState.isValid}
                  >
                    {createMutation.isPending ? "Creating..." : "Create Parking"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Parking Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Parking</DialogTitle>
              <DialogDescription>
                Update parking location information
              </DialogDescription>
            </DialogHeader>
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter parking name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter location address" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={editForm.control}
                    name="totalSpaces"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Total Spaces</FormLabel>
                        <FormControl>
                          <Input type="number" min="1" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
                    name="chargingFeePerHour"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fee per Hour ($)</FormLabel>
                        <FormControl>
                          <Input type="number" min="0" step="0.01" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <DialogFooter>
                  <DialogClose asChild>
                    <Button variant="outline">Cancel</Button>
                  </DialogClose>
                  <Button
                    type="submit"
                    disabled={isPending || !editForm.formState.isValid}
                  >
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Delete Parking Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Parking</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete this parking location?
                This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              {selectedParking && (
                <div className="space-y-2">
                  <p>
                    <span className="font-medium">Name:</span> {selectedParking.name}
                  </p>
                  <p>
                    <span className="font-medium">Location:</span>{" "}
                    {selectedParking.location}
                  </p>
                  <p>
                    <span className="font-medium">Spaces:</span>{" "}
                    {selectedParking.totalSpaces}
                  </p>
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button
                variant="destructive"
                onClick={onDeleteConfirm}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete Parking"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </PageTransition>
  );
}
