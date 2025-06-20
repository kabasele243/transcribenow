const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3')
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

async function testS3Integration() {
  console.log('Testing S3 Integration...')
  console.log('Bucket:', S3_BUCKET_NAME)
  console.log('Region:', process.env.AWS_REGION)
  
  try {
    // Test listing objects in the bucket
    const command = new ListObjectsV2Command({
      Bucket: S3_BUCKET_NAME,
      MaxKeys: 10
    })

    const response = await s3Client.send(command)
    
    console.log('\n✅ S3 connection successful!')
    console.log('Objects found:', response.Contents?.length || 0)
    
    if (response.Contents && response.Contents.length > 0) {
      console.log('\nSample objects:')
      response.Contents.slice(0, 5).forEach((object, index) => {
        console.log(`${index + 1}. ${object.Key} (${object.Size} bytes)`)
      })
    } else {
      console.log('\nNo objects found in bucket')
    }
    
    // Test listing files for a specific user/folder structure
    const testUserId = 'test-user-123'
    const testFolderId = 'test-folder-456'
    const prefix = `uploads/${testUserId}/${testFolderId}/`
    
    console.log(`\nTesting folder structure: ${prefix}`)
    
    const folderCommand = new ListObjectsV2Command({
      Bucket: S3_BUCKET_NAME,
      Prefix: prefix,
      Delimiter: '/'
    })
    
    const folderResponse = await s3Client.send(folderCommand)
    console.log('Files in test folder:', folderResponse.Contents?.length || 0)
    
  } catch (error) {
    console.error('❌ S3 integration test failed:', error.message)
    
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
testS3Integration()
  .then(() => {
    console.log('\n🎉 S3 integration test completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Test failed:', error)
    process.exit(1)
  }) 