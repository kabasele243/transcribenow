import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size (max 100MB)
  const maxSize = 100 * 1024 * 1024 // 100MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size exceeds 100MB limit' }
  }

  // Check file type (audio files only)
  const allowedTypes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/m4a',
    'audio/aac',
    'audio/flac',
    'audio/webm'
  ]
  
  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Invalid file type. Only audio files are allowed' }
  }

  return { valid: true }
}

export function generateUniqueFileName(originalName: string): string {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split('.').pop()
  const nameWithoutExtension = originalName.substring(0, originalName.lastIndexOf('.'))
  
  return `${nameWithoutExtension}_${timestamp}_${randomString}.${extension}`
}
