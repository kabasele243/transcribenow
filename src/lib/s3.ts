import { S3Client } from '@aws-sdk/client-s3'

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