"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, MapPin, Phone, X, ArrowRight } from 'lucide-react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToastStore } from "@/store/toastStore";
import api from "@/lib/api";
import { useLoadingStore } from "@/store/loadingStore";
import { useBranchStore, useBusinessStore } from "@/store/store";
import { useCreateBranchModalStore } from "@/store/modalStore";

const CreateBranchModal = () => {
  const { isOpen, onClose } = useCreateBranchModalStore();
  const { showLoader, hideLoader } = useLoadingStore();
  const { business } = useBusinessStore();
  const { addBranch } = useBranchStore();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToastStore();
  
  const [branchData, setBranchData] = useState({
    name: '',
    address: '',
    phone: ''
  });
  
  const [errors, setErrors] = useState({});
  
  const createBranchMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post(`/branches/${business.id}`, {
        name: data.name,
        address: data.address,
        phone: data.phone,
        managerRole: "OWNER",
        managerEmail: business.email,
      });
      return response.data;
    },
    onMutate: () => {
      showLoader({
        text: "Creating branch...",
        loaderColor: "#6c0f2a",
        textColor: "#ffffff",
        backgroundColor: "rgba(0, 0, 0, 0.7)",
      });
    },
    onSuccess: (data) => {
      hideLoader();
      addBranch(data.data.branch);
      showSuccess("Branch created successfully!");
      queryClient.invalidateQueries({ queryKey: ["businesses"] });
      handleClose();
    },
    onError: (error) => {
      hideLoader();
      const errorData = error.response?.data;
      const backendMessage = errorData?.message || errorData?.error || "Failed to create branch. Please try again.";
      
      // Show toast with backend message for all errors
      showError(backendMessage);
      
      // Set form errors for display
      if (error.response?.status === 403) {
        setErrors({ general: backendMessage });
      } else if (error.response?.status === 400) {
        setErrors({ general: backendMessage });
      } else {
        setErrors({ general: backendMessage });
      }
    },
  });
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setBranchData(prev => ({
      ...prev,
      [name]: value
    }));
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
  
  const validateData = () => {
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
  
  const handleSubmit = () => {
    setErrors({});
    if (validateData()) {
      createBranchMutation.mutate(branchData);
    }
  };
  
  const handleClose = () => {
    setBranchData({ name: '', address: '', phone: '' });
    setErrors({});
    onClose();
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
                  <Building2 size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Create New Branch</h2>
                  <p className="text-xs sm:text-sm text-gray-600">Add a new location to your business</p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                disabled={createBranchMutation.isPending}
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
              
              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Branch Name *
                  </label>
                  <div className="relative">
                    <Building2 size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10" />
                    <input
                      type="text"
                      name="name"
                      value={branchData.name}
                      onChange={handleInputChange}
                      placeholder="e.g., Main Store, Downtown Branch"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                        errors.name ? 'border-red-400 bg-red-50/50' : 'border-gray-200 bg-white/50'
                      } backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#6c0f2a]/20 focus:border-[#6c0f2a] transition-all duration-300`}
                      required
                      disabled={createBranchMutation.isPending}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.name}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Branch Address *
                  </label>
                  <div className="relative">
                    <MapPin size={16} className="absolute left-3 top-3 text-gray-500 z-10" />
                    <textarea
                      name="address"
                      value={branchData.address}
                      onChange={handleInputChange}
                      placeholder="Enter the branch address"
                      rows={3}
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                        errors.address ? 'border-red-400 bg-red-50/50' : 'border-gray-200 bg-white/50'
                      } backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#6c0f2a]/20 focus:border-[#6c0f2a] transition-all duration-300 resize-none`}
                      required
                      disabled={createBranchMutation.isPending}
                    />
                  </div>
                  {errors.address && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.address}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Branch Phone *
                  </label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 z-10" />
                    <input
                      type="tel"
                      name="phone"
                      value={branchData.phone}
                      onChange={handleInputChange}
                      placeholder="Enter branch phone number"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl border ${
                        errors.phone ? 'border-red-400 bg-red-50/50' : 'border-gray-200 bg-white/50'
                      } backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#6c0f2a]/20 focus:border-[#6c0f2a] transition-all duration-300`}
                      required
                      disabled={createBranchMutation.isPending}
                    />
                  </div>
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-600 font-medium">{errors.phone}</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Footer */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 p-4 sm:p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors font-medium"
                disabled={createBranchMutation.isPending}
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={createBranchMutation.isPending || !branchData.name || !branchData.address || !branchData.phone}
                className="flex-1 bg-gradient-to-r from-[#6c0f2a] to-rose-600 text-white px-4 py-3 rounded-xl cursor-pointer hover:to-[#6c0f2a] transition-all duration-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
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
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateBranchModal;