'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Image from 'next/image';
import { fetchBlogs, createBlog, updateBlog, deleteBlog, clearError } from '@/store/slices/blogSlice';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Card from '@/components/UI/Card';
import Button from '@/components/UI/Button';
import Modal from '@/components/UI/Modal';
import Input from '@/components/UI/Input';
import Textarea from '@/components/UI/Textarea';
import RichTextEditor from '@/components/UI/RichTextEditor';
import { Plus, Edit, Trash2, Loader2, AlertCircle, FileText, Calendar, User, Tag } from 'lucide-react';
// import Pagination from '@/components/UI/Pagination';
import useScreenHeight from '@/hooks/useScreenHeight';

const BlogPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageErrors, setImageErrors] = useState(new Set());
  const [expandedSummaries, setExpandedSummaries] = useState(new Set());
  const [expandedContents, setExpandedContents] = useState(new Set());
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    summary: '',
    author: '',
    slug: '',
    tags: '',
    status: 'published',
    seo_title: '',
    seo_description: '',
    seo_keywords: ''
  });
  const [currentPage, setCurrentPage] = useState(1);

  // Helper function to get safe image URL
  const getSafeImageUrl = (imageUrl) => {
    return imageUrl && typeof imageUrl === 'string' ? imageUrl : null;
  };

  // Handle image errors
  const handleImageError = (imageUrl, blogId) => {
    const urlString = typeof imageUrl === 'string' ? imageUrl : String(imageUrl || '');
    console.warn('Failed to load image:', urlString);
    setImageErrors(prev => new Set([...prev, `${blogId}-${urlString}`]));
  };

  // Check if image has failed to load
  const hasImageError = (imageUrl, blogId) => {
    const urlString = typeof imageUrl === 'string' ? imageUrl : String(imageUrl || '');
    return imageErrors.has(`${blogId}-${urlString}`);
  };

  const { blogs, loading, error, createLoading, updateLoading, deleteLoading, pagination } = useSelector((state) => ({
    ...state.blog,
    pagination: state.blog.pagination || { total: 0, page: 1, limit: 10, totalPages: 1 }
  }));
  const { isDark } = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  
  const itemsPerPage = useScreenHeight();

  const statusOptions = [
    { value: 'draft', label: 'Draft' },
    { value: 'published', label: 'Published' },
    { value: 'archived', label: 'Archived' }
  ];

  // Fetch blogs when page or itemsPerPage changes
  useEffect(() => {
    dispatch(fetchBlogs({ page: currentPage, limit: itemsPerPage }));
  }, [dispatch, currentPage, itemsPerPage]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const blogData = { ...formData };

      if (imageFile) {
        blogData.images = [imageFile];
      }

      if (editingBlog) {
        await dispatch(updateBlog({ id: editingBlog.id, ...blogData })).unwrap();
      } else {
        await dispatch(createBlog(blogData)).unwrap();
      }
      resetForm();
      // Refresh the list
      dispatch(fetchBlogs());
    } catch (error) {
      console.error('Error saving blog:', error);
    }
  };

  const handleEdit = (blog) => {
    console.log('Editing blog:', blog);
    setEditingBlog(blog);
    setFormData({
      title: blog.title || '',
      content: blog.content || '',
      summary: blog.summary || '',
      author: typeof blog.author === 'object' && blog.author 
        ? `${blog.author.fname} ${blog.author.lname}` 
        : blog.author || blog.author_name || '',
      slug: blog.slug || '',
      tags: Array.isArray(blog.tags) ? blog.tags.join(', ') : (blog.tags || ''),
      status: blog.status || 'draft',
      seo_title: blog.seo_title || '',
      seo_description: blog.seo_description || '',
      seo_keywords: blog.seo_keywords || ''
    });
    
    // Set image preview if blog has an image
    const imageUrl = blog.image_url || (blog.images && blog.images.length > 0 ? blog.images[0].url : null);
    if (imageUrl) {
      setImagePreview(getSafeImageUrl(imageUrl));
    }
    
    setIsModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await dispatch(deleteBlog(id)).unwrap();
        // Refresh the list
        dispatch(fetchBlogs());
      } catch (error) {
        console.error('Error deleting blog:', error);
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
      content: '',
      summary: '',
      author: '',
      slug: '',
      tags: '',
      status: 'draft',
      seo_title: '',
      seo_description: '',
      seo_keywords: ''
    });
    setEditingBlog(null);
    setImageFile(null);
    setImagePreview(null);
    setIsModalOpen(false);
    dispatch(clearError());
  };

  // Reset to first page when itemsPerPage changes
  useEffect(() => {
    setCurrentPage(1);
  }, [itemsPerPage]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  const formatTags = (tags) => {
    if (Array.isArray(tags)) {
      return tags.join(', ');
    }
    return tags || '';
  };

  // Helper function to strip HTML tags and get clean text
  const stripHtmlTags = (html) => {
    if (!html) return '';
    // Create a temporary div element to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    // Return only the text content, removing all HTML tags
    return tempDiv.textContent || tempDiv.innerText || '';
  };

  // Toggle expanded state for summary
  const toggleSummaryExpanded = (blogId) => {
    setExpandedSummaries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(blogId)) {
        newSet.delete(blogId);
      } else {
        newSet.add(blogId);
      }
      return newSet;
    });
  };

  // Toggle expanded state for content
  const toggleContentExpanded = (blogId) => {
    setExpandedContents(prev => {
      const newSet = new Set(prev);
      if (newSet.has(blogId)) {
        newSet.delete(blogId);
      } else {
        newSet.add(blogId);
      }
      return newSet;
    });
  };

  // Check if text needs truncation
  const needsTruncation = (text, maxLength = 100) => {
    return stripHtmlTags(text).length > maxLength;
  };

  if (loading && blogs.length === 0) {
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
              Loading blogs...
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
              Blog Management
            </h1>
            <p className={`mt-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Create, edit, and manage your blog posts
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
            <span>{createLoading ? 'Creating...' : 'Add Blog'}</span>
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

        {/* Blog Grid */}
        {(!Array.isArray(blogs) || blogs.length === 0) && !loading ? (
          <Card className="p-12 text-center">
            <FileText className={`w-16 h-16 mx-auto mb-4 ${
              isDark ? 'text-gray-600' : 'text-gray-400'
            }`} />
            <h3 className={`text-xl font-semibold mb-2 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              No Blog Posts Yet
            </h3>
            <p className={`mb-6 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Create your first blog post to get started
            </p>
            <Button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center space-x-2 mx-auto"
            >
              <Plus size={20} />
              <span>Add Blog</span>
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.isArray(blogs) && blogs.map((blog) => (
              <Card key={blog.id} className="overflow-hidden transition-colors">
                {/* Blog Image */}
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 relative overflow-hidden">
                  {(() => {
                    const imageUrl = blog.image_url || (blog.images && blog.images[0]);
                    const safeImageUrl = getSafeImageUrl(imageUrl);
                    const hasError = hasImageError(imageUrl, blog.id);
                    
                    // Show fallback if no image URL, has error, or safeImageUrl is null
                    if (!imageUrl || hasError || !safeImageUrl) {
                      return (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <FileText size={48} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                            <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              No Image
                            </p>
                          </div>
                        </div>
                      );
                    }
                    
                    // Only render Image component if we have a valid src
                    try {
                      return (
                        <Image
                          src={safeImageUrl}
                          alt={blog.title || 'Blog image'}
                          fill
                          className="object-cover transition-opacity duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          onError={() => handleImageError(imageUrl, blog.id)}
                          placeholder="blur"
                          blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyLli+ZCXRTnortOrVgRQbNCGpFBWOvvjmOUDyQhzX1FWmYpvqyTz1z1Xz/AK4t7dZUgmgpX2mhQc5QsLrJBOqvOv8AKj/XE9wAFctGAUnz8mB8F1zUNNtRJH1JFJl6E4nqj0tX9L2+b1/amwlvlCFBq8B7GvdXMTJ05oByX0NJ+Jp9vJOVXHr3sKy5Wuqxgl9h8xz7//Z"
                        />
                      );
                    } catch (error) {
                      console.error('Error rendering image:', error);
                      return (
                        <div className="w-full h-full flex items-center justify-center">
                          <div className="text-center">
                            <FileText size={48} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                            <p className={`text-sm mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                              Image Error
                            </p>
                          </div>
                        </div>
                      );
                    }
                  })()}
                </div>
                
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      isDark ? 'bg-gray-700 text-gray-300' : getStatusColor(blog.status)
                    }`}>
                      {blog.status?.charAt(0).toUpperCase() + blog.status?.slice(1)}
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEdit(blog)}
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
                        onClick={() => handleDelete(blog.id)}
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
                  
                  <h3 className={`text-lg font-semibold mb-2 line-clamp-2 ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {blog.title}
                  </h3>
                  
                  {blog.summary && (
                    <div className="mb-3">
                      <div 
                        className={`text-sm ${
                          expandedSummaries.has(blog.id) ? '' : 'line-clamp-2'
                        } ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                        dangerouslySetInnerHTML={{ __html: blog.summary }}
                      />
                      {needsTruncation(blog.summary, 80) && (
                        <button
                          onClick={() => toggleSummaryExpanded(blog.id)}
                          className={`text-xs mt-1 font-medium transition-colors ${
                            isDark 
                              ? 'text-yellow-400 hover:text-yellow-300' 
                              : 'text-yellow-600 hover:text-yellow-700'
                          }`}
                        >
                          {expandedSummaries.has(blog.id) ? 'Show less' : 'Read more'}
                        </button>
                      )}
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <div 
                      className={`text-sm ${
                        expandedContents.has(blog.id) ? '' : 'line-clamp-3'
                      } ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                      dangerouslySetInnerHTML={{ __html: blog.content }}
                    />
                    {needsTruncation(blog.content, 120) && (
                      <button
                        onClick={() => toggleContentExpanded(blog.id)}
                        className={`text-xs mt-1 font-medium transition-colors ${
                          isDark 
                            ? 'text-yellow-400 hover:text-yellow-300' 
                            : 'text-yellow-600 hover:text-yellow-700'
                        }`}
                      >
                        {expandedContents.has(blog.id) ? 'Show less' : 'Read more'}
                      </button>
                    )}
                  </div>

                  <div className="space-y-2 mb-4">
                    {/* Category */}
                    {blog.category_id && typeof blog.category_id === 'object' && blog.category_id.name && (
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          isDark ? 'bg-yellow-400' : 'bg-yellow-600'
                        }`} />
                        <span className={`text-sm font-medium ${
                          isDark ? 'text-yellow-400' : 'text-yellow-600'
                        }`}>
                          {blog.category_id.name}
                        </span>
                      </div>
                    )}
                    
                    <div className="flex items-center space-x-2">
                      <User size={14} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                      <span className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {typeof blog.author === 'object' && blog.author 
                          ? `${blog.author.fname} ${blog.author.lname}` 
                          : blog.author || blog.author_name || 'Unknown Author'}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar size={14} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                      <span className={`text-sm ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {formatDate(blog.created_at)}
                      </span>
                    </div>
                    {blog.tags && (
                      <div className="flex items-center space-x-2">
                        <Tag size={14} className={isDark ? 'text-gray-400' : 'text-gray-500'} />
                        <span className={`text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {formatTags(blog.tags)}
                        </span>
                      </div>
                    )}
                    
                    {/* Read Time */}
                    {blog.read_time > 0 && (
                      <div className="flex items-center space-x-2">
                        <div className={`w-3 h-3 rounded-full border ${
                          isDark ? 'border-gray-400' : 'border-gray-500'
                        } flex items-center justify-center`}>
                          <div className={`w-1 h-1 rounded-full ${
                            isDark ? 'bg-gray-400' : 'bg-gray-500'
                          }`} />
                        </div>
                        <span className={`text-sm ${
                          isDark ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          {blog.read_time} min read
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
        {/* {pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.page}
            totalItems={pagination.total}
            itemsPerPage={pagination.limit}
            onPageChange={setCurrentPage}
          />
        )} */}
        {/* Modal */}
        <Modal
          isOpen={isModalOpen}
          onClose={resetForm}
          title={editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}
          className="max-w-4xl"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                <Input
                  label="Title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Enter blog title"
                  required
                />
                <Input
                  label="Author"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  placeholder="Enter author name"
                  required
                />
                <Input
                  label="Slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="Enter URL slug"
                  required
                />
                <Input
                  label="Tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="Enter tags separated by commas"
                />
                
                {/* Image Upload */}
                <div>
                  <label className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Featured Image
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
                    <div className="mt-2 relative h-32 w-full">
                      {(() => {
                        try {
                          // Ensure imagePreview is a valid string
                          if (!imagePreview || typeof imagePreview !== 'string') {
                            return null;
                          }
                          
                          return (
                            <Image
                              src={imagePreview}
                              alt="Preview"
                              fill
                              className="object-cover rounded-lg"
                              sizes="(max-width: 768px) 100vw, 50vw"
                              onError={(e) => {
                                console.warn('Failed to load preview image');
                                setImagePreview(null);
                              }}
                            />
                          );
                        } catch (error) {
                          console.error('Error rendering preview image:', error);
                          return (
                            <div className="w-full h-full flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-700">
                              <FileText size={24} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
                            </div>
                          );
                        }
                      })()}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                <RichTextEditor
                  label="Summary"
                  value={formData.summary}
                  onChange={(value) => setFormData({ ...formData, summary: value })}
                  placeholder="Enter a brief summary"
                  rows={2}
                  required
                />
                <RichTextEditor
                  label="Content"
                  value={formData.content}
                  onChange={(value) => setFormData({ ...formData, content: value })}
                  placeholder="Enter blog content"
                  rows={6}
                  required
                />
              </div>
            </div>

            {/* SEO Section */}
            <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className={`text-lg font-semibold mb-4 ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                SEO Settings
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="SEO Title"
                  value={formData.seo_title}
                  onChange={(e) => setFormData({ ...formData, seo_title: e.target.value })}
                  placeholder="Enter SEO title (recommended: 50-60 characters)"
                />
                <Textarea
                  label="SEO Description"
                  value={formData.seo_description}
                  onChange={(e) => setFormData({ ...formData, seo_description: e.target.value })}
                  placeholder="Enter SEO description (recommended: 150-160 characters)"
                  rows={3}
                />
                <Input
                  label="SEO Keywords"
                  value={formData.seo_keywords}
                  onChange={(e) => setFormData({ ...formData, seo_keywords: e.target.value })}
                  placeholder="Enter SEO keywords separated by commas"
                />
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
                  {editingBlog 
                    ? (updateLoading ? 'Updating...' : 'Update Blog')
                    : (createLoading ? 'Creating...' : 'Create Blog')
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

export default BlogPage;
