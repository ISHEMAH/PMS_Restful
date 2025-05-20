import { Router } from "express";
import {
  createBooking,
  getBookings,
  getBookingById,
  updateBooking
} from '../controllers/booking.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Booking routes
router.post('/', createBooking);
router.get('/', getBookings);
router.get('/:id', getBookingById);
router.put('/:id', updateBooking);

export default router;
