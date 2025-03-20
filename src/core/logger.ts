import winston from 'winston';

/**
 * Creates and configures the Winston logger
 */
export function createLogger() {
  // Define log format
  const logFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.printf(({ level, message, timestamp, stack }) => {
      return `${timestamp} [${level.toUpperCase()}]: ${stack || message}`;
    })
  );

  // Create logger instance
  const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: logFormat,
    transports: [
      // Console transport for all environments
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          logFormat
        )
      }),
      // File transport for production
      ...(process.env.NODE_ENV === 'production'
        ? [
            new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
            new winston.transports.File({ filename: 'logs/combined.log' })
          ]
        : [])
    ]
  });

  return logger;
}

// Create singleton instance for use throughout the application
const logger = createLogger();
export default logger; 