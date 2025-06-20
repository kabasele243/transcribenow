'use client'

import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { 
  selectFolders, 
  selectSelectedFolderId,
  createFolder,
  deleteFolder,
  setSelectedFolder,
  type Folder
} from '@/store/slices/foldersSlice'
import { selectUploadFiles, type UploadFile } from '@/store/slices/uploadsSlice'

export default function ReduxExample() {
  const dispatch = useAppDispatch()
  
  // Select state from Redux store
  const folders = useAppSelector(selectFolders)
  const selectedFolderId = useAppSelector(selectSelectedFolderId)
  const uploadFiles = useAppSelector(selectUploadFiles)

  const handleCreateFolder = () => {
    const name = prompt('Enter folder name:')
    if (name) {
      dispatch(createFolder(name))
    }
  }

  const handleDeleteFolder = (id: string) => {
    if (confirm('Are you sure you want to delete this folder?')) {
      dispatch(deleteFolder(id))
    }
  }

  const handleSelectFolder = (id: string) => {
    dispatch(setSelectedFolder(id))
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Redux State Example</h3>
      
      <div className="space-y-4">
        {/* Folder Management */}
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Folders ({folders.length})</h4>
          <button
            onClick={handleCreateFolder}
            className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600 transition-colors"
          >
            Create Folder
          </button>
          
          <div className="mt-2 space-y-1">
            {folders.map((folder: Folder) => (
              <div key={folder.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    checked={selectedFolderId === folder.id}
                    onChange={() => handleSelectFolder(folder.id)}
                  />
                  <span className={selectedFolderId === folder.id ? 'font-medium' : ''}>
                    {folder.name}
                  </span>
                  <span className="text-sm text-gray-500">({folder.files.length} files)</span>
                </div>
                <button
                  onClick={() => handleDeleteFolder(folder.id)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Delete
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Files */}
        <div>
          <h4 className="font-medium text-gray-700 mb-2">Upload Files ({uploadFiles.length})</h4>
          <div className="space-y-1">
            {uploadFiles.map((file: UploadFile) => (
              <div key={file.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <span className="text-sm">{file.name}</span>
                <span className={`text-xs px-2 py-1 rounded ${
                  file.status === 'completed' ? 'bg-green-100 text-green-800' :
                  file.status === 'error' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {file.status}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* State Info */}
        <div className="text-xs text-gray-500">
          <p>Selected Folder: {selectedFolderId || 'None'}</p>
          <p>Total Folders: {folders.length}</p>
          <p>Total Upload Files: {uploadFiles.length}</p>
        </div>
      </div>
    </div>
  )
} 