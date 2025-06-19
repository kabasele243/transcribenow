'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import FolderSidebar from '@/components/FolderSidebar'

interface Folder {
  id: string
  name: string
  fileCount: number
  createdAt: string
}

interface RecentFile {
  id: string
  name: string
  folderName: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  uploadedAt: string
}

export default function DashboardPage() {
  const [folders, setFolders] = useState<Folder[]>([])
  const [recentFiles, setRecentFiles] = useState<RecentFile[]>([])
  const [loading, setLoading] = useState(true)

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setFolders([
        {
          id: '1',
          name: 'Meeting Recordings',
          fileCount: 5,
          createdAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          name: 'Podcast Episodes',
          fileCount: 12,
          createdAt: '2024-01-10T14:30:00Z'
        },
        {
          id: '3',
          name: 'Interviews',
          fileCount: 3,
          createdAt: '2024-01-05T09:15:00Z'
        }
      ])

      setRecentFiles([
        {
          id: '1',
          name: 'team-meeting-2024-01-15.mp3',
          folderName: 'Meeting Recordings',
          status: 'completed',
          uploadedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          name: 'podcast-episode-45.mp3',
          folderName: 'Podcast Episodes',
          status: 'processing',
          uploadedAt: '2024-01-14T16:30:00Z'
        },
        {
          id: '3',
          name: 'interview-john-doe.mp4',
          folderName: 'Interviews',
          status: 'pending',
          uploadedAt: '2024-01-14T11:20:00Z'
        }
      ])

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
        createdAt: new Date().toISOString()
      }
      setFolders(prev => [newFolder, ...prev])
    }
  }

  const getStatusColor = (status: RecentFile['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'error':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
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
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back! Here&apos;s an overview of your transcription projects.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Total Folders</p>
                    <p className="text-2xl font-bold text-gray-900">{folders.length}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {recentFiles.filter(f => f.status === 'completed').length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-2 bg-yellow-100 rounded-lg">
                    <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-600">In Progress</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {recentFiles.filter(f => f.status === 'processing' || f.status === 'pending').length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
              </div>
              <div className="divide-y divide-gray-200">
                {recentFiles.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    <p>No recent activity</p>
                  </div>
                ) : (
                  recentFiles.map((file) => (
                    <div key={file.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                          </svg>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.name}</p>
                            <p className="text-sm text-gray-500">{file.folderName}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(file.status)}`}>
                            {file.status}
                          </span>
                          <span className="text-sm text-gray-500">
                            {new Date(file.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
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