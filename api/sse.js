// MCP tool definitions (same as in mcp.js for consistency)
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

export default function handler(req, res) {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Send initial connection message
  res.write('event: connected\n');
  res.write(`data: ${JSON.stringify({ message: 'Connected to MCP Hub' })}\n\n`);
  
  // Send tool definitions
  res.write('event: tools\n');
  res.write(`data: ${JSON.stringify({ tools: mcpTools })}\n\n`);
  
  // Note: Vercel has a timeout for serverless functions, typically 10 seconds
  // This means the connection will close after this time, but it should be
  // enough for Cursor to get the initial connection and tools data
  
  // End the response after sending the essential data
  res.end();
} 