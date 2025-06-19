'use client'

import { useState, useEffect } from 'react'
import { useSupabaseRedux } from '@/hooks/useSupabaseRedux'

export default function SupabaseReduxExample() {
  const [newFolderName, setNewFolderName] = useState('')

  const {
    // State
    folders,
    files,
    loading,
    error,
    lastUpdated,
    
    // Actions
    loadFolders,
    loadFiles,
    createNewFolder,
    deleteFolderById,
    createNewFile,
    deleteFileById,
    
    // Real-time
    setupRealtimeSubscriptions,
    
    // Utilities
    clearSupabaseError,
    getFilesByFolder,
    getFolderById,
  } = useSupabaseRedux()

  // Load data on mount
  useEffect(() => {
    loadFolders()
    loadFiles()
  }, [loadFolders, loadFiles])

  // Setup real-time subscriptions
  useEffect(() => {
    const cleanup = setupRealtimeSubscriptions()
    return cleanup
  }, [setupRealtimeSubscriptions])

  // Handle folder creation
  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newFolderName.trim()) return

    try {
      await createNewFolder(newFolderName)
      setNewFolderName('')
    } catch (error) {
      console.error('Error creating folder:', error)
    }
  }

  // Handle folder deletion
  const handleDeleteFolder = async (folderId: string) => {
    if (!confirm('Are you sure you want to delete this folder?')) return

    try {
      await deleteFolderById(folderId)
    } catch (error) {
      console.error('Error deleting folder:', error)
    }
  }

  // Handle file deletion
  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      await deleteFileById(fileId)
    } catch (error) {
      console.error('Error deleting file:', error)
    }
  }

  // Handle file creation (example)
  const handleCreateFile = async (folderId: string) => {
    const fileData = {
      folder_id: folderId,
      name: `Test File ${Date.now()}`,
      size: 1024,
      mime_type: 'text/plain',
      url: 'https://example.com/test.txt',
    }

    try {
      await createNewFile(fileData)
    } catch (error) {
      console.error('Error creating file:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-4">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2">Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Supabase + Redux Integration</h1>
      
      {/* Error Display */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex justify-between items-center">
            <p className="text-red-700">{error}</p>
            <button
              onClick={clearSupabaseError}
              className="text-red-500 hover:text-red-700"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Status Info */}
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-700">
          Last updated: {lastUpdated ? new Date(lastUpdated).toLocaleString() : 'Never'}
        </p>
        <p className="text-sm text-blue-700">
          Total folders: {folders.length} | Total files: {files.length}
        </p>
      </div>
      
      {/* Create Folder Form */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Create New Folder</h2>
        <form onSubmit={handleCreateFolder} className="flex gap-2">
          <input
            type="text"
            value={newFolderName}
            onChange={(e) => setNewFolderName(e.target.value)}
            placeholder="Enter folder name"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Create Folder
          </button>
        </form>
      </div>

      {/* Folders List */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">Your Folders (Redux State)</h2>
        {folders.length === 0 ? (
          <p className="text-gray-500">No folders created yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {folders.map((folder: any) => (
              <div
                key={folder.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{folder.name}</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => handleCreateFile(folder.id)}
                      className="text-blue-500 hover:text-blue-700 text-sm"
                      title="Add test file"
                    >
                      +
                    </button>
                    <button
                      onClick={() => handleDeleteFolder(folder.id)}
                      className="text-red-500 hover:text-red-700 text-sm"
                      title="Delete folder"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Created: {new Date(folder.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  Files: {getFilesByFolder(folder.id).length}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Files List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Files (Redux State)</h2>
        {files.length === 0 ? (
          <p className="text-gray-500">No files uploaded yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {files.map((file: any) => {
              const folder = getFolderById(file.folder_id)
              return (
                <div
                  key={file.id}
                  className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium truncate">{file.name}</h3>
                    <button
                      onClick={() => handleDeleteFile(file.id)}
                      className="text-red-500 hover:text-red-700 text-sm ml-2"
                      title="Delete file"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-sm text-gray-500">
                    Size: {(file.size / 1024).toFixed(1)} KB
                  </p>
                  <p className="text-sm text-gray-500">
                    Type: {file.mime_type}
                  </p>
                  <p className="text-sm text-gray-500">
                    Folder: {folder?.name || 'Unknown'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Created: {new Date(file.created_at).toLocaleDateString()}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Real-time Status */}
      <div className="mt-8 p-3 bg-green-50 border border-green-200 rounded-lg">
        <p className="text-sm text-green-700">
          ✅ Real-time subscriptions active - changes will appear instantly!
        </p>
      </div>
    </div>
  )
} 