'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useRouter, usePathname } from 'next/navigation';
import { menuItems } from '@/lib/menuItems';
import { apiClient } from '@/lib/api';

const AuthGuard = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, loading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    if (loading) return;

    // Check if there was an auth error in the state
    if (!isAuthenticated || error?.includes('Session expired') || error?.includes('Invalid token')) {
      apiClient.logout();
      router.push('/auth/login');
      return;
    }

    const currentRoute = menuItems.find((item) => item.path === pathname);

    if (currentRoute && !currentRoute.roles.includes(user?.role)) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, user, loading, router, pathname, error]);

  if (loading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primarycolor border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Render children if authenticated
  return <>{children}</>;
};

export default AuthGuard;
