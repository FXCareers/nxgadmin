'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchAwards, createAward, updateAward, deleteAward, clearError } from '@/store/slices/awardSlice';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Modal from '@/components/UI/Modal';
import Input from '@/components/UI/Input';
import Textarea from '@/components/UI/Textarea';
import Pagination from '@/components/UI/Pagination';
import useScreenHeight from '@/hooks/useScreenHeight';
import { Plus, Edit, Trash2, Trophy, Calendar, Building, Loader2, AlertCircle } from 'lucide-react';

const AwardsPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAward, setEditingAward] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: null,
    year: new Date().getFullYear().toString(),
    awarded_by: '',
  });

  const { awards, loading, error, createLoading, updateLoading, deleteLoading } = useSelector((state) => state.award);
  const { isDark } = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  const itemsPerPage = useScreenHeight();

  // Calculate pagination
  const totalItems = Array.isArray(awards) ? awards.length : 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAwards = useMemo(() => 
    Array.isArray(awards) ? awards.slice(startIndex, endIndex) : [], 
    [awards, startIndex, endIndex]
  );

  // Fetch awards on component mount
  useEffect(() => {
    dispatch(fetchAwards());
  }, [dispatch]);

  // Debug: Log the awards state
  useEffect(() => {
    console.log('Awards state:', awards);
    console.log('Awards is array:', Array.isArray(awards));
    console.log('Awards length:', awards?.length);
  }, [awards]);

  // Helper function to get safe image URL (copied from blog page)
  const getSafeImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    if (typeof imageUrl === 'object') {
      if (imageUrl instanceof File) {
        return URL.createObjectURL(imageUrl);
      }
      if (imageUrl.url) {
        return getSafeImageUrl(imageUrl.url);
      }
      return null;
    }
    const urlString = String(imageUrl);
    if (urlString.includes('api.yagroup.org')) {
      return `/api/proxy-image?url=${encodeURIComponent(urlString)}`;
    }
    return urlString;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const awardData = {
        ...formData,
        images: imageFile ? [imageFile] : [],
      };

      if (editingAward) {
        await dispatch(updateAward({ id: editingAward.id, ...awardData })).unwrap();
      } else {
        await dispatch(createAward(awardData)).unwrap();
      }
      resetForm();
      // Refresh the list
      dispatch(fetchAwards());
    } catch (error) {
      console.error('Error saving award:', error);
    }
  };

  const handleEdit = (award) => {
    setEditingAward(award);
    setFormData({
      title: award.title || '',
      description: null,
      year: award.year || new Date().getFullYear().toString(),
      awarded_by: award.awarded_by || '',
    });
    
    // Set image preview if award has an image
    const imageUrl = award.image_url || (award.images && award.images.length > 0 ? award.images[0].url : null);
    if (imageUrl) {
      setImagePreview(getSafeImageUrl(imageUrl));
    }
    
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this award?')) {
      try {
        await dispatch(deleteAward(id)).unwrap();
        // Refresh the list
        dispatch(fetchAwards());
      } catch (error) {
        console.error('Error deleting award:', error);
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: null,
      year: new Date().getFullYear().toString(),
      awarded_by: '',
    });
    setEditingAward(null);
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(false);
    dispatch(clearError());
  };

  const getCategoryColor = (category) => {
    switch (category?.toLowerCase()) {
      case 'technology':
        return 'bg-blue-100 text-blue-800';
      case 'innovation':
        return 'bg-green-100 text-green-800';
      case 'design':
        return 'bg-purple-100 text-purple-800';
      case 'leadership':
        return 'bg-red-100 text-red-800';
      case 'customer service':
        return 'bg-yellow-100 text-yellow-800';
      case 'sustainability':
        return 'bg-teal-100 text-teal-800';
      case 'excellence':
        return 'bg-indigo-100 text-indigo-800';
      case 'achievement':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && awards.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <Loader2 className={`w-12 h-12 animate-spin mx-auto mb-4 ${
              isDark ? 'text-yellow-400' : 'text-yellow-600'
            }`} />
            <p className={`text-lg ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Loading awards...
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
            <h1 className={`text-3xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Awards Management
            </h1>
            <p className={`mt-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Track and manage awards and recognitions
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2"
            disabled={createLoading}
          >
            {createLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Plus size={20} />
            )}
            <span>{createLoading ? 'Creating...' : 'Add Award'}</span>
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Awards Grid */}
        {(!Array.isArray(awards) || awards.length === 0) && !loading ? (
          <Card className="p-12 text-center">
            <Trophy className={`w-16 h-16 mx-auto mb-4 ${
              isDark ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <h3 className={`text-xl font-semibold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              No Awards Yet
            </h3>
            <p className={`mb-6 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Create your first award to get started
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 mx-auto"
            >
              <Plus size={20} />
              <span>Add Award</span>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(currentAwards) && currentAwards.map((award) => (
              <Card key={award.id} className="overflow-hidden transition-colors">
                {/* Award Image */}
                {(award.image_url || (award.images && award.images.length > 0)) && (
                  <div className="aspect-video bg-gray-200 dark:bg-gray-700">
                    <img
                      src={getSafeImageUrl(award.image_url || award.images[0])}
                      alt={award.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex space-x-2">
                      
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        isDark ? 'bg-gray-700 text-gray-300' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {award.year}
                      </span>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(award)}
                        disabled={updateLoading}
                        className={`p-2 rounded-lg transition-colors ${
                          isDark
                            ? 'text-gray-400 hover:text-yellow-400 hover:bg-gray-700'
                            : 'text-gray-500 hover:text-yellow-600 hover:bg-gray-100'
                        } disabled:opacity-50`}
                      >
                        {updateLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Edit size={16} />
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(award.id)}
                        disabled={deleteLoading}
                        className={`p-2 rounded-lg transition-colors ${
                          isDark
                            ? 'text-gray-400 hover:text-red-400 hover:bg-gray-700'
                            : 'text-gray-500 hover:text-red-600 hover:bg-gray-100'
                        } disabled:opacity-50`}
                      >
                        {deleteLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 size={16} />
                        )}
                      </button>
                    </div>
                  </div>
                  
                  <div className="text-center mb-4">
                    <h3 className={`text-lg font-semibold ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {award.title}
                    </h3>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center space-x-2">
                      <Building size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                      <span className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {award.awarded_by || award.organization}
                      </span>
                    </div>
                    {award.organization && award.awarded_by && award.organization !== award.awarded_by && (
                      <div className="flex items-center space-x-2">
                        <Building size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                        <span className={`text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Org: {award.organization}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                      <span className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {award.year}
                      </span>
                    </div>
                    {award.created_at && (
                      <div className="flex items-center space-x-2">
                        <Calendar size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                        <span className={`text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          Created {formatDate(award.created_at)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {Array.isArray(awards) && awards.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}

        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={resetForm}
          title={editingAward ? 'Edit Award' : 'Add New Award'}
          className="max-w-4xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <Input
                  label="Award Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter award title"
                  required
                />
                <Input
                  label="Year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  placeholder="Enter year"
                  required
                />
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <Input
                  label="Awarded By"
                  value={formData.awarded_by}
                  onChange={(e) => setFormData({ ...formData, awarded_by: e.target.value })}
                  placeholder="Enter who awarded this"
                  required
                />
                
                {/* Image Upload */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Award Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 ${
                      isDark 
                        ? 'bg-gray-800 border-gray-600 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    }`}
                  />
                  {imagePreview && (
                    <div className="mt-2">
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <Button variant="secondary" onClick={resetForm} disabled={createLoading || updateLoading}>
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createLoading || updateLoading}
                className="flex items-center space-x-2"
              >
                {(createLoading || updateLoading) && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                <span>
                  {editingAward 
                    ? (updateLoading ? 'Updating...' : 'Update Award')
                    : (createLoading ? 'Creating...' : 'Create Award')
                  }
                </span>
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default AwardsPage;
