'use client';

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createUser } from '@/store/slices/userSlice';
import { apiClient } from '@/lib/api';
import Input from '@/components/UI/Input';
import Select from '@/components/UI/Select';
import Button from '@/components/UI/Button';
import { Eye, EyeOff, User, Mail, Lock, Phone, Loader2, AlertCircle } from 'lucide-react';

const AddUserForm = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    email: '',
    password: '',
    confirmPassword: '',
    mobile: '',
    role: 'user',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});

  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');
  const [otpUserId, setOtpUserId] = useState(null);
  const [otpLoading, setOtpLoading] = useState(false);

  const dispatch = useDispatch();
  const { createLoading, error } = useSelector((state) => state.user);
  const { isDark } = useSelector((state) => state.theme);

  const roleOptions = [
    { value: 'user', label: 'User' },
    { value: 'admin', label: 'Admin' },
    { value: 'editor', label: 'Editor' },
    { value: 'leadmanager', label: 'Lead Manager' },
  ];

  const validateForm = () => {
    const errors = {};

    if (!formData.fname?.trim()) errors.fname = 'First name is required';
    if (!formData.lname?.trim()) errors.lname = 'Last name is required';
    if (!formData.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errors.email = 'Email is invalid';
    if (!formData.password) errors.password = 'Password is required';
    else if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
    if (formData.password !== formData.confirmPassword) errors.confirmPassword = 'Passwords do not match';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      // First step: create user via /auth/signup and get userId for OTP
      const response = await dispatch(createUser(formData)).unwrap();

      const userId = response?.userId || response?.data?.userId;
      const message = response?.message || response?.data?.message || 'OTP sent to email';

      if (userId) {
        setOtpUserId(userId);
        setIsOtpStep(true);
        setOtpCode('');
        setOtpError('');
        setOtpSuccess(message);
      } else {
        // If no userId returned, treat as error
        setOtpError('Failed to start OTP verification. Please try again.');
      }
    } catch (err) {
      // error is handled by the slice, just logging for debug
      console.error('Failed to create user:', err);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();

    if (!otpCode || otpCode.length < 6) {
      setOtpError('Please enter the 6-digit OTP sent to email.');
      return;
    }

    if (!otpUserId) {
      setOtpError('Missing user information. Please restart the process.');
      return;
    }

    try {
      setOtpLoading(true);
      setOtpError('');

      const payload = {
        userId: otpUserId,
        otp: otpCode,
      };

      const response = await apiClient.request('/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify(payload),
        skipAuth: true,
      });

      if (response?.status === 'success' || response?.success === true) {
        setOtpSuccess('User verified successfully.');
        onSuccess();
      } else {
        setOtpError(response?.message || 'Failed to verify OTP. Please try again.');
      }
    } catch (error) {
      console.error('Failed to verify OTP:', error);
      setOtpError(error?.message || 'Failed to verify OTP. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  if (isOtpStep) {
    return (
      <form onSubmit={handleOtpSubmit} className="space-y-4">
        {otpSuccess && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <p className="text-sm text-green-700 dark:text-green-300">{otpSuccess}</p>
          </div>
        )}

        {otpError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
            <p className="text-sm text-red-600 dark:text-red-400">{otpError}</p>
          </div>
        )}

        <Input
          label="Enter OTP"
          type="text"
          value={otpCode}
          onChange={(e) => setOtpCode(e.target.value)}
          placeholder="Enter OTP sent to user's email"
          disabled={otpLoading}
        />

        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            onClick={onClose}
            variant="secondary"
            className="bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
            disabled={otpLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={otpLoading}
            className="flex items-center justify-center"
          >
            {otpLoading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
            {otpLoading ? 'Verifying OTP...' : 'Verify & Create User'}
          </Button>
        </div>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 flex items-center space-x-2">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
          <p className="text-sm text-red-600 dark:text-red-400">{typeof error === 'object' ? JSON.stringify(error) : error}</p>
        </div>
      )}

      <div className="relative">
        <Input
          label="First Name"
          type="text"
          name="fname"
          value={formData.fname}
          onChange={handleInputChange}
          placeholder="Enter first name"
          error={validationErrors.fname}
          disabled={createLoading}
          className="pl-10"
        />
        <User className="absolute left-3 top-9 w-4 h-4 text-gray-400" />
      </div>
      <div className="relative">
        <Input
          label="Last Name"
          type="text"
          name="lname"
          value={formData.lname}
          onChange={handleInputChange}
          placeholder="Enter last name"
          error={validationErrors.lname}
          disabled={createLoading}
          className="pl-10"
        />
        <User className="absolute left-3 top-9 w-4 h-4 text-gray-400" />
      </div>
      {/* <div className="relative">
        <Input
          label="Username"
          type="text"
          name="username"
          value={formData.username}
          onChange={handleInputChange}
          placeholder="Enter username"
          error={validationErrors.username}
          disabled={createLoading}
          className="pl-10"
        />
        <User className="absolute left-3 top-9 w-4 h-4 text-gray-400" />
      </div> */}
      <div className="relative">
        <Input
          label="Email Address"
          type="email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="Enter email"
          error={validationErrors.email}
          disabled={createLoading}
          className="pl-10"
        />
        <Mail className="absolute left-3 top-9 w-4 h-4 text-gray-400" />
      </div>
      <div className="relative">
        <Input
          label="Mobile Number"
          type="tel"
          name="mobile"
          value={formData.mobile}
          onChange={handleInputChange}
          placeholder="Enter mobile number"
          error={validationErrors.mobile}
          disabled={createLoading}
          className="pl-10"
        />
        <Phone className="absolute left-3 top-9 w-4 h-4 text-gray-400" />
      </div>
       <Select
        label="Role"
        name="role"
        value={formData.role}
        onChange={handleInputChange}
        options={roleOptions}
        disabled={createLoading}
      />
      <div className="relative">
        <Input
          label="Password"
          type={showPassword ? 'text' : 'password'}
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          placeholder="Enter password"
          error={validationErrors.password}
          disabled={createLoading}
          className="pl-10 pr-10"
        />
        <Lock className="absolute left-3 top-9 w-4 h-4 text-gray-400" />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-9 text-gray-400"
        >
          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      <div className="relative">
        <Input
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          placeholder="Confirm password"
          error={validationErrors.confirmPassword}
          disabled={createLoading}
          className="pl-10 pr-10"
        />
        <Lock className="absolute left-3 top-9 w-4 h-4 text-gray-400" />
        <button
          type="button"
          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          className="absolute right-3 top-9 text-gray-400"
        >
          {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          type="button"
          onClick={onClose}
          variant="secondary"
          className="bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
          disabled={createLoading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={createLoading}
          className="flex items-center justify-center"
        >
          {createLoading && <Loader2 className="w-5 h-5 animate-spin mr-2" />}
          {createLoading ? 'Adding User...' : 'Add User'}
        </Button>
      </div>
    </form>
  );
};

export default AddUserForm; 