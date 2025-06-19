# Supabase + Redux Integration

This document explains how Supabase is integrated with Redux state management for seamless data synchronization and real-time updates.

## 🎯 Overview

The integration provides:
- **Automatic State Sync**: Supabase data automatically syncs with Redux
- **Real-time Updates**: Live data changes appear instantly across all components
- **Type Safety**: Full TypeScript support with proper interfaces
- **Error Handling**: Centralized error management
- **Performance**: Optimized with Redux Toolkit and async thunks

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Supabase DB   │◄──►│  Supabase Client│◄──►│   Redux Store   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │                        │
                              ▼                        ▼
                       ┌─────────────────┐    ┌─────────────────┐
                       │ Real-time Subs  │    │   Components    │
                       └─────────────────┘    └─────────────────┘
```

## 📁 File Structure

```
src/
├── store/
│   ├── slices/
│   │   └── supabaseSlice.ts     # Redux slice for Supabase data
│   └── index.ts                 # Store configuration
├── hooks/
│   └── useSupabaseRedux.ts      # Custom hook for easy usage
└── components/
    └── SupabaseReduxExample.tsx # Example implementation
```

## 🔧 Redux Slice (`supabaseSlice.ts`)

### State Interface
```typescript
interface SupabaseState {
  folders: Folder[]
  files: File[]
  loading: boolean
  error: string | null
  lastUpdated: number | null
}
```

### Async Thunks
- `fetchFolders(session)` - Load all folders
- `fetchFiles({ session, folderId })` - Load files (optionally by folder)
- `createFolder({ session, name })` - Create new folder
- `deleteFolder({ session, id })` - Delete folder
- `createFile({ session, fileData })` - Create new file
- `deleteFile({ session, id })` - Delete file

### Real-time Actions
- `addFolder(folder)` - Add folder from real-time update
- `updateFolder(folder)` - Update folder from real-time update
- `removeFolder(id)` - Remove folder from real-time update
- `addFile(file)` - Add file from real-time update
- `updateFile(file)` - Update file from real-time update
- `removeFile(id)` - Remove file from real-time update

## 🎣 Custom Hook (`useSupabaseRedux`)

### Usage
```typescript
import { useSupabaseRedux } from '@/hooks/useSupabaseRedux'

function MyComponent() {
  const {
    folders,
    files,
    loading,
    error,
    createNewFolder,
    deleteFolderById,
    setupRealtimeSubscriptions,
  } = useSupabaseRedux()

  // Use the data and actions...
}
```

### Available Properties

#### State
- `folders: Folder[]` - All user folders
- `files: File[]` - All user files
- `loading: boolean` - Loading state
- `error: string | null` - Error message
- `lastUpdated: number | null` - Last update timestamp

#### Actions
- `loadFolders()` - Fetch all folders
- `loadFiles(folderId?)` - Fetch files (optionally by folder)
- `createNewFolder(name)` - Create folder
- `deleteFolderById(id)` - Delete folder
- `createNewFile(fileData)` - Create file
- `deleteFileById(id)` - Delete file

#### Real-time
- `setupRealtimeSubscriptions()` - Setup real-time listeners

#### Utilities
- `clearSupabaseError()` - Clear error state
- `clearSupabaseData()` - Clear all data
- `getFilesByFolder(folderId)` - Get files for specific folder
- `getFolderById(folderId)` - Get folder by ID
- `getFileById(fileId)` - Get file by ID

## 🔄 Real-time Subscriptions

The integration automatically sets up real-time subscriptions for:
- **Folders table**: INSERT, UPDATE, DELETE events
- **Files table**: INSERT, UPDATE, DELETE events

### How it Works
1. When a component mounts, `setupRealtimeSubscriptions()` is called
2. Supabase channels are created for both tables
3. Database changes automatically dispatch Redux actions
4. Components re-render with updated data instantly

### Example
```typescript
useEffect(() => {
  const cleanup = setupRealtimeSubscriptions()
  return cleanup // Cleanup on unmount
}, [setupRealtimeSubscriptions])
```

## 📝 Usage Examples

### Basic Component
```typescript
'use client'

import { useEffect } from 'react'
import { useSupabaseRedux } from '@/hooks/useSupabaseRedux'

export default function FoldersList() {
  const {
    folders,
    loading,
    error,
    loadFolders,
    createNewFolder,
    setupRealtimeSubscriptions,
  } = useSupabaseRedux()

  useEffect(() => {
    loadFolders()
    const cleanup = setupRealtimeSubscriptions()
    return cleanup
  }, [loadFolders, setupRealtimeSubscriptions])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div>
      {folders.map(folder => (
        <div key={folder.id}>{folder.name}</div>
      ))}
    </div>
  )
}
```

### Creating Data
```typescript
const handleCreateFolder = async (name: string) => {
  try {
    await createNewFolder(name)
    // Data automatically appears in Redux state
    // Real-time subscription will update other components
  } catch (error) {
    console.error('Failed to create folder:', error)
  }
}
```

### Deleting Data
```typescript
const handleDeleteFolder = async (id: string) => {
  try {
    await deleteFolderById(id)
    // Folder automatically removed from Redux state
    // Associated files also removed automatically
  } catch (error) {
    console.error('Failed to delete folder:', error)
  }
}
```

## 🎯 Benefits

### 1. **Automatic Synchronization**
- Database changes automatically sync with Redux
- No manual state updates needed
- Consistent data across all components

### 2. **Real-time Updates**
- Changes appear instantly across all connected clients
- No need to refresh or poll for updates
- Live collaboration support

### 3. **Type Safety**
- Full TypeScript support
- Compile-time error checking
- IntelliSense support

### 4. **Performance**
- Optimistic updates
- Efficient re-rendering
- Minimal network requests

### 5. **Error Handling**
- Centralized error management
- Automatic error recovery
- User-friendly error messages

### 6. **Developer Experience**
- Simple API with custom hook
- Automatic cleanup
- Easy debugging with Redux DevTools

## 🔧 Configuration

### Store Setup
The Supabase slice is automatically added to the Redux store:

```typescript
// src/store/index.ts
import supabaseSlice from './slices/supabaseSlice'

const rootReducer = combineReducers({
  // ... other slices
  supabase: supabaseSlice,
})
```

### Persistence
Supabase data is persisted in localStorage:
```typescript
const persistConfig = {
  whitelist: ['folders', 'auth', 'supabase'],
}
```

## 🚀 Best Practices

### 1. **Use the Custom Hook**
Always use `useSupabaseRedux()` instead of directly accessing the store:
```typescript
// ✅ Good
const { folders, createNewFolder } = useSupabaseRedux()

// ❌ Avoid
const folders = useSelector(state => state.supabase.folders)
```

### 2. **Setup Real-time Subscriptions**
Always call `setupRealtimeSubscriptions()` in your components:
```typescript
useEffect(() => {
  const cleanup = setupRealtimeSubscriptions()
  return cleanup
}, [setupRealtimeSubscriptions])
```

### 3. **Handle Loading States**
Always check loading and error states:
```typescript
if (loading) return <LoadingSpinner />
if (error) return <ErrorMessage error={error} />
```

### 4. **Cleanup on Unmount**
Real-time subscriptions are automatically cleaned up, but ensure proper cleanup:
```typescript
useEffect(() => {
  const cleanup = setupRealtimeSubscriptions()
  return cleanup
}, [setupRealtimeSubscriptions])
```

### 5. **Error Handling**
Always wrap async operations in try-catch:
```typescript
try {
  await createNewFolder(name)
} catch (error) {
  console.error('Failed to create folder:', error)
}
```

## 🔍 Debugging

### Redux DevTools
Open Redux DevTools to see:
- All Supabase actions
- State changes
- Real-time updates
- Error states

### Console Logging
The integration includes comprehensive logging:
- Database operations
- Real-time events
- Error messages
- Performance metrics

## 📚 Related Documentation

- [Supabase Integration Setup](./SUPABASE_SETUP.md)
- [Clerk-Redux Integration](./CLERK_REDUX_INTEGRATION.md)
- [Redux Setup](./REDUX_SETUP.md)
- [Supabase Documentation](https://supabase.com/docs)
- [Redux Toolkit Documentation](https://redux-toolkit.js.org/) 