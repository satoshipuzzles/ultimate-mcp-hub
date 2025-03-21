// Simple status endpoint
export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    server: 'MCP Hub API',
    timestamp: new Date().toISOString()
  });
} 