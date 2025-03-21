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

// Format SSE data properly
function formatSSE(event, data) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export default function handler(req, res) {
  // Set SSE headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  // Send initial connection message
  res.write(formatSSE('connected', { message: 'Connected to MCP Hub' }));
  
  // Send tool definitions
  res.write(formatSSE('tools', { tools: mcpTools }));
  
  // For Vercel's serverless functions, we need to end the connection
  // after sending the initial data since they don't support long-lived connections
  res.end();
} 