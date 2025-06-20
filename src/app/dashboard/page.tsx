'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import UploadModal from '@/components/UploadModal'
import TranscriptionModal from '@/components/TranscriptionModal'
import { Folder } from '@/lib/database'

interface File {
  id: string
  name: string
  size: number
  mime_type: string
  url: string
  created_at: string
  transcription?: {
    id: string
    content: string
    status: string
  }
}

interface FolderWithFiles extends Folder {
  files: File[]
}

export default function DashboardPage() {
  const [folders, setFolders] = useState<FolderWithFiles[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showTranscriptionModal, setShowTranscriptionModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const fetchFolders = async () => {
    try {
      const response = await fetch('/api/folders')
      if (!response.ok) {
        throw new Error('Failed to fetch folders')
      }
      const data = await response.json()
      
      // Fetch transcriptions for each folder
      const foldersWithTranscriptions = await Promise.all(
        data.map(async (folder: FolderWithFiles) => {
          const transcriptionResponse = await fetch(`/api/transcriptions?folderId=${folder.id}`)
          if (transcriptionResponse.ok) {
            const { transcriptions } = await transcriptionResponse.json()
            
            // Map transcriptions to files
            const filesWithTranscriptions = folder.files.map(file => {
              const transcription = transcriptions?.find((t: { files?: { id: string } }) => t.files?.id === file.id)
              return {
                ...file,
                transcription: transcription ? {
                  id: transcription.id,
                  content: transcription.content,
                  status: transcription.status
                } : undefined
              }
            })
            
            return {
              ...folder,
              files: filesWithTranscriptions
            }
          }
          return folder
        })
      )
      
      setFolders(foldersWithTranscriptions)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch folders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFolders()
  }, [])

  const handleUploadClick = () => {
    setShowUploadModal(true)
  }

  const handleFilesUploaded = () => {
    setShowUploadModal(false)
    fetchFolders()
  }

  const handleFileClick = (file: File) => {
    setSelectedFile(file)
    setShowTranscriptionModal(true)
  }

  const handleCloseTranscriptionModal = () => {
    setShowTranscriptionModal(false)
    setSelectedFile(null)
  }

  // Get all transcribed files across all folders
  const allTranscribedFiles = folders.flatMap(folder => 
    folder.files.filter(file => file.transcription)
  )

  const totalFiles = folders.reduce((sum, folder) => sum + folder.files.length, 0)
  const mediaFiles = folders.reduce((sum, folder) => 
    sum + folder.files.filter(f => f.mime_type.startsWith('audio/') || f.mime_type.startsWith('video/')).length, 0
  )
  const transcribedFiles = allTranscribedFiles.length

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
            <h1 className="text-3xl font-bold text-gray-900">Transcribe AI</h1>
            <p className="text-gray-600 mt-2">View and manage your transcribed files.</p>
          </div>
          <button
            onClick={handleUploadClick}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <span>Upload Files</span>
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Files</p>
                <p className="text-2xl font-bold text-gray-900">{totalFiles}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Media Files</p>
                <p className="text-2xl font-bold text-gray-900">{mediaFiles}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Transcribed</p>
                <p className="text-2xl font-bold text-gray-900">{transcribedFiles}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Transcribed Files */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Transcribed Files</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {allTranscribedFiles.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p>No transcribed files yet</p>
                <p className="text-sm">Upload audio or video files and wait for transcription to complete</p>
                <button
                  onClick={handleUploadClick}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Upload Files
                </button>
              </div>
            ) : (
              allTranscribedFiles.map((file) => (
                <div 
                  key={file.id} 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => handleFileClick(file)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-lg font-medium text-gray-900">{file.name}</h4>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Transcribed
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {new Date(file.created_at).toLocaleDateString()} • {Math.round(file.size / 1024)} KB
                        </p>
                        {file.transcription && (
                          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <h5 className="text-sm font-medium text-gray-900 mb-2">Transcription Preview:</h5>
                            <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">
                              {file.transcription.content.length > 200 
                                ? `${file.transcription.content.substring(0, 200)}...` 
                                : file.transcription.content
                              }
                            </p>
                            <p className="text-xs text-blue-600 mt-2">Click to view full transcription</p>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <UploadModal
        isOpen={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        onFilesUploaded={handleFilesUploaded}
      />

      <TranscriptionModal
        isOpen={showTranscriptionModal}
        onClose={handleCloseTranscriptionModal}
        file={selectedFile}
      />
    </DashboardLayout>
  )
} 