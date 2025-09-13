'use client'

import { useState, useEffect } from 'react'
import VideoGrid from '@/components/VideoGrid'
import VideoPlayer from '@/components/VideoPlayer'
import { YouTubeVideo } from '@/lib/youtube-public'
import { Youtube, Search } from 'lucide-react'

export default function TestPage() {
  const [videos, setVideos] = useState<YouTubeVideo[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadTrendingVideos()
  }, [])

  const loadTrendingVideos = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/youtube/public?type=trending')
      const data = await response.json()
      
      if (response.ok) {
        setVideos(data.videos)
        console.log('Loaded videos:', data.count)
      } else {
        setError(data.error || 'Failed to load videos')
        console.error('API error:', data)
      }
    } catch (error) {
      setError('Network error loading videos')
      console.error('Network error:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchVideos = async () => {
    if (!searchQuery.trim()) return
    
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/youtube/public?type=search&q=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      
      if (response.ok) {
        setVideos(data.videos)
        console.log('Search results:', data.count)
      } else {
        setError(data.error || 'Failed to search videos')
        console.error('Search error:', data)
      }
    } catch (error) {
      setError('Network error searching videos')
      console.error('Search network error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleVideoClick = (video: YouTubeVideo) => {
    const index = videos.findIndex(v => v.id === video.id)
    setSelectedVideo(video)
    setCurrentIndex(index)
  }

  const handleNext = () => {
    if (currentIndex < videos.length - 1) {
      const nextIndex = currentIndex + 1
      setSelectedVideo(videos[nextIndex])
      setCurrentIndex(nextIndex)
    }
  }

  const handleBack = () => {
    setSelectedVideo(null)
    setCurrentIndex(0)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      searchVideos()
    }
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
            <div className="text-gray-400">
              Test Mode - No Login Required
            </div>
          </div>
          
          <VideoPlayer
            video={selectedVideo}
            onNext={handleNext}
            hasNext={currentIndex < videos.length - 1}
          />
          
          <div className="mt-6 text-center text-gray-400">
            Video {currentIndex + 1} of {videos.length}
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
            <h1 className="text-2xl font-bold">MyTube Test</h1>
            <span className="ml-3 text-sm bg-green-600 px-2 py-1 rounded">
              No Login Required
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                className="px-3 py-2 bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-red-500 focus:outline-none"
              />
              <button
                onClick={searchVideos}
                disabled={loading || !searchQuery.trim()}
                className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-600 transition-colors"
              >
                <Search size={20} />
              </button>
            </div>
            <button
              onClick={loadTrendingVideos}
              disabled={loading}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-600 transition-colors"
            >
              Trending
            </button>
          </div>
        </div>
      </header>

      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {error && (
            <div className="bg-red-600 text-white p-4 rounded-lg mb-6">
              <h3 className="font-semibold">Error:</h3>
              <p>{error}</p>
              <p className="text-sm mt-2">
                Make sure you have a valid YouTube API key in your .env.local file.
              </p>
            </div>
          )}
          
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading videos...</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <h2 className="text-xl font-semibold mb-2">
                  {searchQuery ? `Search Results for "${searchQuery}"` : 'Trending Videos'}
                </h2>
                <p className="text-gray-400">
                  {videos.length} videos • Test mode using public YouTube API
                </p>
              </div>
              
              <VideoGrid videos={videos} onVideoClick={handleVideoClick} />
              
              {videos.length === 0 && !loading && !error && (
                <div className="text-center py-12">
                  <p className="text-gray-400 text-lg">No videos found</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Try searching for something or check your API key configuration
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}