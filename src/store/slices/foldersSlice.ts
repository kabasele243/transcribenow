import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../index'

// Types
export interface File {
  id: string
  name: string
  size: number
  mime_type: string
  url: string
  created_at: string
  folder_id: string
  user_id: string
  source: 'database' | 's3'
  s3_key?: string
  last_modified?: string
}

export interface Folder {
  id: string
  name: string
  user_id: string
  created_at: string
  files: File[]
}

interface FoldersState {
  folders: Folder[]
  selectedFolderId: string | null
  loading: boolean
  error: string | null
}

// Initial state
const initialState: FoldersState = {
  folders: [],
  selectedFolderId: null,
  loading: false,
  error: null,
}

// Selectors
export const selectFolders = (state: RootState) => state.folders.folders
export const selectSelectedFolderId = (state: RootState) => state.folders.selectedFolderId
export const selectFoldersLoading = (state: RootState) => state.folders.loading
export const selectFoldersError = (state: RootState) => state.folders.error
export const selectSelectedFolder = (state: RootState) => 
  state.folders.folders.find(f => f.id === state.folders.selectedFolderId)

// Async thunks
export const fetchFolders = createAsyncThunk(
  'folders/fetchFolders',
  async () => {
    const response = await fetch('/api/folders')
    if (!response.ok) {
      throw new Error('Failed to fetch folders')
    }
    const data = await response.json()
    return data
  }
)

export const createFolder = createAsyncThunk(
  'folders/createFolder',
  async (name: string) => {
    const response = await fetch('/api/folders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create folder')
    }
    
    const newFolder = await response.json()
    return newFolder
  }
)

export const updateFolder = createAsyncThunk(
  'folders/updateFolder',
  async ({ id, name }: { id: string; name: string }) => {
    const response = await fetch(`/api/folders/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name }),
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to update folder')
    }
    
    const updatedFolder = await response.json()
    return updatedFolder
  }
)

export const deleteFolder = createAsyncThunk(
  'folders/deleteFolder',
  async (id: string) => {
    const response = await fetch(`/api/folders/${id}`, {
      method: 'DELETE',
    })
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to delete folder')
    }
    
    return id
  }
)

// Slice
const foldersSlice = createSlice({
  name: 'folders',
  initialState,
  reducers: {
    setSelectedFolder: (state, action: PayloadAction<string | null>) => {
      state.selectedFolderId = action.payload
    },
    incrementFileCount: (state, action: PayloadAction<string>) => {
      const folder = state.folders.find(f => f.id === action.payload)
      if (folder) {
        // Note: fileCount is now calculated from files array length
        // This action is kept for backward compatibility but may not be needed
      }
    },
    decrementFileCount: (state, action: PayloadAction<string>) => {
      const folder = state.folders.find(f => f.id === action.payload)
      if (folder) {
        // Note: fileCount is now calculated from files array length
        // This action is kept for backward compatibility but may not be needed
      }
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch folders
      .addCase(fetchFolders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFolders.fulfilled, (state, action) => {
        state.loading = false
        state.folders = action.payload
        if (action.payload.length > 0 && !state.selectedFolderId) {
          state.selectedFolderId = action.payload[0].id
        }
      })
      .addCase(fetchFolders.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch folders'
      })
      // Create folder
      .addCase(createFolder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(createFolder.fulfilled, (state, action) => {
        state.loading = false
        // Add the new folder with empty files array
        const newFolder = { ...action.payload, files: [] }
        state.folders.unshift(newFolder)
        state.selectedFolderId = newFolder.id
      })
      .addCase(createFolder.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to create folder'
      })
      // Update folder
      .addCase(updateFolder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(updateFolder.fulfilled, (state, action) => {
        state.loading = false
        const index = state.folders.findIndex(f => f.id === action.payload.id)
        if (index !== -1) {
          // Preserve the files array when updating
          const currentFiles = state.folders[index].files
          state.folders[index] = { ...action.payload, files: currentFiles }
        }
      })
      .addCase(updateFolder.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to update folder'
      })
      // Delete folder
      .addCase(deleteFolder.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(deleteFolder.fulfilled, (state, action) => {
        state.loading = false
        state.folders = state.folders.filter(f => f.id !== action.payload)
        if (state.selectedFolderId === action.payload) {
          state.selectedFolderId = state.folders.length > 0 ? state.folders[0].id : null
        }
      })
      .addCase(deleteFolder.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete folder'
      })
  }
})

export const {
  setSelectedFolder,
  incrementFileCount,
  decrementFileCount,
  clearError
} = foldersSlice.actions

export default foldersSlice.reducer 