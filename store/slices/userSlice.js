import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api';

// Async thunks for user operations
export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.request(`/auth/users?page=${page}&limit=${limit}`);
      return {
        users: response.data || response,
        pagination: {
          currentPage: page,
          limit: limit,
          totalItems: response.total || response.pagination?.total || (response.data ? response.data.length : 0),
          totalPages: response.totalPages || response.pagination?.totalPages || Math.ceil((response.total || 0) / limit)
        }
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch users');
    }
  }
);

export const createUser = createAsyncThunk(
  'user/createUser',
  async (userData, { rejectWithValue }) => {
    try {
      // Using /auth/register as requested to add a new user
      const response = await apiClient.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(userData),
        skipAuth: true, // Typically registration doesn't need auth token of another user
      });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create user');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.request(`/auth/profile/${id}`, {
        method: 'DELETE',
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete user');
    }
  }
);

const initialState = {
  users: [],
  loading: false,
  error: null,
  createLoading: false,
  deleteLoading: false,
  totalUser:0,
  pagination: {
    currentPage: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0
  }
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch users
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Create user
    builder
      .addCase(createUser.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.createLoading = false;
        // Don't add to current page users array as it might exceed the limit
        // Instead, we could refetch the current page or adjust pagination
        state.pagination.totalItems += 1;
        state.pagination.totalPages = Math.ceil(state.pagination.totalItems / state.pagination.limit);
        state.error = null;
      })
      .addCase(createUser.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })

    // Delete user
    builder
      .addCase(deleteUser.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.users = state.users.filter(user => user.id !== action.payload);
        state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1);
        state.pagination.totalPages = Math.ceil(state.pagination.totalItems / state.pagination.limit);
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setCurrentPage } = userSlice.actions;
export default userSlice.reducer;