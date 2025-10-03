"use client";

import React, { useState, useEffect } from 'react';
import { X, DollarSign, Users, Calendar, Filter, Loader2, History, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCustomerDetailsModalStore } from '@/store/modalStore';
import { useBusinessStore, useBranchStore } from '@/store/store';
import { getCustomerBusinessAnalytics, getCustomerBranchAnalytics } from '@/lib/api';
import { useToastStore } from '@/store/toastStore';

const CustomerDetailsModal = () => {
  const { isOpen, onClose, customer } = useCustomerDetailsModalStore();
  const { business } = useBusinessStore();
  const { currentBranch } = useBranchStore();
  const { showError } = useToastStore();
  
  const [dateFilter, setDateFilter] = useState({
    dateFrom: '',
    dateTo: ''
  });
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [initialDataLoaded, setInitialDataLoaded] = useState(false);

  const formatCurrency = (amount) => {
    if (amount === undefined || amount === null || isNaN(amount)) {
      return '₦0';
    }
    return `₦${Number(amount).toLocaleString()}`;
  };

  const fetchCustomerAnalytics = async (filter = {}) => {
    if (!business?.id || !customer?.id) return;
    
    setIsLoading(true);
    try {
      let response;
      
      if (currentBranch?.id) {
        // Use branch-level analytics if branch is selected
        response = await getCustomerBranchAnalytics(
          business.id, 
          customer.id, 
          currentBranch.id, 
          filter
        );
      } else {
        // Use business-level analytics
        response = await getCustomerBusinessAnalytics(
          business.id, 
          customer.id, 
          filter
        );
      }
      
      if (response.success) {
        setAnalyticsData(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch customer analytics:', error);
      showError('Failed to load customer analytics. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && business?.id && customer?.id && !initialDataLoaded) {
      fetchCustomerAnalytics();
      setInitialDataLoaded(true);
    }
  }, [isOpen, business, customer, initialDataLoaded]);

  useEffect(() => {
    // Reset initial data loaded when modal closes
    if (!isOpen) {
      setInitialDataLoaded(false);
      setAnalyticsData(null);
    }
  }, [isOpen]);

  const handleDateFilterChange = (field, value) => {
    setDateFilter(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyDateFilter = async () => {
    await fetchCustomerAnalytics(dateFilter);
  };

  const clearDateFilter = async () => {
    setDateFilter({ dateFrom: '', dateTo: '' });
    await fetchCustomerAnalytics({});
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!customer) return null;

  const displayData = analyticsData || customer;
  const recentPurchases = customer.recentPurchases || [];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                         w-[90vw] max-w-[400px] sm:max-w-2xl bg-white/80 backdrop-blur-xl 
                         rounded-2xl shadow-2xl border border-white/20 z-50 overflow-hidden max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 sm:p-6 border-b border-gray-200/50">
              <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                <div className="w-8 h-8 sm:w-12 sm:h-12 bg-[#6c0f2a] rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <Users className="w-4 h-4 sm:w-6 sm:h-6 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Customer Details</h2>
                  <p className="text-xs sm:text-base text-gray-600 truncate">
                    {customer.phoneNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer flex-shrink-0"
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
              </button>
            </div>

            {/* Main Content */}
            <div className="p-3 sm:p-6 space-y-3 sm:space-y-6 overflow-y-auto max-h-[70vh]">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Total Spent */}
                <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 bg-[#6c0f2a]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <DollarSign className="w-3 h-3 text-[#6c0f2a]" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-700">Total Spent</h3>
                  </div>
                  <p className="text-lg font-bold text-gray-900 break-words">
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#6c0f2a]" />
                        <span className="text-sm">Loading...</span>
                      </div>
                    ) : (
                      formatCurrency(displayData.totalSpend || displayData.totalSpent)
                    )}
                  </p>
                </div>

                {/* Total Visits */}
                <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 bg-[#6c0f2a]/10 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Users className="w-3 h-3 text-[#6c0f2a]" />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-700">Total Visits</h3>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[#6c0f2a]" />
                        <span className="text-sm">Loading...</span>
                      </div>
                    ) : (
                      displayData.totalVisits || displayData.visitCount || 0
                    )}
                  </p>
                </div>
              </div>

              {/* Date Range Filter - Elegant Design */}
              <div className="bg-gradient-to-br from-white/90 to-gray-50/80 backdrop-blur-xl border border-gray-200/50 shadow-xl rounded-2xl p-6">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-gradient-to-br from-[#6c0f2a]/10 to-[#d32f2f]/10 rounded-xl">
                    <Filter className="w-5 h-5 text-[#6c0f2a]" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-800">Filter by Date Range</h3>
                </div>
                
                {/* Date Inputs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">From Date</label>
                    <input
                      type="date"
                      value={dateFilter.dateFrom}
                      onChange={(e) => handleDateFilterChange('dateFrom', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#6c0f2a]/30 focus:border-[#6c0f2a] transition-all duration-300 text-sm shadow-sm hover:shadow-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">To Date</label>
                    <input
                      type="date"
                      value={dateFilter.dateTo}
                      onChange={(e) => handleDateFilterChange('dateTo', e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#6c0f2a]/30 focus:border-[#6c0f2a] transition-all duration-300 text-sm shadow-sm hover:shadow-md"
                    />
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={clearDateFilter}
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                  >
                    Clear Filters
                  </button>
                  <button
                    onClick={applyDateFilter}
                    disabled={isLoading}
                    className="flex-1 px-6 py-3 text-sm font-medium text-white bg-gradient-to-r from-[#6c0f2a] to-[#d32f2f] rounded-xl hover:from-[#d32f2f] hover:to-[#6c0f2a] transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02]"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                          Applying...
                        </div>
                      ) : (
                        'Apply Filter'
                      )}
                    </button>
                  </div>
                </div>

              {/* Recent Purchases Section */}
              <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg rounded-xl p-3">
                <div className="flex items-center gap-2 mb-3">
                  <History className="w-4 h-4 text-gray-600" />
                  <h3 className="text-sm font-semibold text-gray-700">Recent Purchases</h3>
                </div>
                
                {recentPurchases.length === 0 ? (
                  <div className="text-center py-8">
                    <Receipt className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No recent purchases found</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {recentPurchases.map((purchase, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-white/50 rounded-lg border border-gray-100"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#6c0f2a]/10 rounded-lg flex items-center justify-center">
                            <Receipt className="w-4 h-4 text-[#6c0f2a]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {formatCurrency(purchase.amount)}
                            </p>
                            <p className="text-xs text-gray-500">
                              Purchase #{index + 1}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-600">
                            {formatDate(purchase.purchaseDate)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CustomerDetailsModal;