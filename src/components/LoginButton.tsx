'use client'

import { signIn, signOut, useSession } from 'next-auth/react'
import { LogIn, LogOut, AlertCircle } from 'lucide-react'
import { useState } from 'react'

export default function LoginButton() {
  const { data: session, status } = useSession()
  const [isSigningOut, setIsSigningOut] = useState(false)

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
      </div>
    )
  }

  // Show error state if session has error
  if (session?.error) {
    return (
      <div className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg">
        <AlertCircle size={16} />
        <span className="text-sm">Session Error</span>
        <button
          onClick={() => signIn('google')}
          className="ml-2 px-2 py-1 bg-yellow-700 rounded text-xs hover:bg-yellow-800 transition-colors"
        >
          Refresh
        </button>
      </div>
    )
  }

  if (session) {
    const handleSignOut = async () => {
      setIsSigningOut(true)
      try {
        await signOut({ callbackUrl: '/' })
      } catch (error) {
        console.error('Sign out error:', error)
      } finally {
        setIsSigningOut(false)
      }
    }

    return (
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          {session.user?.image && (
            <img 
              src={session.user.image} 
              alt={session.user.name || 'User'} 
              className="w-8 h-8 rounded-full"
            />
          )}
          <div className="flex flex-col">
            <span className="text-white text-sm">{session.user?.name}</span>
            {session.user?.email && (
              <span className="text-gray-400 text-xs">{session.user.email}</span>
            )}
          </div>
        </div>
        <button
          onClick={handleSignOut}
          disabled={isSigningOut}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-red-800 disabled:cursor-not-allowed transition-colors"
        >
          {isSigningOut ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <LogOut size={20} />
          )}
          Sign Out
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => signIn('google')}
      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
    >
      <LogIn size={20} />
      Sign in with Google
    </button>
  )
}