import { Router } from 'express';
import { authenticateToken } from '../middleware/auth';
import { getAnalytics } from '../controllers/analytics.controller';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Analytics routes
router.get('/', getAnalytics);

export default router;