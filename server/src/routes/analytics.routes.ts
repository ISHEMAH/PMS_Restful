import express from 'express';
import protect from '../middleware/auth';
import { getAnalytics } from '../controllers/analytics.controller';

const router = express.Router();

router.get('/', protect, getAnalytics);

export default router;