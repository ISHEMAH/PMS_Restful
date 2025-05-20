import { Router } from 'express';
import {
    createTicket,
    updateTicket,
    getTickets,
    getTicketById,
} from '../controllers/ticket.controller';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// Get all tickets (with optional date range filter)
router.get('/', getTickets);

// Get ticket by ID
router.get('/:id', getTicketById);

// Create ticket (user only)
router.post(
    '/',
    authorizeRoles(['USER']),
    createTicket
);

// Update ticket (user only)
router.put(
    '/:id',
    authorizeRoles(['USER']),
    updateTicket
);

export default router; 