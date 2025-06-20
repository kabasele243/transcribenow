# Transcribe AI - Simplified Dashboard

A simplified audio/video transcription application that allows users to upload files and transcribe speech to text.

## Features

- **Simple Upload Workflow**: Upload one or multiple audio/video files through a modal interface
- **Automatic Transcription**: Transcribe speech to text with a single click
- **File Management**: View all uploaded files and their transcriptions in one place
- **Real-time Progress**: See upload and transcription progress in real-time

## Workflow

1. **Upload Files**: Click the "Upload Files" button to open the upload modal
2. **Select Files**: Drag and drop or browse to select audio/video files
3. **Upload**: Files are automatically uploaded to S3 storage
4. **Transcribe**: For audio/video files, click "Transcribe Files" to convert speech to text
5. **View Results**: See all files and their transcriptions in the main dashboard

## Setup

### Prerequisites

- Node.js 18+ 
- Supabase account
- AWS S3 bucket
- Clerk authentication

### Environment Variables

Create a `.env.local` file with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
S3_BUCKET_NAME=your_bucket_name

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# AssemblyAI (for transcription)
ASSEMBLYAI_API_KEY=your_assemblyai_api_key
```

### Database Setup

1. **If you're starting fresh** (no existing tables):
   ```sql
   -- Copy and run the contents of supabase-migration.sql
   ```

2. **If you have existing tables** (folders/files already exist):
   ```sql
   -- Copy and run the contents of supabase-add-transcriptions-only.sql
   ```

3. **If you want to reset everything** (will delete existing data):
   ```sql
   -- Copy and run the contents of supabase-migration-reset.sql
   ```

The migration creates:
- `folders` table for organizing files
- `files` table for storing file metadata  
- `transcriptions` table for storing transcription results

### Installation

```bash
npm install
npm run dev
```

## API Endpoints

- `POST /api/upload` - Upload files to S3 and save metadata
- `POST /api/transcribe` - Transcribe audio/video files to text
- `GET /api/transcriptions` - Fetch transcriptions for files/folders

## Transcription Service

This application uses AssemblyAI for high-quality speech-to-text transcription. The integration includes:

- **Slam-1 Model**: Uses AssemblyAI's latest prompt-based speech model for best accuracy
- **Real-time Processing**: Files are processed asynchronously with status tracking
- **Error Handling**: Comprehensive error handling for transcription failures
- **Database Integration**: Transcription results are automatically saved to the database

### Setup AssemblyAI

1. Sign up for a free account at [AssemblyAI](https://www.assemblyai.com/)
2. Get your API key from the dashboard
3. Add the API key to your `.env.local` file:
   ```env
   ASSEMBLYAI_API_KEY=your_assemblyai_api_key
   ```

### Supported Audio Formats

AssemblyAI supports a wide range of audio formats including:
- MP3, WAV, M4A, FLAC, OGG
- Video files (audio will be extracted)
- Various bitrates and sample rates

For more information, see the [AssemblyAI documentation](https://www.assemblyai.com/docs/getting-started/transcribe-an-audio-file).

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── upload/route.ts          # File upload endpoint
│   │   ├── transcribe/route.ts      # Transcription endpoint
│   │   └── transcriptions/route.ts  # Fetch transcriptions
│   └── dashboard/page.tsx           # Main dashboard
├── components/
│   ├── UploadModal.tsx              # Upload and transcription modal
│   └── DashboardLayout.tsx          # Layout component
└── lib/
    ├── database.ts                  # Database types and operations
    ├── s3.ts                        # AWS S3 configuration
    └── supabase-server.ts           # Supabase client
```

## Usage

1. Navigate to the dashboard
2. Click "Upload Files" to open the upload modal
3. Select audio/video files (supports drag & drop)
4. Wait for upload to complete
5. Click "Transcribe Files" to convert speech to text
6. View transcriptions in the main dashboard

## Supported File Types

- **Audio**: MP3, WAV, M4A, FLAC, etc.
- **Video**: MP4, MOV, AVI, etc.
- **Text**: TXT, DOC, PDF, etc.

## Security

- Row Level Security (RLS) enabled on all tables
- Users can only access their own files and transcriptions
- File uploads validated for type and size
- Authentication required for all operations
