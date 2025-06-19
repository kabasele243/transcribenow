# Redux Toolkit Setup with Persistence

This project uses Redux Toolkit for state management with Redux Persist for state persistence. The setup follows Redux Toolkit best practices and provides a scalable architecture for managing application state.

## 🏗️ Architecture Overview

### Store Structure
```
src/store/
├── index.ts              # Main store configuration
├── hooks.ts              # Typed Redux hooks
└── slices/
    ├── foldersSlice.ts   # Folder management state
    ├── uploadsSlice.ts   # File upload state
    └── authSlice.ts      # Authentication state
```

### State Structure
```typescript
{
  folders: {
    folders: Folder[]
    selectedFolderId: string | null
    loading: boolean
    error: string | null
  },
  uploads: {
    files: UploadFile[]
    uploading: boolean
    error: string | null
  },
  auth: {
    user: User | null
    isAuthenticated: boolean
    loading: boolean
    error: string | null
  }
}
```

## 🔧 Setup Details

### 1. Store Configuration (`src/store/index.ts`)

The main store is configured with:
- **Redux Persist**: Persists `folders` and `auth` state to localStorage
- **DevTools**: Enabled in development mode
- **Serializable Check**: Configured to ignore persist actions
- **TypeScript Support**: Full type safety with `RootState` and `AppDispatch`

```typescript
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['folders', 'auth'], // Only persist these reducers
  blacklist: ['uploads'] // Don't persist uploads state
}
```

### 2. Typed Hooks (`src/store/hooks.ts`)

Custom typed hooks for better TypeScript support:
```typescript
export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
```

### 3. Provider Setup (`src/components/ReduxProvider.tsx`)

The Redux Provider wraps the entire app with:
- Redux store
- PersistGate for state rehydration
- Proper TypeScript types

## 📦 Slices Overview

### Folders Slice (`src/store/slices/foldersSlice.ts`)

Manages folder state with:
- **State**: folders array, selected folder, loading, error
- **Actions**: CRUD operations for folders
- **Async Thunks**: API calls for folder operations
- **Selectors**: Typed selectors for state access

**Key Features:**
- Automatic folder selection on creation
- File count management
- Error handling
- Loading states

### Uploads Slice (`src/store/slices/uploadsSlice.ts`)

Manages file upload state with:
- **State**: upload files, uploading status, error
- **Actions**: File upload management
- **Async Thunks**: Simulated upload process with progress
- **Selectors**: File filtering by folder

**Key Features:**
- Progress tracking
- Status management (pending, uploading, completed, error)
- File organization by folder
- Real-time progress updates

### Auth Slice (`src/store/slices/authSlice.ts`)

Manages authentication state with:
- **State**: user data, authentication status, loading, error
- **Actions**: Login/logout operations
- **Async Thunks**: Authentication API calls
- **Selectors**: User and auth status access

## 🚀 Usage Examples

### Basic State Access
```typescript
import { useAppDispatch, useAppSelector } from '@/store/hooks'
import { selectFolders, createFolder } from '@/store/slices/foldersSlice'

function MyComponent() {
  const dispatch = useAppDispatch()
  const folders = useAppSelector(selectFolders)
  
  const handleCreateFolder = () => {
    dispatch(createFolder('New Folder'))
  }
  
  return (
    <div>
      {folders.map(folder => (
        <div key={folder.id}>{folder.name}</div>
      ))}
    </div>
  )
}
```

### Async Operations
```typescript
import { fetchFolders } from '@/store/slices/foldersSlice'

function MyComponent() {
  const dispatch = useAppDispatch()
  const loading = useAppSelector(selectFoldersLoading)
  
  useEffect(() => {
    dispatch(fetchFolders())
  }, [dispatch])
  
  if (loading) return <div>Loading...</div>
  
  return <div>Content loaded</div>
}
```

### File Upload with Progress
```typescript
import { uploadFiles } from '@/store/slices/uploadsSlice'

function UploadComponent() {
  const dispatch = useAppDispatch()
  const uploading = useAppSelector(selectUploading)
  
  const handleFileUpload = (files: File[]) => {
    dispatch(uploadFiles({ files, folderId: 'selected-folder-id' }))
  }
  
  return (
    <div>
      {uploading && <div>Uploading...</div>}
      <input type="file" onChange={(e) => handleFileUpload(Array.from(e.target.files || []))} />
    </div>
  )
}
```

## 🔄 State Persistence

### What Gets Persisted
- **Folders**: All folder data and selection state
- **Auth**: User authentication state and user data

### What Doesn't Get Persisted
- **Uploads**: Upload state is not persisted (temporary state)

### Persistence Configuration
```typescript
const persistConfig = {
  key: 'root',
  storage, // localStorage
  whitelist: ['folders', 'auth'],
  blacklist: ['uploads']
}
```

## 🛠️ Best Practices Implemented

### 1. **Slice Organization**
- Each slice handles a specific domain
- Clear separation of concerns
- Consistent naming conventions

### 2. **TypeScript Integration**
- Full type safety throughout
- Typed selectors and actions
- Proper type exports

### 3. **Async Operations**
- Redux Toolkit's `createAsyncThunk` for API calls
- Proper loading and error states
- Optimistic updates where appropriate

### 4. **State Normalization**
- Flat state structure
- Efficient selectors
- Minimal state duplication

### 5. **Performance Optimization**
- Selective persistence
- Efficient re-renders with proper selectors
- Memoized selectors where needed

### 6. **Error Handling**
- Centralized error management
- User-friendly error messages
- Error clearing mechanisms

## 🔍 Development Tools

### Redux DevTools
- Available in development mode
- State inspection and time-travel debugging
- Action logging and performance monitoring

### TypeScript Support
- Full type safety
- IntelliSense support
- Compile-time error checking

## 📝 Adding New Features

### 1. Create a New Slice
```typescript
// src/store/slices/newFeatureSlice.ts
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'

const newFeatureSlice = createSlice({
  name: 'newFeature',
  initialState: { /* initial state */ },
  reducers: { /* sync actions */ },
  extraReducers: (builder) => { /* async actions */ }
})

export default newFeatureSlice.reducer
```

### 2. Add to Store
```typescript
// src/store/index.ts
import newFeatureSlice from './slices/newFeatureSlice'

const rootReducer = combineReducers({
  // ... existing reducers
  newFeature: newFeatureSlice,
})
```

### 3. Create Selectors
```typescript
export const selectNewFeature = (state: RootState) => state.newFeature
```

### 4. Use in Components
```typescript
const newFeatureData = useAppSelector(selectNewFeature)
```

## 🧪 Testing

### Unit Testing Slices
```typescript
import newFeatureSlice, { actions } from './newFeatureSlice'

describe('newFeatureSlice', () => {
  it('should handle initial state', () => {
    expect(newFeatureSlice.reducer(undefined, { type: 'unknown' })).toEqual({
      // expected initial state
    })
  })
})
```

### Integration Testing
```typescript
import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { store } from '@/store'

const renderWithRedux = (component: React.ReactElement) => {
  return render(
    <Provider store={store}>
      {component}
    </Provider>
  )
}
```

## 🚀 Performance Considerations

### 1. **Selective Persistence**
- Only persist necessary state
- Avoid persisting large objects or temporary data

### 2. **Efficient Selectors**
- Use specific selectors instead of selecting entire state
- Consider memoization for expensive computations

### 3. **State Structure**
- Keep state flat and normalized
- Avoid deeply nested objects
- Use IDs for relationships

### 4. **Action Optimization**
- Batch related actions when possible
- Use optimistic updates for better UX
- Implement proper loading states

This Redux Toolkit setup provides a solid foundation for scalable state management with persistence, following industry best practices and maintaining excellent developer experience. 