'use client'

import { YouTubeVideo } from '@/lib/youtube'
import { VideoStateManager } from '@/lib/videoState'
import { formatDistanceToNow } from 'date-fns'
import { CheckCircle, Clock } from 'lucide-react'

interface VideoGridProps {
  videos: YouTubeVideo[]
  onVideoClick: (video: YouTubeVideo) => void
}

export default function VideoGrid({ videos, onVideoClick }: VideoGridProps) {
  console.log('[VideoGrid] Component rendered with videos:', videos.length)
  
  if (videos.length === 0) {
    console.log('[VideoGrid] No videos to display - showing empty state')
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 text-lg">No videos found from your subscriptions</p>
      </div>
    )
  }

  const formatDuration = (duration: string) => {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
    if (!match) return ''
    
    const hours = parseInt(match[1] || '0')
    const minutes = parseInt(match[2] || '0')
    const seconds = parseInt(match[3] || '0')
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {videos.map((video) => {
        // Only access localStorage on client side
        console.log('[VideoGrid] Rendering video:', video.id, video.title.substring(0, 30))
        let watchState = null
        try {
          if (typeof window !== 'undefined') {
            console.log('[VideoGrid] Getting watch state for:', video.id)
            watchState = VideoStateManager.getVideoState(video.id)
          } else {
            console.log('[VideoGrid] Server-side rendering, skipping localStorage')
          }
        } catch (error) {
          console.error('[VideoGrid] Error getting watch state for', video.id, ':', error)
        }
        
        const isCompleted = watchState?.isCompleted || false
        const hasProgress = watchState && watchState.currentTime > 10 && !isCompleted
        const progressPercentage = watchState ? watchState.completionPercentage : 0
        
        console.log('[VideoGrid] Video', video.id, 'state:', { isCompleted, hasProgress, progressPercentage })
        
        return (
          <div
            key={video.id}
            onClick={() => onVideoClick(video)}
            className={`bg-gray-800 rounded-lg overflow-hidden cursor-pointer hover:bg-gray-700 transition-colors group relative ${
              isCompleted ? 'opacity-75' : ''
            }`}
          >
            <div className="relative">
              <img
                src={video.thumbnails.medium.url}
                alt={video.title}
                className="w-full aspect-video object-cover"
              />
              
              {/* Progress bar overlay */}
              {hasProgress && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/50">
                  <div 
                    className="h-full bg-red-600 transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              )}
              
              {/* Duration badge */}
              {video.duration && (
                <div className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                  {formatDuration(video.duration)}
                </div>
              )}
              
              {/* Watch status indicators */}
              <div className="absolute top-2 right-2 flex gap-1">
                {isCompleted && (
                  <div className="bg-green-600 text-white p-1.5 rounded-full" title="Completed">
                    <CheckCircle size={16} />
                  </div>
                )}
                {hasProgress && !isCompleted && (
                  <div className="bg-blue-600 text-white p-1.5 rounded-full" title={`${progressPercentage}% watched`}>
                    <Clock size={16} />
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-white font-medium line-clamp-2 mb-2 group-hover:text-red-400 transition-colors">
                {video.title}
              </h3>
              
              <p className="text-gray-400 text-sm mb-1">
                {video.channelTitle}
              </p>
              
              <p className="text-gray-500 text-xs">
                {formatDistanceToNow(new Date(video.publishedAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}