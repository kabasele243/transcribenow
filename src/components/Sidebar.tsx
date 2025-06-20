'use client'

import { Folder } from '@/lib/database'
import { useState, useRef, useEffect } from 'react'
import { Folder as FolderIcon, MoreHorizontal, Pencil, Trash2, Download, Plus, X, Check } from 'lucide-react'

interface File {
  id: string
  name: string
  size: number
  mime_type: string
  url: string
  created_at: string
  folder_id: string
  user_id: string
  source?: 'database' | 's3'
  s3_key?: string
  last_modified?: string
}

interface FolderWithFiles extends Folder {
  files: File[]
}

interface SidebarProps {
  folders: Folder[]
  selectedFolderId: string | null
  onFolderSelect: (folderId: string | null) => void
  onCreateFolder: () => void
  onRenameFolder: (folder: Folder) => void
  onDeleteFolder: (folderId: string) => void
}

export default function Sidebar({ 
  folders, 
  selectedFolderId,
  onFolderSelect,
  onCreateFolder,
  onRenameFolder,
  onDeleteFolder
}: SidebarProps) {
  const [activeItem, setActiveItem] = useState<string | null>('recent')
  const [menuFolderId, setMenuFolderId] = useState<string | null>(null)
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null)
  const [renamingFolderName, setRenamingFolderName] = useState('')
  const [showNewFolderInput, setShowNewFolderInput] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const menuRef = useRef<HTMLDivElement>(null);
  const renameInputRef = useRef<HTMLInputElement>(null);


  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuFolderId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  useEffect(() => {
    if (renamingFolderId && renameInputRef.current) {
      renameInputRef.current.focus();
    }
  }, [renamingFolderId]);

  const handleItemClick = (itemId: string | null) => {
    setActiveItem(itemId)
    onFolderSelect(itemId === 'recent' ? null : itemId)
  }

  const handleToggleMenu = (folderId: string) => {
    setMenuFolderId(menuFolderId === folderId ? null : folderId)
  }

  const handleRenameClick = (folder: Folder) => {
    setRenamingFolderId(folder.id)
    setRenamingFolderName(folder.name)
    setMenuFolderId(null)
  }

  const handleRenameSubmit = async () => {
    if (renamingFolderId && renamingFolderName.trim()) {
      const folder = folders.find(f => f.id === renamingFolderId)
      if (folder) {
        await onRenameFolder(folder)
      }
      setRenamingFolderId(null)
      setRenamingFolderName('')
    }
  }

  const handleRenameCancel = () => {
    setRenamingFolderId(null)
    setRenamingFolderName('')
  }
  
  const handleAddFolder = async () => {
    if (newFolderName.trim()) {
      // This should trigger a modal or form to create the folder
      // For now, we'll just close the input
      setNewFolderName('')
      setShowNewFolderInput(false)
    }
  }

  return (
    <div className="w-64 bg-white border-r border-gray-200 p-4">
      <div className="mb-8">
        <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg text-sm font-semibold hover:bg-blue-700">
          Unlimited
        </button>
      </div>

      <div>
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Shortcuts</h3>
        <ul>
          <li>
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                handleItemClick('recent')
              }}
              className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                activeItem === 'recent'
                  ? 'bg-gray-100 text-gray-900'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M1 3h18v2H1V3zm0 4h18v2H1V7zm0 4h18v2H1v-2zm0 4h18v2H1v-2z" />
              </svg>
              Recent Files
            </a>
          </li>
        </ul>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Folders</h3>
          <button onClick={() => setShowNewFolderInput(true)} className="text-gray-400 hover:text-gray-600">
            <Plus size={16} />
          </button>
        </div>
        <ul>
          {showNewFolderInput && (
            <li className="flex items-center px-3 py-2">
              <FolderIcon className="w-5 h-5 mr-3 text-gray-400" />
              <input
                type="text"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddFolder()}
                onBlur={handleAddFolder}
                placeholder="New folder name"
                className="flex-grow bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 text-sm"
              />
               <button onClick={handleAddFolder} className="ml-2 text-gray-400 hover:text-gray-600">
                <Check size={16} />
              </button>
              <button onClick={() => setShowNewFolderInput(false)} className="ml-2 text-gray-400 hover:text-gray-600">
                <X size={16} />
              </button>
            </li>
          )}
          {folders.map((folder) => (
            <li key={folder.id} className="relative group">
               {renamingFolderId === folder.id ? (
                 <div className="flex items-center px-3 py-2">
                    <FolderIcon className="w-5 h-5 mr-3 text-gray-400" />
                    <input
                      ref={renameInputRef}
                      type="text"
                      value={renamingFolderName}
                      onChange={(e) => setRenamingFolderName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameSubmit();
                        if (e.key === 'Escape') handleRenameCancel();
                      }}
                      onBlur={handleRenameCancel}
                      className="flex-grow bg-transparent border-b border-gray-300 focus:outline-none focus:border-blue-500 text-sm"
                    />
                     <button onClick={handleRenameSubmit} className="ml-2 text-gray-400 hover:text-gray-600">
                      <Check size={16}/>
                    </button>
                    <button onClick={handleRenameCancel} className="ml-2 text-gray-400 hover:text-gray-600">
                      <X size={16}/>
                    </button>
                 </div>
               ) : (
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    handleItemClick(folder.id)
                  }}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg ${
                    activeItem === folder.id
                      ? 'bg-gray-100 text-gray-900'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <FolderIcon className="w-5 h-5 mr-3" />
                  <span className="flex-grow truncate">{folder.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleToggleMenu(folder.id);
                    }}
                    className="ml-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100"
                  >
                    <MoreHorizontal size={16} />
                  </button>
                </a>
               )}

              {menuFolderId === folder.id && (
                 <div ref={menuRef} className="absolute z-10 right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200">
                    <ul className="py-1">
                      <li>
                        <button onClick={() => handleRenameClick(folder)} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                          <Pencil size={14} className="mr-2" /> Rename
                        </button>
                      </li>
                      <li>
                        <button onClick={() => onDeleteFolder(folder.id)} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100">
                           <Trash2 size={14} className="mr-2" /> Delete
                        </button>
                      </li>
                    </ul>
                 </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
} 