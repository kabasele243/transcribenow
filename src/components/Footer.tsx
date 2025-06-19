'use client'

import Link from "next/link";
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  
  // Hide footer on sign-in and sign-up pages
  const isAuthPage = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')
  if (isAuthPage) {
    return null
  }

  return (
    <footer className="bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-600 mb-4 md:mb-0">
            ©2024 Transcribe. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <Link href="/terms" className="text-gray-600 hover:text-gray-900">
              Terms of Service
            </Link>
            <Link href="/privacy" className="text-gray-600 hover:text-gray-900">
              Privacy Policy
            </Link>
            <Link href="/contact" className="text-gray-600 hover:text-gray-900">
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 