'use client'

import { useEffect } from 'react'
import DashboardLayout from '@/components/DashboardLayout'
import FolderSidebar from '@/components/FolderSidebar'
import FileUpload from '@/components/FileUpload'
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { 
  fetchFolders, 
  createFolder, 
  setSelectedFolder,
  selectFolders,
  selectSelectedFolderId,
  selectFoldersLoading,
  selectFoldersError,
  type Folder as ReduxFolder
} from '@/store/slices/foldersSlice'
import { 
  selectUploading,
  selectUploadsError
} from '@/store/slices/uploadsSlice'
import { Folder } from '@/lib/database'

export default function UploadPage() {
  const dispatch = useAppDispatch()
  
  // Selectors
  const reduxFolders = useAppSelector(selectFolders)
  const selectedFolderId = useAppSelector(selectSelectedFolderId)
  const foldersLoading = useAppSelector(selectFoldersLoading)
  const foldersError = useAppSelector(selectFoldersError)
  const uploading = useAppSelector(selectUploading)
  const uploadsError = useAppSelector(selectUploadsError)

  // Convert Redux folders to database format
  const folders: Folder[] = reduxFolders.map((folder: ReduxFolder) => ({
    id: folder.id,
    name: folder.name,
    user_id: 'user1', // Mock user ID
    created_at: folder.createdAt
  }))

  // Fetch folders on component mount
  useEffect(() => {
    dispatch(fetchFolders())
  }, [dispatch])

  const handleCreateFolder = () => {
    const folderName = prompt('Enter folder name:')
    if (folderName) {
      dispatch(createFolder(folderName))
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Upload Files</h1>
          <p className="text-gray-600 mt-2">Upload your audio and video files for transcription.</p>
        </div>

        {/* Error Display */}
        {(foldersError || uploadsError) && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800">
                  {foldersError || uploadsError}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Folder Selection */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Destination Folder</h3>
              
              {foldersLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading folders...</p>
                </div>
              ) : folders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No folders available</p>
                  <button
                    onClick={handleCreateFolder}
                    className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Create Your First Folder
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {reduxFolders.map((folder: ReduxFolder) => (
                    <label
                      key={folder.id}
                      className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedFolderId === folder.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="folder"
                        value={folder.id}
                        checked={selectedFolderId === folder.id}
                        onChange={(e) => dispatch(setSelectedFolder(e.target.value))}
                        className="sr-only"
                      />
                      <div className="flex items-center space-x-3">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                        </svg>
                        <div>
                          <p className="font-medium text-gray-900">{folder.name}</p>
                          <p className="text-sm text-gray-500">{folder.fileCount} files</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* File Upload */}
            {selectedFolderId && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Files</h3>
                <FileUpload 
                  folderId={selectedFolderId}
                  onFileUploaded={() => {
                    // Refresh folders after upload
                    dispatch(fetchFolders())
                  }}
                />
                
                {uploading && (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      <span className="text-blue-700">Uploading files...</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Upload Tips */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-blue-900 mb-3">Upload Tips</h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start space-x-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Supported formats: MP3, WAV, MP4, MOV, AVI</span>
                </li>
                <li className="flex items-start space-x-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Maximum file size: 100MB per file</span>
                </li>
                <li className="flex items-start space-x-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Processing time depends on file length and quality</span>
                </li>
                <li className="flex items-start space-x-2">
                  <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>You can upload multiple files at once</span>
                </li>
              </ul>
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