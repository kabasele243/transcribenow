import { createServerSupabaseClient } from './supabase-server'

export interface Folder {
  id: string
  name: string
  user_id: string
  created_at: string
}

export interface File {
  id: string
  folder_id: string
  user_id: string
  name: string
  size: number
  mime_type: string
  url: string
  created_at: string
}

// Folder operations
export async function getFolders(): Promise<Folder[]> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('folders')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching folders:', error)
    throw new Error('Failed to fetch folders')
  }

  return data || []
}

export async function createFolder(name: string): Promise<Folder> {
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

  return data
}

export async function deleteFolder(id: string): Promise<void> {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from('folders')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting folder:', error)
    throw new Error('Failed to delete folder')
  }
}

// File operations
export async function getFiles(folderId?: string): Promise<File[]> {
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

  return data || []
}

export async function createFile(fileData: {
  folder_id: string
  name: string
  size: number
  mime_type: string
  url: string
}): Promise<File> {
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

  return data
}

export async function deleteFile(id: string): Promise<void> {
  const supabase = createServerSupabaseClient()
  const { error } = await supabase
    .from('files')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting file:', error)
    throw new Error('Failed to delete file')
  }
}

export async function getFileById(id: string): Promise<File | null> {
  const supabase = createServerSupabaseClient()
  const { data, error } = await supabase
    .from('files')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // File not found
    }
    console.error('Error fetching file:', error)
    throw new Error('Failed to fetch file')
  }

  return data
} 