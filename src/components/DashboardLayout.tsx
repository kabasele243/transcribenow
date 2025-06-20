import { ReactNode, useState } from 'react'
import Link from 'next/link'

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar */}
        <div className={`bg-white shadow-sm min-h-screen transition-all duration-300 ease-in-out ${
          sidebarCollapsed ? 'w-16' : 'w-64'
        }`}>
          <div className={`${sidebarCollapsed ? 'p-4' : 'p-6'}`}>
            <div className="flex items-center justify-between mb-8">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <span className={`text-xl font-bold text-gray-900 transition-opacity duration-300 ${
                  sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                }`}>
                  Transcribe
                </span>
              </Link>
              
              {/* Collapse button */}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1"
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                <svg 
                  className="w-4 h-4 text-gray-600" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  {sidebarCollapsed ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  )}
                </svg>
              </button>
            </div>
            
            {/* Navigation */}
            <nav className="space-y-1">
              <Link 
                href="/dashboard" 
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors group"
                title="Dashboard"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
                </svg>
                <span className={`transition-all duration-300 ${
                  sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                }`}>
                  Dashboard
                </span>
              </Link>
              
              <Link 
                href="/dashboard/folders" 
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors group"
                title="Folders"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                </svg>
                <span className={`transition-all duration-300 ${
                  sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                }`}>
                  Folders
                </span>
              </Link>
              
              <Link 
                href="/dashboard/upload" 
                className="flex items-center space-x-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors group"
                title="Upload Files"
              >
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <span className={`transition-all duration-300 ${
                  sidebarCollapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
                }`}>
                  Upload Files
                </span>
              </Link>
            </nav>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1">
          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  )
} 