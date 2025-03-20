import { Request, Response, NextFunction } from 'express';
import logger from '../core/logger';

// Custom error class for API errors
export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error middleware
export function errorMiddleware(
  err: Error | ApiError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Determine status code, default to 500
  const statusCode = 'statusCode' in err ? err.statusCode : 500;
  
  // Log the error
  logger.error(`[${statusCode}] ${err.message}`, {
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });
  
  // Send error response
  res.status(statusCode).json({
    success: false,
    error: {
      message: err.message,
      ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
    }
  });
}

// 404 handler middleware
export function notFoundMiddleware(req: Request, res: Response, next: NextFunction) {
  const error = new ApiError(`Resource not found - ${req.originalUrl}`, 404);
  next(error);
} 