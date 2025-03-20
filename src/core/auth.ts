import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import logger from './logger';

// Interface for token payload
export interface TokenPayload {
  id: string;
  role: string;
  [key: string]: any;
}

/**
 * Generates a JWT token
 * @param payload Data to include in the token
 * @returns JWT token string
 */
export function generateToken(payload: TokenPayload): string {
  const secret = process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-production';
  const expiresIn = process.env.JWT_EXPIRATION || '1d';
  
  // Cast to any to avoid type issues with the JWT library
  return jwt.sign(payload, secret as any, { expiresIn });
}

/**
 * Verifies a JWT token
 * @param token JWT token to verify
 * @returns Decoded token payload or null if invalid
 */
export function verifyToken(token: string): TokenPayload | null {
  try {
    const secret = process.env.JWT_SECRET || 'fallback-secret-do-not-use-in-production';
    return jwt.verify(token, secret) as TokenPayload;
  } catch (error) {
    logger.error(`Token verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

/**
 * Middleware to protect routes requiring authentication
 */
export function authMiddleware(req: Request & { user?: TokenPayload }, res: Response, next: NextFunction) {
  // Get token from header
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

  if (!token) {
    logger.warn('Auth failed: No token provided');
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Verify token
  const decoded = verifyToken(token);
  if (!decoded) {
    logger.warn('Auth failed: Invalid token');
    return res.status(401).json({ message: 'Invalid or expired authentication' });
  }

  // Set user in request object
  req.user = decoded;
  next();
}

/**
 * Role-based authorization middleware
 * @param roles Array of allowed roles
 */
export function roleCheck(roles: string[]) {
  return (req: Request & { user?: TokenPayload }, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      logger.warn(`Role check failed: User ${req.user.id} with role ${req.user.role} attempted to access restricted resource`);
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
} 