'use client';

import { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

// Dynamically import ReactQuill to avoid SSR issues
let ReactQuill;
if (typeof window !== 'undefined') {
  ReactQuill = require('react-quill');
}

const RichTextEditor = ({ 
  label, 
  value, 
  onChange, 
  placeholder = 'Enter text...', 
  required = false,
  rows = 8 
}) => {
  const { isDark } = useSelector((state) => state.theme);
  const [mounted, setMounted] = useState(false);
  const quillRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Quill modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'color', 'background',
    'align', 'script'
  ];

  if (!mounted || !ReactQuill) {
    return (
      <div>
        {label && (
          <label className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}>
            {label}
            {required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className={`w-full border rounded-lg p-4 ${
          isDark 
            ? 'bg-gray-800 border-gray-600 text-white' 
            : 'bg-white border-gray-300 text-gray-900'
        }`} style={{ minHeight: `${rows * 1.5}rem` }}>
          <div className="animate-pulse">
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      {label && (
        <label className={`block text-sm font-medium mb-2 ${
          isDark ? 'text-gray-300' : 'text-gray-700'
        }`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className={`quill-container ${isDark ? 'quill-dark' : 'quill-light'}`}>
        <ReactQuill
          ref={quillRef}
          theme="snow"
          value={value || ''}
          onChange={onChange}
          placeholder={placeholder}
          modules={modules}
          formats={formats}
          style={{
            backgroundColor: isDark ? '#1f2937' : '#ffffff',
            color: isDark ? '#ffffff' : '#000000',
            border: `1px solid ${isDark ? '#4b5563' : '#d1d5db'}`,
            borderRadius: '0.5rem',
            minHeight: `${rows * 2}rem`
          }}
        />
      </div>
      
      <style jsx global>{`
        /* Quill Editor Styles */
        .ql-toolbar {
          border-top: 1px solid ${isDark ? '#4b5563' : '#d1d5db'} !important;
          border-left: 1px solid ${isDark ? '#4b5563' : '#d1d5db'} !important;
          border-right: 1px solid ${isDark ? '#4b5563' : '#d1d5db'} !important;
          border-bottom: none !important;
          border-top-left-radius: 0.5rem;
          border-top-right-radius: 0.5rem;
          background-color: ${isDark ? '#374151' : '#f9fafb'} !important;
        }
        
        .ql-container {
          border-bottom: 1px solid ${isDark ? '#4b5563' : '#d1d5db'} !important;
          border-left: 1px solid ${isDark ? '#4b5563' : '#d1d5db'} !important;
          border-right: 1px solid ${isDark ? '#4b5563' : '#d1d5db'} !important;
          border-top: none !important;
          border-bottom-left-radius: 0.5rem;
          border-bottom-right-radius: 0.5rem;
          background-color: ${isDark ? '#1f2937' : '#ffffff'} !important;
        }
        
        .ql-editor {
          color: ${isDark ? '#ffffff' : '#000000'} !important;
          min-height: ${rows * 2}rem;
        }
        
        .ql-editor.ql-blank::before {
          color: ${isDark ? '#9ca3af' : '#6b7280'} !important;
          font-style: italic;
        }
        
        /* Dark mode toolbar icons */
        .quill-dark .ql-toolbar .ql-stroke {
          stroke: ${isDark ? '#d1d5db' : '#374151'} !important;
        }
        
        .quill-dark .ql-toolbar .ql-fill {
          fill: ${isDark ? '#d1d5db' : '#374151'} !important;
        }
        
        .quill-dark .ql-toolbar button:hover .ql-stroke {
          stroke: ${isDark ? '#fbbf24' : '#1f2937'} !important;
        }
        
        .quill-dark .ql-toolbar button:hover .ql-fill {
          fill: ${isDark ? '#fbbf24' : '#1f2937'} !important;
        }
        
        .quill-dark .ql-toolbar button.ql-active .ql-stroke {
          stroke: ${isDark ? '#fbbf24' : '#1f2937'} !important;
        }
        
        .quill-dark .ql-toolbar button.ql-active .ql-fill {
          fill: ${isDark ? '#fbbf24' : '#1f2937'} !important;
        }
        
        /* Focus styles */
        .quill-container:focus-within .ql-toolbar {
          border-color: #fbbf24 !important;
        }
        
        .quill-container:focus-within .ql-container {
          border-color: #fbbf24 !important;
          box-shadow: 0 0 0 2px rgba(251, 191, 36, 0.2);
        }
        
        /* Dropdown styles */
        .ql-toolbar .ql-picker-label {
          color: ${isDark ? '#d1d5db' : '#374151'} !important;
        }
        
        .ql-toolbar .ql-picker-options {
          background-color: ${isDark ? '#374151' : '#ffffff'} !important;
          border: 1px solid ${isDark ? '#4b5563' : '#d1d5db'} !important;
        }
        
        .ql-toolbar .ql-picker-item {
          color: ${isDark ? '#d1d5db' : '#374151'} !important;
        }
        
        .ql-toolbar .ql-picker-item:hover {
          background-color: ${isDark ? '#4b5563' : '#f3f4f6'} !important;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
