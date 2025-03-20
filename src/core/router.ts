import { Express, Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import logger from './logger';

/**
 * Configure and set up API routes
 */
export function setupRoutes(app: Express) {
  // Apply rate limiting
  const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // 100 requests per window
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  });

  // Apply rate limiting to all routes
  app.use('/api', apiLimiter);

  // Health check route
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Default route
  app.get('/', (req: Request, res: Response) => {
    res.status(200).json({
      name: 'Ultimate MCP Integration Hub',
      version: '1.0.0',
      description: 'Universal integration hub for multiple external services via MCP protocol'
    });
  });

  // API Routes (to be implemented)
  // Communication routes
  app.use('/api/communications', (req: Request, res: Response) => {
    logger.debug('Communications endpoint hit');
    res.status(501).json({ message: 'Communications endpoints not implemented yet' });
  });

  // Payment routes
  app.use('/api/payments', (req: Request, res: Response) => {
    logger.debug('Payments endpoint hit');
    res.status(501).json({ message: 'Payment endpoints not implemented yet' });
  });

  // Data routes
  app.use('/api/data', (req: Request, res: Response) => {
    logger.debug('Data endpoint hit');
    res.status(501).json({ message: 'Data endpoints not implemented yet' });
  });

  // Storage routes
  app.use('/api/storage', (req: Request, res: Response) => {
    logger.debug('Storage endpoint hit');
    res.status(501).json({ message: 'Storage endpoints not implemented yet' });
  });

  // Social routes
  app.use('/api/social', (req: Request, res: Response) => {
    logger.debug('Social endpoint hit');
    res.status(501).json({ message: 'Social endpoints not implemented yet' });
  });

  // Catch all unmatched routes
  app.use('*', (req: Request, res: Response) => {
    logger.warn(`Attempted to access non-existent route: ${req.originalUrl}`);
    res.status(404).json({ message: 'Resource not found' });
  });
} 