import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api';

const ROLE_MAP = {
  1: 'User',
  2: 'Admin',
  3: 'Editor',
  4: 'Lead Manager',
  User: 'User',
  Admin: 'Admin',
  Editor: 'Editor',
  LeadManager: 'Lead Manager',
};

const normalizeUser = (user) => {
  if (!user) return null;

  const role = ROLE_MAP[user.role_id] ?? ROLE_MAP[user.role] ?? user.role ?? 'user';
  const fullName = [user.fname, user.lname].filter(Boolean).join(' ').trim();

  return {
    id: user.id,
    username: user.username || fullName || user.email || `user-${user.id}`,
    name: fullName || user.username || user.email || 'Unknown User',
    email: user.email || '',
    fname: user.fname || '',
    lname: user.lname || '',
    phone: user.phone || user.mobile || '',
    role,
    role_id: user.role_id ?? null,
    is_verified: user.is_verified ?? false,
    auth_provider: user.auth_provider || 'manual',
    created_at: user.created_at,
    updated_at: user.updated_at,
    raw: user,
  };
};

// Async thunks for user operations
export const fetchUsers = createAsyncThunk(
  'user/fetchUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.request(`/auth/users`, {
        method: 'GET',
      });

      const usersArray = Array.isArray(response?.users)
        ? response.users
        : Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response)
            ? response
            : [];

      const normalizedUsers = usersArray
        .map(normalizeUser)
        .filter(Boolean);

      return {
        users: normalizedUsers,
        pagination: {
          currentPage: 1,
          limit: normalizedUsers.length || 1,
          totalItems: normalizedUsers.length,
          totalPages: 1,
        },
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
      // Backend expects: email, password, fname, lname, phone, role_id
      const ROLE_NAME_TO_ID = {
        User: 1,
        Admin: 2,
        Editor: 3,
        LeadManager: 4,
        user: 1,
        admin: 2,
        editor: 3,
        leadManager: 4,
        
      };

      const roleId =
        userData.role_id ?? ROLE_NAME_TO_ID[userData.role] ?? 1;

      const payload = {
        email: userData.email,
        password: userData.password,
        fname: userData.fname,
        lname: userData.lname,
        phone: userData.mobile || userData.phone || '',
        role_id: roleId,
      };

      const response = await apiClient.request('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(payload),
        skipAuth: true,
      });

      // Expected: { success: true, userId, message }
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create user');
    }
  }
);

export const deleteUser = createAsyncThunk(
  'user/deleteUser',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.request(`/auth/users/${id}`, {
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