'use client'
import { useState, useEffect, useCallback } from 'react'

import { Folder, Grid, List } from 'lucide-react'

import { FileUpload, FileList } from '@/components/FileUpload'
import Footer from '@/components/layout/Footer'
import Header from '@/components/layout/Header'

interface FileItem {
  id: string
  key: string
  filename: string
  size: number
  mime_type: string
  url: string
  created_at: string
}

interface FilesResponse {
  success: boolean
  files: FileItem[]
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>([])
  const [loading, setLoading] = useState(true)
  const [currentFolder, setCurrentFolder] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [uploadSuccess, setUploadSuccess] = useState(false)

  const fetchFiles = useCallback(async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (currentFolder) params.append('folder', currentFolder)
      const response = await fetch(`/api/files?${params.toString()}`)
      const data = (await response.json()) as FilesResponse
      if (data.success) {
        setFiles(data.files)
      }
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setLoading(false)
    }
  }, [currentFolder])

  useEffect(() => {
    void fetchFiles()
  }, [fetchFiles])

  const handleUpload = () => {
    setUploadSuccess(true)
    setTimeout(() => setUploadSuccess(false), 3000)
    void fetchFiles() // Refresh file list
  }
  const handleDelete = async (key: string) => {
     
    if (!window.confirm('Are you sure you want to delete this file?')) return
    try {
      const response = await fetch(`/api/files/${encodeURIComponent(key)}`, {
        method: 'DELETE'
      })
      if (response.ok) {
        void fetchFiles() // Refresh file list
      }
    } catch (error) {
      console.error('Error deleting file:', error)
    }
  }
  const folders = [
    { id: null, name: 'All Files', icon: Grid },
    { id: 'images', name: 'Images', icon: Folder },
    { id: 'documents', name: 'Documents', icon: Folder },
    { id: 'screenshots', name: 'Screenshots', icon: Folder },
    { id: 'general', name: 'General', icon: Folder }
  ]
  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-amber-50/20 to-blue-50/30">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý tệp tin</h1>
          <p className="mt-2 text-gray-600">Upload và quản lý các tệp tin của bạn</p>
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-lg bg-white p-4 shadow">
              <h2 className="mb-4 font-semibold text-gray-900">Thư mục</h2>
              <ul className="space-y-2">
                {folders.map(folder => (
                  <li key={folder.id ?? 'all'}>
                    <button
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                        currentFolder === folder.id
                          ? 'bg-blue-50 text-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                      onClick={() => setCurrentFolder(folder.id)}
                    >
                      <folder.icon className="h-4 w-4" />
                      {folder.name}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            {/* Upload Widget */}
            <div className="mt-6">
              <FileUpload
                folder={currentFolder ?? 'general'}
                maxSize={20 * 1024 * 1024} // 20MB
                onUpload={handleUpload}
              />
            </div>
          </div>
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="rounded-lg bg-white shadow">
              {/* Header */}
              <div className="border-b px-6 py-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">
                    {currentFolder ? folders.find(f => f.id === currentFolder)?.name : 'All Files'}
                  </h2>
                  <div className="flex items-center gap-2">
                    <button
                      className={`rounded p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </button>
                    <button
                      className={`rounded p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
              {/* Success Message */}
              {uploadSuccess && (
                <div className="mx-6 mt-4 rounded-lg bg-green-50 p-3 text-green-700">
                  File uploaded successfully!
                </div>
              )}
              {/* File List */}
              <div className="p-6">
                <FileList
                  files={files}
                  loading={loading}
                  onDelete={key => void handleDelete(key)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
