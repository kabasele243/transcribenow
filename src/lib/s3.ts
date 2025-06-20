import { S3Client, ListObjectsV2Command, HeadObjectCommand, HeadObjectCommandOutput } from '@aws-sdk/client-s3'

// Configure S3 client with access key authentication
const createS3Client = () => {
  const config = {
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }
  }

  return new S3Client(config)
}

export const s3Client = createS3Client()

// Get bucket name from environment variable
export const S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME!

// Interface for S3 file metadata
export interface S3File {
  key: string
  name: string
  size: number
  lastModified: Date
  etag: string
  url: string
  folderId: string
  userId: string
}

// List files from S3 bucket for a specific user and folder
export async function listS3Files(userId: string, folderId?: string): Promise<S3File[]> {
  try {
    const prefix = folderId 
      ? `uploads/${userId}/${folderId}/`
      : `uploads/${userId}/`

    const command = new ListObjectsV2Command({
      Bucket: S3_BUCKET_NAME,
      Prefix: prefix,
      Delimiter: '/'
    })

    const response = await s3Client.send(command)
    
    if (!response.Contents) {
      return []
    }

    const files: S3File[] = []
    
    for (const object of response.Contents) {
      if (!object.Key || object.Key.endsWith('/')) {
        continue // Skip directories
      }

      // Extract folder ID from the key path
      const keyParts = object.Key.split('/')
      const extractedFolderId = keyParts.length >= 3 ? keyParts[2] : 'unknown'
      
      // Extract filename from the key
      const fileName = keyParts[keyParts.length - 1]

      files.push({
        key: object.Key,
        name: fileName,
        size: object.Size || 0,
        lastModified: object.LastModified || new Date(),
        etag: object.ETag || '',
        url: `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${object.Key}`,
        folderId: extractedFolderId,
        userId: userId
      })
    }

    return files
  } catch (error) {
    console.error('Error listing S3 files:', error)
    throw new Error('Failed to list S3 files')
  }
}

// Get file metadata from S3
export async function getS3FileMetadata(key: string): Promise<HeadObjectCommandOutput> {
  try {
    const command = new HeadObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: key
    })

    const response = await s3Client.send(command)
    return response
  } catch (error) {
    console.error('Error getting S3 file metadata:', error)
    throw new Error('Failed to get S3 file metadata')
  }
}

// Check if a file exists in S3
export async function fileExistsInS3(key: string): Promise<boolean> {
  try {
    await getS3FileMetadata(key)
    return true
  } catch {
    return false
  }
} 