'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchApplications, clearError } from '@/store/slices/applicationSlice';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Modal from '@/components/UI/Modal';
import Pagination from '@/components/UI/Pagination';
import useScreenHeight from '@/hooks/useScreenHeight';
import { 
  FileUser, 
  Mail, 
  Phone, 
  Calendar, 
  Briefcase, 
  Download, 
  Eye, 
  ExternalLink,
  DollarSign,
  Clock,
  Building,
  User,
  Loader2,
  AlertCircle,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

const ApplicationsPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewType, setPreviewType] = useState(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const { applications, loading, error } = useSelector((state) => state.application);
  const { isDark } = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  const itemsPerPage = useScreenHeight();

  // Calculate pagination
  const totalItems = Array.isArray(applications) ? applications.length : 0;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentApplications = useMemo(() => 
    Array.isArray(applications) ? applications.slice(startIndex, endIndex) : [], 
    [applications, startIndex, endIndex]
  );

  // Fetch applications on component mount
  useEffect(() => {
    dispatch(fetchApplications());
  }, [dispatch]);

  // Debug: Log the applications state
  useEffect(() => {
    console.log('Applications state:', applications);
    console.log('Applications is array:', Array.isArray(applications));
    console.log('Applications length:', applications?.length);
  }, [applications]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const getFileExtension = (url) => {
    if (!url) return '';
    return url.split('.').pop().toLowerCase();
  };

  const isImageFile = (url) => {
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg'];
    return imageExtensions.includes(getFileExtension(url));
  };

  const isPdfFile = (url) => {
    return getFileExtension(url) === 'pdf';
  };

  const handlePreview = (url, type) => {
    setPreviewUrl(url);
    setPreviewType(type);
    setIsPreviewModalOpen(true);
  };

  const handleDownload = async (url, filename) => {
    try {
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) throw new Error('Network response was not ok');
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename || 'download';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Download failed:', error);
      // Optionally, show a toast or alert to the user
    }
  };

  const handleViewDetails = (application) => {
    setSelectedApplication(application);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setSelectedApplication(null);
    setIsModalOpen(false);
  };

  const closePreviewModal = () => {
    setPreviewUrl(null);
    setPreviewType(null);
    setIsPreviewModalOpen(false);
  };

  if (loading && applications.length === 0) {
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
              Loading applications...
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
              Job Applications
            </h1>
            <p className={`mt-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Manage and track job applications from candidates
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <FileUser className={`w-8 h-8 ${
              isDark ? 'text-yellow-400' : 'text-yellow-600'
            }`} />
            <span className={`text-2xl font-bold ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              {totalItems}
            </span>
          </div>
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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Total Applications
                </p>
                <p className={`text-2xl font-bold mt-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {totalItems}
                </p>
              </div>
              <div className={`p-3 rounded-full ${
                isDark ? 'bg-blue-900' : 'bg-blue-100'
              }`}>
                <FileUser className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  This Month
                </p>
                <p className={`text-2xl font-bold mt-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {Array.isArray(applications) ? applications.filter(app => {
                    const appDate = new Date(app.created_at);
                    const currentDate = new Date();
                    return appDate.getMonth() === currentDate.getMonth() && 
                           appDate.getFullYear() === currentDate.getFullYear();
                  }).length : 0}
                </p>
              </div>
              <div className={`p-3 rounded-full ${
                isDark ? 'bg-green-900' : 'bg-green-100'
              }`}>
                <Calendar className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </Card>
          
          <Card className="p-6 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  Departments
                </p>
                <p className={`text-2xl font-bold mt-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {Array.isArray(applications) ? 
                    new Set(applications.map(app => app.department)).size : 0}
                </p>
              </div>
              <div className={`p-3 rounded-full ${
                isDark ? 'bg-purple-900' : 'bg-purple-100'
              }`}>
                <Building className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </Card>

          <Card className="p-6 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-sm font-medium ${
                  isDark ? 'text-gray-400' : 'text-gray-600'
                }`}>
                  With LinkedIn
                </p>
                <p className={`text-2xl font-bold mt-2 ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  {Array.isArray(applications) ? 
                    applications.filter(app => app.linkedInProfile).length : 0}
                </p>
              </div>
              <div className={`p-3 rounded-full ${
                isDark ? 'bg-yellow-900' : 'bg-yellow-100'
              }`}>
                <ExternalLink className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Applications Grid */}
        {(!Array.isArray(applications) || applications.length === 0) && !loading ? (
          <Card className="p-12 text-center">
            <FileUser className={`w-16 h-16 mx-auto mb-4 ${
              isDark ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <h3 className={`text-xl font-semibold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              No Applications Yet
            </h3>
            <p className={`mb-6 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Job applications will appear here when submitted
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(currentApplications) && currentApplications.map((application) => (
              <Card key={application.id} className="p-6 transition-colors">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      isDark ? 'bg-blue-500 text-white' : 'bg-blue-400 text-white'
                    }`}>
                      <User size={20} />
                    </div>
                    <div>
                      <h3 className={`text-lg font-semibold ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {application.firstname} {application.lastname}
                      </h3>
                      <p className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {application.department}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    <span className={`text-xs ${
                      isDark ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {formatDate(application.created_at)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2">
                    <Briefcase size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    <span className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {application.position}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    <span className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {application.email}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    <span className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {application.mobile}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <DollarSign size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    <span className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {application.currentCtc}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    <span className={`text-sm ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      Notice: {application.noticePeriod}
                    </span>
                  </div>
                </div>

                {/* Resume Actions */}
                {application.uploadResume && (
                  <div className="flex items-center space-x-2 mb-3">
                    <FileText size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                    <span className={`text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Resume:
                    </span>
                    <div className="flex space-x-1">
                      {isPdfFile(application.uploadResume) && (
                        <button
                          onClick={() => handlePreview(application.uploadResume, 'pdf')}
                          className={`p-1 rounded transition-colors ${
                            isDark
                              ? 'text-gray-400 hover:text-blue-400 hover:bg-gray-700'
                              : 'text-gray-500 hover:text-blue-600 hover:bg-gray-100'
                          }`}
                          title="Preview Resume"
                        >
                          <Eye size={14} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDownload(application.uploadResume, `${application.firstname}_${application.lastname}_resume.pdf`)}
                        className={`p-1 rounded transition-colors ${
                          isDark
                            ? 'text-gray-400 hover:text-green-400 hover:bg-gray-700'
                            : 'text-gray-500 hover:text-green-600 hover:bg-gray-100'
                        }`}
                        title="Download Resume"
                      >
                        <Download size={14} />
                      </button>
                    </div>
                  </div>
                )}                

                {/* View Details Button */}
                <Button
                  onClick={() => handleViewDetails(application)}
                  variant="secondary"
                  size="sm"
                  className="w-full flex items-center justify-center space-x-2"
                >
                  <Eye size={16} />
                  <span>View Details</span>
                </Button>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {Array.isArray(applications) && applications.length > 0 && (
          <Pagination
            currentPage={currentPage}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
          />
        )}



        {/* Application Details Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title="Application Details"
          className="max-w-4xl"
        >
          {selectedApplication && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className={`text-lg font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <User size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                      <span className={`text-sm ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {selectedApplication.firstname} {selectedApplication.lastname}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Mail size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                      <span className={`text-sm ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {selectedApplication.email}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Phone size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                      <span className={`text-sm ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {selectedApplication.mobile}
                      </span>
                    </div>
                    {selectedApplication.linkedInProfile && (
                      <div className="flex items-center space-x-2">
                        <ExternalLink size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                        <a
                          href={selectedApplication.linkedInProfile}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-500 hover:text-blue-600"
                        >
                          LinkedIn Profile
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Job Information */}
                <div className="space-y-4">
                  <h3 className={`text-lg font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Job Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Briefcase size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                      <span className={`text-sm ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {selectedApplication.position}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Building size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                      <span className={`text-sm ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        {selectedApplication.department}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <DollarSign size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                      <span className={`text-sm ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Current CTC: {selectedApplication.currentCtc}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                      <span className={`text-sm ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Notice Period: {selectedApplication.noticePeriod}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar size={16} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                      <span className={`text-sm ${
                        isDark ? 'text-gray-300' : 'text-gray-700'
                      }`}>
                        Applied: {formatDate(selectedApplication.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Files Section */}
              <div className="space-y-4">
                <h3 className={`text-lg font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Files & Documents
                </h3>
                
                {/* Resume */}
                {selectedApplication.uploadResume && (
                  <div className={`p-4 rounded-lg ${
                    isDark ? 'bg-gray-800' : 'bg-gray-50'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <FileText size={20} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                        <span className={`font-medium ${
                          isDark ? 'text-gray-300' : 'text-gray-700'
                        }`}>
                          Resume
                        </span>
                      </div>
                      <div className="flex space-x-2">
                        {isPdfFile(selectedApplication.uploadResume) && (
                          <Button
                            onClick={() => handlePreview(selectedApplication.uploadResume, 'pdf')}
                            variant="secondary"
                            size="sm"
                            className="flex items-center space-x-1"
                          >
                            <Eye size={16} />
                            <span>Preview</span>
                          </Button>
                        )}
                        <Button
                          onClick={() => handleDownload(selectedApplication.uploadResume, `${selectedApplication.firstname}_${selectedApplication.lastname}_resume.pdf`)}
                          variant="secondary"
                          size="sm"
                          className="flex items-center space-x-1"
                        >
                          <Download size={16} />
                          <span>Download</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
              </div>
            </div>
          )}
        </Modal>

        {/* Preview Modal */}
        <Modal
          isOpen={isPreviewModalOpen}
          onClose={closePreviewModal}
          title="File Preview"
          className="max-w-6xl"
        >
          {previewUrl && (
            <div className="space-y-4">
              {previewType === 'pdf' && (
                <div className="w-full h-96">
                  <iframe
                    src={`https://docs.google.com/gview?url=${encodeURIComponent(previewUrl)}&embedded=true`}
                    className="w-full h-full border rounded-lg"
                    title="PDF Preview"
                  />
                </div>
              )}
              {previewType === 'image' && (
                <div className="text-center">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-w-full max-h-96 mx-auto rounded-lg"
                  />
                </div>
              )}
              <div className="flex justify-center">
                <Button
                  onClick={() => handleDownload(previewUrl, 'download')}
                  className="flex items-center space-x-2"
                >
                  <Download size={16} />
                  <span>Download File</span>
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default ApplicationsPage;