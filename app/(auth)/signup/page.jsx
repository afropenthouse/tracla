"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, Users, Receipt, DollarSign, Star } from 'lucide-react';
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
        loaderColor: "#1A73E8",
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
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = "Password must contain at least one uppercase letter, one lowercase letter, and one number";
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
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative z-10 flex flex-col items-center justify-center w-full h-full text-white p-4 lg:p-12"
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
              whileHover={{ scale: 1.1, rotate: 5 }}
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
            Grow Your Business
          </motion.h2>
          <motion.p 
            className="text-lg lg:text-xl max-w-md text-center text-blue-100 hidden sm:block"
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
              Create Account
            </motion.h2>
            <motion.p 
              className="text-[#6B7280] text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, delay: 0.1 }}
            >
              Start managing your business today
            </motion.p>
          </div>

          {/* General Error Message */}
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md"
            >
              <p className="text-sm text-red-600">{errors.general}</p>
            </motion.div>
          )}

          {/* Sign Up Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <label htmlFor="name" className="block text-sm font-medium text-[#374151] mb-2">
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
                  errors.name ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 focus:border-[#1A73E8] transition-all duration-200`}
                placeholder="Enter your full name"
                disabled={signupMutation.isPending}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </motion.div>

            {/* Email Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
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
                disabled={signupMutation.isPending}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </motion.div>

            {/* Phone Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
            >
              <label htmlFor="phone" className="block text-sm font-medium text-[#374151] mb-2">
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
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 focus:border-[#1A73E8] transition-all duration-200`}
                placeholder="+234 xxx xxx xxxx"
                disabled={signupMutation.isPending}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </motion.div>

            {/* Password Field */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.4 }}
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
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                    errors.password ? 'border-red-500' : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 focus:border-[#1A73E8] transition-all duration-200`}
                  placeholder="Create a secure password"
                  disabled={signupMutation.isPending}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 cursor-pointer transition-colors"
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
                <p className="mt-1 text-sm text-red-600">{errors.password}</p>
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
                className={`h-4 w-4 mt-1 text-[#1A73E8] border-gray-300 rounded focus:ring-[#1A73E8] focus:ring-2 ${
                  errors.terms ? 'border-red-500' : ''
                }`}
                disabled={signupMutation.isPending}
              />
              <label htmlFor="terms" className="ml-3 block text-sm text-[#6B7280]">
                I agree to the{" "}
                <Link href="/terms" className="text-[#1A73E8] hover:text-[#1557B0] font-medium">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="text-[#1A73E8] hover:text-[#1557B0] font-medium">
                  Privacy Policy
                </Link>
                {errors.terms && (
                  <p className="mt-1 text-sm text-red-600">{errors.terms}</p>
                )}
              </label>
            </motion.div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={signupMutation.isPending}
              whileHover={{ scale: 1.02, boxShadow: "0 5px 15px rgba(26, 115, 232, 0.2)" }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 400, 
                damping: 10,
                opacity: { duration: 0.3, delay: 0.6 } 
              }}
              className="w-full bg-gradient-to-r from-[#1A73E8] to-[#1557B0] text-white py-3 px-4 rounded-xl hover:from-[#1557B0] hover:to-[#0B2E68] transition-all duration-200 font-medium shadow-lg hover:shadow-xl transform disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {signupMutation.isPending ? "Creating Account..." : "Create Account"}
            </motion.button>

            {/* Sign In Link */}
            <motion.div 
              className="pt-6 text-center text-sm text-[#6B7280]"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.7 }}
            >
              Already have an account?{" "}
              <motion.span
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link href="/login" className="text-[#1A73E8] hover:text-[#1557B0] font-medium cursor-pointer">
                  Sign in
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