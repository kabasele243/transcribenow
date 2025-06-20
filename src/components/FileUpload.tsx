'use client'

import { useState, useRef, useCallback } from 'react'

interface FileUploadProps {
  folderId: string
  onFileUploaded: () => void
}

interface UploadingFile {
  id: string
  file: File
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
}

interface UploadError {
  fileName: string
  error: string
}

export default function FileUpload({ folderId, onFileUploaded }: FileUploadProps) {
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const uploadingFilesRef = useRef<UploadingFile[]>([])

  // Keep ref in sync with state
  uploadingFilesRef.current = uploadingFiles

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

    // Upload all files in a single request
    const uploadFiles = async (filesToUpload: UploadingFile[]) => {
      // Update all files to uploading status
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
          // Update all uploaded files to completed
          setUploadingFiles(prev => 
            prev.map(f => 
              filesToUpload.some(uploadFile => uploadFile.id === f.id)
                ? { ...f, status: 'completed', progress: 100 }
                : f
            )
          )

          // Check if all files are completed using ref
          const allCompleted = uploadingFilesRef.current.every(f => f.status === 'completed')
          if (allCompleted) {
            onFileUploaded()
            // Clear completed files after a delay
            setTimeout(() => {
              setUploadingFiles([])
            }, 2000)
          }
        } else {
          // Handle individual file errors
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
        // Mark all files as failed
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
  }, [folderId, onFileUploaded])

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
      case 'error':
        return (
          <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        )
    }
  }

  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver 
            ? 'border-blue-400 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          accept="audio/*,video/*"
          multiple
          disabled={uploadingFiles.some(f => f.status === 'uploading')}
          className="hidden"
          id="file-upload"
        />
        <label
          htmlFor="file-upload"
          className="cursor-pointer block"
        >
          <div className="space-y-2">
            <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
              <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div className="text-sm text-gray-600">
              <span className="font-medium text-blue-600 hover:text-blue-500">
                Click to upload
              </span>
              {' '}or drag and drop
            </div>
            <p className="text-xs text-gray-500">Audio and video files up to 100MB each</p>
            <p className="text-xs text-gray-500">You can select multiple files</p>
          </div>
        </label>
      </div>

      {/* File List */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">Uploading Files</h4>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {uploadingFiles.map((uploadingFile) => (
              <div key={uploadingFile.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {getStatusIcon(uploadingFile.status)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {uploadingFile.file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(uploadingFile.file.size)}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {uploadingFile.status === 'uploading' && (
                        <div className="w-16 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${uploadingFile.progress}%` }}
                          />
                        </div>
                      )}
                      <button
                        onClick={() => removeFile(uploadingFile.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                  {uploadingFile.error && (
                    <p className="text-xs text-red-600 mt-1">{uploadingFile.error}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
    </div>
  )
} 