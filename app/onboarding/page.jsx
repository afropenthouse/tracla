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
      <div className="flex items-center justify-center gap-4 mb-8">
        {/* <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#d32f2f] to-[#6c0f2a] flex items-center justify-center shadow-lg">
            <span className="text-white font-bold text-2xl">V</span>
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
            <Sparkles className="w-3 h-3 text-white" />
          </div>
        </div> */}
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900">
            Welcome to <span className="bg-gradient-to-r from-[#d32f2f] to-[#6c0f2a] bg-clip-text text-transparent">Vibeazy</span>
          </h1>
          <p className="text-lg text-gray-500 mt-2">Business Dashboard</p>
        </div>
      </div>
      
      {/* <p className="text-xl text-gray-600 max-w-2xl mx-auto">
        Transform your business with powerful customer loyalty and spending analytics
      </p> */}
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
      {[
        { icon: Users, title: "Track Customers", desc: "Monitor visits & spending", gradient: "from-[#d32f2f] to-[#6c0f2a]" },
        { icon: Gift, title: "Reward Loyalty", desc: "Create points & rewards", gradient: "from-[#6c0f2a] to-[#d32f2f]" },
        { icon: MessageSquare, title: "Send Promotions", desc: "Reach via WhatsApp & SMS", gradient: "from-[#d32f2f]/80 to-[#6c0f2a]/80" },
        { icon: TrendingUp, title: "Boost Revenue", desc: "Data-driven insights", gradient: "from-[#6c0f2a]/80 to-[#d32f2f]/80" }
      ].map((feature, index) => (
        <div key={index} className="bg-white/80 backdrop-blur-sm p-6 rounded-xl border border-white/20 hover:border-[#d32f2f]/30 transition-all duration-300 hover:shadow-lg shadow-md">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.gradient} w-fit mb-4`}>
            <feature.icon size={20} className="text-white" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
          <p className="text-sm text-gray-600">{feature.desc}</p>
        </div>
      ))}
    </div>

    <div className="bg-gradient-to-r from-[#d32f2f]/10 to-[#6c0f2a]/10 rounded-2xl p-8 mb-8 border border-[#d32f2f]/20">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">How it works</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { step: "1", title: "Customer Scans QR", desc: "Place QR codes at your business" },
          { step: "2", title: "Upload Receipt", desc: "Customers earn points instantly" },
          { step: "3", title: "Track & Reward", desc: "Monitor and build loyalty" }
        ].map((step, index) => (
          <div key={index} className="text-center">
            <div className="w-12 h-12 bg-gradient-to-r from-[#d32f2f] to-[#6c0f2a] text-white rounded-full flex items-center justify-center mx-auto mb-4 font-semibold text-lg shadow-lg">
              {step.step}
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">{step.title}</h3>
            <p className="text-sm text-gray-600">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>

    <button
      onClick={nextStep}
      className="bg-gradient-to-r from-[#d32f2f] to-[#6c0f2a] text-white px-8 py-4 rounded-xl hover:from-[#6c0f2a] hover:to-[#d32f2f] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform flex items-center gap-2 mx-auto cursor-pointer"
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
      <h2 className="text-2xl font-bold bg-gradient-to-r from-[#d32f2f] to-[#6c0f2a] bg-clip-text text-transparent mb-2">Create Your Business</h2>
      <p className="text-gray-600">Let's start by setting up your business profile</p>
      <div className="bg-red-50/80 border border-red-200/50 rounded-xl p-4 mt-4">
        <p className="text-sm text-red-800">
          <strong>Important:</strong> Enter your business name exactly as it appears on your receipts. This helps us ensure only receipts that belong to your business are recorded.
        </p>
      </div>
    </div>

    {/* General Error Message */}
    {errors.general && (
      <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl">
        <p className="text-sm text-red-600 font-medium">{errors.general}</p>
      </div>
    )}

    <div className="backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-6">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-black mb-2">
            Business Name *
          </label>
          <div className="relative">
            <Building2 size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" />
            <input
              type="text"
              name="name"
              value={businessData.name}
              onChange={handleBusinessInputChange}
              placeholder="Enter your business name"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                errors.name ? 'border-red-400 bg-red-50/50' : 'border-gray-200 bg-white/50'
              } backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/20 focus:border-[#d32f2f] transition-all duration-300`}
              required
              disabled={createBusinessMutation.isPending}
            />
          </div>
          {errors.name && (
            <p className="mt-2 text-sm text-red-600 font-medium">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Business Email *
          </label>
          <div className="relative">
            <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" />
            <input
              type="email"
              name="email"
              value={businessData.email}
              onChange={handleBusinessInputChange}
              placeholder="business@example.com"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                errors.email ? 'border-red-400 bg-red-50/50' : 'border-gray-200 bg-white/50'
              } backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/20 focus:border-[#d32f2f] transition-all duration-300`}
              required
              disabled={createBusinessMutation.isPending}
            />
          </div>
          {errors.email && (
            <p className="mt-2 text-sm text-red-600 font-medium">{errors.email}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-black mb-2">
            Business Phone *
          </label>
          <div className="relative">
            <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" />
            <input
              type="tel"
              name="phone"
              value={businessData.phone}
              onChange={handleBusinessInputChange}
              placeholder="Enter your business phone number"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                errors.phone ? 'border-red-400 bg-red-50/50' : 'border-gray-200 bg-white/50'
              } backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/20 focus:border-[#d32f2f] transition-all duration-300`}
              required
              disabled={createBusinessMutation.isPending}
            />
          </div>
          {errors.phone && (
            <p className="mt-2 text-sm text-red-600 font-medium">{errors.phone}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-black mb-2">
            Business Address *
          </label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-3 text-black" />
            <textarea
              name="address"
              value={businessData.address}
              onChange={handleBusinessInputChange}
              placeholder="Enter your business address"
              rows={3}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                errors.address ? 'border-red-400 bg-red-50/50' : 'border-gray-200 bg-white/50'
              } backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/20 focus:border-[#d32f2f] transition-all duration-300 resize-none`}
              required
              disabled={createBusinessMutation.isPending}
            />
          </div>
          {errors.address && (
            <p className="mt-2 text-sm text-red-600 font-medium">{errors.address}</p>
          )}
        </div>
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={prevStep}
          className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
          disabled={createBusinessMutation.isPending}
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <button
          onClick={handleBusinessSubmit}
          disabled={createBusinessMutation.isPending || !businessData.name || !businessData.email || !businessData.phone || !businessData.address}
          className="flex-1 bg-gradient-to-r from-[#d32f2f] to-[#6c0f2a] text-white px-4 py-3 rounded-xl hover:from-[#6c0f2a] hover:to-[#d32f2f] transition-all duration-300 font-semibold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
          {createBusinessMutation.isPending ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating...</span>
            </div>
          ) : (
            <>
              Continue
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);

// Branch Setup Step
const BranchSetupStep = ({ prevStep, handleBranchSubmit, branchData, handleBranchInputChange, errors, createBranchMutation }) => (
  <div className="max-w-xl mx-auto">
    <div className="text-center mb-8">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-[#d32f2f] to-[#6c0f2a] bg-clip-text text-transparent mb-2">Create Your First Branch</h2>
      <p className="text-gray-600">Set up your first business location to start tracking customers</p>
      <div className="bg-red-50/80 border border-red-200/50 rounded-xl p-4 mt-4">
        <p className="text-sm text-red-800">
          <strong>Note:</strong> Even if you have only one location, please enter a branch name (e.g., "Main Store", "Primary Location") to help organize your business data.
        </p>
      </div>
    </div>

    {/* General Error Message */}
    {errors.general && (
      <div className="mb-6 p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-xl">
        <p className="text-sm text-red-600 font-medium">{errors.general}</p>
      </div>
    )}

    <div className="backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-6">
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-black mb-2">
            Branch Name *
          </label>
          <div className="relative">
            <Building2 size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" />
            <input
              type="text"
              name="name"
              value={branchData.name}
              onChange={handleBranchInputChange}
              placeholder="e.g., Main Store, Downtown Branch"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                errors.name ? 'border-red-400 bg-red-50/50' : 'border-gray-200 bg-white/50'
              } backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/20 focus:border-[#d32f2f] transition-all duration-300`}
              required
              disabled={createBranchMutation.isPending}
            />
          </div>
          {errors.name && (
            <p className="mt-2 text-sm text-red-600 font-medium">{errors.name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-black mb-2">
            Branch Address *
          </label>
          <div className="relative">
            <MapPin size={16} className="absolute left-3 top-3 text-black" />
            <textarea
              name="address"
              value={branchData.address}
              onChange={handleBranchInputChange}
              placeholder="Enter the branch address"
              rows={3}
              className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                errors.address ? 'border-red-400 bg-red-50/50' : 'border-gray-200 bg-white/50'
              } backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/20 focus:border-[#d32f2f] transition-all duration-300 resize-none`}
              required
              disabled={createBranchMutation.isPending}
            />
          </div>
          {errors.address && (
            <p className="mt-2 text-sm text-red-600 font-medium">{errors.address}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-black mb-2">
            Branch Phone *
          </label>
          <div className="relative">
            <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black" />
            <input
              type="tel"
              name="phone"
              value={branchData.phone}
              onChange={handleBranchInputChange}
              placeholder="Enter branch phone number"
              className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                errors.phone ? 'border-red-400 bg-red-50/50' : 'border-gray-200 bg-white/50'
              } backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#d32f2f]/20 focus:border-[#d32f2f] transition-all duration-300`}
              required
              disabled={createBranchMutation.isPending}
            />
          </div>
          {errors.phone && (
            <p className="mt-2 text-sm text-red-600 font-medium">{errors.phone}</p>
          )}
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#d32f2f]/10 to-[#6c0f2a]/10 rounded-xl p-4 mt-6 border border-[#d32f2f]/20">
        <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2 text-sm">
          <QrCode size={14} className="text-[#d32f2f]" />
          What's Next?
        </h4>
        <p className="text-sm text-gray-700">
          Once your branch is created, we'll generate a unique QR code for this location. 
          Customers will scan this code to submit receipts and earn points.
        </p>
      </div>

      <div className="flex gap-4 mt-8">
        <button
          onClick={prevStep}
          className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2"
          disabled={createBranchMutation.isPending}
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <button
          onClick={handleBranchSubmit}
          disabled={createBranchMutation.isPending || !branchData.name || !branchData.address || !branchData.phone}
          className="flex-1 bg-gradient-to-r from-[#d32f2f] to-[#6c0f2a] text-white px-4 py-3 rounded-xl hover:from-[#6c0f2a] hover:to-[#d32f2f] transition-all duration-300 font-semibold disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
          {createBranchMutation.isPending ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Creating...</span>
            </div>
          ) : (
            <>
              Create Branch
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </div>
    </div>
  </div>
);

// Success Step
const SuccessStep = ({ createdBusiness, businessData, createdBranch, branchData, downloadQRCode, handleGetStarted }) => (
  <div className="text-center max-w-2xl mx-auto">
    <div className="mb-8">
      <div className="w-16 h-16 bg-gradient-to-r from-[#d32f2f] to-[#6c0f2a] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
        <CheckCircle size={24} className="text-white" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        You're All Set!
      </h1>
      <p className="text-lg text-gray-600">
        Welcome to Vibeazy! Your business and first branch have been successfully created.
      </p>
    </div>

    <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-6 mb-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Setup Summary</h2>
      <div className="space-y-4">
        <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-[#d32f2f]/5 to-[#6c0f2a]/5 rounded-xl border border-[#d32f2f]/20">
          <Building2 size={18} className="text-[#d32f2f] mt-1" />
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{createdBusiness?.name || businessData.name}</h3>
            <p className="text-sm text-gray-600">{createdBusiness?.email || businessData.email}</p>
            <p className="text-sm text-gray-600">{createdBusiness?.phone || businessData.phone}</p>
          </div>
        </div>
        
        <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-[#6c0f2a]/5 to-[#d32f2f]/5 rounded-xl border border-[#6c0f2a]/20">
          <MapPin size={18} className="text-[#6c0f2a] mt-1" />
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">{createdBranch?.name || branchData.name}</h3>
            <p className="text-sm text-gray-600">{createdBranch?.phone || branchData.phone}</p>
            <p className="text-sm text-gray-600">{createdBranch?.address || branchData.address}</p>
            {createdBranch?.qrCodeUrl && (
              <p className="text-xs text-[#d32f2f] mt-1 font-medium">QR Code Ready</p>
            )}
          </div>
        </div>
      </div>
    </div>

    <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-6 mb-8">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Next Steps</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { icon: QrCode, title: "Download QR Code", desc: "Print and place at your business location", gradient: "from-[#d32f2f] to-[#6c0f2a]" },
          { icon: Gift, title: "Set Up Rewards", desc: "Create your points and loyalty programs", gradient: "from-[#6c0f2a] to-[#d32f2f]" },
          { icon: Users, title: "View Dashboard", desc: "Start monitoring customer activity", gradient: "from-[#d32f2f]/80 to-[#6c0f2a]/80" },
          { icon: MessageSquare, title: "Send Messages", desc: "Connect with customers via WhatsApp", gradient: "from-[#6c0f2a]/80 to-[#d32f2f]/80" }
        ].map((action, index) => (
          <div key={index} className="flex items-start gap-3 p-4 hover:bg-gradient-to-r hover:from-gray-50 hover:to-red-50 rounded-xl transition-all duration-300">
            <div className={`p-2 rounded-lg bg-gradient-to-br ${action.gradient} flex-shrink-0`}>
              <action.icon size={16} className="text-white" />
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-gray-900 text-sm">{action.title}</h3>
              <p className="text-sm text-gray-600">{action.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="flex flex-col sm:flex-row gap-4 justify-center">
      <button 
        onClick={downloadQRCode}
        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium flex items-center justify-center gap-2 cursor-pointer"
      >
        <Download size={18} />
        Download QR Code
      </button>
      <button
        onClick={handleGetStarted}
        className="bg-gradient-to-r from-[#d32f2f] to-[#6c0f2a] text-white px-8 py-3 rounded-xl hover:from-[#6c0f2a] hover:to-[#d32f2f] transition-all duration-300 font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transform flex items-center justify-center gap-2 cursor-pointer"
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
      const response = await api.post("/business", {
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
        loaderColor: "#d32f2f",
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
        managerRole: "OWNER",
        managerEmail: businessData.email,
      });
      return response.data;
    },
    onMutate: () => {
      showLoader({
        text: "Creating your first branch...",
        loaderColor: "#d32f2f",
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

    // Clear errors when user starts typing
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

  const handleBranchInputChange = (e) => {
    const { name, value } = e.target;
    setBranchData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear errors when user starts typing
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
        loaderColor: "#d32f2f",
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
      ctx.fillStyle = '#d32f2f';
      ctx.font = 'bold 18px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(createdBusiness?.name + ' - ' + createdBranch?.name || businessData.name + ' - ' + branchData.name, canvas.width / 2, size + 25);
      
      
      ctx.font = '12px Arial';
      ctx.fillText('Scan to submit receipts and earn points', canvas.width / 2, size + 45,);
  
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-rose-50">
      {/* Progress Bar */}
      {currentStep < 3 && (
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-white/20 py-4">
          <div className="max-w-4xl mx-auto px-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Setup Progress</h3>
              <span className="text-sm text-gray-600">{currentStep + 1} of 3</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-[#d32f2f] to-[#6c0f2a] h-2 rounded-full transition-all duration-500"
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

      {/* Background decorative elements */}
      <div className="fixed top-1/4 left-8 w-20 h-20 rounded-full bg-[#d32f2f]/5 -z-10"></div>
      <div className="fixed top-1/2 right-12 w-24 h-24 rounded-full bg-[#6c0f2a]/5 -z-10"></div>
      <div className="fixed bottom-1/4 left-16 w-16 h-16 rounded-full bg-[#d32f2f]/3 -z-10"></div>
    </div>
  );
};

export default VibeazyOnboarding;