#!/usr/bin/env node

/**
 * MCP Hub Connector Script
 * This script acts as a bridge between Cursor and your hosted MCP Hub.
 * 
 * Usage: npx serve-mcp
 */

const { createServer } = require('http');
const { request } = require('https');
const { parse } = require('url');

const PORT = 3456;
const TARGET_URL = 'https://ultimate-mcp-hub.vercel.app/api/mcp';

const server = createServer((req, res) => {
  // Handle SSE endpoint
  if (req.url === '/sse') {
    console.log('SSE connection requested');
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    
    // Send connected event
    res.write(`event: connected\ndata: ${JSON.stringify({ message: 'Connected to MCP Hub' })}\n\n`);
    
    // Send tools event with MCP tools definition
    const tools = [
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
    
    res.write(`event: tools\ndata: ${JSON.stringify({ tools })}\n\n`);
    
    // Keep connection alive
    const keepAlive = setInterval(() => {
      res.write(': ping\n\n');
    }, 30000);
    
    // Handle client disconnect
    req.on('close', () => {
      clearInterval(keepAlive);
      console.log('SSE connection closed');
    });
    
    return;
  }
  
  // Handle MCP tool requests
  if (req.url === '/mcp' && req.method === 'POST') {
    console.log('MCP tool call received');
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      console.log('Request body:', body);
      
      // Forward request to the remote API
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      };
      
      const proxyReq = request(TARGET_URL, options, proxyRes => {
        res.writeHead(proxyRes.statusCode, proxyRes.headers);
        proxyRes.pipe(res);
      });
      
      proxyReq.on('error', e => {
        console.error('Error forwarding request:', e);
        res.statusCode = 500;
        res.end(JSON.stringify({ error: 'Failed to reach MCP Hub API' }));
      });
      
      proxyReq.write(body);
      proxyReq.end();
    });
    
    return;
  }
  
  // Handle other requests
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({
    name: 'MCP Hub Connector',
    endpoints: {
      '/sse': 'SSE connection endpoint',
      '/mcp': 'MCP tool request endpoint'
    }
  }));
});

server.listen(PORT, () => {
  console.log(`
=========================================
🚀 MCP Hub Connector running on port ${PORT}!
=========================================

To connect Cursor to your MCP Hub:

1. Create or update ~/.cursor/mcp.json with:
{
  "mcpServers": {
    "ultimate-mcp-hub": {
      "type": "sse",
      "url": "http://localhost:${PORT}/sse"
    }
  }
}

2. Restart Cursor

This connector will forward requests to: ${TARGET_URL}
  `);
}); 