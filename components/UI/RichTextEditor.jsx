'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { useSelector } from 'react-redux';
import { X } from 'lucide-react';

const QuillEditorInner = dynamic(() => import('./QuillEditorInner'), {
  ssr: false,
  loading: () => (
    <div
      className="border border-gray-300 dark:border-gray-600 rounded-b-lg animate-pulse"
      style={{ minHeight: '10rem' }}
    >
      <div className="p-4 space-y-3">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
      </div>
    </div>
  ),
});

const FORMATS = [
  'header', 'font', 'size',
  'bold', 'italic', 'underline', 'strike', 'blockquote', 'code-block',
  'list', 'bullet', 'indent',
  'link', 'image', 'video', 'color', 'background',
  'align', 'script', 'direction',
];

const RichTextEditor = ({
  label,
  value,
  onChange,
  placeholder = 'Enter text...',
  required = false,
  rows = 8,
}) => {
  const { isDark } = useSelector((state) => state.theme);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState('');
  const quillInstanceRef = useRef(null);
  const insertRangeRef = useRef(null);

  const imageHandler = useCallback(function () {
    quillInstanceRef.current = this.quill;
    const sel = this.quill.getSelection(true);
    insertRangeRef.current = sel || { index: 0, length: 0 };
    setShowImageDialog(true);
  }, []);

  const modules = useMemo(
    () => ({
      toolbar: {
        container: [
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          ['bold', 'italic', 'underline', 'strike'],
          ['blockquote', 'code-block'],
          [{ list: 'ordered' }, { list: 'bullet' }],
          [{ script: 'sub' }, { script: 'super' }],
          [{ indent: '-1' }, { indent: '+1' }],
          [{ direction: 'rtl' }],
          [{ size: ['small', false, 'large', 'huge'] }],
          [{ color: [] }, { background: [] }],
          [{ font: [] }],
          [{ align: [] }],
          ['link', 'image', 'video'],
          ['clean'],
        ],
        handlers: { image: imageHandler },
      },
      clipboard: { matchVisual: false },
    }),
    [imageHandler]
  );

  const handleInsertImage = useCallback(() => {
    const url = tempImageUrl.trim();
    if (url && quillInstanceRef.current) {
      const quill = quillInstanceRef.current;
      const index = insertRangeRef.current ? insertRangeRef.current.index : quill.getLength() - 1;
      quill.insertEmbed(index, 'image', url, 'user');
      quill.setSelection(index + 1, 0, 'user');
    }
    setShowImageDialog(false);
    setTempImageUrl('');
  }, [tempImageUrl]);

  const handleCancelImage = useCallback(() => {
    setShowImageDialog(false);
    setTempImageUrl('');
  }, []);

  return (
    <div>
      {label && (
        <label
          className={`block text-sm font-medium mb-2 ${
            isDark ? 'text-gray-300' : 'text-gray-700'
          }`}
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div
        className={`quill-wrapper ${isDark ? 'quill-dark' : 'quill-light'}`}
        style={{ '--min-height': `${rows * 2}rem` }}
      >
        <QuillEditorInner
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          modules={modules}
          formats={FORMATS}
        />
      </div>

      {/* ── Image URL dialog ──────────────────────────────── */}
      {showImageDialog && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleCancelImage}
          />
          <div
            className={`relative z-10 rounded-xl shadow-2xl p-6 w-full max-w-md ${
              isDark
                ? 'bg-gray-800 border border-gray-700'
                : 'bg-white border border-gray-200'
            }`}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-primarycolor/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primarycolor"
                  >
                    <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                </div>
                <h3
                  className={`text-base font-semibold ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}
                >
                  Insert Image
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCancelImage}
                className={`p-1.5 rounded-lg transition-colors ${
                  isDark
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700'
                    : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                }`}
              >
                <X size={16} />
              </button>
            </div>

            <p className={`text-xs mb-4 mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Paste a publicly accessible image URL to embed it in your content.
            </p>

            <input
              type="url"
              value={tempImageUrl}
              onChange={(e) => setTempImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primarycolor transition-colors ${
                isDark
                  ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                  : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'
              }`}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleInsertImage();
                if (e.key === 'Escape') handleCancelImage();
              }}
            />

            {/* Live preview */}
            {tempImageUrl.trim() && (
              <div
                className={`mb-4 rounded-lg overflow-hidden border flex items-center justify-center ${
                  isDark
                    ? 'border-gray-600 bg-gray-900/50'
                    : 'border-gray-200 bg-gray-50'
                }`}
                style={{ minHeight: '80px', maxHeight: '160px' }}
              >
                <img
                  src={tempImageUrl.trim()}
                  alt="Preview"
                  className="max-h-40 max-w-full object-contain"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelImage}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isDark
                    ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleInsertImage}
                disabled={!tempImageUrl.trim()}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-primarycolor text-white hover:bg-primarydarkcolor disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                Insert Image
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Global Quill styles ───────────────────────────── */}
      <style jsx global>{`
        /* Toolbar */
        .quill-wrapper .ql-toolbar {
          border-radius: 0.5rem 0.5rem 0 0 !important;
          border-color: ${isDark ? '#374151' : '#d1d5db'} !important;
          background: ${isDark ? '#1f2937' : '#f9fafb'} !important;
          padding: 8px 12px !important;
          display: flex;
          flex-wrap: wrap;
          gap: 2px;
        }

        /* Editor container */
        .quill-wrapper .ql-container {
          border-radius: 0 0 0.5rem 0.5rem !important;
          border-color: ${isDark ? '#374151' : '#d1d5db'} !important;
          background: ${isDark ? '#111827' : '#ffffff'} !important;
          font-size: 0.9375rem;
          font-family: inherit;
        }

        /* Editor area */
        .quill-wrapper .ql-editor {
          min-height: var(--min-height, 12rem);
          color: ${isDark ? '#f3f4f6' : '#111827'} !important;
          line-height: 1.75;
          padding: 14px 16px;
        }

        /* Placeholder */
        .quill-wrapper .ql-editor.ql-blank::before {
          color: ${isDark ? '#6b7280' : '#9ca3af'} !important;
          font-style: normal;
          left: 16px;
        }

        /* Focus ring */
        .quill-wrapper:focus-within .ql-toolbar,
        .quill-wrapper:focus-within .ql-container {
          border-color: rgb(var(--primary-color-rgb)) !important;
        }

        /* ── Toolbar button icons ── */
        .quill-dark .ql-toolbar .ql-stroke {
          stroke: #9ca3af !important;
        }
        .quill-dark .ql-toolbar .ql-fill {
          fill: #9ca3af !important;
        }
        .quill-dark .ql-toolbar button:hover .ql-stroke,
        .quill-dark .ql-toolbar button.ql-active .ql-stroke {
          stroke: rgb(var(--primary-color-rgb)) !important;
        }
        .quill-dark .ql-toolbar button:hover .ql-fill,
        .quill-dark .ql-toolbar button.ql-active .ql-fill {
          fill: rgb(var(--primary-color-rgb)) !important;
        }

        .quill-light .ql-toolbar .ql-stroke {
          stroke: #6b7280 !important;
        }
        .quill-light .ql-toolbar .ql-fill {
          fill: #6b7280 !important;
        }
        .quill-light .ql-toolbar button:hover .ql-stroke,
        .quill-light .ql-toolbar button.ql-active .ql-stroke {
          stroke: rgb(var(--primary-color-rgb)) !important;
        }
        .quill-light .ql-toolbar button:hover .ql-fill,
        .quill-light .ql-toolbar button.ql-active .ql-fill {
          fill: rgb(var(--primary-color-rgb)) !important;
        }

        /* Active / hover background */
        .quill-wrapper .ql-toolbar button:hover,
        .quill-wrapper .ql-toolbar button.ql-active {
          background: ${isDark ? '#374151' : '#fdf2f8'} !important;
          border-radius: 4px;
        }

        /* ── Picker dropdowns ── */
        .quill-wrapper .ql-toolbar .ql-picker-label {
          color: ${isDark ? '#9ca3af' : '#6b7280'} !important;
          border-color: transparent !important;
        }
        .quill-wrapper .ql-toolbar .ql-picker-label:hover,
        .quill-wrapper .ql-toolbar .ql-picker.ql-expanded .ql-picker-label {
          color: rgb(var(--primary-color-rgb)) !important;
        }
        .quill-wrapper .ql-toolbar .ql-picker-options {
          background: ${isDark ? '#1f2937' : '#ffffff'} !important;
          border-color: ${isDark ? '#374151' : '#e5e7eb'} !important;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
          border-radius: 0.375rem;
          padding: 4px;
        }
        .quill-wrapper .ql-toolbar .ql-picker-item {
          color: ${isDark ? '#d1d5db' : '#374151'} !important;
          border-radius: 0.25rem;
          padding: 4px 8px;
        }
        .quill-wrapper .ql-toolbar .ql-picker-item:hover,
        .quill-wrapper .ql-toolbar .ql-picker-item.ql-selected {
          color: rgb(var(--primary-color-rgb)) !important;
          background: ${isDark ? '#374151' : '#fdf2f8'} !important;
        }

        /* ── Rendered content styles ── */
        .quill-wrapper .ql-editor h1,
        .quill-wrapper .ql-editor h2,
        .quill-wrapper .ql-editor h3,
        .quill-wrapper .ql-editor h4,
        .quill-wrapper .ql-editor h5,
        .quill-wrapper .ql-editor h6 {
          color: ${isDark ? '#ffffff' : '#111827'} !important;
          font-weight: 700;
          margin: 0.75em 0 0.4em;
        }

        .quill-wrapper .ql-editor blockquote {
          border-left: 3px solid rgb(var(--primary-color-rgb));
          color: ${isDark ? '#9ca3af' : '#6b7280'} !important;
          background: ${isDark ? '#1f2937' : '#fdf9ff'} !important;
          padding: 0.5rem 1rem;
          margin: 0.75rem 0;
          border-radius: 0 0.25rem 0.25rem 0;
        }

        .quill-wrapper .ql-editor pre.ql-syntax {
          background: ${isDark ? '#0f172a' : '#1e293b'} !important;
          color: #e2e8f0 !important;
          border-radius: 0.375rem;
          padding: 1rem;
          font-size: 0.875rem;
          overflow-x: auto;
        }

        .quill-wrapper .ql-editor a {
          color: rgb(var(--primary-color-rgb)) !important;
          text-decoration: underline;
        }

        .quill-wrapper .ql-editor img {
          max-width: 100%;
          border-radius: 0.375rem;
          cursor: pointer;
        }

        .quill-wrapper .ql-editor ul,
        .quill-wrapper .ql-editor ol {
          padding-left: 1.5em;
        }

        /* ── Snow tooltip (link/video input bar) ── */
        .ql-snow .ql-tooltip {
          background: ${isDark ? '#1f2937' : '#ffffff'} !important;
          border-color: ${isDark ? '#374151' : '#e5e7eb'} !important;
          color: ${isDark ? '#f3f4f6' : '#111827'} !important;
          box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
          border-radius: 0.5rem;
          z-index: 9999;
        }
        .ql-snow .ql-tooltip input[type='text'] {
          background: ${isDark ? '#374151' : '#f9fafb'} !important;
          border-color: ${isDark ? '#4b5563' : '#e5e7eb'} !important;
          color: ${isDark ? '#f3f4f6' : '#111827'} !important;
          border-radius: 0.25rem;
          outline: none;
        }
        .ql-snow .ql-tooltip a.ql-action::after,
        .ql-snow .ql-tooltip a.ql-remove::before {
          color: rgb(var(--primary-color-rgb)) !important;
        }

        /* ── Color palette swatch border ── */
        .quill-wrapper .ql-color-picker .ql-picker-options,
        .quill-wrapper .ql-background .ql-picker-options {
          width: 168px !important;
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
