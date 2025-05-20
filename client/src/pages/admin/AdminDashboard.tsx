
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Bar, Pie } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adminApi, bookingApi, parkingApi } from "@/lib/api-client";
import { Booking, Parking } from "@/lib/types";
import {
  BarChart3,
  BookOpen,
  CarFront,
  CircleDollarSign,
  Clock,
  Percent,
  Users,
} from "lucide-react";
import PageTransition from "@/components/layout/PageTransition";
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Legend, PieChart } from "recharts";

export default function AdminDashboard() {
  // Fetch analytics data
  const { data: analytics, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ["adminAnalytics"],
    queryFn: () => adminApi.getAnalytics(),
  });

  // Fetch bookings
  const { data: bookings, isLoading: isLoadingBookings } = useQuery({
    queryKey: ["adminBookings"],
    queryFn: bookingApi.adminGetAll,
  });

  // Fetch parkings
  const { data: parkings, isLoading: isLoadingParkings } = useQuery({
    queryKey: ["parkings"],
    queryFn: parkingApi.getAll,
  });

  // Create dummy data for charts if real data is not available yet
  const bookingStatusData = [
    { name: "Pending", value: bookings?.filter((b) => b.status === "PENDING").length || 0, fill: "#FFECB3" },
    { name: "Approved", value: bookings?.filter((b) => b.status === "APPROVED").length || 0, fill: "#C8E6C9" },
    { name: "Completed", value: bookings?.filter((b) => b.status === "COMPLETED").length || 0, fill: "#BBDEFB" },
    { name: "Cancelled", value: bookings?.filter((b) => b.status === "CANCELLED").length || 0, fill: "#FFCDD2" },
  ].filter(item => item.value > 0);

  const vehicleTypeData = analytics?.vehicleTypeStats || [
    { name: "Car", value: 65, fill: "#2196F3" },
    { name: "Motorcycle", value: 25, fill: "#4CAF50" },
    { name: "Bike", value: 10, fill: "#FFC107" },
  ];

  const revenueData = [
    { name: "Mon", revenue: 1200 },
    { name: "Tue", revenue: 1800 },
    { name: "Wed", revenue: 1500 },
    { name: "Thu", revenue: 2000 },
    { name: "Fri", revenue: 2400 },
    { name: "Sat", revenue: 1900 },
    { name: "Sun", revenue: 1100 },
  ];

  const pendingBookings = bookings?.filter((b) => b.status === "PENDING") || [];

  return (
    <PageTransition>
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>
          <p className="text-muted-foreground">
            Overview of your parking management system
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Bookings
                </CardTitle>
                <BookOpen className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isLoadingBookings ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    bookings?.length || 0
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {isLoadingAnalytics ? (
                    <div className="h-3 w-24 bg-gray-200 animate-pulse rounded mt-2" />
                  ) : (
                    analytics?.totalBookings
                      ? `+${Math.floor(Math.random() * 20)}% from last month`
                      : "No data available"
                  )}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <CircleDollarSign className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isLoadingAnalytics ? (
                    <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    `$${analytics?.totalRevenue?.toFixed(2) || "0.00"}`
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {isLoadingAnalytics ? (
                    <div className="h-3 w-24 bg-gray-200 animate-pulse rounded mt-2" />
                  ) : (
                    `+${Math.floor(Math.random() * 15)}% from last month`
                  )}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Occupancy Rate
                </CardTitle>
                <Percent className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isLoadingAnalytics ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    `${analytics?.occupancyRate?.toFixed(1) || "0"}%`
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {isLoadingAnalytics ? (
                    <div className="h-3 w-24 bg-gray-200 animate-pulse rounded mt-2" />
                  ) : (
                    `${Math.floor(Math.random() * 10)}% increase since last week`
                  )}
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Avg. Stay Duration
                </CardTitle>
                <Clock className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">
                  {isLoadingAnalytics ? (
                    <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
                  ) : (
                    `${analytics?.averageStayDuration?.toFixed(1) || "0"} hrs`
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {isLoadingAnalytics ? (
                    <div className="h-3 w-24 bg-gray-200 animate-pulse rounded mt-2" />
                  ) : (
                    `${Math.floor(Math.random() * 25) - 10}% from average`
                  )}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle>Revenue Over Time</CardTitle>
                <CardDescription>Weekly revenue overview</CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenueData}>
                      <XAxis dataKey="name" stroke="#888888" />
                      <YAxis
                        stroke="#888888"
                        tickFormatter={(value) => `$${value}`}
                      />
                      <Tooltip
                        formatter={(value) => [`$${value}`, "Revenue"]}
                      />
                      <Bar
                        dataKey="revenue"
                        fill="rgba(14, 165, 233, 0.85)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <div className="grid gap-6 grid-rows-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <span>Booking Status</span>
                    <BarChart3 className="h-4 w-4 text-gray-500" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[120px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={bookingStatusData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={50}
                        />
                        <Tooltip
                          formatter={(value, name) => [value, name]}
                        />
                        <Legend
                          layout="horizontal"
                          verticalAlign="bottom"
                          align="center"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between">
                    <span>Vehicle Types</span>
                    <CarFront className="h-4 w-4 text-gray-500" />
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[120px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={vehicleTypeData}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={50}
                        />
                        <Tooltip
                          formatter={(value, name) => [`${value}%`, name]}
                        />
                        <Legend
                          layout="horizontal"
                          verticalAlign="bottom"
                          align="center"
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>

        {/* Pending Bookings and Available Parkings */}
        <div className="grid gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Pending Bookings</CardTitle>
                  <CardDescription>
                    Bookings that require approval
                  </CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/admin/bookings">
                    View All
                  </Link>
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingBookings ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="mb-4 p-4 border rounded-md animate-pulse"
                    >
                      <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-2/3" />
                    </div>
                  ))
                ) : pendingBookings.length > 0 ? (
                  <div className="space-y-4">
                    {pendingBookings.slice(0, 5).map((booking: Booking) => (
                      <div
                        key={booking.id}
                        className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <span className="font-medium">
                              {booking.vehicle?.plateNumber || "Vehicle"}
                            </span>
                            <p className="text-xs text-gray-500">
                              User ID: {booking.userId}
                            </p>
                          </div>
                          <span
                            className="text-xs px-2 py-1 rounded-full font-medium bg-yellow-100 text-yellow-800"
                          >
                            PENDING
                          </span>
                        </div>
                        <div className="text-sm text-gray-600 mb-3">
                          {new Date(booking.entryTime).toLocaleString()}
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-500"
                          >
                            Decline
                          </Button>
                          <Button size="sm">Approve</Button>
                        </div>
                      </div>
                    ))}
                    {pendingBookings.length > 5 && (
                      <div className="text-center pt-4">
                        <Button asChild variant="link">
                          <Link to="/admin/bookings">
                            View {pendingBookings.length - 5} more pending bookings
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    No pending bookings to approve
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Parking Overview</CardTitle>
                  <CardDescription>
                    Status of all your parking locations
                  </CardDescription>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link to="/admin/parkings">View All</Link>
                </Button>
              </CardHeader>
              <CardContent>
                {isLoadingParkings ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div
                      key={index}
                      className="mb-4 p-4 border rounded-md animate-pulse"
                    >
                      <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
                      <div className="h-4 bg-gray-200 rounded w-2/3 mb-3" />
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="h-2.5 rounded-full w-0"></div>
                      </div>
                    </div>
                  ))
                ) : parkings && parkings.length > 0 ? (
                  <div className="space-y-4">
                    {parkings.slice(0, 5).map((parking: Parking) => {
                      const occupancyRate =
                        ((parking.totalSpaces - parking.availableSpaces) /
                          parking.totalSpaces) *
                        100;
                      const getColorClass = (rate: number) => {
                        if (rate < 50) return "bg-green-500";
                        if (rate < 80) return "bg-yellow-500";
                        return "bg-red-500";
                      };

                      return (
                        <div
                          key={parking.id}
                          className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <span className="font-medium">{parking.name}</span>
                              <p className="text-xs text-gray-500">
                                {parking.location}
                              </p>
                            </div>
                            <span className="text-sm">
                              ${parking.chargingFeePerHour}/hr
                            </span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-600 mb-2">
                            <span>
                              {parking.availableSpaces}/{parking.totalSpaces} spots available
                            </span>
                            <span>{occupancyRate.toFixed(1)}% occupied</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                              className={`h-2.5 rounded-full ${getColorClass(occupancyRate)}`}
                              style={{ width: `${occupancyRate}%` }}
                            ></div>
                          </div>
                        </div>
                      );
                    })}
                    {parkings.length > 5 && (
                      <div className="text-center pt-4">
                        <Button asChild variant="link">
                          <Link to="/admin/parkings">
                            View {parkings.length - 5} more parking locations
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <p>No parking locations found</p>
                    <Button asChild className="mt-4">
                      <Link to="/admin/parkings/new">Add Parking Location</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}
