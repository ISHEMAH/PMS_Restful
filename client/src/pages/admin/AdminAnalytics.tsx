
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/lib/api-client";
import { format, subDays } from "date-fns";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import PageTransition from "@/components/layout/PageTransition";
import { Analytics, VehicleTypeStats } from "@/lib/types";
import { Download } from "lucide-react";

// Custom colors for charts
const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

export default function AdminAnalytics() {
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });

  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery({
    queryKey: ["analytics", dateRange.from, dateRange.to],
    queryFn: () =>
      adminApi.getAnalytics(
        format(dateRange.from, "yyyy-MM-dd"),
        format(dateRange.to, "yyyy-MM-dd")
      ),
  });

  // Helper function to format data for revenue chart
  const getRevenueByVehicleTypeData = () => {
    if (!analytics || !analytics.vehicleTypeStats) return [];
    
    return analytics.vehicleTypeStats.map((stat: VehicleTypeStats) => ({
      name: stat.type,
      value: stat.percentage * 100,
    }));
  };

  // Helper function to format data for peak hours chart
  const getPeakHoursData = () => {
    if (!analytics || !analytics.peakHours) return [];
    
    return analytics.peakHours.map((hour: string) => {
      const [hourRange, count] = hour.split(":");
      return {
        hour: hourRange,
        count: parseInt(count.trim()),
      };
    });
  };

  // Export data as CSV
  const exportData = () => {
    if (!analytics) {
      toast.error("No data to export");
      return;
    }

    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Metric,Value\n";
    csvContent += `Total Bookings,${analytics.totalBookings}\n`;
    csvContent += `Total Revenue,$${analytics.totalRevenue.toFixed(2)}\n`;
    csvContent += `Occupancy Rate,${(analytics.occupancyRate * 100).toFixed(1)}%\n`;
    csvContent += `Average Stay Duration,${analytics.averageStayDuration.toFixed(2)} hours\n\n`;
    
    csvContent += "Vehicle Type,Count,Percentage\n";
    analytics.vehicleTypeStats.forEach((stat: VehicleTypeStats) => {
      csvContent += `${stat.type},${stat.count},${(stat.percentage * 100).toFixed(1)}%\n`;
    });

    csvContent += "\nPeak Hours\n";
    analytics.peakHours.forEach((hour: string) => {
      csvContent += `${hour}\n`;
    });

    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `analytics_${format(new Date(), "yyyy-MM-dd")}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Analytics data exported successfully");
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Parking Analytics</h2>
            <p className="text-gray-500">
              Track performance, revenue, and patterns
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <DateRangePicker
              value={dateRange}
              onChange={(range) => {
                if (range?.from && range?.to) {
                  setDateRange({ from: range.from, to: range.to });
                }
              }}
            />
            <Button onClick={exportData}>
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {/* Total Bookings */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Bookings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.totalBookings || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    For selected period
                  </p>
                </CardContent>
              </Card>

              {/* Total Revenue */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Revenue
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    ${analytics?.totalRevenue?.toFixed(2) || "0.00"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    For selected period
                  </p>
                </CardContent>
              </Card>

              {/* Occupancy Rate */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Occupancy Rate
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.occupancyRate
                      ? `${(analytics.occupancyRate * 100).toFixed(1)}%`
                      : "0%"}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average for selected period
                  </p>
                </CardContent>
              </Card>

              {/* Average Stay Duration */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">
                    Avg. Stay Duration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {analytics?.averageStayDuration?.toFixed(2) || "0"} hrs
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Average for selected period
                  </p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="vehicle-types" className="space-y-4">
              <TabsList>
                <TabsTrigger value="vehicle-types">Vehicle Types</TabsTrigger>
                <TabsTrigger value="peak-hours">Peak Hours</TabsTrigger>
              </TabsList>
              <TabsContent value="vehicle-types" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Vehicle Distribution</CardTitle>
                    <CardDescription>
                      Breakdown of vehicle types using the parking
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={getRevenueByVehicleTypeData()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) =>
                              `${name}: ${(percent * 100).toFixed(0)}%`
                            }
                            outerRadius={120}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {getRevenueByVehicleTypeData().map((entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value: number) => [`${value.toFixed(1)}%`, "Percentage"]}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Vehicle Type Stats Table */}
                <Card>
                  <CardHeader>
                    <CardTitle>Vehicle Type Statistics</CardTitle>
                    <CardDescription>
                      Detailed statistics for each vehicle type
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="rounded-md border">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Count
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Percentage
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {analytics?.vehicleTypeStats?.length ? (
                            analytics.vehicleTypeStats.map((stat, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {stat.type}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {stat.count}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  {(stat.percentage * 100).toFixed(1)}%
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td
                                colSpan={3}
                                className="px-6 py-4 text-center text-gray-500"
                              >
                                No data available
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="peak-hours" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Peak Hours Analysis</CardTitle>
                    <CardDescription>
                      Distribution of bookings throughout the day
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pl-2">
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={getPeakHoursData()}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="hour" />
                          <YAxis />
                          <Tooltip />
                          <Bar
                            dataKey="count"
                            name="Number of Bookings"
                            fill="#3B82F6"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </>
        )}
      </div>
    </PageTransition>
  );
}
