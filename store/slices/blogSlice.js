import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api';

// Async thunks for blog operations
export const fetchBlogs = createAsyncThunk(
  'blog/fetchBlogs',
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.request(`/blogs?page=${page}&limit=${limit}`);
      
      if (response.blogs && Array.isArray(response.blogs)) {
        return {
          blogs: response.blogs,
          pagination: {
            total: response.total || response.pagination?.total || response.blogs.length,
            page: response.page || page,
            limit: response.limit || limit,
            totalPages: response.totalPages || response.pagination?.totalPages || 1
          }
        };
      } else if (Array.isArray(response.data)) {
        return { blogs: response.data, pagination: { total: response.data.length, page, limit, totalPages: 1 } };
      } else if (Array.isArray(response)) {
        return { blogs: response, pagination: { total: response.length, page, limit, totalPages: 1 } };
      } else {
        return { blogs: [], pagination: { total: 0, page, limit, totalPages: 1 } };
      }
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch blogs');
    }
  }
);

export const createBlog = createAsyncThunk(
  'blog/createBlog',
  async (blogData, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      for (const key in blogData) {
        if (key === 'images') {
          if (blogData.images && blogData.images.length > 0) {
            formData.append('images', blogData.images[0]);
          }
        } else {
          formData.append(key, blogData[key]);
        }
      }

      const response = await apiClient.request('/blogs', {
        method: 'POST',
        body: formData,
      });
      console.log('Create blog response:', response);
      return response.blog || response.data || response;
    } catch (error) {
      console.error('Create blog error:', error);
      return rejectWithValue(error.message || 'Failed to create blog');
    }
  }
);

export const updateBlog = createAsyncThunk(
  'blog/updateBlog',
  async ({ id, ...blogData }, { rejectWithValue }) => {
    try {
      const formData = new FormData();
      for (const key in blogData) {
        if (key === 'images') {
          if (blogData.images && blogData.images.length > 0) {
            formData.append('images', blogData.images[0]);
          }
        } else {
          formData.append(key, blogData[key]);
        }
      }

      const response = await apiClient.request(`/blogs/${id}`, {
        method: 'PUT',
        body: formData,
      });
      return response.blog || response.data || response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update blog');
    }
  }
);

export const deleteBlog = createAsyncThunk(
  'blog/deleteBlog',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.request(`/blogs/${id}`, {
        method: 'DELETE',
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete blog');
    }
  }
);

const initialState = {
  blogs: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1
  },
  loading: false,
  error: null,
  totalBlog:0,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
};

const blogSlice = createSlice({
  name: 'blog',
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
    // Fetch blogs
    builder
      .addCase(fetchBlogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBlogs.fulfilled, (state, action) => {
        state.loading = false;
        state.blogs = Array.isArray(action.payload.blogs) ? action.payload.blogs : [];
        state.totalBlog = action.payload.pagination.total;
        state.pagination = action.payload.pagination || initialState.pagination;
        state.error = null;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // Create blog
    builder
      .addCase(createBlog.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createBlog.fulfilled, (state, action) => {
        state.createLoading = false;
        if (Array.isArray(state.blogs)) {
          state.blogs.unshift(action.payload);
        } else {
          state.blogs = [action.payload];
        }
        state.error = null;
      })
      .addCase(createBlog.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })

    // Update blog
    builder
      .addCase(updateBlog.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateBlog.fulfilled, (state, action) => {
        state.updateLoading = false;
        if (Array.isArray(state.blogs)) {
          const index = state.blogs.findIndex(blog => blog.id === action.payload.id);
          if (index !== -1) {
            state.blogs[index] = action.payload;
          }
        } else {
          state.blogs = [action.payload];
        }
        state.error = null;
      })
      .addCase(updateBlog.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      })

    // Delete blog
    builder
      .addCase(deleteBlog.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.deleteLoading = false;
        if (Array.isArray(state.blogs)) {
          state.blogs = state.blogs.filter(blog => blog.id !== action.payload);
        }
        state.error = null;
      })
      .addCase(deleteBlog.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setLoading } = blogSlice.actions;
export default blogSlice.reducer;
