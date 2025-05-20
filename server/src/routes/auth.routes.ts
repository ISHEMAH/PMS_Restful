// src/routes/auth.routes.ts

import { Router } from 'express';
import { signup, login, createAdmin } from '../controllers/auth.controller';
import { validateAdminKey } from '../middleware/auth';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/create-admin', validateAdminKey, createAdmin);

export default router;
