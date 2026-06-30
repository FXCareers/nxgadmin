'use client';

import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import Card from '@/components/UI/Card';
import { FileText, Users, Award } from 'lucide-react';
import { fetchBlogs } from '@/store/slices/blogSlice';
import { fetchUsers } from '@/store/slices/userSlice';
import { fetchContacts } from '@/store/slices/contactSlice';

const DashboardPage = () => {
  const dispatch = useDispatch();
  const { isDark } = useSelector((state) => state.theme);
  const { blogs, totalBlog } = useSelector((state) => state.blog);
  const { users } = useSelector((state) => state.user);
  const { contacts } = useSelector((state) => state.contact);

  useEffect(() => {
    // Load overview data when dashboard first mounts
    dispatch(fetchBlogs());
    dispatch(fetchUsers());
    dispatch(fetchContacts());
  }, [dispatch]);

  const stats = [
    {
      title: 'Total Blogs',
      value: totalBlog,
      icon: FileText,
      color: 'text-blue-500',
      bgColor: isDark ? 'bg-blue-900' : 'bg-blue-100',
    },
    {
      title: 'Contact Messages',
      value: contacts.length,
      icon: FileText,
      color: 'text-indigo-500',
      bgColor: isDark ? 'bg-indigo-900' : 'bg-indigo-100',
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className={`text-3xl font-bold ${
            isDark ? 'text-white' : 'text-gray-900'
          }`}>
            Dashboard Overview
          </h1>
          <p className={`mt-2 ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Welcome back! Here's what's happening with your platform.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="p-6 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <p className={`text-sm font-medium ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {stat.title}
                    </p>
                    <p className={`text-2xl font-bold mt-2 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {stat.value}
                    </p>
                  </div>
                  <div className={`p-3 rounded-full ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Blogs */}
          <Card className="p-6 transition-colors">
            <h3 className={`text-lg font-semibold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Recent Blogs
            </h3>
            <div className="space-y-3">
              {blogs.slice(0, 3).map((blog) => {
                const authorName = typeof blog.author === 'string'
                  ? blog.author
                  : [blog.author?.fname, blog.author?.lname].filter(Boolean).join(' ').trim()
                    || blog.author?.name
                    || blog.author?.email
                    || 'Unknown author';
                const publishedDate = blog.date || blog.created_at || blog.updated_at || 'N/A';

                return (
                  <div key={blog.id} className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${
                      blog.status === 'published' ? 'bg-green-500' : 'bg-primarydarkcolor'
                    }`} />
                    <div className="flex-1">
                      <p className={`text-sm font-medium ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {blog.title}
                      </p>
                      <p className={`text-xs ${
                        isDark ? 'text-gray-400' : 'text-gray-600'
                      }`}>
                        {authorName} • {publishedDate}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Recent Users */}
          <Card className="p-6 transition-colors">
            <h3 className={`text-lg font-semibold mb-4 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              Recent Users
            </h3>
            <div className="space-y-3">
              {users.slice(0, 3).map((user) => (
                <div key={user.id} className="flex items-center space-x-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isDark ? 'bg-gray-700' : 'bg-gray-200'
                  }`}>
                    <span className={`text-sm font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {user.name}
                    </p>
                    <p className={`text-xs ${
                      isDark ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {user.email} • {user.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;