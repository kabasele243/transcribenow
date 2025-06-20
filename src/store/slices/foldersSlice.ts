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
  loading: boolean
  error: string | null
}

// Initial state
const initialState: FoldersState = {
  folders: [],
  loading: false,
  error: null,
}

// Selectors
export const selectFolders = (state: RootState) => state.folders.folders
export const selectFoldersLoading = (state: RootState) => state.folders.loading
export const selectFoldersError = (state: RootState) => state.folders.error

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
        state.folders = action.payload.folders || []
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
        state.folders.unshift(action.payload)
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
        const index = state.folders.findIndex(folder => folder.id === action.payload.id)
        if (index !== -1) {
          state.folders[index] = action.payload
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
        state.folders = state.folders.filter(folder => folder.id !== action.payload)
      })
      .addCase(deleteFolder.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to delete folder'
      })
  }
})

export const {
  incrementFileCount,
  decrementFileCount,
  clearError
} = foldersSlice.actions

export default foldersSlice.reducer 