'use client'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { 
  selectUser, 
  selectIsAuthenticated, 
  selectAuthLoading, 
  selectAuthError,
  clearError 
} from '@/store/slices/authSlice'
import { useAuthState } from '@/hooks/useClerkAuth'

export default function AuthExample() {
  const dispatch = useAppDispatch()
  
  // Redux auth state
  const user = useAppSelector(selectUser)
  const isAuthenticated = useAppSelector(selectIsAuthenticated)
  const authLoading = useAppSelector(selectAuthLoading)
  const authError = useAppSelector(selectAuthError)
  
  // Clerk auth state (synced with Redux)
  const { isSignedIn, isLoaded } = useAuthState()

  const handleClearError = () => {
    dispatch(clearError())
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Authentication State Example</h2>
      
      {/* Loading State */}
      {authLoading && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-blue-800">Loading authentication state...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {authError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-red-800">{authError}</span>
            <button
              onClick={handleClearError}
              className="text-red-600 hover:text-red-800 text-sm underline"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Authentication Status */}
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-900 mb-2">Authentication Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Redux Authenticated:</span>
              <span className={`font-medium ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
                {isAuthenticated ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Clerk Signed In:</span>
              <span className={`font-medium ${isSignedIn ? 'text-green-600' : 'text-red-600'}`}>
                {isSignedIn ? 'Yes' : 'No'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Clerk Loaded:</span>
              <span className={`font-medium ${isLoaded ? 'text-green-600' : 'text-red-600'}`}>
                {isLoaded ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        {/* User Information */}
        {user && (
          <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-2">User Information (Redux)</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ID:</span>
                <span className="font-medium text-gray-900">{user.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium text-gray-900">{user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-gray-900">{user.email}</span>
              </div>
              {user.firstName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">First Name:</span>
                  <span className="font-medium text-gray-900">{user.firstName}</span>
                </div>
              )}
              {user.lastName && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Last Name:</span>
                  <span className="font-medium text-gray-900">{user.lastName}</span>
                </div>
              )}
              {user.avatar && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Avatar:</span>
                  <img 
                    src={user.avatar} 
                    alt="User avatar" 
                    className="w-8 h-8 rounded-full"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* Not Authenticated Message */}
        {!isAuthenticated && !authLoading && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-yellow-800">
              You are not authenticated. Please sign in to access your account.
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 