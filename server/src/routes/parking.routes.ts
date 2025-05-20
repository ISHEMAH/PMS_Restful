import { Router } from 'express';
import {
    createParking,
    getParkings,
    getParkingById,
    updateParking,
    deleteParking,
} from '../controllers/parking.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all parkings (accessible by all authenticated users)
router.get('/', getParkings);

// Get parking by ID (accessible by all authenticated users)
router.get('/:id', getParkingById);

// Create parking (admin only)
router.post(
    '/',
    authorizeRoles(['ADMIN']),
    createParking
);

// Update parking (admin only)
router.put(
    '/:id',
    authorizeRoles(['ADMIN']),
    updateParking
);

// Delete parking (admin only)
router.delete(
    '/:id',
    authorizeRoles(['ADMIN']),
    deleteParking
);

export default router; 