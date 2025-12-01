import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { apiClient } from "@/lib/api";

// Helper function to normalize blog data from API
const normalizeBlogData = (blog) => {
  return {
    id: blog.id,
    title: blog.blog_title || blog.title,
    content: blog.content || blog.content_preview || "",
    summary: blog.summary || blog.content_preview || "",
    author: blog.author || {},
    slug: blog.slug,
    tags: blog.tags || "",
    status: blog.status || "published",
    seo_title: blog.seotitle || blog.seo_title || "",
    seo_description: blog.seodiscr || blog.seo_description || "",
    seo_keywords: blog.seokeyword || blog.seo_keywords || "",
    image_url: blog.blogimage || blog.image_url,
    category_id: blog.category_id,
    subcategory_id: blog.subcategory_id,
    read_time: blog.read_time || 0,
    created_at: blog.created_at,
    updated_at: blog.updated_at,
    image_url: blog.blogimage,
    // Keep original fields for reference
    _original: blog,
  };
};

// Async thunks for blog operations
export const fetchBlogs = createAsyncThunk(
  "blog/fetchBlogs",
  async ({ page = 1, limit = 10 } = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.request(`/blogs`);

      let blogs = [];

      if (response.blogs && Array.isArray(response.blogs)) {
        blogs = response.blogs.map(normalizeBlogData);
      } else if (Array.isArray(response.data)) {
        blogs = response.data.map(normalizeBlogData);
      } else if (Array.isArray(response)) {
        blogs = response.map(normalizeBlogData);
      }

      return {
        blogs,
        pagination: {
          total: response.total || response.pagination?.total || blogs.length,
          page: response.page || page,
          limit: response.limit || limit,
          totalPages:
            response.totalPages ||
            response.pagination?.totalPages ||
            Math.ceil(blogs.length / limit),
        },
      };
    } catch (error) {
      return rejectWithValue(error.message || "Failed to fetch blogs");
    }
  }
);

export const createBlog = createAsyncThunk(
  "blog/createBlog",
  async (blogData, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      // Map normalized field names to API field names
      const fieldMapping = {
        title: "blog_title",
        author: "blogname", // Map author to blogname as expected by API
        seo_title: "seotitle",
        seo_description: "seodiscr",
        seo_keywords: "seokeyword",
      };

      for (const key in blogData) {
        if (key === "images") {
          if (blogData.images && blogData.images.length > 0) {
            formData.append("blogimage", blogData.images[0]);
          }
        } else {
          // Use mapped field name if available, otherwise use original key
          const apiFieldName = fieldMapping[key] || key;
          formData.append(apiFieldName, blogData[key]);
        }
      }

      const response = await apiClient.request("/blogs", {
        method: "POST",
        body: formData,
      });
      console.log("Create blog response:", response);
      const rawBlog = response.blog || response.data || response;
      return normalizeBlogData(rawBlog);
    } catch (error) {
      console.error("Create blog error:", error);
      return rejectWithValue(error.message || "Failed to create blog");
    }
  }
);

export const updateBlog = createAsyncThunk(
  "blog/updateBlog",
  async ({ id, ...blogData }, { rejectWithValue }) => {
    try {
      const formData = new FormData();

      // Map normalized field names to API field names
      const fieldMapping = {
        title: "blog_title",
        author: "blogname", // Map author to blogname as expected by API
        seo_title: "seotitle",
        seo_description: "seodiscr",
        seo_keywords: "seokeyword",
      };

      Object.keys(blogData).forEach((key) => {
        const value = blogData[key];
        if (value === undefined || value === null) {
          return;
        }

        if (key === "images") {
          if (Array.isArray(value) && value.length > 0) {
            formData.append("blogimage", value[0]);
          }
          return;
        }

        const apiFieldName = fieldMapping[key] || key;
        formData.append(apiFieldName, value);
      });

      // Some backends expect POST with _method override for multipart updates
      formData.append("_method", "PUT");

      const response = await apiClient.request(`/blogs/${id}`, {
        method: "POST",
        body: formData,
      });
      const rawBlog = response.blog || response.data || response;
      return normalizeBlogData(rawBlog);
    } catch (error) {
      return rejectWithValue(error.message || "Failed to update blog");
    }
  }
);

export const deleteBlog = createAsyncThunk(
  "blog/deleteBlog",
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.request(`/blogs/${id}`, {
        method: "DELETE",
      });
      return id;
    } catch (error) {
      return rejectWithValue(error.message || "Failed to delete blog");
    }
  }
);

const initialState = {
  blogs: [],
  pagination: {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  },
  loading: false,
  error: null,
  totalBlog: 0,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
};

const blogSlice = createSlice({
  name: "blog",
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
        state.blogs = Array.isArray(action.payload.blogs)
          ? action.payload.blogs
          : [];
        state.totalBlog = action.payload.pagination.total;
        state.pagination = action.payload.pagination || initialState.pagination;
        state.error = null;
      })
      .addCase(fetchBlogs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

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
      });

    // Update blog
    builder
      .addCase(updateBlog.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateBlog.fulfilled, (state, action) => {
        state.updateLoading = false;
        if (Array.isArray(state.blogs)) {
          const index = state.blogs.findIndex(
            (blog) => blog.id === action.payload.id
          );
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
      });

    // Delete blog
    builder
      .addCase(deleteBlog.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteBlog.fulfilled, (state, action) => {
        state.deleteLoading = false;
        if (Array.isArray(state.blogs)) {
          state.blogs = state.blogs.filter(
            (blog) => blog.id !== action.payload
          );
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
