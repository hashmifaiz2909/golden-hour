import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/index.js';
import { db, User } from '../models/store.js';

export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function extractUserIdFromAuth(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  if (!token) return null;

  // Support seamless legacy demo tokens
  if (token.startsWith('demo-token-')) {
    return token.replace('demo-token-', '');
  }

  // Verify real signed JWT
  try {
    const decoded = jwt.verify(token, config.jwtSecret) as { id: string; email: string; role: string };
    return decoded.id;
  } catch (err) {
    return null;
  }
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const userId = extractUserIdFromAuth(req);
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid authentication token.' });
  }

  const user = db.getUserById(userId);
  if (!user) {
    return res.status(401).json({ error: 'Unauthorized: User account no longer exists.' });
  }

  req.user = user;
  next();
}

export function requireRole(role: 'rider' | 'responder' | 'admin') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized: Authentication required.' });
    }
    if (req.user.role !== role && req.user.role !== 'admin') {
      return res.status(403).json({ error: `Forbidden: Requires ${role} privileges.` });
    }
    next();
  };
}
