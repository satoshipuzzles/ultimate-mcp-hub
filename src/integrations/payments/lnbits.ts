import axios from 'axios';
import logger from '../../core/logger';

/**
 * Create a new Lightning invoice
 * @param amount Amount in sats
 * @param memo Description for the invoice
 * @param expiresIn Time in seconds for invoice expiration (default: 86400 = 24 hours)
 */
export async function createInvoice(amount: number, memo: string, expiresIn: number = 86400) {
  try {
    const apiUrl = process.env.LNBITS_API_URL;
    const adminKey = process.env.LNBITS_ADMIN_KEY;
    
    if (!apiUrl || !adminKey) {
      throw new Error('LNBits API URL or admin key not provided');
    }
    
    const response = await axios.post(
      `${apiUrl}/api/v1/payments`, 
      {
        out: false,
        amount: amount,
        memo: memo,
        expiry: expiresIn
      },
      {
        headers: {
          'X-Api-Key': adminKey,
          'Content-Type': 'application/json'
        }
      }
    );
    
    logger.info(`Lightning invoice created successfully. Payment hash: ${response.data.payment_hash}`);
    return {
      success: true,
      paymentHash: response.data.payment_hash,
      paymentRequest: response.data.payment_request,
      invoiceId: response.data.payment_hash,
      checkingId: response.data.checking_id
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = axios.isAxiosError(error) && error.response ? error.response.status : 'unknown';
    logger.error(`Failed to create Lightning invoice (${statusCode}): ${errorMessage}`);
    
    if (axios.isAxiosError(error) && error.response) {
      logger.error(`LNBits API response: ${JSON.stringify(error.response.data)}`);
    }
    
    throw error;
  }
}

/**
 * Check if a Lightning invoice has been paid
 * @param paymentHash Payment hash of the invoice
 */
export async function checkInvoiceStatus(paymentHash: string) {
  try {
    const apiUrl = process.env.LNBITS_API_URL;
    const readKey = process.env.LNBITS_INVOICE_READ_KEY;
    
    if (!apiUrl || !readKey) {
      throw new Error('LNBits API URL or invoice read key not provided');
    }
    
    const response = await axios.get(
      `${apiUrl}/api/v1/payments/${paymentHash}`,
      {
        headers: {
          'X-Api-Key': readKey
        }
      }
    );
    
    const isPaid = response.data.paid;
    logger.info(`Lightning invoice ${paymentHash} status checked: ${isPaid ? 'PAID' : 'UNPAID'}`);
    
    return {
      success: true,
      paid: isPaid,
      details: response.data
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = axios.isAxiosError(error) && error.response ? error.response.status : 'unknown';
    logger.error(`Failed to check Lightning invoice status (${statusCode}): ${errorMessage}`);
    
    if (axios.isAxiosError(error) && error.response) {
      logger.error(`LNBits API response: ${JSON.stringify(error.response.data)}`);
    }
    
    throw error;
  }
}

/**
 * Pay a Lightning invoice (requires admin key)
 * @param bolt11 BOLT11 Lightning invoice to pay
 */
export async function payInvoice(bolt11: string) {
  try {
    const apiUrl = process.env.LNBITS_API_URL;
    const adminKey = process.env.LNBITS_ADMIN_KEY;
    
    if (!apiUrl || !adminKey) {
      throw new Error('LNBits API URL or admin key not provided');
    }
    
    const response = await axios.post(
      `${apiUrl}/api/v1/payments`,
      {
        out: true,
        bolt11: bolt11
      },
      {
        headers: {
          'X-Api-Key': adminKey,
          'Content-Type': 'application/json'
        }
      }
    );
    
    logger.info(`Lightning invoice paid successfully. Payment hash: ${response.data.payment_hash}`);
    return {
      success: true,
      paymentHash: response.data.payment_hash,
      details: response.data
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = axios.isAxiosError(error) && error.response ? error.response.status : 'unknown';
    logger.error(`Failed to pay Lightning invoice (${statusCode}): ${errorMessage}`);
    
    if (axios.isAxiosError(error) && error.response) {
      logger.error(`LNBits API response: ${JSON.stringify(error.response.data)}`);
    }
    
    throw error;
  }
} 