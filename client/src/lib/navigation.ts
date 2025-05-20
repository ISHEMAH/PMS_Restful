
import {
  HomeIcon,
  Car,
  CalendarDays,
  ParkingCircle,
  Users,
  BarChart2,
  FileText,
  Settings
} from "lucide-react";

export const userNavigation = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
  },
  {
    title: "My Bookings",
    href: "/dashboard/bookings",
    icon: CalendarDays,
  },
  {
    title: "My Vehicles",
    href: "/dashboard/vehicles",
    icon: Car,
  }
];

export const adminNavigation = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: HomeIcon,
  },
  {
    title: "Bookings",
    href: "/admin/bookings",
    icon: CalendarDays,
  },
  {
    title: "Parkings",
    href: "/admin/parkings",
    icon: ParkingCircle,
  },
  {
    title: "Analytics",
    href: "/admin/analytics",
    icon: BarChart2,
  },
  {
    title: "Reports",
    href: "/admin/reports",
    icon: FileText,
  }
];
