// src/server.ts

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { CronService } from './services/cron.service';
import { prisma } from './types/prisma';
import swaggerUi from 'swagger-ui-express';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Add these lines before your routes
const swaggerDocument = require('../swagger/swagger.json');

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.get('/swagger.json', (req, res) => {
  res.json(swaggerDocument);
});

// Routes
app.use('/api/auth', require('./routes/auth.routes').default);
app.use('/api/admin/slots', require('./routes/admin.slot').default);
app.use('/api/vehicles', require('./routes/vehicle.routes').default);
app.use('/api/bookings', require('./routes/booking.routes').default);
app.use('/api/checkout', require('./routes/checkout.routes').default);
app.use('/api/history', require('./routes/history.routes').default);
app.use('/api/analytics', require('./routes/analytics.routes').default);

// Error handling
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start cron service
const cronService = new CronService();

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
