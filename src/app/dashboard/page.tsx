'use client'

import { useState, useEffect, useMemo } from 'react'
import { Folder, Upload, MoreVertical, Search, Mic, LayoutGrid, CheckCircle2, AudioLines as Waveform } from 'lucide-react'
import UploadModal from '@/components/UploadModal'
import TranscriptionView from '@/components/TranscriptionView'
import { useFolders, useUpdateFolder, useDeleteFolder, type FolderWithFiles, type File as FileType } from '@/hooks/useApi'
import { useEnhancedFile } from '@/lib/apiUtils'

// FileRow component that uses enhanced file data
function FileRow({ 
  file, 
  isSelected, 
  onSelect, 
  onClick 
}: { 
  file: FileType
  isSelected: boolean
  onSelect: (fileId: string) => void
  onClick: (file: FileType) => void
}) {
  const enhancedFile = useEnhancedFile(file)
  
  const formatDate = (dateString?: string | Date) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const formatDuration = (seconds?: number) => {
    if (seconds === undefined || seconds === null) return '-';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}m ${s}s`;
  };

  return (
    <tr className="hover:bg-gray-50" onClick={() => onClick(enhancedFile)}>
      <td className="p-4">
        <input 
          type="checkbox"
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            onSelect(enhancedFile.id);
          }}
        />
      </td>
      <td className="p-4 font-medium text-gray-800">{enhancedFile.name}</td>
      <td className="p-4 text-gray-600">{formatDate(enhancedFile.created_at)}</td>
      <td className="p-4 text-gray-600">{formatDuration(enhancedFile.duration)}</td>
      <td className="p-4 text-gray-600">
        <Waveform className="w-5 h-5 text-blue-500" />
      </td>
      <td className="p-4">
        {enhancedFile.transcription ? (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
             <CheckCircle2 className="w-4 h-4 mr-1.5" />
            Completed
          </span>
        ) : (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending
          </span>
        )}
      </td>
      <td className="p-4">
         <button className="p-1 rounded-md hover:bg-gray-200 transition-colors">
           <MoreVertical className="w-4 h-4 text-gray-500" />
         </button>
      </td>
    </tr>
  )
}

export default function DashboardPage() {
  const { data: foldersData, isLoading, error } = useFolders()
  const folders = foldersData?.folders || []
  
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<FileType | null>(null)
  const [selectedFileIds, setSelectedFileIds] = useState<Set<string>>(new Set())
  const [isFolderMenuOpen, setIsFolderMenuOpen] = useState(false)
  const [showUploadModal, setShowUploadModal] = useState(false)

  const updateFolderMutation = useUpdateFolder()
  const deleteFolderMutation = useDeleteFolder()

  useEffect(() => {
    if (!selectedFolderId && folders && folders.length > 0) {
      setSelectedFolderId(folders[0].id)
    }
  }, [folders, selectedFolderId])

  const handleRenameFolder = async (id: string, name: string) => {
    try {
      await updateFolderMutation.mutateAsync({ id, name })
    } catch (error) {
      console.error(error)
    }
  }

  const handleRenameFolderFromMenu = (folder: FolderWithFiles) => {
    const newName = window.prompt('Enter new folder name:', folder.name)
    if (newName && newName.trim() !== '' && newName.trim() !== folder.name) {
      handleRenameFolder(folder.id, newName.trim())
    }
    setIsFolderMenuOpen(false)
  }

  const handleDeleteFolder = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this folder and all its contents?')) {
      try {
        await deleteFolderMutation.mutateAsync(id)
        setSelectedFolderId(null)
      } catch (error) {
        console.error(error)
      }
    }
  }

  const handleExportFolder = async (id: string) => {
    try {
      const response = await fetch(`/api/export?folderId=${id}`)
      if (!response.ok) {
        throw new Error('Failed to export folder')
      }
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const folderName = folders.find(f => f.id === id)?.name || 'export'
      a.download = `${folderName}.zip`
      document.body.appendChild(a)
      a.click()
      a.remove()
    } catch (error) {
      console.error(error)
    }
  }

  const handleFileClick = (file: FileType) => {
    setSelectedFile(file)
  }

  const handleSelectFile = (fileId: string) => {
    setSelectedFileIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fileId)) {
        newSet.delete(fileId);
      } else {
        newSet.add(fileId);
      }
      return newSet;
    });
  };

  const handleSelectAllFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFolder = folders.find(f => f.id === selectedFolderId)
    const currentFiles = selectedFolder ? selectedFolder.files : []
    
    if (e.target.checked) {
      setSelectedFileIds(new Set(currentFiles.map(f => f.id)));
    } else {
      setSelectedFileIds(new Set());
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">Error: {error.message}</div>
      </div>
    )
  }

  const selectedFolder = folders.find(f => f.id === selectedFolderId)
  const currentFiles = selectedFolder ? selectedFolder.files : []
  const currentFolderName = selectedFolder ? selectedFolder.name : "Select a folder to view files"

  return (
    <div className="flex h-screen font-sans bg-white text-gray-800">
      <aside className="w-[280px] bg-gray-50 flex flex-col border-r border-gray-200">
        <div className="p-4 shrink-0">
          <button className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
            <span className="text-lg">∞</span>
            <span>Unlimited</span>
          </button>
        </div>
        
        <nav className="px-2 py-4 space-y-4 flex-1 overflow-y-auto">
          <div>
            <h2 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Shortcuts</h2>
            <ul className="mt-2">
              <li>
                <a
                  href="#"
                  onClick={(e) => { e.preventDefault(); setSelectedFolderId(null); setSelectedFile(null); }}
                  className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${!selectedFolderId ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}
                >
                  <LayoutGrid className="w-5 h-5 mr-3" />
                  Recent Files
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h2 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Folders</h2>
            <ul className="mt-2 space-y-1">
              {folders.map(folder => (
                <li key={folder.id}>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); setSelectedFolderId(folder.id); setSelectedFile(null); }}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors ${selectedFolderId === folder.id ? 'bg-gray-200 text-gray-900' : 'text-gray-600 hover:bg-gray-100'}`}
                  >
                    <Folder className="w-5 h-5 mr-3" />
                    <span className="flex-1 truncate">{folder.name}</span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>
      </aside>

      {selectedFile ? (
        <TranscriptionView file={selectedFile} />
      ) : (
        <div className="flex-1 flex flex-col">
          <main className="flex-1 overflow-y-auto p-8 bg-gray-50">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">{currentFolderName}</h1>
              <div className="flex items-center space-x-2">
                <button className="p-2 rounded-md hover:bg-gray-200 transition-colors"><Search className="w-5 h-5 text-gray-500" /></button>
                <button className="p-2 rounded-md hover:bg-gray-200 transition-colors"><Mic className="w-5 h-5 text-gray-500" /></button>
                {selectedFolderId ? (
                  <button
                    onClick={() => setShowUploadModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Transcribe Files
                  </button>
                ) : (
                  <div className="text-sm text-gray-500 px-4 py-2">
                    Select a folder to upload files
                  </div>
                )}
                <div className="relative">
                  <button
                    onClick={() => setIsFolderMenuOpen(!isFolderMenuOpen)}
                    className="p-2 rounded-md hover:bg-gray-200 transition-colors"
                    disabled={!selectedFolderId}
                  >
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </button>
                  {isFolderMenuOpen && selectedFolder && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                      <button
                        onClick={() => handleRenameFolderFromMenu(selectedFolder)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Rename
                      </button>
                      <button
                        onClick={() => handleExportFolder(selectedFolder.id)}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Export
                      </button>
                      <button
                        onClick={() => handleDeleteFolder(selectedFolder.id)}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
              {selectedFolderId ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="p-4 w-10 text-left">
                          <input 
                            type="checkbox" 
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            onChange={handleSelectAllFiles}
                            checked={currentFiles.length > 0 && selectedFileIds.size === currentFiles.length}
                          />
                        </th>
                        <th className="p-4 text-left font-semibold text-gray-600">Name</th>
                        <th className="p-4 text-left font-semibold text-gray-600">Uploaded</th>
                        <th className="p-4 text-left font-semibold text-gray-600">Duration</th>
                        <th className="p-4 text-left font-semibold text-gray-600">Mode</th>
                        <th className="p-4 text-left font-semibold text-gray-600">Status</th>
                        <th className="p-4 w-12"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {currentFiles.map(file => (
                        <FileRow
                          key={file.id}
                          file={file}
                          isSelected={selectedFileIds.has(file.id)}
                          onSelect={handleSelectFile}
                          onClick={handleFileClick}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                      <path d="M20 4H10a2 2 0 00-2 2v20a2 2 0 002 2h28a2 2 0 002-2V14a2 2 0 00-2-2h-8l-2-2z" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No folder selected</h3>
                  <p className="text-gray-600">
                    Select a folder from the sidebar to view and manage your files.
                  </p>
                </div>
              )}
            </div>
          </main>
        </div>
      )}

      {selectedFolderId && (
        <UploadModal
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onFilesUploaded={() => {
            setShowUploadModal(false)
          }}
          folderId={selectedFolderId}
        />
      )}
    </div>
  )
} 