
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { bookingApi } from "@/lib/api-client";
import { format } from "date-fns";
import { motion } from "framer-motion";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import PageTransition from "@/components/layout/PageTransition";
import { 
  Calendar, 
  Car, 
  MapPin, 
  Search, 
  Plus, 
  CreditCard, 
  Loader2, 
  Clock, 
  CheckCircle2, 
  XCircle 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Booking } from "@/lib/types";

export default function UserBookings() {
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Fetch user bookings
  const { data: bookings, isLoading } = useQuery({
    queryKey: ["userBookings"],
    queryFn: bookingApi.getAll,
  });

  // Filter bookings based on status and search
  const filteredBookings = bookings
    ? bookings.filter((booking: Booking) => {
        const matchesStatus = statusFilter 
          ? booking.status === statusFilter
          : true;
        
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = searchQuery
          ? booking.vehicle?.plateNumber?.toLowerCase().includes(searchLower) ||
            booking.slot?.parking?.name?.toLowerCase().includes(searchLower) ||
            booking.slot?.parking?.location?.toLowerCase().includes(searchLower)
          : true;
        
        return matchesStatus && matchesSearch;
      })
    : [];

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

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">My Bookings</h2>
            <p className="text-gray-500">
              View and manage your parking reservations
            </p>
          </div>
          <Link to="/dashboard/bookings/create">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Booking
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Bookings History</CardTitle>
            <CardDescription>
              Track the status of your parking reservations
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search by vehicle or parking location..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="PENDING">Pending</SelectItem>
                  <SelectItem value="APPROVED">Approved</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="CANCELLED">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {isLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-10 bg-gray-200 rounded w-full"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
                <div className="h-10 bg-gray-200 rounded w-full"></div>
              </div>
            ) : filteredBookings.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Vehicle</TableHead>
                      <TableHead className="hidden md:table-cell">Location</TableHead>
                      <TableHead className="hidden lg:table-cell">Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="hidden sm:table-cell">Payment</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="font-medium">
                            {booking.vehicle?.plateNumber || "Unknown Vehicle"}
                          </div>
                          <div className="text-sm text-gray-500 md:hidden">
                            {booking.slot?.parking?.name || "Unknown Parking"}
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          {booking.slot?.parking?.name || "Unknown Parking"}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          {format(new Date(booking.entryTime), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(booking.status)}
                          <div className="text-sm text-gray-500 sm:hidden mt-1">
                            {getPaymentStatusBadge(booking.paymentStatus)}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          {getPaymentStatusBadge(booking.paymentStatus)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Link to={`/dashboard/bookings/${booking.id}`}>
                            <Button variant="outline" size="sm">
                              Details
                            </Button>
                          </Link>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="flex flex-col items-center py-8">
                <div className="rounded-full bg-gray-100 p-3 mb-3">
                  <Calendar className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-1">No Bookings Found</h3>
                <p className="text-sm text-gray-500 mb-4 text-center">
                  {searchQuery || statusFilter
                    ? "No bookings match your filter criteria"
                    : "You haven't made any bookings yet"}
                </p>
                <Link to="/dashboard/bookings/create">
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create New Booking
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Bookings Section */}
        {bookings && bookings.some((booking: Booking) => booking.status === "APPROVED") && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Active Bookings</CardTitle>
                <CardDescription>Currently active parking reservations that require action</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings
                    .filter((booking: Booking) => booking.status === "APPROVED")
                    .map((booking: Booking) => (
                      <Card key={booking.id} className="border shadow-sm">
                        <CardContent className="p-6">
                          <div className="grid gap-6 md:grid-cols-3">
                            <div className="space-y-2">
                              <div className="text-sm font-medium text-gray-500">Vehicle</div>
                              <div className="flex items-center gap-2">
                                <Car className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">
                                  {booking.vehicle?.plateNumber || "Unknown Vehicle"}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500">
                                {booking.vehicle?.type || "Unknown Type"}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="text-sm font-medium text-gray-500">Location</div>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">
                                  {booking.slot?.parking?.name || "Unknown Parking"}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500">
                                Slot #{booking.slot?.number || "Unknown"}
                              </div>
                            </div>

                            <div className="space-y-2">
                              <div className="text-sm font-medium text-gray-500">Time</div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-4 w-4 text-gray-400" />
                                <span className="font-medium">
                                  {format(new Date(booking.entryTime), "MMM d, h:mm a")}
                                </span>
                              </div>
                              <div className="text-sm text-gray-500">
                                Until {booking.checkoutTime 
                                  ? format(new Date(booking.checkoutTime), "MMM d, h:mm a")
                                  : "Check-out pending"
                                }
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between mt-6">
                            <div className="flex items-center gap-2">
                              <CreditCard className="h-5 w-5 text-gray-400" />
                              <div>
                                <span className="font-medium">${booking.amount.toFixed(2)}</span>
                                <span className="text-gray-500 mx-1">•</span>
                                {getPaymentStatusBadge(booking.paymentStatus)}
                              </div>
                            </div>
                            <Link to={`/dashboard/bookings/${booking.id}`}>
                              <Button>
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Checkout
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
