import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
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

    const supabase = createServerSupabaseClient()
    const { data: folder, error } = await supabase
      .from('folders')
      .update({ name: name.trim() })
      .eq('id', params.id)
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
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()
    
    // First, delete all files in the folder
    const { error: filesError } = await supabase
      .from('files')
      .delete()
      .eq('folder_id', params.id)

    if (filesError) {
      console.error('Error deleting folder files:', filesError)
      return NextResponse.json({ error: 'Failed to delete folder files' }, { status: 500 })
    }

    // Then delete the folder
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', params.id)

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