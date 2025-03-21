export default function handler(req, res) {
  res.status(200).json({
    status: 'ok',
    message: 'MCP API is working',
    timestamp: new Date().toISOString()
  });
} 