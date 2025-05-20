import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { bookingApi } from "@/lib/api-client";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateRangePicker } from "@/components/ui/date-range-picker";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PageTransition from "@/components/layout/PageTransition";
import {
  Calendar,
  Car,
  Clock,
  Download,
  Filter,
  Loader2,
  MapPin,
  Receipt,
  Search,
} from "lucide-react";
import { DateRange } from "react-day-picker";

// Filter options
const statusFilters = [
  { label: "All Statuses", value: "" },
  { label: "Completed", value: "COMPLETED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default function ParkingHistory() {
  // State for filters
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  // Fetch booking history
  const {
    data: bookings,
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ["bookingHistory", statusFilter, dateRange],
    queryFn: () => bookingApi.getHistory(dateRange?.from?.toISOString(), dateRange?.to?.toISOString()),
  });

  // Filter bookings based on search query
  const filteredBookings = bookings
    ? bookings.filter((booking: any) => {
        // Filter by search query
        const searchLower = searchQuery.toLowerCase();
        const matchesSearch = searchQuery
          ? booking.vehicle?.plateNumber?.toLowerCase().includes(searchLower) ||
            booking.slot?.parking?.name?.toLowerCase().includes(searchLower) ||
            booking.slot?.parking?.location?.toLowerCase().includes(searchLower)
          : true;

        return matchesSearch;
      })
    : [];

  // Calculate total spent
  const totalSpent = filteredBookings.reduce(
    (total: number, booking: any) => total + (booking.amount || 0),
    0
  );

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

  // Calculate parking duration in hours
  const calculateDuration = (entryTime: string, checkoutTime: string | null) => {
    if (!checkoutTime) return "-";
    
    const entry = new Date(entryTime);
    const checkout = new Date(checkoutTime);
    const durationHours = (checkout.getTime() - entry.getTime()) / (1000 * 60 * 60);
    
    return durationHours.toFixed(1) + " hours";
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Parking History</h2>
            <p className="text-gray-500">
              View and manage your past parking activities
            </p>
          </div>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export History
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Bookings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-2xl font-bold">
                    {isLoading ? "-" : filteredBookings.length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Total Amount Spent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Receipt className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-2xl font-bold">
                    {isLoading ? "-" : `$${totalSpent.toFixed(2)}`}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-500">
                  Average Duration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-2xl font-bold">
                    {isLoading || filteredBookings.length === 0
                      ? "-"
                      : (
                          filteredBookings.reduce((total: number, booking: any) => {
                            if (!booking.checkoutTime) return total;
                            const entryTime = new Date(booking.entryTime).getTime();
                            const checkoutTime = new Date(booking.checkoutTime).getTime();
                            return total + (checkoutTime - entryTime) / (1000 * 60 * 60);
                          }, 0) / filteredBookings.filter((b: any) => b.checkoutTime).length
                        ).toFixed(1) + "h"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Booking History</CardTitle>
            <CardDescription>
              View all your past and completed bookings
            </CardDescription>
            <div className="flex flex-col md:flex-row gap-4 mt-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search by vehicle or parking location..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2 flex-col sm:flex-row">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusFilters.map((filter) => (
                      <SelectItem key={filter.value} value={filter.value}>
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <DateRangePicker
                  value={dateRange || { from: undefined, to: undefined }}
                  onChange={(newDateRange) => setDateRange(newDateRange)}
                  className="w-full sm:w-[250px]"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">Loading booking history...</p>
              </div>
            ) : isError ? (
              <div className="text-center py-8 text-red-500">
                Error loading bookings: {error instanceof Error ? error.message : "Unknown error"}
              </div>
            ) : filteredBookings.length === 0 ? (
              <div className="text-center py-8">
                <div className="rounded-full bg-gray-100 p-3 mx-auto w-fit mb-3">
                  <Calendar className="h-6 w-6 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-1">No Bookings Found</h3>
                <p className="text-sm text-gray-500 mb-4 text-center">
                  {searchQuery || statusFilter || dateRange.from
                    ? "No bookings match your filter criteria"
                    : "You haven't made any bookings yet"}
                </p>
                <Link to="/dashboard/bookings/create">
                  <Button>Create New Booking</Button>
                </Link>
              </div>
            ) : (
              <Tabs defaultValue="table" className="w-full">
                <div className="flex justify-end mb-4">
                  <TabsList>
                    <TabsTrigger value="table">Table</TabsTrigger>
                    <TabsTrigger value="cards">Cards</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="table" className="w-full">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Vehicle</TableHead>
                          <TableHead className="hidden md:table-cell">Location</TableHead>
                          <TableHead className="hidden lg:table-cell">Duration</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="hidden sm:table-cell">Payment</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredBookings.map((booking: any) => (
                          <TableRow key={booking.id}>
                            <TableCell>
                              <div className="font-medium">
                                {format(new Date(booking.entryTime), "MMM d, yyyy")}
                              </div>
                              <div className="text-sm text-gray-500">
                                {format(new Date(booking.entryTime), "h:mm a")}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="font-medium">
                                {booking.vehicle?.plateNumber || "Unknown"}
                              </div>
                              <div className="text-xs text-gray-500 md:hidden">
                                {booking.slot?.parking?.name || "Unknown Location"}
                              </div>
                            </TableCell>
                            <TableCell className="hidden md:table-cell">
                              {booking.slot?.parking?.name || "Unknown"}
                            </TableCell>
                            <TableCell className="hidden lg:table-cell">
                              {calculateDuration(booking.entryTime, booking.checkoutTime)}
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
                              <div className="font-medium">
                                ${booking.amount?.toFixed(2) || "-"}
                              </div>
                              <div className="text-xs text-gray-500 lg:hidden">
                                {calculateDuration(booking.entryTime, booking.checkoutTime)}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </TabsContent>
                
                <TabsContent value="cards">
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filteredBookings.map((booking: any) => (
                      <motion.div
                        key={booking.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Card>
                          <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <CardTitle className="text-base">{format(new Date(booking.entryTime), "MMM d, yyyy")}</CardTitle>
                                <CardDescription>
                                  {format(new Date(booking.entryTime), "h:mm a")} - {booking.checkoutTime ? format(new Date(booking.checkoutTime), "h:mm a") : "N/A"}
                                </CardDescription>
                              </div>
                              {getStatusBadge(booking.status)}
                            </div>
                          </CardHeader>
                          <CardContent className="pb-2 pt-0">
                            <div className="space-y-3">
                              <div className="flex items-center text-sm">
                                <Car className="h-4 w-4 text-gray-400 mr-2" />
                                <span className="font-medium">
                                  {booking.vehicle?.plateNumber || "Unknown Vehicle"}
                                </span>
                              </div>
                              <div className="flex items-center text-sm">
                                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                                <span>
                                  {booking.slot?.parking?.name || "Unknown Location"}
                                </span>
                              </div>
                              <div className="flex items-center text-sm">
                                <Clock className="h-4 w-4 text-gray-400 mr-2" />
                                <span>
                                  {calculateDuration(booking.entryTime, booking.checkoutTime)}
                                </span>
                              </div>
                              <div className="flex justify-between items-center pt-2">
                                <div className="flex items-center">
                                  <Receipt className="h-4 w-4 text-gray-400 mr-2" />
                                  <span className="font-medium">
                                    ${booking.amount?.toFixed(2) || "-"}
                                  </span>
                                </div>
                                {getPaymentStatusBadge(booking.paymentStatus)}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </motion.div>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}
