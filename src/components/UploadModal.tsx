'use client'

import { useState, useRef, useCallback } from 'react'

interface UploadModalProps {
  isOpen: boolean
  onClose: () => void
  onFilesUploaded: () => void
  folderId: string
}

interface UploadingFile {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'transcribing' | 'transcribed'
  error?: string
  transcription?: string
  uploadedFileId?: string
  uploadedFileUrl?: string
}

interface UploadError {
  fileName: string
  error: string
}

export default function UploadModal({ isOpen, onClose, onFilesUploaded, folderId }: UploadModalProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState('')
  const [currentStep, setCurrentStep] = useState<'upload' | 'transcribe'>('upload')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = useCallback((files: FileList | File[]) => {
    const fileArray = Array.from(files)
    const newUploadingFiles: UploadingFile[] = fileArray.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      file,
      progress: 0,
      status: 'pending'
    }))

    setUploadingFiles(prev => [...prev, ...newUploadingFiles])
    setError('')

    // Upload all files
    const uploadFiles = async (filesToUpload: UploadingFile[]) => {
      setUploadingFiles(prev => 
        prev.map(f => 
          filesToUpload.some(uploadFile => uploadFile.id === f.id)
            ? { ...f, status: 'uploading' }
            : f
        )
      )

      try {
        const formData = new FormData()
        filesToUpload.forEach(uploadingFile => {
          formData.append('files', uploadingFile.file)
        })
        
        formData.append('folderId', folderId)

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Upload failed')
        }

        const result = await response.json()
        
        if (result.success) {
          // Update files with uploaded data
          setUploadingFiles(prev => 
            prev.map(f => {
              const uploadedFile = result.uploadedFiles?.find((uf: { name: string; id: string; url: string }) => uf.name === f.file.name)
              if (uploadedFile && filesToUpload.some(uploadFile => uploadFile.id === f.id)) {
                return { 
                  ...f, 
                  status: 'completed', 
                  progress: 100,
                  uploadedFileId: uploadedFile.id,
                  uploadedFileUrl: uploadedFile.url
                }
              }
              return f
            })
          )
          
          // Move to transcribe step if we have audio/video files
          const hasMediaFiles = filesToUpload.some(f => 
            f.file.type.startsWith('audio/') || f.file.type.startsWith('video/')
          )
          if (hasMediaFiles) {
            setCurrentStep('transcribe')
          } else {
            onFilesUploaded()
            onClose()
          }
        } else {
          if (result.errors) {
            result.errors.forEach((error: UploadError) => {
              const failedFile = filesToUpload.find(f => f.file.name === error.fileName)
              if (failedFile) {
                setUploadingFiles(prev => 
                  prev.map(f => 
                    f.id === failedFile.id
                      ? { 
                          ...f, 
                          status: 'error', 
                          error: error.error
                        }
                      : f
                  )
                )
              }
            })
          }
        }
      } catch (err) {
        setUploadingFiles(prev => 
          prev.map(f => 
            filesToUpload.some(uploadFile => uploadFile.id === f.id)
              ? { 
                  ...f, 
                  status: 'error', 
                  error: err instanceof Error ? err.message : 'Upload failed'
                }
              : f
          )
        )
        setError(err instanceof Error ? err.message : 'Upload failed')
      }
    }

    uploadFiles(newUploadingFiles)
  }, [onFilesUploaded, onClose, folderId])

  const handleTranscribe = async () => {
    const mediaFiles = uploadingFiles.filter(f => 
      f.status === 'completed' && 
      (f.file.type.startsWith('audio/') || f.file.type.startsWith('video/'))
    )

    if (mediaFiles.length === 0) {
      setError('No media files to transcribe')
      return
    }

    setError('')

    for (const file of mediaFiles) {
      setUploadingFiles(prev => 
        prev.map(f => 
          f.id === file.id ? { ...f, status: 'transcribing' } : f
        )
      )

      try {
        const response = await fetch('/api/transcribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            fileName: file.file.name,
            fileUrl: file.uploadedFileUrl,
            fileId: file.uploadedFileId,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Transcription failed')
        }

        const result = await response.json()
        
        setUploadingFiles(prev => 
          prev.map(f => 
            f.id === file.id 
              ? { 
                  ...f, 
                  status: 'transcribed', 
                  transcription: result.transcription 
                }
              : f
          )
        )
      } catch {
        setUploadingFiles(prev => 
          prev.map(f => 
            f.id === file.id 
              ? { 
                  ...f, 
                  status: 'error', 
                  error: 'Transcription failed'
                }
              : f
          )
        )
      }
    }

    // Close modal after transcription (give more time for real processing)
    setTimeout(() => {
      onFilesUploaded()
      onClose()
    }, 3000)
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault()
    setIsDragOver(false)
    
    const files = event.dataTransfer.files
    if (files && files.length > 0) {
      handleFiles(files)
    }
  }

  const removeFile = (fileId: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getStatusIcon = (status: UploadingFile['status']) => {
    switch (status) {
      case 'pending':
        return (
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'uploading':
        return (
          <svg className="w-4 h-4 text-blue-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        )
      case 'completed':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'transcribing':
        return (
          <svg className="w-4 h-4 text-yellow-500 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'transcribed':
        return (
          <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'error':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {currentStep === 'upload' ? 'Upload Files' : 'Transcribe Files'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {currentStep === 'upload' ? (
            <div>
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center ${
                  isDragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="text-lg font-medium text-gray-900 mb-2">Upload your files</p>
                <p className="text-gray-600 mb-4">Drag and drop files here, or click to browse</p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Choose Files
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  className="hidden"
                  onChange={handleFileSelect}
                  accept="audio/*,video/*,text/*"
                />
              </div>

              {error && (
                <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              {uploadingFiles.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Uploading Files</h3>
                  <div className="space-y-3">
                    {uploadingFiles.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {getStatusIcon(file.status)}
                          <div>
                            <p className="text-sm font-medium text-gray-900">{file.file.name}</p>
                            <p className="text-sm text-gray-500">{formatFileSize(file.file.size)}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {file.status === 'uploading' && (
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${file.progress}%` }}
                              />
                            </div>
                          )}
                          {file.status === 'error' && (
                            <button
                              onClick={() => removeFile(file.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Ready to Transcribe</h3>
                <p className="text-gray-600">Click the button below to transcribe your audio/video files to text using AssemblyAI&apos;s advanced speech recognition.</p>
              </div>

              <div className="space-y-3 mb-6">
                {uploadingFiles
                  .filter(f => f.file.type.startsWith('audio/') || f.file.type.startsWith('video/'))
                  .map((file) => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(file.status)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{file.file.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(file.file.size)}</p>
                        </div>
                      </div>
                      {file.status === 'transcribed' && (
                        <span className="text-sm text-green-600 font-medium">Transcribed</span>
                      )}
                    </div>
                  ))}
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleTranscribe}
                  disabled={uploadingFiles.filter(f => f.status === 'completed').length === 0}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  Transcribe Files
                </button>
                <button
                  onClick={() => {
                    onFilesUploaded()
                    onClose()
                  }}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Skip
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 