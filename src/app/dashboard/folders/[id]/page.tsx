'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { File, Upload, ArrowLeft, Clock, FileText, MoreVertical } from 'lucide-react'
import UploadModal from '@/components/UploadModal'
import TranscriptionModal from '@/components/TranscriptionModal'
import { useFolder, useFolders, type File as FileType } from '@/hooks/useApi'
import { useEnhancedFile } from '@/lib/apiUtils'

// FileItem component that uses enhanced file data
function FileItem({ 
  file, 
  onClick 
}: { 
  file: FileType
  onClick: (file: FileType) => void
}) {
  const enhancedFile = useEnhancedFile(file)

  return (
    <div className="px-6 py-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <File className="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">{enhancedFile.name}</h3>
            <p className="text-sm text-gray-500">
              {enhancedFile.size ? `${(enhancedFile.size / 1024 / 1024).toFixed(2)} MB` : 'Unknown size'}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          {enhancedFile.duration && (
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="w-4 h-4 mr-1" />
              <span>{enhancedFile.duration ? `${Math.floor(enhancedFile.duration / 60)}m ${Math.floor(enhancedFile.duration % 60)}s` : '-'}</span>
            </div>
          )}
          {enhancedFile.transcription && (
            <div className="flex items-center text-sm text-green-600">
              <FileText className="w-4 h-4 mr-1" />
              <span>Transcribed</span>
            </div>
          )}
          <button
            onClick={() => onClick(enhancedFile)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            View
          </button>
          <button className="p-1 rounded hover:bg-gray-100">
            <MoreVertical className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default function FolderDetailPage() {
  const params = useParams()
  const folderId = params.id as string
  
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showTranscriptionModal, setShowTranscriptionModal] = useState(false)
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null)

  // React Query hooks with caching
  const { data: folder, isLoading: folderLoading, error: folderError } = useFolder(folderId)
  const { data: allFoldersData } = useFolders()
  const allFolders = allFoldersData?.folders || []

  const handleUploadClick = () => {
    setShowUploadModal(true)
  }

  const handleFilesUploaded = () => {
    setShowUploadModal(false)
  }

  const handleFileClick = (file: FileType) => {
    setSelectedFile(file)
    setShowTranscriptionModal(true)
  }

  const handleCloseTranscriptionModal = () => {
    setShowTranscriptionModal(false)
    setSelectedFile(null)
  }

  if (folderLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (folderError || !folder) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">Error: {folderError?.message || 'Folder not found'}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{folder.name}</h1>
              <p className="text-gray-600 mt-1">
                {folder.files.length} file{folder.files.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            onClick={handleUploadClick}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Files
          </button>
        </div>

        {/* Sidebar and Main Content */}
        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Folders</h3>
              <div className="space-y-2">
                {allFolders.map((f) => (
                  <Link
                    key={f.id}
                    href={`/dashboard/folders/${f.id}`}
                    className={`block px-3 py-2 rounded-md text-sm ${
                      f.id === folderId
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {f.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {folder.files.length === 0 ? (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No files yet</h3>
                <p className="text-gray-600 mb-6">
                  Upload your first audio file to get started with transcription.
                </p>
                <button
                  onClick={handleUploadClick}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Files
                </button>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">Files</h2>
                </div>
                <div className="divide-y divide-gray-200">
                  {folder.files.map((file) => (
                    <FileItem
                      key={file.id}
                      file={file}
                      onClick={handleFileClick}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Upload Modal */}
        <UploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onFilesUploaded={handleFilesUploaded}
          folderId={folderId}
        />

        {/* Transcription Modal */}
        {selectedFile && (
          <TranscriptionModal
            isOpen={showTranscriptionModal}
            onClose={handleCloseTranscriptionModal}
            file={selectedFile}
          />
        )}
      </div>
    </div>
  )
} 