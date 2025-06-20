'use client'

import { File as FileType } from '@/hooks/useApi'
import { useEnhancedFile } from '@/lib/apiUtils'
import { Download, FileText, Share2, Edit, Trash2, Settings, Play, Volume2, Mic, Settings2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"


interface TranscriptionViewProps {
  file: FileType
}

export default function TranscriptionView({ file }: TranscriptionViewProps) {
    // Use enhanced file to get transcription data
    const enhancedFile = useEnhancedFile(file)
    
    const formatDate = (dateString?: string | Date) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    };
    
    return (
        <div className="flex flex-1">
          <main className="flex-1 flex flex-col bg-white">
            <header className="flex items-center justify-between p-4 border-b border-gray-200">
                <div>
                    <h1 className="text-xl font-bold">{enhancedFile.name}</h1>
                    <p className="text-sm text-gray-500">{formatDate(enhancedFile.created_at)}</p>
                </div>
            </header>
            <div className="flex-1 overflow-y-auto p-8">
              <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">
                {enhancedFile.transcription?.content || 'No transcription available'}
              </p>
            </div>
          </main>
          <aside className="w-[300px] bg-gray-50 border-l border-gray-200 p-6 flex flex-col space-y-6">
            <h2 className="text-lg font-semibold text-gray-800">Export</h2>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                <FileText className="w-5 h-5 text-red-500" />
                <span className="text-sm font-medium">Download PDF</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                <FileText className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">Download DOCX</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                <FileText className="w-5 h-5 text-gray-500" />
                <span className="text-sm font-medium">Download TXT</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                <Mic className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Download SRT</span>
              </button>
            </div>
            
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="w-full justify-center gap-2">
                        <Download className="w-4 h-4" />
                        Advanced Export
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                    <DropdownMenuItem>Export with timestamps</DropdownMenuItem>
                    <DropdownMenuItem>More formats</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <div className="border-t border-gray-200 pt-6">
                <h3 className="text-base font-semibold text-gray-800 mb-4">More</h3>
                <div className="space-y-2">
                    <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                        <Settings className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-medium">Show Timestamps</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                        <Share2 className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-medium">Share Transcript</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                        <Edit className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-medium">Edit Transcript</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                        <Download className="w-5 h-5 text-gray-600" />
                        <span className="text-sm font-medium">Download Audio</span>
                    </button>
                    <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 transition-colors">
                        <Trash2 className="w-5 h-5 text-red-600" />
                        <span className="text-sm font-medium text-red-600">Delete File</span>
                    </button>
                </div>
            </div>
          </aside>
        </div>
    )
} 