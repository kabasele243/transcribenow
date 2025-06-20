import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase-server';
import JSZip from 'jszip';

export async function GET(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(request.url);
        const folderId = searchParams.get('folderId');

        if (!folderId) {
            return NextResponse.json({ error: 'Folder ID is required' }, { status: 400 });
        }

        const supabase = createServerSupabaseClient();

        // 1. Verify user owns the folder
        const { data: folder, error: folderError } = await supabase
            .from('folders')
            .select('id, name')
            .eq('id', folderId)
            .eq('user_id', userId)
            .single();

        if (folderError || !folder) {
            return NextResponse.json({ error: 'Folder not found or access denied' }, { status: 404 });
        }

        // 2. Get all files in the folder
        const { data: files, error: filesError } = await supabase
            .from('files')
            .select('id, name')
            .eq('folder_id', folderId);

        if (filesError) {
            console.error('Error fetching files:', filesError);
            return NextResponse.json({ error: 'Failed to fetch files' }, { status: 500 });
        }

        if (!files || files.length === 0) {
            return NextResponse.json({ error: 'No files in folder to export' }, { status: 404 });
        }

        // 3. Get all completed transcriptions for these files
        const fileIds = files.map(file => file.id);
        const { data: transcriptions, error: transcriptionsError } = await supabase
            .from('transcriptions')
            .select('file_id, content')
            .in('file_id', fileIds)
            .eq('status', 'completed');
        
        if (transcriptionsError) {
            console.error('Error fetching transcriptions:', transcriptionsError);
            return NextResponse.json({ error: 'Failed to fetch transcriptions' }, { status: 500 });
        }

        if (!transcriptions || transcriptions.length === 0) {
            return NextResponse.json({ error: 'No completed transcriptions to export' }, { status: 404 });
        }

        // 4. Create a zip file
        const zip = new JSZip();
        for (const transcription of transcriptions) {
            const file = files.find(f => f.id === transcription.file_id);
            if (file) {
                // remove extension from file name and add .txt
                const txtFileName = `${file.name.split('.').slice(0, -1).join('.')}.txt`;
                zip.file(txtFileName, transcription.content);
            }
        }

        const zipContent = await zip.generateAsync({ type: 'nodebuffer' });

        // 5. Send the zip file as response
        return new NextResponse(zipContent, {
            status: 200,
            headers: {
                'Content-Type': 'application/zip',
                'Content-Disposition': `attachment; filename="${folder.name}.zip"`,
            },
        });

    } catch (error) {
        console.error('Error exporting folder:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
} 