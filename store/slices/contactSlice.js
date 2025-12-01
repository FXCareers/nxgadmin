import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/lib/api';

const normalizeContact = (contact) => {
  if (!contact) return null;

  const fullName =
    contact.name ||
    contact.fullName ||
    [contact.fname, contact.lname].filter(Boolean).join(' ').trim();

  return {
    id: contact.id,
    name: fullName || 'Unknown contact',
    email: contact.email || '',
    phone: contact.phone || contact.mobile || '',
    subject: contact.subject || contact.companyName || '',
    message: contact.message || contact.content || '',
    created_at: contact.created_at || contact.createdAt,
    updated_at: contact.updated_at || contact.updatedAt,
    raw: contact,
  };
};

const extractContacts = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.contacts)) {
    return response.contacts;
  }

  return [];
};

// Async thunk for fetching all contacts
export const fetchContacts = createAsyncThunk(
  'contact/fetchContacts',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.request('/contact', {
        method: 'GET',
      });

      return extractContacts(response).map(normalizeContact).filter(Boolean);
    } catch (error) {
      console.error('Fetch contacts error:', error);
      return rejectWithValue(error.message || 'Failed to fetch contacts');
    }
  }
);

// Fetch single contact by id
export const fetchContactById = createAsyncThunk(
  'contact/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      if (!id) throw new Error('Contact id is required');

      const response = await apiClient.request(`/contact/${id}`, {
        method: 'GET',
      });

      return normalizeContact(response?.data || response);
    } catch (error) {
      console.error('Fetch contact by id error:', error);
      return rejectWithValue(error.message || 'Failed to fetch contact');
    }
  }
);

// Delete contact
export const deleteContact = createAsyncThunk(
  'contact/delete',
  async (id, { rejectWithValue }) => {
    try {
      if (!id) throw new Error('Contact id is required');

      await apiClient.request(`/contact/${id}`, {
        method: 'DELETE',
      });

      return id;
    } catch (error) {
      console.error('Delete contact error:', error);
      return rejectWithValue(error.message || 'Failed to delete contact');
    }
  }
);

const initialState = {
  contacts: [],
  selectedContact: null,
  loading: false,
  detailLoading: false,
  deleteLoading: false,
  totalContact: 0,
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
    builder
      // Fetch contacts
      .addCase(fetchContacts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.loading = false;
        state.contacts = Array.isArray(action.payload) ? action.payload : [];
        state.totalContact = state.contacts.length;
        state.error = null;
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch contact by id
      .addCase(fetchContactById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchContactById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.selectedContact = action.payload;
        state.error = null;
      })
      .addCase(fetchContactById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })

      // Delete contact
      .addCase(deleteContact.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteContact.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.contacts = state.contacts.filter(
          (contact) => contact.id !== action.payload
        );
        state.totalContact = state.contacts.length;
        if (state.selectedContact?.id === action.payload) {
          state.selectedContact = null;
        }
        state.error = null;
      })
      .addCase(deleteContact.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setLoading } = contactSlice.actions;
export default contactSlice.reducer;