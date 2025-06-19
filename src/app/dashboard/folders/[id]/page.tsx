'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import FolderSidebar from '@/components/FolderSidebar'
import FileList from '@/components/FileList'
import FileUpload from '@/components/FileUpload'

interface Folder {
  id: string
  name: string
  fileCount: number
  createdAt: string
}

interface FileItem {
  id: string
  name: string
  size: string
  type: string
  status: 'pending' | 'processing' | 'completed' | 'error'
  uploadedAt: string
  transcription?: string
}

export default function FolderDetailPage() {
  const params = useParams()
  const folderId = params.id as string
  
  const [folder, setFolder] = useState<Folder | null>(null)
  const [files, setFiles] = useState<FileItem[]>([])
  const [allFolders, setAllFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)
  const [showUpload, setShowUpload] = useState(false)

  // Mock data - replace with actual API calls
  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const mockFolders = [
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
      ]

      setAllFolders(mockFolders)
      
      const currentFolder = mockFolders.find(f => f.id === folderId)
      setFolder(currentFolder || null)

      if (currentFolder) {
        // Mock files for the current folder
        const mockFiles: FileItem[] = [
          {
            id: '1',
            name: 'team-meeting-2024-01-15.mp3',
            size: '15.2 MB',
            type: 'audio/mp3',
            status: 'completed',
            uploadedAt: '2024-01-15T10:00:00Z',
            transcription: 'This is a sample transcription...'
          },
          {
            id: '2',
            name: 'client-call-2024-01-14.mp3',
            size: '8.7 MB',
            type: 'audio/mp3',
            status: 'processing',
            uploadedAt: '2024-01-14T16:30:00Z'
          },
          {
            id: '3',
            name: 'weekly-update-2024-01-13.mp4',
            size: '45.1 MB',
            type: 'video/mp4',
            status: 'pending',
            uploadedAt: '2024-01-13T11:20:00Z'
          }
        ]
        setFiles(mockFiles)
      }

      setLoading(false)
    }, 1000)
  }, [folderId])

  const handleCreateFolder = () => {
    const folderName = prompt('Enter folder name:')
    if (folderName) {
      const newFolder: Folder = {
        id: Date.now().toString(),
        name: folderName,
        fileCount: 0,
        createdAt: new Date().toISOString()
      }
      setAllFolders(prev => [newFolder, ...prev])
    }
  }

  const handleFileSelect = (selectedFiles: File[]) => {
    const newFiles: FileItem[] = selectedFiles.map((file, index) => ({
      id: Date.now().toString() + index,
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
      type: file.type,
      status: 'pending' as const,
      uploadedAt: new Date().toISOString()
    }))

    setFiles(prev => [...newFiles, ...prev])
    setShowUpload(false)

    // Simulate processing
    setTimeout(() => {
      setFiles(prev => prev.map(f => 
        newFiles.some(nf => nf.id === f.id) 
          ? { ...f, status: 'processing' as const }
          : f
      ))
    }, 2000)

    // Simulate completion
    setTimeout(() => {
      setFiles(prev => prev.map(f => 
        newFiles.some(nf => nf.id === f.id) 
          ? { ...f, status: 'completed' as const, transcription: 'Sample transcription text...' }
          : f
      ))
    }, 5000)
  }

  const handleDeleteFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const handleDownloadTranscription = (fileId: string) => {
    const file = files.find(f => f.id === fileId)
    if (file?.transcription) {
      const blob = new Blob([file.transcription], { type: 'text/plain' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${file.name.replace(/\.[^/.]+$/, '')}-transcription.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
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

  if (!folder) {
    return (
      <DashboardLayout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Folder Not Found</h1>
          <p className="text-gray-600">The folder you&apos;re looking for doesn&apos;t exist.</p>
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
            <h1 className="text-3xl font-bold text-gray-900">{folder.name}</h1>
            <p className="text-gray-600 mt-2">
              {files.length} files • Created {new Date(folder.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            {showUpload ? 'Cancel' : 'Upload Files'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {showUpload && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Files</h3>
                <FileUpload onFileSelect={handleFileSelect} />
              </div>
            )}

            <FileList
              files={files}
              onDeleteFile={handleDeleteFile}
              onDownloadTranscription={handleDownloadTranscription}
            />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <FolderSidebar
              folders={allFolders}
              currentFolderId={folderId}
              onCreateFolder={handleCreateFolder}
            />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 