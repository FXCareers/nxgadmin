'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchSubscribers, deleteSubscriber, clearError } from '@/store/slices/subscriberSlice';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Button from '@/components/UI/Button';
import Pagination from '@/components/UI/Pagination';
import { Trash2, Loader2, AlertCircle, Mail, Users } from 'lucide-react';

const SubscribersPage = () => {
  const { 
    subscribers, 
    loading, 
    error, 
    deleteLoading, 
    pagination 
  } = useSelector((state) => state.subscriber);
  const { isDark } = useSelector((state) => state.theme);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchSubscribers({ page: pagination.currentPage, limit: pagination.limit }));
    return () => {
      dispatch(clearError());
    };
  }, [dispatch, pagination.currentPage, pagination.limit]);

  const handlePageChange = (newPage) => {
    dispatch(fetchSubscribers({ page: newPage, limit: pagination.limit }));
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this subscriber?')) {
      try {
        await dispatch(deleteSubscriber(id)).unwrap();
        // If current page becomes empty and it's not the first page, go to previous page
        if (subscribers.length === 1 && pagination.currentPage > 1) {
          dispatch(fetchSubscribers({ page: pagination.currentPage - 1, limit: pagination.limit }));
        } else {
          // Refetch current page to get updated data
          dispatch(fetchSubscribers({ page: pagination.currentPage, limit: pagination.limit }));
        }
      } catch (err) {
        console.error('Failed to delete subscriber:', err);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  if (loading && !subscribers?.length) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <Loader2 className={`w-12 h-12 animate-spin ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Newsletter Subscribers
            </h1>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage your newsletter subscribers and monitor subscription data.
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <div className={`px-4 py-2 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-gray-100'}`}>
              <div className="flex items-center space-x-2">
                <Users className={`w-5 h-5 ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`} />
                <span className={`text-sm font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                  Total: {pagination.totalItems}
                </span>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-600 dark:text-red-400">{typeof error === 'object' ? JSON.stringify(error) : error}</p>
          </div>
        )}
        
        <div className={`shadow rounded-lg overflow-x-auto ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className={`${isDark ? 'bg-gray-700' : 'bg-gray-50'}`}>
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subscribed At</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Updated</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
              {subscribers.map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{subscriber.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                    <div className="flex items-center space-x-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{subscriber.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatDate(subscriber.created_at)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatDate(subscriber.updated_at)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(subscriber.id)}
                      className={`text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-400 disabled:opacity-50`}
                      disabled={deleteLoading}
                      title="Delete subscriber"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {pagination.totalItems === 0 && !loading && (
             <div className="text-center py-12">
                <Mail className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>No Subscribers Found</h3>
                <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  No newsletter subscribers have signed up yet.
                </p>
             </div>
          )}
        </div>

        {pagination.totalPages > 1 && (
          <Pagination
            currentPage={pagination.currentPage}
            totalItems={pagination.totalItems}
            itemsPerPage={pagination.limit}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default SubscribersPage;
