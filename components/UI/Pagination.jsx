'use client';

import { useSelector } from 'react-redux';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ 
  currentPage, 
  totalItems, 
  itemsPerPage, 
  onPageChange 
}) => {
  const { isDark } = useSelector((state) => state.theme);
  
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 sm:px-6">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
            currentPage === 1
              ? isDark
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : isDark
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          } transition-colors`}
        >
          Previous
        </button>
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
            currentPage === totalPages
              ? isDark
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : isDark
                ? 'bg-gray-700 text-white hover:bg-gray-600'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
          } transition-colors`}
        >
          Next
        </button>
      </div>
      
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-700'}`}>
            Showing{' '}
            <span className="font-medium">
              {(currentPage - 1) * itemsPerPage + 1}
            </span>{' '}
            to{' '}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, totalItems)}
            </span>{' '}
            of{' '}
            <span className="font-medium">{totalItems}</span> results
          </p>
        </div>
        
        <div>
          <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-2 py-2 rounded-l-md text-sm font-medium ${
                currentPage === 1
                  ? isDark
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-300'
                  : isDark
                    ? 'bg-gray-700 text-white hover:bg-gray-600 border border-gray-600'
                    : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-300'
              } transition-colors`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            
            {getPageNumbers().map((page, index) => (
              page === '...' ? (
                <span
                  key={index}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                    isDark
                      ? 'bg-gray-800 text-gray-400 border border-gray-600'
                      : 'bg-white text-gray-700 border border-gray-300'
                  }`}
                >
                  ...
                </span>
              ) : (
                <button
                  key={index}
                  onClick={() => onPageChange(page)}
                  className={`relative inline-flex items-center px-4 py-2 text-sm font-medium ${
                    currentPage === page
                      ? isDark
                        ? 'bg-primarydarkcolor text-black border border-primarydarkcolor'
                        : 'bg-primarycolor text-black border border-primarycolor'
                      : isDark
                        ? 'bg-gray-700 text-white hover:bg-gray-600 border border-gray-600'
                        : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                  } transition-colors`}
                >
                  {page}
                </button>
              )
            ))}
            
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-2 py-2 rounded-r-md text-sm font-medium ${
                currentPage === totalPages
                  ? isDark
                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-300'
                  : isDark
                    ? 'bg-gray-700 text-white hover:bg-gray-600 border border-gray-600'
                    : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-300'
              } transition-colors`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;