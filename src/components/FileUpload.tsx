import { useState, useRef } from 'react'

interface FileUploadProps {
  onFileSelect: (files: File[]) => void
  accept?: string
  multiple?: boolean
}

export default function FileUpload({ onFileSelect, accept = "audio/*,video/*", multiple = true }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFiles(files)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      handleFiles(files)
    }
  }

  const handleFiles = async (files: File[]) => {
    setUploading(true)
    try {
      // Filter files by accepted types
      const acceptedFiles = files.filter(file => {
        if (accept.includes('audio/*')) {
          return file.type.startsWith('audio/') || file.type.startsWith('video/')
        }
        return true
      })

      if (acceptedFiles.length === 0) {
        alert('Please select valid audio or video files')
        return
      }

      onFileSelect(acceptedFiles)
    } catch (error) {
      console.error('Error uploading files:', error)
      alert('Error uploading files. Please try again.')
    } finally {
      setUploading(false)
    }
  }

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="w-full">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
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
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
        />

        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {uploading ? 'Uploading...' : 'Upload Audio/Video Files'}
            </h3>
            <p className="text-gray-500 mt-1">
              Drag and drop your files here, or{' '}
              <button
                type="button"
                onClick={openFileDialog}
                className="text-blue-500 hover:text-blue-600 font-medium"
                disabled={uploading}
              >
                browse files
              </button>
            </p>
          </div>

          <div className="text-sm text-gray-500">
            <p>Supported formats: MP3, WAV, MP4, MOV, AVI</p>
            <p>Maximum file size: 100MB</p>
          </div>

          {uploading && (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
              <span className="text-blue-500">Processing files...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 