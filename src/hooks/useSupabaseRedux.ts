import { useEffect, useCallback } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useSession } from '@clerk/nextjs'
import { createClientSupabaseClient } from '@/lib/supabase'
import { RootState, AppDispatch } from '@/store'
import {
  fetchFolders,
  fetchFiles,
  createFolder,
  deleteFolder,
  createFile,
  deleteFile,
  addFolder,
  updateFolder,
  removeFolder,
  addFile,
  updateFile,
  removeFile,
  clearError,
  clearData,
  type Folder,
  type File,
} from '@/store/slices/supabaseSlice'

export const useSupabaseRedux = () => {
  const dispatch = useDispatch<AppDispatch>()
  const { session } = useSession()
  
  // Selectors
  const { folders, files, loading, error, lastUpdated } = useSelector(
    (state: RootState) => state.supabase
  )

  // Fetch data
  const loadFolders = useCallback(() => {
    if (session) {
      dispatch(fetchFolders(session))
    }
  }, [dispatch, session])

  const loadFiles = useCallback((folderId?: string) => {
    if (session) {
      dispatch(fetchFiles({ session, folderId }))
    }
  }, [dispatch, session])

  // CRUD operations
  const createNewFolder = useCallback((name: string) => {
    if (session) {
      return dispatch(createFolder({ session, name }))
    }
  }, [dispatch, session])

  const deleteFolderById = useCallback((id: string) => {
    if (session) {
      return dispatch(deleteFolder({ session, id }))
    }
  }, [dispatch, session])

  const createNewFile = useCallback((fileData: Omit<File, 'id' | 'user_id' | 'created_at'>) => {
    if (session) {
      return dispatch(createFile({ session, fileData }))
    }
  }, [dispatch, session])

  const deleteFileById = useCallback((id: string) => {
    if (session) {
      return dispatch(deleteFile({ session, id }))
    }
  }, [dispatch, session])

  // Real-time subscriptions
  const setupRealtimeSubscriptions = useCallback(() => {
    if (!session) return

    const supabase = createClientSupabaseClient(session)

    // Subscribe to folders changes
    const foldersSubscription = supabase
      .channel('folders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'folders',
        },
        (payload) => {
          switch (payload.eventType) {
            case 'INSERT':
              dispatch(addFolder(payload.new as Folder))
              break
            case 'UPDATE':
              dispatch(updateFolder(payload.new as Folder))
              break
            case 'DELETE':
              dispatch(removeFolder(payload.old.id))
              break
          }
        }
      )
      .subscribe()

    // Subscribe to files changes
    const filesSubscription = supabase
      .channel('files-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'files',
        },
        (payload) => {
          switch (payload.eventType) {
            case 'INSERT':
              dispatch(addFile(payload.new as File))
              break
            case 'UPDATE':
              dispatch(updateFile(payload.new as File))
              break
            case 'DELETE':
              dispatch(removeFile(payload.old.id))
              break
          }
        }
      )
      .subscribe()

    // Return cleanup function
    return () => {
      supabase.removeChannel(foldersSubscription)
      supabase.removeChannel(filesSubscription)
    }
  }, [session, dispatch])

  // Utility functions
  const clearSupabaseError = useCallback(() => {
    dispatch(clearError())
  }, [dispatch])

  const clearSupabaseData = useCallback(() => {
    dispatch(clearData())
  }, [dispatch])

  const getFilesByFolder = useCallback((folderId: string) => {
    return files.filter((file: File) => file.folder_id === folderId)
  }, [files])

  const getFolderById = useCallback((folderId: string) => {
    return folders.find((folder: Folder) => folder.id === folderId)
  }, [folders])

  const getFileById = useCallback((fileId: string) => {
    return files.find((file: File) => file.id === fileId)
  }, [files])

  return {
    // State
    folders,
    files,
    loading,
    error,
    lastUpdated,
    
    // Actions
    loadFolders,
    loadFiles,
    createNewFolder,
    deleteFolderById,
    createNewFile,
    deleteFileById,
    
    // Real-time
    setupRealtimeSubscriptions,
    
    // Utilities
    clearSupabaseError,
    clearSupabaseData,
    getFilesByFolder,
    getFolderById,
    getFileById,
  }
} 