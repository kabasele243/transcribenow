'use client'

import { SignUp } from '@clerk/nextjs'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectAuthError, selectIsSigningUp } from '@/store/slices/authSlice'

interface SignUpFormProps {
  redirectUrl?: string
  className?: string
}

export default function SignUpForm({ redirectUrl = '/dashboard', className = '' }: SignUpFormProps) {
  const dispatch = useAppDispatch()
  const error = useAppSelector(selectAuthError)
  const isSigningUp = useAppSelector(selectIsSigningUp)

  return (
    <div className={`w-full max-w-md mx-auto ${className}`}>
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      
      <SignUp
        path="/sign-up"
        routing="path"
        signInUrl="/sign-in"
        redirectUrl={redirectUrl}
        appearance={{
          elements: {
            formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-white',
            card: 'shadow-lg border border-gray-200',
            headerTitle: 'text-2xl font-bold text-gray-900',
            headerSubtitle: 'text-gray-600',
            socialButtonsBlockButton: 'border border-gray-300 hover:bg-gray-50',
            formFieldInput: 'border border-gray-300 focus:border-blue-500 focus:ring-blue-500',
            footerActionLink: 'text-blue-600 hover:text-blue-700',
          }
        }}
      />
    </div>
  )
} 