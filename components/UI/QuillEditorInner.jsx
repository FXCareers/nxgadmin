'use client';
import ReactQuill from 'react-quill';

const QuillEditorInner = ({ value, onChange, placeholder, modules, formats }) => (
  <ReactQuill
    theme="snow"
    value={value || ''}
    onChange={onChange}
    placeholder={placeholder}
    modules={modules}
    formats={formats}
  />
);

export default QuillEditorInner;
