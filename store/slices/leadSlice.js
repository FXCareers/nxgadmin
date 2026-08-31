import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient, BASE_URL } from '@/lib/api';

const normalizeLead = (lead) => {
  if (!lead) return null;
  return {
    id: lead.id,
    name: lead.name || 'Unknown lead',
    phone: lead.phone || '',
    country: lead.country || '',
    ib_name: lead.ib_name || lead.ibName || '',
    source: lead.source || '',
    intent: lead.intent || '',
    page_url: lead.page_url || lead.pageUrl || '',
    status: lead.status || 'new',
    created_at: lead.created_at || lead.createdAt,
    updated_at: lead.updated_at || lead.updatedAt,
    raw: lead,
  };
};

const extractLeads = (response) => {
  if (Array.isArray(response)) return response;
  if (Array.isArray(response?.data)) return response.data;
  if (Array.isArray(response?.leads)) return response.leads;
  return [];
};

const buildQuery = ({ status, source, limit = 1000 } = {}) => {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (source) params.set('source', source);
  if (limit) params.set('limit', String(limit));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
};

// Fetch all leads
export const fetchLeads = createAsyncThunk(
  'lead/fetchLeads',
  async (filters = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.request(`/leads${buildQuery(filters)}`, { method: 'GET' });
      return extractLeads(response).map(normalizeLead).filter(Boolean);
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch leads');
    }
  }
);

// Update a lead's status
export const updateLeadStatus = createAsyncThunk(
  'lead/updateStatus',
  async ({ id, status }, { rejectWithValue }) => {
    try {
      if (!id) throw new Error('Lead id is required');
      await apiClient.request(`/leads/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      return { id, status };
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update lead status');
    }
  }
);

// Delete a lead
export const deleteLead = createAsyncThunk(
  'lead/delete',
  async (id, { rejectWithValue }) => {
    try {
      if (!id) throw new Error('Lead id is required');
      await apiClient.request(`/leads/${id}`, { method: 'DELETE' });
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete lead');
    }
  }
);

// Export leads to CSV (blob download — the API returns text/csv, not JSON)
export const exportLeadsCsv = createAsyncThunk(
  'lead/exportCsv',
  async ({ status, source } = {}, { rejectWithValue }) => {
    try {
      const token = apiClient.getToken();
      const params = new URLSearchParams();
      if (status) params.set('status', status);
      if (source) params.set('source', source);
      const qs = params.toString();

      const res = await fetch(`${BASE_URL}/leads/export/csv${qs ? `?${qs}` : ''}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        let msg = `Export failed (${res.status})`;
        try {
          const j = await res.json();
          msg = j.message || j.error || msg;
        } catch (_) {
          /* non-JSON error body */
        }
        throw new Error(msg);
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `leads-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      return true;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to export leads');
    }
  }
);

const initialState = {
  leads: [],
  loading: false,
  deleteLoading: false,
  statusLoadingId: null,
  exportLoading: false,
  totalLeads: 0,
  error: null,
};

const leadSlice = createSlice({
  name: 'lead',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchLeads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLeads.fulfilled, (state, action) => {
        state.loading = false;
        state.leads = Array.isArray(action.payload) ? action.payload : [];
        state.totalLeads = state.leads.length;
      })
      .addCase(fetchLeads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(updateLeadStatus.pending, (state, action) => {
        state.statusLoadingId = action.meta.arg?.id ?? null;
        state.error = null;
      })
      .addCase(updateLeadStatus.fulfilled, (state, action) => {
        state.statusLoadingId = null;
        const lead = state.leads.find((l) => l.id === action.payload.id);
        if (lead) lead.status = action.payload.status;
      })
      .addCase(updateLeadStatus.rejected, (state, action) => {
        state.statusLoadingId = null;
        state.error = action.payload;
      })

      .addCase(deleteLead.pending, (state) => {
        state.deleteLoading = true;
        state.error = null;
      })
      .addCase(deleteLead.fulfilled, (state, action) => {
        state.deleteLoading = false;
        state.leads = state.leads.filter((l) => l.id !== action.payload);
        state.totalLeads = state.leads.length;
      })
      .addCase(deleteLead.rejected, (state, action) => {
        state.deleteLoading = false;
        state.error = action.payload;
      })

      .addCase(exportLeadsCsv.pending, (state) => {
        state.exportLoading = true;
        state.error = null;
      })
      .addCase(exportLeadsCsv.fulfilled, (state) => {
        state.exportLoading = false;
      })
      .addCase(exportLeadsCsv.rejected, (state, action) => {
        state.exportLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = leadSlice.actions;
export default leadSlice.reducer;
