'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs"
import { useAppSelector } from '@/store/hooks'
import { selectIsAuthenticated, selectAuthLoading } from '@/store/slices/authSlice'

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  
  // Redux auth state
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const authLoading = useAppSelector(selectAuthLoading)

  // Hide header on sign-in and sign-up pages
  const isAuthPage = pathname.startsWith('/sign-in') || pathname.startsWith('/sign-up')
  if (isAuthPage) {
    return null
  }

  const navigation = [
    ...(isAuthenticated ? [{ name: 'Dashboard', href: '/dashboard' }] : [])
  ]

  const isActiveLink = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname.startsWith(href)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-white/20">
      <nav className="container mx-auto px-4 py-4" aria-label="Main navigation">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <span className="text-2xl font-bold text-blue-600">Transcribe</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`transition-colors duration-200 ${
                  isActiveLink(item.href)
                    ? 'text-blue-600 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            
            {/* Authentication buttons */}
            <div className="flex items-center space-x-4">
              {authLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-gray-600 text-sm">Loading...</span>
                </div>
              ) : (
                <>
                  <SignedOut>
                    <Link href="/sign-in">
                      <button className="text-gray-600 hover:text-gray-900 transition-colors duration-200">
                        Sign In
                      </button>
                    </Link>
                    <Link href="/sign-up">
                      <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium">
                        Sign Up
                      </button>
                    </Link>
                  </SignedOut>
                  <SignedIn>
                    <UserButton afterSignOutUrl="/" />
                  </SignedIn>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
            onClick={toggleMobileMenu}
            aria-expanded={isMobileMenuOpen}
            aria-label="Toggle mobile menu"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4 pt-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={closeMobileMenu}
                  className={`transition-colors duration-200 ${
                    isActiveLink(item.href)
                      ? 'text-blue-600 font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Mobile Authentication buttons */}
              <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200">
                {authLoading ? (
                  <div className="flex items-center justify-center space-x-2 py-2">
                    <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-gray-600 text-sm">Loading...</span>
                  </div>
                ) : (
                  <>
                    <SignedOut>
                      <Link href="/sign-in" onClick={closeMobileMenu}>
                        <button className="w-full text-left text-gray-600 hover:text-gray-900 transition-colors duration-200 py-2">
                          Sign In
                        </button>
                      </Link>
                      <Link href="/sign-up" onClick={closeMobileMenu}>
                        <button className="w-full bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 transition-colors duration-200 font-medium">
                          Sign Up
                        </button>
                      </Link>
                    </SignedOut>
                    <SignedIn>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Account</span>
                        <UserButton afterSignOutUrl="/" />
                      </div>
                    </SignedIn>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>
    </header>
  )
} 