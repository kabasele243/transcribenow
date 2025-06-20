import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const fileId = searchParams.get('fileId')
    const folderId = searchParams.get('folderId')

    const supabase = createServerSupabaseClient()

    if (fileId) {
      // Get transcription for specific file
      const { data: transcription, error } = await supabase
        .from('transcriptions')
        .select('*')
        .eq('file_id', fileId)
        .single()

      if (error) {
        if (error.code === 'PGRST116') {
          // No transcription found, return empty array
          return NextResponse.json({ transcriptions: [] })
        }
        return NextResponse.json({ error: 'Transcription not found' }, { status: 404 })
      }

      // Return in consistent format as transcriptions array
      return NextResponse.json({ transcriptions: [transcription] })
    } else if (folderId) {
      // Get all transcriptions for a folder
      const { data: transcriptions, error } = await supabase
        .from('transcriptions')
        .select(`
          *,
          files (
            id,
            name,
            mime_type,
            folder_id
          )
        `)
        .eq('files.folder_id', folderId)

      if (error) {
        console.error('Error fetching transcriptions:', error)
        return NextResponse.json({ error: 'Failed to fetch transcriptions' }, { status: 500 })
      }

      return NextResponse.json({ transcriptions })
    } else {
      // Get all transcriptions for the user
      const { data: transcriptions, error } = await supabase
        .from('transcriptions')
        .select(`
          *,
          files (
            id,
            name,
            mime_type,
            folder_id,
            folders (
              id,
              name,
              user_id
            )
          )
        `)
        .eq('files.folders.user_id', userId)

      if (error) {
        console.error('Error fetching transcriptions:', error)
        return NextResponse.json({ error: 'Failed to fetch transcriptions' }, { status: 500 })
      }

      return NextResponse.json({ transcriptions })
    }
  } catch (error) {
    console.error('Error fetching transcriptions:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 