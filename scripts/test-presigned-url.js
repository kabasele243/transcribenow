const { getSignedUrl } = require('@aws-sdk/s3-request-presigner')
const { GetObjectCommand } = require('@aws-sdk/client-s3')
const { S3Client } = require('@aws-sdk/client-s3')
require('dotenv').config({ path: '.env.local' })

// Configure S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  }
})

const S3_BUCKET_NAME = process.env.AWS_S3_BUCKET_NAME

async function testPresignedUrl() {
  console.log('🔍 Testing Pre-signed URL Generation...\n')

  // Check if required environment variables are set
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY || !process.env.AWS_REGION || !S3_BUCKET_NAME) {
    console.error('❌ AWS environment variables are not properly configured')
    console.log('Please ensure the following are set in .env.local:')
    console.log('- AWS_ACCESS_KEY_ID')
    console.log('- AWS_SECRET_ACCESS_KEY')
    console.log('- AWS_REGION')
    console.log('- AWS_S3_BUCKET_NAME')
    return
  }

  console.log('✅ AWS environment variables are configured')
  console.log('📦 Bucket:', S3_BUCKET_NAME)
  console.log('🌍 Region:', process.env.AWS_REGION)

  try {
    // Test with a sample file path (you can replace this with an actual file in your bucket)
    const testS3Key = 'uploads/test-user/test-folder/sample-audio.mp3'
    
    console.log('\n🔑 Testing pre-signed URL generation for:', testS3Key)
    
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET_NAME,
      Key: testS3Key,
    })
    
    // Generate pre-signed URL that expires in 1 hour
    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 })
    
    console.log('✅ Pre-signed URL generated successfully!')
    console.log('🔗 URL (first 100 chars):', presignedUrl.substring(0, 100) + '...')
    console.log('⏰ Expires in: 1 hour')
    
    // Test URL parsing logic
    console.log('\n🧪 Testing URL parsing logic...')
    const testFileUrl = `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${testS3Key}`
    console.log('📁 Original file URL:', testFileUrl)
    
    const urlParts = testFileUrl.split('/')
    const extractedS3Key = urlParts.slice(3).join('/')
    console.log('🔍 Extracted S3 key:', extractedS3Key)
    
    if (extractedS3Key === testS3Key) {
      console.log('✅ URL parsing logic works correctly!')
    } else {
      console.log('❌ URL parsing logic failed')
    }
    
  } catch (error) {
    console.error('❌ Pre-signed URL generation failed:', error.message)
    
    if (error.name === 'NoSuchBucket') {
      console.error('The specified bucket does not exist')
    } else if (error.name === 'AccessDenied') {
      console.error('Access denied. Check your AWS credentials and permissions')
    } else if (error.name === 'InvalidAccessKeyId') {
      console.error('Invalid AWS access key ID')
    } else if (error.name === 'SignatureDoesNotMatch') {
      console.error('Invalid AWS secret access key')
    }
    
    process.exit(1)
  }
}

// Run the test
testPresignedUrl()
  .then(() => {
    console.log('\n🎉 Pre-signed URL test completed successfully!')
    console.log('💡 This means AssemblyAI should now be able to access your S3 files')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error)
    process.exit(1)
  }) 