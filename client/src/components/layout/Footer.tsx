
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-100 py-12 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">ParkEasy</h3>
            <p className="text-sm text-gray-600 mb-4">
              Making parking management simple and efficient.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-600 hover:text-parking-blue transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-600 hover:text-parking-blue transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-600 hover:text-parking-blue transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-600 hover:text-parking-blue transition-colors">
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/terms" className="text-gray-600 hover:text-parking-blue transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-600 hover:text-parking-blue transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <address className="text-sm text-gray-600 not-italic">
              <p>123 Parking Street</p>
              <p>City, State 12345</p>
              <p className="mt-2">contact@parkeasy.com</p>
              <p>(123) 456-7890</p>
            </address>
          </div>
        </div>
        
        <div className="border-t border-gray-200 mt-8 pt-8 text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} ParkEasy. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
