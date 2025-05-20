import { Router } from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth';
import {
    getAllReports,
    exportReports,
    getRevenueReport,
    getOccupancyReport,
    getVehicleTypeReport,
    getPeakHoursReport
} from '../controllers/report.controller';

const router = Router();

// All routes require authentication and admin role
router.use(authenticateToken);
router.use(authorizeRoles(['ADMIN']));

// Report routes
router.get('/', getAllReports);
router.get('/export', exportReports);
router.get('/revenue', getRevenueReport);
router.get('/occupancy', getOccupancyReport);
router.get('/vehicle-types', getVehicleTypeReport);
router.get('/peak-hours', getPeakHoursReport);

export default router; 