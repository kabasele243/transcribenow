import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

// Types
export interface FoldersResponse {
  folders: FolderWithFiles[]
  unorganizedFiles: File[]
}

export interface FolderWithFiles {
  id: string
  name: string
  created_at: string
  user_id: string
  files: File[]
}

export interface File {
  id: string
  name: string
  size: number
  mime_type: string
  url: string
  created_at: string
  folder_id: string | null
  user_id: string
  transcription?: {
    id: string
    content: string
    status: string
  }
  duration?: number
}

export interface Transcription {
  id: string
  content: string
  status: string
  file_id: string
}

// API functions
const api = {
  // Folders
  async fetchFolders(): Promise<FoldersResponse> {
    const response = await fetch('/api/folders')
    if (!response.ok) {
      throw new Error('Failed to fetch folders')
    }
    return response.json()
  },

  async fetchFolder(id: string): Promise<FolderWithFiles> {
    const response = await fetch(`/api/folders/${id}`)
    if (!response.ok) {
      throw new Error('Failed to fetch folder')
    }
    return response.json()
  },

  async createFolder(name: string): Promise<FolderWithFiles> {
    const response = await fetch('/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to create folder')
    }
    return response.json()
  },

  async updateFolder(id: string, name: string): Promise<FolderWithFiles> {
    const response = await fetch(`/api/folders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to update folder')
    }
    return response.json()
  },

  async deleteFolder(id: string): Promise<void> {
    const response = await fetch(`/api/folders/${id}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to delete folder')
    }
  },

  // Transcriptions
  async fetchTranscription(fileId: string): Promise<Transcription | null> {
    const response = await fetch(`/api/transcriptions?fileId=${fileId}`)
    if (!response.ok) {
      return null
    }
    const data = await response.json()
    return data.transcriptions?.[0] || null
  },

  // File duration
  async fetchFileDuration(fileUrl: string): Promise<number> {
    const response = await fetch(`/api/files/duration?fileUrl=${encodeURIComponent(fileUrl)}`)
    if (!response.ok) {
      return 0
    }
    const data = await response.json()
    return data.duration || 0
  },
}

// Query keys
export const queryKeys = {
  folders: ['folders'] as const,
  folder: (id: string) => ['folder', id] as const,
  transcription: (fileId: string) => ['transcription', fileId] as const,
  fileDuration: (fileUrl: string) => ['fileDuration', fileUrl] as const,
}

// Custom hooks
export function useFolders() {
  return useQuery({
    queryKey: queryKeys.folders,
    queryFn: api.fetchFolders,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useFolder(id: string) {
  return useQuery({
    queryKey: queryKeys.folder(id),
    queryFn: () => api.fetchFolder(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useTranscription(fileId: string) {
  return useQuery({
    queryKey: queryKeys.transcription(fileId),
    queryFn: () => api.fetchTranscription(fileId),
    enabled: !!fileId,
    staleTime: 5 * 60 * 1000, // 5 minutes (transcriptions don't change often)
    gcTime: 10 * 60 * 1000, // 10 minutes
  })
}

export function useFileDuration(fileUrl: string) {
  return useQuery({
    queryKey: queryKeys.fileDuration(fileUrl),
    queryFn: () => api.fetchFileDuration(fileUrl),
    enabled: !!fileUrl,
    staleTime: 30 * 60 * 1000, // 30 minutes (duration never changes)
    gcTime: 60 * 60 * 1000, // 1 hour
  })
}

// Mutation hooks
export function useCreateFolder() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.createFolder,
    onSuccess: () => {
      // Invalidate and refetch folders
      queryClient.invalidateQueries({ queryKey: queryKeys.folders })
    },
  })
}

export function useUpdateFolder() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => api.updateFolder(id, name),
    onSuccess: (data, { id }) => {
      // Update specific folder cache
      queryClient.setQueryData(queryKeys.folder(id), data)
      // Invalidate folders list
      queryClient.invalidateQueries({ queryKey: queryKeys.folders })
    },
  })
}

export function useDeleteFolder() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: api.deleteFolder,
    onSuccess: (_, id) => {
      // Remove folder from cache
      queryClient.removeQueries({ queryKey: queryKeys.folder(id) })
      // Invalidate folders list
      queryClient.invalidateQueries({ queryKey: queryKeys.folders })
    },
  })
} 