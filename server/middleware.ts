import { Request, Response, NextFunction } from 'express';
import { User } from '@shared/schema';
import { verifyToken, extractTokenFromHeader } from './auth';
import { storage } from './storage';

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get user from database
    const user = await storage.getUser(payload.userId);
    if (!user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}

export async function requireAdmin(req: Request, res: Response, next: NextFunction) {
  try {
    // Extract token from Authorization header
    const token = extractTokenFromHeader(req.headers.authorization);
    
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Verify token
    const payload = verifyToken(token);
    if (!payload) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Get user from database
    const user = await storage.getUser(payload.userId);
    if (!user || user.role !== 'admin') {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
}
