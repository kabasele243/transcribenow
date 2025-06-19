# Transcribe AI

A modern, AI-powered audio transcription application built with Next.js, featuring batch upload capabilities, multi-language support, and intelligent file organization.

## 🚀 Features

- **🎵 Batch Upload**: Upload multiple audio files simultaneously (MP3, WAV, M4A, and more)
- **🤖 AI-Powered Accuracy**: Advanced AI models with 95%+ accuracy across multiple languages
- **🌍 100+ Languages**: Support for over 100 languages and dialects with automatic detection
- **⚡ Lightning Fast**: Process files up to 10x faster than traditional methods
- **📁 Smart Organization**: Create custom folders, tag files, and organize transcriptions
- **📤 Flexible Export**: Export in TXT, DOCX, PDF, or SRT formats
- **🔐 Secure Authentication**: User authentication powered by Clerk
- **📊 Dashboard Analytics**: Track transcription progress and manage files

## 🛠️ Tech Stack

- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **State Management**: Redux Toolkit with Redux Persist
- **UI Components**: Custom components with modern design
- **Development**: ESLint, Turbopack

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd transcribe-ai
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
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
│   └── FolderSidebar.tsx
├── hooks/               # Custom React hooks
│   └── useClerkAuth.ts  # Clerk-Redux integration hook
├── store/               # Redux store configuration
│   ├── slices/          # Redux slices
│   └── hooks.ts         # Redux hooks
└── middleware.ts        # Next.js middleware
```

## 🔐 Authentication

This application uses **Clerk** for authentication with **Redux** integration:

- **Automatic State Sync**: Clerk authentication state is automatically synced with Redux
- **Protected Routes**: Dashboard and upload pages are protected
- **User Management**: Complete user profile management
- **Session Persistence**: User sessions persist across browser sessions

### Authentication Flow

1. Users sign up/sign in through Clerk
2. Authentication state is automatically synced to Redux
3. Protected routes check Redux auth state
4. User data is available throughout the application

## 📱 Usage

### Getting Started

1. **Sign Up/In**: Create an account or sign in to access the dashboard
2. **Create Folders**: Organize your transcriptions with custom folders
3. **Upload Files**: Drag and drop or select audio files for transcription
4. **Monitor Progress**: Track transcription status in real-time
5. **Download Results**: Export transcriptions in your preferred format

### Supported File Formats

- **Audio**: MP3, WAV, M4A, FLAC, OGG
- **Video**: MP4, AVI, MOV (audio extraction)
- **Maximum File Size**: 100MB per file

### Export Formats

- **TXT**: Plain text format
- **DOCX**: Microsoft Word document
- **PDF**: Portable Document Format
- **SRT**: Subtitle format for video editing

## 🚀 Deployment

### Deploy on Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

### Environment Variables for Production

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## 🧪 Development

### Available Scripts

```bash
npm run dev          # Start development server with Turbopack
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Code Style

- **TypeScript**: Strict type checking enabled
- **ESLint**: Code linting with Next.js configuration
- **Prettier**: Code formatting (recommended)

## 📚 Documentation

- [Clerk-Redux Integration Guide](./CLERK_REDUX_INTEGRATION.md)
- [Redux Setup Documentation](./REDUX_SETUP.md)
- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Documentation](https://clerk.com/docs)

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

Built with ❤️ using Next.js, Clerk, and Redux
