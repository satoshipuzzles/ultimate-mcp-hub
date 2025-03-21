// API root endpoint
export default function handler(req, res) {
  res.status(200).json({
    name: 'Ultimate MCP Integration Hub',
    version: '1.0.0',
    description: 'Universal integration hub for multiple external services via MCP protocol',
    endpoints: {
      '/api/sse': 'MCP SSE connection endpoint',
      '/api/mcp': 'MCP tool request endpoint',
      '/api/check': 'API health check'
    }
  });
} 