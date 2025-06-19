import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { RootState } from '../index'

// Types
export interface UploadFile {
  id: string
  name: string
  size: number
  type: string
  progress: number
  status: 'pending' | 'uploading' | 'completed' | 'error'
  error?: string
  uploadedAt?: string
  folderId: string
}

interface UploadsState {
  files: UploadFile[]
  uploading: boolean
  error: string | null
}

// Initial state
const initialState: UploadsState = {
  files: [],
  uploading: false,
  error: null,
}

// Selectors
export const selectUploads = (state: RootState) => state.uploads
export const selectUploading = (state: RootState) => state.uploads.uploading
export const selectUploadsError = (state: RootState) => state.uploads.error
export const selectUploadFiles = (state: RootState) => state.uploads.files
export const selectUploadFilesByFolder = (state: RootState, folderId: string) => 
  state.uploads.files.filter((f: UploadFile) => f.folderId === folderId)

// Async thunks
export const uploadFiles = createAsyncThunk(
  'uploads/uploadFiles',
  async ({ files, folderId }: { files: File[]; folderId: string }, { dispatch }) => {
    const uploadFiles: UploadFile[] = files.map(file => ({
      id: `${Date.now()}-${Math.random()}`,
      name: file.name,
      size: file.size,
      type: file.type,
      progress: 0,
      status: 'pending' as const,
      folderId
    }))

    // Add files to state
    dispatch(addFiles(uploadFiles))

    // Simulate upload process for each file
    const uploadPromises = uploadFiles.map(async (uploadFile) => {
      // Simulate progress updates
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 200))
        dispatch(updateFileProgress({ id: uploadFile.id, progress }))
      }
      
      // Mark as completed
      dispatch(updateFileStatus({ 
        id: uploadFile.id, 
        status: 'completed',
        uploadedAt: new Date().toISOString()
      }))
      
      return uploadFile
    })

    await Promise.all(uploadPromises)
    return uploadFiles
  }
)

export const deleteUploadedFile = createAsyncThunk(
  'uploads/deleteUploadedFile',
  async (fileId: string) => {
    // Simulate API call - replace with actual API
    await new Promise(resolve => setTimeout(resolve, 500))
    return fileId
  }
)

// Slice
const uploadsSlice = createSlice({
  name: 'uploads',
  initialState,
  reducers: {
    addFiles: (state, action: PayloadAction<UploadFile[]>) => {
      state.files.push(...action.payload)
      state.uploading = true
    },
    updateFileProgress: (state, action: PayloadAction<{ id: string; progress: number }>) => {
      const file = state.files.find(f => f.id === action.payload.id)
      if (file) {
        file.progress = action.payload.progress
        if (file.progress === 100) {
          file.status = 'completed'
        }
      }
    },
    updateFileStatus: (state, action: PayloadAction<{ 
      id: string; 
      status: UploadFile['status']; 
      uploadedAt?: string;
      error?: string;
    }>) => {
      const file = state.files.find(f => f.id === action.payload.id)
      if (file) {
        file.status = action.payload.status
        if (action.payload.uploadedAt) {
          file.uploadedAt = action.payload.uploadedAt
        }
        if (action.payload.error) {
          file.error = action.payload.error
        }
      }
      
      // Check if all files are done uploading
      const allCompleted = state.files.every(f => 
        f.status === 'completed' || f.status === 'error'
      )
      if (allCompleted) {
        state.uploading = false
      }
    },
    removeFile: (state, action: PayloadAction<string>) => {
      state.files = state.files.filter(f => f.id !== action.payload)
    },
    clearUploads: (state) => {
      state.files = []
      state.uploading = false
      state.error = null
    },
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(uploadFiles.pending, (state) => {
        state.uploading = true
        state.error = null
      })
      .addCase(uploadFiles.fulfilled, (state) => {
        state.uploading = false
      })
      .addCase(uploadFiles.rejected, (state, action) => {
        state.uploading = false
        state.error = action.error.message || 'Upload failed'
      })
      .addCase(deleteUploadedFile.fulfilled, (state, action) => {
        state.files = state.files.filter(f => f.id !== action.payload)
      })
  }
})

export const {
  addFiles,
  updateFileProgress,
  updateFileStatus,
  removeFile,
  clearUploads,
  clearError
} = uploadsSlice.actions

export default uploadsSlice.reducer 