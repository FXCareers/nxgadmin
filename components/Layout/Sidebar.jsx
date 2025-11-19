'use client';

import { useState,useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { toggleTheme } from '@/store/slices/themeSlice';
import { logout } from '@/store/slices/authSlice';
import {
  Menu,
  X,
  Sun,
  Moon,
  LogOut,
  Lock
} from 'lucide-react';
import Image from 'next/image';
import { menuItems } from '@/lib/menuItems';

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const { isDark } = useSelector((state) => state.theme);
  const { user } = useSelector((state) => state.auth);

  const getDisplayName = () => {
    if (!user) return '';
    const names = [user.fname, user.lname].filter(Boolean).join(' ').trim();
    if (names) return names;
    return user.username || user.email || 'User';
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const handleLogout = () => {
    dispatch(logout());
    router.push('/auth/login');
  };

  return (
    <>
      {/* Mobile menu button (top-right) */}
      {mounted && (
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`fixed top-4 right-4 z-50 p-2 rounded-lg lg:hidden transition-colors ${
            isDark ? 'bg-gray-800 text-primarycolor hover:bg-gray-700' : 'bg-white text-gray-800 hover:bg-gray-100'
          } shadow-lg`}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      )}

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed left-0 top-0 h-full w-64 z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } ${isDark ? 'bg-gray-900' : 'bg-white'} shadow-xl border-r ${
          isDark ? 'border-gray-700' : 'border-gray-200'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700 shrink-0">
            <div className="flex items-center space-x-3">
              <div>
                <Image
                  width={100}
                  height={100}
                  src={mounted ? (isDark ? '/NXG-Logo-white.webp' : '/NXG-Logo-black.webp') : '/NXG-Logo-black.webp'}
                  alt="NXG Markets Logo"
                />
                {mounted && user && (
                  <p className={`text-xs pt-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Welcome, {getDisplayName()}
                    <span
                      className={`px-2 py-1 ml-1 text-xs font-medium rounded-full ${
                        user.role === 'admin'
                          ? isDark
                            ? 'bg-purple-900 text-purple-300'
                            : 'bg-purple-100 text-purple-800'
                          : user.role === 'hr'
                          ? isDark
                            ? 'bg-blue-900 text-blue-300'
                            : 'bg-blue-100 text-blue-800'
                          : isDark
                          ? 'bg-green-900 text-green-300'
                          : 'bg-green-100 text-green-800'
                      }`}
                    >
                      {user.role}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Scrollable Nav & Footer Wrapper */}
          <div className="flex-1 overflow-y-auto flex flex-col justify-between">
            {/* Navigation */}
            <nav className="px-4 py-6 space-y-2">
              {mounted && menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.path;
                const hasAccess = user && item.roles.includes(user.role);

                const baseClass =
                  'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200';
                const activeClass = isDark
                  ? 'bg-primarydarkcolor text-black shadow-lg'
                  : 'bg-primarycolor text-black shadow-lg';
                const normalClass = isDark
                  ? 'text-gray-300 hover:bg-gray-800 hover:text-primarycolor'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-primarycolor';
                const disabledClass = isDark
                  ? 'text-gray-500 bg-gray-800 cursor-not-allowed'
                  : 'text-gray-400 bg-gray-100 cursor-not-allowed';

                return hasAccess ? (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setIsOpen(false)}
                    className={`${baseClass} ${isActive ? activeClass : normalClass}`}
                  >
                    <Icon size={20} className="mr-3" />
                    {item.label}
                  </Link>
                ) : (
                  <div
                    key={item.path}
                    className={`${baseClass} ${disabledClass}`}
                    title="Access restricted"
                  >
                    <Icon size={20} className="mr-3" />
                    {item.label}
                    <Lock size={16} className="ml-auto" />
                  </div>
                );
              })}
            </nav>

            {/* Theme toggle + Logout */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
              {mounted && (
                <button
                  onClick={handleThemeToggle}
                  className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isDark
                      ? 'text-gray-300 hover:bg-gray-800 hover:text-primarycolor'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-primarycolor'
                  }`}
                >
                  {isDark ? <Sun size={20} className="mr-3" /> : <Moon size={20} className="mr-3" />}
                  {isDark ? 'Light Mode' : 'Dark Mode'}
                </button>
              )}

              {mounted && (
                <button
                  onClick={handleLogout}
                  className={`flex items-center w-full px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isDark
                      ? 'text-gray-300 hover:bg-gray-800 hover:text-red-400'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-red-600'
                  }`}
                >
                  <LogOut size={20} className="mr-3" />
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
