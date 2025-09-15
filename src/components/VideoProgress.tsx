'use client'

import { useState, useRef, MouseEvent } from 'react'

interface VideoProgressProps {
  currentTime: number
  duration: number
  onSeek: (time: number) => void
  className?: string
}

export default function VideoProgress({ currentTime, duration, onSeek, className = '' }: VideoProgressProps) {
  const [hoverTime, setHoverTime] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const progressRef = useRef<HTMLDivElement>(null)

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  const formatTime = (seconds: number): string => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleProgressClick = (e: MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || duration === 0) return

    const rect = progressRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = (clickX / rect.width) * 100
    const newTime = (percentage / 100) * duration

    onSeek(Math.max(0, Math.min(newTime, duration)))
  }

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || duration === 0) return

    const rect = progressRef.current.getBoundingClientRect()
    const hoverX = e.clientX - rect.left
    const percentage = (hoverX / rect.width) * 100
    const time = (percentage / 100) * duration

    setHoverTime(Math.max(0, Math.min(time, duration)))
  }

  const handleMouseLeave = () => {
    if (!isDragging) {
      setHoverTime(null)
    }
  }

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current || duration === 0) return
    
    setIsDragging(true)
    handleProgressClick(e)
    
    // Add global mouse events for dragging
    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (!progressRef.current || duration === 0) return
      
      const rect = progressRef.current.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const percentage = Math.max(0, Math.min(100, (clickX / rect.width) * 100))
      const newTime = (percentage / 100) * duration
      
      setHoverTime(newTime)
      onSeek(newTime)
    }
    
    const handleMouseUp = () => {
      setIsDragging(false)
      setHoverTime(null)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Current Time */}
      <span className="text-white text-sm font-mono min-w-[3rem] text-right">
        {formatTime(currentTime)}
      </span>

      {/* Progress Bar */}
      <div className="flex-1 relative group">
        <div
          ref={progressRef}
          className={`h-1 bg-white/30 rounded-full cursor-pointer group-hover:h-2 transition-all duration-200 relative ${
            isDragging ? 'h-2' : ''
          }`}
          onClick={handleProgressClick}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onMouseDown={handleMouseDown}
        >
          {/* Filled Progress */}
          <div
            className="h-full bg-red-600 rounded-full transition-all duration-100 relative"
            style={{ width: `${progress}%` }}
          >
            {/* Progress Handle */}
            <div
              className={`absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-red-600 rounded-full transition-all duration-200 -mr-1.5 cursor-pointer ${
                isDragging || hoverTime !== null ? 'opacity-100 scale-125' : 'opacity-0 group-hover:opacity-100'
              }`}
              style={{ boxShadow: '0 0 8px rgba(0,0,0,0.3)' }}
              onMouseDown={handleMouseDown}
            />
          </div>

          {/* Hover Time Tooltip */}
          {hoverTime !== null && (
            <div
              className="absolute -top-8 bg-black/80 text-white text-xs px-2 py-1 rounded pointer-events-none whitespace-nowrap z-10"
              style={{
                left: `${(hoverTime / duration) * 100}%`,
                transform: 'translateX(-50%)'
              }}
            >
              {formatTime(hoverTime)}
            </div>
          )}
        </div>
      </div>

      {/* Duration */}
      <span className="text-white/80 text-sm font-mono min-w-[3rem]">
        {formatTime(duration)}
      </span>
    </div>
  )
}