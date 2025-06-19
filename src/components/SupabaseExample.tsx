'use client'

import { useState, useEffect } from 'react'
import { useSession, useUser } from '@clerk/nextjs'
import { createClientSupabaseClient } from '@/lib/supabase'

interface Folder {
  id: string
  name: string
  user_id: string
  created_at: string
}

interface File {
  id: string
  folder_id: string
  user_id: string
  name: string
  size: number
  mime_type: string
  url: string
  created_at: string
}

export default function SupabaseExample() {
  const [folders, setFolders] = useState<Folder[]>([])
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(true)
  const [newFolderName, setNewFolderName] = useState('')

  const { user } = useUser()
  const { session } = useSession()

  // Create client-side Supabase client
  const supabase = createClientSupabaseClient(session)

  useEffect(() => {
    if (!user) return

    async function loadData() {
      setLoading(true)
      try {
        // Load folders
        const { data: foldersData, error: foldersError } = await supabase
          .from('folders')
          .select('*')
          .order('created_at', { ascending: false })

        if (foldersError) {
          console.error('Error loading folders:', foldersError)
        } else {
          setFolders(foldersData || [])
        }

        // Load files
        const { data: filesData, error: filesError } = await supabase
          .from('files')
          .select('*')
          .order('created_at', { ascending: false })

        if (filesError) {
          console.error('Error loading files:', filesError)
        } else {
          setFiles(filesData || [])
        }
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, supabase])

  async function createFolder(e: React.FormEvent) {
    e.preventDefault()
    if (!newFolderName.trim()) return

    try {
      const { data, error } = await supabase
        .from('folders')
        .insert({ name: newFolderName })
        .select()
        .single()

      if (error) {
        console.error('Error creating folder:', error)
        alert('Failed to create folder')
      } else {
        setFolders([data, ...folders])
        setNewFolderName('')
      }
    } catch (error) {
      console.error('Error creating folder:', error)
      alert('Failed to create folder')
    }
  }

  async function deleteFolder(folderId: string) {
    if (!confirm('Are you sure you want to delete this folder?')) return

    try {
      const { error } = await supabase
        .from('folders')
        .delete()
        .eq('id', folderId)

      if (error) {
        console.error('Error deleting folder:', error)
        alert('Failed to delete folder')
      } else {
        setFolders(folders.filter(f => f.id !== folderId))
        setFiles(files.filter(f => f.folder_id !== folderId))
      }
    } catch (error) {
      console.error('Error deleting folder:', error)
      alert('Failed to delete folder')
    }
  }

  async function deleteFile(fileId: string) {
    if (!confirm('Are you sure you want to delete this file?')) return

    try {
      const { error } = await supabase
        .from('files')
        .delete()
        .eq('id', fileId)

      if (error) {
        console.error('Error deleting file:', error)
        alert('Failed to delete file')
      } else {
        setFiles(files.filter(f => f.id !== fileId))
      }
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('Failed to delete file')
    }
  }

  if (loading) {
    return <div className="p-4">Loading...</div>
  }

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Supabase Integration Example</h1>
      
      {/* Create Folder Form */}
      <div className="mb-8 p-4 bg-gray-50 rounded-lg">
        <h2 className="text-lg font-semibold mb-4">Create New Folder</h2>
        <form onSubmit={createFolder} className="flex gap-2">
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
        <h2 className="text-lg font-semibold mb-4">Your Folders</h2>
        {folders.length === 0 ? (
          <p className="text-gray-500">No folders created yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {folders.map((folder) => (
              <div
                key={folder.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium">{folder.name}</h3>
                  <button
                    onClick={() => deleteFolder(folder.id)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  Created: {new Date(folder.created_at).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-500">
                  Files: {files.filter(f => f.folder_id === folder.id).length}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Files List */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Your Files</h2>
        {files.length === 0 ? (
          <p className="text-gray-500">No files uploaded yet.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {files.map((file) => (
              <div
                key={file.id}
                className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-medium truncate">{file.name}</h3>
                  <button
                    onClick={() => deleteFile(file.id)}
                    className="text-red-500 hover:text-red-700 text-sm ml-2"
                  >
                    Delete
                  </button>
                </div>
                <p className="text-sm text-gray-500">
                  Size: {(file.size / 1024).toFixed(1)} KB
                </p>
                <p className="text-sm text-gray-500">
                  Type: {file.mime_type}
                </p>
                <p className="text-sm text-gray-500">
                  Created: {new Date(file.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
} 