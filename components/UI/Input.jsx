'use client';

import React from 'react';

const Input = ({ 
  label, 
  type = 'text', 
  name, 
  value, 
  onChange, 
  placeholder, 
  error, 
  disabled = false, 
  className = '',
  ...props 
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label 
          htmlFor={name} 
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      <input
        id={name}
        name={name}
        type={type}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full px-3 py-2 border rounded-lg shadow-sm
          focus:outline-none focus:ring-2 focus:ring-primarydarkcolor focus:border-primarydarkcolor
          disabled:bg-gray-100 disabled:cursor-not-allowed
          dark:bg-gray-800 dark:border-gray-600 dark:text-white
          dark:placeholder-gray-400 dark:focus:ring-primarycolor dark:focus:border-primarycolor
          ${error ? 'border-red-500 dark:border-red-400' : 'border-gray-300 dark:border-gray-600'}
          ${className}
        `}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;