import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api';

// Async thunk for fetching applications
export const fetchApplications = createAsyncThunk(
  'application/fetchApplications',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.request('/careers');
      console.log('Application API response:', response);
      // Handle different response structures
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (Array.isArray(response)) {
        return response;
      } else if (response.applications && Array.isArray(response.applications)) {
        return response.applications;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Fetch applications error:', error);
      return rejectWithValue(error.message || 'Failed to fetch applications');
    }
  }
);

const initialState = {
  applications: [],
  totalApplication:0,
  loading: false,
  error: null,
};

const applicationSlice = createSlice({
  name: 'application',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Fetch applications
    builder
      .addCase(fetchApplications.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchApplications.fulfilled, (state, action) => {
        state.loading = false;
        state.applications = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchApplications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setLoading } = applicationSlice.actions;
export default applicationSlice.reducer;