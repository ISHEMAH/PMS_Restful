import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bookingApi } from "@/lib/api-client";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Booking } from "@/lib/types";
import {
  Calendar,
  CheckCircle,
  Clock,
  Filter,
  Search,
  Trash2,
  User,
  XCircle,
} from "lucide-react";
import PageTransition from "@/components/layout/PageTransition";

export default function AdminBookings() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isApproveDialogOpen, setIsApproveDialogOpen] = useState(false);
  const [isDeclineDialogOpen, setIsDeclineDialogOpen] = useState(false);

  const queryClient = useQueryClient();

  // Fetch bookings
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["adminBookings"],
    queryFn: bookingApi.adminGetAll,
  });

  // Approve booking mutation
  const approveMutation = useMutation({
    mutationFn: (bookingId: string) => bookingApi.approve(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBookings"] });
      toast.success("Booking approved successfully!");
      setIsApproveDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to approve booking. Please try again.");
      console.error(error);
    },
  });

  // Decline booking mutation
  const declineMutation = useMutation({
    mutationFn: (bookingId: string) => bookingApi.decline(bookingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminBookings"] });
      toast.success("Booking declined successfully!");
      setIsDeclineDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Failed to decline booking. Please try again.");
      console.error(error);
    },
  });

  // Filter and sort bookings
  const filteredBookings = bookings
    ? bookings
        .filter((booking) => {
          const matchesSearch =
            (booking.vehicle?.plateNumber || "")
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            (booking.userId || "")
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            (booking.slot?.number?.toString() || "").includes(searchTerm);

          const matchesStatus =
            statusFilter === "all" || booking.status === statusFilter;

          return matchesSearch && matchesStatus;
        })
        .sort(
          (a, b) =>
            new Date(b.entryTime).getTime() - new Date(a.entryTime).getTime()
        )
    : [];

  // Handlers
  const handleApprove = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsApproveDialogOpen(true);
  };

  const handleDecline = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsDeclineDialogOpen(true);
  };

  const confirmApprove = () => {
    if (selectedBooking) {
      approveMutation.mutate(selectedBooking.id);
    }
  };

  const confirmDecline = () => {
    if (selectedBooking) {
      declineMutation.mutate(selectedBooking.id);
    }
  };

  // Status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "COMPLETED":
        return "bg-blue-100 text-blue-800";
      case "CANCELLED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-100 text-green-800";
      case "UNPAID":
        return "bg-red-100 text-red-800";
      case "PENDING":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Check if a mutation is in progress
  const isApproveLoading = approveMutation.isPending;
  const isDeclineLoading = declineMutation.isPending;

  return (
    <PageTransition>
      <div className="space-y-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Manage Bookings</h2>
          <p className="text-gray-500">
            Approve, decline, and manage all parking bookings
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>All Bookings</CardTitle>
            <CardDescription>
              View and manage all parking bookings in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="relative flex-grow">
                <Input
                  placeholder="Search by vehicle plate, user ID, or slot number"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
              <div className="flex gap-4">
                <div className="relative inline-block">
                  <Select
                    value={statusFilter}
                    onValueChange={setStatusFilter}
                  >
                    <SelectTrigger className="w-[180px]">
                      <span className="flex items-center">
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by status" />
                      </span>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="PENDING">Pending</SelectItem>
                      <SelectItem value="APPROVED">Approved</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="CANCELLED">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="rounded-md border">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        User/Vehicle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Slot
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Payment
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {isLoading ? (
                      Array.from({ length: 5 }).map((_, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-5 bg-gray-200 rounded w-32 animate-pulse mb-1"></div>
                            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-5 bg-gray-200 rounded w-10 animate-pulse"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-5 bg-gray-200 rounded w-32 animate-pulse"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-6 bg-gray-200 rounded w-16 animate-pulse mb-1"></div>
                            <div className="h-4 bg-gray-200 rounded w-12 animate-pulse"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
                          </td>
                        </tr>
                      ))
                    ) : filteredBookings.length > 0 ? (
                      filteredBookings.map((booking, index) => (
                        <motion.tr
                          key={booking.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="hover:bg-gray-50"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div>
                                <div className="text-sm font-medium text-gray-900 flex items-center">
                                  <User className="h-3 w-3 mr-1" />
                                  <span>{booking.userId.slice(0, 8)}...</span>
                                </div>
                                <div className="text-sm text-gray-500 flex items-center mt-1">
                                  <span>{booking.vehicle?.plateNumber}</span>
                                  <span className="ml-1 text-xs">({booking.vehicle?.type})</span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {booking.slot?.number}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              <span>
                                {new Date(booking.entryTime).toLocaleString()}
                              </span>
                            </div>
                            {booking.checkoutTime && (
                              <div className="text-xs text-gray-500 mt-1">
                                to{" "}
                                {new Date(booking.checkoutTime).toLocaleString()}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                                booking.status
                              )}`}
                            >
                              {booking.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(
                                booking.paymentStatus
                              )}`}
                            >
                              {booking.paymentStatus}
                            </span>
                            {booking.amount > 0 && (
                              <div className="text-sm text-gray-500 mt-1">
                                ${booking.amount.toFixed(2)}
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <div className="flex space-x-2">
                              {booking.status === "PENDING" && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-500 hover:text-red-600"
                                    onClick={() => handleDecline(booking)}
                                  >
                                    <XCircle className="h-4 w-4 mr-1" />
                                    Decline
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleApprove(booking)}
                                  >
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                    Approve
                                  </Button>
                                </>
                              )}
                              <Button variant="outline" size="sm" asChild>
                                <Link
                                  to={`/admin/bookings/${booking.id}`}
                                  className="flex items-center"
                                >
                                  <Calendar className="h-4 w-4 mr-1" />
                                  Details
                                </Link>
                              </Button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-10 text-center text-gray-500"
                        >
                          No bookings found matching your filters.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Approve Dialog */}
        {selectedBooking && (
          <Dialog open={isApproveDialogOpen} onOpenChange={setIsApproveDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Approve Booking</DialogTitle>
                <DialogDescription>
                  Are you sure you want to approve this booking?
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Vehicle</p>
                    <p className="text-base">
                      {selectedBooking.vehicle?.plateNumber} (
                      {selectedBooking.vehicle?.type})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">User ID</p>
                    <p className="text-base">
                      {selectedBooking.userId.slice(0, 8)}...
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Slot</p>
                    <p className="text-base">{selectedBooking.slot?.number}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Entry Time
                    </p>
                    <p className="text-base">
                      {new Date(selectedBooking.entryTime).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={confirmApprove} disabled={isApproveLoading}>
                  {isApproveLoading ? "Approving..." : "Approve Booking"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {/* Decline Dialog */}
        {selectedBooking && (
          <Dialog open={isDeclineDialogOpen} onOpenChange={setIsDeclineDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Decline Booking</DialogTitle>
                <DialogDescription>
                  Are you sure you want to decline this booking?
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Vehicle</p>
                    <p className="text-base">
                      {selectedBooking.vehicle?.plateNumber} (
                      {selectedBooking.vehicle?.type})
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">User ID</p>
                    <p className="text-base">
                      {selectedBooking.userId.slice(0, 8)}...
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">Slot</p>
                    <p className="text-base">{selectedBooking.slot?.number}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Entry Time
                    </p>
                    <p className="text-base">
                      {new Date(selectedBooking.entryTime).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button
                  variant="destructive"
                  onClick={confirmDecline}
                  disabled={isDeclineLoading}
                >
                  {isDeclineLoading ? "Declining..." : "Decline Booking"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </PageTransition>
  );
}
