import { NextRequest, NextResponse } from 'next/server'
import { getDuration } from 'get-media-duration'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const fileUrl = searchParams.get('fileUrl')

  if (!fileUrl) {
    return NextResponse.json({ error: 'fileUrl is required' }, { status: 400 })
  }

  try {
    const duration = await getDuration(fileUrl)
    return NextResponse.json({ duration })
  } catch (error) {
    console.error('Error getting media duration:', error)
    // Return a default duration or an error
    return NextResponse.json({ duration: 0 }, { status: 200 })
  }
} 