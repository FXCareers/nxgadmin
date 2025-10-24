'use client';

import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUsers, deleteUser, clearError } from '@/store/slices/userSlice';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Button from '@/components/UI/Button';
import Modal from '@/components/UI/Modal';
import Pagination from '@/components/UI/Pagination';
import AddUserForm from '@/components/Auth/AddUserForm';
import { Plus, Trash2, Loader2, AlertCircle, User as UserIcon, Shield } from 'lucide-react';

const UserPage = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { 
    users, 
    loading, 
    error, 
    deleteLoading, 
    pagination 
  } = useSelector((state) => state.user);
  const { isDark } = useSelector((state) => state.theme);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUsers({ page: pagination.currentPage, limit: pagination.limit }));
    return () => {
      dispatch(clearError());
    };
  }, [dispatch, pagination.currentPage, pagination.limit]);

  const handlePageChange = (newPage) => {
    dispatch(fetchUsers({ page: newPage, limit: pagination.limit }));
  };
  
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await dispatch(deleteUser(id)).unwrap();
        // If current page becomes empty and it's not the first page, go to previous page
        if (users.length === 1 && pagination.currentPage > 1) {
          dispatch(fetchUsers({ page: pagination.currentPage - 1, limit: pagination.limit }));
        } else {
          // Refetch current page to get updated data
          dispatch(fetchUsers({ page: pagination.currentPage, limit: pagination.limit }));
        }
      } catch (err) {
        console.error('Failed to delete user:', err);
      }
    }
  };

  const handleAddUserSuccess = () => {
    setIsModalOpen(false);
    // Refetch current page to include the new user or adjust pagination
    dispatch(fetchUsers({ page: pagination.currentPage, limit: pagination.limit }));
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
  
  if (loading && !users?.length) {
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
              User Management
            </h1>
            <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage your platform users and their roles.
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2"
          >
            <Plus size={20} />
            <span>Add User</span>
          </Button>
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Username</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Email</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Mobile</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Created At</th>
                <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody className={`divide-y ${isDark ? 'divide-gray-700 bg-gray-800' : 'divide-gray-200 bg-white'}`}>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{user.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300' : 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.mobile || 'N/A'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{formatDate(user.created_at)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleDelete(user.id)}
                      className={`text-red-600 hover:text-red-900 dark:text-red-500 dark:hover:text-red-400 disabled:opacity-50`}
                      disabled={deleteLoading}
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
                <UserIcon className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>No Users Found</h3>
                <p className={`mt-1 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Click "Add User" to create the first user.
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

        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Add New User"
        >
          <AddUserForm 
            onClose={() => setIsModalOpen(false)}
            onSuccess={handleAddUserSuccess} 
          />
        </Modal>
      </div>
    </DashboardLayout>
  );
};

export default UserPage;