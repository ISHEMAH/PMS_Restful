import { Router } from 'express';
import { checkoutVehicle } from '../controllers/checkout.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Checkout route
router.post('/:bookingId', checkoutVehicle);

export default router;