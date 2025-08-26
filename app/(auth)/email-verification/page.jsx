"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import { Mail, ArrowLeft, RefreshCw } from 'lucide-react';
import api from "@/lib/api";
import { useLoadingStore } from "@/store/loadingStore";
import { useSignUpEmailStore } from "@/store/store";

export default function EmailVerificationPage() {
  const router = useRouter();
  const { showLoader, hideLoader } = useLoadingStore();
  const { email, clearEmail } = useSignUpEmailStore();  
    console.log(email, 'email in email-verification');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [errors, setErrors] = useState({});
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const inputRefs = useRef([]);

  // Redirect if no email stored (user didn't come from signup)
//   useEffect(() => {
//     if (!email) {
//       router.push('/signup');
//     }
//   }, [email]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const verifyEmailMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/auth/verify-email", {
        email: data.email,
        otpCode: data.otpCode,
      });
      return response.data;
    },
    onMutate: () => {
      showLoader({
        text: "Verifying your email...",
        loaderColor: "#1A73E8",
        textColor: "#ffffff",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
      });
    },
    onSuccess: () => {
      hideLoader();
        clearEmail(); // Clear stored email
      toast.success("Email verified successfully! You can now log in to your account.");
      router.push("/login");
    },
    onError: (error) => {
      hideLoader();
      
      const errorData = error.response?.data;
      const errorMessage = errorData?.message || "Verification failed. Please try again.";
      
      if (error.response?.status === 400) {
        // Invalid or expired OTP
        setErrors({ 
          otp: "Invalid or expired verification code. Please check your code or request a new one." 
        });
        // Clear the OTP inputs
        setOtpCode(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      } else if (error.response?.status === 422) {
        // Business logic errors
        setErrors({ general: errorMessage });
      } else {
        // Network or other errors
        toast.error(errorMessage);
      }
    },
  });

  const resendOtpMutation = useMutation({
    mutationFn: async (email) => {
      // Based on API docs, we might need a separate resend endpoint
      // or re-trigger registration. Check your API documentation.
      const response = await api.post("/auth/resend-verification", {
        email: email,
      });
      return response.data;
    },
    onMutate: () => {
      setIsResending(true);
    },
    onSuccess: () => {
      setIsResending(false);
      setResendCooldown(60); // 60 second cooldown
      toast.success("Verification code sent! Please check your email.");
      // Clear any existing errors
      setErrors({});
    },
    onError: (error) => {
      setIsResending(false);
      const errorMessage = error.response?.data?.message || "Failed to resend code. Please try again.";
      toast.error(errorMessage);
    },
  });

  const handleOtpChange = (index, value) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);

    // Clear errors when user starts typing
    if (errors.otp) {
      setErrors(prev => ({ ...prev, otp: "" }));
    }

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all fields are filled
    if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
      handleSubmit(null, newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    
    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then(text => {
        const pastedCode = text.replace(/\D/g, '').slice(0, 6);
        if (pastedCode.length === 6) {
          const newOtp = pastedCode.split('');
          setOtpCode(newOtp);
          inputRefs.current[5]?.focus();
          // Auto-submit pasted code
          setTimeout(() => handleSubmit(null, pastedCode), 100);
        }
      });
    }
  };

  const handleSubmit = (e, codeOverride) => {
    if (e) e.preventDefault();
    
    const code = codeOverride || otpCode.join('');
    
    if (code.length !== 6) {
      setErrors({ otp: "Please enter the complete 6-digit verification code." });
      return;
    }

    if (!email) {
      setErrors({ general: "Email information missing. Please sign up again." });
      return;
    }

    setErrors({});
    verifyEmailMutation.mutate({
      email: email,
      otpCode: code,
    });
  };

  const handleResendCode = () => {
    if (resendCooldown > 0 || isResending) return;
    resendOtpMutation.mutate(email);
  };

  if (!email) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F9FAFC] via-[#EFF6FF] to-[#DBEAFE] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8"
      >
        {/* Back button */}
        <motion.button
          onClick={() => router.back()}
          className="mb-6 flex items-center text-[#6B7280] hover:text-[#1A73E8] transition-colors"
          whileHover={{ x: -2 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <ArrowLeft size={20} className="mr-2" />
          Back
        </motion.button>

        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            className="w-16 h-16 bg-gradient-to-r from-[#1A73E8] to-[#1557B0] rounded-2xl flex items-center justify-center mx-auto mb-4"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            whileHover={{ scale: 1.05, rotate: 5 }}
          >
            <Mail size={32} className="text-white" />
          </motion.div>
          
          <motion.h1
            className="text-3xl font-bold text-[#222222] mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Verify Your Email
          </motion.h1>
          
          <motion.p
            className="text-[#6B7280] mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            We've sent a 6-digit verification code to
          </motion.p>
          
          <motion.p
            className="text-[#1A73E8] font-medium"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            {email}
          </motion.p>
        </div>

        {/* General Error Message */}
        {errors.general && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <p className="text-sm text-red-600">{errors.general}</p>
          </motion.div>
        )}

        {/* OTP Input Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-4 text-center">
              Enter verification code
            </label>
            
            <div className="flex justify-center space-x-2 mb-4">
              {otpCode.map((digit, index) => (
                <motion.input
                  key={index}
                  ref={el => inputRefs.current[index] = el}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className={`w-12 h-12 text-center text-xl font-semibold border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 focus:border-[#1A73E8] transition-all duration-200 ${
                    errors.otp ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={verifyEmailMutation.isPending}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.1, duration: 0.3 }}
                  whileFocus={{ scale: 1.05 }}
                />
              ))}
            </div>
            
            {errors.otp && (
              <p className="text-sm text-red-600 text-center">{errors.otp}</p>
            )}
          </div>

          {/* Verify Button */}
          <motion.button
            type="submit"
            disabled={verifyEmailMutation.isPending || otpCode.some(digit => !digit)}
            className="w-full bg-gradient-to-r from-[#1A73E8] to-[#1557B0] text-white py-3 px-4 rounded-xl hover:from-[#1557B0] hover:to-[#0B2E68] transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.5 }}
          >
            {verifyEmailMutation.isPending ? "Verifying..." : "Verify Email"}
          </motion.button>
        </form>

        {/* Resend Section */}
        <motion.div
          className="mt-6 text-center space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }}
        >
          <p className="text-sm text-[#6B7280]">
            Didn't receive the code?
          </p>
          
          <button
            onClick={handleResendCode}
            disabled={resendCooldown > 0 || isResending}
            className="inline-flex items-center text-sm text-[#1A73E8] hover:text-[#1557B0] font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <RefreshCw 
              size={16} 
              className={`mr-2 ${isResending ? 'animate-spin' : ''}`} 
            />
            {resendCooldown > 0 
              ? `Resend code in ${resendCooldown}s` 
              : isResending 
                ? "Sending..." 
                : "Resend code"
            }
          </button>
        </motion.div>

        {/* Additional Help */}
        <motion.div
          className="mt-8 pt-6 border-t border-gray-100 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6, duration: 0.5 }}
        >
          <p className="text-sm text-[#6B7280] mb-2">
            Having trouble with verification?
          </p>
          <div className="space-x-4">
            <Link 
              href="/contact" 
              className="text-sm text-[#1A73E8] hover:text-[#1557B0] font-medium"
            >
              Contact Support
            </Link>
            <span className="text-gray-300">|</span>
            <Link 
              href="/signup" 
              className="text-sm text-[#1A73E8] hover:text-[#1557B0] font-medium"
            >
              Start Over
            </Link>
          </div>
        </motion.div>
      </motion.div>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[#1A73E8]/5 blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#1557B0]/5 blur-3xl"></div>
      </div>
    </div>
  );
}