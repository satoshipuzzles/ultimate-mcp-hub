import mongoose from 'mongoose';
import logger from '../../core/logger';

// MongoDB connection instance
let connection: mongoose.Connection | null = null;

/**
 * Initialize MongoDB connection
 */
export async function connectToMongoDB(): Promise<mongoose.Connection> {
  try {
    const uri = process.env.MONGODB_URI;
    
    if (!uri) {
      throw new Error('MongoDB URI not provided');
    }
    
    if (connection) {
      logger.info('Using existing MongoDB connection');
      return connection;
    }
    
    // Set mongoose options
    mongoose.set('strictQuery', true);
    
    // Connect to MongoDB
    await mongoose.connect(uri);
    
    connection = mongoose.connection;
    
    // Set up connection event handlers
    connection.on('error', (err) => {
      logger.error(`MongoDB connection error: ${err}`);
    });
    
    connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    
    // Handle application termination
    process.on('SIGINT', async () => {
      if (connection) {
        await connection.close();
        logger.info('MongoDB connection closed due to application termination');
        process.exit(0);
      }
    });
    
    logger.info('MongoDB connected successfully');
    return connection;
  } catch (error) {
    logger.error(`MongoDB connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

/**
 * Get MongoDB connection
 */
export async function getMongoDBConnection(): Promise<mongoose.Connection> {
  if (!connection) {
    return connectToMongoDB();
  }
  return connection;
}

/**
 * Create a generic model for a collection
 * @param name Collection name
 * @param schema Schema definition
 */
export function createModel<T>(name: string, schema: mongoose.Schema<T>) {
  return mongoose.model<T>(name, schema);
}

/**
 * Perform CRUD operations on MongoDB
 */
export const mongoDBOperations = {
  /**
   * Create a new document
   * @param model Mongoose model
   * @param data Document data
   */
  create: async function<T>(model: mongoose.Model<T>, data: Partial<T>): Promise<T> {
    try {
      await getMongoDBConnection();
      const document = await model.create(data);
      logger.debug(`Created document in ${model.collection.name}`);
      return document;
    } catch (error) {
      logger.error(`Failed to create document: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  },
  
  /**
   * Find documents
   * @param model Mongoose model
   * @param filter Filter criteria
   * @param projection Fields to include/exclude
   * @param options Query options
   */
  find: async function<T>(
    model: mongoose.Model<T>,
    filter: Record<string, any> = {},
    projection: Record<string, any> = {},
    options: mongoose.QueryOptions = {}
  ): Promise<T[]> {
    try {
      await getMongoDBConnection();
      const documents = await model.find(filter, projection, options);
      logger.debug(`Found ${documents.length} documents in ${model.collection.name}`);
      return documents;
    } catch (error) {
      logger.error(`Failed to find documents: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  },
  
  /**
   * Find a single document
   * @param model Mongoose model
   * @param filter Filter criteria
   * @param projection Fields to include/exclude
   * @param options Query options
   */
  findOne: async function<T>(
    model: mongoose.Model<T>,
    filter: Record<string, any>,
    projection: Record<string, any> = {},
    options: mongoose.QueryOptions = {}
  ): Promise<T | null> {
    try {
      await getMongoDBConnection();
      const document = await model.findOne(filter, projection, options);
      logger.debug(`FindOne operation on ${model.collection.name}: ${document ? 'Document found' : 'No document found'}`);
      return document;
    } catch (error) {
      logger.error(`Failed to find document: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  },
  
  /**
   * Update a document
   * @param model Mongoose model
   * @param filter Filter criteria
   * @param update Update operations
   * @param options Update options
   */
  updateOne: async function<T>(
    model: mongoose.Model<T>,
    filter: Record<string, any>,
    update: Record<string, any>,
    options: Record<string, any> = {}
  ): Promise<mongoose.UpdateWriteOpResult> {
    try {
      await getMongoDBConnection();
      const result = await model.updateOne(filter, update, options);
      logger.debug(`UpdateOne operation on ${model.collection.name}: ${result.modifiedCount} document(s) modified`);
      return result;
    } catch (error) {
      logger.error(`Failed to update document: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  },
  
  /**
   * Delete a document
   * @param model Mongoose model
   * @param filter Filter criteria
   */
  deleteOne: async function<T>(
    model: mongoose.Model<T>,
    filter: Record<string, any>
  ): Promise<mongoose.DeleteResult> {
    try {
      await getMongoDBConnection();
      const result = await model.deleteOne(filter);
      logger.debug(`DeleteOne operation on ${model.collection.name}: ${result.deletedCount} document(s) deleted`);
      return result;
    } catch (error) {
      logger.error(`Failed to delete document: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
}; 