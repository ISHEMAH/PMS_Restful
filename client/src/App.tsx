
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";

// Auth Pages
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";

// User Pages
import UserDashboard from "./pages/user/UserDashboard";
import UserVehicle from "./pages/user/UserVehicle";
import UserSlots from "./pages/user/UserSlots";
import UserBookings from "./pages/user/UserBookings";
import NewBooking from "./pages/user/NewBooking";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSlots from "./pages/admin/AdminSlots";
import AdminBookings from "./pages/admin/AdminBookings";
import AdminVehicles from "./pages/admin/AdminVehicles";
import AdminHistory from "./pages/admin/AdminHistory";
import AdminAnalytics from "./pages/admin/AdminAnalytics";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Root route */}
            <Route path="/" element={<Index />} />
            
            {/* Protected user routes */}
            <Route element={<PrivateRoute requiredRole="user" />}>
              <Route path="/user/dashboard" element={<UserDashboard />} />
              <Route path="/user/vehicle" element={<UserVehicle />} />
              <Route path="/user/slots" element={<UserSlots />} />
              <Route path="/user/bookings" element={<UserBookings />} />
              <Route path="/user/bookings/new" element={<NewBooking />} />
            </Route>
            
            {/* Protected admin routes */}
            <Route element={<PrivateRoute requiredRole="admin" />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/slots" element={<AdminSlots />} />
              <Route path="/admin/bookings" element={<AdminBookings />} />
              <Route path="/admin/vehicles" element={<AdminVehicles />} />
              <Route path="/admin/history" element={<AdminHistory />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
            </Route>
            
            {/* Not found route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
