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

export default function handler(req, res) {
  // Allow CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle pre-flight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Handle MCP tools endpoint for discovery
  if (req.method === 'GET') {
    return res.status(200).json({ tools: mcpTools });
  }
  
  // Handle tool invocation
  if (req.method === 'POST') {
    const { tool, parameters } = req.body;
    console.log(`MCP tool call received: ${tool}`, parameters);
    
    // Handle different tool requests
    switch (tool) {
      case 'communications_send_sms':
        // Simulated response for demo purposes
        return res.status(200).json({ 
          success: true, 
          message: `SMS sent to ${parameters.to}: "${parameters.body}"`,
          sid: `SM${Math.random().toString(36).substring(2, 9)}`
        });
      
      case 'payments_create_invoice':
        // Simulated response for demo purposes
        return res.status(200).json({ 
          success: true, 
          invoice_id: `inv_${Math.random().toString(36).substring(2, 9)}`,
          amount: parameters.amount,
          currency: parameters.currency,
          customer_email: parameters.customer_email,
          status: "pending"
        });
        
      default:
        console.warn(`Unknown tool called: ${tool}`);
        return res.status(400).json({ 
          success: false, 
          message: `Unknown tool: ${tool}` 
        });
    }
  }
  
  // Handle other methods
  return res.status(405).json({ error: 'Method not allowed' });
} 