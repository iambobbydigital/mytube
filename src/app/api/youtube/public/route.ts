import { NextRequest, NextResponse } from 'next/server'
import { YouTubePublicService } from '@/lib/youtube-public'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') || 'trending' // 'trending' or 'search'
    const query = searchParams.get('q') || 'popular'

    const apiKey = process.env.YOUTUBE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'YouTube API key not configured' }, { status: 500 })
    }

    const youtubeService = new YouTubePublicService(apiKey)
    
    let videos
    if (type === 'search') {
      videos = await youtubeService.searchVideos(query, 20)
    } else {
      videos = await youtubeService.getTrendingVideos(20)
    }

    return NextResponse.json({ videos, count: videos.length })
  } catch (error) {
    console.error('Error fetching public videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}