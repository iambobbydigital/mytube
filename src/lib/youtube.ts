import { google } from 'googleapis'

export interface YouTubeVideo {
  id: string
  title: string
  description: string
  channelTitle: string
  channelId: string
  publishedAt: string
  thumbnails: {
    default: { url: string }
    medium: { url: string }
    high: { url: string }
  }
  duration: string
}

export interface VideoWatchState {
  videoId: string
  currentTime: number
  duration: number
  isCompleted: boolean
  lastWatched: string
  completionPercentage: number
}

export interface YouTubeChannel {
  id: string
  title: string
  thumbnails: {
    default: { url: string }
    medium: { url: string }
    high: { url: string }
  }
}

export class YouTubeService {
  private youtube

  constructor(accessToken: string) {
    const auth = new google.auth.OAuth2()
    auth.setCredentials({ access_token: accessToken })
    
    this.youtube = google.youtube({
      version: 'v3',
      auth: auth
    })
  }

  async getSubscriptions(): Promise<YouTubeChannel[]> {
    try {
      console.log('[YouTube API] Fetching subscriptions from YouTube API...')
      console.log('[YouTube API] Request params:', { part: ['snippet'], mine: true, maxResults: 50 })
      
      const response = await this.youtube.subscriptions.list({
        part: ['snippet'],
        mine: true,
        maxResults: 50
      })

      console.log('[YouTube API] Raw API response status:', response.status)
      console.log('[YouTube API] Response headers:', response.headers)
      console.log('[YouTube API] Response data keys:', Object.keys(response.data || {}))
      console.log('[YouTube API] Items array length:', response.data.items?.length || 0)
      console.log('[YouTube API] Full response data:', JSON.stringify(response.data, null, 2))

      const subscriptions = response.data.items?.map(item => {
        console.log('[YouTube API] Processing subscription item:', {
          channelId: item.snippet?.resourceId?.channelId,
          title: item.snippet?.title,
          hasSnippet: !!item.snippet,
          hasResourceId: !!item.snippet?.resourceId
        })
        return {
          id: item.snippet?.resourceId?.channelId || '',
          title: item.snippet?.title || '',
          thumbnails: {
            default: { url: item.snippet?.thumbnails?.default?.url || '' },
            medium: { url: item.snippet?.thumbnails?.medium?.url || '' },
            high: { url: item.snippet?.thumbnails?.high?.url || '' }
          }
        }
      }) || []
      
      console.log(`[YouTube API] Found ${subscriptions.length} subscriptions`)
      if (subscriptions.length > 0) {
        console.log('[YouTube API] First subscription:', subscriptions[0])
      }
      return subscriptions
    } catch (error) {
      console.error('[YouTube API] Error fetching subscriptions:', error)
      console.error('[YouTube API] Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      return []
    }
  }

  async getChannelVideos(channelId: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
    try {
      console.log(`[YouTube API] Fetching videos for channel: ${channelId} (max: ${maxResults})`)
      
      const searchResponse = await this.youtube.search.list({
        part: ['snippet'],
        channelId: channelId,
        order: 'date',
        type: ['video'],
        maxResults: maxResults
      })

      console.log(`[YouTube API] Search response status:`, searchResponse.status)
      console.log(`[YouTube API] Search response items:`, searchResponse.data.items?.length || 0)
      
      if (!searchResponse.data.items) {
        console.log(`[YouTube API] No items in search response for channel ${channelId}`)
        return []
      }

      const videoIds = searchResponse.data.items.map(item => item.id?.videoId).filter(Boolean)
      console.log(`[YouTube API] Video IDs found:`, videoIds.length, videoIds.slice(0, 3))
      
      if (videoIds.length === 0) {
        console.log(`[YouTube API] No video IDs found for channel ${channelId}`)
        return []
      }

      console.log(`[YouTube API] Fetching detailed video info for ${videoIds.length} videos`)
      const videosResponse = await this.youtube.videos.list({
        part: ['snippet', 'contentDetails'],
        id: videoIds
      })

      console.log(`[YouTube API] Videos response status:`, videosResponse.status)
      console.log(`[YouTube API] Videos response items:`, videosResponse.data.items?.length || 0)

      const videos = videosResponse.data.items?.map(item => ({
        id: item.id || '',
        title: item.snippet?.title || '',
        description: item.snippet?.description || '',
        channelTitle: item.snippet?.channelTitle || '',
        channelId: item.snippet?.channelId || '',
        publishedAt: item.snippet?.publishedAt || '',
        thumbnails: {
          default: { url: item.snippet?.thumbnails?.default?.url || '' },
          medium: { url: item.snippet?.thumbnails?.medium?.url || '' },
          high: { url: item.snippet?.thumbnails?.high?.url || '' }
        },
        duration: item.contentDetails?.duration || ''
      })) || []
      
      console.log(`[YouTube API] Processed ${videos.length} videos for channel ${channelId}`)
      return videos
    } catch (error) {
      console.error(`[YouTube API] Error fetching channel videos for ${channelId}:`, error)
      console.error(`[YouTube API] Error details:`, {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error)
      })
      return []
    }
  }

  async getVideosFromSubscriptions(): Promise<YouTubeVideo[]> {
    try {
      console.log('[YouTube API] ===== Starting getVideosFromSubscriptions =====')
      
      const channels = await this.getSubscriptions()
      console.log(`[YouTube API] ===== Got ${channels.length} total channels =====`)
      
      if (channels.length === 0) {
        console.log('[YouTube API] ===== NO CHANNELS FOUND - This is the root cause! =====')
        return []
      }
      
      const channelsToProcess = channels.slice(0, 10)
      console.log(`[YouTube API] Processing ${channelsToProcess.length} channels (first 10)...`)
      
      const allVideos: YouTubeVideo[] = []

      for (let i = 0; i < channelsToProcess.length; i++) {
        const channel = channelsToProcess[i]
        console.log(`[YouTube API] ===== Channel ${i + 1}/${channelsToProcess.length}: ${channel.title} (${channel.id}) =====`)
        
        if (!channel.id) {
          console.log(`[YouTube API] WARNING: Channel ${channel.title} has no ID, skipping`)
          continue
        }
        
        const videos = await this.getChannelVideos(channel.id, 5)
        console.log(`[YouTube API] Channel ${channel.title} returned ${videos.length} videos`)
        
        if (videos.length > 0) {
          console.log(`[YouTube API] First video from ${channel.title}:`, videos[0].title)
        }
        
        allVideos.push(...videos)
        console.log(`[YouTube API] Running total: ${allVideos.length} videos`)
      }

      console.log(`[YouTube API] ===== FINAL RESULT: ${allVideos.length} total videos collected =====`)
      
      if (allVideos.length > 0) {
        const sorted = allVideos.sort((a, b) => 
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
        )
        console.log(`[YouTube API] Sorted videos, latest:`, sorted[0]?.title, sorted[0]?.publishedAt)
        return sorted
      }
      
      return []
    } catch (error) {
      console.error('[YouTube API] ===== FATAL ERROR in getVideosFromSubscriptions =====', error)
      console.error('[YouTube API] Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      })
      return []
    }
  }
}