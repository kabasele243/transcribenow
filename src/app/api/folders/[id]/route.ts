import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name } = await request.json()

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Folder name is required' }, { status: 400 })
    }

    const { id } = await params
    const supabase = createServerSupabaseClient()
    const { data: folder, error } = await supabase
      .from('folders')
      .update({ name: name.trim() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating folder:', error)
      return NextResponse.json({ error: 'Failed to update folder' }, { status: 500 })
    }

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
    }

    return NextResponse.json(folder)
  } catch (error) {
    console.error('Error updating folder:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = createServerSupabaseClient()
    
    // First, delete all files in the folder
    const { error: filesError } = await supabase
      .from('files')
      .delete()
      .eq('folder_id', id)

    if (filesError) {
      console.error('Error deleting folder files:', filesError)
      return NextResponse.json({ error: 'Failed to delete folder files' }, { status: 500 })
    }

    // Then delete the folder
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting folder:', error)
      return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting folder:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const supabase = createServerSupabaseClient()
    
    // Fetch the folder
    const { data: folder, error: folderError } = await supabase
      .from('folders')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single()

    if (folderError) {
      console.error('Error fetching folder:', folderError)
      return NextResponse.json({ error: 'Failed to fetch folder' }, { status: 500 })
    }

    if (!folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
    }

    // Fetch files in the folder
    const { data: files, error: filesError } = await supabase
      .from('files')
      .select('*')
      .eq('folder_id', id)
      .order('created_at', { ascending: false })

    if (filesError) {
      console.error('Error fetching folder files:', filesError)
      return NextResponse.json({ error: 'Failed to fetch folder files' }, { status: 500 })
    }

    return NextResponse.json({
      ...folder,
      files: files || []
    })
  } catch (error) {
    console.error('Error fetching folder:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 