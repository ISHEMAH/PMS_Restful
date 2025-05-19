import { Request, Response, NextFunction } from 'express';
import { RateLimiterService } from '../services/rate-limiter.service';

const rateLimiter = RateLimiterService.createDefault();
const authRateLimiter = RateLimiterService.createAuth();

export const rateLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await rateLimiter.consume(req);
    next();
  } catch (error) {
    res.status(429).json({
      error: 'Too many requests',
      message: error.message,
    });
  }
};

export const authRateLimit = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await authRateLimiter.consume(req);
    next();
  } catch (error) {
    res.status(429).json({
      error: 'Too many login attempts',
      message: error.message,
    });
  }
};
