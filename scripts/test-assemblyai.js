require('dotenv').config({ path: '.env.local' })
const { AssemblyAI } = require('assemblyai')

async function testAssemblyAI() {
  console.log('🔍 Testing AssemblyAI Configuration...\n')

  // Check if API key exists
  if (!process.env.ASSEMBLYAI_API_KEY) {
    console.error('❌ ASSEMBLYAI_API_KEY is not set in .env.local')
    console.log('Please add your AssemblyAI API key to .env.local:')
    console.log('ASSEMBLYAI_API_KEY=your_api_key_here')
    return
  }

  console.log('✅ ASSEMBLYAI_API_KEY is configured')
  console.log('🔑 API Key (first 10 chars):', process.env.ASSEMBLYAI_API_KEY.substring(0, 10) + '...')

  try {
    // Initialize client
    const client = new AssemblyAI({
      apiKey: process.env.ASSEMBLYAI_API_KEY
    })

    console.log('✅ AssemblyAI client initialized successfully')

    // Test with a simple audio URL (you can replace this with your own test file)
    const testAudioUrl = 'https://storage.googleapis.com/aai-web-samples/5_common_sports_injuries.mp3'
    
    console.log('🎵 Testing with sample audio file...')
    console.log('📁 Audio URL:', testAudioUrl)

    const transcript = await client.transcripts.transcribe({
      audio: testAudioUrl,
      speech_model: 'slam-1'
    })

    console.log('✅ Transcription test successful!')
    console.log('📊 Status:', transcript.status)
    console.log('📝 Text length:', transcript.text?.length || 0, 'characters')
    
    if (transcript.text) {
      console.log('📄 First 100 characters:', transcript.text.substring(0, 100) + '...')
    }

  } catch (error) {
    console.error('❌ AssemblyAI test failed:')
    console.error('Error:', error.message)
    
    if (error.status === 401) {
      console.error('🔑 This usually means your API key is invalid or expired')
    } else if (error.status === 403) {
      console.error('🚫 This usually means your API key lacks proper permissions')
    } else if (error.status === 429) {
      console.error('⏰ Rate limit exceeded - try again later')
    }
    
    console.error('\nFull error details:', error)
  }
}

testAssemblyAI() 