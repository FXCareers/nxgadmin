'use client';

import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, leftContent, rightContent }) => {
  const { isDark } = useSelector((state) => state.theme);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur effect */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div className={`relative w-full max-w-6xl max-h-[85vh] mx-auto rounded-2xl shadow-2xl transition-all duration-300 transform overflow-hidden flex flex-col ${
        isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
      } ${
        isDark 
          ? 'bg-gradient-to-br from-gray-800 via-gray-900 to-black border border-gray-700' 
          : 'bg-gradient-to-br from-white via-gray-50 to-gray-100 border border-gray-200'
      }`}>
        
        {/* Header */}
        <div className={`relative px-8 py-6 border-b flex-shrink-0 ${
          isDark ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-white/50'
        } backdrop-blur-sm rounded-t-2xl`}>
          <div className="flex justify-between items-center">
            <div>
              <h2 className={`text-2xl font-bold ${
                isDark ? 'text-white' : 'text-gray-900'
              }`}>
                {title}
              </h2>
              <div className={`h-1 w-16 rounded-full mt-2 ${
                isDark 
                  ? 'bg-gradient-to-r from-blue-400 to-purple-500' 
                  : 'bg-gradient-to-r from-blue-500 to-purple-600'
              }`} />
            </div>
            <button
              onClick={onClose}
              className={`p-3 rounded-xl transition-all duration-200 ${
                isDark
                  ? 'text-gray-400 hover:text-white hover:bg-gray-700/50 hover:rotate-90'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100/50 hover:rotate-90'
              } transform`}
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {/* Two Column Layout */}
          {(leftContent || rightContent) ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className={`space-y-6 ${
                isDark ? 'text-gray-100' : 'text-gray-800'
              }`}>
                {leftContent || (
                  <div className={`p-6 rounded-xl ${
                    isDark 
                      ? 'bg-gray-700/30 border border-gray-600' 
                      : 'bg-white/50 border border-gray-200'
                  } backdrop-blur-sm`}>
                    <h3 className={`text-lg font-semibold mb-4 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Left Content
                    </h3>
                    {children}
                  </div>
                )}
              </div>

              {/* Right Column */}
              <div className={`space-y-6 ${
                isDark ? 'text-gray-100' : 'text-gray-800'
              }`}>
                {rightContent || (
                  <div className={`p-6 rounded-xl ${
                    isDark 
                      ? 'bg-gray-700/30 border border-gray-600' 
                      : 'bg-white/50 border border-gray-200'
                  } backdrop-blur-sm`}>
                    <h3 className={`text-lg font-semibold mb-4 ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Right Content
                    </h3>
                    <p className={`${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      Additional content can be placed here
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Single Column Fallback */
            <div className={`${
              isDark ? 'text-gray-100' : 'text-gray-800'
            }`}>
              {children}
            </div>
          )}
        </div>

        {/* Decorative Elements */}
        <div className={`absolute top-0 left-0 w-full h-1 rounded-t-2xl ${
          isDark 
            ? 'bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500' 
            : 'bg-gradient-to-r from-blue-500 via-purple-600 to-pink-600'
        }`} />
        
        {/* Subtle corner decorations */}
        <div className={`absolute top-4 right-20 w-2 h-2 rounded-full ${
          isDark ? 'bg-blue-400/30' : 'bg-blue-500/20'
        }`} />
        <div className={`absolute top-8 right-16 w-1 h-1 rounded-full ${
          isDark ? 'bg-purple-400/40' : 'bg-purple-500/30'
        }`} />
      </div>
    </div>
  );
};

export default Modal;