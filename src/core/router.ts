import { Express, Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import logger from './logger';

// MCP tool definitions
const mcpTools = [
  {
    name: "communications_send_sms",
    description: "Send an SMS message via Twilio",
    parameters: {
      type: "object",
      properties: {
        to: { type: "string", description: "The recipient phone number" },
        body: { type: "string", description: "The message body" }
      },
      required: ["to", "body"]
    }
  },
  {
    name: "payments_create_invoice",
    description: "Create a payment invoice via Stripe",
    parameters: {
      type: "object",
      properties: {
        amount: { type: "number", description: "Amount in cents" },
        currency: { type: "string", description: "Currency code (e.g., USD)" },
        customer_email: { type: "string", description: "Customer email address" }
      },
      required: ["amount", "currency", "customer_email"]
    }
  }
];

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

  // MCP SSE endpoint for Cursor integration
  app.get('/sse', (req: Request, res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Send initial connection message
    res.write('event: connected\n');
    res.write(`data: ${JSON.stringify({ message: 'Connected to MCP Hub' })}\n\n`);
    
    logger.info('New SSE connection established');
    
    // Send tool definitions
    res.write('event: tools\n');
    res.write(`data: ${JSON.stringify({ tools: mcpTools })}\n\n`);
    
    // Keep the connection alive
    const keepAlive = setInterval(() => {
      res.write(': keepalive\n\n');
    }, 30000);
    
    // Clean up on close
    req.on('close', () => {
      logger.info('SSE connection closed');
      clearInterval(keepAlive);
    });
  });
  
  // MCP POST endpoint for handling tool calls
  app.post('/mcp', (req: Request, res: Response) => {
    const { tool, parameters } = req.body;
    logger.info(`MCP tool call received: ${tool}`);
    logger.debug(`Parameters: ${JSON.stringify(parameters)}`);
    
    // Handle different tool requests
    switch (tool) {
      case 'communications_send_sms':
        // Simulated response for demo purposes
        res.json({ 
          success: true, 
          message: `SMS sent to ${parameters.to}: "${parameters.body}"`,
          sid: `SM${Math.random().toString(36).substr(2, 9)}`
        });
        break;
      
      case 'payments_create_invoice':
        // Simulated response for demo purposes
        res.json({ 
          success: true, 
          invoice_id: `inv_${Math.random().toString(36).substr(2, 9)}`,
          amount: parameters.amount,
          currency: parameters.currency,
          customer_email: parameters.customer_email,
          status: "pending"
        });
        break;
        
      default:
        logger.warn(`Unknown tool called: ${tool}`);
        res.status(400).json({ 
          success: false, 
          message: `Unknown tool: ${tool}` 
        });
    }
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