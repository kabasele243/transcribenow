import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { AssemblyAI } from 'assemblyai'

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { fileName, fileUrl, fileId } = await request.json()

    if (!fileName || !fileUrl) {
      return NextResponse.json({ error: 'File name and URL are required' }, { status: 400 })
    }

    // Validate AssemblyAI API key
    if (!process.env.ASSEMBLYAI_API_KEY) {
      console.error('AssemblyAI API key is not configured')
      return NextResponse.json({ error: 'Transcription service not configured' }, { status: 500 })
    }

    // Initialize AssemblyAI client
    const client = new AssemblyAI({
      apiKey: process.env.ASSEMBLYAI_API_KEY
    })

    // Save transcription to database
    const supabase = createServerSupabaseClient()
    
    // Use fileId if provided, otherwise find by name
    let targetFileId = fileId
    if (!targetFileId) {
      const { data: file, error: fileError } = await supabase
        .from('files')
        .select('*')
        .eq('name', fileName)
        .single()
      
      if (fileError || !file) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 })
      }
      targetFileId = file.id
    }

    // Create initial transcription record with pending status
    const { data: transcription, error: transcriptionError } = await supabase
      .from('transcriptions')
      .insert({
        file_id: targetFileId,
        content: '',
        status: 'processing',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    
    if (transcriptionError) {
      console.error('Error creating transcription record:', transcriptionError)
      return NextResponse.json({ error: 'Failed to create transcription record' }, { status: 500 })
    }

    try {
      console.log('Starting transcription for file:', fileName, 'URL:', fileUrl)
      
      // Transcribe the audio file using AssemblyAI
      const transcript = await client.transcripts.transcribe({
        audio: fileUrl,
        speech_model: 'slam-1' // Using the latest Slam-1 model for best accuracy
      })

      console.log('Transcription response status:', transcript.status)

      if (transcript.status === 'error') {
        // Update transcription record with error status
        await supabase
          .from('transcriptions')
          .update({ 
            status: 'error',
            updated_at: new Date().toISOString()
          })
          .eq('id', transcription.id)

        console.error('AssemblyAI transcription failed:', transcript.error)
        return NextResponse.json({ 
          error: `Transcription failed: ${transcript.error}` 
        }, { status: 500 })
      }

      // Update transcription record with completed status and content
      const { error: updateError } = await supabase
        .from('transcriptions')
        .update({
          content: transcript.text,
          status: 'completed',
          updated_at: new Date().toISOString()
        })
        .eq('id', transcription.id)

      if (updateError) {
        console.error('Error updating transcription:', updateError)
        return NextResponse.json({ error: 'Failed to save transcription' }, { status: 500 })
      }

      console.log('Transcription completed successfully for:', fileName)
      return NextResponse.json({
        success: true,
        transcription: transcript.text,
        transcriptionId: transcription.id
      })
      
    } catch (assemblyError: unknown) {
      // Update transcription record with error status
      await supabase
        .from('transcriptions')
        .update({ 
          status: 'error',
          updated_at: new Date().toISOString()
        })
        .eq('id', transcription.id)

      console.error('AssemblyAI transcription error:', assemblyError)
      
      // Provide more specific error messages
      let errorMessage = 'Transcription service error'
      if (assemblyError instanceof Error) {
        errorMessage = assemblyError.message
      } else if (typeof assemblyError === 'object' && assemblyError !== null) {
        const errorObj = assemblyError as { status?: number; message?: string }
        if (errorObj.status === 401) {
          errorMessage = 'Invalid AssemblyAI API key'
        } else if (errorObj.status === 403) {
          errorMessage = 'AssemblyAI API key has insufficient permissions'
        } else if (errorObj.status === 429) {
          errorMessage = 'AssemblyAI rate limit exceeded'
        } else if (errorObj.status === 400) {
          errorMessage = 'Invalid audio file or URL'
        } else if (errorObj.message) {
          errorMessage = errorObj.message
        }
      }
      
      return NextResponse.json({ 
        error: errorMessage 
      }, { status: 500 })
    }
    
  } catch (error) {
    console.error('Error transcribing file:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 