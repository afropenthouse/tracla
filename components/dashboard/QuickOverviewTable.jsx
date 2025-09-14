"use client"
import React, { useState } from 'react';
import { 
  Users, ShoppingBag, Phone, Calendar, Clock, ArrowUpRight, 
  TrendingUp, Eye, MessageSquare, Store, Zap, Star, Crown,
  Activity, Gift, Receipt, Loader2, AlertCircle
} from 'lucide-react';
import { useRecentActivityData } from '@/lib/queries/branch';
import Link from 'next/link';

const VibeazyQuickOverviewTable = () => {
  const [hoveredCustomer, setHoveredCustomer] = useState(null);
  const { data: recentActivityData, isLoading, error } = useRecentActivityData();
  
  const recentCustomersData = recentActivityData?.recentCustomers || [];
  const recentPurchasesData = recentActivityData?.recentPurchases || [];
  
  const formatCurrency = (amount) => `₦${amount.toLocaleString()}`;
  
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60));
    
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return `${Math.floor(diff / 1440)}d ago`;
  };
  
  const getCustomerInitials = (phone) => {
    const lastFourDigits = phone.slice(-4);
    return `${lastFourDigits[0]}${lastFourDigits[2]}`;
  };
  
  const getBranchColor = (branchName) => {
    const colors = {
      'Main Store': 'from-red-500 to-rose-600',
      'Mall Branch': 'from-rose-500 to-red-600',
      'Downtown': 'from-red-400 to-rose-500'
    };
    return colors[branchName] || 'from-gray-500 to-gray-600';
  };
  
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
      {/* Recent Customers */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-4 relative overflow-hidden hover:shadow-xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-red-50 to-rose-50 opacity-30"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#6d0e2b] rounded-lg shadow-lg">
                <Users size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Recent Customers</h3>
                <p className="text-xs text-gray-500">Latest customer activity</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white/50 backdrop-blur-sm rounded-lg px-2 py-1 border border-white/20">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Live</span>
            </div>
          </div>
          
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center py-6">
                <Loader2 size={24} className="animate-spin text-[#6d0e2b] mx-auto mb-2" />
                <p className="text-xs text-gray-600">Loading recent customers...</p>
              </div>
            ) : error ? (
              <div className="text-center py-6">
                <AlertCircle size={24} className="text-[#6d0e2b] mx-auto mb-2" />
                <p className="text-xs text-gray-600">Failed to load customers</p>
              </div>
            ) : recentCustomersData.length === 0 ? (
              <div className="text-center py-6">
                <Users size={24} className="text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-600">No recent customers</p>
              </div>
            ) : (
              recentCustomersData.map((customer) => (
                <div
                  key={customer.id}
                  className="group flex items-center justify-between p-3 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/70 hover:shadow-md transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredCustomer(customer.id)}
                  onMouseLeave={() => setHoveredCustomer(null)}
                >
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 text-xs truncate">
                          {customer.phoneNumber}
                        </p>
                        {customer.isNew ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            New
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {customer.visitCount} visits
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-[#6d0e2b]">
                          {formatCurrency(customer.totalSpent)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(customer.lastVisit)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 transition-all duration-300 ${
                    hoveredCustomer === customer.id ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
                  }`}>
                    <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                      <Eye size={12} className="text-[#6d0e2b]" />
                    </button>
                    <button className="p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                      <MessageSquare size={12} className="text-[#6d0e2b]" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <button className="w-full mt-3 px-4 py-2.5 bg-[#6d0e2b] text-white rounded-lg hover:from-rose-500 hover:to-red-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl group">
            <Link href="/customers" className="flex items-center justify-center gap-2">
              <span className="text-sm">View All Customers</span>
              <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </button>
        </div>
      </div>
      
      {/* Recent Purchases */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-4 relative overflow-hidden hover:shadow-xl transition-all duration-300">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-red-50 to-rose-50 opacity-30"></div>
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-[#6d0e2b] rounded-lg shadow-lg">
                <ShoppingBag size={18} className="text-white" />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Recent Purchases</h3>
                <p className="text-xs text-gray-500">Latest transactions</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 bg-white/50 backdrop-blur-sm rounded-lg px-2 py-1 border border-white/20">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
              <span className="font-medium">Live</span>
            </div>
          </div>
          
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center py-6">
                <Loader2 size={24} className="animate-spin text-[#6d0e2b] mx-auto mb-2" />
                <p className="text-xs text-gray-600">Loading recent purchases...</p>
              </div>
            ) : error ? (
              <div className="text-center py-6">
                <AlertCircle size={24} className="text-[#6d0e2b] mx-auto mb-2" />
                <p className="text-xs text-gray-600">Failed to load purchases</p>
              </div>
            ) : recentPurchasesData.length === 0 ? (
              <div className="text-center py-6">
                <ShoppingBag size={24} className="text-gray-400 mx-auto mb-2" />
                <p className="text-xs text-gray-600">No recent purchases</p>
              </div>
            ) : (
              recentPurchasesData.map((purchase) => (
                <div
                  key={purchase.id}
                  className="group flex items-center justify-between p-3 bg-white/50 backdrop-blur-sm rounded-lg border border-white/20 hover:bg-white/70 hover:shadow-md transition-all duration-300 cursor-pointer"
                >
                  <div className="flex items-center gap-3 flex-1">
                    {/* Left side - Purchase info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-gray-900 text-xs">
                          {formatCurrency(purchase.amount)}
                        </p>
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          {purchase.items} items
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="text-xs text-gray-600 font-medium">
                          {purchase.customerPhone}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatTime(purchase.purchaseDate)}
                        </span>
                      </div>
                    </div>
                    
                    {/* Right side - Branch badge */}
                    <div className={`flex-shrink-0 inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${getBranchColor(purchase.branchName)} text-white`}>
                      <Store size={6} />
                      <span className="truncate max-w-[60px]">{purchase.branchName}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          
          <button className="w-full mt-3 px-4 py-2.5 bg-[#6d0e2b] text-white rounded-lg hover:from-red-500 hover:to-rose-600 transition-all duration-300 font-medium shadow-lg hover:shadow-xl group">
            <Link href="/purchases" className="flex items-center justify-center gap-2">
              <span className="text-sm">View All Purchases</span>
              <ArrowUpRight size={14} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Link>
          </button>
        </div>
      </div>
    </div>
  );
};

export default VibeazyQuickOverviewTable;