// src/app.ts

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import YAML from 'yamljs';
import swaggerUi from 'swagger-ui-express';
import { limiter, csrfProtection, securityHeaders } from './middleware/security';
import adminRoutes from './routes/admin.routes';
import authRoutes from './routes/auth.routes';
import bookingRoutes from "./routes/booking.routes";
import checkoutRoutes from './routes/checkout.routes';
import historyRoutes from './routes/history.routes';
import analyticsRoutes from './routes/analytics.routes';
import parkingRoutes from './routes/parking.routes';
import ticketRoutes from './routes/ticket.routes';
import vehicleRoutes from './routes/vehicle.routes';
import { errorHandler } from './middleware/error';
import path from 'path';

// Load environment variables
const result = dotenv.config({ path: path.join(__dirname, '../.env') });
console.log('Environment variables loaded:', result);
console.log('ADMIN_KEY:', process.env.ADMIN_KEY);

const app = express();
const swaggerDocument = YAML.load('./swagger/docs.yaml');

// Configure Swagger UI
const swaggerOptions = {
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    syntaxHighlight: {
      theme: 'monokai'
    }
  }
};

app.use(limiter);
app.use(securityHeaders);
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(express.json());
app.use(csrfProtection);

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, swaggerOptions));

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/vehicles', vehicleRoutes);
app.use('/api/v1/bookings', bookingRoutes);
app.use('/api/v1/checkout', checkoutRoutes);
app.use('/api/v1/history', historyRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/parking', parkingRoutes);
app.use('/api/v1/tickets', ticketRoutes);

// Error handling middleware
app.use(errorHandler);

export default app;
