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
      // Accept messages from YouTube domains and subdomains
      const validOrigins = [
        'https://www.youtube.com',
        'https://youtube.com', 
        'https://www.youtube-nocookie.com',
        'https://youtube-nocookie.com'
      ]
      
      const isValidOrigin = validOrigins.some(origin => event.origin === origin)
      if (!isValidOrigin) {
        console.log('[VideoPlayer] Ignoring message from origin:', event.origin)
        return
      }
      
      console.log('[VideoPlayer] Raw message received:', event.data, 'from origin:', event.origin)
      
      try {
        // Handle both string and object data from YouTube
        let data = event.data
        if (typeof data === 'string') {
          // Skip empty or non-JSON strings
          if (!data.trim() || (!data.startsWith('{') && !data.startsWith('['))) {
            console.log('[VideoPlayer] Skipping non-JSON string message:', data)
            return
          }
          data = JSON.parse(data)
        }
        
        console.log('[VideoPlayer] Parsed YouTube message:', data)
        
        // Handle YouTube API ready event
        if (data.event === 'onReady') {
          console.log('[VideoPlayer] YouTube player ready!')
          // Request initial data when player is ready
          setTimeout(() => {
            if (iframeRef.current && iframeRef.current.contentWindow) {
              console.log('[VideoPlayer] Requesting initial data after ready event')
              // Request duration
              iframeRef.current.contentWindow.postMessage(JSON.stringify({
                event: 'command',
                func: 'getDuration',
                args: []
              }), '*')
              
              // Request current time
              iframeRef.current.contentWindow.postMessage(JSON.stringify({
                event: 'command',
                func: 'getCurrentTime', 
                args: []
              }), '*')
            }
          }, 500)
        }
        
        // Handle state change events (more reliable than infoDelivery)
        else if (data.event === 'onStateChange') {
          console.log('[VideoPlayer] State change event:', data.info)
          const newIsPlaying = data.info === 1 // 1 = playing
          setIsPlaying(newIsPlaying)
          
          // Request time update on state change
          if (iframeRef.current && iframeRef.current.contentWindow) {
            iframeRef.current.contentWindow.postMessage(JSON.stringify({
              event: 'command',
              func: 'getCurrentTime',
              args: []
            }), '*')
          }
        }
        
        // Handle video progress updates
        else if (data.event === 'video-progress') {
          console.log('[VideoPlayer] Video progress event:', data.info)
          if (data.info && typeof data.info.currentTime === 'number') {
            setCurrentTime(data.info.currentTime)
          }
          if (data.info && typeof data.info.duration === 'number') {
            setDuration(data.info.duration)
          }
        } 
        
        // Handle info delivery events
        else if (data.event === 'infoDelivery' && data.info) {
          console.log('[VideoPlayer] Info delivery event:', data.info)
          
          if (typeof data.info.currentTime === 'number') {
            console.log('[VideoPlayer] Setting current time from infoDelivery:', data.info.currentTime)
            setCurrentTime(data.info.currentTime)
          }
          if (typeof data.info.duration === 'number') {
            console.log('[VideoPlayer] Setting duration from infoDelivery:', data.info.duration)
            setDuration(data.info.duration)
          }
          if (data.info.playerState !== undefined) {
            const newIsPlaying = data.info.playerState === 1
            console.log('[VideoPlayer] Player state change from infoDelivery:', data.info.playerState, 'isPlaying:', newIsPlaying)
            setIsPlaying(newIsPlaying)
          }
        } 
        
        // Handle direct command responses
        else if (data.event === 'command') {
          console.log('[VideoPlayer] Command response:', data)
          if (data.func === 'getDuration' && typeof data.info === 'number' && data.info > 0) {
            console.log('[VideoPlayer] Duration response:', data.info)
            setDuration(data.info)
          } else if (data.func === 'getCurrentTime' && typeof data.info === 'number') {
            console.log('[VideoPlayer] Current time response:', data.info)
            setCurrentTime(data.info)
          } else if (data.func === 'getPlayerState' && typeof data.info === 'number') {
            console.log('[VideoPlayer] Player state response:', data.info)
            setIsPlaying(data.info === 1)
          }
        }
      } catch (error) {
        console.log('[VideoPlayer] Error parsing YouTube message:', error, 'Raw data:', event.data)
      }
    }

    window.addEventListener('message', handleMessage)
    return () => {
      window.removeEventListener('message', handleMessage)
    }
  }, [])

  // Initialize YouTube player and request initial data
  useEffect(() => {
    const iframe = iframeRef.current
    if (!iframe) return

    let retryCount = 0
    const maxRetries = 5
    let retryTimeout: NodeJS.Timeout

    const requestInitialData = () => {
      if (!iframe.contentWindow) {
        console.log('[VideoPlayer] No contentWindow available, retrying...')
        if (retryCount < maxRetries) {
          retryCount++
          retryTimeout = setTimeout(requestInitialData, 1000)
        }
        return
      }

      console.log('[VideoPlayer] Requesting initial data (attempt:', retryCount + 1, ')')
      
      // Request duration
      iframe.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: 'getDuration',
        args: []
      }), '*')
      
      // Request current time
      iframe.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: 'getCurrentTime', 
        args: []
      }), '*')

      // Request player state
      iframe.contentWindow.postMessage(JSON.stringify({
        event: 'command',
        func: 'getPlayerState',
        args: []
      }), '*')

      // Enable listening for updates
      iframe.contentWindow.postMessage(JSON.stringify({
        event: 'listening',
        id: video.id
      }), '*')
    }

    const onIframeLoad = () => {
      console.log('[VideoPlayer] Iframe loaded for video:', video.id)
      
      // Wait for YouTube player to initialize, then request data
      setTimeout(() => {
        requestInitialData()
      }, 1500) // Increased wait time
    }

    iframe.addEventListener('load', onIframeLoad)
    
    // If iframe is already loaded, trigger the load handler
    if (iframe.complete) {
      console.log('[VideoPlayer] Iframe already loaded, triggering load handler')
      onIframeLoad()
    }
    
    return () => {
      iframe.removeEventListener('load', onIframeLoad)
      if (retryTimeout) {
        clearTimeout(retryTimeout)
      }
    }
  }, [video.id])

  // Request periodic time updates from YouTube player
  useEffect(() => {
    const requestTimeUpdate = () => {
      if (iframeRef.current && iframeRef.current.contentWindow) {
        // Only request current time if we're playing or need duration
        if (isPlaying || duration === 0) {
          console.log('[VideoPlayer] Requesting time update - playing:', isPlaying, 'duration:', duration)
          
          iframeRef.current.contentWindow.postMessage(JSON.stringify({
            event: 'command',
            func: 'getCurrentTime',
            args: []
          }), '*')
          
          // Request duration if we don't have it yet
          if (duration === 0) {
            iframeRef.current.contentWindow.postMessage(JSON.stringify({
              event: 'command',
              func: 'getDuration',
              args: []
            }), '*')
          }
        }
      } else {
        console.log('[VideoPlayer] Cannot request time update - no iframe or contentWindow')
      }
    }

    let interval: NodeJS.Timeout
    
    // Request updates every second when playing, every 5 seconds when paused
    const updateInterval = isPlaying ? 1000 : 5000
    interval = setInterval(requestTimeUpdate, updateInterval)

    // Also request immediately
    requestTimeUpdate()

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [isPlaying, duration, video.id])

  // Load saved video state on component mount (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return
    
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

  // Save video progress periodically (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return
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

  // Mark video as completed when reaching 90% (client-side only)
  useEffect(() => {
    if (typeof window === 'undefined') return
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
        src={`https://www.youtube.com/embed/${video.id}?enablejsapi=1&controls=0&rel=0&modestbranding=1&autoplay=0&fs=0&iv_load_policy=3&cc_load_policy=0&disablekb=1&playsinline=1&origin=${typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : ''}`}
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
              {/* Debug info - remove in production */}
              <div className="text-xs text-yellow-300 mt-1 opacity-80">
                Debug: Time {currentTime.toFixed(1)}s / Duration {duration.toFixed(1)}s | Playing: {isPlaying ? 'Yes' : 'No'}
              </div>
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