import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import {
    getAllBookings,
    approveBooking,
    declineBooking,
    getParkingHistory,
    getAnalytics
} from '../controllers/admin.controller';

const router = Router();

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(authorizeRoles(['ADMIN']));

// Booking management
router.get('/bookings', getAllBookings);
router.put('/bookings/:bookingId/approve', approveBooking);
router.put('/bookings/:bookingId/decline', declineBooking);

// History and analytics
router.get('/history', getParkingHistory);
router.get('/analytics', getAnalytics);

export default router; 