import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api';

// Async thunks for career operations
export const fetchCareers = createAsyncThunk(
  'career/fetchCareers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.request('/job-postings/admin/view');
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch job postings');
    }
  }
);

export const createCareer = createAsyncThunk(
  'career/createCareer',
  async (careerData, { rejectWithValue }) => {
    try {
      const response = await apiClient.request('/job-postings', {
        method: 'POST',
        body: JSON.stringify(careerData),
      });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create job posting');
    }
  }
);

export const updateCareer = createAsyncThunk(
  'career/updateCareer',
  async ({ id, ...careerData }, { rejectWithValue }) => {
    try {
      const response = await apiClient.request(`/job-postings/${id}`, {
        method: 'PUT',
        body: JSON.stringify(careerData),
      });
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update job posting');
    }
  }
);

export const deleteCareer = createAsyncThunk(
  'career/deleteCareer',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.request(`/job-postings/${id}`, {
        method: 'DELETE',
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete job posting');
    }
  }
);

const initialState = {
  careers: [],
  loading: false,
  error: null,
  totalPosition:0,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
};

const careerSlice = createSlice({
  name: 'career',
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
    // Fetch careers
    builder
      .addCase(fetchCareers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCareers.fulfilled, (state, action) => {
        
        state.loading = false;
        state.careers = action.payload;
        state.totalPosition = action.payload.total || 0;
        state.error = null;
      })
      .addCase(fetchCareers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Create career
    builder
      .addCase(createCareer.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createCareer.fulfilled, (state, action) => {
        state.createLoading = false;
        state.careers.push(action.payload);
        state.error = null;
      })
      .addCase(createCareer.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })

    // Update career
    builder
      .addCase(updateCareer.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateCareer.fulfilled, (state, action) => {
        state.updateLoading = false;
        const index = state.careers.findIndex(career => career.id === action.payload.id);
        if (index !== -1) {
          state.careers[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateCareer.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })

    // Delete career
    builder
      .addCase(deleteCareer.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteCareer.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.careers = state.careers.filter(career => career.id !== action.payload);
        state.error = null;
      })
      .addCase(deleteCareer.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setLoading } = careerSlice.actions;
export default careerSlice.reducer;