# Caching Implementation Guide

This document explains the caching strategy implemented in the Transcribe AI application to avoid repeated API calls and improve performance.

## Overview

The application now uses **React Query (TanStack Query)** for intelligent caching of API calls. This eliminates redundant requests and provides a better user experience.

## What's Cached

### 1. **Folder Data** (`/api/folders`)
- **Cache Duration**: 2 minutes (stale), 5 minutes (garbage collection)
- **Use Case**: Dashboard and navigation
- **Hook**: `useFolders()`

### 2. **Individual Folder Data** (`/api/folders/[id]`)
- **Cache Duration**: 2 minutes (stale), 5 minutes (garbage collection)
- **Use Case**: Folder detail pages
- **Hook**: `useFolder(id)`

### 3. **Transcription Data** (`/api/transcriptions?fileId=${fileId}`)
- **Cache Duration**: 5 minutes (stale), 10 minutes (garbage collection)
- **Use Case**: File transcription status and content
- **Hook**: `useTranscription(fileId)`

### 4. **File Duration Data** (`/api/files/duration?fileUrl=${fileUrl}`)
- **Cache Duration**: 30 minutes (stale), 1 hour (garbage collection)
- **Use Case**: Audio/video file duration display
- **Hook**: `useFileDuration(fileUrl)`

## Implementation Details

### React Query Configuration

```typescript
// src/lib/queryClient.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // 5 minutes
      gcTime: 10 * 60 * 1000,          // 10 minutes
      retry: 3,                        // Retry failed requests
      refetchOnWindowFocus: true,      // Refetch when window gains focus
      refetchOnReconnect: true,        // Refetch when reconnecting
    },
  },
})
```

### Custom Hooks

All API calls are wrapped in custom hooks that provide:
- **Automatic caching**
- **Loading states**
- **Error handling**
- **Background refetching**

```typescript
// Example usage
const { data: folders, isLoading, error } = useFolders()
const { data: transcription } = useTranscription(fileId)
const { data: duration } = useFileDuration(fileUrl)
```

### Enhanced File Data

The `useEnhancedFile` hook automatically fetches and caches transcription and duration data for files:

```typescript
// src/lib/apiUtils.ts
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
```

## Benefits

### 1. **Reduced API Calls**
- Before: Multiple calls for the same data on each page load
- After: Data is cached and reused across components

### 2. **Better Performance**
- Instant loading for cached data
- Background refetching keeps data fresh
- Reduced server load

### 3. **Improved User Experience**
- No loading spinners for cached data
- Consistent data across components
- Automatic error retry

### 4. **Developer Experience**
- Simple hook-based API
- Automatic cache invalidation
- Built-in loading and error states

## Usage Examples

### Basic Usage

```typescript
import { useFolders, useCreateFolder } from '@/hooks/useApi'

function Dashboard() {
  const { data: folders, isLoading, error } = useFolders()
  const createFolder = useCreateFolder()

  if (isLoading) return <div>Loading...</div>
  if (error) return <div>Error: {error.message}</div>

  return (
    <div>
      {folders?.folders.map(folder => (
        <div key={folder.id}>{folder.name}</div>
      ))}
    </div>
  )
}
```

### Enhanced File Display

```typescript
import { useEnhancedFile } from '@/lib/apiUtils'

function FileItem({ file }) {
  const enhancedFile = useEnhancedFile(file)

  return (
    <div>
      <h3>{enhancedFile.name}</h3>
      {enhancedFile.duration && (
        <span>Duration: {enhancedFile.duration}s</span>
      )}
      {enhancedFile.transcription && (
        <span>Transcribed: {enhancedFile.transcription.status}</span>
      )}
    </div>
  )
}
```

### Mutations with Cache Updates

```typescript
import { useCreateFolder } from '@/hooks/useApi'

function CreateFolderForm() {
  const createFolder = useCreateFolder()

  const handleSubmit = async (name: string) => {
    try {
      await createFolder.mutateAsync(name)
      // Cache is automatically invalidated and refetched
    } catch (error) {
      console.error('Failed to create folder:', error)
    }
  }
}
```

## Cache Invalidation

### Automatic Invalidation
- **Create operations**: Invalidates related queries
- **Update operations**: Updates specific cache entries
- **Delete operations**: Removes cache entries

### Manual Invalidation

```typescript
import { queryClient } from '@/lib/queryClient'
import { queryKeys } from '@/hooks/useApi'

// Invalidate all folder data
queryClient.invalidateQueries({ queryKey: queryKeys.folders })

// Invalidate specific folder
queryClient.invalidateQueries({ queryKey: queryKeys.folder(folderId) })

// Remove specific cache entry
queryClient.removeQueries({ queryKey: queryKeys.folder(folderId) })
```

## Development Tools

React Query DevTools are available in development mode:
- Shows all cached queries
- Displays cache status and timing
- Allows manual cache manipulation
- Performance monitoring

## Migration from Old Code

### Before (Manual Fetching)
```typescript
const [folders, setFolders] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  fetch('/api/folders')
    .then(res => res.json())
    .then(data => setFolders(data.folders))
    .finally(() => setLoading(false))
}, [])
```

### After (React Query)
```typescript
const { data: folders, isLoading } = useFolders()
```

## Best Practices

1. **Use the provided hooks** instead of manual fetch calls
2. **Leverage enhanced file data** for consistent UI
3. **Handle loading and error states** properly
4. **Use mutations for data changes** (create, update, delete)
5. **Let React Query handle cache invalidation** automatically

## Performance Monitoring

Monitor cache performance in the React Query DevTools:
- Cache hit rates
- Query execution times
- Memory usage
- Background refetch frequency

## Troubleshooting

### Common Issues

1. **Stale data**: Check `staleTime` configuration
2. **Missing updates**: Verify cache invalidation logic
3. **Memory leaks**: Monitor `gcTime` settings
4. **Network errors**: Check retry configuration

### Debug Commands

```typescript
// Log all cached queries
console.log(queryClient.getQueryCache().getAll())

// Clear all cache
queryClient.clear()

// Prefetch data
queryClient.prefetchQuery({
  queryKey: queryKeys.folders,
  queryFn: api.fetchFolders,
})
```

## Future Enhancements

1. **Persistent cache** for offline support
2. **Optimistic updates** for better UX
3. **Infinite queries** for large datasets
4. **Real-time updates** with WebSocket integration 