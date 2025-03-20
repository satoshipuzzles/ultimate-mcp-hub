import { initTwilio } from '../integrations/communications/twilio';
import { initStripe } from '../integrations/payments/stripe';
import { initS3Client } from '../integrations/storage/digitalocean';

// Mock environment variables
beforeAll(() => {
  process.env.TWILIO_ACCOUNT_SID = 'test-account-sid';
  process.env.TWILIO_AUTH_TOKEN = 'test-auth-token';
  process.env.STRIPE_SECRET_KEY = 'test-stripe-key';
  process.env.DO_SPACES_KEY = 'test-do-key';
  process.env.DO_SPACES_SECRET = 'test-do-secret';
  process.env.DO_SPACES_ENDPOINT = 'test-do-endpoint';
  process.env.DO_SPACES_BUCKET = 'test-bucket';
});

// Mock external clients
jest.mock('twilio', () => {
  return jest.fn().mockImplementation(() => {
    return {
      messages: {
        create: jest.fn().mockResolvedValue({ sid: 'test-sid', status: 'sent' })
      },
      calls: {
        create: jest.fn().mockResolvedValue({ sid: 'test-call-sid', status: 'queued' })
      }
    };
  });
});

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => {
    return {
      paymentIntents: {
        create: jest.fn().mockResolvedValue({ 
          id: 'test-payment-id', 
          client_secret: 'test-secret',
          status: 'requires_payment_method' 
        }),
        retrieve: jest.fn().mockResolvedValue({ id: 'test-payment-id', status: 'succeeded' })
      },
      customers: {
        create: jest.fn().mockResolvedValue({ id: 'test-customer-id', email: 'test@example.com' })
      }
    };
  });
});

jest.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: jest.fn().mockImplementation(() => {
      return {
        send: jest.fn().mockResolvedValue({ 
          ETag: 'test-etag',
          Contents: [{ Key: 'test-file.txt', Size: 100 }]
        })
      };
    }),
    PutObjectCommand: jest.fn(),
    GetObjectCommand: jest.fn(),
    DeleteObjectCommand: jest.fn(),
    ListObjectsCommand: jest.fn()
  };
});

describe('Service Integrations', () => {
  describe('Twilio Integration', () => {
    test('should initialize Twilio client', () => {
      const client = initTwilio();
      expect(client).not.toBeNull();
    });
  });

  describe('Stripe Integration', () => {
    test('should initialize Stripe client', () => {
      const client = initStripe();
      expect(client).not.toBeNull();
    });
  });

  describe('DigitalOcean Spaces Integration', () => {
    test('should initialize S3 client', () => {
      const client = initS3Client();
      expect(client).toBeDefined();
    });
  });
}); 