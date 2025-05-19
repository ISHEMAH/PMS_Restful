
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  User, 
  Car, 
  Calendar, 
  LogOut, 
  Menu, 
  X,
  ParkingSquare,
  LayoutDashboard
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAdmin = user?.role === 'admin';
  
  const userNavItems = [
    { name: 'Dashboard', href: '/user/dashboard', icon: LayoutDashboard },
    { name: 'Available Slots', href: '/user/slots', icon: ParkingSquare },
    { name: 'My Vehicle', href: '/user/vehicle', icon: Car },
    { name: 'My Bookings', href: '/user/bookings', icon: Calendar },
  ];
  
  const adminNavItems = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Manage Slots', href: '/admin/slots', icon: ParkingSquare },
    { name: 'Booking Approval', href: '/admin/bookings', icon: Calendar },
    { name: 'Vehicles', href: '/admin/vehicles', icon: Car },
    { name: 'History', href: '/admin/history', icon: Calendar },
    { name: 'Analytics', href: '/admin/analytics', icon: Calendar },
  ];
  
  const navItems = isAdmin ? adminNavItems : userNavItems;

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top navigation bar */}
      <header className="bg-white shadow-sm z-10">
        <div className="flex justify-between items-center px-4 h-16">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar}
              className="md:hidden"
            >
              {sidebarOpen ? <X /> : <Menu />}
            </Button>
            <h1 className="text-xl font-semibold text-primary-700 ml-2">
              Parking Management System
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center">
              <div className="font-medium">Hello, {user?.name}</div>
            </div>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar navigation */}
        <aside
          className={cn(
            "fixed inset-y-0 pt-16 md:pt-16 md:static w-72 bg-white shadow-md z-10 transition-transform",
            sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
          )}
        >
          <nav className="p-4 space-y-2">
            <div className="space-y-1">
              {navItems.map((item) => (
                <Button
                  key={item.name}
                  variant="ghost"
                  className={cn(
                    "w-full justify-start",
                    window.location.pathname === item.href 
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                  onClick={() => navigate(item.href)}
                >
                  <item.icon className="mr-2 h-5 w-5" />
                  {item.name}
                </Button>
              ))}
            </div>
            <div className="pt-4 mt-4 border-t">
              <div className="flex items-center gap-3 px-3 py-2">
                <div className="bg-primary-100 rounded-full p-2">
                  <User className="h-5 w-5 text-primary-700" />
                </div>
                <div>
                  <div className="font-medium">{user?.name}</div>
                  <div className="text-sm text-gray-500">{user?.email}</div>
                </div>
              </div>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-6">
          {/* Backdrop for mobile sidebar */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/20 z-0 md:hidden"
              onClick={toggleSidebar}
            ></div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
