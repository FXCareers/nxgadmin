'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchCareers, createCareer, updateCareer, deleteCareer, clearError } from '@/store/slices/careerSlice';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Modal from '@/components/UI/Modal';
import Input from '@/components/UI/Input';
import Select from '@/components/UI/Select';
import Textarea from '@/components/UI/Textarea';
import Pagination from '@/components/UI/Pagination';
import useScreenHeight from '@/hooks/useScreenHeight';
import { Plus, Edit, Trash2, MapPin, Clock, DollarSign, Briefcase, Loader2, AlertCircle } from 'lucide-react';

const CareersPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCareer, setEditingCareer] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    job_type: 'full-time',
    experience_level: 'entry',
    description: '',
    roles_and_responsibilities: ''
  });

  const { careers, loading, error, createLoading, updateLoading, deleteLoading } = useSelector((state) => state.career);
  const { isDark } = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  const itemsPerPage = useScreenHeight();

  // Calculate pagination
  const totalItems = careers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentCareers = useMemo(() => 
    careers.slice(startIndex, endIndex), 
    [careers, startIndex, endIndex]
  );

  const jobTypeOptions = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' }
  ];

  const experienceLevelOptions = [
    { value: 'entry', label: 'Entry Level' },
    { value: 'mid', label: 'Mid Level' },
    { value: 'senior', label: 'Senior Level' },
    { value: 'executive', label: 'Executive' }
  ];

  // Fetch careers on component mount
  useEffect(() => {
    dispatch(fetchCareers());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCareer) {
        await dispatch(updateCareer({ id: editingCareer.id, ...formData })).unwrap();
      } else {
        await dispatch(createCareer(formData)).unwrap();
      }
      resetForm();
      // Refresh the list
      dispatch(fetchCareers());
    } catch (error) {
      console.error('Error saving career:', error);
    }
  };

  const handleEdit = (career) => {
    setEditingCareer(career);
    setFormData({
      title: career.title || '',
      department: career.department || '',
      location: career.location || '',
      job_type: career.job_type || 'full-time',
      experience_level: career.experience_level || 'entry',
      description: career.description || '',
      roles_and_responsibilities: career.roles_and_responsibilities || ''
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this job posting?')) {
      try {
        await dispatch(deleteCareer(id)).unwrap();
        // Refresh the list
        dispatch(fetchCareers());
      } catch (error) {
        console.error('Error deleting career:', error);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      department: '',
      location: '',
      job_type: 'full-time',
      experience_level: 'entry',
      description: '',
      roles_and_responsibilities: ''
    });
    setEditingCareer(null);
    setIsModalOpen(false);
    dispatch(clearError());
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'full-time':
        return 'bg-blue-100 text-blue-800';
      case 'part-time':
        return 'bg-purple-100 text-purple-800';
      case 'contract':
        return 'bg-orange-100 text-orange-800';
      case 'internship':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getExperienceColor = (level) => {
    switch (level) {
      case 'entry':
        return 'bg-green-100 text-green-800';
      case 'mid':
        return 'bg-blue-100 text-blue-800';
      case 'senior':
        return 'bg-purple-100 text-purple-800';
      case 'lead':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading && careers.length === 0) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-64">
          <div className="text-center">
            <Loader2 className={`w-12 h-12 animate-spin mx-auto mb-4 ${
              isDark ? 'text-primarycolor' : 'text-primarycolor'
            }`} />
            <p className={`text-lg ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Loading job postings...
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
              Career Management
            </h1>
            <p className={`mt-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Manage job postings and career opportunities
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
            <span>{createLoading ? 'Creating...' : 'Add Position'}</span>
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

        {/* Career Grid */}
        {careers.length === 0 && !loading ? (
          <Card className="p-12 text-center">
            <Briefcase className={`w-16 h-16 mx-auto mb-4 ${
              isDark ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <h3 className={`text-xl font-semibold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              No Job Postings Yet
            </h3>
            <p className={`mb-6 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Create your first job posting to get started
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 mx-auto"
            >
              <Plus size={20} />
              <span>Add Position</span>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCareers.map((career) => (
              <Card key={career.id} className="p-6 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      isDark ? 'bg-gray-700 text-gray-300' : getStatusColor(career.posting_status)
                    }`}>
                      {career.posting_status || 'Active'}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      isDark ? 'bg-gray-700 text-gray-300' : getTypeColor(career.job_type)
                    }`}>
                      {career.job_type?.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Full-time'}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      isDark ? 'bg-gray-700 text-gray-300' : getExperienceColor(career.experience_level)
                    }`}>
                      {career.experience_level?.replace(/\b\w/g, l => l.toUpperCase()) || 'Entry'}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(career)}
                      disabled={updateLoading}
                      className={`p-2 rounded-lg transition-colors ${
                        isDark
                          ? 'text-gray-400 hover:text-primarycolor hover:bg-gray-700'
                          : 'text-gray-500 hover:text-primarycolor hover:bg-gray-100'
                      } disabled:opacity-50`}
                    >
                      {updateLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Edit size={16} />
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(career.id)}
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
                
                <h3 className={`text-lg font-semibold mb-3 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {career.title}
                </h3>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center space-x-2">
                    <Briefcase size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    <span className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {career.department}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    <span className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {career.location}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    <span className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Posted {career.days_since_posted} days ago
                    </span>
                  </div>
                </div>

                <p className={`text-sm mb-4 line-clamp-3 ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  {career.description}
                </p>

                <div className="text-right">
                  <span className={`text-xs ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    Created by {career.created_by_username}
                  </span>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {careers.length > 0 && (
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
          title={editingCareer ? 'Edit Position' : 'Add New Position'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Job Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter job title"
              required
            />
            <Input
              label="Department"
              value={formData.department}
              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
              placeholder="Enter department"
              required
            />
            <Input
              label="Location"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Enter location"
              required
            />
            <Select
              label="Job Type"
              value={formData.job_type}
              onChange={(e) => setFormData({ ...formData, job_type: e.target.value })}
              options={jobTypeOptions}
              required
            />
            <Select
              label="Experience Level"
              value={formData.experience_level}
              onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
              options={experienceLevelOptions}
              required
            />
            <Textarea
              label="Job Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter job description"
              rows={4}
              required
            />
            <Textarea
              label="Roles and Responsibilities"
              value={formData.roles_and_responsibilities}
              onChange={(e) => setFormData({ ...formData, roles_and_responsibilities: e.target.value })}
              placeholder="Enter roles and responsibilities"
              rows={4}
              required
            />
            <div className="flex justify-end space-x-4 pt-4">
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
                  {editingCareer 
                    ? (updateLoading ? 'Updating...' : 'Update Position')
                    : (createLoading ? 'Creating...' : 'Create Position')
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

export default CareersPage;