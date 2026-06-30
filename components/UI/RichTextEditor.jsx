'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { TableKit } from '@tiptap/extension-table';
import TiptapImage from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import FontFamily from '@tiptap/extension-font-family';
import { TextStyle, FontSize } from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Underline from '@tiptap/extension-underline';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import Subscript from '@tiptap/extension-subscript';
import Superscript from '@tiptap/extension-superscript';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useSelector } from 'react-redux';
import {
  Bold, Italic, Underline as UnderlineIcon, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Indent, Outdent,
  Link as LinkIcon, Unlink,
  Image as ImageIcon,
  Table as TableIcon,
  Code, Braces,
  Quote, Minus,
  Undo2, Redo2,
  Subscript as SubIcon, Superscript as SupIcon,
  Eraser, Highlighter, Type,
  ChevronDown, X, Upload,
} from 'lucide-react';


/* ── Constants ────────────────────────────────────────────── */
const FONTS = [
  { label: 'Default',           value: '' },
  { label: 'Arial',             value: 'Arial, sans-serif' },
  { label: 'Georgia',          value: 'Georgia, serif' },
  { label: 'Times New Roman',  value: '"Times New Roman", serif' },
  { label: 'Courier New',      value: '"Courier New", monospace' },
  { label: 'Verdana',          value: 'Verdana, sans-serif' },
  { label: 'Trebuchet MS',     value: '"Trebuchet MS", sans-serif' },
  { label: 'Impact',           value: 'Impact, sans-serif' },
];

const SIZES = ['10', '11', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48', '64'];

const TEXT_COLORS = [
  '#000000','#1f2937','#374151','#6b7280','#9ca3af','#d1d5db','#f9fafb','#ffffff',
  '#dc2626','#ea580c','#d97706','#65a30d','#059669','#0891b2','#2563eb','#7c3aed',
  '#fca5a5','#fdba74','#fde68a','#bbf7d0','#99f6e4','#bae6fd','#c7d2fe','#ddd6fe',
  '#991b1b','#9a3412','#92400e','#3f6212','#065f46','#0e7490','#1e40af','#4c1d95',
];

const HIGHLIGHT_COLORS = [
  '#fef08a','#bbf7d0','#bae6fd','#fecaca','#ddd6fe','#fed7aa','#fbcfe8','#e0f2fe',
  '#fde047','#4ade80','#38bdf8','#f87171','#a78bfa','#fb923c','#f472b6','#7dd3fc',
];

/* ── Shared toolbar components (stable across renders) ────── */
const Divider = () => (
  <span className="inline-block w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1 flex-shrink-0" />
);

const Btn = ({ onClick, active, disabled, title, children, className = '' }) => (
  <button
    type="button"
    onMouseDown={e => { e.preventDefault(); onClick?.(e); }}
    disabled={disabled}
    title={title}
    className={`
      flex items-center justify-center p-1.5 rounded text-sm flex-shrink-0 transition-all
      ${active
        ? 'bg-primarycolor text-white shadow-sm'
        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
      }
      disabled:opacity-30 disabled:cursor-not-allowed
      ${className}
    `}
  >
    {children}
  </button>
);

/* ── Main Component ───────────────────────────────────────── */
const RichTextEditor = ({
  label,
  value,
  onChange,
  placeholder = 'Start writing...',
  required = false,
  rows = 14,
}) => {
  const { isDark } = useSelector(s => s.theme);

  /* dropdown / dialog states */
  const [open, setOpen] = useState(null); // 'format'|'font'|'size'|'textColor'|'highlight'|'table'
  const [tableHover, setTableHover] = useState({ r: 0, c: 0 });

  const [showLink, setShowLink] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkNewTab, setLinkNewTab] = useState(true);

  const [showImage, setShowImage] = useState(false);
  const [imageTab, setImageTab] = useState('url');
  const [imageUrl, setImageUrl] = useState('');
  const fileRef = useRef(null);
  const toolbarRef = useRef(null);

  const toggle = useCallback(key => setOpen(v => v === key ? null : key), []);
  const closeAll = useCallback(() => setOpen(null), []);

  /* Fixed-position dropdown anchor */
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const openDropdown = useCallback((key, el, width = 200) => {
    if (el) {
      const rect = el.getBoundingClientRect();
      const toolbarRect = toolbarRef.current?.getBoundingClientRect();

      // position:fixed inside a CSS-transformed ancestor is positioned relative to
      // that ancestor, NOT the viewport. Walk up the DOM to find it and subtract
      // its viewport offset so our coordinates are in the right space.
      let cbRect = { left: 0, top: 0, right: window.innerWidth };
      let node = el.parentElement;
      while (node && node !== document.documentElement) {
        const t = window.getComputedStyle(node).transform;
        if (t && t !== 'none') { cbRect = node.getBoundingClientRect(); break; }
        node = node.parentElement;
      }

      // Button position relative to the containing block
      const relLeft   = rect.left   - cbRect.left;
      const relBottom = rect.bottom - cbRect.top;

      // Right boundary (container-relative): use the toolbar's right edge
      const toolbarRight = toolbarRect
        ? toolbarRect.right - cbRect.left
        : cbRect.right - cbRect.left - 8;
      const bound = Math.min(toolbarRight, window.innerWidth - cbRect.left - 8);

      const left = relLeft + width > bound
        ? Math.max(0, bound - width)
        : relLeft;

      setDropdownPos({ top: relBottom + 4, left });
    }
    setOpen(v => v === key ? null : key);
  }, []);

  /* Close dropdowns only when clicking outside the toolbar */
  useEffect(() => {
    const handler = (e) => {
      if (toolbarRef.current && !toolbarRef.current.contains(e.target)) {
        closeAll();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [closeAll]);

  /* ── Editor ──────────────────────────────────────────────── */
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] } }),
      Underline,
      Subscript,
      Superscript,
      TextStyle,
      FontSize,
      FontFamily,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph', 'tableCell', 'tableHeader'] }),
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer' } }),
      TiptapImage.configure({ allowBase64: true }),
      TableKit.configure({ table: { resizable: true } }),
      Placeholder.configure({ placeholder }),
    ],
    content: value || '',
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: { class: 'tiptap-prose', spellcheck: 'true' },
    },
  });

  /* ── Paste cleanup (Word / Google Docs) ─────────────────── */
  useEffect(() => {
    if (!editor) return;

    // Properties to strip: font identity and explicit color.
    // We keep font-weight, font-style, text-decoration, background-color
    // so bold, italic, underline, strikethrough, and highlights survive.
    const STRIP = new Set(['font-family', 'font-size', 'color', 'font']);

    const cleanHtml = (html) => {
      const div = document.createElement('div');
      div.innerHTML = html;

      div.querySelectorAll('[style]').forEach(el => {
        const kept = el.getAttribute('style')
          .split(';')
          .filter(decl => {
            const prop = decl.split(':')[0].trim().toLowerCase();
            // Remove exact-match unwanted props and all Word mso-* props
            return prop && !STRIP.has(prop) && !prop.startsWith('mso-');
          })
          .join('; ')
          .trim();
        if (kept) el.setAttribute('style', kept);
        else el.removeAttribute('style');
      });

      // Strip Word class names (MsoNormal, MsoBodyText, etc.)
      div.querySelectorAll('[class]').forEach(el => el.removeAttribute('class'));

      return div.innerHTML;
    };

    const onPaste = (e) => {
      const html = e.clipboardData?.getData('text/html');
      if (!html) return; // plain-text paste — let Tiptap handle normally
      e.preventDefault();
      editor.commands.insertContent(cleanHtml(html), {
        parseOptions: { preserveWhitespace: 'full' },
      });
    };

    // Capture phase fires before ProseMirror's own paste handler
    editor.view.dom.addEventListener('paste', onPaste, true);
    return () => editor.view.dom.removeEventListener('paste', onPaste, true);
  }, [editor]);

  /* ── Helpers ─────────────────────────────────────────────── */
  const getHeadingLabel = () => {
    if (!editor) return 'Normal';
    for (let i = 1; i <= 6; i++) {
      if (editor.isActive('heading', { level: i })) return `H${i}`;
    }
    return 'Normal';
  };

  const getCurrentFont = () => {
    if (!editor) return 'Default';
    const ff = editor.getAttributes('textStyle').fontFamily;
    return FONTS.find(f => f.value === ff)?.label ?? 'Default';
  };

  const getCurrentSize = () => {
    if (!editor) return '16';
    const fs = editor.getAttributes('textStyle').fontSize;
    return fs ? fs.replace('px', '') : '16';
  };

  /* ── Link handlers ───────────────────────────────────────── */
  const openLink = useCallback(() => {
    if (!editor) return;
    setLinkUrl(editor.getAttributes('link').href || '');
    setLinkNewTab(editor.getAttributes('link').target === '_blank');
    setShowLink(true);
  }, [editor]);

  const applyLink = useCallback(() => {
    if (!editor) return;
    if (!linkUrl.trim()) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
    } else {
      editor.chain().focus().extendMarkRange('link').setLink({
        href: linkUrl.trim(),
        target: linkNewTab ? '_blank' : null,
      }).run();
    }
    setShowLink(false);
    setLinkUrl('');
  }, [editor, linkUrl, linkNewTab]);

  /* ── Image handlers ──────────────────────────────────────── */
  const insertImageUrl = useCallback(() => {
    if (!editor || !imageUrl.trim()) return;
    editor.chain().focus().setImage({ src: imageUrl.trim() }).run();
    setShowImage(false);
    setImageUrl('');
  }, [editor, imageUrl]);

  const insertImageFile = useCallback(e => {
    const file = e.target.files?.[0];
    if (!file || !editor) return;
    const reader = new FileReader();
    reader.onload = ev => {
      editor.chain().focus().setImage({ src: ev.target.result }).run();
      setShowImage(false);
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }, [editor]);

  if (!editor) {
    return (
      <div>
        {label && (
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
            {label}{required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}
        <div className="border border-gray-300 dark:border-gray-600 rounded-lg animate-pulse"
          style={{ minHeight: `${rows * 2}rem` }}>
          <div className="h-10 bg-gray-100 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 rounded-t-lg" />
          <div className="p-4 space-y-3">
            {[3, 2, 4, 2, 3].map((w, i) => (
              <div key={i} className={`h-3 bg-gray-200 dark:bg-gray-700 rounded`} style={{ width: `${w * 20}%` }} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ── Toolbar ─────────────────────────────────────────────── */
  const toolbar = (
    <div
      ref={toolbarRef}
      className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/80 sticky top-0 z-20 rounded-t-lg"
      onMouseDown={e => e.preventDefault()}
    >
      {/* Undo / Redo */}
      <Btn onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()} title="Undo (Ctrl+Z)"><Undo2 size={14} /></Btn>
      <Btn onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()} title="Redo (Ctrl+Y)"><Redo2 size={14} /></Btn>

      <Divider />

      {/* Heading / Format */}
      <div>
        <button type="button"
          onMouseDown={e => { e.preventDefault(); openDropdown('format', e.currentTarget, 160); }}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          style={{ width: '72px' }}
        >
          <span>{getHeadingLabel()}</span>
          <ChevronDown size={11} />
        </button>
        {open === 'format' && (
          <div style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, width: '160px', zIndex: 9999 }}
            className="rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 overflow-hidden"
            onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
            {[
              { label: 'Normal text', fontSize: '14px', weight: 400, action: () => editor.chain().focus().setParagraph().run(), isActive: !editor.isActive('heading') },
              { label: 'Heading 1', fontSize: '22px', weight: 700, action: () => editor.chain().focus().toggleHeading({ level: 1 }).run(), isActive: editor.isActive('heading', { level: 1 }) },
              { label: 'Heading 2', fontSize: '18px', weight: 700, action: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), isActive: editor.isActive('heading', { level: 2 }) },
              { label: 'Heading 3', fontSize: '16px', weight: 600, action: () => editor.chain().focus().toggleHeading({ level: 3 }).run(), isActive: editor.isActive('heading', { level: 3 }) },
              { label: 'Heading 4', fontSize: '14px', weight: 600, action: () => editor.chain().focus().toggleHeading({ level: 4 }).run(), isActive: editor.isActive('heading', { level: 4 }) },
              { label: 'Heading 5', fontSize: '13px', weight: 600, action: () => editor.chain().focus().toggleHeading({ level: 5 }).run(), isActive: editor.isActive('heading', { level: 5 }) },
              { label: 'Heading 6', fontSize: '12px', weight: 600, action: () => editor.chain().focus().toggleHeading({ level: 6 }).run(), isActive: editor.isActive('heading', { level: 6 }) },
            ].map(({ label, fontSize, weight, action, isActive }) => (
              <button key={label} type="button"
                onMouseDown={e => { e.preventDefault(); action(); closeAll(); }}
                className={`w-full text-left px-3 py-2 hover:bg-primarycolor/10 transition-colors ${isActive ? 'text-primarycolor bg-primarycolor/5' : 'text-gray-700 dark:text-gray-200'}`}
                style={{ fontSize, fontWeight: weight }}
              >{label}</button>
            ))}
          </div>
        )}
      </div>

      <Divider />

      {/* Text formatting */}
      <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold (Ctrl+B)"><Bold size={14} /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic (Ctrl+I)"><Italic size={14} /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline (Ctrl+U)"><UnderlineIcon size={14} /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough"><Strikethrough size={14} /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleSubscript().run()} active={editor.isActive('subscript')} title="Subscript"><SubIcon size={14} /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleSuperscript().run()} active={editor.isActive('superscript')} title="Superscript"><SupIcon size={14} /></Btn>

      <Divider />

      {/* Font family */}
      <div>
        <button type="button"
          onMouseDown={e => { e.preventDefault(); openDropdown('font', e.currentTarget, 175); }}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          style={{ width: '88px' }}
        >
          <span className="truncate">{getCurrentFont()}</span>
          <ChevronDown size={10} className="flex-shrink-0" />
        </button>
        {open === 'font' && (
          <div style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, width: '175px', zIndex: 9999 }}
            className="rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 overflow-hidden"
            onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
            {FONTS.map(({ label, value }) => (
              <button key={label} type="button"
                onMouseDown={e => { e.preventDefault(); value ? editor.chain().focus().setFontFamily(value).run() : editor.chain().focus().unsetFontFamily().run(); closeAll(); }}
                className={`w-full text-left px-3 py-1.5 text-sm hover:bg-primarycolor/10 transition-colors ${getCurrentFont() === label ? 'text-primarycolor bg-primarycolor/5' : 'text-gray-700 dark:text-gray-200'}`}
                style={{ fontFamily: value || 'inherit' }}
              >{label}</button>
            ))}
          </div>
        )}
      </div>

      {/* Font size */}
      <div>
        <button type="button"
          onMouseDown={e => { e.preventDefault(); openDropdown('size', e.currentTarget, 80); }}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          style={{ width: '52px' }}
        >
          <span>{getCurrentSize()}</span>
          <ChevronDown size={10} className="flex-shrink-0" />
        </button>
        {open === 'size' && (
          <div style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, width: '80px', maxHeight: '220px', overflowY: 'auto', zIndex: 9999 }}
            className="rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 overflow-x-hidden"
            onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
            {SIZES.map(s => (
              <button key={s} type="button"
                onMouseDown={e => { e.preventDefault(); editor.chain().focus().setFontSize(`${s}px`).run(); closeAll(); }}
                className={`w-full text-left px-3 py-1 text-sm hover:bg-primarycolor/10 transition-colors ${getCurrentSize() === s ? 'text-primarycolor bg-primarycolor/5' : 'text-gray-700 dark:text-gray-200'}`}
              >{s}</button>
            ))}
          </div>
        )}
      </div>

      <Divider />

      {/* Text color */}
      <div>
        <button type="button"
          onMouseDown={e => { e.preventDefault(); openDropdown('textColor', e.currentTarget, 185); }}
          title="Text Color"
          className="flex flex-col items-center gap-0.5 p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <Type size={13} />
          <span className="w-4 h-1 rounded-sm"
            style={{ backgroundColor: editor.getAttributes('textStyle').color || (isDark ? '#fafafa' : '#0a0a0a') }} />
        </button>
        {open === 'textColor' && (
          <div style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, width: '180px', zIndex: 9999 }}
            className="p-2.5 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
            onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
            <p className="text-xs font-medium mb-2 text-gray-500 dark:text-gray-400">Text Color</p>
            <div className="grid grid-cols-8 gap-1">
              {TEXT_COLORS.map(c => (
                <button key={c} type="button"
                  onMouseDown={e => { e.preventDefault(); editor.chain().focus().setColor(c).run(); closeAll(); }}
                  className="w-5 h-5 rounded-sm border border-gray-200/50 hover:scale-110 transition-transform ring-offset-1 hover:ring-2 ring-primarycolor"
                  style={{ backgroundColor: c }} title={c}
                />
              ))}
            </div>
            <button type="button"
              onMouseDown={e => { e.preventDefault(); editor.chain().focus().unsetColor().run(); closeAll(); }}
              className="w-full mt-2 text-xs py-1 rounded text-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              Remove Color
            </button>
          </div>
        )}
      </div>

      {/* Highlight */}
      <div>
        <button type="button"
          onMouseDown={e => { e.preventDefault(); openDropdown('highlight', e.currentTarget, 165); }}
          title="Highlight Color"
          className="flex flex-col items-center gap-0.5 p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
        >
          <Highlighter size={13} />
          <span className="w-4 h-1 rounded-sm bg-yellow-300" />
        </button>
        {open === 'highlight' && (
          <div style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, width: '160px', zIndex: 9999 }}
            className="p-2.5 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
            onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()}>
            <p className="text-xs font-medium mb-2 text-gray-500 dark:text-gray-400">Highlight</p>
            <div className="grid grid-cols-8 gap-1">
              {HIGHLIGHT_COLORS.map(c => (
                <button key={c} type="button"
                  onMouseDown={e => { e.preventDefault(); editor.chain().focus().setHighlight({ color: c }).run(); closeAll(); }}
                  className="w-5 h-5 rounded-sm border border-gray-200/50 hover:scale-110 transition-transform ring-offset-1 hover:ring-2 ring-primarycolor"
                  style={{ backgroundColor: c }} title={c}
                />
              ))}
            </div>
            <button type="button"
              onMouseDown={e => { e.preventDefault(); editor.chain().focus().unsetHighlight().run(); closeAll(); }}
              className="w-full mt-2 text-xs py-1 rounded text-center text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
              Remove Highlight
            </button>
          </div>
        )}
      </div>

      <Divider />

      {/* Alignment */}
      <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left"><AlignLeft size={14} /></Btn>
      <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align Center"><AlignCenter size={14} /></Btn>
      <Btn onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align Right"><AlignRight size={14} /></Btn>
      <Btn onClick={() => editor.chain().focus().setTextAlign('justify').run()} active={editor.isActive({ textAlign: 'justify' })} title="Justify"><AlignJustify size={14} /></Btn>

      <Divider />

      {/* Lists */}
      <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List"><List size={14} /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered List"><ListOrdered size={14} /></Btn>
      <Btn onClick={() => editor.chain().focus().sinkListItem('listItem').run()} disabled={!editor.can().sinkListItem('listItem')} title="Indent"><Indent size={14} /></Btn>
      <Btn onClick={() => editor.chain().focus().liftListItem('listItem').run()} disabled={!editor.can().liftListItem('listItem')} title="Outdent"><Outdent size={14} /></Btn>

      <Divider />

      {/* Link */}
      <Btn onClick={openLink} active={editor.isActive('link')} title="Insert / Edit Link"><LinkIcon size={14} /></Btn>
      <Btn onClick={() => editor.chain().focus().unsetLink().run()} disabled={!editor.isActive('link')} title="Remove Link"><Unlink size={14} /></Btn>

      {/* Image */}
      <Btn onClick={() => { setShowImage(true); closeAll(); }} title="Insert Image"><ImageIcon size={14} /></Btn>

      {/* Table */}
      <div>
        <Btn onClick={e => openDropdown('table', e?.currentTarget, 210)} active={editor.isActive('table') || open === 'table'} title="Table"><TableIcon size={14} /></Btn>
        {open === 'table' && (
          <div style={{ position: 'fixed', top: dropdownPos.top, left: dropdownPos.left, width: '210px', zIndex: 9999 }}
            className="p-3 rounded-lg shadow-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800"
            onMouseDown={e => e.stopPropagation()} onClick={e => e.stopPropagation()} onMouseLeave={() => setTableHover({ r: 0, c: 0 })}>
            {editor.isActive('table') ? (
              /* Table context ops */
              <div style={{ minWidth: '170px' }}>
                <p className="text-xs font-semibold mb-2 text-gray-500 dark:text-gray-400 uppercase tracking-wide">Table Operations</p>
                <div className="space-y-0.5">
                  {[
                    { label: 'Add column before',  action: () => editor.chain().focus().addColumnBefore().run() },
                    { label: 'Add column after',   action: () => editor.chain().focus().addColumnAfter().run() },
                    { label: 'Delete column',       action: () => editor.chain().focus().deleteColumn().run() },
                    null,
                    { label: 'Add row before',     action: () => editor.chain().focus().addRowBefore().run() },
                    { label: 'Add row after',       action: () => editor.chain().focus().addRowAfter().run() },
                    { label: 'Delete row',          action: () => editor.chain().focus().deleteRow().run() },
                    null,
                    { label: 'Merge cells',         action: () => editor.chain().focus().mergeCells().run() },
                    { label: 'Split cell',          action: () => editor.chain().focus().splitCell().run() },
                    null,
                    { label: 'Delete table',        action: () => editor.chain().focus().deleteTable().run(), danger: true },
                  ].map((item, i) =>
                    item === null
                      ? <div key={i} className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
                      : (
                        <button key={item.label} type="button"
                          onMouseDown={e => { e.preventDefault(); item.action(); closeAll(); }}
                          className={`w-full text-left text-xs px-2 py-1.5 rounded transition-colors ${
                            item.danger
                              ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20'
                              : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
                          }`}
                        >{item.label}</button>
                      )
                  )}
                </div>
              </div>
            ) : (
              /* Table size picker */
              <div>
                <p className="text-xs font-medium mb-2 text-gray-500 dark:text-gray-400">
                  {tableHover.r > 0 ? `${tableHover.r} × ${tableHover.c} table` : 'Insert Table'}
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 18px)', gap: '2px' }}>
                  {Array.from({ length: 64 }).map((_, i) => {
                    const r = Math.floor(i / 8) + 1, c = (i % 8) + 1;
                    const on = r <= tableHover.r && c <= tableHover.c;
                    return (
                      <div key={i}
                        className={`w-[18px] h-[18px] rounded-sm border cursor-pointer transition-colors ${
                          on ? 'bg-primarycolor/40 border-primarycolor' : 'border-gray-300 dark:border-gray-600 hover:border-primarycolor/60'
                        }`}
                        onMouseEnter={() => setTableHover({ r, c })}
                        onMouseDown={e => {
                          e.preventDefault();
                          editor.chain().focus().insertTable({ rows: r, cols: c, withHeaderRow: true }).run();
                          closeAll(); setTableHover({ r: 0, c: 0 });
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Horizontal rule */}
      <Btn onClick={() => editor.chain().focus().setHorizontalRule().run()} title="Horizontal Rule"><Minus size={14} /></Btn>

      <Divider />

      {/* Code / Blockquote */}
      <Btn onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')} title="Inline Code"><Code size={14} /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code Block"><Braces size={14} /></Btn>
      <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote"><Quote size={14} /></Btn>

      <Divider />

      {/* Clear */}
      <Btn onClick={() => editor.chain().focus().clearNodes().unsetAllMarks().run()} title="Clear Formatting"><Eraser size={14} /></Btn>
    </div>
  );

  /* ── Render ────────────────────────────────────────────────── */
  return (
    <div>
      {label && (
        <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
          {label}{required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className={`border rounded-lg overflow-y-auto focus-within:ring-2 focus-within:ring-primarycolor focus-within:border-primarycolor transition-all ${
        isDark ? 'border-gray-600 bg-gray-900' : 'border-gray-300 bg-white'
      }`} style={{ maxHeight: `${rows * 2.8 + 6}rem` }}>
        {toolbar}
        <EditorContent editor={editor} className="tiptap-editor" />
      </div>

      {/* ── Link dialog ─────────────────────────────────────── */}
      {showLink && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => setShowLink(false)}>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div className={`relative z-10 rounded-xl shadow-2xl p-5 w-full max-w-sm ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
            onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-semibold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
              <LinkIcon size={16} className="text-primarycolor" />
              {editor.isActive('link') ? 'Edit Link' : 'Insert Link'}
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-500 dark:text-gray-400">URL</label>
                <input type="url" value={linkUrl} onChange={e => setLinkUrl(e.target.value)}
                  placeholder="https://example.com" autoFocus
                  className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primarycolor transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                  onKeyDown={e => { if (e.key === 'Enter') applyLink(); if (e.key === 'Escape') setShowLink(false); }}
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={linkNewTab} onChange={e => setLinkNewTab(e.target.checked)}
                  className="rounded border-gray-300 text-primarycolor focus:ring-primarycolor" />
                <span className="text-sm text-gray-600 dark:text-gray-300">Open in new tab</span>
              </label>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              {editor.isActive('link') && (
                <button type="button" onClick={() => { editor.chain().focus().unsetLink().run(); setShowLink(false); }}
                  className="px-3 py-2 rounded-lg text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  Remove
                </button>
              )}
              <button type="button" onClick={() => setShowLink(false)}
                className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                Cancel
              </button>
              <button type="button" onClick={applyLink}
                className="px-4 py-2 rounded-lg text-sm font-medium bg-primarycolor text-white hover:bg-primarydarkcolor disabled:opacity-50 transition-colors"
                disabled={!linkUrl.trim()}>
                {editor.isActive('link') ? 'Update' : 'Insert'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Image dialog ─────────────────────────────────────── */}
      {showImage && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={() => { setShowImage(false); setImageUrl(''); }}>
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
          <div className={`relative z-10 rounded-xl shadow-2xl p-5 w-full max-w-md ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold flex items-center gap-2 text-gray-900 dark:text-white">
                <ImageIcon size={16} className="text-primarycolor" /> Insert Image
              </h3>
              <button type="button" onClick={() => { setShowImage(false); setImageUrl(''); }}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <X size={15} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex rounded-lg p-1 mb-4 bg-gray-100 dark:bg-gray-700">
              {['url', 'upload'].map(t => (
                <button key={t} type="button" onClick={() => setImageTab(t)}
                  className={`flex-1 py-1.5 rounded-md text-sm font-medium capitalize transition-colors ${
                    imageTab === t
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                  {t === 'url' ? 'Image URL' : 'Upload File'}
                </button>
              ))}
            </div>

            {imageTab === 'url' ? (
              <>
                <input type="url" value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg" autoFocus
                  className={`w-full px-3 py-2.5 border rounded-lg text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primarycolor transition-colors ${isDark ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400'}`}
                  onKeyDown={e => { if (e.key === 'Enter') insertImageUrl(); if (e.key === 'Escape') setShowImage(false); }}
                />
                {imageUrl.trim() && (
                  <div className={`rounded-lg border mb-3 flex items-center justify-center overflow-hidden ${isDark ? 'border-gray-600 bg-gray-900/50' : 'border-gray-200 bg-gray-50'}`}
                    style={{ height: '120px' }}>
                    <img src={imageUrl.trim()} alt="preview" className="max-h-full max-w-full object-contain"
                      onError={e => { e.currentTarget.style.display = 'none'; }} />
                  </div>
                )}
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => { setShowImage(false); setImageUrl(''); }}
                    className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">Cancel</button>
                  <button type="button" onClick={insertImageUrl} disabled={!imageUrl.trim()}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-primarycolor text-white hover:bg-primarydarkcolor disabled:opacity-50 disabled:cursor-not-allowed transition-colors">Insert</button>
                </div>
              </>
            ) : (
              <>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={insertImageFile} />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className={`w-full border-2 border-dashed rounded-xl py-10 flex flex-col items-center gap-3 transition-colors ${isDark ? 'border-gray-600 text-gray-400 hover:border-primarycolor hover:text-primarycolor' : 'border-gray-300 text-gray-400 hover:border-primarycolor hover:text-primarycolor'}`}>
                  <Upload size={28} />
                  <div className="text-center">
                    <p className="text-sm font-medium">Click to upload</p>
                    <p className="text-xs opacity-60 mt-0.5">PNG, JPG, GIF, WEBP</p>
                  </div>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* ── Editor + table styles ─────────────────────────────── */}
      <style jsx global>{`
        .tiptap-editor .ProseMirror {
          min-height: ${rows * 2.2}rem;
          padding: 1rem 1.25rem;
          outline: none;
          color: ${isDark ? '#fafafa' : '#0a0a0a'};
          font-family: inherit;
          font-size: 1rem;
          line-height: 1.8;
          word-break: break-word;
        }

        /* Placeholder */
        .tiptap-editor .ProseMirror p.is-editor-empty:first-child::before {
          color: ${isDark ? '#6b7280' : '#9ca3af'};
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }

        /* Headings */
        .tiptap-editor .ProseMirror h1,
        .tiptap-editor .ProseMirror h2,
        .tiptap-editor .ProseMirror h3,
        .tiptap-editor .ProseMirror h4,
        .tiptap-editor .ProseMirror h5,
        .tiptap-editor .ProseMirror h6 { font-family: inherit; color: ${isDark ? '#fafafa' : '#0a0a0a'}; }
        .tiptap-editor .ProseMirror h1 { font-size: 2em; font-weight: 700; margin: 0.75em 0 0.4em; line-height: 1.25; }
        .tiptap-editor .ProseMirror h2 { font-size: 1.5em; font-weight: 700; margin: 0.75em 0 0.4em; line-height: 1.3; }
        .tiptap-editor .ProseMirror h3 { font-size: 1.25em; font-weight: 600; margin: 0.75em 0 0.4em; }
        .tiptap-editor .ProseMirror h4 { font-size: 1.1em; font-weight: 600; margin: 0.75em 0 0.4em; }
        .tiptap-editor .ProseMirror h5 { font-size: 1em; font-weight: 600; margin: 0.75em 0 0.4em; }
        .tiptap-editor .ProseMirror h6 { font-size: 0.875em; font-weight: 600; margin: 0.75em 0 0.4em; }

        /* Paragraph */
        .tiptap-editor .ProseMirror p { margin: 0.5em 0; min-height: 1.6em; }

        /* Lists */
        .tiptap-editor .ProseMirror ul { list-style-type: disc; padding-left: 1.6em; margin: 0.5em 0; }
        .tiptap-editor .ProseMirror ol { list-style-type: decimal; padding-left: 1.6em; margin: 0.5em 0; }
        .tiptap-editor .ProseMirror li { margin: 0.25em 0; }
        .tiptap-editor .ProseMirror li > p { margin: 0; }

        /* Blockquote */
        .tiptap-editor .ProseMirror blockquote {
          border-left: 3px solid rgb(var(--primary-color-rgb));
          margin: 1em 0;
          padding: 0.6em 1rem;
          background: ${isDark ? '#1f2937' : '#fdf9ff'};
          border-radius: 0 0.375rem 0.375rem 0;
          color: ${isDark ? '#9ca3af' : '#4b5563'};
          font-style: italic;
        }

        /* Inline code */
        .tiptap-editor .ProseMirror code {
          background: ${isDark ? '#374151' : '#f1f5f9'};
          border-radius: 0.25rem;
          font-family: "Courier New", monospace;
          font-size: 0.875em;
          padding: 0.15em 0.4em;
          color: ${isDark ? '#fca5a5' : '#be123c'};
        }

        /* Code block */
        .tiptap-editor .ProseMirror pre {
          background: ${isDark ? '#0f172a' : '#1e293b'};
          color: #e2e8f0;
          border-radius: 0.5rem;
          padding: 1rem 1.25rem;
          font-size: 0.875em;
          overflow-x: auto;
          margin: 0.75em 0;
          font-family: "Courier New", monospace;
        }
        .tiptap-editor .ProseMirror pre code { background: none; padding: 0; color: inherit; font-size: inherit; }

        /* HR */
        .tiptap-editor .ProseMirror hr {
          border: none;
          border-top: 2px solid ${isDark ? '#374151' : '#e5e7eb'};
          margin: 1.5em 0;
        }

        /* Links */
        .tiptap-editor .ProseMirror a {
          color: rgb(var(--primary-color-rgb));
          text-decoration: underline;
          cursor: pointer;
        }

        /* Images */
        .tiptap-editor .ProseMirror img {
          max-width: 100%;
          border-radius: 0.5rem;
          display: block;
          margin: 0.75em 0;
          cursor: default;
        }
        .tiptap-editor .ProseMirror img.ProseMirror-selectednode {
          outline: 3px solid rgb(var(--primary-color-rgb));
          outline-offset: 2px;
        }

        /* ── Tables ───────────────────────────────────── */
        .tiptap-editor .ProseMirror table {
          border-collapse: collapse;
          margin: 1em 0;
          table-layout: fixed;
          width: 100%;
          overflow: hidden;
        }
        .tiptap-editor .ProseMirror td,
        .tiptap-editor .ProseMirror th {
          border: 1px solid ${isDark ? '#4b5563' : '#d1d5db'};
          box-sizing: border-box;
          min-width: 1em;
          padding: 0.5rem 0.75rem;
          position: relative;
          vertical-align: top;
          color: ${isDark ? '#b8b8b8' : '#818181'};
        }
        .tiptap-editor .ProseMirror th {
          background: ${isDark ? '#1f2937' : '#f9fafb'};
          font-weight: 600;
          text-align: left;
        }
        .tiptap-editor .ProseMirror tr:nth-child(even) td {
          background: ${isDark ? '#111827' : '#ffffff'};
        }
        .tiptap-editor .ProseMirror tr:nth-child(odd) td {
          background: ${isDark ? '#0f172a' : '#f9fafb'};
        }
        .tiptap-editor .ProseMirror .selectedCell::after {
          background: rgba(var(--primary-color-rgb), 0.12);
          content: '';
          inset: 0;
          pointer-events: none;
          position: absolute;
          z-index: 2;
        }
        .tiptap-editor .ProseMirror .column-resize-handle {
          background: rgb(var(--primary-color-rgb));
          bottom: -2px;
          pointer-events: none;
          position: absolute;
          right: -2px;
          top: 0;
          width: 3px;
        }
        .tiptap-editor .ProseMirror.resize-cursor {
          cursor: col-resize;
        }

        /* Selection */
        .tiptap-editor .ProseMirror ::selection {
          background: rgba(var(--primary-color-rgb), 0.18);
        }

        /* Focus — handled by the outer border ring */
        .tiptap-editor .ProseMirror:focus { outline: none; }

        /* Gap cursor */
        .tiptap-editor .ProseMirror .ProseMirror-gapcursor::after {
          border-top: 1px solid ${isDark ? '#9ca3af' : '#6b7280'};
        }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
