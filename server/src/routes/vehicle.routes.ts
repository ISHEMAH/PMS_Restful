import { Router } from 'express';
import { createVehicle, getVehicles, updateVehicle, deleteVehicle } from '../controllers/vehicle.controller';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Protected routes
router.use(authenticateToken);

// Vehicle routes
router.post('/', createVehicle);
router.get('/', getVehicles);
router.patch('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

export default router;
