import { useState } from 'react'
import Link from 'next/link'

interface Folder {
  id: string
  name: string
  fileCount: number
  createdAt: string
}

interface FolderSidebarProps {
  folders: Folder[]
  currentFolderId?: string
  onCreateFolder: () => void
  onToggleCollapse?: (collapsed: boolean) => void
}

export default function FolderSidebar({ folders, currentFolderId, onCreateFolder, onToggleCollapse }: FolderSidebarProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleCollapse = () => {
    const newCollapsedState = !isCollapsed
    setIsCollapsed(newCollapsedState)
    onToggleCollapse?.(newCollapsedState)
  }

  if (isCollapsed) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4">
          <button
            onClick={handleCollapse}
            className="w-full flex items-center justify-center p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
            title="Expand sidebar"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">Folders</h3>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-gray-500 hover:text-gray-700 p-1 rounded"
              title="Toggle folders"
            >
              <svg
                className={`w-4 h-4 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <button
              onClick={handleCollapse}
              className="text-gray-500 hover:text-gray-700 p-1 rounded"
              title="Collapse sidebar"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {isExpanded && (
        <div className="p-4">
          <button
            onClick={onCreateFolder}
            className="w-full mb-4 flex items-center justify-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>New Folder</span>
          </button>

          <div className="space-y-2">
            {folders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
                <p>No folders yet</p>
                <p className="text-sm">Create your first folder to get started</p>
              </div>
            ) : (
              folders.map((folder) => (
                <Link
                  key={folder.id}
                  href={`/dashboard/folders/${folder.id}`}
                  className={`block p-3 rounded-lg border transition-colors ${
                    currentFolderId === folder.id
                      ? 'bg-blue-50 border-blue-200 text-blue-700'
                      : 'border-gray-200 hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                      </svg>
                      <div>
                        <p className="font-medium truncate">{folder.name}</p>
                        <p className="text-sm text-gray-500">{folder.fileCount} files</p>
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
} 