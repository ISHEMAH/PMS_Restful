
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import bookingService, { Booking } from '@/services/bookingService';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Search, CheckCircle, X } from 'lucide-react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const AdminBookings = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [declineDialogOpen, setDeclineDialogOpen] = useState(false);
  const [processingBookingId, setProcessingBookingId] = useState<string | null>(null);
  
  const { toast } = useToast();

  const fetchBookings = async () => {
    try {
      setIsLoading(true);
      const data = await bookingService.getAllBookings();
      setBookings(data);
      applyFilters(data, searchQuery, statusFilter);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        variant: "destructive",
        title: "Failed to load bookings",
        description: "Please try again later."
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [toast]);

  const applyFilters = (data: Booking[], query: string, status: string) => {
    let filtered = [...data];
    
    // Apply status filter
    if (status !== 'all') {
      filtered = filtered.filter(booking => booking.status === status);
    }
    
    // Apply search query
    if (query.trim() !== '') {
      const lowercaseQuery = query.toLowerCase();
      filtered = filtered.filter(booking => 
        booking.id.toLowerCase().includes(lowercaseQuery) ||
        booking.vehicle?.licensePlate.toLowerCase().includes(lowercaseQuery) ||
        booking.user?.name.toLowerCase().includes(lowercaseQuery) ||
        booking.user?.email.toLowerCase().includes(lowercaseQuery)
      );
    }
    
    setFilteredBookings(filtered);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    applyFilters(bookings, query, statusFilter);
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    applyFilters(bookings, searchQuery, value);
  };

  const handleApprove = async (bookingId: string) => {
    try {
      setProcessingBookingId(bookingId);
      await bookingService.approveBooking(bookingId);
      toast({
        title: "Booking approved",
        description: "The booking has been successfully approved."
      });
      fetchBookings();
    } catch (error) {
      console.error('Error approving booking:', error);
      toast({
        variant: "destructive",
        title: "Approval failed",
        description: "There was an error approving this booking."
      });
    } finally {
      setProcessingBookingId(null);
    }
  };

  const handleDecline = async () => {
    if (!selectedBooking) return;
    
    try {
      setProcessingBookingId(selectedBooking.id);
      await bookingService.declineBooking(selectedBooking.id, declineReason);
      toast({
        title: "Booking declined",
        description: "The booking has been declined."
      });
      setDeclineDialogOpen(false);
      setDeclineReason('');
      fetchBookings();
    } catch (error) {
      console.error('Error declining booking:', error);
      toast({
        variant: "destructive",
        title: "Decline failed",
        description: "There was an error declining this booking."
      });
    } finally {
      setProcessingBookingId(null);
    }
  };

  const openDeclineDialog = (booking: Booking) => {
    setSelectedBooking(booking);
    setDeclineDialogOpen(true);
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'MMM dd, yyyy - h:mm a');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Booking Approval</h1>
          <p className="text-muted-foreground">
            Approve or decline parking booking requests
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search bookings..."
              className="pl-8"
              value={searchQuery}
              onChange={handleSearch}
            />
          </div>
          
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="declined">Declined</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Booking Requests</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredBookings.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    {searchQuery || statusFilter !== 'all' ? 
                      "No bookings match your search criteria" : 
                      "No bookings have been made yet"
                    }
                  </p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Slot</TableHead>
                        <TableHead>Time Period</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredBookings.map((booking) => (
                        <TableRow key={booking.id}>
                          <TableCell className="font-medium">
                            {booking.id.substring(0, 8).toUpperCase()}
                          </TableCell>
                          <TableCell>
                            {booking.user?.name}<br/>
                            <span className="text-xs text-muted-foreground">{booking.user?.email}</span>
                          </TableCell>
                          <TableCell>
                            {booking.vehicle?.licensePlate}<br/>
                            <span className="text-xs text-muted-foreground">
                              {booking.vehicle?.type} • {booking.vehicle?.color}
                            </span>
                          </TableCell>
                          <TableCell>#{booking.slot?.number}</TableCell>
                          <TableCell>
                            {formatDateTime(booking.startTime)}<br/>
                            <span className="text-xs text-muted-foreground">to</span><br/>
                            {formatDateTime(booking.endTime)}
                          </TableCell>
                          <TableCell>
                            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'approved' ? 'bg-green-100 text-green-800' : 
                              booking.status === 'pending' ? 'bg-amber-100 text-amber-800' : 
                              booking.status === 'declined' ? 'bg-red-100 text-red-800' : 
                              'bg-blue-100 text-blue-800'
                            }`}>
                              {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {booking.status === 'pending' && (
                              <div className="flex space-x-2">
                                <Button 
                                  size="sm" 
                                  onClick={() => handleApprove(booking.id)}
                                  disabled={processingBookingId === booking.id}
                                >
                                  {processingBookingId === booking.id ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  ) : (
                                    <CheckCircle className="h-4 w-4 mr-1" />
                                  )}
                                  Approve
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="destructive"
                                  onClick={() => openDeclineDialog(booking)}
                                  disabled={processingBookingId === booking.id}
                                >
                                  <X className="h-4 w-4 mr-1" />
                                  Decline
                                </Button>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        <Dialog open={declineDialogOpen} onOpenChange={setDeclineDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Decline Booking</DialogTitle>
              <DialogDescription>
                Please provide a reason for declining this booking request.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              placeholder="Reason for declining (optional)"
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              rows={4}
            />
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setDeclineDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive" 
                onClick={handleDecline}
                disabled={processingBookingId !== null}
              >
                {processingBookingId ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm Decline"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardLayout>
  );
};

export default AdminBookings;
