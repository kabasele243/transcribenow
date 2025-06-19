import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name } = await request.json()

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const { data: folder, error } = await supabase
      .from('folders')
      .insert({ name: name.trim() })
      .select()
      .single()

    if (error) {
      console.error('Error creating folder:', error)
      return NextResponse.json({ error: 'Failed to create folder' }, { status: 500 })
    }

    return NextResponse.json(folder, { status: 201 })
  } catch (error) {
    console.error('Error creating folder:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()
    
    // First, get all folders
    const { data: folders, error: foldersError } = await supabase
      .from('folders')
      .select('*')
      .order('created_at', { ascending: false })

    if (foldersError) {
      console.error('Error fetching folders:', foldersError)
      return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 })
    }

    // Then, get all files for these folders
    const { data: files, error: filesError } = await supabase
      .from('files')
      .select('*')
      .order('created_at', { ascending: false })

    if (filesError) {
      console.error('Error fetching files:', filesError)
      return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 })
    }

    // Combine folders with their files
    const foldersWithFiles = folders?.map(folder => ({
      ...folder,
      files: files?.filter(file => file.folder_id === folder.id) || []
    })) || []

    return NextResponse.json(foldersWithFiles)
  } catch (error) {
    console.error('Error fetching folders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 