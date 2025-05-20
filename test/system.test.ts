import { authApi, userApi, parkingApi, vehicleApi, bookingApi, reportApi, adminApi } from '../client/src/lib/api-client';
import { BookingStatus, PaymentMethod, VehicleType, LoginResponse, User, Parking, Vehicle, Booking } from '../client/src/lib/types';

// Test data
const testUser = {
    email: `test.user.${Date.now()}@example.com`,
    password: 'Test@123',
    firstName: 'Test',
    lastName: 'User'
};

const testAdmin = {
    email: `test.admin.${Date.now()}@example.com`,
    password: 'Admin@123',
    firstName: 'Test',
    lastName: 'Admin'
};

const testParking = {
    name: 'Test Parking',
    location: 'Test Location',
    totalSpaces: 10,
    chargingFeePerHour: 5
};

const testVehicle = {
    plateNumber: `TEST-${Date.now()}`,
    type: 'CAR' as VehicleType
};

let userToken: string;
let adminToken: string;
let parkingId: string;
let vehicleId: string;
let bookingId: string;

async function runTests() {
    console.log('Starting system tests...\n');

    try {
        // 1. Authentication Tests
        console.log('1. Testing Authentication...');

        // Register user
        console.log('Registering test user...');
        const userResponse = await authApi.register(testUser) as LoginResponse;
        userToken = userResponse.token;
        console.log('✅ User registration successful');

        // Register admin
        console.log('Registering test admin...');
        const adminResponse = await authApi.register(testAdmin) as LoginResponse;
        adminToken = adminResponse.token;
        console.log('✅ Admin registration successful');

        // Login user
        console.log('Testing user login...');
        const loginResponse = await authApi.login({ email: testUser.email, password: testUser.password }) as LoginResponse;
        console.log('✅ User login successful');

        // 2. User Profile Tests
        console.log('\n2. Testing User Profile...');

        // Get user profile
        console.log('Getting user profile...');
        const profile = await userApi.getProfile() as User;
        console.log('✅ User profile retrieved successfully');

        // Update user profile
        console.log('Updating user profile...');
        await userApi.updateProfile({ firstName: 'Updated', lastName: 'Name' });
        console.log('✅ User profile updated successfully');

        // 3. Parking Management Tests
        console.log('\n3. Testing Parking Management...');

        // Create parking
        console.log('Creating test parking...');
        const parking = await parkingApi.create(testParking) as Parking;
        parkingId = parking.id;
        console.log('✅ Parking created successfully');

        // Get parking details
        console.log('Getting parking details...');
        const parkingDetails = await parkingApi.getById(parkingId) as Parking;
        console.log('✅ Parking details retrieved successfully');

        // 4. Vehicle Management Tests
        console.log('\n4. Testing Vehicle Management...');

        // Create vehicle
        console.log('Creating test vehicle...');
        const vehicle = await vehicleApi.create(testVehicle) as Vehicle;
        vehicleId = vehicle.id;
        console.log('✅ Vehicle created successfully');

        // Get vehicle details
        console.log('Getting vehicle details...');
        const vehicleDetails = await vehicleApi.getById(vehicleId) as Vehicle;
        console.log('✅ Vehicle details retrieved successfully');

        // 5. Booking Tests
        console.log('\n5. Testing Booking System...');

        // Create booking
        console.log('Creating test booking...');
        const booking = await bookingApi.create({
            vehicleId,
            parkingId,
            entryTime: new Date().toISOString(),
            checkoutTime: new Date(Date.now() + 3600000).toISOString()
        }) as Booking;
        bookingId = booking.id;
        console.log('✅ Booking created successfully');

        // Get booking details
        console.log('Getting booking details...');
        const bookingDetails = await bookingApi.getById(bookingId) as Booking;
        console.log('✅ Booking details retrieved successfully');

        // 6. Admin Booking Management Tests
        console.log('\n6. Testing Admin Booking Management...');

        // Get all bookings
        console.log('Getting all bookings...');
        const allBookings = await bookingApi.adminGetAll() as Booking[];
        console.log('✅ All bookings retrieved successfully');

        // Approve booking
        console.log('Approving booking...');
        await bookingApi.approve(bookingId);
        console.log('✅ Booking approved successfully');

        // 7. Checkout and Payment Tests
        console.log('\n7. Testing Checkout and Payment...');

        // Process payment
        console.log('Processing payment...');
        await bookingApi.pay(bookingId, { paymentMethod: 'CARD' });
        console.log('✅ Payment processed successfully');

        // Checkout
        console.log('Processing checkout...');
        await bookingApi.checkout(bookingId);
        console.log('✅ Checkout processed successfully');

        // 8. Analytics and Reports Tests
        console.log('\n8. Testing Analytics and Reports...');

        // Get analytics
        console.log('Getting analytics...');
        const analytics = await adminApi.getAnalytics();
        console.log('✅ Analytics retrieved successfully');

        // Get parking report
        console.log('Getting parking report...');
        const parkingReport = await reportApi.getParkingReport(parkingId);
        console.log('✅ Parking report retrieved successfully');

        // Get revenue report
        console.log('Getting revenue report...');
        const revenueReport = await reportApi.getRevenueReport();
        console.log('✅ Revenue report retrieved successfully');

        console.log('\n✅ All tests completed successfully!');
    } catch (error) {
        console.error('\n❌ Test failed:', error);
        process.exit(1);
    }
}

// Run the tests
runTests(); 