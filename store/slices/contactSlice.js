import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api';

// Async thunk for fetching contacts
export const fetchContacts = createAsyncThunk(
  'contact/fetchContacts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.request('/contact-us');
      console.log('Contact API response:', response);
      // Handle different response structures
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (Array.isArray(response)) {
        return response;
      } else if (response.contacts && Array.isArray(response.contacts)) {
        return response.contacts;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Fetch contacts error:', error);
      return rejectWithValue(error.message || 'Failed to fetch contacts');
    }
  }
);

const initialState = {
  contacts: [],
  loading: false,
  totalContact:0,
  error: null,
};

const contactSlice = createSlice({
  name: 'contact',
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
    // Fetch contacts
    builder
      .addCase(fetchContacts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.loading = false;
        state.contacts = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setLoading } = contactSlice.actions;
export default contactSlice.reducer;