
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  useEffect(() => {
    // Wait for authentication to be determined
    if (!isLoading) {
      if (isAuthenticated) {
        // Redirect based on role
        if (isAdmin) {
          navigate('/admin/dashboard', { replace: true });
        } else {
          navigate('/user/dashboard', { replace: true });
        }
      } else {
        // Not authenticated, go to login
        navigate('/login', { replace: true });
      }
    }
  }, [navigate, isAuthenticated, isAdmin, isLoading]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-primary-600 text-4xl font-bold mb-4">Parking Management System</h1>
        <div className="flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary-500 mr-2" />
          <p className="text-gray-500 text-lg">Redirecting to appropriate page...</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
