// Public YouTube API service that doesn't require OAuth
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

export class YouTubePublicService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  async searchVideos(query: string = 'popular', maxResults: number = 20): Promise<YouTubeVideo[]> {
    try {
      // Search for videos
      const searchUrl = `https://www.googleapis.com/youtube/v3/search?` +
        `part=snippet&type=video&q=${encodeURIComponent(query)}&` +
        `maxResults=${maxResults}&order=relevance&key=${this.apiKey}`

      const searchResponse = await fetch(searchUrl)
      if (!searchResponse.ok) {
        console.error('Search API error:', searchResponse.status, searchResponse.statusText)
        return []
      }
      
      const searchData = await searchResponse.json()
      
      if (!searchData.items?.length) {
        console.log('No videos found for query:', query)
        return []
      }

      const videoIds = searchData.items.map((item: any) => item.id.videoId).filter(Boolean)
      
      if (videoIds.length === 0) return []

      // Get video details including duration
      const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?` +
        `part=snippet,contentDetails&id=${videoIds.join(',')}&key=${this.apiKey}`

      const detailsResponse = await fetch(detailsUrl)
      if (!detailsResponse.ok) {
        console.error('Details API error:', detailsResponse.status, detailsResponse.statusText)
        return []
      }
      
      const detailsData = await detailsResponse.json()

      return detailsData.items?.map((item: any) => ({
        id: item.id,
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
      console.error('Error fetching videos:', error)
      return []
    }
  }

  async getTrendingVideos(maxResults: number = 20): Promise<YouTubeVideo[]> {
    try {
      const url = `https://www.googleapis.com/youtube/v3/videos?` +
        `part=snippet,contentDetails&chart=mostPopular&` +
        `maxResults=${maxResults}&regionCode=US&key=${this.apiKey}`

      const response = await fetch(url)
      if (!response.ok) {
        console.error('Trending API error:', response.status, response.statusText)
        return []
      }
      
      const data = await response.json()

      return data.items?.map((item: any) => ({
        id: item.id,
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
      console.error('Error fetching trending videos:', error)
      return []
    }
  }
}