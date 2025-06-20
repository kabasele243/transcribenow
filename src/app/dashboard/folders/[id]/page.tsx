'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
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

export default function FolderDetailPage() {
  const params = useParams()
  const folderId = params.id as string
  
  const [folder, setFolder] = useState<FolderWithFiles | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showTranscriptionModal, setShowTranscriptionModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const fetchFolder = async () => {
    try {
      const response = await fetch(`/api/folders/${folderId}`)
      if (!response.ok) {
        throw new Error('Failed to fetch folder')
      }
      const data = await response.json()
      
      // Fetch transcriptions for this folder
      const transcriptionResponse = await fetch(`/api/transcriptions?folderId=${folderId}`)
      if (transcriptionResponse.ok) {
        const { transcriptions } = await transcriptionResponse.json()
        
        // Map transcriptions to files
        const filesWithTranscriptions = data.files.map((file: File) => {
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
        
        setFolder({
          ...data,
          files: filesWithTranscriptions
        })
      } else {
        setFolder(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch folder')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (folderId) {
      fetchFolder()
    }
  }, [folderId, fetchFolder])

  const handleUploadClick = () => {
    setShowUploadModal(true)
  }

  const handleFilesUploaded = () => {
    setShowUploadModal(false)
    fetchFolder()
  }

  const handleFileClick = (file: File) => {
    setSelectedFile(file)
    setShowTranscriptionModal(true)
  }

  const handleCloseTranscriptionModal = () => {
    setShowTranscriptionModal(false)
    setSelectedFile(null)
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

  if (error || !folder) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-red-600">{error || 'Folder not found'}</p>
        </div>
      </DashboardLayout>
    )
  }

  const totalFiles = folder.files.length
  const mediaFiles = folder.files.filter(f => f.mime_type.startsWith('audio/') || f.mime_type.startsWith('video/')).length
  const transcribedFiles = folder.files.filter(f => f.transcription).length

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{folder.name}</h1>
            <p className="text-gray-600 mt-2">Folder created on {new Date(folder.created_at).toLocaleDateString()}</p>
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

        {/* Files */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Files in this folder</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {folder.files.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                </svg>
                <p>No files in this folder</p>
                <p className="text-sm">Upload your first audio or video file to get started</p>
                <button
                  onClick={handleUploadClick}
                  className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Upload Files
                </button>
              </div>
            ) : (
              folder.files.map((file) => (
                <div 
                  key={file.id} 
                  className={`p-6 ${file.transcription ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''}`}
                  onClick={() => file.transcription && handleFileClick(file)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="p-2 bg-gray-100 rounded-lg">
                        {file.mime_type.startsWith('audio/') ? (
                          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                          </svg>
                        ) : file.mime_type.startsWith('video/') ? (
                          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-lg font-medium text-gray-900">{file.name}</h4>
                          {file.transcription && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Transcribed
                            </span>
                          )}
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
                    {file.transcription && (
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    )}
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