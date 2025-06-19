'use server'

import { createServerSupabaseClient } from './supabase-server'
import { revalidatePath } from 'next/cache'

export async function createFolderAction(name: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from('folders')
      .insert({ name })
      .select()
      .single()

    if (error) {
      console.error('Error creating folder:', error)
      throw new Error('Failed to create folder')
    }

    revalidatePath('/')
    return { success: true, data }
  } catch (error) {
    console.error('Error in createFolderAction:', error)
    return { success: false, error: 'Failed to create folder' }
  }
}

export async function deleteFolderAction(id: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting folder:', error)
      throw new Error('Failed to delete folder')
    }

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error in deleteFolderAction:', error)
    return { success: false, error: 'Failed to delete folder' }
  }
}

export async function createFileAction(fileData: {
  folder_id: string
  name: string
  size: number
  mime_type: string
  url: string
}) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from('files')
      .insert(fileData)
      .select()
      .single()

    if (error) {
      console.error('Error creating file:', error)
      throw new Error('Failed to create file')
    }

    revalidatePath('/')
    return { success: true, data }
  } catch (error) {
    console.error('Error in createFileAction:', error)
    return { success: false, error: 'Failed to create file' }
  }
}

export async function deleteFileAction(id: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    const { error } = await supabase
      .from('files')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting file:', error)
      throw new Error('Failed to delete file')
    }

    revalidatePath('/')
    return { success: true }
  } catch (error) {
    console.error('Error in deleteFileAction:', error)
    return { success: false, error: 'Failed to delete file' }
  }
}

export async function getFoldersAction() {
  try {
    const supabase = createServerSupabaseClient()
    
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching folders:', error)
      throw new Error('Failed to fetch folders')
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error in getFoldersAction:', error)
    return { success: false, error: 'Failed to fetch folders', data: [] }
  }
}

export async function getFilesAction(folderId?: string) {
  try {
    const supabase = createServerSupabaseClient()
    
    let query = supabase
      .from('files')
      .select('*')
      .order('created_at', { ascending: false })

    if (folderId) {
      query = query.eq('folder_id', folderId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching files:', error)
      throw new Error('Failed to fetch files')
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error('Error in getFilesAction:', error)
    return { success: false, error: 'Failed to fetch files', data: [] }
  }
} 