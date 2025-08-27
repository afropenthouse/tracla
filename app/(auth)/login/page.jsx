"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, Users, Receipt, DollarSign, Star, ArrowRight } from 'lucide-react';
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import api from "@/lib/api";

import { useBranchStore, useBusinessStore } from '@/store/store';

import { useLoadingStore } from '@/store/loadingStore';
import { setAuthCookies } from '@/actions/cookies/cookies';

export default function LoginPage() {
  const router = useRouter();
  const { showLoader, hideLoader } = useLoadingStore();
  const { setBusiness } = useBusinessStore();
  const { setBranches, setCurrentBranch } = useBranchStore();

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
        loaderColor: "#1A73E8",
        textColor: "#ffffff",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
      });
    },
    onSuccess: async (data) => {
      hideLoader();
      
      const { isFirstLogin, business, user, tokens, sessionId } = data.data;
      console.log('Login successful:', { isFirstLogin, user, business });
      
      // Store tokens in cookies
      const cookieResult = await setAuthCookies(tokens.accessToken, tokens.refreshToken);
      
      if (!cookieResult.success) {
        toast.error("Failed to save session. Please try again.");
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

        // Store branches array
        if (branches && branches.length > 0) {
          setBranches(branches);
          // Set first branch as current branch
          setCurrentBranch(branches[0]);
        }
      }
      
      // Welcome message
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`);
      
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
      const errorMessage = errorData?.message || "Login failed. Please try again.";
      
      // Handle special cases
      if (errorData?.status_code === "LOGIN_REDIRECT") {
        // Email not verified - redirect to email verification
        toast.error("Please verify your email before logging in.");
        router.push("/email-verification");
        return;
      }
      
      // Handle validation errors
      if (error.response?.status === 400) {
        // Could be field validation errors
        setErrors({ general: errorMessage });
      } else if (error.response?.status === 401) {
        // Invalid credentials
        setErrors({ 
          email: "Invalid email or password",
          password: "Invalid email or password"
        });
      } else if (error.response?.status === 403) {
        // Account issues (deactivated, etc.)
        setErrors({ general: errorMessage });
      } else {
        // Network or other errors
        toast.error(errorMessage);
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
    <div className="flex flex-col lg:flex-row h-screen w-full bg-[#F9FAFC] overflow-hidden">
      {/* Left side with gradient and branding */}
      <div className="w-full lg:w-1/2 relative overflow-hidden h-[45vh] lg:h-screen bg-gradient-to-br from-[#1A73E8] via-[#1557B0] to-[#0B2E68]">
        {/* Overlay pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-32 h-32 rounded-full border-2 border-white"></div>
          <div className="absolute bottom-40 right-16 w-24 h-24 rounded-full border-2 border-white"></div>
          <div className="absolute top-1/2 right-20 w-16 h-16 rounded-full border-2 border-white"></div>
        </div>
        
        {/* Wave-shaped bottom border for mobile */}
        <div className="absolute bottom-0 left-0 right-0 h-16 lg:hidden">
          <svg
            viewBox="0 0 1440 140" 
            className="absolute bottom-0 w-full h-full"
            preserveAspectRatio="none"
          >
            <path
              fill="#F9FAFC"
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
            className="mb-8"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <motion.div 
              className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4"
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Receipt size={32} className="text-[#1A73E8]" />
            </motion.div>
            <h1 className="text-3xl lg:text-5xl font-bold text-center">Vibeazy</h1>
            <p className="text-blue-100 text-center mt-2">Business Dashboard</p>
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
            className="text-lg lg:text-xl max-w-md text-center text-blue-100 hidden sm:block"
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
              {[Users, DollarSign, Receipt, Star].map((Icon, index) => (
                <motion.div
                  key={index}
                  className="flex items-center justify-center bg-white bg-opacity-20 rounded-xl p-3 lg:p-4 backdrop-blur-sm hover:bg-opacity-30 transition-all duration-300"
                  whileHover={{ scale: 1.1, y: -5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Icon size={28} className="text-white" />
                </motion.div>
              ))}
            </div>
            <p className="text-sm lg:text-base opacity-90 max-w-sm text-center hidden sm:block">
              Customer analytics • Revenue tracking • Loyalty management • Business insights
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Right side authentication form */}
      <div className="w-full lg:w-1/2 flex items-start lg:items-center justify-center px-6 pb-6 pt-6 lg:pt-20 overflow-y-auto -mt-8 lg:mt-0">
        <motion.div 
          className="w-full max-w-md bg-white rounded-2xl shadow-xl lg:shadow-none p-8 lg:p-0"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex flex-col items-center mb-8">
            <motion.h2 
              className="text-3xl lg:text-4xl font-bold text-[#222222] text-center mb-2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              Sign In
            </motion.h2>
            <motion.p 
              className="text-[#6B7280] text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.1 }}
            >
              Access your business dashboard
            </motion.p>
          </div>

          {/* General Error Message */}
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md"
            >
              <p className="text-sm text-red-600">{errors.general}</p>
            </motion.div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <label htmlFor="email" className="block text-sm font-medium text-[#374151] mb-2">
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
                  errors.email ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 focus:border-[#1A73E8] transition-all duration-200`}
                placeholder="Enter your email address"
                disabled={loginMutation.isPending}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
            >
              <label htmlFor="password" className="block text-sm font-medium text-[#374151] mb-2">
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
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 focus:border-[#1A73E8] transition-all duration-200`}
                  placeholder="Enter your password"
                  disabled={loginMutation.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
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
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
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
                  className="h-4 w-4 text-[#1A73E8] border-gray-300 rounded focus:ring-[#1A73E8] focus:ring-2"
                  disabled={loginMutation.isPending}
                />
                <label htmlFor="rememberMe" className="ml-2 block text-sm text-[#6B7280] cursor-pointer">
                  Remember me
                </label>
              </div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/forgot-password" className="text-sm text-[#1A73E8] hover:text-[#1557B0] font-medium cursor-pointer">
                  Forgot password?
                </Link>
              </motion.div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loginMutation.isPending}
              whileHover={{ scale: 1.02, boxShadow: "0 5px 15px rgba(26, 115, 232, 0.2)" }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 10,
                opacity: { duration: 0.3, delay: 0.4 } 
              }}
              className="w-full bg-gradient-to-r from-[#1A73E8] to-[#1557B0] text-white py-3 px-4 rounded-xl hover:from-[#1557B0] hover:to-[#0B2E68] transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {loginMutation.isPending ? "Signing In..." : "Sign In"}
              {!loginMutation.isPending && <ArrowRight size={18} />}
            </motion.button>

            {/* Sign Up Link */}
            <motion.div 
              className="pt-6 text-center text-sm text-[#6B7280]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              Don't have an account?{" "}
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/signup" className="text-[#1A73E8] hover:text-[#1557B0] font-medium cursor-pointer">
                  Create one here
                </Link>
              </motion.span>
            </motion.div>
          </form>
        </motion.div>
      </div>

      {/* Floating elements decoration for mobile */}
      <div className="absolute top-1/3 left-4 w-20 h-20 rounded-full bg-[#1A73E8]/10 -z-10 lg:hidden"></div>
      <div className="absolute top-2/3 right-6 w-24 h-24 rounded-full bg-[#1A73E8]/10 -z-10 lg:hidden"></div>
      <div className="absolute bottom-20 left-8 w-16 h-16 rounded-full bg-[#1A73E8]/10 -z-10 lg:hidden"></div>
    </div>
  );
}