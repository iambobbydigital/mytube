'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Youtube, AlertTriangle, RefreshCw, Home } from 'lucide-react'

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const getErrorDetails = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return {
          title: 'Server Configuration Error',
          description: 'There is a problem with the server configuration.',
          suggestion: 'Please contact the administrator.',
          canRetry: false
        }
      case 'AccessDenied':
        return {
          title: 'Access Denied',
          description: 'You do not have permission to sign in.',
          suggestion: 'Make sure you are using the correct Google account and have granted the necessary permissions.',
          canRetry: true
        }
      case 'Verification':
        return {
          title: 'Verification Error',
          description: 'The verification token has expired or is invalid.',
          suggestion: 'Please try signing in again.',
          canRetry: true
        }
      case 'Default':
        return {
          title: 'Authentication Error',
          description: 'An error occurred during authentication.',
          suggestion: 'Please try signing in again. If the problem persists, check your internet connection.',
          canRetry: true
        }
      default:
        return {
          title: 'Unknown Error',
          description: error || 'An unknown error occurred during authentication.',
          suggestion: 'Please try signing in again.',
          canRetry: true
        }
    }
  }

  const errorDetails = getErrorDetails(error)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <Youtube size={48} className="text-red-600 mr-3" />
            <h1 className="text-3xl font-bold text-white">MyTube</h1>
          </div>
        </div>

        <div className="bg-red-600 border border-red-700 text-white px-6 py-4 rounded-lg">
          <div className="flex items-start space-x-3">
            <AlertTriangle size={24} className="mt-1 flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-lg">{errorDetails.title}</h3>
              <p className="text-red-100 mt-1">{errorDetails.description}</p>
            </div>
          </div>
        </div>

        <div className="bg-gray-800 border border-gray-700 text-gray-300 px-6 py-4 rounded-lg">
          <h4 className="font-medium text-white mb-2">What you can do:</h4>
          <p className="text-sm">{errorDetails.suggestion}</p>
        </div>

        <div className="space-y-3">
          {errorDetails.canRetry && (
            <Link
              href="/auth/signin"
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              <RefreshCw size={20} className="mr-2" />
              Try Again
            </Link>
          )}
          
          <Link
            href="/"
            className="group relative w-full flex justify-center py-3 px-4 border border-gray-600 text-sm font-medium rounded-lg text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
          >
            <Home size={20} className="mr-2" />
            Go Home
          </Link>
        </div>

        {error && (
          <div className="text-center">
            <p className="text-gray-500 text-xs">
              Error code: {error}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}