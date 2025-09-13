'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import LoginButton from '@/components/LoginButton'
import VideoGrid from '@/components/VideoGrid'
import VideoPlayer from '@/components/VideoPlayer'
import { YouTubeVideo } from '@/lib/youtube'
import { VideoStateManager } from '@/lib/videoState'
import { Youtube } from 'lucide-react'

export default function Home() {
  const { data: session } = useSession()
  const [videos, setVideos] = useState<YouTubeVideo[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const loadVideos = useCallback(async () => {
    if (!session) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/youtube/subscriptions')
      if (response.ok) {
        const data = await response.json()
        setVideos(data.videos)
      } else {
        console.error('Failed to fetch videos:', response.statusText)
      }
    } catch (error) {
      console.error('Error loading videos:', error)
    } finally {
      setLoading(false)
    }
  }, [session])

  useEffect(() => {
    if (session?.accessToken) {
      loadVideos()
    }
  }, [session, loadVideos])

  const handleVideoClick = (video: YouTubeVideo) => {
    const index = videos.findIndex(v => v.id === video.id)
    setSelectedVideo(video)
    setCurrentIndex(index)
  }

  const handleNext = () => {
    // Only use smart navigation on client side
    if (typeof window !== 'undefined') {
      // Find the next unwatched video
      let nextIndex = currentIndex + 1
      
      while (nextIndex < videos.length) {
        const video = videos[nextIndex]
        const watchState = VideoStateManager.getVideoState(video.id)
        
        // If video is not completed, use it
        if (!watchState || !watchState.isCompleted) {
          setSelectedVideo(video)
          setCurrentIndex(nextIndex)
          return
        }
        
        nextIndex++
      }
    }
    
    // Fallback: go to regular next video
    if (currentIndex < videos.length - 1) {
      const regularNext = currentIndex + 1
      setSelectedVideo(videos[regularNext])
      setCurrentIndex(regularNext)
    }
  }

  const handleBack = () => {
    setSelectedVideo(null)
    setCurrentIndex(0)
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Youtube size={64} className="text-red-600 mr-3" />
            <h1 className="text-4xl font-bold">MyTube</h1>
          </div>
          <p className="text-gray-400 text-lg mb-8">
            Watch videos from your YouTube subscriptions with custom controls
          </p>
        </div>
        <LoginButton />
      </div>
    )
  }

  if (selectedVideo) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <button
              onClick={handleBack}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              ← Back to Videos
            </button>
            <LoginButton />
          </div>
          
          <VideoPlayer
            video={selectedVideo}
            onNext={handleNext}
            hasNext={(() => {
              // Check if there are any videos after current index
              return currentIndex < videos.length - 1
            })()}
          />
          
          <div className="mt-6 text-center text-gray-400">
            <div>Video {currentIndex + 1} of {videos.length}</div>
            <div className="text-sm mt-1">
              {(() => {
                if (typeof window === 'undefined') return ''
                const unwatchedCount = videos.filter(video => {
                  const watchState = VideoStateManager.getVideoState(video.id)
                  return !watchState || !watchState.isCompleted
                }).length
                return `${unwatchedCount} unwatched videos remaining`
              })()}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 bg-gray-900 border-b border-gray-700 p-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <Youtube size={32} className="text-red-600 mr-3" />
            <h1 className="text-2xl font-bold">MyTube</h1>
          </div>
          <LoginButton />
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading your subscribed videos...</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">
                  Latest from Your Subscriptions
                </h2>
                <p className="text-gray-400">
                  {videos.length} videos from your subscribed channels
                </p>
              </div>
              
              <VideoGrid videos={videos} onVideoClick={handleVideoClick} />
            </>
          )}
        </div>
      </main>
    </div>
  )
}
