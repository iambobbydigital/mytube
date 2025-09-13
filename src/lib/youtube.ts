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
      const response = await this.youtube.subscriptions.list({
        part: ['snippet'],
        mine: true,
        maxResults: 50
      })

      return response.data.items?.map(item => ({
        id: item.snippet?.resourceId?.channelId || '',
        title: item.snippet?.title || '',
        thumbnails: {
          default: { url: item.snippet?.thumbnails?.default?.url || '' },
          medium: { url: item.snippet?.thumbnails?.medium?.url || '' },
          high: { url: item.snippet?.thumbnails?.high?.url || '' }
        }
      })) || []
    } catch (error) {
      console.error('Error fetching subscriptions:', error)
      return []
    }
  }

  async getChannelVideos(channelId: string, maxResults: number = 10): Promise<YouTubeVideo[]> {
    try {
      const searchResponse = await this.youtube.search.list({
        part: ['snippet'],
        channelId: channelId,
        order: 'date',
        type: ['video'],
        maxResults: maxResults
      })

      if (!searchResponse.data.items) return []

      const videoIds = searchResponse.data.items.map(item => item.id?.videoId).filter(Boolean)
      
      if (videoIds.length === 0) return []

      const videosResponse = await this.youtube.videos.list({
        part: ['snippet', 'contentDetails'],
        id: videoIds
      })

      return videosResponse.data.items?.map(item => ({
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
    } catch (error) {
      console.error('Error fetching channel videos:', error)
      return []
    }
  }

  async getVideosFromSubscriptions(): Promise<YouTubeVideo[]> {
    try {
      const channels = await this.getSubscriptions()
      const allVideos: YouTubeVideo[] = []

      for (const channel of channels.slice(0, 10)) {
        const videos = await this.getChannelVideos(channel.id, 5)
        allVideos.push(...videos)
      }

      return allVideos.sort((a, b) => 
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      )
    } catch (error) {
      console.error('Error fetching videos from subscriptions:', error)
      return []
    }
  }
}