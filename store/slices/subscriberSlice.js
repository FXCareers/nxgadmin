import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api';

// Async thunks for subscriber operations
export const fetchSubscribers = createAsyncThunk(
  'subscriber/fetchSubscribers',
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.request(`/newsletter/subscribers?page=${page}&limit=${limit}`);
      
      const dataArray = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : Array.isArray(response?.subscribers)
            ? response.subscribers
            : [];

      const totalItems =
        response?.total ??
        response?.pagination?.total ??
        response?.meta?.total ??
        dataArray.length;

      const totalPages =
        response?.totalPages ??
        response?.pagination?.totalPages ??
        response?.meta?.totalPages ??
        Math.max(1, Math.ceil(totalItems / limit));

      return {
        subscribers: dataArray,
        pagination: {
          currentPage: page,
          limit: limit,
          totalItems,
          totalPages
        }
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch subscribers');
    }
  }
);

export const deleteSubscriber = createAsyncThunk(
  'subscriber/deleteSubscriber',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.request(`/newsletter/subscribers/${id}`, {
        method: 'DELETE',
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete subscriber');
    }
  }
);

const initialState = {
  subscribers: [],
  loading: false,
  error: null,
  deleteLoading: false,
  totalSubscribers: 0,
  pagination: {
    currentPage: 1,
    limit: 10,
    totalItems: 0,
    totalPages: 0
  }
};

const subscriberSlice = createSlice({
  name: 'subscriber',
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
    // Fetch subscribers
    builder
      .addCase(fetchSubscribers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSubscribers.fulfilled, (state, action) => {
        state.loading = false;
        state.subscribers = action.payload.subscribers;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchSubscribers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Delete subscriber
    builder
      .addCase(deleteSubscriber.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteSubscriber.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.subscribers = state.subscribers.filter(subscriber => subscriber.id !== action.payload);
        state.pagination.totalItems = Math.max(0, state.pagination.totalItems - 1);
        state.pagination.totalPages = Math.ceil(state.pagination.totalItems / state.pagination.limit);
        state.error = null;
      })
      .addCase(deleteSubscriber.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setCurrentPage } = subscriberSlice.actions;
export default subscriberSlice.reducer;
