import axios from 'axios';
import logger from '../../core/logger';

// Mailtrap client configuration
const MAILTRAP_API_URL = 'https://send.api.mailtrap.io/api';

/**
 * Send an email via Mailtrap API
 * @param to Recipient email address or array of addresses
 * @param subject Email subject
 * @param text Plain text content
 * @param html HTML content (optional)
 * @param from Sender email address (optional, uses default from if not provided)
 * @param attachments Array of attachments (optional)
 */
export async function sendEmail({
  to,
  subject,
  text,
  html,
  from,
  attachments = []
}: {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
  from?: string;
  attachments?: Array<{ filename: string; content: string; encoding?: string }>;
}) {
  try {
    const apiToken = process.env.MAILTRAP_API_TOKEN;
    const inboxId = process.env.MAILTRAP_INBOX_ID;
    
    if (!apiToken) {
      throw new Error('Mailtrap API token not provided');
    }
    
    const fromEmail = from || `MCP Hub <no-reply@mcp-hub.example.com>`;
    const recipients = Array.isArray(to) ? to : [to];
    
    const payload = {
      to: recipients.map(email => ({ email })),
      from: { email: fromEmail },
      subject,
      text: { data: text },
      ...(html ? { html: { data: html } } : {}),
      ...(attachments.length > 0 ? { attachments } : {})
    };
    
    const response = await axios.post(`${MAILTRAP_API_URL}/send`, payload, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    logger.info(`Email sent successfully via Mailtrap. Message ID: ${response.data.message_id}`);
    return {
      success: true,
      messageId: response.data.message_id,
      response: response.data
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = axios.isAxiosError(error) && error.response ? error.response.status : 'unknown';
    logger.error(`Failed to send email via Mailtrap (${statusCode}): ${errorMessage}`);
    
    if (axios.isAxiosError(error) && error.response) {
      logger.error(`Mailtrap API response: ${JSON.stringify(error.response.data)}`);
    }
    
    throw error;
  }
}

/**
 * Send a template-based email via Mailtrap
 * @param to Recipient email address or array of addresses
 * @param templateId Mailtrap template ID
 * @param templateVars Template variables
 * @param from Sender email address (optional, uses default from if not provided)
 */
export async function sendTemplateEmail({
  to,
  templateId,
  templateVars,
  from
}: {
  to: string | string[];
  templateId: string;
  templateVars: Record<string, any>;
  from?: string;
}) {
  try {
    const apiToken = process.env.MAILTRAP_API_TOKEN;
    
    if (!apiToken) {
      throw new Error('Mailtrap API token not provided');
    }
    
    const fromEmail = from || `MCP Hub <no-reply@mcp-hub.example.com>`;
    const recipients = Array.isArray(to) ? to : [to];
    
    const payload = {
      to: recipients.map(email => ({ email })),
      from: { email: fromEmail },
      template_uuid: templateId,
      template_variables: templateVars
    };
    
    const response = await axios.post(`${MAILTRAP_API_URL}/send`, payload, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    logger.info(`Template email sent successfully via Mailtrap. Message ID: ${response.data.message_id}`);
    return {
      success: true,
      messageId: response.data.message_id,
      response: response.data
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const statusCode = axios.isAxiosError(error) && error.response ? error.response.status : 'unknown';
    logger.error(`Failed to send template email via Mailtrap (${statusCode}): ${errorMessage}`);
    
    if (axios.isAxiosError(error) && error.response) {
      logger.error(`Mailtrap API response: ${JSON.stringify(error.response.data)}`);
    }
    
    throw error;
  }
} 