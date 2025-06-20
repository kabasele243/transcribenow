import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { PutObjectCommand } from '@aws-sdk/client-s3'
import { s3Client, S3_BUCKET_NAME } from '@/lib/s3'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { validateFile, generateUniqueFileName } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const folderId = formData.get('folderId') as string

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    // Require folder selection
    if (!folderId) {
      return NextResponse.json({ error: 'Folder selection is required' }, { status: 400 })
    }

    const supabase = createServerSupabaseClient()

    // Verify folder exists and belongs to user
    const { data: folder, error: folderError } = await supabase
      .from('folders')
      .select('*')
      .eq('id', folderId)
      .eq('user_id', userId)
      .single()

    if (folderError || !folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
    }

    const results = []
    const errors = []

    // Process each file
    for (const file of files) {
      try {
        // Validate file
        const validation = validateFile(file)
        if (!validation.valid) {
          errors.push({
            fileName: file.name,
            error: validation.error
          })
          continue
        }

        // Generate unique file key for S3
        const uniqueFileName = generateUniqueFileName(file.name)
        const s3Key = `uploads/${userId}/${folderId}/${uniqueFileName}`

        // Convert file to buffer
        const buffer = Buffer.from(await file.arrayBuffer())

        // Upload to S3
        const uploadCommand = new PutObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: s3Key,
          Body: buffer,
          ContentType: file.type,
          ContentLength: file.size,
        })

        await s3Client.send(uploadCommand)

        // Generate S3 URL
        const s3Url = `https://${S3_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`

        // Save file metadata to database
        const { data: savedFile, error: fileError } = await supabase
          .from('files')
          .insert({
            folder_id: folderId,
            name: file.name,
            size: file.size,
            mime_type: file.type,
            url: s3Url,
          })
          .select()
          .single()

        if (fileError) {
          console.error('Error saving file metadata:', fileError)
          errors.push({
            fileName: file.name,
            error: 'Failed to save file metadata'
          })
          continue
        }

        results.push(savedFile)
      } catch (error) {
        console.error('Error uploading file:', error)
        errors.push({
          fileName: file.name,
          error: 'Upload failed'
        })
      }
    }

    // Return results
    return NextResponse.json({
      success: results.length > 0,
      uploadedFiles: results,
      folderId: folderId,
      errors: errors.length > 0 ? errors : undefined
    }, { status: 200 })
  } catch (error) {
    console.error('Error uploading files:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 