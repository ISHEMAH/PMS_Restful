import express, { Request, Response, NextFunction, RequestHandler } from 'express';
import { checkoutVehicle } from '../controllers/checkout.controller';
import protect from '../middleware/auth';

const router = express.Router();

const checkoutHandler: RequestHandler = async (req: Request, res: Response) => {
  try {
    const { bookingId } = req.params;
    if (!bookingId) {
      res.status(400).json({ error: 'Booking ID is required' });
      return;
    }
    
    const result = await checkoutVehicle(bookingId);
    res.json(result);
    return;
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ error: 'Failed to checkout vehicle' });
    return;
  }
};

router.post('/:bookingId', protect, checkoutHandler);

export default router;