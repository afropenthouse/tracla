"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, Users, Receipt, DollarSign, Star, ArrowRight, Sparkles, Crown, TrendingUp } from 'lucide-react';
import { motion } from "framer-motion";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useToastStore } from "@/store/toastStore";
import Link from "next/link";
import api from "@/lib/api";
import { businessKeys, branchKeys } from "@/lib/queries/branch";

import { useBranchStore, useBusinessStore } from '@/store/store';

import { useLoadingStore } from '@/store/loadingStore';
import { setAuthCookies, setUserCookies } from '@/actions/cookies/cookies';

export default function LoginPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showLoader, hideLoader } = useLoadingStore();
  const { setBusiness } = useBusinessStore();
  const { setBranches, setCurrentBranch } = useBranchStore();
  const { showSuccess, showError } = useToastStore();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const loginMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
      });
      return response.data;
    },
    onMutate: () => {
      showLoader({
        text: "Signing you in...",
        loaderColor: "#d32f2f",
        textColor: "#ffffff",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
      });
    },
    onSuccess: async (data) => {      
      const { isFirstLogin, business, user, tokens, sessionId } = data.data;
      console.log('Login successful:', { isFirstLogin, user, business });
      
      // Store tokens in cookies
      const cookieResult = await setAuthCookies(tokens.accessToken, tokens.refreshToken);
      
      if (!cookieResult.success) {
        hideLoader();
        showError("Failed to save session. Please try again.");
        return;
      }

      // Store user information in cookies
      const userCookieResult = await setUserCookies(
        user.name.split(' ')[0], // firstName
        user.name.split(' ').slice(1).join(' ') || '', // lastName
        user.id,
        user.email
      );

      if (!userCookieResult.success) {
        console.warn("Failed to save user data in cookies");
      }

      // Store business and branch data in Zustand stores
      if (business) {
        // Store business data (excluding branches array to avoid duplication)
        const { branches, ...businessData } = business;
        setBusiness(businessData);

        // Clear branches array and store only the first branch as current branch
        if (branches && branches.length > 0) {
          setBranches([]); // Clear the branches array
          setCurrentBranch(branches[0]); // Set only first branch as current
        }

        // Prefetch quick-stats data for sidebar
        try {
          const statsResponse = await api.get(`/business/${businessData.id}/quick-stats`);
          
          if (statsResponse.data.success) {
            // Prefill React Query cache with stats data
            const statsQueryKey = [...businessKeys.detail(businessData.id), "quick-stats"];
            queryClient.setQueryData(statsQueryKey, statsResponse.data.data);
            
            // Also prefill for branch view if user has branches
            if (branches && branches.length > 0) {
              const branchStatsResponse = await api.get(`/branches/branch/${branches[0].id}/quick-stats`);
              if (branchStatsResponse.data.success) {
                const branchStatsQueryKey = [...branchKeys.detail(businessData.id, branches[0].id), "quick-stats"];
                queryClient.setQueryData(branchStatsQueryKey, branchStatsResponse.data.data);
              }
            }
          }
        } catch (error) {
          console.warn("Failed to prefetch quick stats:", error);
          // Don't block login flow if stats fetch fails
        }
      }
      
      hideLoader();
      
      // Welcome message
      showSuccess(`Welcome back, ${user.name.split(' ')[0]}!`);
      
      // Route based on first login status
      if (isFirstLogin) {
        // First time login - take to onboarding
        router.push("/onboarding");
      } else {
        // Returning user - take to dashboard
        router.push("/dashboard");
      }
    },
    onError: (error) => {
      hideLoader();
      
      const errorData = error.response?.data;
      const backendMessage = errorData?.message || errorData?.error || "Login failed. Please try again.";
      
      // Handle special cases
      if (errorData?.status_code === "LOGIN_REDIRECT") {
        // Email not verified - redirect to email verification
        showError("Please verify your email before logging in.");
        router.push("/email-verification");
        return;
      }
      
      // Show toast with backend message for all errors
      showError(backendMessage);
      
      // Handle validation errors for form display
      if (error.response?.status === 400) {
        // Could be field validation errors
        setErrors({ general: backendMessage });
      } else if (error.response?.status === 401) {
        // Invalid credentials - use backend message for form too
        setErrors({ 
          email: backendMessage,
          password: backendMessage
        });
      } else if (error.response?.status === 403) {
        // Account issues (deactivated, etc.)
        setErrors({ general: backendMessage });
      }
    },
  });

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clear any previous errors
    setErrors({});
    
    if (validateForm()) {
      loginMutation.mutate(formData);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
    
    // Clear general error when user makes changes
    if (errors.general) {
      setErrors(prev => ({
        ...prev,
        general: ""
      }));
    }
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen w-full bg-gradient-to-br from-slate-50 via-red-50 to-rose-50 overflow-hidden">
      {/* Left side with gradient and branding */}
      <div className="w-full lg:w-1/2 relative overflow-hidden h-[45vh] lg:h-screen bg-gradient-to-br from-[#d32f2f] via-[#6c0f2a] to-[#d32f2f]/80">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 rounded-full border-2 border-white animate-pulse"></div>
          <div className="absolute bottom-40 right-16 w-24 h-24 rounded-full border-2 border-white animate-pulse delay-300"></div>
          <div className="absolute top-1/2 right-20 w-16 h-16 rounded-full border-2 border-white animate-pulse delay-700"></div>
          <div className="absolute top-1/3 left-1/2 w-20 h-20 rounded-full border-2 border-white animate-pulse delay-1000"></div>
        </div>
        
        {/* Floating Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-1/4 -left-20 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-1/4 -right-20 w-32 h-32 bg-rose-300/20 rounded-full blur-3xl animate-float-delayed"></div>
          <div className="absolute top-3/4 left-1/3 w-24 h-24 bg-red-200/20 rounded-full blur-2xl animate-float-slow"></div>
        </div>
        
        {/* Wave-shaped bottom border for mobile */}
        <div className="absolute bottom-0 left-0 right-0 h-16 lg:hidden">
          <svg
            viewBox="0 0 1440 140" 
            className="absolute bottom-0 w-full h-full"
            preserveAspectRatio="none"
          >
            <path
              fill="rgb(248 250 252)"
              d="M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,80C672,64,768,64,864,85.3C960,107,1056,149,1152,149.3C1248,149,1344,107,1392,85.3L1440,64L1440,140L1392,140C1344,140,1248,140,1152,140C1056,140,960,140,864,140C768,140,672,140,576,140C480,140,384,140,288,140C192,140,96,140,48,140L0,140Z"
            ></path>
          </svg>
        </div>
        
        {/* Content on gradient background */}
        <motion.div 
          className="relative z-10 flex flex-col items-center justify-center w-full h-full text-white p-4 lg:p-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Logo */}
          <motion.div 
            className="mb-8 text-center"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <div className="relative inline-block group">
              <motion.div 
                className="w-16 h-16 bg-white/90 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-4 shadow-2xl border border-white/20 group-hover:scale-110 transition-all duration-300"
                whileHover={{ scale: 1.1, rotate: 5 }}
                transition={{ type: "spring", stiffness: 400, damping: 10 }}
              >
                <span className="text-[#d32f2f] font-bold text-2xl">T</span>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-3 h-3 text-white" />
                </div>
              </motion.div>
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold mb-2">
              Tra<span className="text-rose-200">cla</span>
            </h1>
            <p className="text-white text-center">Business Dashboard</p>
          </motion.div>
          
          <motion.h2 
            className="text-2xl lg:text-4xl font-bold mb-4 lg:mb-6 text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Welcome Back
          </motion.h2>
          <motion.p 
            className="text-lg lg:text-xl max-w-md text-center text-red-100 hidden sm:block"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Sign in to access your business dashboard and continue growing your revenue.
          </motion.p>
          
          <motion.div 
            className="mt-8 lg:mt-12 flex flex-col items-center"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="grid grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8">
              {[
                { Icon: Users, delay: 0 },
                { Icon: DollarSign, delay: 100 },
                { Icon: Receipt, delay: 200 },
                { Icon: TrendingUp, delay: 300 }
              ].map(({ Icon, delay }, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-center bg-white/10 backdrop-blur-xl rounded-xl p-3 lg:p-4 border border-white/20 hover:bg-white/20 hover:scale-110 hover:-translate-y-2 transition-all duration-300 shadow-lg"
                  style={{ animationDelay: `${delay}ms` }}
                  whileHover={{ scale: 1.1, y: -5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Icon size={28} className="text-white" />
                </motion.div>
              ))}
            </div>
            <p className="text-sm lg:text-base opacity-90 max-w-sm text-center hidden sm:block text-red-100">
              Customer analytics • Revenue tracking • Loyalty management • Business insights
            </p>
          </motion.div>

          {/* Live Stats Demo */}
          <motion.div 
            className="mt-8 grid grid-cols-2 gap-4 w-full max-w-sm hidden lg:grid"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
          >
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-xs text-red-100">Live</span>
              </div>
              <p className="text-2xl font-bold">₦2.4M</p>
              <p className="text-xs text-red-200">Monthly Revenue</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Crown className="w-3 h-3 text-yellow-400" />
                <span className="text-xs text-red-100">VIP</span>
              </div>
              <p className="text-2xl font-bold">247</p>
              <p className="text-xs text-red-200">Total Customers</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Right side authentication form */}
      <div className="w-full lg:w-1/2 flex items-start lg:items-center justify-center px-6 pb-6 pt-6 lg:pt-20 overflow-y-auto -mt-8 lg:mt-0">
        <motion.div 
          className="w-full max-w-md bg-white/80 backdrop-blur-xl border border-white/20 shadow-2xl rounded-2xl p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <motion.div 
            className="flex flex-col items-center mb-8"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-[#d32f2f] to-[#6c0f2a] bg-clip-text text-transparent text-center mb-2">
              Sign In
            </h2>
            <p className="text-gray-600 text-center">
              Access your business dashboard
            </p>
          </motion.div>

          {/* General Error Message */}
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl"
            >
              <p className="text-sm text-red-600">{errors.general}</p>
            </motion.div>
          )}

          {/* Login Form */}
          <div className="space-y-6">
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                Email Address
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.email 
                    ? 'border-red-400 bg-red-50/50' 
                    : 'border-gray-200 bg-white/50'
                } backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/20 focus:border-[#d32f2f] transition-all duration-300 placeholder:text-gray-400`}
                placeholder="Enter your email address"
                disabled={loginMutation.isPending}
              />
              {errors.email && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600"
                >
                  {errors.email}
                </motion.p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <motion.input
                  whileFocus={{ scale: 1.01 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                    errors.password 
                      ? 'border-red-400 bg-red-50/50' 
                      : 'border-gray-200 bg-white/50'
                  } backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/20 focus:border-[#d32f2f] transition-all duration-300 placeholder:text-gray-400`}
                  placeholder="Enter your password"
                  disabled={loginMutation.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-[#d32f2f] transition-colors cursor-pointer"
                  disabled={loginMutation.isPending}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.password && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600"
                >
                  {errors.password}
                </motion.p>
              )}
            </motion.div>

            {/* Remember Me & Forgot Password */}
            <motion.div 
              className="flex items-center justify-between"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-[#d32f2f] border-gray-300 rounded focus:ring-[#d32f2f] focus:ring-2"
                  disabled={loginMutation.isPending}
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-gray-600 cursor-pointer">
                  Remember me
                </label>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/forgot-password" className="text-sm text-[#d32f2f] hover:text-[#6c0f2a] font-semibold transition-colors cursor-pointer">
                  Forgot password?
                </Link>
              </motion.div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loginMutation.isPending}
              onClick={handleSubmit}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 10,
                opacity: { duration: 0.3, delay: 0.4 } 
              }}
              className="w-full bg-gradient-to-r from-[#d32f2f] to-[#6c0f2a] text-white py-3 px-4 rounded-xl hover:from-[#6c0f2a] hover:to-[#d32f2f] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 group"
            >
              {loginMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Signing In...</span>
                </div>
              ) : (
                <>
                  Sign In
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>

            {/* Sign Up Link */}
            <motion.div 
              className="pt-6 text-center text-sm text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              Don't have an account?{" "}
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/signup" className="text-[#d32f2f] hover:text-[#6c0f2a] font-semibold transition-colors cursor-pointer">
                  Create one here
                </Link>
              </motion.span>
            </motion.div>
          </div>

          {/* Quick Stats */}
          <motion.div 
            className="mt-8 pt-6 border-t border-gray-200/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
          >
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-gradient-to-br from-[#d32f2f]/10 to-[#6c0f2a]/10 rounded-xl border border-[#d32f2f]/20">
                <div className="text-lg font-bold text-[#d32f2f]">500+</div>
                <div className="text-xs text-gray-600">Businesses</div>
              </div>
              <div className="p-3 bg-gradient-to-br from-[#6c0f2a]/10 to-[#d32f2f]/10 rounded-xl border border-[#6c0f2a]/20">
                <div className="text-lg font-bold text-[#6c0f2a]">10K+</div>
                <div className="text-xs text-gray-600">Customers</div>
              </div>
              <div className="p-3 bg-gradient-to-br from-[#d32f2f]/10 to-[#6c0f2a]/10 rounded-xl border border-[#d32f2f]/20">
                <div className="text-lg font-bold text-[#d32f2f]">₦50M+</div>
                <div className="text-xs text-gray-600">Processed</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

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