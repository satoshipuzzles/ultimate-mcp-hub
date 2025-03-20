import twilio from 'twilio';
import logger from '../../core/logger';

// Twilio client instance
let twilioClient: twilio.Twilio | null = null;

/**
 * Initialize Twilio client
 */
export function initTwilio() {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    
    if (!accountSid || !authToken) {
      logger.warn('Twilio credentials not provided. SMS functionality will be unavailable.');
      return null;
    }
    
    twilioClient = twilio(accountSid, authToken);
    logger.info('Twilio client initialized successfully');
    return twilioClient;
  } catch (error) {
    logger.error(`Failed to initialize Twilio client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return null;
  }
}

/**
 * Get Twilio client instance
 */
export function getTwilioClient(): twilio.Twilio {
  if (!twilioClient) {
    const client = initTwilio();
    if (!client) {
      throw new Error('Twilio client is not initialized');
    }
    twilioClient = client;
  }
  return twilioClient;
}

/**
 * Send SMS message via Twilio
 * @param to Recipient phone number (E.164 format)
 * @param body Message content
 * @param from Sender phone number (optional, uses default from env if not provided)
 */
export async function sendSMS(to: string, body: string, from?: string) {
  try {
    const client = getTwilioClient();
    const fromNumber = from || process.env.TWILIO_PHONE_NUMBER;
    
    if (!fromNumber) {
      throw new Error('Sender phone number not provided');
    }
    
    const message = await client.messages.create({
      body,
      from: fromNumber,
      to
    });
    
    logger.info(`SMS sent successfully. SID: ${message.sid}`);
    return {
      success: true,
      sid: message.sid,
      status: message.status
    };
  } catch (error) {
    logger.error(`Failed to send SMS: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

/**
 * Make a voice call via Twilio
 * @param to Recipient phone number (E.164 format)
 * @param twimlUrl URL to TwiML instructions for the call
 * @param from Sender phone number (optional, uses default from env if not provided)
 */
export async function makeCall(to: string, twimlUrl: string, from?: string) {
  try {
    const client = getTwilioClient();
    const fromNumber = from || process.env.TWILIO_PHONE_NUMBER;
    
    if (!fromNumber) {
      throw new Error('Caller phone number not provided');
    }
    
    const call = await client.calls.create({
      url: twimlUrl,
      to,
      from: fromNumber
    });
    
    logger.info(`Call initiated successfully. SID: ${call.sid}`);
    return {
      success: true,
      sid: call.sid,
      status: call.status
    };
  } catch (error) {
    logger.error(`Failed to initiate call: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
} 