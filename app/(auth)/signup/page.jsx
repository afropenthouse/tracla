"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, Users, Receipt, DollarSign, Star, ArrowRight, Sparkles, Crown, TrendingUp } from 'lucide-react';
import { motion } from "framer-motion";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import Link from "next/link";
import api from "@/lib/api";
import { useLoadingStore } from "@/store/loadingStore";
import { useSignUpEmailStore } from "@/store/store";

export default function SignupPage() {
  const router = useRouter();
  const { showLoader, hideLoader } = useLoadingStore();
  const { setEmail } = useSignUpEmailStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    terms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const signupMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/auth/register", {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
      });
      return response.data;
    },
    onMutate: () => {
      showLoader({
        text: "Creating your account...",
        loaderColor: "#d32f2f",
        textColor: "#ffffff",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
      });
    },
    onSuccess: (data) => {
      hideLoader();
      
      const { userId, email, verificationRequired } = data.data;
      console.log('Registration successful:', { userId, email, verificationRequired });
      
      // Store email for verification page
      setEmail(email);
      
      toast.success("Account created successfully! Please check your email to verify your account.");
      
      // Navigate to email verification page
      router.push("/email-verification");
    },
    onError: (error) => {
      hideLoader();
      
      const errorData = error.response?.data;
      const errorMessage = errorData?.message || "Registration failed. Please try again.";
      
      // Handle different error scenarios
      if (error.response?.status === 409) {
        // User already exists
        setErrors({ 
          email: "An account with this email already exists",
          general: "Please use a different email address or try logging in instead."
        });
      } else if (error.response?.status === 400) {
        // Validation errors
        const validationErrors = {};
        
        // Handle specific field validation errors if provided by API
        if (errorData?.errors) {
          errorData.errors.forEach(err => {
            if (err.field) {
              validationErrors[err.field] = err.message;
            }
          });
        }
        
        // If no specific field errors, show general validation message
        if (Object.keys(validationErrors).length === 0) {
          validationErrors.general = errorMessage;
        }
        
        setErrors(validationErrors);
      } else if (error.response?.status === 422) {
        // Business logic errors (like invalid phone format, etc.)
        setErrors({ general: errorMessage });
      } else {
        // Network or other errors
        toast.error(errorMessage);
      }
    },
  });

  const validateForm = () => {
    const newErrors = {};

    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters";
    } else if (formData.name.trim().length > 100) {
      newErrors.name = "Name must be less than 100 characters";
    }

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    // Phone validation
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = "Please enter a valid phone number";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 9) {
      newErrors.password = "Password must be at least 9 characters";
    } 
    // Terms validation
    if (!formData.terms) {
      newErrors.terms = "You must agree to the Terms of Service and Privacy Policy";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Clear any previous errors
    setErrors({});
    
    if (validateForm()) {
      signupMutation.mutate(formData);
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
            <p className="text-red-100 text-center">Business Dashboard</p>
          </motion.div>
          
          <motion.h2 
            className="text-2xl lg:text-4xl font-bold mb-4 lg:mb-6 text-center"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            Grow Your Business
          </motion.h2>
          <motion.p 
            className="text-lg lg:text-xl max-w-md text-center text-red-100 hidden sm:block"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            Track customer spending, manage loyalty programs, and boost revenue with our powerful dashboard.
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
                <span className="text-xs text-red-100">Growing</span>
              </div>
              <p className="text-2xl font-bold">500+</p>
              <p className="text-xs text-red-200">Businesses</p>
            </div>
            <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-3 h-3 text-yellow-400" />
                <span className="text-xs text-red-100">Active</span>
              </div>
              <p className="text-2xl font-bold">10K+</p>
              <p className="text-xs text-red-200">Customers</p>
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
              Create Account
            </h2>
            <p className="text-gray-600 text-center">
              Start managing your business today
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

          {/* Sign Up Form */}
          <div className="space-y-6">
            {/* Name Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                Full Name
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.name 
                    ? 'border-red-400 bg-red-50/50' 
                    : 'border-gray-200 bg-white/50'
                } backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/20 focus:border-[#d32f2f] transition-all duration-300 placeholder:text-gray-400`}
                placeholder="Enter your full name"
                disabled={signupMutation.isPending}
              />
              {errors.name && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600"
                >
                  {errors.name}
                </motion.p>
              )}
            </motion.div>

            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
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
                disabled={signupMutation.isPending}
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

            {/* Phone Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.phone 
                    ? 'border-red-400 bg-red-50/50' 
                    : 'border-gray-200 bg-white/50'
                } backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/20 focus:border-[#d32f2f] transition-all duration-300 placeholder:text-gray-400`}
                placeholder="Enter your phone number"
                disabled={signupMutation.isPending}
              />
              {errors.phone && (
                <motion.p 
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-2 text-sm text-red-600"
                >
                  {errors.phone}
                </motion.p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
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
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                    errors.password 
                      ? 'border-red-400 bg-red-50/50' 
                      : 'border-gray-200 bg-white/50'
                  } backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/20 focus:border-[#d32f2f] transition-all duration-300 placeholder:text-gray-400`}
                  placeholder="Create a secure password"
                  disabled={signupMutation.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-[#d32f2f] transition-colors cursor-pointer"
                  disabled={signupMutation.isPending}
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

            {/* Terms Checkbox */}
            <motion.div 
              className="flex items-start"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <input
                id="terms"
                name="terms"
                type="checkbox"
                checked={formData.terms}
                onChange={handleInputChange}
                required
                className={`h-4 w-4 mt-1 text-[#d32f2f] border-gray-300 rounded focus:ring-[#d32f2f] focus:ring-2 ${
                  errors.terms ? 'border-red-500' : ''
                }`}
                disabled={signupMutation.isPending}
              />
              <div className="ml-3">
                <label htmlFor="terms" className="block text-sm text-gray-600 cursor-pointer">
                  I agree to the{" "}
                  <Link href="/terms" className="text-[#d32f2f] hover:text-[#6c0f2a] font-semibold cursor-pointer">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-[#d32f2f] hover:text-[#6c0f2a] font-semibold cursor-pointer">
                    Privacy Policy
                  </Link>
                </label>
                {errors.terms && (
                  <motion.p 
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-1 text-sm text-red-600"
                  >
                    {errors.terms}
                  </motion.p>
                )}
              </div>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={signupMutation.isPending}
              onClick={handleSubmit}
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 10,
                opacity: { duration: 0.3, delay: 0.6 } 
              }}
              className="w-full bg-gradient-to-r from-[#d32f2f] to-[#6c0f2a] text-white py-3 px-4 rounded-xl hover:from-[#6c0f2a] hover:to-[#d32f2f] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 group"
            >
              {signupMutation.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Creating Account...</span>
                </div>
              ) : (
                <>
                  Create Account
                  <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </motion.button>

            {/* Sign In Link */}
            <motion.div 
              className="pt-6 text-center text-sm text-gray-600"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              Already have an account?{" "}
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/login" className="text-[#d32f2f] hover:text-[#6c0f2a] font-semibold transition-colors cursor-pointer">
                  Sign in
                </Link>
              </motion.span>
            </motion.div>
          </div>

          {/* Trust Indicators */}
          {/* <motion.div 
            className="mt-8 pt-6 border-t border-gray-200/50"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
          >
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-gradient-to-br from-[#d32f2f]/10 to-[#6c0f2a]/10 rounded-xl border border-[#d32f2f]/20">
                <div className="text-lg font-bold text-[#d32f2f]">Free</div>
                <div className="text-xs text-gray-600">Setup</div>
              </div>
              <div className="p-3 bg-gradient-to-br from-[#6c0f2a]/10 to-[#d32f2f]/10 rounded-xl border border-[#6c0f2a]/20">
                <div className="text-lg font-bold text-[#6c0f2a]">24/7</div>
                <div className="text-xs text-gray-600">Support</div>
              </div>
              <div className="p-3 bg-gradient-to-br from-[#d32f2f]/10 to-[#6c0f2a]/10 rounded-xl border border-[#d32f2f]/20">
                <div className="text-lg font-bold text-[#d32f2f]">Secure</div>
                <div className="text-xs text-gray-600">Data</div>
              </div>
            </div>
          </motion.div> */}
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