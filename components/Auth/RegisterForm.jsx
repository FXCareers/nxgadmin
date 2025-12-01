'use client';

import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { registerUser, clearError, verifyOtp } from '@/store/slices/authSlice';
import Input from '@/components/UI/Input';
import Button from '@/components/UI/Button';
import { Eye, EyeOff, User, Mail, Lock, Phone, Loader2, ShieldCheck } from 'lucide-react';

const RegisterForm = ({ onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    fname: '',
    lname: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState('');

  const dispatch = useDispatch();
  const { loading, error, otpPendingEmail, otpPendingUserId, otpMessage, verifyOtpLoading } = useSelector((state) => state.auth);

  useEffect(() => {
    if (otpPendingUserId) {
      setIsOtpStep(true);
      setOtpSuccess(otpMessage || 'OTP sent to your email.');
    }
  }, [otpPendingUserId, otpMessage]);

  const validateForm = () => {
    const errors = {};

    if (!formData.fname) {
      errors.fname = 'First name is required';
    }

    if (!formData.lname) {
      errors.lname = 'Last name is required';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phone) {
      errors.phone = 'Phone number is required';
    } else if (!/^\d{9,15}$/.test(formData.phone)) {
      errors.phone = 'Enter a valid phone number (9-15 digits)';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    dispatch(clearError());
    setOtpError('');

    const registrationData = {
      fname: formData.fname,
      lname: formData.lname,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      phone: formData.phone,
    };

    dispatch(registerUser(registrationData));
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length < 6) {
      setOtpError('Please enter the 6-digit OTP.');
      return;
    }

    if (!otpPendingUserId) {
      setOtpError('Missing user information. Please restart the registration.');
      return;
    }

    setOtpError('');

    try {
      await dispatch(
        verifyOtp({
          userId: otpPendingUserId,
          otp: otpCode,
        })
      ).unwrap();

      setOtpSuccess('Account verified successfully!');
      if (onSwitchToLogin) {
        setTimeout(onSwitchToLogin, 800);
      }
    } catch (err) {
      setOtpError(err || 'Failed to verify OTP. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const name = e.target.name;
    const value = e.target.value;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          {isOtpStep ? 'Verify Your Account' : 'Create Account'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          {isOtpStep ? 'Enter the OTP sent to your email to activate your account.' : 'Sign up to get started with your dashboard'}
        </p>
      </div>

      {!isOtpStep ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <Input
              label="First Name"
              type="text"
              name="fname"
              value={formData.fname}
              onChange={handleInputChange}
              placeholder="Enter your first name"
              error={validationErrors.fname}
              disabled={loading}
              className="pl-10 bg-white dark:bg-gray-800"
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
              placeholder="Enter your last name"
              error={validationErrors.lname}
              disabled={loading}
              className="pl-10 bg-white dark:bg-gray-800"
            />
            <User className="absolute left-3 top-9 w-4 h-4 text-gray-400" />
          </div>

          <div className="relative">
            <Input
              label="Email Address"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="Enter your email"
              error={validationErrors.email}
              disabled={loading}
              className="pl-10 bg-white dark:bg-gray-800"
            />
            <Mail className="absolute left-3 top-9 w-4 h-4 text-gray-400" />
          </div>

          <div className="relative">
            <Input
              label="Phone Number"
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              placeholder="Enter your phone number"
              error={validationErrors.phone}
              disabled={loading}
              className="pl-10 bg-white dark:bg-gray-800"
            />
            <Phone className="absolute left-3 top-9 w-4 h-4 text-gray-400" />
          </div>

          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Enter your password"
              error={validationErrors.password}
              disabled={loading}
              className="pl-10 pr-10 bg-white dark:bg-gray-800"
            />
            <Lock className="absolute left-3 top-9 w-4 h-4 text-gray-400" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              disabled={loading}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

 	        <div className="relative">
            <Input
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your password"
              error={validationErrors.confirmPassword}
              disabled={loading}
              className="pl-10 pr-10 bg-white dark:bg-gray-800"
            />
            <Lock className="absolute left-3 top-9 w-4 h-4 text-gray-400" />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-9 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              disabled={loading}
            >
              {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center space-x-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{loading ? 'Creating Account...' : 'Create Account'}</span>
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onSwitchToLogin}
                className="text-primarycolor dark:text-primarycolor hover:text-primarydarkcolor dark:hover:text-primarydarkcolor font-medium"
                disabled={loading}
              >
                Sign in here
              </button>
            </p>
          </div>
        </form>
      ) : (
        <form onSubmit={handleOtpSubmit} className="space-y-6">
          <div className="flex items-center space-x-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
            <p className="text-sm text-green-700 dark:text-green-300">
              {otpSuccess || 'Enter the OTP sent to your email address.'}
            </p>
          </div>

          <OtpInput
            value={otpCode}
            onChange={setOtpCode}
            disabled={verifyOtpLoading}
            error={otpError}
          />

          {(error || otpError) && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400">{otpError || error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={verifyOtpLoading}
            className="w-full flex items-center justify-center space-x-2"
          >
            {verifyOtpLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{verifyOtpLoading ? 'Verifying OTP...' : 'Verify & Continue'}</span>
          </Button>

          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Entered wrong details?{' '}
              <button
                type="button"
                onClick={() => {
                  setIsOtpStep(false);
                  setOtpCode('');
                  setOtpError('');
                  setOtpSuccess('');
                }}
                className="text-primarycolor dark:text-primarycolor hover:text-primarydarkcolor dark:hover:text-primarydarkcolor font-medium"
                disabled={verifyOtpLoading}
              >
                Go back
              </button>
            </p>
          </div>
        </form>
      )}
    </div>
  );
};

const OtpInput = ({ value, onChange, length = 6, disabled, error }) => {
  const inputRefs = useRef([]);

  const handleChange = (index, digit) => {
    if (disabled) return;
    const sanitized = digit.replace(/\D/g, '').slice(-1);
    const valueArray = value.split('');
    valueArray[index] = sanitized;
    const nextValue = valueArray.join('').slice(0, length);
    onChange(nextValue);

    if (sanitized && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === 'Backspace' && !value[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const digits = Array.from({ length }, (_, idx) => value[idx] || '');

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        Enter OTP
      </label>
      <div className="flex justify-center space-x-3">
        {digits.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputRefs.current[index] = el)}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            className="w-12 h-14 rounded-lg border border-gray-300 dark:border-gray-600 text-xl font-semibold text-center bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primarycolor disabled:opacity-60"
            disabled={disabled}
          />
        ))}
      </div>
      {error && <p className="text-sm text-red-600 dark:text-red-400 mt-2 text-center">{error}</p>}
    </div>
  );
};

export default RegisterForm;