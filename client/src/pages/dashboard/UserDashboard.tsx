
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { parkingApi, bookingApi } from "@/lib/api-client";
import { format } from "date-fns";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import PageTransition from "@/components/layout/PageTransition";
import { useAuthStore } from "@/lib/auth-store";
import { Car, Calendar, MapPin, Clock, ChevronRight, Plus } from "lucide-react";
import { Booking } from "@/lib/types";

export default function UserDashboard() {
  const { user } = useAuthStore();
  const [timeFilter, setTimeFilter] = useState<string>("all");

  // Fetch available parkings
  const { data: parkings, isLoading: parkingsLoading } = useQuery({
    queryKey: ["parkings"],
    queryFn: parkingApi.getAll,
  });

  // Fetch user bookings
  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["userBookings"],
    queryFn: bookingApi.getAll,
  });

  // Filter recent bookings
  const recentBookings = bookings
    ? bookings.filter((booking: Booking) => 
        booking.status !== "COMPLETED" && booking.status !== "CANCELLED"
      ).slice(0, 3)
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

  return (
    <PageTransition>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="space-y-2">
          <motion.h2
            className="text-3xl font-bold tracking-tight"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            Welcome back, {user?.firstName || "User"}!
          </motion.h2>
          <motion.p
            className="text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            Manage your parking reservations and vehicles
          </motion.p>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
        >
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
            <Link to="/dashboard/bookings/create">
              <Card className="hover:border-primary hover:shadow-md transition-all cursor-pointer h-full">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                  <div className="rounded-full bg-primary/10 p-3 mb-3">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-sm font-medium">New Booking</div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/dashboard/bookings">
              <Card className="hover:border-primary hover:shadow-md transition-all cursor-pointer h-full">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                  <div className="rounded-full bg-primary/10 p-3 mb-3">
                    <Calendar className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-sm font-medium">My Bookings</div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/dashboard/vehicles">
              <Card className="hover:border-primary hover:shadow-md transition-all cursor-pointer h-full">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                  <div className="rounded-full bg-primary/10 p-3 mb-3">
                    <Car className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-sm font-medium">My Vehicles</div>
                </CardContent>
              </Card>
            </Link>
            <Link to="/">
              <Card className="hover:border-primary hover:shadow-md transition-all cursor-pointer h-full">
                <CardContent className="p-4 flex flex-col items-center justify-center text-center h-full">
                  <div className="rounded-full bg-primary/10 p-3 mb-3">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-sm font-medium">Find Parking</div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </motion.div>

        {/* Active Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Active Bookings</CardTitle>
                <CardDescription>
                  Your ongoing and upcoming parking reservations
                </CardDescription>
              </div>
              <Link to="/dashboard/bookings">
                <Button variant="ghost" className="h-8 gap-1">
                  <span>View All</span>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="space-y-4">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse flex items-center justify-between border-b last:border-0 pb-4 last:pb-0"
                    >
                      <div className="space-y-2">
                        <div className="h-5 bg-gray-200 rounded w-32"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                      </div>
                      <div className="h-8 bg-gray-200 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              ) : recentBookings.length > 0 ? (
                <div className="space-y-4">
                  {recentBookings.map((booking: Booking) => (
                    <div
                      key={booking.id}
                      className="flex flex-col sm:flex-row sm:items-center justify-between border-b last:border-0 pb-4 last:pb-0"
                    >
                      <div className="space-y-1">
                        <div className="font-medium flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-500" />
                          {booking.slot?.parking?.name || "Parking Location"}
                        </div>
                        <div className="text-sm flex items-center gap-2">
                          <Car className="h-4 w-4 text-gray-500" />
                          {booking.vehicle?.plateNumber || "Vehicle"}
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          {format(new Date(booking.entryTime), "PPP p")}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        {getStatusBadge(booking.status)}
                        <Link to={`/dashboard/bookings/${booking.id}`}>
                          <Button variant="outline" size="sm">
                            Details
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8">
                  <div className="rounded-full bg-gray-100 p-3 mb-3">
                    <Calendar className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No Active Bookings</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    You don't have any active bookings at the moment
                  </p>
                  <Link to="/dashboard/bookings/create">
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create New Booking
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Available Parkings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Available Parkings</CardTitle>
              <CardDescription>
                Find available parking spots for your vehicle
              </CardDescription>
            </CardHeader>
            <CardContent>
              {parkingsLoading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse border rounded-lg p-4"
                    >
                      <div className="h-5 bg-gray-200 rounded w-32 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-40 mb-4"></div>
                      <div className="h-8 bg-gray-200 rounded w-full"></div>
                    </div>
                  ))}
                </div>
              ) : parkings && parkings.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {parkings.map((parking) => (
                    <Card key={parking.id} className="border">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base">{parking.name}</CardTitle>
                        <CardDescription className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {parking.location}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2 pt-0">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Available:</span>{" "}
                            <span className="font-medium">{parking.availableSpaces} spots</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Rate:</span>{" "}
                            <span className="font-medium">${parking.chargingFeePerHour}/hr</span>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Link to={`/dashboard/bookings/create?parkingId=${parking.id}`} className="w-full">
                          <Button className="w-full" variant="outline">
                            Book Now
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center py-8">
                  <div className="rounded-full bg-gray-100 p-3 mb-3">
                    <MapPin className="h-6 w-6 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-1">No Parkings Available</h3>
                  <p className="text-sm text-gray-500 mb-4">
                    There are no parking locations available at the moment
                  </p>
                </div>
              )}
            </CardContent>
            <CardFooter>
              <Link to="/dashboard/bookings/create" className="w-full">
                <Button className="w-full">Create New Booking</Button>
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </PageTransition>
  );
}
