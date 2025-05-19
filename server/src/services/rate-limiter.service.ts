import { RateLimiterMemory } from 'rate-limiter-flexible';
import { Request } from 'express';

interface RateLimiterConfig {
  points: number;
  duration: number; // in seconds
  blockDuration: number; // in seconds
}

export class RateLimiterService {
  private rateLimiter: RateLimiterMemory;

  constructor(config: RateLimiterConfig) {
    this.rateLimiter = new RateLimiterMemory({
      points: config.points,
      duration: config.duration,
      blockDuration: config.blockDuration,
    });
  }

  async consume(req: Request): Promise<void> {
    const key = this.getKey(req);
    try {
      await this.rateLimiter.consume(key);
    } catch (error) {
      throw new Error(`Rate limit exceeded. Try again in ${error.msBeforeNext / 1000} seconds.`);
    }
  }

  private getKey(req: Request): string {
    // Use IP address for rate limiting
    const ip = req.ip || req.ips?.[0] || 'unknown';
    return `ip:${ip}`;
  }

  static createDefault(): RateLimiterService {
    return new RateLimiterService({
      points: 100, // 100 requests
      duration: 60, // per minute
      blockDuration: 600, // block for 10 minutes if limit is exceeded
    });
  }

  static createAuth(): RateLimiterService {
    return new RateLimiterService({
      points: 5, // 5 login attempts
      duration: 300, // per 5 minutes
      blockDuration: 3600, // block for 1 hour if limit is exceeded
    });
  }
}
