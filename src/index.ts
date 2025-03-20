import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { createLogger } from './core/logger';
import { setupRoutes } from './core/router';
import { errorMiddleware } from './middleware/error';

// Service Integrations
import { initTwilio } from './integrations/communications/twilio';
import { initStripe } from './integrations/payments/stripe';
import { connectToMongoDB } from './integrations/data/mongodb';
import { initS3Client } from './integrations/storage/digitalocean';

// Load environment variables
dotenv.config();

// Initialize logger
const logger = createLogger();

// Create Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Apply middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Initialize service integrations
async function initializeIntegrations() {
  logger.info('Initializing service integrations...');
  
  try {
    // Initialize communications
    initTwilio();
    logger.info('Twilio integration initialized');
    
    // Initialize payments
    initStripe();
    logger.info('Stripe integration initialized');
    
    // Initialize data services
    await connectToMongoDB();
    logger.info('MongoDB integration initialized');
    
    // Initialize storage
    initS3Client();
    logger.info('DigitalOcean Spaces integration initialized');
    
    logger.info('All integrations initialized successfully');
  } catch (error) {
    logger.error(`Failed to initialize integrations: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Set up routes
setupRoutes(app);

// Error handling middleware
app.use(errorMiddleware);

// Start the server
app.listen(PORT, async () => {
  logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  
  // Initialize integrations after server start
  await initializeIntegrations();
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error(`Unhandled Rejection: ${err.message}`);
  // Close server & exit process
  process.exit(1);
});

export default app; 