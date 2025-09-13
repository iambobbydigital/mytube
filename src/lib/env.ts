// Environment configuration utilities
export const getBaseUrl = () => {
  // For server-side rendering
  if (typeof window === 'undefined') {
    // Check if we're in Vercel
    if (process.env.VERCEL_URL) {
      return `https://${process.env.VERCEL_URL}`
    }
    
    // Check if we have a custom domain
    if (process.env.NEXTAUTH_URL) {
      return process.env.NEXTAUTH_URL
    }
    
    // Fallback to localhost for development
    return process.env.NODE_ENV === 'production' 
      ? 'https://localhost:3001' 
      : 'http://localhost:3001'
  }
  
  // For client-side rendering
  if (typeof window !== 'undefined') {
    return window.location.origin
  }
  
  return 'http://localhost:3001'
}

export const getAuthUrl = () => {
  const baseUrl = getBaseUrl()
  return `${baseUrl}/api/auth`
}

export const isProduction = () => {
  return process.env.NODE_ENV === 'production'
}

export const isDevelopment = () => {
  return process.env.NODE_ENV === 'development'
}

export const getEnvironmentName = () => {
  if (process.env.VERCEL_ENV === 'production') return 'production'
  if (process.env.VERCEL_ENV === 'preview') return 'preview' 
  if (process.env.VERCEL_ENV === 'development') return 'development'
  return process.env.NODE_ENV || 'development'
}