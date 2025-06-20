'use client'

import { useState } from 'react'
import FileUpload from './FileUpload'
import { Folder } from '@/lib/database'

interface File {
  id: string
  name: string
  size: number
  mime_type: string
  url: string
  created_at: string
  source?: 'database' | 's3'
  s3_key?: string
  last_modified?: string
}

interface FolderWithFiles extends Folder {
  files: File[]
}

interface FolderViewProps {
  folder: FolderWithFiles
  onBack: () => void
}

export default function FolderView({ folder, onBack }: FolderViewProps) {
  const [currentFolder, setCurrentFolder] = useState<FolderWithFiles>(folder)

  const refreshFolder = async () => {
    try {
      const response = await fetch('/api/folders')
      if (response.ok) {
        const folders = await response.json()
        const updatedFolder = folders.find((f: Folder) => f.id === folder.id)
        if (updatedFolder) {
          setCurrentFolder({
            ...updatedFolder,
            files: updatedFolder.files || []
          })
        }
      }
    } catch (error) {
      console.error('Error refreshing folder:', error)
    }
  }

  const handleFileUploaded = () => {
    refreshFolder()
  }

  const getFileIcon = (file: File) => {
    if (file.mime_type.startsWith('audio/')) {
      return (
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      )
    } else if (file.mime_type.startsWith('video/')) {
      return (
        <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    } else {
      return (
        <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    }
  }

  const getFileIconBg = (file: File) => {
    if (file.mime_type.startsWith('audio/')) {
      return 'bg-blue-100'
    } else if (file.mime_type.startsWith('video/')) {
      return 'bg-purple-100'
    } else {
      return 'bg-gray-100'
    }
  }

  const getSourceBadge = (file: File) => {
    if (file.source === 's3') {
      return (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
          S3
        </span>
      )
    }
    return (
      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
        DB
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{currentFolder.name}</h1>
            <p className="text-gray-600">{currentFolder.files.length} files</p>
          </div>
        </div>
      </div>

      {/* Upload Section */}
      <FileUpload folderId={currentFolder.id} onFileUploaded={handleFileUploaded} />

      {/* Files List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Files</h2>
        </div>
        
        {currentFolder.files.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2">No files uploaded yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {currentFolder.files.map((file) => (
              <div key={file.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 ${getFileIconBg(file)} rounded-lg`}>
                    {getFileIcon(file)}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      {getSourceBadge(file)}
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(file.created_at).toLocaleDateString()} • {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <a 
                    href={file.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Download
                  </a>
                  <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 