import { z } from 'zod';

// User schemas
export const userSignupSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)/),
  plateNumber: z.string().min(6).max(12)
});

export const vehicleUpdateSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  plateNumber: z.string().min(6).max(12).optional()
});

// Booking schemas
export const bookingSchema = z.object({
  slotId: z.number().positive(),
  vehicleId: z.number().positive()
});

// Checkout schema
export const checkoutSchema = z.object({
  bookingId: z.number().positive()
});

// Admin schemas
export const adminSlotSchema = z.object({
  number: z.string(),
  type: z.enum(['CAR', 'MOTORCYCLE', 'BIKE']),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'])
});

// Validation middleware
export const validate = (schema: z.ZodSchema) => {
  return (req: any, res: any, next: any) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        });
      }
      next(error);
    }
  };
};
