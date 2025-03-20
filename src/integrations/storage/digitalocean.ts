import { 
  S3Client, 
  PutObjectCommand, 
  GetObjectCommand, 
  DeleteObjectCommand,
  ListObjectsCommand
} from '@aws-sdk/client-s3';
import logger from '../../core/logger';

// S3 client instance
let s3Client: S3Client | null = null;

/**
 * Initialize S3 client for DigitalOcean Spaces
 */
export function initS3Client(): S3Client {
  try {
    const accessKeyId = process.env.DO_SPACES_KEY;
    const secretAccessKey = process.env.DO_SPACES_SECRET;
    const endpoint = process.env.DO_SPACES_ENDPOINT;
    const region = process.env.DO_SPACES_REGION || 'us-east-1';
    
    if (!accessKeyId || !secretAccessKey || !endpoint) {
      throw new Error('DigitalOcean Spaces credentials or endpoint not provided');
    }
    
    if (s3Client) {
      return s3Client;
    }
    
    s3Client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId,
        secretAccessKey
      },
      forcePathStyle: true
    });
    
    logger.info('DigitalOcean Spaces client initialized successfully');
    return s3Client;
  } catch (error) {
    logger.error(`Failed to initialize DigitalOcean Spaces client: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

/**
 * Get S3 client instance
 */
export function getS3Client(): S3Client {
  if (!s3Client) {
    return initS3Client();
  }
  return s3Client;
}

/**
 * Upload a file to DigitalOcean Spaces
 * @param key Object key (file path)
 * @param body File content
 * @param contentType MIME type
 * @param isPublic Whether the file should be publicly accessible
 */
export async function uploadFile(
  key: string,
  body: Buffer | Uint8Array | string,
  contentType: string,
  isPublic: boolean = false
) {
  try {
    const s3 = getS3Client();
    const bucket = process.env.DO_SPACES_BUCKET;
    
    if (!bucket) {
      throw new Error('DigitalOcean Spaces bucket not provided');
    }
    
    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      ACL: isPublic ? 'public-read' : 'private'
    });
    
    const response = await s3.send(command);
    
    logger.info(`File uploaded successfully to DigitalOcean Spaces: ${key}`);
    
    // Construct the file URL
    const endpoint = process.env.DO_SPACES_ENDPOINT || '';
    const url = isPublic ? 
      `https://${bucket}.${endpoint.replace('https://', '')}/${key}` : 
      null;
    
    return {
      success: true,
      key,
      etag: response.ETag,
      url
    };
  } catch (error) {
    logger.error(`Failed to upload file to DigitalOcean Spaces: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

/**
 * Download a file from DigitalOcean Spaces
 * @param key Object key (file path)
 */
export async function downloadFile(key: string) {
  try {
    const s3 = getS3Client();
    const bucket = process.env.DO_SPACES_BUCKET;
    
    if (!bucket) {
      throw new Error('DigitalOcean Spaces bucket not provided');
    }
    
    const command = new GetObjectCommand({
      Bucket: bucket,
      Key: key
    });
    
    const response = await s3.send(command);
    
    // Read the file content
    const body = await response.Body?.transformToByteArray();
    
    logger.info(`File downloaded successfully from DigitalOcean Spaces: ${key}`);
    
    return {
      success: true,
      key,
      contentType: response.ContentType,
      body,
      metadata: response.Metadata
    };
  } catch (error) {
    logger.error(`Failed to download file from DigitalOcean Spaces: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

/**
 * Delete a file from DigitalOcean Spaces
 * @param key Object key (file path)
 */
export async function deleteFile(key: string) {
  try {
    const s3 = getS3Client();
    const bucket = process.env.DO_SPACES_BUCKET;
    
    if (!bucket) {
      throw new Error('DigitalOcean Spaces bucket not provided');
    }
    
    const command = new DeleteObjectCommand({
      Bucket: bucket,
      Key: key
    });
    
    await s3.send(command);
    
    logger.info(`File deleted successfully from DigitalOcean Spaces: ${key}`);
    
    return {
      success: true,
      key
    };
  } catch (error) {
    logger.error(`Failed to delete file from DigitalOcean Spaces: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
}

/**
 * List files in a directory
 * @param prefix Directory prefix
 * @param maxKeys Maximum number of keys to return
 */
export async function listFiles(prefix: string = '', maxKeys: number = 1000) {
  try {
    const s3 = getS3Client();
    const bucket = process.env.DO_SPACES_BUCKET;
    
    if (!bucket) {
      throw new Error('DigitalOcean Spaces bucket not provided');
    }
    
    const command = new ListObjectsCommand({
      Bucket: bucket,
      Prefix: prefix,
      MaxKeys: maxKeys
    });
    
    const response = await s3.send(command);
    
    logger.info(`Listed ${response.Contents?.length || 0} files from DigitalOcean Spaces with prefix: ${prefix}`);
    
    return {
      success: true,
      files: response.Contents || [],
      isTruncated: response.IsTruncated,
      prefix
    };
  } catch (error) {
    logger.error(`Failed to list files from DigitalOcean Spaces: ${error instanceof Error ? error.message : 'Unknown error'}`);
    throw error;
  }
} 