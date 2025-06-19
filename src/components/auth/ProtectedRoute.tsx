'use client'

import { ReactNode, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppSelector } from '@/store/hooks'
import { selectIsAuthenticated, selectAuthLoading } from '@/store/slices/authSlice'

interface ProtectedRouteProps {
  children: ReactNode
  redirectTo?: string
  fallback?: ReactNode
}

export default function ProtectedRoute({ 
  children, 
  redirectTo = '/sign-in',
  fallback 
}: ProtectedRouteProps) {
  const router = useRouter()
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const authLoading = useAppSelector(selectAuthLoading)

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, authLoading, router, redirectTo])

  // Show loading state while checking authentication
  if (authLoading) {
    return fallback || (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    )
  }

  // Show children only if authenticated
  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
} 