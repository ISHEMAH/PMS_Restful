
import React, { useState, useEffect } from 'react';
import { Search, Car } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface Owner {
  id: string;
  name: string;
  email: string;
}

interface Vehicle {
  id: string;
  licensePlate: string;
  type: string;
  color: string;
  owner: Owner;
  currentBooking: {
    id: string;
    slotNumber: number;
    startTime: string;
  } | null;
}

// Mock data - replace with API call in production
const mockVehicles: Vehicle[] = [
  {
    id: '1',
    licensePlate: 'ABC123',
    type: 'Sedan',
    color: 'Blue',
    owner: {
      id: '101',
      name: 'John Doe',
      email: 'john@example.com',
    },
    currentBooking: {
      id: '201',
      slotNumber: 5,
      startTime: '2025-05-19T10:30:00',
    },
  },
  {
    id: '2',
    licensePlate: 'XYZ789',
    type: 'SUV',
    color: 'Black',
    owner: {
      id: '102',
      name: 'Jane Smith',
      email: 'jane@example.com',
    },
    currentBooking: null,
  },
  {
    id: '3',
    licensePlate: 'DEF456',
    type: 'Compact',
    color: 'Red',
    owner: {
      id: '103',
      name: 'Alex Wang',
      email: 'alex@example.com',
    },
    currentBooking: {
      id: '203',
      slotNumber: 12,
      startTime: '2025-05-19T09:15:00',
    },
  },
];

const AdminVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(mockVehicles);
  const [searchTerm, setSearchTerm] = useState('');
  const [parkingStatus, setParkingStatus] = useState<'all' | 'parked' | 'not-parked'>('all');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const filteredVehicles = vehicles.filter((vehicle) => {
    const isParked = vehicle.currentBooking !== null;
    
    // Filter by parking status
    if (parkingStatus === 'parked' && !isParked) return false;
    if (parkingStatus === 'not-parked' && isParked) return false;
    
    // Filter by search term
    return (
      vehicle.licensePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.color.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.owner.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      vehicle.owner.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-2xl font-bold">Registered Vehicles</CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant={parkingStatus === 'all' ? 'default' : 'outline'}
                onClick={() => setParkingStatus('all')}
              >
                All
              </Button>
              <Button
                variant={parkingStatus === 'parked' ? 'default' : 'outline'}
                onClick={() => setParkingStatus('parked')}
              >
                Currently Parked
              </Button>
              <Button
                variant={parkingStatus === 'not-parked' ? 'default' : 'outline'}
                onClick={() => setParkingStatus('not-parked')}
              >
                Not Parked
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  placeholder="Search vehicles..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>License Plate</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Owner</TableHead>
                    <TableHead>Parking Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredVehicles.length > 0 ? (
                    filteredVehicles.map((vehicle) => (
                      <TableRow key={vehicle.id}>
                        <TableCell className="font-medium">{vehicle.licensePlate}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <Car className="mr-2 h-4 w-4" />
                            <span>
                              {vehicle.type}, {vehicle.color}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{vehicle.owner.name}</div>
                          <div className="text-sm text-gray-500">{vehicle.owner.email}</div>
                        </TableCell>
                        <TableCell>
                          {vehicle.currentBooking ? (
                            <div>
                              <Badge className="bg-green-100 text-green-800">
                                Parked at Slot #{vehicle.currentBooking.slotNumber}
                              </Badge>
                              <div className="text-xs text-gray-500 mt-1">
                                Since: {formatDate(vehicle.currentBooking.startTime)}
                              </div>
                            </div>
                          ) : (
                            <Badge variant="outline">Not currently parked</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center py-6 text-gray-500">
                        No vehicles found matching your search
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AdminVehicles;
