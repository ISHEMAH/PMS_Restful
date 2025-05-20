
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportApi } from "@/lib/api-client";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import PageTransition from "@/components/layout/PageTransition";
import {
  Download,
  FileText,
  DollarSign,
  BarChart2,
  Calendar,
} from "lucide-react";

enum ReportType {
  FINANCIAL = "financial",
  OCCUPANCY = "occupancy",
  VEHICLE = "vehicles",
  REVENUE = "revenue",
}

export default function AdminReports() {
  const [reportType, setReportType] = useState<ReportType>(ReportType.FINANCIAL);
  const [dateRange, setDateRange] = useState<{
    from: Date;
    to: Date;
  }>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [selectedParkingId, setSelectedParkingId] = useState<string | null>(null);

  // Fetch parking list for the dropdown
  const { data: parkings } = useQuery({
    queryKey: ["parkings"],
    queryFn: () => import("@/lib/api-client").then((module) => module.parkingApi.getAll()),
  });

  // Fetch report based on selected type
  const {
    data: report,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: [
      "report",
      reportType,
      dateRange.from,
      dateRange.to,
      selectedParkingId,
    ],
    queryFn: async () => {
      const startDate = format(dateRange.from, "yyyy-MM-dd");
      const endDate = format(dateRange.to, "yyyy-MM-dd");

      switch (reportType) {
        case ReportType.FINANCIAL:
          return reportApi.getFinancialReport(startDate, endDate);
        case ReportType.OCCUPANCY:
          return reportApi.getOccupancyReport(startDate, endDate);
        case ReportType.VEHICLE:
          return reportApi.getVehicleReport(startDate, endDate);
        case ReportType.REVENUE:
          return reportApi.getRevenueReport(startDate, endDate);
        default:
          return null;
      }
    },
    enabled: true,
  });

  // Function to export report as CSV
  const exportReport = () => {
    if (!report) {
      toast.error("No data to export");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    let fileName = `${reportType}_report_${format(new Date(), "yyyy-MM-dd")}.csv`;

    switch (reportType) {
      case ReportType.FINANCIAL:
        csvContent += "Total Revenue,$" + report.totalRevenue + "\n\n";
        csvContent += "Parking Name,Total Bookings,Revenue,Cash Revenue,Card Revenue,Online Revenue\n";
        report.byParking.forEach((p) => {
          csvContent += `${p.parkingName},${p.totalBookings},$${p.revenue},$${p.byPaymentMethod.cash},$${p.byPaymentMethod.card},$${p.byPaymentMethod.online}\n`;
        });
        break;

      case ReportType.OCCUPANCY:
        csvContent += "Parking Name,Total Slots,Occupied,Maintenance,Available,Occupancy Rate\n";
        report.byParking.forEach((p) => {
          csvContent += `${p.parkingName},${p.totalSlots},${p.occupiedSlots},${p.maintenanceSlots},${p.availableSlots},${(p.occupancyRate * 100).toFixed(1)}%\n`;
        });
        break;

      case ReportType.VEHICLE:
        csvContent += "Total Vehicles," + report.totalVehicles + "\n";
        csvContent += "Active Vehicles," + report.activeVehicles + "\n";
        csvContent += "Average Stay Duration," + report.averageStayDuration + " hours\n\n";
        
        csvContent += "Vehicle Type,Count,Percentage\n";
        report.vehicleTypes.forEach((v) => {
          csvContent += `${v.type},${v.count},${(v.percentage * 100).toFixed(1)}%\n`;
        });
        
        csvContent += "\nMost Frequent Users\n";
        csvContent += "User ID,Name,Total Visits,Total Spent,Avg Stay\n";
        report.mostFrequentUsers.forEach((u) => {
          csvContent += `${u.userId},${u.firstName} ${u.lastName},${u.totalVisits},$${u.totalSpent.toFixed(2)},${u.averageStayDuration.toFixed(1)} hours\n`;
        });
        break;

      case ReportType.REVENUE:
        csvContent += "Total Revenue,$" + report.totalRevenue.toFixed(2) + "\n";
        csvContent += "Average Revenue Per Vehicle,$" + report.averageRevenuePerVehicle.toFixed(2) + "\n\n";
        
        csvContent += "Revenue by Parking\n";
        csvContent += "Parking ID,Parking Name,Revenue\n";
        report.revenueByParking.forEach((p) => {
          csvContent += `${p.parkingId},${p.parkingName},$${p.revenue.toFixed(2)}\n`;
        });
        
        csvContent += "\nRevenue by Date\n";
        csvContent += "Date,Revenue\n";
        report.revenueByDate.forEach((d) => {
          csvContent += `${d.date},$${d.revenue.toFixed(2)}\n`;
        });
        break;

      default:
        break;
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.success("Report exported successfully");
  };

  const getReportIcon = () => {
    switch (reportType) {
      case ReportType.FINANCIAL:
        return <DollarSign className="h-5 w-5" />;
      case ReportType.OCCUPANCY:
        return <BarChart2 className="h-5 w-5" />;
      case ReportType.VEHICLE:
        return <FileText className="h-5 w-5" />;
      case ReportType.REVENUE:
        return <DollarSign className="h-5 w-5" />;
      default:
        return <FileText className="h-5 w-5" />;
    }
  };

  return (
    <PageTransition>
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Reports</h2>
            <p className="text-gray-500">Generate and view detailed reports</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Generate Report</CardTitle>
            <CardDescription>
              Select report type and date range to generate
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Report Type
                  </label>
                  <Select
                    value={reportType}
                    onValueChange={(value) => setReportType(value as ReportType)}
                  >
                    <SelectTrigger>
                      <div className="flex items-center">
                        {getReportIcon()}
                        <SelectValue placeholder="Select type" className="ml-2" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={ReportType.FINANCIAL}>
                        <span className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Financial Report
                        </span>
                      </SelectItem>
                      <SelectItem value={ReportType.OCCUPANCY}>
                        <span className="flex items-center">
                          <BarChart2 className="h-4 w-4 mr-2" />
                          Occupancy Report
                        </span>
                      </SelectItem>
                      <SelectItem value={ReportType.VEHICLE}>
                        <span className="flex items-center">
                          <FileText className="h-4 w-4 mr-2" />
                          Vehicle Report
                        </span>
                      </SelectItem>
                      <SelectItem value={ReportType.REVENUE}>
                        <span className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-2" />
                          Revenue Report
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    Date Range
                  </label>
                  <DateRangePicker
                    value={dateRange}
                    onChange={(range) => {
                      if (range?.from && range?.to) {
                        setDateRange({ from: range.from, to: range.to });
                      }
                    }}
                  />
                </div>
                {selectedParkingId !== null && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
                      Parking Location
                    </label>
                    <Select
                      value={selectedParkingId || ""}
                      onValueChange={setSelectedParkingId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select parking location" />
                      </SelectTrigger>
                      <SelectContent>
                        {parkings?.map((parking) => (
                          <SelectItem key={parking.id} value={parking.id}>
                            {parking.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => refetch()}>
                  <Calendar className="mr-2 h-4 w-4" />
                  Generate
                </Button>
                <Button onClick={exportReport} disabled={!report}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {isLoading ? (
          <Card className="animate-pulse">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-full"></div>
                <div className="h-40 bg-gray-200 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ) : report ? (
          <>
            {/* Financial Report */}
            {reportType === ReportType.FINANCIAL && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Financial Report
                  </CardTitle>
                  <CardDescription>
                    From {format(dateRange.from, "MMM d, yyyy")} to{" "}
                    {format(dateRange.to, "MMM d, yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <h3 className="text-lg font-semibold text-blue-700">
                        Total Revenue
                      </h3>
                      <p className="text-3xl font-bold text-blue-800">
                        ${report.totalRevenue.toFixed(2)}
                      </p>
                    </div>

                    <h3 className="text-lg font-semibold">Revenue by Parking</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Parking Name</TableHead>
                          <TableHead>Total Bookings</TableHead>
                          <TableHead>Revenue</TableHead>
                          <TableHead>Cash</TableHead>
                          <TableHead>Card</TableHead>
                          <TableHead>Online</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.byParking.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {item.parkingName}
                            </TableCell>
                            <TableCell>{item.totalBookings}</TableCell>
                            <TableCell>${item.revenue.toFixed(2)}</TableCell>
                            <TableCell>
                              ${item.byPaymentMethod.cash.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              ${item.byPaymentMethod.card.toFixed(2)}
                            </TableCell>
                            <TableCell>
                              ${item.byPaymentMethod.online.toFixed(2)}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Occupancy Report */}
            {reportType === ReportType.OCCUPANCY && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart2 className="h-5 w-5 mr-2" />
                    Occupancy Report
                  </CardTitle>
                  <CardDescription>
                    From {format(dateRange.from, "MMM d, yyyy")} to{" "}
                    {format(dateRange.to, "MMM d, yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold">Parking Occupancy</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Parking Name</TableHead>
                          <TableHead>Total Slots</TableHead>
                          <TableHead>Occupied</TableHead>
                          <TableHead>Maintenance</TableHead>
                          <TableHead>Available</TableHead>
                          <TableHead>Occupancy Rate</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.byParking.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-medium">
                              {item.parkingName}
                            </TableCell>
                            <TableCell>{item.totalSlots}</TableCell>
                            <TableCell>{item.occupiedSlots}</TableCell>
                            <TableCell>{item.maintenanceSlots}</TableCell>
                            <TableCell>{item.availableSlots}</TableCell>
                            <TableCell>
                              {(item.occupancyRate * 100).toFixed(1)}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    <h3 className="text-lg font-semibold">
                      Distribution by Vehicle Type
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {report.byParking.map((item, index) => (
                        <Card key={index}>
                          <CardHeader>
                            <CardTitle className="text-sm">
                              {item.parkingName}
                            </CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span>Cars:</span>
                                <span>{item.byVehicleType.car}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Motorcycles:</span>
                                <span>{item.byVehicleType.motorcycle}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Bikes:</span>
                                <span>{item.byVehicleType.bike}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Vehicle Report */}
            {reportType === ReportType.VEHICLE && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Vehicle Report
                  </CardTitle>
                  <CardDescription>
                    From {format(dateRange.from, "MMM d, yyyy")} to{" "}
                    {format(dateRange.to, "MMM d, yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">
                            Total Vehicles
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {report.totalVehicles}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">
                            Active Vehicles
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {report.activeVehicles}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">
                            Average Stay Duration
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            {report.averageStayDuration.toFixed(1)} hrs
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">
                          Vehicle Types
                        </h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Type</TableHead>
                              <TableHead>Count</TableHead>
                              <TableHead>Percentage</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {report.vehicleTypes.map((type, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">
                                  {type.type}
                                </TableCell>
                                <TableCell>{type.count}</TableCell>
                                <TableCell>
                                  {(type.percentage * 100).toFixed(1)}%
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold mb-4">
                          Frequent Users
                        </h3>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Visits</TableHead>
                              <TableHead>Spent</TableHead>
                              <TableHead>Avg. Stay</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {report.mostFrequentUsers.map((user, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">
                                  {user.firstName} {user.lastName}
                                </TableCell>
                                <TableCell>{user.totalVisits}</TableCell>
                                <TableCell>
                                  ${user.totalSpent.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                  {user.averageStayDuration.toFixed(1)} hrs
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Revenue Report */}
            {reportType === ReportType.REVENUE && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Revenue Report
                  </CardTitle>
                  <CardDescription>
                    From {format(dateRange.from, "MMM d, yyyy")} to{" "}
                    {format(dateRange.to, "MMM d, yyyy")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">
                            Total Revenue
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            ${report.totalRevenue.toFixed(2)}
                          </div>
                        </CardContent>
                      </Card>
                      <Card>
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm">
                            Average Revenue Per Vehicle
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="text-2xl font-bold">
                            ${report.averageRevenuePerVehicle.toFixed(2)}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    <h3 className="text-lg font-semibold">
                      Revenue by Parking
                    </h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>ID</TableHead>
                          <TableHead>Parking Name</TableHead>
                          <TableHead>Revenue</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.revenueByParking.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell className="font-mono text-sm">
                              {item.parkingId}
                            </TableCell>
                            <TableCell className="font-medium">
                              {item.parkingName}
                            </TableCell>
                            <TableCell>${item.revenue.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>

                    <h3 className="text-lg font-semibold">Revenue by Date</h3>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Revenue</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {report.revenueByDate.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.date}</TableCell>
                            <TableCell>${item.revenue.toFixed(2)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-10">
              <FileText className="h-10 w-10 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">
                No report generated yet
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Select report type and date range above to generate a report
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </PageTransition>
  );
}
