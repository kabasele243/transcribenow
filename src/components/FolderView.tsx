'use client'

import { useState } from 'react'
import FileUpload from './FileUpload'
import { Folder } from '@/lib/database'

interface File {
  id: string
  name: string
  size: number
  mimeType: string
  url: string
  createdAt: string
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
            files: currentFolder.files // Keep existing files for now
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
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(file.createdAt).toLocaleDateString()} • {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Download
                  </button>
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