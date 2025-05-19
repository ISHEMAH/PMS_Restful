// src/app.ts

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';
import { limiter, csrfProtection, securityHeaders } from './middleware/security';
import adminSlotRoutes from './routes/admin.slot';
import authRoutes from './routes/auth.routes';
import bookingRoutes from "./routes/booking.routes";
import checkoutRoutes from './routes/checkout.routes';
import historyRoutes from './routes/history.routes';
import analyticsRoutes from './routes/analytics.routes';
import { errorHandler } from './middleware/error';

dotenv.config();

const app = express();
const swaggerDocument = YAML.load('./swagger/docs.yaml');

app.use(limiter);
app.use(securityHeaders);
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(csrfProtection);

// Routes with proper versioning
app.use('/api/v1/admin/slots', adminSlotRoutes);
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/booking', bookingRoutes);
app.use('/api/v1/checkout', checkoutRoutes);
app.use('/api/v1/history', historyRoutes);
app.use('/api/v1/analytics', analyticsRoutes);

// Error handling middleware
app.use(errorHandler);

// Swagger Docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Routes
app.use('/auth', authRoutes);

export default app;
