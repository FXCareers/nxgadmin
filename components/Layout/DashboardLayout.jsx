'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setTheme } from '@/store/slices/themeSlice';
import { initializeAuth } from '@/store/slices/authSlice';
import AuthGuard from '@/components/Auth/AuthGuard';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children }) => {
  const dispatch = useDispatch();
  const { isDark } = useSelector((state) => state.theme);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Initialize auth state
    dispatch(initializeAuth());
    
    // Check for saved theme preference or system preference (client-side only)
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        dispatch(setTheme(true));
      }
    }
  }, [dispatch]);

  useEffect(() => {
    // Apply theme to document (client-side only)
    if (isClient) {
      document.documentElement.classList.toggle('dark', isDark);
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    }
  }, [isDark, isClient]);

  return (
    <AuthGuard>
      <div className={`min-h-screen ${isDark ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
        <Sidebar />
        <div className="lg:ml-64">
          <main className="p-4 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AuthGuard>
  );
};

export default DashboardLayout;