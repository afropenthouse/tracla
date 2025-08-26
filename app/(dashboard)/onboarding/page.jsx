'use client';

import React, { useState } from 'react';
import { 
  ArrowRight, ArrowLeft, CheckCircle, Users, DollarSign, 
  Receipt, Star, Building2, MapPin, Phone, Mail, User,
  Gift, MessageSquare, TrendingUp, QrCode, Sparkles,
  Clock, Target, Award, FileText, Download
} from 'lucide-react';
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import api from "@/lib/api";
import { useLoadingStore } from "@/store/loadingStore";
import { useBusinessStore, useBranchStore } from "@/store/store";




// Welcome Step Component
const WelcomeStep = ({ nextStep }) => (
  <div className="text-center max-w-4xl mx-auto">
    <div className="mb-12">
      <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
        Welcome to <span className="text-[#1A73E8]">Vibeasy</span>
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        Transform your business with powerful customer loyalty and spending analytics
      </p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
      {[
        { icon: Users, title: "Track Customers", desc: "Monitor visits & spending" },
        { icon: Gift, title: "Reward Loyalty", desc: "Create points & rewards" },
        { icon: MessageSquare, title: "Send Promotions", desc: "Reach via WhatsApp & SMS" },
        { icon: TrendingUp, title: "Boost Revenue", desc: "Data-driven insights" }
      ].map((feature, index) => (
        <div key={index} className="bg-white p-4 rounded-lg border border-gray-200 hover:border-[#1A73E8]/30 transition-colors">
          <feature.icon size={20} className="text-gray-900 mb-3" />
          <h3 className="font-medium text-gray-900 mb-1">{feature.title}</h3>
          <p className="text-sm text-gray-600">{feature.desc}</p>
        </div>
      ))}
    </div>

    <div className="bg-gradient-to-r from-[#1A73E8]/5 to-[#1557B0]/5 rounded-xl p-6 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">How it works</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { step: "1", title: "Customer Scans QR", desc: "Place QR codes at your business" },
          { step: "2", title: "Upload Receipt", desc: "Customers earn points instantly" },
          { step: "3", title: "Track & Reward", desc: "Monitor and build loyalty" }
        ].map((step, index) => (
          <div key={index} className="text-center">
            <div className="w-10 h-10 bg-[#1A73E8] text-white rounded-full flex items-center justify-center mx-auto mb-3 font-medium">
              {step.step}
            </div>
            <h3 className="font-medium text-gray-900 mb-1">{step.title}</h3>
            <p className="text-sm text-gray-600">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>

    <button
      onClick={nextStep}
      className="bg-gradient-to-r from-[#1A73E8] to-[#1557B0] text-white px-8 py-3 rounded-xl hover:from-[#1557B0] hover:to-[#0B2E68] transition-all duration-200 font-medium flex items-center gap-2 mx-auto"
    >
      Get Started
      <ArrowRight size={18} />
    </button>
  </div>
);

// Business Setup Step
const BusinessSetupStep = ({ prevStep, handleBusinessSubmit, businessData, handleBusinessInputChange, errors, createBusinessMutation }) => (
  <div className="max-w-xl mx-auto">
    <div className="text-center mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your Business</h2>
      <p className="text-gray-600">Let's start by setting up your business profile</p>
    </div>

    {/* General Error Message */}
    {errors.general && (
      <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-600">{errors.general}</p>
      </div>
    )}

    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Name *
          </label>
          <div className="relative">
            <Building2 size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              name="name"
              value={businessData.name}
              onChange={handleBusinessInputChange}
              placeholder="Enter your business name"
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 focus:border-[#1A73E8] transition-all duration-200`}
              required
              disabled={createBusinessMutation.isPending}
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Email *
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="email"
              name="email"
              value={businessData.email}
              onChange={handleBusinessInputChange}
              placeholder="business@example.com"
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 focus:border-[#1A73E8] transition-all duration-200`}
              required
              disabled={createBusinessMutation.isPending}
            />
          </div>
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Phone *
          </label>
          <div className="relative">
            <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="tel"
              name="phone"
              value={businessData.phone}
              onChange={handleBusinessInputChange}
              placeholder="+234 xxx xxx xxxx"
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 focus:border-[#1A73E8] transition-all duration-200`}
              required
              disabled={createBusinessMutation.isPending}
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Address *
          </label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-3 text-gray-500" />
            <textarea
              name="address"
              value={businessData.address}
              onChange={handleBusinessInputChange}
              placeholder="Enter your business address"
              rows={2}
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 focus:border-[#1A73E8] transition-all duration-200 resize-none`}
              required
              disabled={createBusinessMutation.isPending}
            />
          </div>
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
          )}
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={prevStep}
          className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
          disabled={createBusinessMutation.isPending}
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <button
          onClick={handleBusinessSubmit}
          disabled={createBusinessMutation.isPending || !businessData.name || !businessData.email || !businessData.phone || !businessData.address}
          className="flex-1 bg-gradient-to-r from-[#1A73E8] to-[#1557B0] text-white px-4 py-2.5 rounded-lg hover:from-[#1557B0] hover:to-[#0B2E68] transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {createBusinessMutation.isPending ? "Creating..." : "Continue"}
          {!createBusinessMutation.isPending && <ArrowRight size={16} />}
        </button>
      </div>
    </div>
  </div>
);

// Branch Setup Step
const BranchSetupStep = ({ prevStep, handleBranchSubmit, branchData, handleBranchInputChange, errors, createBranchMutation }) => (
  <div className="max-w-xl mx-auto">
    <div className="text-center mb-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Your First Branch</h2>
      <p className="text-gray-600">Set up your first business location to start tracking customers</p>
    </div>

    {/* General Error Message */}
    {errors.general && (
      <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-sm text-red-600">{errors.general}</p>
      </div>
    )}

    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Branch Name *
          </label>
          <div className="relative">
            <Building2 size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              name="name"
              value={branchData.name}
              onChange={handleBranchInputChange}
              placeholder="e.g., Main Store, Downtown Branch"
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 focus:border-[#1A73E8] transition-all duration-200`}
              required
              disabled={createBranchMutation.isPending}
            />
          </div>
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Branch Address *
          </label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-3 text-gray-500" />
            <textarea
              name="address"
              value={branchData.address}
              onChange={handleBranchInputChange}
              placeholder="Enter the branch address"
              rows={2}
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 focus:border-[#1A73E8] transition-all duration-200 resize-none`}
              required
              disabled={createBranchMutation.isPending}
            />
          </div>
          {errors.address && (
            <p className="mt-1 text-sm text-red-600">{errors.address}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Branch Phone *
          </label>
          <div className="relative">
            <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            <input
              type="tel"
              name="phone"
              value={branchData.phone}
              onChange={handleBranchInputChange}
              placeholder="+234 xxx xxx xxxx"
              className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${
                errors.phone ? 'border-red-500' : 'border-gray-300'
              } focus:outline-none focus:ring-2 focus:ring-[#1A73E8]/20 focus:border-[#1A73E8] transition-all duration-200`}
              required
              disabled={createBranchMutation.isPending}
            />
          </div>
          {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>
      </div>

      <div className="bg-blue-50 rounded-lg p-4 mt-4">
        <h4 className="font-medium text-blue-900 mb-1 flex items-center gap-2 text-sm">
          <QrCode size={14} />
          What's Next?
        </h4>
        <p className="text-sm text-blue-800">
            Once your branch is created, we'll generate a unique QR code for this location. 
          Customers will scan this code to submit receipts and earn points.
        </p>
      </div>

      <div className="flex gap-3 mt-6">
        <button
          onClick={prevStep}
          className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
          disabled={createBranchMutation.isPending}
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <button
          onClick={handleBranchSubmit}
          disabled={createBranchMutation.isPending || !branchData.name || !branchData.address || !branchData.phone}
          className="flex-1 bg-gradient-to-r from-[#1A73E8] to-[#1557B0] text-white px-4 py-2.5 rounded-lg hover:from-[#1557B0] hover:to-[#0B2E68] transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {createBranchMutation.isPending ? "Creating..." : "Create Branch"}
          {!createBranchMutation.isPending && <ArrowRight size={16} />}
        </button>
      </div>
    </div>
  </div>
);

// Success Step
const SuccessStep = ({ createdBusiness, businessData, createdBranch, branchData, downloadQRCode, handleGetStarted }) => (
  <div className="text-center max-w-2xl mx-auto">
    <div className="mb-8">
      <div className="w-16 h-16 bg-[#1A73E8] rounded-full flex items-center justify-center mx-auto mb-4">
        <CheckCircle size={24} className="text-white" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        You're All Set!
      </h1>
      <p className="text-lg text-gray-600">
        Welcome to Vibeasy! Your business and first branch have been successfully created.
      </p>
    </div>

    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Setup Summary</h2>
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
          <Building2 size={18} className="text-gray-900 mt-0.5" />
          <div className="text-left">
            <h3 className="font-medium text-gray-900">{createdBusiness?.name || businessData.name}</h3>
            <p className="text-sm text-gray-600">{createdBusiness?.email || businessData.email}</p>
            <p className="text-sm text-gray-600">{createdBusiness?.phone || businessData.phone}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
          <MapPin size={18} className="text-gray-900 mt-0.5" />
          <div className="text-left">
            <h3 className="font-medium text-gray-900">{createdBranch?.name || branchData.name}</h3>
            <p className="text-sm text-gray-600">{createdBranch?.phone || branchData.phone}</p>
            <p className="text-sm text-gray-600">{createdBranch?.address || branchData.address}</p>
            {createdBranch?.qrCodeUrl && (
              <p className="text-xs text-blue-600 mt-1">QR: {createdBranch.qrCodeUrl}</p>
            )}
          </div>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-xl border border-gray-200 p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { icon: QrCode, title: "Download QR Code", desc: "Print and place at your business location" },
          { icon: Gift, title: "Set Up Rewards", desc: "Create your points and loyalty programs" },
          { icon: Users, title: "View Dashboard", desc: "Start monitoring customer activity" },
          { icon: MessageSquare, title: "Send Messages", desc: "Connect with customers via WhatsApp" }
        ].map((action, index) => (
          <div key={index} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
            <action.icon size={18} className="text-gray-900 mt-0.5" />
            <div className="text-left">
              <h3 className="font-medium text-gray-900 text-sm">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="flex flex-col sm:flex-row gap-3 justify-center">
      <button 
        onClick={downloadQRCode}
        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
      >
        <Download size={18} />
        Download QR Code
      </button>
      <button
        onClick={handleGetStarted}
        className="bg-gradient-to-r from-[#1A73E8] to-[#1557B0] text-white px-8 py-3 rounded-lg hover:from-[#1557B0] hover:to-[#0B2E68] transition-all duration-200 font-medium flex items-center justify-center gap-2"
      >
        Go to Dashboard
        <ArrowRight size={18} />
      </button>
    </div>
  </div>
);

const VibeazyOnboarding = () => {
  const router = useRouter();
  const { showLoader, hideLoader } = useLoadingStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [createdBusiness, setCreatedBusiness] = useState(null);
  const [createdBranch, setCreatedBranch] = useState(null);
  const [errors, setErrors] = useState({});

  const { setBusiness } = useBusinessStore();
const { addBranch } = useBranchStore();

  const [businessData, setBusinessData] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });

  const [branchData, setBranchData] = useState({
    name: '',
    address: '',
    phone: ''
  });

  // Business creation mutation
  const createBusinessMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post("/businesses", {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
      });
      return response.data;
    },
    onMutate: () => {
      showLoader({
        text: "Creating your business...",
        loaderColor: "#1A73E8",
        textColor: "#ffffff",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
      });
    },
    onSuccess: (data) => {
      hideLoader();
      setBusiness(data.data.business);
      setCreatedBusiness(data.data.business);
      toast.success("Business created successfully!");
      nextStep();
    },
    onError: (error) => {
      hideLoader();
      const errorData = error.response?.data;
      const errorMessage = errorData?.message || "Failed to create business. Please try again.";
      
      if (error.response?.status === 409) {
        if (errorMessage.includes("already own")) {
          setErrors({ general: "You already own a business. Each user can only create one business." });
        } else {
          setErrors({ email: "A business with this email already exists." });
        }
      } else if (error.response?.status === 400) {
        setErrors({ general: errorMessage });
      } else {
        toast.error(errorMessage);
      }
    },
  });

  // Branch creation mutation
  const createBranchMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post(`/branches/${createdBusiness.id}`, {
        name: data.name,
        address: data.address,
        phone: data.phone,
        managerRole: "OWNER", // Current user becomes manager
        managerEmail: businessData.email, // Use business email as manager email
      });
      return response.data;
    },
    onMutate: () => {
      showLoader({
        text: "Creating your first branch...",
        loaderColor: "#1A73E8",
        textColor: "#ffffff",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
      });
    },
    onSuccess: (data) => {
      hideLoader();
      addBranch(data.data.branch);
      setCreatedBranch(data.data.branch);
      toast.success("Branch created successfully!");
      nextStep();
    },
    onError: (error) => {
      hideLoader();
      const errorData = error.response?.data;
      const errorMessage = errorData?.message || "Failed to create branch. Please try again.";
      
      if (error.response?.status === 403) {
        setErrors({ general: "Branch limit reached for your current tier." });
      } else if (error.response?.status === 400) {
        setErrors({ general: errorMessage });
      } else {
        toast.error(errorMessage);
      }
    },
  });

  const handleBusinessInputChange = (e) => {
    const { name, value } = e.target;
    setBusinessData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors when user starts typing - only if there's actually an error
    // if (errors[name]) {
    //   setErrors(prev => {
    //     const newErrors = { ...prev };
    //     delete newErrors[name];
    //     return newErrors;
    //   });
    // }
    
    // if (errors.general && value.trim()) {
    //   setErrors(prev => {
    //     const newErrors = { ...prev };
    //     delete newErrors.general;
    //     return newErrors;
    //   });
    // }
  };

  const handleBranchInputChange = (e) => {
    const { name, value } = e.target;
    setBranchData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors when user starts typing - only if there's actually an error
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    
    if (errors.general && value.trim()) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.general;
        return newErrors;
      });
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const validateBusinessData = () => {
    const newErrors = {};

    if (!businessData.name.trim()) {
      newErrors.name = "Business name is required";
    } else if (businessData.name.trim().length < 2) {
      newErrors.name = "Business name must be at least 2 characters";
    } else if (businessData.name.trim().length > 200) {
      newErrors.name = "Business name must be less than 200 characters";
    }

    if (!businessData.email.trim()) {
      newErrors.email = "Business email is required";
    } else if (!/\S+@\S+\.\S+/.test(businessData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!businessData.phone.trim()) {
      newErrors.phone = "Business phone is required";
    } else if (businessData.phone.trim().length < 10) {
      newErrors.phone = "Phone number must be at least 10 characters";
    }

    if (!businessData.address.trim()) {
      newErrors.address = "Business address is required";
    } else if (businessData.address.trim().length > 500) {
      newErrors.address = "Address must be less than 500 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateBranchData = () => {
    const newErrors = {};

    if (!branchData.name.trim()) {
      newErrors.name = "Branch name is required";
    } else if (branchData.name.trim().length < 2) {
      newErrors.name = "Branch name must be at least 2 characters";
    } else if (branchData.name.trim().length > 100) {
      newErrors.name = "Branch name must be less than 100 characters";
    }

    if (!branchData.address.trim()) {
      newErrors.address = "Branch address is required";
    } else if (branchData.address.trim().length > 500) {
      newErrors.address = "Address must be less than 500 characters";
    }

    if (!branchData.phone.trim()) {
      newErrors.phone = "Branch phone is required";
    } else if (branchData.phone.trim().length < 10) {
      newErrors.phone = "Phone number must be at least 10 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBusinessSubmit = () => {
    setErrors({});
    if (validateBusinessData()) {
      createBusinessMutation.mutate(businessData);
    }
  };

  const handleBranchSubmit = () => {
    setErrors({});
    if (validateBranchData()) {
      createBranchMutation.mutate(branchData);
    }
  };

  const handleGetStarted = () => {
    router.push("/dashboard");
  };

  const downloadQRCode = async () => {
    if (!createdBranch?.qrCodeUrl) {
      toast.error("QR code URL not available");
      return;
    }
  
    try {
      // Show loading state
      showLoader({
        text: "Generating QR code...",
        loaderColor: "#1A73E8",
        textColor: "#ffffff",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
      });
  
      // Create canvas element
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      // Set canvas size (larger for better quality)
      const size = 400;
      canvas.width = size;
      canvas.height = size + 80; // Extra space for text
  
      // Fill white background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
  
      // Generate QR code using a QR code library
      // You'll need to install qrcode: npm install qrcode
      const QRCode = (await import('qrcode')).default;
      
      // Generate QR code data URL
      const qrDataURL = await QRCode.toDataURL(createdBranch.qrCodeUrl, {
        width: size - 40,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#ffffff'
        }
      });
  
      // Load QR code image
      const qrImage = new Image();
      await new Promise((resolve, reject) => {
        qrImage.onload = resolve;
        qrImage.onerror = reject;
        qrImage.src = qrDataURL;
      });
  
      // Draw QR code on canvas
      ctx.drawImage(qrImage, 20, 20, size - 40, size - 40);
  
      // Add business and branch name below QR code
      ctx.fillStyle = '#1A73E8';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(createdBusiness?.name || businessData.name, canvas.width / 2, size + 25);
      
      ctx.fillStyle = '#666666';
      ctx.font = '14px Arial';
      ctx.fillText(createdBranch?.name || branchData.name, canvas.width / 2, size + 45);
      
      ctx.font = '12px Arial';
      ctx.fillText('Scan to submit receipts and earn points', canvas.width / 2, size + 65);
  
      // Convert canvas to blob
      canvas.toBlob((blob) => {
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${(createdBranch?.slug || branchData.name).replace(/\s+/g, '-').toLowerCase()}-qr-code.png`;
        
        // Trigger download
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up
        URL.revokeObjectURL(url);
        
        hideLoader();
        toast.success("QR code downloaded successfully!");
      }, 'image/png');
  
    } catch (error) {
      hideLoader();
      console.error('Error generating QR code:', error);
      
      // Fallback: copy URL to clipboard
      if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(createdBranch.qrCodeUrl);
          toast.info("QR code generation failed, but URL copied to clipboard!");
        } catch (clipboardError) {
          toast.error("Failed to generate QR code. Please try again.");
        }
      } else {
        toast.error("Failed to generate QR code. Please try again.");
      }
    }
  };




  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      {/* Progress Bar */}
      {currentStep < 3 && (
        <div className="sticky top-0 z-50 bg-white border-b border-gray-200 py-4">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Setup Progress</h3>
              <span className="text-sm text-gray-600">{currentStep + 1} of 3</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#1A73E8] to-[#1557B0] h-2 rounded-full transition-all duration-500"
                style={{ width: `${((currentStep + 1) / 3) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="py-8 lg:py-16 px-6">
        {currentStep === 0 && <WelcomeStep nextStep={nextStep} />}
        {currentStep === 1 && (
          <BusinessSetupStep 
            prevStep={prevStep}
            handleBusinessSubmit={handleBusinessSubmit}
            businessData={businessData}
            handleBusinessInputChange={handleBusinessInputChange}
            errors={errors}
            createBusinessMutation={createBusinessMutation}
          />
        )}
        {currentStep === 2 && (
          <BranchSetupStep 
            prevStep={prevStep}
            handleBranchSubmit={handleBranchSubmit}
            branchData={branchData}
            handleBranchInputChange={handleBranchInputChange}
            errors={errors}
            createBranchMutation={createBranchMutation}
          />
        )}
        {currentStep === 3 && (
          <SuccessStep 
            createdBusiness={createdBusiness}
            businessData={businessData}
            createdBranch={createdBranch}
            branchData={branchData}
            downloadQRCode={downloadQRCode}
            handleGetStarted={handleGetStarted}
          />
        )}
      </div>

      {/* Minimal floating decorative elements */}
      <div className="fixed top-1/4 left-8 w-20 h-20 rounded-full bg-[#1A73E8]/5 -z-10"></div>
      <div className="fixed top-1/2 right-12 w-24 h-24 rounded-full bg-purple-500/5 -z-10"></div>
      <div className="fixed bottom-1/4 left-16 w-16 h-16 rounded-full bg-green-500/5 -z-10"></div>
    </div>
  );
};

export default VibeazyOnboarding;