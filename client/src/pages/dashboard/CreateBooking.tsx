import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { parkingApi, vehicleApi, bookingApi } from "@/lib/api-client";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, addHours } from "date-fns";

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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import PageTransition from "@/components/layout/PageTransition";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Badge } from "@/components/ui/badge";
import { 
  Car, 
  Calendar, 
  MapPin, 
  Loader2, 
  Clock, 
  Info, 
  CreditCard,
  ArrowRight,
  DollarSign
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Parking, Vehicle } from "@/lib/types";

// Form schema for booking
const bookingFormSchema = z.object({
  vehicleId: z.string({
    required_error: "Please select a vehicle",
  }),
  parkingId: z.string({
    required_error: "Please select a parking location",
  }),
  dateRange: z.object({
    from: z.date({
      required_error: "Please select a start date",
    }),
    to: z.date({
      required_error: "Please select an end date",
    }),
  }),
});

type BookingFormValues = z.infer<typeof bookingFormSchema>;

export default function CreateBooking() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [selectedParking, setSelectedParking] = useState<Parking | null>(null);
  const [estimatedCost, setEstimatedCost] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const queryParams = new URLSearchParams(location.search);
  const preselectedParkingId = queryParams.get("parkingId");

  // Fetch user vehicles
  const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
    queryKey: ["vehicles"],
    queryFn: vehicleApi.getAll,
  });

  // Fetch available parkings
  const { data: parkings, isLoading: parkingsLoading } = useQuery({
    queryKey: ["parkings"],
    queryFn: parkingApi.getAll,
  });

  // Create booking form
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      vehicleId: "",
      parkingId: preselectedParkingId || "",
      dateRange: {
        from: new Date(),
        to: addHours(new Date(), 2),
      },
    },
  });

  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: (data: any) => bookingApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userBookings"] });
      toast.success("Booking created successfully!");
      navigate("/dashboard/bookings");
    },
    onError: (error) => {
      toast.error(`Failed to create booking: ${error instanceof Error ? error.message : "Unknown error"}`);
    },
  });

  // Watch for form value changes
  const formValues = form.watch();

  // Set selected parking when parking ID changes
  useEffect(() => {
    if (parkings && formValues.parkingId) {
      const parking = parkings.find((p: Parking) => p.id === formValues.parkingId);
      setSelectedParking(parking || null);
    } else {
      setSelectedParking(null);
    }
  }, [formValues.parkingId, parkings]);

  // Calculate estimated cost when dateRange or parking changes
  useEffect(() => {
    if (selectedParking && formValues.dateRange.from && formValues.dateRange.to) {
      const hoursDiff = 
        (formValues.dateRange.to.getTime() - formValues.dateRange.from.getTime()) / 
        (1000 * 60 * 60);
      
      const cost = hoursDiff * (selectedParking.chargingFeePerHour || 0);
      setEstimatedCost(Math.max(0, cost));
    } else {
      setEstimatedCost(0);
    }
  }, [formValues.dateRange, selectedParking]);

  // Handle form submission
  const onSubmit = (data: BookingFormValues) => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
      return;
    }

    // Format data for API call
    const bookingData = {
      vehicleId: data.vehicleId,
      parkingId: data.parkingId,
      entryTime: data.dateRange.from.toISOString(),
      checkoutTime: data.dateRange.to.toISOString(),
    };

    createBookingMutation.mutate(bookingData);
  };

  // Go back to previous step
  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Get vehicle badge by type
  const getVehicleBadge = (type: string) => {
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
            <h2 className="text-3xl font-bold tracking-tight">Create Booking</h2>
            <p className="text-gray-500">
              Reserve a parking space for your vehicle
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => navigate("/dashboard/bookings")}>
              Cancel
            </Button>
          </div>
        </div>

        {/* Booking Steps */}
        <div className="flex justify-center mb-8">
          <ol className="flex items-center w-full max-w-3xl">
            <li className="flex items-center text-blue-600 dark:text-blue-500 after:content-[''] after:w-full after:h-1 after:border-b after:border-blue-100 after:border-4 after:inline-block">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep >= 1 ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
              }`}>
                <Car className="w-5 h-5" />
              </div>
            </li>
            <li className="flex items-center after:content-[''] after:w-full after:h-1 after:border-b after:border-gray-100 after:border-4 after:inline-block">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep >= 2 ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
              }`}>
                <MapPin className="w-5 h-5" />
              </div>
            </li>
            <li className="flex items-center">
              <div className={`flex items-center justify-center w-10 h-10 rounded-full ${
                currentStep >= 3 ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600"
              }`}>
                <Calendar className="w-5 h-5" />
              </div>
            </li>
          </ol>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {currentStep === 1 && "Select Your Vehicle"}
              {currentStep === 2 && "Select Parking Location"}
              {currentStep === 3 && "Choose Date and Time"}
            </CardTitle>
            <CardDescription>
              {currentStep === 1 && "Choose a vehicle you want to park"}
              {currentStep === 2 && "Select where you want to park your vehicle"}
              {currentStep === 3 && "Schedule when you'll be using the parking space"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="vehicleId"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <div className="space-y-2">
                            <FormLabel>Vehicle</FormLabel>
                            <FormDescription>
                              Select the vehicle you want to park
                            </FormDescription>
                          </div>
                          
                          {vehiclesLoading ? (
                            <div className="space-y-3">
                              {[1, 2].map((i) => (
                                <div key={i} className="flex items-center p-4 border rounded-md animate-pulse">
                                  <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                                  <div className="ml-4 space-y-2 flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : vehicles && vehicles.length > 0 ? (
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="space-y-3"
                              >
                                {vehicles.map((vehicle: Vehicle) => (
                                  <div
                                    key={vehicle.id}
                                    className={`flex items-center p-4 border rounded-md transition-all cursor-pointer ${
                                      field.value === vehicle.id
                                        ? "border-blue-500 bg-blue-50"
                                        : "hover:border-gray-300"
                                    }`}
                                  >
                                    <RadioGroupItem
                                      value={vehicle.id}
                                      id={vehicle.id}
                                      className="sr-only"
                                    />
                                    <label
                                      htmlFor={vehicle.id}
                                      className="flex items-center cursor-pointer flex-1"
                                    >
                                      <div className="rounded-full bg-blue-100 p-2 mr-4">
                                        <Car className="h-5 w-5 text-blue-600" />
                                      </div>
                                      <div>
                                        <div className="font-medium">
                                          {vehicle.plateNumber}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                          {getVehicleBadge(vehicle.type)}
                                        </div>
                                      </div>
                                    </label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </FormControl>
                          ) : (
                            <div className="flex flex-col items-center p-8 border border-dashed rounded-md">
                              <div className="rounded-full bg-gray-100 p-3 mb-3">
                                <Car className="h-6 w-6 text-gray-400" />
                              </div>
                              <h3 className="text-lg font-medium mb-1">No Vehicles Found</h3>
                              <p className="text-sm text-gray-500 mb-4 text-center">
                                You need to add a vehicle before creating a booking
                              </p>
                              <Button
                                type="button"
                                onClick={() => navigate("/dashboard/vehicles")}
                              >
                                Add a Vehicle
                              </Button>
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 2 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="parkingId"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <div className="space-y-2">
                            <FormLabel>Parking Location</FormLabel>
                            <FormDescription>
                              Select where you want to park your vehicle
                            </FormDescription>
                          </div>
                          
                          {parkingsLoading ? (
                            <div className="space-y-3">
                              {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center p-4 border rounded-md animate-pulse">
                                  <div className="rounded-full bg-gray-200 h-10 w-10"></div>
                                  <div className="ml-4 space-y-2 flex-1">
                                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                  </div>
                                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                                </div>
                              ))}
                            </div>
                          ) : parkings && parkings.length > 0 ? (
                            <FormControl>
                              <RadioGroup
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                className="space-y-3"
                              >
                                {parkings.map((parking: Parking) => (
                                  <div
                                    key={parking.id}
                                    className={`flex items-center p-4 border rounded-md transition-all cursor-pointer ${
                                      field.value === parking.id
                                        ? "border-blue-500 bg-blue-50"
                                        : "hover:border-gray-300"
                                    }`}
                                  >
                                    <RadioGroupItem
                                      value={parking.id}
                                      id={parking.id}
                                      className="sr-only"
                                    />
                                    <label
                                      htmlFor={parking.id}
                                      className="flex items-center justify-between cursor-pointer flex-1"
                                    >
                                      <div className="flex items-center">
                                        <div className="rounded-full bg-blue-100 p-2 mr-4">
                                          <MapPin className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                          <div className="font-medium">
                                            {parking.name}
                                          </div>
                                          <div className="text-sm text-gray-500">
                                            {parking.location}
                                          </div>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <div className="font-medium text-blue-600">
                                          ${parking.chargingFeePerHour}/hr
                                        </div>
                                        <div className="text-sm text-gray-500">
                                          {parking.availableSpaces} spaces available
                                        </div>
                                      </div>
                                    </label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </FormControl>
                          ) : (
                            <div className="flex flex-col items-center p-8 border border-dashed rounded-md">
                              <div className="rounded-full bg-gray-100 p-3 mb-3">
                                <MapPin className="h-6 w-6 text-gray-400" />
                              </div>
                              <h3 className="text-lg font-medium mb-1">No Parkings Available</h3>
                              <p className="text-sm text-gray-500 mb-4 text-center">
                                There are no parking locations available at this time
                              </p>
                            </div>
                          )}
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {currentStep === 3 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="dateRange"
                      render={({ field }) => (
                        <FormItem className="space-y-4">
                          <div className="space-y-2">
                            <FormLabel>Date & Time Range</FormLabel>
                            <FormDescription>
                              Select when you'll arrive and leave
                            </FormDescription>
                          </div>
                          <FormControl>
                            <DateRangePicker
                              value={{
                                from: field.value.from,
                                to: field.value.to,
                              }}
                              onChange={(range) => {
                                if (range?.from && range?.to) {
                                  field.onChange({ from: range.from, to: range.to });
                                }
                              }}
                              className="w-full"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Booking Summary */}
                    <div className="mt-8 border rounded-lg p-6 bg-gray-50">
                      <h3 className="text-lg font-medium mb-4">Booking Summary</h3>
                      
                      <div className="space-y-4">
                        {/* Vehicle */}
                        <div className="flex items-start">
                          <Car className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div className="ml-3">
                            <div className="font-medium">Vehicle</div>
                            {vehicles && formValues.vehicleId && (
                              <div className="text-sm text-gray-600">
                                {vehicles.find((v: Vehicle) => v.id === formValues.vehicleId)?.plateNumber || "Unknown"}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        {/* Parking */}
                        <div className="flex items-start">
                          <MapPin className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div className="ml-3">
                            <div className="font-medium">Location</div>
                            {selectedParking && (
                              <>
                                <div className="text-sm text-gray-600">
                                  {selectedParking.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {selectedParking.location}
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Time */}
                        <div className="flex items-start">
                          <Clock className="h-5 w-5 text-gray-500 mt-0.5" />
                          <div className="ml-3">
                            <div className="font-medium">Date & Time</div>
                            {formValues.dateRange.from && formValues.dateRange.to && (
                              <div className="text-sm text-gray-600">
                                {format(formValues.dateRange.from, "PPP p")} - {format(formValues.dateRange.to, "PPP p")}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <Separator className="my-4" />
                        
                        {/* Cost */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <DollarSign className="h-5 w-5 text-gray-500" />
                            <span className="ml-2 font-medium">Estimated Cost</span>
                          </div>
                          <span className="text-xl font-bold">
                            ${estimatedCost.toFixed(2)}
                          </span>
                        </div>
                        
                        {/* Info note */}
                        <div className="flex items-start mt-2 text-sm text-gray-500 bg-blue-50 p-3 rounded-md">
                          <Info className="h-4 w-4 text-blue-500 mt-0.5 mr-2" />
                          <div>
                            Your booking will be reviewed and confirmed by the parking administrator. 
                            Payment will be collected upon checkout.
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex justify-between pt-2">
                  {currentStep > 1 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleBack}
                    >
                      Back
                    </Button>
                  ) : (
                    <div></div>
                  )}

                  <Button
                    type="submit"
                    disabled={
                      (currentStep === 1 && !formValues.vehicleId) ||
                      (currentStep === 2 && !formValues.parkingId) ||
                      createBookingMutation.isPending
                    }
                  >
                    {createBookingMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : currentStep < 3 ? (
                      <>
                        Continue
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </>
                    ) : (
                      "Create Booking"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
