'use client'

import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from '@/store/hooks';
import { selectIsAuthenticated, selectAuthLoading } from '@/store/slices/authSlice';

// Features data
const features = [
  {
    id: 1,
    title: "Batch Upload",
    description: "Upload multiple audio files simultaneously. Support for MP3, WAV, M4A, and more formats. Process entire folders with just a few clicks.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-7 h-7 text-blue-600">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    bgColor: "bg-blue-100",
    iconColor: "text-blue-600"
  },
  {
    id: 2,
    title: "Smart Organization",
    description: "Create custom folders and categories to organize your transcriptions. Tag files, add notes, and find what you need instantly.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-7 h-7 text-green-600">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
      </svg>
    ),
    bgColor: "bg-green-100",
    iconColor: "text-green-600"
  },
  {
    id: 3,
    title: "AI-Powered Accuracy",
    description: "Advanced AI models trained on millions of hours of audio deliver 95%+ accuracy across multiple languages and accents.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-7 h-7 text-purple-600">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    bgColor: "bg-purple-100",
    iconColor: "text-purple-600"
  },
  {
    id: 4,
    title: "Lightning Fast",
    description: "Get transcriptions in minutes, not hours. Our optimized processing handles files up to 10x faster than traditional methods.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-7 h-7 text-orange-600">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    bgColor: "bg-orange-100",
    iconColor: "text-orange-600"
  },
  {
    id: 5,
    title: "100+ Languages",
    description: "Support for over 100 languages and dialects. Automatic language detection ensures accurate transcriptions every time.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-7 h-7 text-red-600">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
      </svg>
    ),
    bgColor: "bg-red-100",
    iconColor: "text-red-600"
  },
  {
    id: 6,
    title: "Flexible Export",
    description: "Export transcriptions in TXT, DOCX, PDF, or SRT formats. Perfect for subtitles, documentation, or further editing.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-7 h-7 text-indigo-600">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    bgColor: "bg-indigo-100",
    iconColor: "text-indigo-600"
  }
];

export default function Home() {
  const router = useRouter();
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const authLoading = useAppSelector(selectAuthLoading);

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, authLoading, router]);

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  // Don't render the landing page if user is authenticated (they will be redirected)
  if (isAuthenticated) {
    return null;
  }

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gray-100 py-20">
        <div className="container mx-auto px-4">
          <div className="relative">
            {/* Background Image */}
            <div className="w-full h-96 lg:h-[500px] relative rounded-lg overflow-hidden bg-gray-300">
              <Image
                src="/images/home.jpg"
                alt="Person listening to audio"
                fill
                className="object-cover"
                priority
              />
              
              {/* Text Content Overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white max-w-4xl px-4">
                  <h1 className="text-5xl font-bold mb-6 drop-shadow-lg">
                    Transcribe audio to text
                  </h1>
                  <p className="text-xl mb-8 opacity-90 drop-shadow-lg">
                    Upload your audio files and get accurate transcriptions in minutes. Supports multiple file formats and languages.
                  </p>
                  <button className="bg-blue-500 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-600 transition-colors shadow-lg">
                    Upload Files
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900">Powerful Features</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need for accurate, fast, and reliable audio transcription. 
              From individual files to batch processing, we&apos;ve got you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div key={feature.id} className="p-8 bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                <div className={`w-14 h-14 mb-6 ${feature.bgColor} rounded-lg flex items-center justify-center`}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
