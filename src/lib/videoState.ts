import { VideoWatchState } from './youtube'

const VIDEO_STATE_KEY = 'mytube_video_states'

export class VideoStateManager {
  private static getStoredStates(): Record<string, VideoWatchState> {
    if (typeof window === 'undefined') return {}
    
    try {
      const stored = localStorage.getItem(VIDEO_STATE_KEY)
      return stored ? JSON.parse(stored) : {}
    } catch (error) {
      console.error('Error reading video states from localStorage:', error)
      return {}
    }
  }

  private static saveStates(states: Record<string, VideoWatchState>): void {
    if (typeof window === 'undefined') return
    
    try {
      localStorage.setItem(VIDEO_STATE_KEY, JSON.stringify(states))
    } catch (error) {
      console.error('Error saving video states to localStorage:', error)
    }
  }

  static getVideoState(videoId: string): VideoWatchState | null {
    const states = this.getStoredStates()
    return states[videoId] || null
  }

  static updateVideoState(videoState: VideoWatchState): void {
    const states = this.getStoredStates()
    states[videoState.videoId] = {
      ...videoState,
      lastWatched: new Date().toISOString(),
      completionPercentage: videoState.duration > 0 
        ? Math.round((videoState.currentTime / videoState.duration) * 100)
        : 0,
      isCompleted: videoState.duration > 0 
        ? (videoState.currentTime / videoState.duration) >= 0.9
        : false
    }
    this.saveStates(states)
  }

  static markVideoCompleted(videoId: string, duration: number): void {
    const states = this.getStoredStates()
    states[videoId] = {
      videoId,
      currentTime: duration,
      duration,
      isCompleted: true,
      lastWatched: new Date().toISOString(),
      completionPercentage: 100
    }
    this.saveStates(states)
  }

  static getAllVideoStates(): Record<string, VideoWatchState> {
    return this.getStoredStates()
  }

  static clearVideoState(videoId: string): void {
    const states = this.getStoredStates()
    delete states[videoId]
    this.saveStates(states)
  }

  static clearAllStates(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(VIDEO_STATE_KEY)
    }
  }
}