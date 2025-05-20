
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingApi } from "@/lib/api-client";
import { format } from "date-fns";
import { toast } from "sonner";
import { motion } from "framer-motion";

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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import PageTransition from "@/components/layout/PageTransition";
import { 
  ArrowLeft, 
  Calendar, 
  Car, 
  MapPin, 
  Clock, 
  CreditCard, 
  CheckCircle2, 
  Loader2,
  Receipt,
  Info
} from "lucide-react";

export default function BookingDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isCheckoutConfirmOpen, setIsCheckoutConfirmOpen] = useState(false);

  // Fetch booking details
  const { 
    data: booking, 
    isLoading, 
    isError, 
    error 
  } = useQuery({
    queryKey: ["booking", id],
    queryFn: () => bookingApi.getById(id as string),
    enabled: !!id,
  });

  // Checkout mutation
  const checkoutMutation = useMutation({
    mutationFn: () => bookingApi.checkout(id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking", id] });
      queryClient.invalidateQueries({ queryKey: ["userBookings"] });
      toast.success("Successfully checked out from parking");
      setIsCheckoutConfirmOpen(false);
    },
    onError: (error) => {
      toast.error(`Checkout failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    },
  });

  // Cancel booking mutation
  const cancelMutation = useMutation({
    mutationFn: () => bookingApi.cancel(id as string),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["booking", id] });
      queryClient.invalidateQueries({ queryKey: ["userBookings"] });
      toast.success("Booking cancelled successfully");
      navigate("/dashboard/bookings");
    },
    onError: (error) => {
      toast.error(`Cancellation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
    },
  });

  // Get booking status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Pending
          </Badge>
        );
      case "APPROVED":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Approved
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge className="bg-blue-100 text-blue-800 border-blue-200">
            Completed
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Cancelled
          </Badge>
        );
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Get payment status badge
  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            Paid
          </Badge>
        );
      case "PENDING":
        return (
          <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
            Pending
          </Badge>
        );
      case "UNPAID":
        return (
          <Badge className="bg-red-100 text-red-800 border-red-200">
            Unpaid
          </Badge>
        );
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  // Handle checkout
  const handleCheckout = () => {
    checkoutMutation.mutate();
  };

  // Handle cancellation
  const handleCancel = () => {
    cancelMutation.mutate();
  };

  if (isLoading) {
    return (
      <PageTransition>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-10 w-24" />
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-60" />
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full" />
            </CardFooter>
          </Card>
        </div>
      </PageTransition>
    );
  }

  if (isError || !booking) {
    return (
      <PageTransition>
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-500">Error Loading Booking</CardTitle>
            <CardDescription>
              Could not load booking details. {error instanceof Error ? error.message : "Unknown error"}
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => navigate("/dashboard/bookings")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bookings
            </Button>
          </CardFooter>
        </Card>
      </PageTransition>
    );
  }

  const canCheckout = booking.status === "APPROVED";
  const canCancel = booking.status === "PENDING" || booking.status === "APPROVED";
  const isPending = booking.status === "PENDING";
  const isCompleted = booking.status === "COMPLETED";
  const isCancelled = booking.status === "CANCELLED";

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <Button
              variant="link"
              className="p-0 -ml-3 mb-1"
              onClick={() => navigate("/dashboard/bookings")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Bookings
            </Button>
            <h2 className="text-3xl font-bold tracking-tight">Booking Details</h2>
            <p className="text-gray-500">View and manage your parking reservation</p>
          </div>
          <div className="flex items-center gap-3">
            {getStatusBadge(booking.status)}
            {canCancel && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline">Cancel Booking</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Cancel this booking?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently cancel your booking.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>No, keep booking</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700"
                      onClick={handleCancel}
                      disabled={cancelMutation.isPending}
                    >
                      {cancelMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Cancelling...
                        </>
                      ) : (
                        "Yes, cancel booking"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
            {canCheckout && (
              <AlertDialog open={isCheckoutConfirmOpen} onOpenChange={setIsCheckoutConfirmOpen}>
                <AlertDialogTrigger asChild>
                  <Button>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Checkout
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Checkout from parking?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will mark your booking as completed and calculate the final parking fee.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleCheckout}
                      disabled={checkoutMutation.isPending}
                    >
                      {checkoutMutation.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Checkout"
                      )}
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Booking Information</CardTitle>
              <CardDescription>
                Booking ID: {booking.id}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Booking Status */}
              <div className="flex flex-col md:flex-row md:gap-8">
                <div className="w-full md:w-1/2 space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Status</h3>
                    <div className="flex items-center gap-3 p-4 rounded-lg bg-gray-50">
                      <div className="space-y-1 flex-1">
                        <div className="text-sm text-gray-500">Booking Status</div>
                        <div className="font-medium flex items-center gap-2">
                          {getStatusBadge(booking.status)}
                          {isPending && (
                            <span className="text-sm text-gray-500">
                              Awaiting approval from admin
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1 flex-1">
                        <div className="text-sm text-gray-500">Payment Status</div>
                        <div className="font-medium">
                          {getPaymentStatusBadge(booking.paymentStatus)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="w-full md:w-1/2 space-y-4 mt-4 md:mt-0">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Pricing</h3>
                    <div className="p-4 rounded-lg bg-gray-50 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-500">Rate</span>
                        <span className="font-medium">
                          ${booking.slot?.parking?.chargingFeePerHour?.toFixed(2)}/hr
                        </span>
                      </div>
                      {isCompleted && (
                        <>
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-500">Duration</span>
                            <span className="font-medium">
                              {/* Calculate duration based on entry and checkout time */}
                              {booking.checkoutTime &&
                                Math.ceil(
                                  (new Date(booking.checkoutTime).getTime() -
                                    new Date(booking.entryTime).getTime()) /
                                    (1000 * 60 * 60)
                                )}{" "}
                              hours
                            </span>
                          </div>
                          <Separator className="my-2" />
                          <div className="flex justify-between items-center">
                            <span className="font-medium">Total Amount</span>
                            <span className="text-lg font-bold">
                              ${booking.amount.toFixed(2)}
                            </span>
                          </div>
                        </>
                      )}
                      {!isCompleted && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">Estimated Amount</span>
                          <span className="font-medium">
                            ${booking.amount.toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Details */}
              <div>
                <h3 className="text-lg font-medium mb-4">Details</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  {/* Vehicle Information */}
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Car className="h-5 w-5 text-gray-500" />
                        <CardTitle className="text-base">Vehicle</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Plate Number</dt>
                          <dd className="font-medium">{booking.vehicle?.plateNumber}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Type</dt>
                          <dd className="font-medium">{booking.vehicle?.type}</dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>

                  {/* Parking Information */}
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-gray-500" />
                        <CardTitle className="text-base">Parking Location</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Name</dt>
                          <dd className="font-medium">{booking.slot?.parking?.name}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Location</dt>
                          <dd className="font-medium">{booking.slot?.parking?.location}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Slot</dt>
                          <dd className="font-medium">#{booking.slot?.number}</dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>

                  {/* Time Information */}
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-gray-500" />
                        <CardTitle className="text-base">Time</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Entry Time</dt>
                          <dd className="font-medium">
                            {format(new Date(booking.entryTime), "PPP p")}
                          </dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Checkout Time</dt>
                          <dd className="font-medium">
                            {booking.checkoutTime
                              ? format(new Date(booking.checkoutTime), "PPP p")
                              : "Not checked out yet"}
                          </dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>

                  {/* Payment Information */}
                  <Card>
                    <CardHeader className="pb-2">
                      <div className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5 text-gray-500" />
                        <CardTitle className="text-base">Payment</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <dl className="space-y-2">
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Status</dt>
                          <dd>{getPaymentStatusBadge(booking.paymentStatus)}</dd>
                        </div>
                        <div className="flex justify-between">
                          <dt className="text-sm text-gray-500">Amount</dt>
                          <dd className="font-medium">${booking.amount.toFixed(2)}</dd>
                        </div>
                        {booking.paymentMethod && (
                          <div className="flex justify-between">
                            <dt className="text-sm text-gray-500">Method</dt>
                            <dd className="font-medium">{booking.paymentMethod}</dd>
                          </div>
                        )}
                      </dl>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Notes or instructions */}
              {isPending && (
                <div className="flex items-start p-4 rounded-lg bg-blue-50 text-blue-800 border border-blue-100">
                  <Info className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">Your booking is pending approval</p>
                    <p>An administrator will review and approve your booking shortly. You'll be notified when the status changes.</p>
                  </div>
                </div>
              )}

              {isCompleted && (
                <div className="flex items-start p-4 rounded-lg bg-green-50 text-green-800 border border-green-100">
                  <Receipt className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">Booking completed</p>
                    <p>Thank you for using our parking service. We hope to see you again soon!</p>
                  </div>
                </div>
              )}

              {isCancelled && (
                <div className="flex items-start p-4 rounded-lg bg-red-50 text-red-800 border border-red-100">
                  <Info className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium">Booking cancelled</p>
                    <p>This booking has been cancelled and is no longer active.</p>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => navigate("/dashboard/bookings")}
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Bookings
              </Button>
              {canCheckout && (
                <Button
                  onClick={() => setIsCheckoutConfirmOpen(true)}
                  disabled={checkoutMutation.isPending}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  Checkout
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
}
