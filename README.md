# Transcribe AI

A modern web application for AI-powered audio and video transcription with intelligent file organization, built with Next.js, Clerk authentication, Supabase database, and AWS S3 storage.

## ✨ Features

- **🎵 Batch Upload**: Upload multiple audio files simultaneously (MP3, WAV, M4A, and more)
- **🤖 AI-Powered Accuracy**: Advanced AI models with 95%+ accuracy across multiple languages
- **🌍 100+ Languages**: Support for over 100 languages and dialects with automatic detection
- **⚡ Lightning Fast**: Process files up to 10x faster than traditional methods
- **📁 Smart File Organization**: Create folders and organize your transcription files
- **📤 Flexible Export**: Export in TXT, DOCX, PDF, or SRT formats
- **🔐 Secure Authentication**: Clerk-powered user authentication with social login options
- **📁 Smart Organization**: Create custom folders, tag files, and organize transcriptions
- **☁️ Cloud Storage**: AWS S3 integration for reliable file storage and retrieval
- **🔄 Real-time Updates**: Live updates using Supabase real-time subscriptions
- **📊 Dashboard Analytics**: Track your transcription progress and file statistics
- **🎨 Modern UI**: Beautiful, responsive design with Tailwind CSS
- **⚡ Fast Performance**: Built with Next.js 15 and optimized for speed

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd transcribe-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   
   # Supabase Database
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_KEY=your-anon-public-key
   
   # AWS S3 (for file storage)
   AWS_ACCESS_KEY_ID=your_aws_access_key_id
   AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
   AWS_REGION=us-east-1
   AWS_S3_BUCKET_NAME=your-s3-bucket-name
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000) to see the application.

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Protected dashboard pages
│   ├── sign-in/          # Authentication pages
│   ├── sign-up/          # Authentication pages
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/           # Reusable UI components
│   ├── auth/            # Authentication components
│   ├── DashboardLayout.tsx
│   ├── FolderSidebar.tsx
│   └── SupabaseExample.tsx  # Example Supabase integration
├── hooks/               # Custom React hooks
│   └── useClerkAuth.ts  # Clerk-Redux integration hook
├── lib/                 # Utility libraries
│   ├── supabase.ts      # Supabase client configuration
│   ├── database.ts      # Database service layer
│   ├── s3.ts           # AWS S3 service layer
│   └── actions.ts       # Server actions for Supabase
├── store/               # Redux store configuration
│   ├── slices/          # Redux slices
│   └── hooks.ts         # Redux hooks
└── middleware.ts        # Next.js middleware
```

## ☁️ AWS S3 Integration

The application now supports retrieving files from both the database and AWS S3 buckets. This provides:

### Features
- **Dual Source File Listing**: Files are retrieved from both Supabase database and S3 buckets
- **Automatic Deduplication**: Prevents duplicate files from appearing in the UI
- **Source Indicators**: Visual badges show whether files are from database (DB) or S3
- **Seamless Integration**: Works alongside existing upload functionality

### File Structure
Files in S3 are organized using the following structure:
```
uploads/
├── {user_id}/
│   ├── {folder_id}/
│   │   ├── file1.mp3
│   │   ├── file2.wav
│   │   └── ...
│   └── {another_folder_id}/
│       └── ...
```

### Testing S3 Integration
Run the S3 integration test to verify your setup:
```bash
npm run test:s3
```

This will:
- Test the connection to your S3 bucket
- Verify AWS credentials are working
- List sample objects in the bucket
- Test the folder structure functionality

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run test:s3      # Test S3 integration
```

### Code Style

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting with Next.js configuration
- **Prettier**: Code formatting (recommended)

## 📚 Documentation

- [Supabase Integration Setup](./SUPABASE_SETUP.md)
- [Clerk-Redux Integration Guide](./CLERK_REDUX_INTEGRATION.md)
- [Redux Setup Documentation](./REDUX_SETUP.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Supabase Documentation](https://supabase.com/docs)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [documentation](./docs/)
2. Search existing [issues](../../issues)
3. Create a new issue with detailed information

---

Built with ❤️ using Next.js, Clerk, Supabase, and Redux
