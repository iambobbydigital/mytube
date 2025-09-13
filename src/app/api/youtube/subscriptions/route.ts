import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { YouTubeService } from '@/lib/youtube'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      console.log('No access token found in session')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Session found, creating YouTube service...')
    const youtubeService = new YouTubeService(session.accessToken)
    
    console.log('Fetching videos from subscriptions...')
    const videos = await youtubeService.getVideosFromSubscriptions()
    
    console.log(`Found ${videos.length} videos from subscriptions`)
    return NextResponse.json({ videos, count: videos.length })
  } catch (error) {
    console.error('Error fetching subscription videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    )
  }
}