'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  fetchLeads,
  deleteLead,
  updateLeadStatus,
  exportLeadsCsv,
  clearError,
} from '@/store/slices/leadSlice';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Pagination from '@/components/UI/Pagination';
import {
  Users,
  Phone,
  Globe,
  Calendar,
  User,
  Tag,
  Link2,
  Loader2,
  AlertCircle,
  Trash2,
  Download,
} from 'lucide-react';

const STATUSES = ['new', 'contacted', 'converted', 'rejected'];

const STATUS_STYLES = {
  new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  contacted: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300',
  converted: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  rejected: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
};

const ITEMS_PER_PAGE = 9;

const LeadsPage = () => {
  const dispatch = useDispatch();
  const { leads, loading, error, deleteLoading, statusLoadingId, exportLoading } = useSelector(
    (state) => state.lead
  );
  const { isDark } = useSelector((state) => state.theme);

  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('all');
  const [pendingDeleteId, setPendingDeleteId] = useState(null);

  useEffect(() => {
    dispatch(fetchLeads());
    return () => {
      dispatch(clearError());
    };
  }, [dispatch]);

  const filteredLeads = useMemo(() => {
    if (!Array.isArray(leads)) return [];
    if (statusFilter === 'all') return leads;
    return leads.filter((l) => l.status === statusFilter);
  }, [leads, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  const totalItems = filteredLeads.length;
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentLeads = useMemo(
    () => filteredLeads.slice(startIndex, startIndex + ITEMS_PER_PAGE),
    [filteredLeads, startIndex]
  );

  const monthlyLeads = useMemo(() => {
    if (!Array.isArray(leads)) return 0;
    const now = new Date();
    return leads.filter((l) => {
      const d = new Date(l.created_at);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    }).length;
  }, [leads]);

  const newLeads = useMemo(
    () => (Array.isArray(leads) ? leads.filter((l) => l.status === 'new').length : 0),
    [leads]
  );

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleExport = () => {
    dispatch(exportLeadsCsv(statusFilter === 'all' ? {} : { status: statusFilter }));
  };

  const handleStatusChange = (id, status) => {
    dispatch(updateLeadStatus({ id, status }));
  };

  const handleDelete = async (id) => {
    if (!id) return;
    if (!window.confirm('Delete this lead? This action cannot be undone.')) return;
    setPendingDeleteId(id);
    try {
      await dispatch(deleteLead(id)).unwrap();
    } catch (err) {
      console.error('Failed to delete lead:', err);
    } finally {
      setPendingDeleteId(null);
    }
  };

  if (loading && leads.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4 text-primarycolor" />
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Loading leads...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-wrap gap-4 justify-between items-center">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Leads</h1>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              IB link requests and landing-page lead submissions
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={handleExport}
              disabled={exportLoading || totalItems === 0}
              variant="outline"
              className="gap-2"
            >
              {exportLoading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              <span>{exportLoading ? 'Exporting...' : 'Export CSV'}</span>
            </Button>
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-primarycolor" />
              <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                {Array.isArray(leads) ? leads.length : 0}
              </span>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Leads</p>
                <p className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  {Array.isArray(leads) ? leads.length : 0}
                </p>
              </div>
              <div className={`p-3 rounded-full ${isDark ? 'bg-blue-900' : 'bg-blue-100'}`}>
                <Users className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>This Month</p>
                <p className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{monthlyLeads}</p>
              </div>
              <div className={`p-3 rounded-full ${isDark ? 'bg-green-900' : 'bg-green-100'}`}>
                <Calendar className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>New / Unactioned</p>
                <p className={`text-2xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>{newLeads}</p>
              </div>
              <div className={`p-3 rounded-full ${isDark ? 'bg-yellow-900' : 'bg-yellow-100'}`}>
                <Tag className="w-6 h-6 text-primarydarkcolor" />
              </div>
            </div>
          </Card>
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap gap-2">
          {['all', ...STATUSES].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium capitalize transition-colors ${
                statusFilter === s
                  ? 'bg-primarycolor text-black'
                  : isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Grid */}
        {totalItems === 0 && !loading ? (
          <Card className="p-12 text-center">
            <Users className={`w-16 h-16 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
            <h3 className={`text-xl font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              No Leads {statusFilter !== 'all' ? `(${statusFilter})` : 'Yet'}
            </h3>
            <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Leads will appear here when the landing-page forms are submitted.
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentLeads.map((lead) => (
              <Card key={lead.id} className="p-6 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isDark ? 'bg-primarydarkcolor text-black' : 'bg-primarycolor text-black'
                      }`}
                    >
                      <User size={20} />
                    </div>
                    <div className="min-w-0">
                      <h3 className={`text-lg font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {lead.name}
                      </h3>
                      {lead.source && (
                        <p className={`text-sm truncate ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {lead.source}
                        </p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize flex-shrink-0 ${
                      STATUS_STYLES[lead.status] || STATUS_STYLES.new
                    }`}
                  >
                    {lead.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Phone size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    <a
                      href={`tel:${lead.phone}`}
                      className={`${isDark ? 'text-gray-300' : 'text-gray-700'} hover:underline`}
                    >
                      {lead.phone || 'N/A'}
                    </a>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Globe size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{lead.country || 'N/A'}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Tag size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>
                      IB: {lead.ib_name || '—'}
                      {lead.intent ? ` · ${lead.intent}` : ''}
                    </span>
                  </div>
                  {lead.page_url && (
                    <div className="flex items-center space-x-2">
                      <Link2 size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                      <a
                        href={lead.page_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primarydarkcolor hover:underline truncate"
                      >
                        {lead.page_url}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    <span className={isDark ? 'text-gray-400' : 'text-gray-500'}>{formatDate(lead.created_at)}</span>
                  </div>
                </div>

                <div className="mt-auto flex items-center gap-2">
                  <select
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                    disabled={statusLoadingId === lead.id}
                    className={`flex-1 text-sm rounded-md border px-2 py-2 capitalize transition-colors ${
                      isDark
                        ? 'bg-gray-800 border-gray-600 text-white'
                        : 'bg-white border-gray-300 text-gray-800'
                    } ${statusLoadingId === lead.id ? 'opacity-60' : ''}`}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s} className="capitalize">
                        {s}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleDelete(lead.id)}
                    disabled={deleteLoading && pendingDeleteId === lead.id}
                    title="Delete lead"
                    className={`inline-flex items-center justify-center p-2 rounded-md border transition-colors ${
                      isDark
                        ? 'border-red-700 text-red-400 hover:bg-red-900/30'
                        : 'border-red-200 text-red-600 hover:bg-red-50'
                    } ${deleteLoading && pendingDeleteId === lead.id ? 'opacity-60 cursor-not-allowed' : ''}`}
                  >
                    {deleteLoading && pendingDeleteId === lead.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalItems > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={ITEMS_PER_PAGE}
            onPageChange={setCurrentPage}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default LeadsPage;
