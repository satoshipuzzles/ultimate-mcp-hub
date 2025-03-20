# Ultimate MCP Integration Hub

A comprehensive Model Context Protocol (MCP) server that acts as a universal integration hub to help Cursor's AI understand and interact with multiple external services. This integration hub provides a single, unified interface for connecting to various services, including communications, payments, data storage, and social networking.

## Integrated Services

- **Communications**
  - Twilio for SMS and voice communications
  - Mailtrap for email delivery

- **Payments**
  - Stripe for traditional credit card payments
  - LNBits for Bitcoin Lightning payments

- **Data**
  - MongoDB for database operations

- **Storage**
  - DigitalOcean Spaces for media storage and CDN delivery

- **Social**
  - Nostr protocol for decentralized social networking

## Project Structure

```
/
├── src/
│   ├── core/                 # Core functionality
│   │   ├── auth.js           # Authentication
│   │   ├── logger.js         # Logging
│   │   └── router.js         # API routing
│   ├── integrations/         # Service integrations
│   │   ├── communications/   # Communication services
│   │   │   ├── twilio.js     
│   │   │   └── mailtrap.js
│   │   ├── payments/         # Payment services
│   │   │   ├── stripe.js
│   │   │   └── lnbits.js
│   │   ├── data/             # Data services
│   │   │   └── mongodb.js
│   │   ├── storage/          # Storage services
│   │   │   └── digitalocean.js
│   │   └── social/           # Social services
│   │       └── nostr.js
│   ├── middleware/           # Express middleware
│   ├── utils/                # Utility functions
│   └── index.js              # Entry point
├── config/                   # Configuration
├── .env.example              # Environment variables example
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18.0.0 or higher)
- API credentials for the services you want to integrate

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ultimate-mcp-hub.git
   cd ultimate-mcp-hub
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` to add your specific API credentials and configuration.

4. Build the TypeScript code:
   ```bash
   npm run build
   ```

5. Start the server:
   ```bash
   npm start
   ```

   For development with auto-reload:
   ```bash
   npm run dev
   ```

## API Reference

### Authentication

All API endpoints require authentication using a JWT token.

```
Authorization: Bearer <token>
```

To get a token, you need to implement authentication using the auth.ts module.

### Communications API

#### Send SMS (Twilio)

```
POST /api/communications/sms
```

Request body:
```json
{
  "to": "+15551234567",
  "body": "Hello from MCP Hub!",
  "from": "+15557654321" // Optional, uses default if not provided
}
```

#### Send Email (Mailtrap)

```
POST /api/communications/email
```

Request body:
```json
{
  "to": "recipient@example.com",
  "subject": "Hello from MCP Hub",
  "text": "This is a test email",
  "html": "<p>This is a test email</p>", // Optional
  "from": "sender@example.com" // Optional, uses default if not provided
}
```

### Payments API

#### Create Payment (Stripe)

```
POST /api/payments/stripe/intent
```

Request body:
```json
{
  "amount": 1000, // Amount in cents
  "currency": "usd", // Optional, defaults to USD
  "metadata": { "order_id": "12345" } // Optional
}
```

#### Create Lightning Invoice (LNBits)

```
POST /api/payments/lightning/invoice
```

Request body:
```json
{
  "amount": 10000, // Amount in sats
  "memo": "Payment for service",
  "expiresIn": 86400 // Optional, time in seconds
}
```

### Data API

#### Create Document (MongoDB)

```
POST /api/data/mongodb/:collection
```

Request body:
```json
{
  "field1": "value1",
  "field2": "value2"
}
```

### Storage API

#### Upload File (DigitalOcean Spaces)

```
POST /api/storage/upload
```

Request body (multipart/form-data):
```
file: [binary data]
key: "path/to/file.jpg"
isPublic: true
```

### Social API

#### Publish Nostr Event

```
POST /api/social/nostr/publish
```

Request body:
```json
{
  "relayUrl": "wss://relay.example.com",
  "kind": 1,
  "content": "Hello from MCP Hub!",
  "tags": [["e", "event_id"], ["p", "pubkey"]] // Optional
}
```

## Deployment

### Vercel Deployment

1. Push your code to GitHub.
2. Connect your repository to Vercel.
3. Configure the environment variables in the Vercel dashboard.
4. Deploy the application.

### Environment Variables

Configure environment variables in Vercel's dashboard or through the Vercel CLI. Make sure to set all the required API credentials securely.

## Security Considerations

- All API credentials are stored as environment variables
- Authentication is implemented using JWT
- Rate limiting protects against abuse
- Sensitive data is encrypted in transit and at rest

## Development Roadmap

1. ✅ Initial setup and core framework
2. ✅ Communications integrations
3. ✅ Payment integrations
4. ✅ Data integrations
5. ✅ Storage integrations
6. ✅ Social integrations
7. ⬜ Comprehensive testing
8. ⬜ Documentation and examples
9. ⬜ Security auditing
10. ⬜ Production deployment

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. 