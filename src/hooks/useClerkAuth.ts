import { useEffect } from 'react'
import { useUser, useAuth } from '@clerk/nextjs'
import { useAppDispatch } from '@/store/hooks'
import { syncClerkUser, clearUser, setAuthError } from '@/store/slices/authSlice'

/**
 * Custom hook that integrates Clerk authentication with Redux
 * Automatically syncs Clerk user state with Redux store
 */
export const useClerkAuth = () => {
  const { user, isLoaded: userLoaded } = useUser()
  const { isSignedIn, isLoaded: authLoaded } = useAuth()
  const dispatch = useAppDispatch()

  useEffect(() => {
    // Only proceed when both user and auth are loaded
    if (!userLoaded || !authLoaded) {
      return
    }

    if (isSignedIn && user) {
      // User is signed in, sync their data to Redux
      dispatch(syncClerkUser(user))
    } else {
      // User is not signed in, clear Redux user state
      dispatch(clearUser())
    }
  }, [user, isSignedIn, userLoaded, authLoaded, dispatch])

  return {
    user,
    isSignedIn,
    isLoaded: userLoaded && authLoaded,
  }
}

/**
 * Hook to get authentication state from Redux (synced with Clerk)
 */
export const useAuthState = () => {
  const { user, isSignedIn, isLoaded } = useClerkAuth()
  
  return {
    user,
    isSignedIn,
    isLoaded,
    // Additional convenience properties
    isAuthenticated: isSignedIn,
    isLoading: !isLoaded,
  }
} 