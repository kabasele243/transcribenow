'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import DashboardLayout from '@/components/DashboardLayout'
import FolderSidebar from '@/components/FolderSidebar'

interface Folder {
  id: string
  name: string
  fileCount: number
  createdAt: string
  lastModified: string
}

export default function FoldersPage() {
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockFolders: Folder[] = [
        {
          id: '1',
          name: 'Meeting Recordings',
          fileCount: 5,
          createdAt: '2024-01-15T10:00:00Z',
          lastModified: '2024-01-15T16:30:00Z'
        },
        {
          id: '2',
          name: 'Podcast Episodes',
          fileCount: 12,
          createdAt: '2024-01-10T14:30:00Z',
          lastModified: '2024-01-14T11:20:00Z'
        },
        {
          id: '3',
          name: 'Interviews',
          fileCount: 3,
          createdAt: '2024-01-05T09:15:00Z',
          lastModified: '2024-01-13T15:45:00Z'
        },
        {
          id: '4',
          name: 'Conference Talks',
          fileCount: 8,
          createdAt: '2024-01-08T12:00:00Z',
          lastModified: '2024-01-12T09:30:00Z'
        },
        {
          id: '5',
          name: 'Training Sessions',
          fileCount: 6,
          createdAt: '2024-01-12T08:00:00Z',
          lastModified: '2024-01-14T14:15:00Z'
        },
        {
          id: '6',
          name: 'Client Calls',
          fileCount: 15,
          createdAt: '2024-01-03T10:30:00Z',
          lastModified: '2024-01-15T17:00:00Z'
        }
      ]

      setFolders(mockFolders)
      setLoading(false)
    }, 1000)
  }, [])

  const handleCreateFolder = () => {
    const folderName = prompt('Enter folder name:')
    if (folderName) {
      const newFolder: Folder = {
        id: Date.now().toString(),
        name: folderName,
        fileCount: 0,
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString()
      }
      setFolders(prev => [newFolder, ...prev])
    }
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
                        {folder.fileCount} {folder.fileCount === 1 ? 'file' : 'files'}
                      </span>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{folder.name}</h3>
                    
                    <div className="space-y-1 text-sm text-gray-500">
                      <p>Created: {new Date(folder.createdAt).toLocaleDateString()}</p>
                      <p>Modified: {new Date(folder.lastModified).toLocaleDateString()}</p>
                    </div>
                    
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