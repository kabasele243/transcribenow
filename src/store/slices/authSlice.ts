import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'

// Types
export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  firstName?: string
  lastName?: string
  imageUrl?: string
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  isSigningIn: boolean
  isSigningUp: boolean
}

// Initial state
const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  isSigningIn: false,
  isSigningUp: false,
}

// Async thunks for Clerk integration
export const signInWithClerk = createAsyncThunk(
  'auth/signInWithClerk',
  async ({ email, password }: { email: string; password: string }) => {
    // This will be handled by Clerk's SignIn component
    // We'll just return the user data that will be set via setUser action
    return { email, password }
  }
)

export const signUpWithClerk = createAsyncThunk(
  'auth/signUpWithClerk',
  async ({ email, password, firstName, lastName }: { 
    email: string; 
    password: string; 
    firstName?: string; 
    lastName?: string; 
  }) => {
    // This will be handled by Clerk's SignUp component
    // We'll just return the user data that will be set via setUser action
    return { email, password, firstName, lastName }
  }
)

export const signOutWithClerk = createAsyncThunk(
  'auth/signOutWithClerk',
  async () => {
    // This will be handled by Clerk's SignOut component
    return null
  }
)

export const syncClerkUser = createAsyncThunk(
  'auth/syncClerkUser',
  async (clerkUser: { id: string; emailAddresses?: Array<{ emailAddress: string }>; fullName?: string | null; firstName?: string | null; lastName?: string | null; imageUrl?: string | null }) => {
    // Transform Clerk user to our User interface
    const user: User = {
      id: clerkUser.id,
      email: clerkUser.emailAddresses?.[0]?.emailAddress || '',
      name: clerkUser.fullName || clerkUser.firstName || '',
      firstName: clerkUser.firstName || undefined,
      lastName: clerkUser.lastName || undefined,
      avatar: clerkUser.imageUrl || undefined,
      imageUrl: clerkUser.imageUrl || undefined,
    }
    return user
  }
)

// Legacy async thunks (kept for backward compatibility)
export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }: { email: string; password: string }) => {
    // Simulate API call - replace with actual API
    await new Promise(resolve => setTimeout(resolve, 1000))
    console.log('login', email, password)
    
    // Simulate successful login
    const user: User = {
      id: '1',
      email,
      name: email.split('@')[0],
      avatar: `https://ui-avatars.com/api/?name=${email.split('@')[0]}&background=random`
    }
    
    return user
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    // Simulate API call - replace with actual API
    await new Promise(resolve => setTimeout(resolve, 500))
    return null
  }
)

export const checkAuth = createAsyncThunk(
  'auth/checkAuth',
  async () => {
    // Simulate API call to check if user is authenticated
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // For demo purposes, return null (not authenticated)
    // In real app, this would check for valid token and return user data
    return null
  }
)

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload
      state.isAuthenticated = true
      state.loading = false
      state.error = null
    },
    clearUser: (state) => {
      state.user = null
      state.isAuthenticated = false
      state.loading = false
      state.error = null
    },
    setSigningIn: (state, action: PayloadAction<boolean>) => {
      state.isSigningIn = action.payload
    },
    setSigningUp: (state, action: PayloadAction<boolean>) => {
      state.isSigningUp = action.payload
    },
    setAuthError: (state, action: PayloadAction<string>) => {
      state.error = action.payload
      state.loading = false
      state.isSigningIn = false
      state.isSigningUp = false
    }
  },
  extraReducers: (builder) => {
    builder
      // Clerk Sign In
      .addCase(signInWithClerk.pending, (state) => {
        state.isSigningIn = true
        state.error = null
      })
      .addCase(signInWithClerk.fulfilled, (state) => {
        state.isSigningIn = false
      })
      .addCase(signInWithClerk.rejected, (state, action) => {
        state.isSigningIn = false
        state.error = action.error.message || 'Sign in failed'
      })
      // Clerk Sign Up
      .addCase(signUpWithClerk.pending, (state) => {
        state.isSigningUp = true
        state.error = null
      })
      .addCase(signUpWithClerk.fulfilled, (state) => {
        state.isSigningUp = false
      })
      .addCase(signUpWithClerk.rejected, (state, action) => {
        state.isSigningUp = false
        state.error = action.error.message || 'Sign up failed'
      })
      // Clerk Sign Out
      .addCase(signOutWithClerk.pending, (state) => {
        state.loading = true
      })
      .addCase(signOutWithClerk.fulfilled, (state) => {
        state.loading = false
        state.user = null
        state.isAuthenticated = false
      })
      .addCase(signOutWithClerk.rejected, (state) => {
        state.loading = false
        state.user = null
        state.isAuthenticated = false
      })
      // Sync Clerk User
      .addCase(syncClerkUser.pending, (state) => {
        state.loading = true
      })
      .addCase(syncClerkUser.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = true
        state.error = null
      })
      .addCase(syncClerkUser.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Failed to sync user'
      })
      // Legacy Login
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.user = action.payload
        state.isAuthenticated = true
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.error.message || 'Login failed'
      })
      // Legacy Logout
      .addCase(logout.pending, (state) => {
        state.loading = true
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false
        state.user = null
        state.isAuthenticated = false
      })
      .addCase(logout.rejected, (state) => {
        state.loading = false
        state.user = null
        state.isAuthenticated = false
      })
      // Legacy Check auth
      .addCase(checkAuth.pending, (state) => {
        state.loading = true
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false
        if (action.payload) {
          state.user = action.payload
          state.isAuthenticated = true
        } else {
          state.user = null
          state.isAuthenticated = false
        }
      })
      .addCase(checkAuth.rejected, (state) => {
        state.loading = false
        state.user = null
        state.isAuthenticated = false
      })
  }
})

export const { 
  clearError, 
  setUser, 
  clearUser, 
  setSigningIn, 
  setSigningUp, 
  setAuthError 
} = authSlice.actions

// Selectors
export const selectUser = (state: { auth: AuthState }) => state.auth.user
export const selectIsAuthenticated = (state: { auth: AuthState }) => state.auth.isAuthenticated
export const selectAuthLoading = (state: { auth: AuthState }) => state.auth.loading
export const selectAuthError = (state: { auth: AuthState }) => state.auth.error
export const selectIsSigningIn = (state: { auth: AuthState }) => state.auth.isSigningIn
export const selectIsSigningUp = (state: { auth: AuthState }) => state.auth.isSigningUp

export default authSlice.reducer 