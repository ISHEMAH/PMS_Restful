import jwt from 'jsonwebtoken';
import { RequestHandler, Request, Response, NextFunction } from 'express';
import { verify } from 'jsonwebtoken';
import { User } from '../types/user';
import { prisma } from '../types/prisma';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export const protect: RequestHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      res.status(401).json({ error: 'Not authorized to access this route' });
      return;
    }

    const decoded = verify(token, process.env.JWT_SECRET!);
    if (!decoded || typeof decoded !== 'object' || !('id' in decoded)) {
      res.status(401).json({ error: 'Invalid token' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, name: true, role: true }
    });

    if (!user) {
      res.status(401).json({ error: 'User not found' });
      return;
    }

    (req as AuthenticatedRequest).user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Authentication failed' });
    return;
  }
};

export const authorize = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const authReq = req as AuthenticatedRequest;
    if (!authReq.user) {
      res.status(401).json({ error: 'Not authorized to access this route' });
      return;
    }

    if (!roles.includes(authReq.user.role)) {
      res.status(403).json({ error: 'Not authorized to access this route' });
      return;
    }

    next();
  };
};

export default protect;
