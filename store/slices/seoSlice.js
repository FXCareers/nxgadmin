import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api';

// Fetch all SEO entries
export const fetchSeoData = createAsyncThunk(
  'seo/fetchSeoData',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.request('/seodata/');

      const dataArray = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];

      return dataArray;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch SEO data');
    }
  }
);

// Create new SEO entry
export const createSeoEntry = createAsyncThunk(
  'seo/createSeoEntry',
  async (seoData, { rejectWithValue }) => {
    try {
      const payload = {
        page_url: seoData.page_url,
        seotitle: seoData.seotitle,
        seokeyword: seoData.seokeyword,
        seodiscr: seoData.seodiscr,
      };

      const response = await apiClient.request('/seodata/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const created = response?.data || response;
      return created;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create SEO entry');
    }
  }
);

// Update single SEO entry
export const updateSeoEntry = createAsyncThunk(
  'seo/updateSeoEntry',
  async ({ id, ...seoData }, { rejectWithValue }) => {
    try {
      const payload = {
        page_url: seoData.page_url,
        seotitle: seoData.seotitle,
        seokeyword: seoData.seokeyword,
        seodiscr: seoData.seodiscr,
      };

      const response = await apiClient.request(`/seodata/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      const updated = response?.data || response;
      return updated;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update SEO entry');
    }
  }
);

// Delete SEO entry
export const deleteSeoEntry = createAsyncThunk(
  'seo/deleteSeoEntry',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.request(`/seodata/${id}`, {
        method: 'DELETE',
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete SEO entry');
    }
  }
);

const initialState = {
  items: [],
  loading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  error: null,
};

const seoSlice = createSlice({
  name: 'seo',
  initialState,
  reducers: {
    clearSeoError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSeoData.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSeoData.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchSeoData.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create
      .addCase(createSeoEntry.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createSeoEntry.fulfilled, (state, action) => {
        state.createLoading = false;
        const created = action.payload;
        if (created) {
          state.items = Array.isArray(state.items) ? [created, ...state.items] : [created];
        }
        state.error = null;
      })
      .addCase(createSeoEntry.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })

      // Update
      .addCase(updateSeoEntry.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateSeoEntry.fulfilled, (state, action) => {
        state.updateLoading = false;
        const updated = action.payload;
        if (updated && updated.id != null) {
          const index = state.items.findIndex((item) => item.id === updated.id);
          if (index !== -1) {
            state.items[index] = updated;
          }
        }
        state.error = null;
      })
      .addCase(updateSeoEntry.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })

      // Delete
      .addCase(deleteSeoEntry.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteSeoEntry.fulfilled, (state, action) => {
        state.deleteLoading = false;
        const id = action.payload;
        state.items = Array.isArray(state.items)
          ? state.items.filter((item) => item.id !== id)
          : state.items;
        state.error = null;
      })
      .addCase(deleteSeoEntry.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSeoError } = seoSlice.actions;
export default seoSlice.reducer;


