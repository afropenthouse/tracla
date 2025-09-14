"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { useToastStore } from "@/store/toastStore";
import Link from "next/link";
import { 
  Mail, Lock, ArrowLeft, Eye, EyeOff, Shield, CheckCircle, 
  AlertCircle, RefreshCw, ArrowRight 
} from 'lucide-react';
import api from "@/lib/api";
import { useLoadingStore } from "@/store/loadingStore";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showLoader, hideLoader } = useLoadingStore();
  const { showSuccess, showError } = useToastStore();
  
  // Get email from URL params (from forgot password flow)
  const email = searchParams.get('email') || '';
  
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  
  const inputRefs = useRef([]);

  const resetPasswordMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/auth/reset-password", {
        email: data.email,
        otpCode: data.otpCode,
        newPassword: data.newPassword
      });
      return response.data;
    },
    onMutate: () => {
      showLoader({
        text: "Resetting your password...",
        loaderColor: "#6c0f2a",
        textColor: "#ffffff",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
      });
    },
    onSuccess: () => {
      hideLoader();
      setIsSuccess(true);
      showSuccess("Password reset successfully! Please login with your new password.");
    },
    onError: (error) => {
      hideLoader();
      
      const errorData = error.response?.data;
      const errorMessage = errorData?.message || errorData?.error || "Failed to reset password. Please try again.";
      
      if (error.response?.status === 400) {
        // Invalid or expired OTP
        setErrors({ 
          otp: "Invalid or expired verification code. Please check your code or request a new one." 
        });
        // Clear the OTP inputs
        setOtpCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else if (error.response?.status === 401) {
        // Unauthorized
        setErrors({ general: "Invalid credentials. Please try again." });
      } else {
        // Other errors
        setErrors({ general: errorMessage });
      }
    },
  });

  // Handle OTP input changes
  const handleOtpChange = (index, value) => {
    if (value.length > 1) {
      // Handle paste
      const pastedValue = value.slice(0, 6);
      const newOtp = pastedValue.split('').concat(Array(6 - pastedValue.length).fill(''));
      setOtpCode(newOtp);
      
      // Focus on the last filled input or the next empty one
      const nextIndex = Math.min(pastedValue.length - 1, 5);
      inputRefs.current[nextIndex]?.focus();
    } else {
      // Handle single digit input
      const newOtp = [...otpCode];
      newOtp[index] = value;
      setOtpCode(newOtp);
      
      // Auto-focus next input
      if (value && index < 5) {
        inputRefs.current[index + 1]?.focus();
      }
    }
    
    // Clear OTP error when user types
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: '' }));
    }
  };

  // Handle key navigation in OTP inputs
  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Handle paste event for OTP
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, 6);
    if (/^\d+$/.test(pastedData)) {
      const newOtp = pastedData.split('').concat(Array(6 - pastedData.length).fill(''));
      setOtpCode(newOtp);
      inputRefs.current[Math.min(pastedData.length - 1, 5)]?.focus();
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate OTP
    const otpValue = otpCode.join('');
    if (otpValue.length !== 6 || !/^\d+$/.test(otpValue)) {
      newErrors.otp = "Please enter a valid 6-digit verification code";
    }
    
    // Validate password
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters long";
    }
    
    // Validate confirm password
    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    setErrors({});
    if (validateForm()) {
      resetPasswordMutation.mutate({
        email,
        otpCode: otpCode.join(''),
        newPassword: password
      });
    }
  };

  // Clear field errors on input
  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    if (errors.password) {
      setErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const handleConfirmPasswordChange = (e) => {
    setConfirmPassword(e.target.value);
    if (errors.confirmPassword) {
      setErrors(prev => ({ ...prev, confirmPassword: '' }));
    }
  };

  // Auto-focus first OTP input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-red-50 to-rose-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Reset Successful!</h2>
          <p className="text-gray-600 mb-6">
            Your password has been reset successfully. You can now log in with your new password.
          </p>
          <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 rounded-xl p-4 mb-6 text-left">
            <p className="text-sm text-blue-700 font-medium mb-2">Security Notice:</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• All your previous sessions have been invalidated</li>
              <li>• You'll need to log in again on all devices</li>
              <li>• Make sure to use a strong, unique password</li>
            </ul>
          </div>
          <Link 
            href="/login"
            className="w-full bg-gradient-to-r from-[#6c0f2a] to-rose-600 text-white py-3 px-4 rounded-xl hover:to-[#6c0f2a] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl inline-flex items-center justify-center gap-2 cursor-pointer"
          >
            Go to Login
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-red-50 to-rose-50 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#6c0f2a] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock size={32} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Your Password</h1>
          <p className="text-gray-600">
            Enter the verification code sent to <strong>{email}</strong> and your new password.
          </p>
        </div>

        {/* General Error */}
        {errors.general && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl"
          >
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600">{errors.general}</p>
            </div>
          </motion.div>
        )}

        {/* OTP Input */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Verification Code
          </label>
          <div className="flex justify-center gap-3">
            {otpCode.map((digit, index) => (
              <input
                key={index}
                ref={el => inputRefs.current[index] = el}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleOtpKeyDown(index, e)}
                onPaste={index === 0 ? handleOtpPaste : undefined}
                className={`w-12 h-12 text-center text-xl font-bold rounded-xl border-2 ${
                  errors.otp 
                    ? 'border-red-400 bg-red-50/50' 
                    : digit
                    ? 'border-[#6c0f2a] bg-[#6c0f2a]/5'
                    : 'border-gray-200 bg-white/50'
                } backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#6c0f2a]/20 focus:border-[#6c0f2a] transition-all duration-300`}
                disabled={resetPasswordMutation.isPending}
              />
            ))}
          </div>
          {errors.otp && (
            <p className="mt-2 text-sm text-red-600 text-center">{errors.otp}</p>
          )}
          <p className="mt-2 text-xs text-gray-500 text-center">
            Enter the 6-digit code sent to your email
          </p>
        </div>

        {/* New Password */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            New Password
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter your new password"
              className={`w-full pl-10 pr-12 py-3 rounded-xl border ${
                errors.password ? 'border-red-400 bg-red-50/50' : 'border-gray-200 bg-white/50'
              } backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#6c0f2a]/20 focus:border-[#6c0f2a] transition-all duration-300`}
              disabled={resetPasswordMutation.isPending}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-[#6c0f2a] transition-colors"
              disabled={resetPasswordMutation.isPending}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-2 text-sm text-red-600">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Confirm New Password
          </label>
          <div className="relative">
            <Lock size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10" />
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              placeholder="Confirm your new password"
              className={`w-full pl-10 pr-12 py-3 rounded-xl border ${
                errors.confirmPassword ? 'border-red-400 bg-red-50/50' : 'border-gray-200 bg-white/50'
              } backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#6c0f2a]/20 focus:border-[#6c0f2a] transition-all duration-300`}
              disabled={resetPasswordMutation.isPending}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-[#6c0f2a] transition-colors"
              disabled={resetPasswordMutation.isPending}
            >
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
          {errors.confirmPassword && (
            <p className="mt-2 text-sm text-red-600">{errors.confirmPassword}</p>
          )}
        </div>

        {/* Security Notice */}
        <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Shield size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm text-blue-700">
              <p className="font-medium mb-1">Create a strong password:</p>
              <ul className="text-xs space-y-1">
                <li>• At least 8 characters long</li>
                <li>• Mix of uppercase, lowercase, numbers, and symbols</li>
                <li>• Avoid common words or personal information</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={resetPasswordMutation.isPending}
          className="w-full bg-gradient-to-r from-[#6c0f2a] to-rose-600 text-white py-3 px-4 rounded-xl hover:to-[#6c0f2a] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mb-4"
        >
          {resetPasswordMutation.isPending ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Resetting Password...</span>
            </>
          ) : (
            <>
              Reset Password
              <ArrowRight size={18} />
            </>
          )}
        </button>

        {/* Back to Login */}
        <div className="text-center">
          <Link 
            href="/login"
            className="inline-flex items-center gap-2 text-sm text-[#6c0f2a] hover:text-[#d32f2f] transition-colors"
          >
            <ArrowLeft size={16} />
            Back to Login
          </Link>
        </div>
      </motion.div>
    </div>
  );
}