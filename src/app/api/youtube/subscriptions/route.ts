import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { YouTubeService } from '@/lib/youtube'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const youtubeService = new YouTubeService(session.accessToken)
    const videos = await youtubeService.getVideosFromSubscriptions()

    return NextResponse.json({ videos })
  } catch (error) {
    console.error('Error fetching subscription videos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch videos' }, 
      { status: 500 }
    )
  }
}