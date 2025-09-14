"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, X, ArrowRight, Shield, RefreshCw } from 'lucide-react';
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useToastStore } from "@/store/toastStore";
import api from "@/lib/api";
import { useLoadingStore } from "@/store/loadingStore";
import { useForgotPasswordModalStore } from "@/store/modalStore";

const ForgotPasswordModal = () => {
  const { isOpen, onClose } = useForgotPasswordModalStore();
  const router = useRouter();
  const { showLoader, hideLoader } = useLoadingStore();
  const { showSuccess, showError } = useToastStore();
  
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  
  const requestPasswordResetMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/auth/request-password-reset', {
        email: data.email
      });
      return response.data;
    },
    onMutate: () => {
      showLoader({
        text: "Sending reset instructions...",
        loaderColor: "#6c0f2a",
        textColor: "#ffffff",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
      });
    },
    onSuccess: (data) => {
      hideLoader();
      setIsSubmitted(true);
      showSuccess("Password reset instructions have been sent to your email!");
    },
    onError: (error) => {
      hideLoader();
      const errorData = error.response?.data;
      const backendMessage = errorData?.message || errorData?.error || "Failed to send reset instructions. Please try again.";
      
      // For security, show the same success message even if email doesn't exist
      // But show error for inactive accounts
      if (error.response?.status === 401) {
        showError(backendMessage);
        setErrors({ general: backendMessage });
      } else {
        // For all other errors, show generic message for security
        setIsSubmitted(true);
        showSuccess("If an account exists with this email, you will receive reset instructions.");
      }
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/auth/resend-password-reset', {
        email: data.email
      });
      return response.data;
    },
    onMutate: () => {
      setResendLoading(true);
    },
    onSuccess: (data) => {
      setResendLoading(false);
      showSuccess("A new OTP has been sent to your email!");
    },
    onError: (error) => {
      setResendLoading(false);
      const errorData = error.response?.data;
      const backendMessage = errorData?.message || errorData?.error || "Failed to resend OTP. Please try again.";
      
      if (error.response?.status === 401) {
        showError(backendMessage);
      } else {
        showError("Failed to resend OTP. Please try again.");
      }
    },
  });

  const validateEmail = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    setErrors({});
    if (validateEmail()) {
      requestPasswordResetMutation.mutate({ email });
    }
  };

  const handleResend = () => {
    if (email && validateEmail()) {
      resendOtpMutation.mutate({ email });
    }
  };

  const handleClose = () => {
    setEmail('');
    setErrors({});
    setIsSubmitted(false);
    onClose();
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (errors.email) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.email;
        return newErrors;
      });
    }
    if (errors.general) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.general;
        return newErrors;
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 bg-opacity-50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#6c0f2a] rounded-xl flex items-center justify-center">
                  <Lock size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Forgot Password?</h2>
                  <p className="text-xs sm:text-sm text-gray-600">
                    {isSubmitted ? "Check your email" : "Reset your password securely"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={requestPasswordResetMutation.isPending}
              >
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            
            {/* Content */}
            <div className="p-4 sm:p-6">
              {/* General Error Message */}
              {errors.general && (
                <div className="mb-4 sm:mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl">
                  <p className="text-sm text-red-600 font-medium">{errors.general}</p>
                </div>
              )}

              {!isSubmitted ? (
                <div className="space-y-4 sm:space-y-6">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-[#6c0f2a]/10 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail size={32} className="text-[#6c0f2a]" />
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      Enter your email address and we'll send you instructions to reset your password.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10" />
                      <input
                        type="email"
                        value={email}
                        onChange={handleInputChange}
                        placeholder="Enter your email address"
                        className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                          errors.email ? 'border-red-400 bg-red-50/50' : 'border-gray-200 bg-white/50'
                        } backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#6c0f2a]/20 focus:border-[#6c0f2a] transition-all duration-300`}
                        required
                        disabled={requestPasswordResetMutation.isPending}
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600 font-medium">{errors.email}</p>
                    )}
                  </div>

                  <div className="bg-blue-50/80 backdrop-blur-sm border border-blue-200/50 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <Shield size={20} className="text-blue-600 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-700">
                        <p className="font-medium mb-1">Security Notice</p>
                        <p className="text-xs">
                          For your security, we'll send a 6-digit OTP code that expires in 10 minutes. 
                          This code can only be used once.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6 text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail size={32} className="text-green-600" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Check Your Email</h3>
                    <p className="text-sm text-gray-600 mb-4">
                      We've sent password reset instructions to <strong>{email}</strong>
                    </p>
                    <div className="bg-yellow-50/80 backdrop-blur-sm border border-yellow-200/50 rounded-xl p-4 text-left">
                      <p className="text-sm text-yellow-700">
                        <strong>Important:</strong> The OTP code will expire in 10 minutes. 
                        If you don't receive the email, please check your spam folder.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={() => {
                        // Navigate to reset password page with email as query param
                        router.push(`/reset-password?email=${encodeURIComponent(email)}`);
                        onClose();
                      }}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#6c0f2a] to-rose-600 text-white rounded-xl hover:to-[#6c0f2a] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl"
                    >
                      Enter OTP Code
                      <ArrowRight size={16} />
                    </button>

                    <div className="flex gap-3">
                      <button
                        onClick={handleResend}
                        disabled={resendLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 text-[#6c0f2a] border border-[#6c0f2a] rounded-xl hover:bg-[#6c0f2a] hover:text-white transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {resendLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-[#6c0f2a] border-t-transparent rounded-full animate-spin"></div>
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw size={16} />
                            Resend
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => {
                          setIsSubmitted(false);
                          setErrors({});
                        }}
                        className="flex-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        Change Email
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Footer */}
            {!isSubmitted && (
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 sm:p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors font-medium"
                  disabled={requestPasswordResetMutation.isPending}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={requestPasswordResetMutation.isPending || !email.trim()}
                  className="flex-1 bg-gradient-to-r from-[#6c0f2a] to-rose-600 text-white px-4 py-3 rounded-xl cursor-pointer hover:to-[#6c0f2a] transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                >
                  {requestPasswordResetMutation.isPending ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </div>
                  ) : (
                    <>
                      Send Instructions
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ForgotPasswordModal;