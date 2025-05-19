// src/routes/auth.routes.ts

import { Router } from 'express';
import { signup, login, createAdmin } from '../controllers/auth.controller';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.post('/create-admin', createAdmin); // only for Postman with admin-secret

export default router;
