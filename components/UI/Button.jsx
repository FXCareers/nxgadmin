'use client';

import { useSelector } from 'react-redux';

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  className = '',
  type = 'button'
}) => {
  const { isDark } = useSelector((state) => state.theme);

  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: isDark
      ? 'bg-yellow-500 text-black hover:bg-yellow-400 focus:ring-yellow-400'
      : 'bg-yellow-400 text-black hover:bg-yellow-500 focus:ring-yellow-400',
    secondary: isDark
      ? 'bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500'
      : 'bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-400',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-400',
    outline: isDark
      ? 'border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black'
      : 'border-2 border-yellow-400 text-yellow-600 hover:bg-yellow-400 hover:text-black',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  const disabledClasses = 'opacity-50 cursor-not-allowed';

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${sizes[size]} ${
        disabled ? disabledClasses : ''
      } ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;