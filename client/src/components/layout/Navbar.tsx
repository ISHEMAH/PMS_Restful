
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/lib/auth-store";
import { Menu, User, LogOut } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-parking-blue">
              ParkEasy
            </span>
          </Link>
          
          <div className="hidden md:flex gap-6">
            <Link to="/" className="text-sm font-medium hover:text-parking-blue transition-colors">
              Home
            </Link>
            <Link to="/pricing" className="text-sm font-medium hover:text-parking-blue transition-colors">
              Pricing
            </Link>
            <Link to="/about" className="text-sm font-medium hover:text-parking-blue transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-sm font-medium hover:text-parking-blue transition-colors">
              Contact
            </Link>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <div className="hidden md:block">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2 hover-scale">
                      <User size={16} />
                      <span>{user.firstName}</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link to={user.role === "ADMIN" ? "/admin" : "/dashboard"}>
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={logout}>Logout</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </>
          ) : (
            <div className="hidden md:flex gap-4">
              <Button asChild variant="outline" size="sm">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/register">Register</Link>
              </Button>
            </div>
          )}
          
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="md:hidden">
            <Menu />
          </Button>
        </div>
      </div>
      
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t overflow-hidden"
          >
            <div className="flex flex-col space-y-4 p-4">
              <Link to="/" className="text-sm font-medium hover:text-parking-blue transition-colors">
                Home
              </Link>
              <Link to="/pricing" className="text-sm font-medium hover:text-parking-blue transition-colors">
                Pricing
              </Link>
              <Link to="/about" className="text-sm font-medium hover:text-parking-blue transition-colors">
                About
              </Link>
              <Link to="/contact" className="text-sm font-medium hover:text-parking-blue transition-colors">
                Contact
              </Link>
              
              {user ? (
                <>
                  <Link to={user.role === "ADMIN" ? "/admin" : "/dashboard"} className="text-sm font-medium hover:text-parking-blue transition-colors">
                    Dashboard
                  </Link>
                  <Button variant="outline" size="sm" onClick={logout} className="flex items-center gap-2 w-full justify-start">
                    <LogOut size={16} /> Logout
                  </Button>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to="/login">Login</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link to="/register">Register</Link>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
