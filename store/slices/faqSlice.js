import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api';

const normalizeFaq = (faq) => ({
  id: faq.id ?? faq.faq_id ?? faq._id,
  question: faq.question || faq.faq_question || faq.title || '',
  answer: faq.answer || faq.faq_answer || faq.description || '',
  category: faq.category || faq.faq_category || faq.type || 'General',
  // keep raw in case the UI needs extra fields later
  _raw: faq,
});

const extractCategories = (faqs = []) => {
  const unique = new Set();
  faqs.forEach((faq) => {
    if (faq.category) unique.add(faq.category);
  });
  return Array.from(unique);
};

export const fetchFaqs = createAsyncThunk(
  'faq/fetchFaqs',
  async ({ category } = {}, { rejectWithValue }) => {
    try {
      const endpoint = category ? `/faqs/?category=${encodeURIComponent(category)}` : '/faqs/';
      const response = await apiClient.request(endpoint);

      const faqArray = Array.isArray(response?.data)
        ? response.data
        : Array.isArray(response)
          ? response
          : [];

      const normalized = faqArray.map(normalizeFaq);

      return {
        faqs: normalized,
        category: category || 'all',
      };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch FAQs');
    }
  }
);

export const createFaq = createAsyncThunk(
  'faq/createFaq',
  async (faqData, { rejectWithValue }) => {
    try {
      const payload = {
        question: faqData.question,
        answer: faqData.answer,
        category: faqData.category || 'General',
      };

      const response = await apiClient.request('/faqs/', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const created = response?.data ?? response;
      return normalizeFaq(created);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create FAQ');
    }
  }
);

export const updateFaq = createAsyncThunk(
  'faq/updateFaq',
  async ({ id, ...faqData }, { rejectWithValue }) => {
    try {
      const payload = {
        question: faqData.question,
        answer: faqData.answer,
        category: faqData.category,
      };

      const response = await apiClient.request(`/faqs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload),
      });

      const updated = response?.data ?? response;
      return normalizeFaq(updated);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update FAQ');
    }
  }
);

const initialState = {
  items: [],
  categories: [],
  activeCategory: 'all',
  loading: false,
  createLoading: false,
  updateLoading: false,
  error: null,
};

const faqSlice = createSlice({
  name: 'faq',
  initialState,
  reducers: {
    clearFaqError: (state) => {
      state.error = null;
    },
    setActiveCategory: (state, action) => {
      state.activeCategory = action.payload || 'all';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFaqs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFaqs.fulfilled, (state, action) => {
        state.loading = false;
        state.items = Array.isArray(action.payload.faqs) ? action.payload.faqs : [];
        state.activeCategory = action.payload.category || 'all';
        // Only refresh the categories list when fetching without a category filter
        if (!action.payload.category || action.payload.category === 'all') {
          state.categories = extractCategories(state.items);
        }
      })
      .addCase(fetchFaqs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(createFaq.pending, (state) => {
        state.createLoading = true;
        state.error = null;
      })
      .addCase(createFaq.fulfilled, (state, action) => {
        state.createLoading = false;
        const created = action.payload;
        if (created) {
          // Add to current view if it matches the active tab or the tab is "all"
          if (state.activeCategory === 'all' || state.activeCategory === created.category) {
            state.items = [created, ...state.items];
          }
          if (!state.categories.includes(created.category)) {
            state.categories.push(created.category);
          }
        }
      })
      .addCase(createFaq.rejected, (state, action) => {
        state.createLoading = false;
        state.error = action.payload;
      })

      .addCase(updateFaq.pending, (state) => {
        state.updateLoading = true;
        state.error = null;
      })
      .addCase(updateFaq.fulfilled, (state, action) => {
        state.updateLoading = false;
        const updated = action.payload;
        if (updated && updated.id != null) {
          const index = state.items.findIndex((faq) => faq.id === updated.id);
          if (index !== -1) {
            state.items[index] = updated;
          }
          if (!state.categories.includes(updated.category)) {
            state.categories.push(updated.category);
          }
        }
      })
      .addCase(updateFaq.rejected, (state, action) => {
        state.updateLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearFaqError, setActiveCategory } = faqSlice.actions;
export default faqSlice.reducer;
