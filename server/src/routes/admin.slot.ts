import { Router } from 'express';
import { createSlots, getSlots, updateSlotStatus } from '../controllers/slot.controller';
import protect from '../middleware/auth';

const router = Router();

router.post('/', protect, createSlots);
router.get('/', protect, getSlots);
router.patch('/:id', protect, updateSlotStatus);

export default router;
