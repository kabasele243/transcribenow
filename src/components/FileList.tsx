'use client'

import { File, Clock, FileText, MoreVertical } from 'lucide-react'
import { useEnhancedFile } from '@/lib/apiUtils'
import type { File as FileType } from '@/hooks/useApi'

interface FileListProps {
  files: FileType[]
  onFileClick?: (file: FileType) => void
  showActions?: boolean
}

interface FileItemProps {
  file: FileType
  onFileClick?: (file: FileType) => void
  showActions?: boolean
}

function FileItem({ file, onFileClick, showActions = true }: FileItemProps) {
  const enhancedFile = useEnhancedFile(file)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDuration = (seconds?: number) => {
    if (seconds === undefined) return '-'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}m ${remainingSeconds}s`
  }

  return (
    <div 
      className="px-6 py-4 hover:bg-gray-50 cursor-pointer"
      onClick={() => onFileClick?.(enhancedFile)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <File className="w-5 h-5 text-gray-400 mr-3" />
          <div>
            <div className="text-sm font-medium text-gray-900">{enhancedFile.name}</div>
            <div className="text-sm text-gray-500">
              {formatFileSize(enhancedFile.size)}
              {enhancedFile.duration && ` • ${formatDuration(enhancedFile.duration)}`}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {enhancedFile.duration && (
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              <span>{formatDuration(enhancedFile.duration)}</span>
            </div>
          )}
          {enhancedFile.transcription && (
            <div className="flex items-center text-sm text-green-600">
              <FileText className="w-4 h-4 mr-1" />
              <span>Transcribed</span>
            </div>
          )}
          {showActions && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onFileClick?.(enhancedFile)
                }}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View
              </button>
              <button 
                className="p-1 rounded hover:bg-gray-100"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="w-4 h-4 text-gray-500" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default function FileList({ files, onFileClick, showActions }: FileListProps) {
  if (files.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-12 text-center">
        <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No files yet</h3>
        <p className="text-gray-600">
          Upload your first audio file to get started with transcription.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Files</h2>
      </div>
      <div className="divide-y divide-gray-200">
        {files.map((file) => (
          <FileItem
            key={file.id}
            file={file}
            onFileClick={onFileClick}
            showActions={showActions}
          />
        ))}
      </div>
    </div>
  )
} 