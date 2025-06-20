'use client'

import { File as FileType } from '@/hooks/useApi'
import { useEnhancedFile } from '@/lib/apiUtils'
import { X, Download, FileText, Share2, Edit, Trash2, Settings, Play, Volume2, Mic, Settings2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface TranscriptionModalProps {
  isOpen: boolean
  onClose: () => void
  file: FileType
}

export default function TranscriptionModal({ isOpen, onClose, file }: TranscriptionModalProps) {
  // Use enhanced file to get transcription data
  const enhancedFile = useEnhancedFile(file)

  if (!isOpen) return null

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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h1 className="text-xl font-bold">{enhancedFile.name}</h1>
            <p className="text-sm text-gray-500">{formatDate(enhancedFile.created_at)}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto p-6">
              <p className="text-base text-gray-800 leading-relaxed whitespace-pre-wrap">
                {enhancedFile.transcription?.content || 'No transcription available'}
              </p>
            </div>
            <footer className="p-4 bg-gray-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Button variant="ghost" size="icon">
                    <Play className="h-6 w-6" />
                  </Button>
                  <div className="w-96 h-2 bg-gray-200 rounded-full">
                    <div className="w-1/3 h-full bg-blue-600 rounded-full"></div>
                  </div>
                  <span className="text-sm font-mono text-gray-600">34:03</span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon">
                    <Volume2 className="h-5 w-5" />
                  </Button>
                  <div className="w-24 h-1 bg-gray-300 rounded-full">
                    <div className="w-1/2 h-full bg-blue-600 rounded-full"></div>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Settings2 className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </footer>
          </main>

          {/* Sidebar */}
          <aside className="w-[300px] bg-gray-50 border-l border-gray-200 p-6 flex flex-col space-y-6 overflow-y-auto">
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
      </div>
    </div>
  )
} 