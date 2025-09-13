import { VideoWatchState } from './youtube'

const VIDEO_STATE_KEY = 'mytube_video_states'

// Temporary flag to disable localStorage for debugging
const DISABLE_LOCALSTORAGE = false // Set to true to disable all localStorage features

export class VideoStateManager {
  private static isLocalStorageAvailable(): boolean {
    if (DISABLE_LOCALSTORAGE) {
      console.log('[VideoStateManager] localStorage disabled by flag')
      return false
    }
    
    if (typeof window === 'undefined') return false
    
    try {
      const test = '__localStorage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch (error) {
      console.warn('[VideoStateManager] localStorage not available:', error)
      return false
    }
  }

  private static getStoredStates(): Record<string, VideoWatchState> {
    if (!this.isLocalStorageAvailable()) {
      console.log('[VideoStateManager] localStorage not available, returning empty states')
      return {}
    }
    
    try {
      const stored = localStorage.getItem(VIDEO_STATE_KEY)
      const states = stored ? JSON.parse(stored) : {}
      console.log('[VideoStateManager] Loaded states:', Object.keys(states).length, 'videos')
      return states
    } catch (error) {
      console.error('[VideoStateManager] Error reading video states from localStorage:', error)
      return {}
    }
  }

  private static saveStates(states: Record<string, VideoWatchState>): void {
    if (!this.isLocalStorageAvailable()) {
      console.log('[VideoStateManager] localStorage not available, skipping save')
      return
    }
    
    try {
      localStorage.setItem(VIDEO_STATE_KEY, JSON.stringify(states))
      console.log('[VideoStateManager] Saved states for', Object.keys(states).length, 'videos')
    } catch (error) {
      console.error('[VideoStateManager] Error saving video states to localStorage:', error)
    }
  }

  static getVideoState(videoId: string): VideoWatchState | null {
    try {
      console.log('[VideoStateManager] Getting state for video:', videoId)
      const states = this.getStoredStates()
      const state = states[videoId] || null
      console.log('[VideoStateManager] Found state:', !!state, state ? `${state.completionPercentage}% complete` : 'not found')
      return state
    } catch (error) {
      console.error('[VideoStateManager] Error getting video state:', error)
      return null
    }
  }

  static updateVideoState(videoState: VideoWatchState): void {
    try {
      console.log('[VideoStateManager] Updating state for video:', videoState.videoId, `${videoState.currentTime}/${videoState.duration}`)
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
    } catch (error) {
      console.error('[VideoStateManager] Error updating video state:', error)
    }
  }

  static markVideoCompleted(videoId: string, duration: number): void {
    try {
      console.log('[VideoStateManager] Marking video completed:', videoId)
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
    } catch (error) {
      console.error('[VideoStateManager] Error marking video completed:', error)
    }
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