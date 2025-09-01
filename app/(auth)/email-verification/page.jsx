"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import { Mail, ArrowLeft, RefreshCw, Sparkles } from 'lucide-react';
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
        loaderColor: "#d32f2f",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-rose-50 flex items-center justify-center p-4">
      {/* Background Decorations */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-[#d32f2f]/5 blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-[#6c0f2a]/5 blur-3xl animate-float-delayed"></div>
        <div className="absolute top-3/4 left-1/2 w-48 h-48 rounded-full bg-[#d32f2f]/3 blur-2xl animate-float-slow"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8 relative overflow-hidden"
      >
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#d32f2f]/5 via-transparent to-[#6c0f2a]/5"></div>
        
        <div className="relative z-10">
          {/* Back button */}
          <motion.button
            onClick={() => router.back()}
            className="mb-6 flex items-center text-gray-600 hover:text-[#d32f2f] transition-colors cursor-pointer"
            whileHover={{ x: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </motion.button>

          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              className="relative w-16 h-16 bg-gradient-to-br from-[#d32f2f] to-[#6c0f2a] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              whileHover={{ scale: 1.05, rotate: 5 }}
            >
              <Mail size={32} className="text-white" />
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-3 h-3 text-white" />
              </div>
            </motion.div>
            
            <motion.h1
              className="text-3xl font-bold bg-gradient-to-r from-[#d32f2f] to-[#6c0f2a] bg-clip-text text-transparent mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Verify Your Email
            </motion.h1>
            
            <motion.p
              className="text-gray-600 mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              We've sent a 6-digit verification code to
            </motion.p>
            
            <motion.p
              className="text-[#d32f2f] font-semibold"
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
              className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl"
            >
              <p className="text-sm text-red-600 font-medium">{errors.general}</p>
            </motion.div>
          )}

          {/* OTP Input Form */}
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-4 text-center">
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
                    className={`w-12 h-12 text-center text-xl font-bold border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/20 focus:border-[#d32f2f] transition-all duration-300 bg-white/50 backdrop-blur-sm ${
                      errors.otp ? 'border-red-400 bg-red-50/50' : 'border-gray-200'
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
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-sm text-red-600 text-center font-medium"
                >
                  {errors.otp}
                </motion.p>
              )}
            </div>

            {/* Verify Button */}
            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={verifyEmailMutation.isPending || otpCode.some(digit => !digit)}
              className="w-full bg-gradient-to-r from-[#d32f2f] to-[#6c0f2a] text-white py-3 px-4 rounded-xl hover:from-[#6c0f2a] hover:to-[#d32f2f] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2, duration: 0.5 }}
            >
              {verifyEmailMutation.isPending ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </div>
              ) : (
                "Verify Email"
              )}
            </motion.button>
          </div>

          {/* Resend Section */}
          <motion.div
            className="mt-6 text-center space-y-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.4, duration: 0.5 }}
          >
            <p className="text-sm text-gray-600">
              Didn't receive the code?
            </p>
            
            <motion.button
              onClick={handleResendCode}
              disabled={resendCooldown > 0 || isResending}
              className="inline-flex items-center text-sm text-[#d32f2f] hover:text-[#6c0f2a] font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
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
            </motion.button>
          </motion.div>

          {/* Additional Help */}
          <motion.div
            className="mt-8 pt-6 border-t border-gray-200/50 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.6, duration: 0.5 }}
          >
            <p className="text-sm text-gray-600 mb-3">
              Having trouble with verification?
            </p>
            <div className="space-x-4">
              <Link 
                href="/contact" 
                className="text-sm text-[#d32f2f] hover:text-[#6c0f2a] font-semibold cursor-pointer"
              >
                Contact Support
              </Link>
              <span className="text-gray-300">|</span>
              <Link 
                href="/signup" 
                className="text-sm text-[#d32f2f] hover:text-[#6c0f2a] font-semibold cursor-pointer"
              >
                Start Over
              </Link>
            </div>
          </motion.div>

          {/* Brand Stats */}
          {/* <motion.div
            className="mt-8 pt-6 border-t border-gray-200/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.8, duration: 0.5 }}
          >
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-gradient-to-br from-[#d32f2f]/10 to-[#6c0f2a]/10 rounded-xl border border-[#d32f2f]/20">
                <div className="text-lg font-bold text-[#d32f2f]">99%</div>
                <div className="text-xs text-gray-600">Verified</div>
              </div>
              <div className="p-3 bg-gradient-to-br from-[#6c0f2a]/10 to-[#d32f2f]/10 rounded-xl border border-[#6c0f2a]/20">
                <div className="text-lg font-bold text-[#6c0f2a]">Secure</div>
                <div className="text-xs text-gray-600">Process</div>
              </div>
              <div className="p-3 bg-gradient-to-br from-[#d32f2f]/10 to-[#6c0f2a]/10 rounded-xl border border-[#d32f2f]/20">
                <div className="text-lg font-bold text-[#d32f2f]">24/7</div>
                <div className="text-xs text-gray-600">Support</div>
              </div>
            </div>
          </motion.div> */}
        </div>
      </motion.div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(-3deg); }
        }
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(2deg); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}