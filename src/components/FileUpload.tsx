'use client'

import { useState, useRef } from 'react'
import { validateFile, formatFileSize } from '@/lib/utils'

interface FileUploadProps {
  folderId: string
  onFileUploaded: () => void
}

export default function FileUpload({ folderId, onFileUploaded }: FileUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({})
  const [error, setError] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    setError('')
    setUploadProgress({})

    const uploadPromises = Array.from(files).map(async (file) => {
      // Validate file before upload
      const validation = validateFile(file)
      if (!validation.valid) {
        throw new Error(validation.error)
      }

      const formData = new FormData()
      formData.append('file', file)
      formData.append('folderId', folderId)

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || `Failed to upload ${file.name}`)
        }

        return await response.json()
      } catch (err) {
        throw new Error(`Failed to upload ${file.name}: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    })

    try {
      await Promise.all(uploadPromises)
      onFileUploaded()
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
      setUploadProgress({})
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const input = fileInputRef.current
      if (input) {
        input.files = files
        input.dispatchEvent(new Event('change', { bubbles: true }))
      }
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Files</h3>
      
      <div
        className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition-colors"
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="audio/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />
        
        <div className="space-y-2">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          
          <div className="text-gray-600">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="text-blue-600 hover:text-blue-500 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Click to upload
            </button>
            {' '}or drag and drop
          </div>
          
          <p className="text-xs text-gray-500">
            Audio and video files up to 100MB
          </p>
        </div>
      </div>

      {isUploading && (
        <div className="mt-4">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-sm text-gray-600">Uploading files...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 text-red-600 text-sm">{error}</div>
      )}
    </div>
  )
} 