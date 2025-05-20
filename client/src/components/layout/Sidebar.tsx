
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/lib/auth-store";
import {
  BarChart2,
  Calendar,
  Car,
  Clock,
  CreditCard,
  FileText,
  Home,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function Sidebar({ isOpen, onToggle }: SidebarProps) {
  const { pathname } = useLocation();
  const { user, logout } = useAuthStore();

  const isAdmin = user?.role === "ADMIN";
  const basePath = isAdmin ? "/admin" : "/dashboard";

  // Navigation links based on user role
  const navigation = isAdmin
    ? [
        { name: "Dashboard", href: "/admin", icon: Home },
        { name: "Analytics", href: "/admin/analytics", icon: BarChart2 },
        { name: "Bookings", href: "/admin/bookings", icon: Calendar },
        { name: "Parkings", href: "/admin/parkings", icon: Car },
        { name: "Reports", href: "/admin/reports", icon: FileText },
        { name: "Settings", href: "/admin/settings", icon: Settings },
      ]
    : [
        { name: "Dashboard", href: "/dashboard", icon: Home },
        { name: "My Bookings", href: "/dashboard/bookings", icon: Calendar },
        { name: "My Vehicles", href: "/dashboard/vehicles", icon: Car },
        { name: "Parking History", href: "/dashboard/history", icon: Clock },
        { name: "Payments", href: "/dashboard/payments", icon: CreditCard },
        { name: "Profile", href: "/dashboard/profile", icon: User },
      ];

  return (
    <motion.div
      initial={false}
      animate={{
        width: isOpen ? "240px" : "70px",
        transition: { duration: 0.3, ease: "easeInOut" },
      }}
      className={cn(
        "h-screen flex flex-col bg-white border-r border-gray-200 sticky top-0 left-0 z-30",
        isOpen ? "w-60" : "w-[70px]"
      )}
    >
      <div className="flex items-center justify-center h-16 border-b">
        {isOpen ? (
          <Link to="/" className="font-bold text-xl text-parking-blue">
            ParkEasy
          </Link>
        ) : (
          <Link to="/" className="font-bold text-xl text-parking-blue">
            PE
          </Link>
        )}
      </div>

      <div className="flex-1 py-6 flex flex-col justify-between">
        <nav className="px-2 space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md transition-colors",
                  isActive
                    ? "bg-parking-blue text-white"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                <item.icon size={20} />
                {isOpen && <span className="ml-3">{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="px-2 mt-6">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={logout}
          >
            <LogOut size={20} />
            {isOpen && <span className="ml-3">Logout</span>}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
