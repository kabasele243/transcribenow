'use client'

import { ReactNode } from 'react'
import { useClerkAuth } from '@/hooks/useClerkAuth'

interface ClerkAuthProviderProps {
  children: ReactNode
}

/**
 * Provider component that syncs Clerk authentication with Redux
 * This component should be placed inside the ReduxProvider but outside components that need auth state
 */
export default function ClerkAuthProvider({ children }: ClerkAuthProviderProps) {
  // This hook will automatically sync Clerk user state with Redux
  useClerkAuth()

  return <>{children}</>
} 