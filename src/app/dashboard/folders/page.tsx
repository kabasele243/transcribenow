'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import FolderSidebar from '@/components/FolderSidebar'
import CreateFolderForm from '@/components/CreateFolderForm'
import { Folder } from '@/lib/database'

interface FolderWithFiles extends Folder {
  files: Array<{
    id: string
    name: string
    size: number
    mime_type: string
    url: string
    created_at: string
    folder_id: string
    user_id: string
    source: 'database' | 's3'
    s3_key?: string
    last_modified?: string
  }>
}

export default function FoldersPage() {
  const [folders, setFolders] = useState<FolderWithFiles[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const fetchFolders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch('/api/folders')
      if (!response.ok) {
        throw new Error('Failed to fetch folders')
      }
      
      const data = await response.json()
      setFolders(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch folders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFolders()
  }, [])

  const handleCreateFolder = () => {
    setShowCreateForm(true)
  }

  const handleFolderCreated = () => {
    setShowCreateForm(false)
    fetchFolders() // Refresh the folders list
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('audio/')) {
      return (
        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
        </svg>
      )
    }
    if (mimeType.startsWith('video/')) {
      return (
        <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )
    }
    return (
      <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error loading folders</h3>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchFolders}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Folders</h1>
            <p className="text-gray-600 mt-2">Organize your transcription projects into folders.</p>
          </div>
          <button
            onClick={handleCreateFolder}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            New Folder
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main content */}
          <div className="lg:col-span-3">
            {showCreateForm && (
              <div className="mb-8">
                <CreateFolderForm onFolderCreated={handleFolderCreated} />
              </div>
            )}

            {folders.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No folders yet</h3>
                <p className="text-gray-500 mb-6">Create your first folder to start organizing your transcription projects.</p>
                <button
                  onClick={handleCreateFolder}
                  className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Create Folder
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {folders.map((folder) => (
                  <Link
                    key={folder.id}
                    href={`/dashboard/folders/${folder.id}`}
                    className="block bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-500">
                        {folder.files.length} file{folder.files.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{folder.name}</h3>
                    
                    <div className="space-y-1 text-sm text-gray-500">
                      <p>Created: {new Date(folder.created_at).toLocaleDateString()}</p>
                      <p>{folder.files.length} file{folder.files.length !== 1 ? 's' : ''}</p>
                    </div>

                    {/* Show recent files */}
                    {folder.files.length > 0 && (
                      <div className="mt-4 space-y-2">
                        <p className="text-sm font-medium text-gray-700">Recent files:</p>
                        {folder.files.slice(0, 3).map((file) => (
                          <div key={file.id} className="flex items-center space-x-2 text-sm text-gray-600">
                            {getFileIcon(file.mime_type)}
                            <span className="truncate">{file.name}</span>
                            <span className="text-xs text-gray-400">({formatFileSize(file.size)})</span>
                          </div>
                        ))}
                        {folder.files.length > 3 && (
                          <p className="text-xs text-gray-400">+{folder.files.length - 3} more</p>
                        )}
                      </div>
                    )}
                    
                    <div className="mt-4 flex items-center text-blue-600 text-sm font-medium">
                      <span>View folder</span>
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <FolderSidebar
              folders={folders}
              onCreateFolder={handleCreateFolder}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 