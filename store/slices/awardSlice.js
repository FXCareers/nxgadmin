import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api';

// Async thunks for award operations
export const fetchAwards = createAsyncThunk(
  'award/fetchAwards',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.request('/awards');
      console.log('Award API response:', response);
      // Handle different response structures
      if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (Array.isArray(response)) {
        return response;
      } else if (response.awards && Array.isArray(response.awards)) {
        return response.awards;
      } else {
        return [];
      }
    } catch (error) {
      console.error('Fetch awards error:', error);
      return rejectWithValue(error.message || 'Failed to fetch awards');
    }
  }
);

export const updateAward = createAsyncThunk(
  'award/updateAward',
  async ({ id, ...awardData }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      for (const key in awardData) {
        if (key === 'images') {
          if (awardData.images && awardData.images.length > 0) {
            formData.append('images', awardData.images[0]);
          }
        } else {
          formData.append(key, awardData[key]);
        }
      }

      const response = await apiClient.request(`/awards/${id}`, {
        method: 'PUT',
        body: formData,
      });
      return response.award || response.data || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update award');
    }
  }
);

export const createAward = createAsyncThunk(
  'award/createAward',
  async (awardData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      for (const key in awardData) {
        if (key === 'images') {
          if (awardData.images && awardData.images.length > 0) {
            formData.append('images', awardData.images[0]);
          }
        } else {
          formData.append(key, awardData[key]);
        }
      }

      const response = await apiClient.request('/awards', {
        method: 'POST',
        body: formData,
      });
      console.log('Create award response:', response);
      return response.award || response.data || response;
    } catch (error) {
      console.error('Create award error:', error);
      return rejectWithValue(error.message || 'Failed to create award');
    }
  }
);



export const deleteAward = createAsyncThunk(
  'award/deleteAward',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.request(`/awards/${id}`, {
        method: 'DELETE',
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete award');
    }
  }
);

const initialState = {
  awards: [],
  loading: false,
  error: null,
  totalAwards:0,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
};

const awardSlice = createSlice({
  name: 'award',
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
    // Fetch awards
    builder
      .addCase(fetchAwards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAwards.fulfilled, (state, action) => {
        state.loading = false;
        state.awards = Array.isArray(action.payload) ? action.payload : [];
        state.error = null;
      })
      .addCase(fetchAwards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Create award
    builder
      .addCase(createAward.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createAward.fulfilled, (state, action) => {
        state.createLoading = false;
        if (Array.isArray(state.awards)) {
          state.awards.unshift(action.payload);
        } else {
          state.awards = [action.payload];
        }
        state.error = null;
      })
      .addCase(createAward.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })

    // Delete award
    builder
      .addCase(deleteAward.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteAward.fulfilled, (state, action) => {
        state.deleteLoading = false;
        if (Array.isArray(state.awards)) {
          state.awards = state.awards.filter(award => award.id !== action.payload);
        }
        state.error = null;
      })
      .addCase(deleteAward.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      })

    // Update award
    builder
      .addCase(updateAward.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateAward.fulfilled, (state, action) => {
        state.updateLoading = false;
        if (Array.isArray(state.awards)) {
          const index = state.awards.findIndex(award => award.id === action.payload.id);
          if (index !== -1) {
            state.awards[index] = action.payload;
          }
        } else {
          state.awards = [action.payload];
        }
        state.error = null;
      })
      .addCase(updateAward.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setLoading } = awardSlice.actions;
export default awardSlice.reducer;