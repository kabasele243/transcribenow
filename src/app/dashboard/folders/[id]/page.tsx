'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import FolderView from '@/components/FolderView'
import { Folder } from '@/lib/database'

interface File {
  id: string
  name: string
  size: number
  mime_type: string
  url: string
  created_at: string
  source?: 'database' | 's3'
}

interface FolderWithFiles extends Folder {
  files: File[]
}

export default function FolderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [folder, setFolder] = useState<FolderWithFiles | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchFolder = useCallback(async () => {
    try {
      const response = await fetch('/api/folders')
      if (!response.ok) {
        throw new Error('Failed to fetch folders Database')
      }
      const folders = await response.json()
      const foundFolder = folders.find((f: Folder) => f.id === params.id)
      
      if (!foundFolder) {
        setError('Folder not found')
        return
      }
      
      setFolder(foundFolder)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch folder')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    if (params.id) {
      fetchFolder()
    }
  }, [params.id, fetchFolder])

  const handleBack = () => {
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !folder) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={handleBack}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Folder Not Found</h1>
            </div>
          </div>
          
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <p className="text-red-600">{error || 'Folder not found'}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <FolderView folder={folder} onBack={handleBack} />
    </DashboardLayout>
  )
} 