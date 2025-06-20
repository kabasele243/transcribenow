import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { listS3Files, S3File } from '@/lib/s3'

export interface CombinedFile {
  id: string
  name: string
  size: number
  mime_type: string
  url: string
  created_at: string
  folder_id: string
  user_id: string
  source: 'database' | 's3'
  s3_key?: string
  last_modified?: string
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const folderId = searchParams.get('folderId')

    const supabase = createServerSupabaseClient()
    
    // Get files from database
    let dbQuery = supabase
      .from('files')
      .select('*')
      .order('created_at', { ascending: false })

    if (folderId) {
      dbQuery = dbQuery.eq('folder_id', folderId)
    }

    const { data: dbFiles, error: dbError } = await dbQuery

    if (dbError) {
      console.error('Error fetching database files:', dbError)
      return NextResponse.json({ error: 'Failed to fetch database files' }, { status: 500 })
    }

    // Get files from S3
    let s3Files: S3File[] = []
    try {
      s3Files = await listS3Files(userId, folderId || undefined)
    } catch (s3Error) {
      console.error('Error fetching S3 files:', s3Error)
      // Continue with database files only if S3 fails
    }

    // Combine and deduplicate files
    const combinedFiles: CombinedFile[] = []
    const processedKeys = new Set<string>()

    // Add database files first
    if (dbFiles) {
      for (const dbFile of dbFiles) {
        const key = `uploads/${userId}/${dbFile.folder_id}/${dbFile.name}`
        processedKeys.add(key)
        
        combinedFiles.push({
          ...dbFile,
          source: 'database' as const
        })
      }
    }

    // Add S3 files that aren't in database
    for (const s3File of s3Files) {
      if (!processedKeys.has(s3File.key)) {
        combinedFiles.push({
          id: s3File.etag.replace(/"/g, ''), // Use etag as ID for S3 files
          name: s3File.name,
          size: s3File.size,
          mime_type: 'application/octet-stream', // Default mime type for S3 files
          url: s3File.url,
          created_at: s3File.lastModified.toISOString(),
          folder_id: s3File.folderId,
          user_id: s3File.userId,
          source: 's3' as const,
          s3_key: s3File.key,
          last_modified: s3File.lastModified.toISOString()
        })
      }
    }

    // Sort by creation date (newest first)
    combinedFiles.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

    return NextResponse.json(combinedFiles)
  } catch (error) {
    console.error('Error fetching files:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const fileData = await request.json()
    const { folder_id, name, size, mime_type, url } = fileData

    if (!folder_id || !name || !size || !mime_type || !url) {
      return NextResponse.json({ error: 'Missing required file data' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const { data: newFile, error } = await supabase
      .from('files')
      .insert({
        folder_id,
        name,
        size,
        mime_type,
        url,
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating file:', error)
      return NextResponse.json({ error: 'Failed to create file' }, { status: 500 })
    }

    return NextResponse.json(newFile, { status: 201 })
  } catch (error) {
    console.error('Error creating file:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 