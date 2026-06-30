'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSeoData, createSeoEntry, updateSeoEntry, deleteSeoEntry, clearSeoError } from '@/store/slices/seoSlice';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Modal from '@/components/UI/Modal';
import Input from '@/components/UI/Input';
import Textarea from '@/components/UI/Textarea';
import { Edit, Loader2, AlertCircle, Globe, Plus, Trash2 } from 'lucide-react';

// Safely render any value in JSX to avoid passing raw objects as children
const safeRender = (value) => {
  if (value == null) return '';
  if (typeof value === 'string' || typeof value === 'number') return value;
  // Fallback for objects/arrays/other types
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
};

const SeoPage = () => {
  const dispatch = useDispatch();
  const { items, loading, createLoading, updateLoading, deleteLoading, error } = useSelector((state) => state.seo);
  const { isDark } = useSelector((state) => state.theme);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    page_url: '',
    seotitle: '',
    seokeyword: '',
    seodiscr: '',
  });

  useEffect(() => {
    dispatch(fetchSeoData());
  }, [dispatch]);

  const openCreateModal = () => {
    setEditingItem(null);
    setFormData({
      page_url: '',
      seotitle: '',
      seokeyword: '',
      seodiscr: '',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setFormData({
      page_url: item.page_url || '',
      seotitle: item.seotitle || '',
      seokeyword: item.seokeyword || '',
      seodiscr: item.seodiscr || '',
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
    setFormData({
      page_url: '',
      seotitle: '',
      seokeyword: '',
      seodiscr: '',
    });
    dispatch(clearSeoError());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingItem) {
        await dispatch(
          updateSeoEntry({
            id: editingItem.id,
            ...formData,
          })
        ).unwrap();
      } else {
        await dispatch(
          createSeoEntry({
            ...formData,
          })
        ).unwrap();
      }

      // Always refetch the latest SEO data so the table reflects updates/creates
      await dispatch(fetchSeoData());

      closeModal();
    } catch (err) {
      console.error('Failed to save SEO entry:', err);
    }
  };

  const handleDelete = async (id) => {
    if (!id) return;
    const confirmed = window.confirm('Are you sure you want to delete this SEO entry?');
    if (!confirmed) return;

    try {
      await dispatch(deleteSeoEntry(id)).unwrap();
    } catch (err) {
      console.error('Failed to delete SEO entry:', err);
    }
  };

  if (loading && items.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <Loader2 className={`w-12 h-12 animate-spin mx-auto mb-4 ${isDark ? 'text-primarycolor' : 'text-primarycolor'}`} />
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              Loading SEO data...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              SEO Details
            </h1>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage SEO metadata for all pages.
            </p>
          </div>
          <Button
            onClick={openCreateModal}
            className="flex items-center space-x-2"
            disabled={createLoading}
          >
            {createLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus size={20} />
            )}
            <span>{createLoading ? 'Creating...' : 'Add SEO Details'}</span>
          </Button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-600 dark:text-red-400">
              {typeof error === 'string' ? error : JSON.stringify(error)}
            </p>
          </div>
        )}

        {/* Table - match Users module layout and empty state */}
        <div className={`shadow rounded-lg overflow-x-auto ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Page URL
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  SEO Title
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  SEO Keywords
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  SEO Description
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
              {Array.isArray(items) && items.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {safeRender(item.id)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm max-w-[250px] text-primarycolor break-all truncate">
                    <div className="flex items-center space-x-2">
                      
                      <a
                        href={typeof item.page_url === 'string' ? item.page_url : '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="underline"
                      >
                        {safeRender(item.page_url)}
                      </a>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100 max-w-[150px] truncate">
                    {safeRender(item.seotitle)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-700 dark:text-gray-300 max-w-[150px] truncate">
                    {safeRender(item.seokeyword)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-700 dark:text-gray-300 max-w-[200px] truncate">
                    {safeRender(item.seodiscr)}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-right text-sm space-x-2">
                    <button                      
                      onClick={() => openEditModal(item)}
                      disabled={updateLoading && editingItem?.id === item.id}
                      className="inline-flex items-center space-x-1"
                    >
                      {updateLoading && editingItem?.id === item.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Edit className="w-4 h-4" />
                      )}
                     
                    </button>
                    <button
                      
                      onClick={() => handleDelete(item.id)}
                      disabled={deleteLoading}
                      className="inline-flex items-center space-x-1 text-red-600 hover:text-red-700"
                    >
                      {deleteLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 size={18} />
                      )}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Empty state box, similar to Users module */}
          {(!Array.isArray(items) || items.length === 0) && !loading && (
            <div className="text-center py-12">
              <Globe
                className={`w-12 h-12 mx-auto mb-4 ${
                  isDark ? 'text-gray-600' : 'text-gray-400'
                }`}
              />
              <h3
                className={`text-lg font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}
              >
                No SEO Records Found
              </h3>
              <p
                className={`mt-1 text-sm ${
                  isDark ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                Click &quot;Add SEO Details&quot; to create the first SEO record.
              </p>
            </div>
          )}
        </div>

        {/* Edit Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingItem ? 'Edit SEO Details' : 'Add SEO Details'}
          className="max-w-3xl"
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Page URL"
              type="url"
              value={formData.page_url}
              onChange={(e) => setFormData({ ...formData, page_url: e.target.value })}
              placeholder="https://www.nxgmarkets.com/"
              required={!editingItem}
              disabled={!!editingItem}
            />
            <Input
              label="SEO Title"
              value={formData.seotitle}
              onChange={(e) => setFormData({ ...formData, seotitle: e.target.value })}
              placeholder="Enter SEO title"
              required
            />
            <Textarea
              label="SEO Description"
              value={formData.seodiscr}
              onChange={(e) => setFormData({ ...formData, seodiscr: e.target.value })}
              placeholder="Enter SEO description"
              rows={3}
              required
            />
            <Textarea
              label="SEO Keywords"
              value={formData.seokeyword}
              onChange={(e) => setFormData({ ...formData, seokeyword: e.target.value })}
              placeholder="Enter SEO keywords separated by commas"
              rows={2}
            />

            <div className="flex justify-end space-x-3 mt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={closeModal}
                disabled={updateLoading}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateLoading}
                className="flex items-center space-x-2"
              >
                {updateLoading && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                <span>{updateLoading ? 'Saving...' : 'Save Changes'}</span>
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default SeoPage;
