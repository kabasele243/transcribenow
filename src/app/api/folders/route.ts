import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { listS3Files, S3File, deleteS3File } from '@/lib/s3'

interface CombinedFile {
  id: string
  name: string
  size: number
  mime_type: string
  url: string
  created_at: string
  folder_id: string | null
  user_id: string
  source: 'database' | 's3'
  s3_key?: string
  last_modified?: string
}

interface FolderWithFiles {
  id: string
  name: string
  user_id: string
  created_at: string
  files: CombinedFile[]
}

interface FoldersResponse {
  folders: FolderWithFiles[]
  unorganizedFiles: CombinedFile[]
}

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
      .insert({ name: name.trim(), user_id: userId })
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

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id, name } = await request.json()
    if (!id || !name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Folder ID and name are required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()
    const { data, error } = await supabase
      .from('folders')
      .update({ name: name.trim() })
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      console.error('Error renaming folder:', error)
      return NextResponse.json({ error: 'Failed to rename folder' }, { status: 500 })
    }

    return NextResponse.json(data, { status: 200 })
  } catch (error) {
    console.error('Error renaming folder:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await request.json();
        if (!id) {
            return NextResponse.json({ error: 'Folder ID is required' }, { status: 400 });
        }

        const supabase = createServerSupabaseClient();

        // 1. Get all files in the folder
        const { data: files, error: filesError } = await supabase
            .from('files')
            .select('id, name')
            .eq('folder_id', id)
            .eq('user_id', userId);

        if (filesError) {
            console.error('Error fetching files for folder:', filesError);
            return NextResponse.json({ error: 'Failed to fetch files for deletion' }, { status: 500 });
        }

        if (files && files.length > 0) {
            // 2. For each file, delete transcription and S3 object
            for (const file of files) {
                // Delete from S3
                const s3Key = `uploads/${userId}/${id}/${file.name}`;
                await deleteS3File(s3Key);

                // Delete transcription
                await supabase.from('transcriptions').delete().eq('file_id', file.id);
            }

            // 3. Delete all file records for the folder
            const { error: deleteFilesError } = await supabase
                .from('files')
                .delete()
                .eq('folder_id', id);

            if (deleteFilesError) {
                console.error('Error deleting file records:', deleteFilesError);
                return NextResponse.json({ error: 'Failed to delete file records' }, { status: 500 });
            }
        }

        // 4. Delete the folder itself
        const { error: deleteFolderError } = await supabase
            .from('folders')
            .delete()
            .eq('id', id)
            .eq('user_id', userId);

        if (deleteFolderError) {
            console.error('Error deleting folder:', deleteFolderError);
            return NextResponse.json({ error: 'Failed to delete folder' }, { status: 500 });
        }

        return NextResponse.json({ message: 'Folder deleted successfully' }, { status: 200 });
    } catch (error) {
        console.error('Error deleting folder:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

export async function GET() {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createServerSupabaseClient()
    
    // Get all folders
    const { data: folders, error: foldersError } = await supabase
      .from('folders')
      .select('*')
      .order('created_at', { ascending: false })

    if (foldersError) {
      console.error('Error fetching folders:', foldersError)
      return NextResponse.json({ error: 'Failed to fetch folders' }, { status: 500 })
    }

    // Get files from database
    const { data: dbFiles, error: filesError } = await supabase
      .from('files')
      .select('*')
      .order('created_at', { ascending: false })

    if (filesError) {
      console.error('Error fetching database files:', filesError)
      return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 })
    }

    // Get files from S3
    let s3Files: S3File[] = []
    try {
      s3Files = await listS3Files(userId)
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
        const key = dbFile.folder_id 
          ? `uploads/${userId}/${dbFile.folder_id}/${dbFile.name}`
          : `uploads/${userId}/unorganized/${dbFile.name}`
        processedKeys.add(key)
        
        combinedFiles.push({
          ...dbFile,
          source: 'database'
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
          source: 's3',
          s3_key: s3File.key,
          last_modified: s3File.lastModified.toISOString()
        })
      }
    }

    // Separate files by folder and unorganized files
    const foldersWithFiles = folders?.map(folder => ({
      ...folder,
      files: combinedFiles?.filter(file => file.folder_id === folder.id) || []
    })) || []

    const unorganizedFiles = combinedFiles?.filter(file => file.folder_id === null) || []

    const response: FoldersResponse = {
      folders: foldersWithFiles,
      unorganizedFiles
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error fetching folders:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 