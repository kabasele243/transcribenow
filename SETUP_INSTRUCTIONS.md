# File Upload and Folder Management Setup

This document provides instructions for setting up the file upload and folder management feature for your Next.js app.

## Prerequisites

1. **PostgreSQL Database**: You need a PostgreSQL database running locally or in the cloud
2. **AWS S3 Bucket**: Create an S3 bucket for file storage
3. **Clerk Authentication**: Ensure Clerk is properly configured

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/transcribe_ai"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET_NAME=your-s3-bucket-name

# Next.js
NEXTAUTH_URL=http://localhost:3000
```

## Setup Steps

### 1. Database Setup

1. Create a PostgreSQL database named `transcribe_ai`
2. Update the `DATABASE_URL` in your `.env.local` file with your database credentials
3. Run the Prisma migration:
   ```bash
   npx prisma migrate dev --name init
   ```

### 2. AWS S3 Setup

1. Create an S3 bucket for file storage
2. Configure CORS for your S3 bucket:
   ```json
   [
     {
       "AllowedHeaders": ["*"],
       "AllowedMethods": ["GET", "POST", "PUT"],
       "AllowedOrigins": ["http://localhost:3000"],
       "ExposeHeaders": []
     }
   ]
   ```
3. Create an IAM user with S3 access and get the access keys
4. Update the AWS environment variables in your `.env.local` file

### 3. Clerk Setup

1. Ensure Clerk is properly configured in your app
2. Update the Clerk environment variables in your `.env.local` file

## Features Implemented

### API Routes

- `POST /api/folders` - Create a new folder
- `GET /api/folders` - Get all folders for the authenticated user
- `POST /api/upload` - Upload files to a specific folder

### Components

- `CreateFolderForm` - Form to create new folders
- `FileUpload` - Drag and drop file upload component
- `FolderView` - Display folder contents with upload functionality
- `FolderSidebar` - Sidebar showing all folders

### Database Models

- **Folder**: Stores folder information with user association
- **File**: Stores file metadata with folder association

## Usage

1. **Creating Folders**: Click "New Folder" in the sidebar and enter a folder name
2. **Uploading Files**: Navigate to a folder and use the drag-and-drop upload area
3. **Viewing Files**: Files are displayed with download links and metadata
4. **File Organization**: Files are stored in S3 with organized paths: `uploads/{userId}/{folderId}/{filename}`

## Security Features

- All API routes require Clerk authentication
- Files are associated with specific users and folders
- S3 uploads include proper content type and size validation
- Database queries filter by user ID to ensure data isolation

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── folders/
│   │   │   └── route.ts
│   │   └── upload/
│   │       └── route.ts
│   └── dashboard/
│       ├── folders/
│       │   └── [id]/
│       │       └── page.tsx
│       └── page.tsx
├── components/
│   ├── CreateFolderForm.tsx
│   ├── FileUpload.tsx
│   ├── FolderView.tsx
│   └── FolderSidebar.tsx
└── lib/
    ├── prisma.ts
    └── s3.ts
```

## Troubleshooting

1. **Database Connection**: Ensure PostgreSQL is running and the connection string is correct
2. **S3 Uploads**: Check AWS credentials and bucket permissions
3. **Authentication**: Verify Clerk configuration and environment variables
4. **File Uploads**: Check browser console for any CORS or network errors

## Next Steps

After setup, you can:
1. Test folder creation and file uploads
2. Customize the UI components as needed
3. Add additional features like file deletion, folder renaming, etc.
4. Implement file processing workflows for transcription 