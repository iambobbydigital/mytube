'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, SkipForward } from 'lucide-react'
import { YouTubeVideo } from '@/lib/youtube'

interface VideoPlayerProps {
  video: YouTubeVideo
  onNext?: () => void
  hasNext?: boolean
}

export default function VideoPlayer({ video, onNext, hasNext }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    const hideControls = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false)
        }
      }, 3000)
    }

    hideControls()
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [isPlaying])

  const handleMouseMove = () => {
    setShowControls(true)
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current)
    }
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }
  }

  const togglePlayPause = () => {
    if (iframeRef.current) {
      const iframe = iframeRef.current
      if (isPlaying) {
        iframe.contentWindow?.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*')
      } else {
        iframe.contentWindow?.postMessage('{"event":"command","func":"playVideo","args":""}', '*')
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleNext = () => {
    if (onNext) {
      setIsPlaying(false)
      onNext()
    }
  }

  return (
    <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden group">
      <iframe
        ref={iframeRef}
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${video.id}?enablejsapi=1&controls=0&rel=0&modestbranding=1&autoplay=0`}
        title={video.title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
      
      <div 
        className="absolute inset-0 bg-transparent cursor-pointer"
        onMouseMove={handleMouseMove}
        onClick={togglePlayPause}
      />

      <div 
        className={`absolute inset-0 bg-gradient-to-t from-black/50 to-transparent transition-opacity duration-300 ${
          showControls || !isPlaying ? 'opacity-100' : 'opacity-0'
        }`}
        onMouseMove={handleMouseMove}
      >
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 mr-4">
              <h2 className="text-white text-lg font-semibold mb-1 line-clamp-2">
                {video.title}
              </h2>
              <p className="text-gray-300 text-sm">
                {video.channelTitle}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <button
                onClick={togglePlayPause}
                className="flex items-center justify-center w-12 h-12 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
              >
                {isPlaying ? <Pause size={24} /> : <Play size={24} />}
              </button>
              
              {hasNext && (
                <button
                  onClick={handleNext}
                  className="flex items-center justify-center w-12 h-12 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
                >
                  <SkipForward size={24} />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}