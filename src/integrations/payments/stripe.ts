import Stripe from 'stripe';
import logger from '../../core/logger';

// Stripe client instance
let stripeClient: Stripe | null = null;

/**
 * Initialize Stripe client
 */
export function initStripe(): Stripe | null {
  try {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    
    if (!apiKey) {
      logger.warn('Stripe API key not provided. Stripe payment functionality will be unavailable.');
      return null;
    }
    
    stripeClient = new Stripe(apiKey, {
      apiVersion: '2025-02-24.acacia',
      typescript: true
    });
    
    logger.info('Stripe client initialized successfully');
    return stripeClient;
  } catch (error) {
    logger.error(`Failed to initialize Stripe client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

/**
 * Get Stripe client instance
 */
export function getStripeClient(): Stripe {
  if (!stripeClient) {
    const client = initStripe();
    if (!client) {
      throw new Error('Stripe client is not initialized');
    }
    stripeClient = client;
  }
  return stripeClient;
}

/**
 * Create a payment intent
 * @param amount Amount in cents
 * @param currency Currency code (e.g., 'usd')
 * @param metadata Additional metadata
 */
export async function createPaymentIntent(
  amount: number,
  currency: string = 'usd',
  metadata: Record<string, string> = {}
) {
  try {
    const stripe = getStripeClient();
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata,
      automatic_payment_methods: {
        enabled: true
      }
    });
    
    logger.info(`Payment intent created successfully. ID: ${paymentIntent.id}`);
    return {
      success: true,
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status
    };
  } catch (error) {
    logger.error(`Failed to create payment intent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

/**
 * Retrieve a payment intent
 * @param id Payment intent ID
 */
export async function retrievePaymentIntent(id: string) {
  try {
    const stripe = getStripeClient();
    const paymentIntent = await stripe.paymentIntents.retrieve(id);
    
    logger.info(`Payment intent retrieved successfully. ID: ${paymentIntent.id}`);
    return {
      success: true,
      paymentIntent
    };
  } catch (error) {
    logger.error(`Failed to retrieve payment intent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

/**
 * Create a customer
 * @param email Customer email
 * @param name Customer name
 * @param metadata Additional metadata
 */
export async function createCustomer(
  email: string,
  name?: string,
  metadata: Record<string, string> = {}
) {
  try {
    const stripe = getStripeClient();
    
    const customer = await stripe.customers.create({
      email,
      name,
      metadata
    });
    
    logger.info(`Customer created successfully. ID: ${customer.id}`);
    return {
      success: true,
      id: customer.id,
      customer
    };
  } catch (error) {
    logger.error(`Failed to create customer: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
} 