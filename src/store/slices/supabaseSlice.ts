import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import { createClientSupabaseClient } from '@/lib/supabase'

export interface Folder {
  id: string
  name: string
  user_id: string
  created_at: string
}

export interface File {
  id: string
  folder_id: string
  user_id: string
  name: string
  size: number
  mime_type: string
  url: string
  created_at: string
}

interface SupabaseState {
  folders: Folder[]
  files: File[]
  loading: boolean
  error: string | null
  lastUpdated: number | null
}

const initialState: SupabaseState = {
  folders: [],
  files: [],
  loading: false,
  error: null,
  lastUpdated: null,
}

// Async thunks for Supabase operations
export const fetchFolders = createAsyncThunk(
  'supabase/fetchFolders',
  async (session: any) => {
    const supabase = createClientSupabaseClient(session)
    const { data, error } = await supabase
      .from('folders')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw new Error(error.message)
    return data || []
  }
)

export const fetchFiles = createAsyncThunk(
  'supabase/fetchFiles',
  async ({ session, folderId }: { session: any; folderId?: string }) => {
    const supabase = createClientSupabaseClient(session)
    let query = supabase
      .from('files')
      .select('*')
      .order('created_at', { ascending: false })

    if (folderId) {
      query = query.eq('folder_id', folderId)
    }

    const { data, error } = await query

    if (error) throw new Error(error.message)
    return data || []
  }
)

export const createFolder = createAsyncThunk(
  'supabase/createFolder',
  async ({ session, name }: { session: any; name: string }) => {
    const supabase = createClientSupabaseClient(session)
    const { data, error } = await supabase
      .from('folders')
      .insert({ name })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }
)

export const deleteFolder = createAsyncThunk(
  'supabase/deleteFolder',
  async ({ session, id }: { session: any; id: string }) => {
    const supabase = createClientSupabaseClient(session)
    const { error } = await supabase
      .from('folders')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
    return id
  }
)

export const createFile = createAsyncThunk(
  'supabase/createFile',
  async ({ session, fileData }: { session: any; fileData: Omit<File, 'id' | 'user_id' | 'created_at'> }) => {
    const supabase = createClientSupabaseClient(session)
    const { data, error } = await supabase
      .from('files')
      .insert(fileData)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return data
  }
)

export const deleteFile = createAsyncThunk(
  'supabase/deleteFile',
  async ({ session, id }: { session: any; id: string }) => {
    const supabase = createClientSupabaseClient(session)
    const { error } = await supabase
      .from('files')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
    return id
  }
)

const supabaseSlice = createSlice({
  name: 'supabase',
  initialState,
  reducers: {
    // Real-time updates
    addFolder: (state, action: PayloadAction<Folder>) => {
      state.folders.unshift(action.payload)
      state.lastUpdated = Date.now()
    },
    updateFolder: (state, action: PayloadAction<Folder>) => {
      const index = state.folders.findIndex(f => f.id === action.payload.id)
      if (index !== -1) {
        state.folders[index] = action.payload
        state.lastUpdated = Date.now()
      }
    },
    removeFolder: (state, action: PayloadAction<string>) => {
      state.folders = state.folders.filter(f => f.id !== action.payload)
      // Also remove files in this folder
      state.files = state.files.filter(f => f.folder_id !== action.payload)
      state.lastUpdated = Date.now()
    },
    addFile: (state, action: PayloadAction<File>) => {
      state.files.unshift(action.payload)
      state.lastUpdated = Date.now()
    },
    updateFile: (state, action: PayloadAction<File>) => {
      const index = state.files.findIndex(f => f.id === action.payload.id)
      if (index !== -1) {
        state.files[index] = action.payload
        state.lastUpdated = Date.now()
      }
    },
    removeFile: (state, action: PayloadAction<string>) => {
      state.files = state.files.filter(f => f.id !== action.payload)
      state.lastUpdated = Date.now()
    },
    clearError: (state) => {
      state.error = null
    },
    clearData: (state) => {
      state.folders = []
      state.files = []
      state.lastUpdated = null
    },
  },
  extraReducers: (builder) => {
    // Fetch folders
    builder
      .addCase(fetchFolders.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFolders.fulfilled, (state, action) => {
        state.loading = false
        state.folders = action.payload
        state.lastUpdated = Date.now()
      })
      .addCase(fetchFolders.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch folders'
      })

    // Fetch files
    builder
      .addCase(fetchFiles.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(fetchFiles.fulfilled, (state, action) => {
        state.loading = false
        state.files = action.payload
        state.lastUpdated = Date.now()
      })
      .addCase(fetchFiles.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to fetch files'
      })

    // Create folder
    builder
      .addCase(createFolder.fulfilled, (state, action) => {
        state.folders.unshift(action.payload)
        state.lastUpdated = Date.now()
      })
      .addCase(createFolder.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to create folder'
      })

    // Delete folder
    builder
      .addCase(deleteFolder.fulfilled, (state, action) => {
        state.folders = state.folders.filter(f => f.id !== action.payload)
        // Also remove files in this folder
        state.files = state.files.filter(f => f.folder_id !== action.payload)
        state.lastUpdated = Date.now()
      })
      .addCase(deleteFolder.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete folder'
      })

    // Create file
    builder
      .addCase(createFile.fulfilled, (state, action) => {
        state.files.unshift(action.payload)
        state.lastUpdated = Date.now()
      })
      .addCase(createFile.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to create file'
      })

    // Delete file
    builder
      .addCase(deleteFile.fulfilled, (state, action) => {
        state.files = state.files.filter(f => f.id !== action.payload)
        state.lastUpdated = Date.now()
      })
      .addCase(deleteFile.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to delete file'
      })
  },
})

export const {
  addFolder,
  updateFolder,
  removeFolder,
  addFile,
  updateFile,
  removeFile,
  clearError,
  clearData,
} = supabaseSlice.actions

export default supabaseSlice.reducer 