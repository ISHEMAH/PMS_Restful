import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1';
let adminToken: string;

async function testReports() {
    try {
        // 1. Create admin user
        console.log('Creating admin user...');
        const adminResponse = await axios.post(`${API_URL}/auth/create-admin`, {
            email: 'admin@test.com',
            password: 'admin123',
            firstName: 'Admin',
            lastName: 'User'
        });
        console.log('Admin created:', adminResponse.data);

        // 2. Login as admin
        console.log('\nLogging in as admin...');
        const loginResponse = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@test.com',
            password: 'admin123'
        });
        adminToken = loginResponse.data.token;
        console.log('Login successful');

        // 3. Create a parking
        console.log('\nCreating parking...');
        const parkingResponse = await axios.post(
            `${API_URL}/parking`,
            {
                name: 'Test Parking',
                location: 'Test Location',
                totalSpaces: 10,
                chargingFeePerHour: 5
            },
            {
                headers: { Authorization: `Bearer ${adminToken}` }
            }
        );
        const parkingId = parkingResponse.data.id;
        console.log('Parking created:', parkingResponse.data);

        // 4. Test parking report
        console.log('\nTesting parking report...');
        const parkingReportResponse = await axios.get(
            `${API_URL}/reports/parking?parkingId=${parkingId}`,
            {
                headers: { Authorization: `Bearer ${adminToken}` }
            }
        );
        console.log('Parking report:', parkingReportResponse.data);

        // 5. Test financial report
        console.log('\nTesting financial report...');
        const financialReportResponse = await axios.get(
            `${API_URL}/reports/financial`,
            {
                headers: { Authorization: `Bearer ${adminToken}` }
            }
        );
        console.log('Financial report:', financialReportResponse.data);

        // 6. Test occupancy report
        console.log('\nTesting occupancy report...');
        const occupancyReportResponse = await axios.get(
            `${API_URL}/reports/occupancy`,
            {
                headers: { Authorization: `Bearer ${adminToken}` }
            }
        );
        console.log('Occupancy report:', occupancyReportResponse.data);

    } catch (error) {
        if (axios.isAxiosError(error)) {
            console.error('Error:', error.response?.data || error.message);
        } else if (error instanceof Error) {
            console.error('Error:', error.message);
        } else {
            console.error('Unknown error:', error);
        }
    }
}

testReports(); 