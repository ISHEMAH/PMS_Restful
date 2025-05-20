import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { bookingApi } from "@/lib/api-client";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Receipt, Loader2 } from "lucide-react";

interface Payment {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  booking: {
    slot: {
      parking: {
        name: string;
      };
    };
  };
}

export default function Payments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        const data = await bookingApi.getAll();
        const completedPayments = data
          .filter(booking => booking.paymentStatus === 'PAID')
          .map(booking => ({
            id: booking.id,
            amount: booking.amount,
            status: booking.paymentStatus,
            createdAt: booking.updatedAt,
            booking: {
              slot: {
                parking: {
                  name: booking.slot.parking.name
                }
              }
            }
          }));
        setPayments(completedPayments);
      } catch (error) {
        console.error('Error fetching payments:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const getPaymentStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return <Badge className="bg-green-100 text-green-800 border-green-200">Paid</Badge>;
      case "PENDING":
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Pending</Badge>;
      case "UNPAID":
        return <Badge className="bg-red-100 text-red-800 border-red-200">Unpaid</Badge>;
      default:
        return <Badge>Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
          <p className="text-gray-500">View your payment history</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Payment History</CardTitle>
          <CardDescription>View all your completed payments</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <div className="rounded-full bg-gray-100 p-3 mb-4">
                <Receipt className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium mb-1">No Payments Found</h3>
              <p className="text-gray-500 text-center">
                You haven't made any payments yet.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Parking</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>{payment.booking.slot.parking.name}</TableCell>
                    <TableCell>${payment.amount.toFixed(2)}</TableCell>
                    <TableCell>{getPaymentStatusBadge(payment.status)}</TableCell>
                    <TableCell>{format(new Date(payment.createdAt), "MMM d, yyyy h:mm a")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 