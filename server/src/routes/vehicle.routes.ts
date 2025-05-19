import { Router } from 'express';
import { createVehicle, getVehicles, updateVehicle, deleteVehicle } from '../controllers/vehicle.controller';
import protect from '../middleware/auth';

const router = Router();

// Protected routes
// router.use(protect);

// Vehicle routes
router.post('/', protect, createVehicle);
router.get('/', protect, getVehicles);
router.patch('/:id', protect, updateVehicle);
router.delete('/:id', protect, deleteVehicle);

export default router;
