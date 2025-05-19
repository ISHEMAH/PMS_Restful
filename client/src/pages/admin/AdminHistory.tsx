
import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Calendar as CalendarIcon, 
  Download, 
  Search,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';

// Mock history data - replace with API call in production
interface BookingHistory {
  id: string;
  vehicle: {
    licensePlate: string;
    type: string;
    color: string;
  };
  user: {
    name: string;
    email: string;
  };
  slot: {
    number: number;
  };
  startTime: string;
  endTime: string;
  duration: string;
  amount: number;
  status: 'completed' | 'cancelled' | 'expired';
}

const mockHistoryData: BookingHistory[] = [
  {
    id: '1',
    vehicle: {
      licensePlate: 'ABC123',
      type: 'Sedan',
      color: 'Blue'
    },
    user: {
      name: 'John Doe',
      email: 'john@example.com'
    },
    slot: {
      number: 1
    },
    startTime: '2025-05-18T10:00:00',
    endTime: '2025-05-18T12:00:00',
    duration: '2 hours',
    amount: 12.50,
    status: 'completed'
  },
  {
    id: '2',
    vehicle: {
      licensePlate: 'XYZ789',
      type: 'SUV',
      color: 'Black'
    },
    user: {
      name: 'Jane Smith',
      email: 'jane@example.com'
    },
    slot: {
      number: 3
    },
    startTime: '2025-05-17T14:30:00',
    endTime: '2025-05-17T18:30:00',
    duration: '4 hours',
    amount: 25.00,
    status: 'completed'
  },
  {
    id: '3',
    vehicle: {
      licensePlate: 'DEF456',
      type: 'Compact',
      color: 'Red'
    },
    user: {
      name: 'Alex Wang',
      email: 'alex@example.com'
    },
    slot: {
      number: 5
    },
    startTime: '2025-05-16T09:15:00',
    endTime: '2025-05-16T11:45:00',
    duration: '2.5 hours',
    amount: 15.75,
    status: 'cancelled'
  },
  {
    id: '4',
    vehicle: {
      licensePlate: 'GHI789',
      type: 'Truck',
      color: 'White'
    },
    user: {
      name: 'Sam Brown',
      email: 'sam@example.com'
    },
    slot: {
      number: 8
    },
    startTime: '2025-05-15T16:00:00',
    endTime: '2025-05-16T10:00:00',
    duration: '18 hours',
    amount: 90.00,
    status: 'completed'
  },
  {
    id: '5',
    vehicle: {
      licensePlate: 'JKL012',
      type: 'Sedan',
      color: 'Silver'
    },
    user: {
      name: 'Lisa Chen',
      email: 'lisa@example.com'
    },
    slot: {
      number: 2
    },
    startTime: '2025-05-14T11:30:00',
    endTime: '2025-05-14T13:30:00',
    duration: '2 hours',
    amount: 12.50,
    status: 'expired'
  }
];

const AdminHistory = () => {
  const [bookingHistory, setBookingHistory] = useState<BookingHistory[]>(mockHistoryData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);
  const [dateFilter, setDateFilter] = useState(false);

  // Filter bookings based on search term and status
  const filteredBookings = bookingHistory.filter(booking => {
    // Search filter
    const searchMatch = 
      booking.vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.user.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Status filter
    const statusMatch = statusFilter === 'all' || booking.status === statusFilter;
    
    // Date filter
    let dateMatch = true;
    if (dateFilter) {
      const bookingStart = new Date(booking.startTime);
      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      dateMatch = bookingStart >= startOfDay && bookingStart <= endOfDay;
    }
    
    return searchMatch && statusMatch && dateMatch;
  });

  // Format dates for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy hh:mm a');
  };

  const exportToCSV = () => {
    // Generate CSV content
    const headers = ['ID', 'Vehicle', 'User', 'Slot', 'Start Time', 'End Time', 'Duration', 'Amount', 'Status'];
    
    const csvRows = [
      headers.join(','),
      ...filteredBookings.map(b => [
        b.id,
        b.vehicle.licensePlate,
        b.user.name,
        b.slot.number,
        formatDate(b.startTime),
        formatDate(b.endTime),
        b.duration,
        `$${b.amount.toFixed(2)}`,
        b.status
      ].join(','))
    ];
    
    const csvContent = csvRows.join('\n');
    
    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `parking-history-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between">
            <CardTitle className="text-2xl font-bold">Parking History</CardTitle>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" onClick={() => setDateFilter(!dateFilter)}>
                {dateFilter ? 'Clear Date Filter' : 'Filter by Date'}
              </Button>
              <Button onClick={exportToCSV} className="flex items-center">
                <Download className="mr-2 h-4 w-4" /> Export CSV
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {dateFilter && (
              <div className="flex flex-col sm:flex-row gap-4 mb-4">
                <div className="flex-1">
                  <span className="text-sm font-medium">Start Date</span>
                  <div className="mt-1 relative">
                    <Popover open={showStartCalendar} onOpenChange={setShowStartCalendar}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(startDate, 'PPP')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={startDate}
                          onSelect={(date) => {
                            if (date) {
                              setStartDate(date);
                              setShowStartCalendar(false);
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                <div className="flex-1">
                  <span className="text-sm font-medium">End Date</span>
                  <div className="mt-1 relative">
                    <Popover open={showEndCalendar} onOpenChange={setShowEndCalendar}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(endDate, 'PPP')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={endDate}
                          onSelect={(date) => {
                            if (date) {
                              setEndDate(date);
                              setShowEndCalendar(false);
                            }
                          }}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Search by vehicle, user..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value)}
              >
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="mt-4 overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vehicle</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Slot</TableHead>
                    <TableHead>Start Time</TableHead>
                    <TableHead>End Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell>
                          <div className="font-medium">{booking.vehicle.licensePlate}</div>
                          <div className="text-sm text-gray-500">
                            {booking.vehicle.type}, {booking.vehicle.color}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{booking.user.name}</div>
                          <div className="text-sm text-gray-500">{booking.user.email}</div>
                        </TableCell>
                        <TableCell>#{booking.slot.number}</TableCell>
                        <TableCell>{formatDate(booking.startTime)}</TableCell>
                        <TableCell>{formatDate(booking.endTime)}</TableCell>
                        <TableCell>{booking.duration}</TableCell>
                        <TableCell>${booking.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge className={getStatusBadgeClass(booking.status)}>
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-6 text-gray-500">
                        No booking history records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminHistory;
