
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

interface PrivateRouteProps {
  requiredRole?: 'user' | 'admin';
}

const PrivateRoute = ({ requiredRole }: PrivateRouteProps) => {
  const { isAuthenticated, isLoading, user } = useAuth();

  // Show loading indicator while checking authentication
  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
        <span className="ml-2 text-lg">Loading...</span>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log("Not authenticated, redirecting to login");
    return <Navigate to="/login" replace />;
  }

  // If role required and user doesn't have it, redirect
  if (requiredRole && user?.role !== requiredRole) {
    // Redirect admin to admin dashboard, users to user dashboard
    const redirectPath = user?.role === 'admin' ? '/admin/dashboard' : '/user/dashboard';
    console.log(`Role mismatch. Required: ${requiredRole}, User role: ${user?.role}. Redirecting to ${redirectPath}`);
    return <Navigate to={redirectPath} replace />;
  }

  // If authenticated and has the right role, render the protected route
  console.log("Authentication successful, rendering protected route");
  return <Outlet />;
};

export default PrivateRoute;
