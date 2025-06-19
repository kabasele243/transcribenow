import { configureStore } from '@reduxjs/toolkit'
import { persistStore, persistReducer } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
import { combineReducers } from '@reduxjs/toolkit'

// Import slices
import foldersSlice from './slices/foldersSlice'
import uploadsSlice from './slices/uploadsSlice'
import authSlice from './slices/authSlice'
import supabaseSlice from './slices/supabaseSlice'

// Persist configuration
const persistConfig = {
  key: 'root',
  storage,
  whitelist: ['folders', 'auth', 'supabase'], // Only persist these reducers
  blacklist: ['uploads'] // Don't persist uploads state
}

// Root reducer
const rootReducer = combineReducers({
  folders: foldersSlice,
  uploads: uploadsSlice,
  auth: authSlice,
  supabase: supabaseSlice,
})

// Persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer)

// Store configuration
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
})

// Persistor
export const persistor = persistStore(store)

// Types
export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch 