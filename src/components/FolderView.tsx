'use client'

import { useState, useEffect } from 'react'
import FileUpload from './FileUpload'
import { formatFileSize } from '@/lib/utils'

interface File {
  id: string
  name: string
  size: number
  mimeType: string
  url: string
  createdAt: string
}

interface Folder {
  id: string
  name: string
  files: File[]
}

interface FolderViewProps {
  folder: Folder
  onBack: () => void
}

export default function FolderView({ folder, onBack }: FolderViewProps) {
  const [currentFolder, setCurrentFolder] = useState<Folder>(folder)
  const [isLoading, setIsLoading] = useState(false)

  const refreshFolder = async () => {
    setIsLoading(true)
    try {
      const response = await fetch('/api/folders')
      if (response.ok) {
        const folders = await response.json()
        const updatedFolder = folders.find((f: Folder) => f.id === folder.id)
        if (updatedFolder) {
          setCurrentFolder(updatedFolder)
        }
      }
    } catch (error) {
      console.error('Error refreshing folder:', error)
    } finally {
      setIsLoading(false)
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
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Files</h3>
        </div>
        
        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading files...</p>
          </div>
        ) : currentFolder.files.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            <p>No files in this folder yet</p>
            <p className="text-sm">Upload some files to get started</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {currentFolder.files.map((file) => (
              <div key={file.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{file.name}</p>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)} • {file.mimeType}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-500">
                      {new Date(file.createdAt).toLocaleDateString()}
                    </span>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                    >
                      Download
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 