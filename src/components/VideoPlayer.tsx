'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, SkipForward, RotateCcw, RotateCw, Maximize, Minimize, Settings } from 'lucide-react'
import { YouTubeVideo } from '@/lib/youtube'
import { VideoStateManager } from '@/lib/videoState'
import VideoProgress from './VideoProgress'

interface VideoPlayerProps {
  video: YouTubeVideo
  onNext?: () => void
  hasNext?: boolean
}

export default function VideoPlayer({ video, onNext, hasNext }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [hasStartedPlayback, setHasStartedPlayback] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const speedMenuRef = useRef<HTMLDivElement>(null)
  const controlsTimeoutRef = useRef<NodeJS.Timeout>()
  
  const speedOptions = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2, 2.25, 2.5, 2.75, 3.0]

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

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        (document as any).webkitFullscreenElement ||
        (document as any).mozFullScreenElement ||
        (document as any).msFullscreenElement
      )
      setIsFullscreen(isCurrentlyFullscreen)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('MSFullscreenChange', handleFullscreenChange)

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange)
    }
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (speedMenuRef.current && !speedMenuRef.current.contains(event.target as Node)) {
        setShowSpeedMenu(false)
      }
    }

    if (showSpeedMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSpeedMenu])

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== 'https://www.youtube.com') return
      
      try {
        const data = JSON.parse(event.data)
        if (data.event === 'video-progress') {
          setCurrentTime(data.info.currentTime)
          setDuration(data.info.duration)
        } else if (data.event === 'infoDelivery' && data.info) {
          // Handle YouTube player state updates
          if (data.info.currentTime !== undefined) {
            setCurrentTime(data.info.currentTime)
          }
          if (data.info.duration !== undefined) {
            setDuration(data.info.duration)
          }
          if (data.info.playerState !== undefined) {
            // PlayerState: 1=playing, 2=paused, 0=ended
            setIsPlaying(data.info.playerState === 1)
          }
        }
      } catch (error) {
        // Ignore parsing errors
      }
    }

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  // Request periodic time updates from YouTube player
  useEffect(() => {
    const requestTimeUpdate = () => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: 'getCurrentTime',
            args: []
          }),
          '*'
        )
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: 'getDuration',
            args: []
          }),
          '*'
        )
      }
    }

    let interval: NodeJS.Timeout
    if (isPlaying) {
      // Request updates every second while playing
      interval = setInterval(requestTimeUpdate, 1000)
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isPlaying])

  // Load saved video state on component mount
  useEffect(() => {
    const savedState = VideoStateManager.getVideoState(video.id)
    if (savedState && savedState.currentTime > 10 && !savedState.isCompleted) {
      // If user was more than 10 seconds in and hasn't completed, ask to resume
      const shouldResume = window.confirm(
        `Resume from ${Math.floor(savedState.currentTime / 60)}:${String(Math.floor(savedState.currentTime % 60)).padStart(2, '0')}?`
      )
      if (shouldResume) {
        setTimeout(() => {
          handleSeek(savedState.currentTime)
        }, 2000) // Wait for iframe to load
      }
    }
  }, [video.id])

  // Save video progress periodically
  useEffect(() => {
    if (duration > 0 && currentTime > 0) {
      const interval = setInterval(() => {
        VideoStateManager.updateVideoState({
          videoId: video.id,
          currentTime,
          duration,
          isCompleted: false,
          lastWatched: '',
          completionPercentage: 0
        })
      }, 10000) // Save every 10 seconds

      return () => clearInterval(interval)
    }
  }, [video.id, currentTime, duration])

  // Mark video as completed when reaching 90%
  useEffect(() => {
    if (duration > 0 && currentTime > 0) {
      const completionRatio = currentTime / duration
      if (completionRatio >= 0.9 && !hasStartedPlayback) {
        VideoStateManager.markVideoCompleted(video.id, duration)
        setHasStartedPlayback(true)
      }
    }
  }, [video.id, currentTime, duration, hasStartedPlayback])

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
    if (iframeRef.current && iframeRef.current.contentWindow) {
      if (isPlaying) {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: 'pauseVideo',
            args: []
          }),
          '*'
        )
      } else {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: 'playVideo',
            args: []
          }),
          '*'
        )
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

  const toggleFullscreen = () => {
    if (!containerRef.current) return

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      } else if ((containerRef.current as any).webkitRequestFullscreen) {
        (containerRef.current as any).webkitRequestFullscreen()
      } else if ((containerRef.current as any).mozRequestFullScreen) {
        (containerRef.current as any).mozRequestFullScreen()
      } else if ((containerRef.current as any).msRequestFullscreen) {
        (containerRef.current as any).msRequestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        (document as any).webkitExitFullscreen()
      } else if ((document as any).mozCancelFullScreen) {
        (document as any).mozCancelFullScreen()
      } else if ((document as any).msExitFullscreen) {
        (document as any).msExitFullscreen()
      }
    }
  }

  const changePlaybackSpeed = (speed: number) => {
    setPlaybackSpeed(speed)
    setShowSpeedMenu(false)
    if (iframeRef.current && iframeRef.current.contentWindow) {
      // YouTube iframe API requires this specific format
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'setPlaybackRate',
          args: [speed]
        }),
        '*'
      )
    }
  }

  const skipBackward = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      // Skip back 30 seconds
      const newTime = Math.max(0, currentTime - 30)
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'seekTo',
          args: [newTime, true]
        }),
        '*'
      )
      setCurrentTime(newTime)
    }
  }

  const skipForward = () => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      // Skip forward 30 seconds
      const newTime = duration > 0 ? Math.min(duration, currentTime + 30) : currentTime + 30
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'seekTo',
          args: [newTime, true]
        }),
        '*'
      )
      setCurrentTime(newTime)
    }
  }

  const handleSeek = (time: number) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({
          event: 'command',
          func: 'seekTo',
          args: [time, true]
        }),
        '*'
      )
      setCurrentTime(time)
    }
  }

  return (
    <div 
      ref={containerRef}
      className={`relative w-full bg-black overflow-hidden group ${
        isFullscreen ? 'fixed inset-0 z-50' : 'aspect-video rounded-lg'
      }`}
    >
      <iframe
        ref={iframeRef}
        className="w-full h-full"
        src={`https://www.youtube.com/embed/${video.id}?enablejsapi=1&controls=0&rel=0&modestbranding=1&autoplay=0&origin=${window.location.origin}`}
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
        <div className="absolute bottom-0 left-0 right-0 p-6 space-y-4">
          {/* Progress Bar */}
          <VideoProgress
            currentTime={currentTime}
            duration={duration}
            onSeek={handleSeek}
            className="w-full"
          />
          
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
                onClick={skipBackward}
                className="flex flex-col items-center justify-center w-12 h-12 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors relative"
                title="Skip back 30 seconds"
              >
                <RotateCcw size={16} />
                <span className="text-xs font-bold leading-none">30</span>
              </button>

              <button
                onClick={togglePlayPause}
                className="flex items-center justify-center w-14 h-14 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
              >
                {isPlaying ? <Pause size={26} /> : <Play size={26} />}
              </button>

              <button
                onClick={skipForward}
                className="flex flex-col items-center justify-center w-12 h-12 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors relative"
                title="Skip forward 30 seconds"
              >
                <RotateCw size={16} />
                <span className="text-xs font-bold leading-none">30</span>
              </button>
              
              {hasNext && (
                <button
                  onClick={handleNext}
                  className="flex items-center justify-center w-12 h-12 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
                >
                  <SkipForward size={24} />
                </button>
              )}

              <div className="relative" ref={speedMenuRef}>
                <button
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className="flex items-center justify-center w-12 h-12 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
                >
                  <Settings size={20} />
                </button>
                
                {showSpeedMenu && (
                  <div className="absolute bottom-14 right-0 bg-black/95 rounded-lg p-3 min-w-[140px] z-10 border border-gray-600 shadow-xl max-h-80 overflow-y-auto">
                    <div className="text-white text-sm font-medium mb-3 px-1 border-b border-gray-600 pb-2">Playback Speed</div>
                    <div className="grid grid-cols-2 gap-1">
                      {speedOptions.map((speed) => (
                        <button
                          key={speed}
                          onClick={() => changePlaybackSpeed(speed)}
                          className={`px-3 py-2 text-sm rounded-md hover:bg-white/20 transition-colors text-center ${
                            playbackSpeed === speed ? 'bg-red-600 text-white' : 'text-white hover:text-red-300'
                          }`}
                        >
                          {speed}x
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={toggleFullscreen}
                className="flex items-center justify-center w-12 h-12 bg-white/20 text-white rounded-full hover:bg-white/30 transition-colors"
              >
                {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}