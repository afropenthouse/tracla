"use client"
import React, { useState, useEffect } from 'react';
import {
  Building2, Users, MapPin, Phone, Mail, Crown, Shield, 
  ChevronDown, BarChart3, TrendingUp, Store, QrCode,
  Plus, Settings, Eye, MoreVertical, ArrowRight, Sparkles,
  Activity, Globe, Calendar, CheckCircle, Clock, Star, Loader2, AlertCircle,
  Edit2, X, Check
} from 'lucide-react';
import { useBusinessesAndBranches, businessKeys } from '@/lib/queries/branch';
import { useQueryClient } from '@tanstack/react-query';
import { useBranchStore, useBusinessStore } from '@/store/store';
import { useCreateBranchModalStore } from '@/store/modalStore';
import { useRouter } from 'next/navigation';
import CreateBranchModal from '@/components/modals/CreateBranchModal';
import api from '@/lib/api';
import { useToastStore } from '@/store/toastStore';

const BusinessOverviewPage = () => {
  // Fetch businesses and branches from backend
  const { data: businessesData, isLoading, error } = useBusinessesAndBranches();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToastStore();
  
  // Get store state and actions
  const { currentBranch, setCurrentBranch, setBranches } = useBranchStore();
  const { business, setBusiness } = useBusinessStore();
  const { onOpen } = useCreateBranchModalStore();
  
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [nameError, setNameError] = useState('');
  
  // Initialize stores when data is fetched
  useEffect(() => {
    if (businessesData?.businesses?.length > 0) {
      const firstBusiness = businessesData.businesses[0];
      
      // Set business data (excluding branches array)
      const { branches, ...businessData } = firstBusiness;
      setBusiness(businessData);
      
      // Set branches array
      setBranches(branches || []);
      
      // If no current branch is selected and user has branches, don't auto-select
      // Let them choose between business view or branch view
    }
  }, [businessesData, setBusiness, setBranches]);
  
  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-rose-50 flex items-center justify-center p-4">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-[#6c0f2a] mx-auto mb-4" />
          <p className="text-gray-600">Loading your business data...</p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-rose-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-xl shadow-lg p-8 max-w-md mx-4">
          <AlertCircle size={48} className="text-[#6c0f2a] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Failed to Load</h2>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }
  
  if (!business || !businessesData?.businesses?.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-rose-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600">No business data available</p>
        </div>
      </div>
    );
  }
  
  const currentBusiness = businessesData.businesses[0];
  const isOwner = currentBusiness.userRole === 'OWNER';
  const allBranches = currentBusiness.branches || [];
  
  const getTierColor = (tier) => {
    const colors = {
      'premium': 'from-yellow-400 to-orange-500',
      'standard': 'from-blue-400 to-blue-600',
      'basic': 'from-gray-400 to-gray-600'
    };
    return colors[tier] || 'from-gray-400 to-gray-600';
  };
  
  const getTierIcon = (tier) => {
    return tier === 'premium' ? Crown : tier === 'standard' ? Shield : Star;
  };
  
  const formatCurrency = (amount) => `$${amount.toLocaleString()}`;
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  const router = useRouter();
  
  // Business name editing functions
  const handleEditName = () => {
    setEditedName(currentBusiness.name);
    setIsEditingName(true);
    setNameError('');
  };
  
  const handleCancelEdit = () => {
    setIsEditingName(false);
    setEditedName('');
    setNameError('');
  };
  
  const validateName = (name) => {
    if (!name || name.trim().length === 0) {
      return 'Business name is required';
    }
    if (name.trim().length < 2) {
      return 'Business name must be at least 2 characters';
    }
    if (name.trim().length > 200) {
      return 'Business name must be less than 200 characters';
    }
    return '';
  };
  
  const handleSaveName = async () => {
    const trimmedName = editedName.trim();
    const validationError = validateName(trimmedName);
    
    if (validationError) {
      setNameError(validationError);
      return;
    }
    
    if (trimmedName === currentBusiness.name) {
      setIsEditingName(false);
      setNameError('');
      return;
    }
    
    setIsUpdating(true);
    setNameError('');
    
    try {
      const response = await api.patch(`/business/${currentBusiness.id}/name`, {
        name: trimmedName
      });
      
      // Update the business in the store
      setBusiness({ ...business, name: trimmedName });
      
      // Invalidate and refetch the businesses and branches query
      await queryClient.invalidateQueries({
        queryKey: businessKeys.businessesAndBranches()
      });
      
      showSuccess('Business name updated successfully!');
      
      setIsEditingName(false);
      setEditedName('');
    } catch (err) {
      console.error('Error updating business name:', err);
      
      // Extract the actual backend error message
      const errorData = err.response?.data;
      const backendMessage = errorData?.message || errorData?.error || 'Failed to update business name. Please try again.';
      
      setNameError(backendMessage);
      showError(backendMessage);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleBusinessViewSelect = () => {
    setCurrentBranch(null); // Clear current branch to show business view
    router.push('/dashboard');
  };
  
  const handleBranchSelect = (branch) => {
    setCurrentBranch(branch); // Set selected branch
    router.push('/dashboard');
  };
  
  const getSelectedBranch = () => {
    return currentBranch;
  };
  
  const isBusinessView = !currentBranch;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-rose-50 p-3 sm:p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
        
        {/* Header Section */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-4 sm:p-6">
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
    <div className="flex items-center gap-3 sm:gap-4">
      {/* Icon container - hidden on mobile, visible on sm and up */}
      <div className="hidden sm:flex w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-[#6c0f2a] items-center justify-center shadow-lg">
        <Building2 size={20} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
          {isEditingName ? (
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveName();
                  if (e.key === 'Escape') handleCancelEdit();
                }}
                className="text-xl sm:text-2xl font-bold text-gray-900 bg-white border border-gray-300 rounded-lg px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[#6c0f2a] focus:border-transparent w-full max-w-xs"
                placeholder="Enter business name"
                autoFocus
                disabled={isUpdating}
              />
              <button
                onClick={handleSaveName}
                disabled={isUpdating}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isUpdating ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              </button>
              <button
                onClick={handleCancelEdit}
                disabled={isUpdating}
                className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">{currentBusiness.name}</h1>
              {isOwner && (
                <button
                  onClick={handleEditName}
                  className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer flex-shrink-0"
                  title="Edit business name"
                >
                  <Edit2 size={16} />
                </button>
              )}
            </div>
          )}
          <div className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full ${getTierColor(currentBusiness.currentTier)} text-white text-xs sm:text-sm font-medium flex-shrink-0`}>
            {React.createElement(getTierIcon(currentBusiness.currentTier), { size: 12 })}
            {currentBusiness.currentTier.charAt(0).toUpperCase() + currentBusiness.currentTier.slice(1)}
          </div>
        </div>
        {nameError && (
          <div className="flex items-center gap-2 text-sm text-red-600 mb-1 sm:mb-2">
            <AlertCircle size={14} />
            {nameError}
          </div>
        )}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1 truncate">
            <Mail size={14} />
            <span className="truncate">{currentBusiness.email}</span>
          </div>
          <div className="flex items-center gap-1">
            <Phone size={14} />
            {currentBusiness.phone}
          </div>
          <div className="flex items-center gap-1">
            <Store size={14} />
            {currentBusiness.branchCount} branches
          </div>
        </div>
      </div>
    </div>
    
    <div className="flex items-center gap-3">
      <div className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium ${
        isOwner 
          ? 'bg-[#6c0f2a] text-white' 
          : 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white'
      }`}>
        {isOwner ? 'Business Owner' : 'Branch Manager'}
      </div>
    </div>
  </div>
</div>
        
        {/* Currently Selected View */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#6c0f2a] flex items-center justify-center shadow-lg">
              {isBusinessView ? (
                <BarChart3 size={18} className="text-white" />
              ) : (
                <Store size={18} className="text-white" />
              )}
            </div>
            <div>
              <p className="text-sm text-gray-600">Currently Viewing</p>
              <p className="font-semibold text-gray-900 truncate">
                {isBusinessView ? 'Overall Business' : getSelectedBranch()?.name}
              </p>
            </div>
          </div>
        </div>
        
        {/* Business & Branch Management Section */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4 sm:mb-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Business & Branch Management</h3>
              <p className="text-sm text-gray-600">Select a view and manage your locations</p>
            </div>
            {isOwner && (
              <button 
                onClick={onOpen}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-[#6c0f2a] text-white rounded-xl cursor-pointer transition-all duration-300 font-medium shadow-lg w-full sm:w-auto"
              >
                <Plus size={16} />
                Add Branch
              </button>
            )}
          </div>
          
          {/* Overall Business Option */}
          <div className="mb-4 sm:mb-6">
            <button
              onClick={handleBusinessViewSelect}
              className={`w-full flex flex-col sm:flex-row sm:items-start justify-between p-4 rounded-xl border-2 transition-all duration-300 cursor-pointer ${
                isBusinessView 
                  ? 'border-[#6c0f2a] bg-[#6c0f2a]' 
                  : 'border-gray-200 bg-white/50 hover:border-gray-300 hover:bg-white/70'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-lg ${
                  isBusinessView 
                    ? 'bg-[#6c0f2a]' 
                    : 'bg-[#6c0f2a]'
                }`}>
                  <Building2 size={20} color={`${isBusinessView ? 'white' : 'white'}`} />
                </div>
                <div className="text-left flex-1 min-w-0">
                  <h4 className={`font-semibold ${isBusinessView ? 'text-white' : 'text-gray-900'} truncate`}>
                    {business?.name || currentBusiness.name}
                  </h4>
                  <p className={`text-sm font-medium ${isBusinessView ? 'text-white' : 'text-gray-600'}`}>
                    Overall business view • {currentBusiness.branchCount} branches
                  </p>
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 mt-2">
                    <div className={`flex items-center gap-1 text-xs ${isBusinessView ? 'text-white' : 'text-gray-600'} truncate`}>
                      <Mail size={12} />
                      <span className="truncate">{currentBusiness.email}</span>
                    </div>
                    <div className={`flex items-center gap-1 text-xs ${isBusinessView ? 'text-white' : 'text-gray-600'}`}>
                      <Phone size={12} />
                      {currentBusiness.phone}
                    </div>
                  </div>
                </div>
              </div>
              {isBusinessView && (
                <div className="flex items-center gap-2 text-sm text-white font-medium mt-3 sm:mt-0">
                  <CheckCircle size={16} />
                  Selected
                </div>
              )}
            </button>
          </div>
          
          {/* Individual Branches */}
          <div>
            <h4 className="text-md font-medium text-gray-700 mb-4">Individual Branches</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allBranches.map((branch) => (
                <button
                  key={branch.id}
                  onClick={() => handleBranchSelect(branch)}
                  className={`flex flex-col items-start p-4 rounded-xl border-2 transition-all duration-300 text-left cursor-pointer ${
                    currentBranch?.id === branch.id 
                      ? 'border-[#6c0f2a]' 
                      : 'border-gray-200 bg-white/50 hover:border-gray-300 hover:bg-white/70'
                  }`}
                >
                  <div className="flex items-start justify-between w-full mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-lg ${
                        currentBranch?.id === branch.id 
                          ? 'bg-[#6c0f2a]' 
                          : 'bg-[#6c0f2a]'
                      }`}>
                        <Store size={16} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 truncate">{branch.name}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <div className={`w-2 h-2 rounded-full ${branch.isActive ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <span className={`text-xs font-medium ${branch.isActive ? 'text-green-600' : 'text-[#6c0f2a]'}`}>
                            {branch.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                    </div>
                    {currentBranch?.id === branch.id && (
                      <div className="flex items-center gap-1 text-xs text-[#6c0f2a] font-medium flex-shrink-0">
                        <CheckCircle size={14} />
                        Selected
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 mb-4 w-full">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={12} />
                      <span className="truncate">{branch.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Phone size={12} />
                      <span>{branch.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={12} />
                      <span>Since {formatDate(branch.createdAt)}</span>
                    </div>
                  </div>
                  {isOwner && (
                    <div className="flex items-center gap-2 w-full">
                      <div className="flex-1 px-3 py-1.5 bg-[#6c0f2a] text-white rounded-lg text-xs font-medium text-center">
                        View Dashboard
                      </div>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle QR code action
                        }}
                        className="px-3 py-1.5 border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <QrCode size={12} />
                      </button>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Create Branch Modal */}
      <CreateBranchModal />
    </div>
  );
};

export default BusinessOverviewPage;