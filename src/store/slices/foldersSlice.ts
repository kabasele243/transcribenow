import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../index'

// Types
export interface Folder {
  id: string
  name: string
  fileCount: number
  createdAt: string
  updatedAt: string
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
    // Simulate API call - replace with actual API
    const response = await new Promise<Folder[]>((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            name: 'Meeting Recordings',
            fileCount: 5,
            createdAt: '2024-01-15T10:00:00Z',
            updatedAt: '2024-01-15T10:00:00Z'
          },
          {
            id: '2',
            name: 'Podcast Episodes',
            fileCount: 12,
            createdAt: '2024-01-10T14:30:00Z',
            updatedAt: '2024-01-10T14:30:00Z'
          },
          {
            id: '3',
            name: 'Interviews',
            fileCount: 3,
            createdAt: '2024-01-05T09:15:00Z',
            updatedAt: '2024-01-05T09:15:00Z'
          }
        ])
      }, 1000)
    })
    return response
  }
)

export const createFolder = createAsyncThunk(
  'folders/createFolder',
  async (name: string) => {
    // Simulate API call - replace with actual API
    const newFolder: Folder = {
      id: Date.now().toString(),
      name,
      fileCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return newFolder
  }
)

export const updateFolder = createAsyncThunk(
  'folders/updateFolder',
  async ({ id, name }: { id: string; name: string }) => {
    // Simulate API call - replace with actual API
    const updatedFolder: Folder = {
      id,
      name,
      fileCount: 0, // This would be fetched from API
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return updatedFolder
  }
)

export const deleteFolder = createAsyncThunk(
  'folders/deleteFolder',
  async (id: string) => {
    // Simulate API call - replace with actual API
    await new Promise(resolve => setTimeout(resolve, 500))
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
        folder.fileCount += 1
        folder.updatedAt = new Date().toISOString()
      }
    },
    decrementFileCount: (state, action: PayloadAction<string>) => {
      const folder = state.folders.find(f => f.id === action.payload)
      if (folder && folder.fileCount > 0) {
        folder.fileCount -= 1
        folder.updatedAt = new Date().toISOString()
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
        state.folders.unshift(action.payload)
        state.selectedFolderId = action.payload.id
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