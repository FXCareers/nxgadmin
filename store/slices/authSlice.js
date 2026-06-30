import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api';

const ROLE_MAP = {
  1: 'user',
  2: 'admin',
  3: 'editor',
  4: 'leadmanager',
  user: 'user',
  admin: 'admin',
  editor: 'editor',
  leadmanager: 'leadmanager',
  leadManager: 'leadmanager',
  User: 'user',
  Admin: 'admin',
  Editor: 'editor',
  LeadManager: 'leadmanager',
  hr: 'hr',
  HR: 'hr',
};

const normalizeUserRole = (user) => {
  if (!user) return user;
  const mappedRole = ROLE_MAP[user.role] ?? user.role;
  return {
    ...user,
    role: mappedRole,
  };
};

// Async thunks for authentication
export const loginUser = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await apiClient.login(credentials);
      
      if (response.status === 'success') {
        const normalizedUser = normalizeUserRole(response.user);

        // Store token and user data
        apiClient.setToken(response.token);
        apiClient.setUser(normalizedUser);
        
        return {
          user: normalizedUser,
          token: response.token,
        };
      } else {
        return rejectWithValue(response.message || 'Login failed');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/signup',
  async (userData, { rejectWithValue }) => {
    try {
      const payload = {
        email: userData.email,
        password: userData.password,
        confirmPassword: userData.confirmPassword || userData.password,
        fname: userData.fname,
        lname: userData.lname,
        phone: userData.phone,
      };

      const response = await apiClient.request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(payload),
        skipAuth: true,
      });

      const status = response?.status ?? response?.success ?? response?.ok;
      const message = response?.message || response?.msg || 'OTP sent to your email.';
      const userId = response?.userId || response?.user_id || response?.user?.id || response?.data?.id;

      if (
        userId &&
        (status === 'success' || status === true || response?.otp || message?.toLowerCase().includes('otp'))
      ) {
        return {
          email: response?.email || response?.data?.email || userData.email,
          userId,
          message,
        };
      }

      return rejectWithValue(message || 'Registration failed');
    } catch (error) {
      return rejectWithValue(error.message || 'Registration failed');
    }
  }
);

export const verifyOtp = createAsyncThunk(
  'auth/verifyOtp',
  async (data, { rejectWithValue }) => {
    try {
      if (!data.userId) {
        throw new Error('Missing user ID for OTP verification');
      }

      const payload = {
        userId: data.userId,
        otp: data.otp,
      };

      const response = await apiClient.request('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify(payload),
        skipAuth: true,
      });

      if (response.status === 'success' || response.success === true) {
        const normalizedUser = normalizeUserRole(response.user);
        apiClient.setToken(response.token);
        apiClient.setUser(normalizedUser);

        return {
          user: normalizedUser,
          token: response.token,
        };
      } else {
        return rejectWithValue(response.message || 'OTP verification failed');
      }
    } catch (error) {
      return rejectWithValue(error.message || 'OTP verification failed');
    }
  }
);

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  otpPendingEmail: null,
  otpPendingUserId: null,
  verifyOtpLoading: false,
  otpMessage: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Initialize auth state from localStorage
    initializeAuth: (state) => {
      const token = apiClient.getToken();
      const user = apiClient.getUser();
      if (token && user && apiClient.isAuthenticated()) {
        state.token = token;
        state.user = normalizeUserRole(user);
        apiClient.setUser(state.user);
        state.isAuthenticated = true;
        state.loading = false;
      } else {
        apiClient.logout();
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      }
    },
    
    // Logout action
    logout: (state) => {
      apiClient.logout();
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.error = null;
      state.loading = false;
      state.otpPendingEmail = null;
      state.otpPendingUserId = null;
      state.otpMessage = null;
      state.verifyOtpLoading = false;
    },
    
    // Clear error
    clearError: (state) => {
      state.error = null;
      state.otpMessage = null;
      state.otpMessage = null;
    },
    
    // Update user profile
    updateUserProfile: (state, action) => {
      state.user = normalizeUserRole({ ...state.user, ...action.payload });
      apiClient.setUser(state.user);
    },
  },
  extraReducers: (builder) => {
    // Login cases
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      })
      
      // Register cases
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.otpMessage = null;
        state.otpPendingEmail = null;
        state.otpPendingUserId = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.error = null;
        state.otpPendingEmail = action.payload.email;
        state.otpPendingUserId = action.payload.userId;
        state.otpMessage = action.payload.message;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
        state.otpPendingEmail = null;
        state.otpPendingUserId = null;
        state.otpMessage = null;
      })

      // Verify OTP
      .addCase(verifyOtp.pending, (state) => {
        state.verifyOtpLoading = true;
        state.error = null;
      })
      .addCase(verifyOtp.fulfilled, (state, action) => {
        state.verifyOtpLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
        state.error = null;
        state.otpPendingEmail = null;
        state.otpPendingUserId = null;
        state.otpMessage = null;
      })
      .addCase(verifyOtp.rejected, (state, action) => {
        state.verifyOtpLoading = false;
        state.error = action.payload;
        state.isAuthenticated = false;
      });
  },
});

export const { initializeAuth, logout, clearError, updateUserProfile } = authSlice.actions;
export default authSlice.reducer;
