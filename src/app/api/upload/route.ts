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
    const file = formData.get('file') as File
    const folderId = formData.get('folderId') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!folderId) {
      return NextResponse.json({ error: 'Folder ID is required' }, { status: 400 })
    }

    // Validate file
    const validation = validateFile(file)
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    // Verify folder exists and belongs to user
    const supabase = createServerSupabaseClient()
    const { data: folder, error: folderError } = await supabase
      .from('folders')
      .select('*')
      .eq('id', folderId)
      .single()

    if (folderError || !folder) {
      return NextResponse.json({ error: 'Folder not found' }, { status: 404 })
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
      return NextResponse.json({ error: 'Failed to save file metadata' }, { status: 500 })
    }

    return NextResponse.json(savedFile, { status: 201 })
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 