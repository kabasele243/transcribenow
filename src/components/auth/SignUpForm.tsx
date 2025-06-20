'use client'

import { SignUp } from '@clerk/nextjs'
import { useAppSelector } from '@/store/hooks'
import { selectAuthError } from '@/store/slices/authSlice'

interface SignUpFormProps {
  redirectUrl?: string
  className?: string
}

export default function SignUpForm({ redirectUrl, className }: SignUpFormProps) {
  const authError = useAppSelector(selectAuthError)

  return (
    <div className={className}>
      {authError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm">{authError}</p>
        </div>
      )}
      
      <SignUp 
        redirectUrl={redirectUrl}
        appearance={{
          elements: {
            rootBox: "mx-auto",
            card: "shadow-lg border border-gray-200",
            headerTitle: "text-2xl font-bold text-gray-900",
            headerSubtitle: "text-gray-600",
            formButtonPrimary: "bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors",
            formFieldInput: "border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 rounded-md px-3 py-2",
            footerActionLink: "text-blue-600 hover:text-blue-800",
          }
        }}
      />
    </div>
  )
} 