import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "@/lib/auth-store";
import { lazy, Suspense } from "react";
import Dashboard from './pages/dashboard';

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Register from "./pages/Register";

// User Dashboard Pages
import UserDashboard from "./pages/dashboard/UserDashboard";
import UserBookings from "./pages/dashboard/UserBookings";
import UserVehicles from "./pages/dashboard/UserVehicles";
import CreateBooking from "./pages/dashboard/CreateBooking";
import BookingDetails from "./pages/dashboard/BookingDetails";
import UserProfile from "./pages/dashboard/UserProfile";
import ParkingHistory from "./pages/dashboard/ParkingHistory";
import Payments from "./pages/dashboard/Payments";

// Admin Dashboard Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminParkings from "./pages/admin/AdminParkings";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminReports from "./pages/admin/AdminReports";

// Layouts
import DashboardLayout from "./components/layout/DashboardLayout";

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: false,
    },
  },
});

// Protected route component
const ProtectedRoute = ({ 
  children, 
  allowedRoles,
}: { 
  children: JSX.Element, 
  allowedRoles?: string[] 
}) => {
  const { user, token } = useAuthStore();
  
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }
  
  return children;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* User Dashboard Routes */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute allowedRoles={["USER", "ADMIN"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<UserDashboard />} />
            <Route path="bookings" element={<UserBookings />} />
            <Route path="bookings/create" element={<CreateBooking />} />
            <Route path="bookings/:id" element={<BookingDetails />} />
            <Route path="vehicles" element={<UserVehicles />} />
            <Route path="history" element={<ParkingHistory />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="payments" element={<Payments />} />
          </Route>
          
          {/* Admin Dashboard Routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={["ADMIN"]}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="bookings" element={<AdminBookings />} />
            <Route path="bookings/:id" element={<BookingDetails />} />
            <Route path="parkings" element={<AdminParkings />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<UserProfile />} /> {/* Temporarily using UserProfile as a placeholder */}
          </Route>
          
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
