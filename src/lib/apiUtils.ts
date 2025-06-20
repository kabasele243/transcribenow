import { useTranscription, useFileDuration } from '@/hooks/useApi'
import type { File } from '@/hooks/useApi'

/**
 * Custom hook that enhances a file with transcription and duration data
 * Uses React Query caching to avoid repeated API calls
 */
export function useEnhancedFile(file: File) {
  const { data: transcription } = useTranscription(file.id)
  const { data: duration } = useFileDuration(file.url)

  return {
    ...file,
    transcription: transcription ? {
      id: transcription.id,
      content: transcription.content,
      status: transcription.status,
    } : undefined,
    duration: duration || undefined,
  }
}

/**
 * Utility function to enhance files with transcription and duration data
 * This is used for server-side data that needs to be enhanced on the client
 */
export function enhanceFilesWithDetails(files: File[]): File[] {
  return files.map(file => ({
    ...file,
    // Note: This won't have transcription/duration data initially
    // The useEnhancedFile hook should be used in components for real-time data
  }))
} 