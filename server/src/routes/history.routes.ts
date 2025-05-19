import { Router } from 'express';
import { getParkingHistory } from '../controllers/history.controller';
import protect from '../middleware/auth';

const router = Router();

router.get('/admin/history', protect, getParkingHistory);

export default router;