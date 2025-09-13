'use client'

import { useState, useEffect } from 'react'
import { signIn, getProviders } from 'next-auth/react'
import { useSearchParams } from 'next/navigation'
import { Youtube, AlertCircle } from 'lucide-react'

export default function SignIn() {
  const [providers, setProviders] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  useEffect(() => {
    const fetchProviders = async () => {
      const res = await getProviders()
      setProviders(res)
    }
    fetchProviders()
  }, [])

  const handleSignIn = async (providerId: string) => {
    setIsLoading(true)
    try {
      await signIn(providerId, { callbackUrl })
    } catch (error) {
      console.error('Sign in error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'OAuthSignin':
        return 'Error occurred during OAuth sign-in process.'
      case 'OAuthCallback':
        return 'Error occurred during OAuth callback.'
      case 'OAuthCreateAccount':
        return 'Could not create OAuth account.'
      case 'EmailCreateAccount':
        return 'Could not create email account.'
      case 'Callback':
        return 'Error occurred during callback.'
      case 'OAuthAccountNotLinked':
        return 'Email already associated with another account.'
      case 'EmailSignin':
        return 'Check your email for the sign-in link.'
      case 'CredentialsSignin':
        return 'Invalid credentials.'
      case 'SessionRequired':
        return 'Please sign in to access this page.'
      case 'AccessDenied':
        return 'Access denied. You may not have permission to access YouTube data.'
      default:
        return error ? 'An error occurred during sign-in.' : null
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <div className="flex items-center justify-center mb-6">
            <Youtube size={48} className="text-red-600 mr-3" />
            <h1 className="text-3xl font-bold text-white">MyTube</h1>
          </div>
          <h2 className="text-xl text-gray-300 mb-8">
            Sign in to access your YouTube subscriptions
          </h2>
        </div>

        {error && (
          <div className="bg-red-600 border border-red-700 text-white px-4 py-3 rounded-lg flex items-start space-x-3">
            <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium">Sign-in Error</p>
              <p className="text-sm text-red-100">{getErrorMessage(error)}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {providers &&
            Object.values(providers).map((provider: any) => (
              <div key={provider.name}>
                <button
                  onClick={() => handleSignIn(provider.id)}
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                        <path
                          fill="currentColor"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="currentColor"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="currentColor"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                      Sign in with {provider.name}
                    </>
                  )}
                </button>
              </div>
            ))}
        </div>

        <div className="text-center">
          <p className="text-gray-400 text-sm">
            By signing in, you agree to allow MyTube to access your YouTube subscriptions
            and view your subscription data.
          </p>
        </div>
      </div>
    </div>
  )
}