
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Car, Check, Clock, CreditCard, Shield } from "lucide-react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

// Variants for animations
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { 
      delay: custom * 0.2,
      duration: 0.5
    }
  })
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function Index() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-br from-blue-50 to-blue-100 py-20">
          <div className="container px-4 mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <motion.div 
                className="md:w-1/2 mb-10 md:mb-0"
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
              >
                <motion.h1 
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6"
                  variants={fadeIn}
                  custom={0}
                >
                  Parking Management
                  <br />
                  <span className="text-parking-blue">Simplified</span>
                </motion.h1>
                
                <motion.p 
                  className="text-lg text-gray-600 mb-8 max-w-md"
                  variants={fadeIn}
                  custom={1}
                >
                  Streamline your parking operations with our comprehensive 
                  management system. Save time, increase revenue, and improve customer satisfaction.
                </motion.p>
                
                <motion.div 
                  className="flex flex-wrap gap-4"
                  variants={fadeIn}
                  custom={2}
                >
                  <Button asChild size="lg" className="hover-scale">
                    <Link to="/register">Get Started <ArrowRight className="ml-2 h-4 w-4" /></Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="hover-scale">
                    <Link to="/about">Learn More</Link>
                  </Button>
                </motion.div>
              </motion.div>
              
              <motion.div 
                className="md:w-1/2"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div className="relative">
                  <div className="bg-white rounded-lg shadow-xl p-8 md:p-12 overflow-hidden border border-gray-200">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-blue-50 rounded-lg p-6 flex flex-col items-center">
                        <Car size={40} className="text-parking-blue mb-4" />
                        <span className="text-2xl font-bold text-gray-800">250+</span>
                        <span className="text-sm text-gray-600">Parking Spaces</span>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-6 flex flex-col items-center">
                        <Clock size={40} className="text-parking-blue mb-4" />
                        <span className="text-2xl font-bold text-gray-800">24/7</span>
                        <span className="text-sm text-gray-600">Support</span>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-6 flex flex-col items-center">
                        <CreditCard size={40} className="text-parking-blue mb-4" />
                        <span className="text-2xl font-bold text-gray-800">95%</span>
                        <span className="text-sm text-gray-600">Payment Success</span>
                      </div>
                      
                      <div className="bg-blue-50 rounded-lg p-6 flex flex-col items-center">
                        <Shield size={40} className="text-parking-blue mb-4" />
                        <span className="text-2xl font-bold text-gray-800">100%</span>
                        <span className="text-sm text-gray-600">Secure</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorative elements */}
                  <div className="absolute -z-10 -bottom-6 -right-6 h-24 w-24 bg-parking-blue rounded-full opacity-50 blur-xl" />
                  <div className="absolute -z-10 -top-6 -left-6 h-20 w-20 bg-blue-400 rounded-full opacity-50 blur-xl" />
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Features Section */}
        <motion.section 
          className="py-20"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
        >
          <div className="container px-4 mx-auto">
            <motion.div 
              className="text-center mb-16"
              variants={fadeIn}
              custom={0}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Everything you need to manage your parking operations efficiently and effectively.
              </p>
            </motion.div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <motion.div 
                className="bg-white p-8 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                variants={fadeIn}
                custom={1}
              >
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <Car className="h-6 w-6 text-parking-blue" />
                </div>
                <h3 className="text-xl font-bold mb-3">Smart Parking Assignment</h3>
                <p className="text-gray-600">
                  Automatically assign the best parking spot based on vehicle type and availability.
                </p>
              </motion.div>
              
              <motion.div 
                className="bg-white p-8 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                variants={fadeIn}
                custom={2}
              >
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <CreditCard className="h-6 w-6 text-parking-blue" />
                </div>
                <h3 className="text-xl font-bold mb-3">Easy Payment Processing</h3>
                <p className="text-gray-600">
                  Multiple payment methods and automated billing for a seamless checkout experience.
                </p>
              </motion.div>
              
              <motion.div 
                className="bg-white p-8 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
                variants={fadeIn}
                custom={3}
              >
                <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
                  <BarChart2 className="h-6 w-6 text-parking-blue" />
                </div>
                <h3 className="text-xl font-bold mb-3">Comprehensive Analytics</h3>
                <p className="text-gray-600">
                  Detailed reports and insights to help you optimize your parking operations.
                </p>
              </motion.div>
            </div>
          </div>
        </motion.section>
        
        {/* How It Works Section */}
        <section className="py-20 bg-gray-50">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                A simple process to get started with our parking management system.
              </p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-8">
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="h-16 w-16 bg-parking-blue rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-bold mb-3">Register</h3>
                <p className="text-gray-600">
                  Create your account and add your vehicles.
                </p>
              </motion.div>
              
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="h-16 w-16 bg-parking-blue rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-bold mb-3">Book</h3>
                <p className="text-gray-600">
                  Reserve your parking spot in advance.
                </p>
              </motion.div>
              
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="h-16 w-16 bg-parking-blue rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-bold mb-3">Park</h3>
                <p className="text-gray-600">
                  Arrive and park in your designated spot.
                </p>
              </motion.div>
              
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="h-16 w-16 bg-parking-blue rounded-full flex items-center justify-center text-white text-xl font-bold mx-auto mb-4">
                  4
                </div>
                <h3 className="text-xl font-bold mb-3">Checkout</h3>
                <p className="text-gray-600">
                  Pay easily when you're done and get a receipt.
                </p>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* Pricing Section */}
        <section className="py-20">
          <div className="container px-4 mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple Pricing</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Choose the plan that fits your needs. All plans include access to our core features.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <motion.div 
                className="bg-white p-8 rounded-lg shadow-md border border-gray-200 flex flex-col"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-bold mb-2">Basic</h3>
                <div className="text-3xl font-bold mb-4">$29<span className="text-sm text-gray-500 font-normal">/month</span></div>
                <p className="text-gray-600 mb-6">Perfect for small parking lots.</p>
                <ul className="mb-8 space-y-3 flex-grow">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-parking-blue mr-2" />
                    <span>Up to 50 parking spots</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-parking-blue mr-2" />
                    <span>Basic reporting</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-parking-blue mr-2" />
                    <span>Email support</span>
                  </li>
                </ul>
                <Button className="w-full hover-scale">Get Started</Button>
              </motion.div>
              
              <motion.div 
                className="bg-white p-8 rounded-lg shadow-lg border-2 border-parking-blue flex flex-col relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
              >
                <div className="absolute top-0 right-0 bg-parking-blue text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">
                  POPULAR
                </div>
                <h3 className="text-xl font-bold mb-2">Professional</h3>
                <div className="text-3xl font-bold mb-4">$79<span className="text-sm text-gray-500 font-normal">/month</span></div>
                <p className="text-gray-600 mb-6">For medium-sized parking operations.</p>
                <ul className="mb-8 space-y-3 flex-grow">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-parking-blue mr-2" />
                    <span>Up to 200 parking spots</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-parking-blue mr-2" />
                    <span>Advanced analytics</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-parking-blue mr-2" />
                    <span>Priority support</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-parking-blue mr-2" />
                    <span>Multiple payment methods</span>
                  </li>
                </ul>
                <Button className="w-full hover-scale">Get Started</Button>
              </motion.div>
              
              <motion.div 
                className="bg-white p-8 rounded-lg shadow-md border border-gray-200 flex flex-col"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-bold mb-2">Enterprise</h3>
                <div className="text-3xl font-bold mb-4">$199<span className="text-sm text-gray-500 font-normal">/month</span></div>
                <p className="text-gray-600 mb-6">For large parking facilities.</p>
                <ul className="mb-8 space-y-3 flex-grow">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-parking-blue mr-2" />
                    <span>Unlimited parking spots</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-parking-blue mr-2" />
                    <span>Custom reporting</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-parking-blue mr-2" />
                    <span>24/7 dedicated support</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-parking-blue mr-2" />
                    <span>API access</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-parking-blue mr-2" />
                    <span>White-labeling</span>
                  </li>
                </ul>
                <Button className="w-full hover-scale">Contact Sales</Button>
              </motion.div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-parking-blue to-blue-600 text-white">
          <div className="container px-4 mx-auto">
            <div className="text-center max-w-3xl mx-auto">
              <motion.h2 
                className="text-3xl md:text-4xl font-bold mb-6"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
              >
                Ready to transform your parking management?
              </motion.h2>
              <motion.p 
                className="text-lg mb-8 text-blue-100"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                viewport={{ once: true }}
              >
                Get started today and see how our system can help you streamline operations,
                increase revenue, and improve customer satisfaction.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                viewport={{ once: true }}
              >
                <Button asChild size="lg" variant="secondary" className="hover-scale">
                  <Link to="/register">Get Started Now</Link>
                </Button>
              </motion.div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}

function BarChart2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" x2="18" y1="20" y2="10" />
      <line x1="12" x2="12" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="14" />
    </svg>
  );
}
