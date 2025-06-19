export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check file size (100MB limit)
  const maxSize = 100 * 1024 * 1024 // 100MB
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 100MB' }
  }

  // Check file type (allow audio and video files)
  const allowedTypes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/m4a',
    'video/mp4',
    'video/avi',
    'video/mov',
    'video/wmv',
    'video/flv',
    'video/webm'
  ]

  if (!allowedTypes.includes(file.type)) {
    return { 
      valid: false, 
      error: 'File type not supported. Please upload audio or video files.' 
    }
  }

  return { valid: true }
}

export const generateUniqueFileName = (originalName: string): string => {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = originalName.split('.').pop()
  return `${timestamp}-${randomString}.${extension}`
} 