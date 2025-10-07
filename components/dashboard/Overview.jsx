"use client";
import React, { useState } from "react";
import VibeazyQuickOverviewTable from '@/components/dashboard/QuickOverviewTable';
import { useOverviewData, useTopCustomersData, useTodayStats } from '@/lib/queries/branch';
import { useBranchStore, useBusinessStore } from '@/store/store';
import {
  Users,
  DollarSign,
  TrendingUp,
  Star,
  Calendar,
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  ShoppingBag,
  Clock,
  Phone,
  MapPin,
  Award,
  Activity,
  Eye,
  Target,
  MessageSquare,
  FileText,
  QrCode,
  BarChart3,
  Building2,
  AlertCircle,
  Gift,
  Zap,
  Crown,
  Sparkles,
  Store,
  ChevronDown,
  Check,
  Edit3,
} from "lucide-react";

// Enhanced TimePeriodFilter with solid color buttons
const TimePeriodFilter = ({ selectedPeriod, onPeriodChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [customDays, setCustomDays] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const predefinedPeriods = [
    { value: 7, label: 'Last 7 days' },
    { value: 30, label: 'Last 30 days' },
    { value: 60, label: 'Last 60 days' },
    { value: 90, label: 'Last 90 days' },
  ];
  
  const handlePeriodSelect = (days) => {
    onPeriodChange(days);
    setIsOpen(false);
    setShowCustomInput(false);
  };
  
  const handleCustomSubmit = () => {
    const days = parseInt(customDays);
    if (days && days > 0) {
      onPeriodChange(days);
      setIsOpen(false);
      setShowCustomInput(false);
      setCustomDays('');
    }
  };
  
  const getCurrentLabel = () => {
    const predefined = predefinedPeriods.find(p => p.value === selectedPeriod);
    if (predefined) return predefined.label;
    return `Last ${selectedPeriod} days`;
  };
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-3 bg-white/90 backdrop-blur-xl border border-white/30 rounded-2xl hover:bg-white hover:shadow-lg transition-all duration-300 text-sm font-semibold text-gray-800 w-full group"
      >
        <Calendar size={18} className="text-[#6d0e2b]" />
        <span className="truncate flex-1 text-left">{getCurrentLabel()}</span>
        <ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''} text-gray-500 group-hover:text-[#6d0e2b]`} />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => {
              setIsOpen(false);
              setShowCustomInput(false);
              setCustomDays('');
            }}
          />
          
          <div className="absolute top-full right-0 mt-3 w-full max-w-sm bg-white/95 backdrop-blur-xl border border-white/30 shadow-2xl rounded-2xl p-3 z-50 animate-in fade-in-0 zoom-in-95">
            <div className="space-y-1">
              {predefinedPeriods.map((period) => (
                <button
                  key={period.value}
                  onClick={() => handlePeriodSelect(period.value)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all duration-300 ${
                    selectedPeriod === period.value
                      ? 'bg-[#6d0e2b] text-white shadow-lg'
                      : 'hover:bg-gray-50/80 text-gray-700 hover:text-[#6d0e2b]'
                  }`}
                >
                  <span className="font-medium">{period.label}</span>
                  {selectedPeriod === period.value && <Check size={16} className="text-white" />}
                </button>
              ))}
              
              <div className="border-t border-gray-200/50 my-2"></div>
              
              {!showCustomInput ? (
                <button
                  onClick={() => setShowCustomInput(true)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-gray-700 hover:bg-gray-50/80 hover:text-[#6d0e2b] transition-all duration-300 group"
                >
                  <Edit3 size={16} className="text-gray-500 group-hover:text-[#6d0e2b]" />
                  <span className="font-medium">Custom period</span>
                </button>
              ) : (
                <div className="p-3 bg-gray-50/50 rounded-xl border border-gray-200/30">
                  <div className="flex items-center gap-2 mb-3">
                    <input
                      type="number"
                      value={customDays}
                      onChange={(e) => setCustomDays(e.target.value)}
                      placeholder="Enter days"
                      className="flex-1 px-4 py-3 bg-white/80 border border-gray-200/50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6d0e2b]/30 focus:border-[#6d0e2b] transition-all duration-300"
                      min="1"
                      max="3650"
                      autoFocus
                    />
                    <span className="text-sm text-gray-600 whitespace-nowrap font-medium">days</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={handleCustomSubmit}
                      disabled={!customDays || parseInt(customDays) <= 0}
                      className="flex-1 px-4 py-3 bg-[#6d0e2b] text-white rounded-xl text-sm font-semibold hover:bg-[#6d0e2b]/90 hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Apply
                    </button>
                    <button
                      onClick={() => {
                        setShowCustomInput(false);
                        setCustomDays('');
                      }}
                      className="px-4 py-3 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Sleek Overview Cards with solid color icons
const OverviewCards = ({ data, isLoading, error }) => {
  const cards = [
    {
      title: "Total Customer Spend",
      value: data ? 
        (data.totalSpend >= 1000000 ? `₦${(data.totalSpend / 1000000).toFixed(1)}M` : 
         data.totalSpend >= 1000 ? `₦${(data.totalSpend / 1000).toFixed(1)}K` : 
         `₦${data.totalSpend?.toFixed(0)}`) : "₦0",
      subtitle: "All-time revenue",
      change: data ? data?.spendGrowth : 0,
      icon: DollarSign,
    },
    {
      title: "Total Customers",
      value: data ? data.totalCustomers.toLocaleString() : "0",
      subtitle: "Unique customers",
      change: data ? data?.customerGrowth : 12,
      icon: Users,
    },
    {
      title: "Average Spend",
      value: data
        ? (data.avgSpendPerCustomer >= 1000 ? `₦${(data.avgSpendPerCustomer / 1000).toFixed(1)}K` : `₦${data.avgSpendPerCustomer?.toFixed(0)}`)
        : "₦0",
      subtitle: "Per customer",
      change: data ? data?.avgSpendGrowth : 0,
      icon: TrendingUp,
    },
    {
      title: "Total Visits",
      value: data ? data.totalVisits.toLocaleString() : "0",
      subtitle: "All transactions",
      change: data ? data?.visitsGrowth : 0,
      icon: Receipt,
    },
    {
      title: "Active Customers",
      value: data ? data.activeCustomers.toLocaleString() : "0",
      subtitle: "Last 30 days",
      change: data ? data?.activeGrowth : 0,
      icon: Activity,
    },
    {
      title: "Monthly Revenue",
      value: data ? 
        (data.monthlyRevenue >= 1000000 ? `₦${(data.monthlyRevenue / 1000000).toFixed(1)}M` : 
         data.monthlyRevenue >= 1000 ? `₦${(data.monthlyRevenue / 1000).toFixed(1)}K` : 
         `₦${data.monthlyRevenue?.toFixed(0)}`) : "₦0",
      subtitle: "This month",
      change: data ? data?.monthlyGrowth : 0,
      icon: Gift,
    },
  ];

  if (error) {
    return (
      <div className="grid grid-cols-1 gap-6 mb-8">
        <div className="col-span-full bg-red-50/80 backdrop-blur-xl border border-red-200/50 rounded-2xl p-6 text-center">
          <AlertCircle size={32} className="text-red-500 mx-auto mb-3" />
          <p className="text-red-700 font-semibold">{error?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className="group bg-white/90 backdrop-blur-xl border border-white/40 rounded-2xl p-5 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 relative overflow-hidden"
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-[#6d0e2b]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-4 -right-4 w-8 h-8 bg-[#6d0e2b]/10 rounded-full group-hover:scale-150 transition-transform duration-700"></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-[#6d0e2b]/10 rounded-full group-hover:scale-150 transition-transform duration-700 delay-100"></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 rounded-2xl bg-[#6d0e2b] shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                <card.icon size={20} className="text-white" />
              </div>
              {!isLoading && card.change !== undefined && (
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                  card.change >= 0 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {card.change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {Math.abs(card.change)}%
                </div>
              )}
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium text-gray-600">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">
                {isLoading ? (
                  <span className="inline-block h-7 w-24 bg-gray-200 rounded-lg animate-pulse"></span>
                ) : (
                  card.value
                )}
              </p>
              <p className="text-xs text-gray-500 font-medium">{card.subtitle}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Enhanced Today Stats with solid color design
const TodayStats = ({ data, isLoading, error }) => {
  const formatCurrency = (amount) => `₦${amount?.toLocaleString() || '0'}`;
  
  if (isLoading) {
    return (
      <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-[#6d0e2b] rounded-xl shadow-lg">
            <Zap size={20} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Today's Performance</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-3"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl p-6 mb-8">
        <div className="bg-red-50/80 border border-red-200/50 rounded-xl p-4 text-center">
          <AlertCircle size={24} className="text-red-500 mx-auto mb-2" />
          <p className="text-red-700 font-semibold text-sm">{error?.message}</p>
        </div>
      </div>
    );
  }
  
  const stats = [
    {
      title: "Revenue",
      value: data ? formatCurrency(data.revenue) : "₦0",
      icon: DollarSign,
    },
    {
      title: "New Customers",
      value: data ? data.customers.toString() : "0",
      icon: Users,
    },
    {
      title: "Transactions",
      value: data ? data.transactions.toString() : "0",
      icon: Receipt,
    },
    {
      title: "Visits",
      value: data ? data.visits.toString() : "0",
      icon: Activity,
    },
    {
      title: "Avg Transaction",
      value: data ? formatCurrency(data.avgTransaction) : "₦0",
      icon: TrendingUp,
    },
  ];
  
  return (
    <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl p-6 mb-8 relative overflow-hidden group">
      {/* Animated background */}
      <div className="absolute inset-0 bg-[#6d0e2b]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#6d0e2b] rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
              <Zap size={20} className="text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Today's Performance</h3>
              <p className="text-sm text-gray-600">Real-time business metrics</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-3 py-2 bg-green-100 rounded-xl border border-green-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-semibold text-green-700">Live</span>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white border border-white/40 shadow-lg rounded-xl p-3 sm:p-4 hover:scale-105 transition-all duration-300 group/card"
            >
              {/* Mobile layout: icon + number + label inline for sleek look */}
              <div className="flex items-center gap-3 sm:hidden">
                <div className="p-2 bg-[#6d0e2b]/10 rounded-lg">
                  <stat.icon size={16} className="text-[#6d0e2b]" />
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-lg font-bold text-gray-900">{stat.value}</span>
                  <span className="text-[11px] font-medium text-gray-600">{stat.title}</span>
                </div>
              </div>

              {/* Larger screens: original stacked layout */}
              <div className="hidden sm:flex items-center gap-3 mb-2">
                <div className="p-2 bg-[#6d0e2b]/10 rounded-lg">
                  <stat.icon size={16} className="text-[#6d0e2b]" />
                </div>
                <span className="text-xs font-semibold text-gray-600">{stat.title}</span>
              </div>
              <p className="hidden sm:block text-lg font-bold text-gray-900 truncate">
                {stat.value}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Premium Customer Cards with solid color design
const CustomerCards = ({ topSpender, frequentCustomer, allTimeCustomer, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/90 backdrop-blur-xl border border-white/40 rounded-2xl p-5 relative overflow-hidden">
            <div className="animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="space-y-3">
                <div className="h-16 bg-gray-200 rounded-xl"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="col-span-full bg-white/90 backdrop-blur-xl border border-white/40 rounded-2xl p-6 text-center">
          <AlertCircle size={36} className="text-red-500 mx-auto mb-3" />
          <p className="text-gray-700 font-semibold mb-1">Failed to load top customers</p>
          <p className="text-sm text-gray-500">{error.message}</p>
        </div>
      </div>
    );
  }

  const CustomerCard = ({ customer, title, description, icon: Icon }) => (
    <div className="group bg-white/90 backdrop-blur-xl border border-white/40 rounded-2xl p-5 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 relative overflow-hidden">
      {/* Background color */}
      <div className="absolute inset-0 bg-[#6d0e2b]/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-[#6d0e2b] rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
            <Icon size={18} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-sm">{title}</h3>
            <p className="text-xs text-gray-600">{description}</p>
          </div>
        </div>
        
        {customer ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/50">
              <div className="p-2 bg-[#6d0e2b]/10 rounded-lg">
                <Phone size={14} className="text-[#6d0e2b]" />
              </div>
              <div>
                <span className="font-semibold text-gray-900 block text-sm">{customer.phone}</span>
                <span className="text-xs text-gray-600">Phone Number</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="text-center p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/50">
                <span className="text-xs text-gray-600 block mb-1">Total Spent</span>
                <span className="text-lg font-bold text-[#6d0e2b]">
                  ₦{customer.spend?.toLocaleString() || customer.totalSpend?.toLocaleString() || 0}
                </span>
              </div>
              <div className="text-center p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/50">
                <span className="text-xs text-gray-600 block mb-1">Visits</span>
                <span className="text-lg font-bold text-gray-900">{customer.visits || 0}</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <Icon size={32} className="text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600">No customer data available</p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <CustomerCard
        customer={topSpender}
        title="Top Spender This Week"
        description="Highest spending customer"
        icon={Crown}
      />
      
      <CustomerCard
        customer={frequentCustomer}
        title="Most Frequent This Week"
        description="Most visits this week"
        icon={Activity}
      />
      
      <CustomerCard
        customer={allTimeCustomer}
        title="All-Time Top Customer"
        description="Lifetime value champion"
        icon={Star}
      />
    </div>
  );
};

// Main VibEazy Overview Component with premium design
const VibEazyOverview = () => {
  const { currentBranch } = useBranchStore();
  const { business } = useBusinessStore();
  const [selectedPeriod, setSelectedPeriod] = useState(30);
  
  const { data, isLoading, error } = useOverviewData(selectedPeriod);
  const { data: topCustomersData, isLoading: topCustomersLoading, error: topCustomersError } = useTopCustomersData();
  const { data: todayData, isLoading: todayLoading, error: todayError } = useTodayStats();
  
  const handlePeriodChange = (days) => {
    setSelectedPeriod(days);
  };
  
  return (
    <div className="min-h-screen p-4 sm:p-6 bg-gradient-to-br from-slate-50 via-rose-50/30 to-orange-50/20 overflow-x-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header with Context */}
        <div className="mb-6 sm:mb-8 bg-white/90 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl p-4 sm:p-6 relative z-30 group hover:shadow-2xl transition-all duration-500">
          {/* Background decoration */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#6d0e2b]/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-[#6d0e2b] rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                  {currentBranch ? <Store size={24} className="text-white" /> : <BarChart3 size={24} className="text-white" />}
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">
                    {currentBranch ? currentBranch.name : business?.name || 'Overall Business'}
                  </h1>
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <MapPin size={14} className="text-[#6d0e2b]" />
                    {currentBranch?.address || business?.address || 'No address available'}
                  </p>
                </div>
              </div>
              
              <div className="w-full lg:w-64">
                <TimePeriodFilter 
                  selectedPeriod={selectedPeriod}
                  onPeriodChange={handlePeriodChange}
                />
              </div>
            </div>
          </div>
        </div>
        
        <OverviewCards
          data={data}
          isLoading={isLoading}
          error={error}
        />
        
        <TodayStats
          data={todayData}
          isLoading={todayLoading}
          error={todayError}
        />
        
        <CustomerCards
          topSpender={topCustomersData?.weeklyTopCustomer}
          frequentCustomer={topCustomersData?.weeklyMostFrequentCustomer}
          allTimeCustomer={topCustomersData?.allTimeTopCustomer}
          isLoading={topCustomersLoading}
          error={topCustomersError}
        />
        
        <div className="bg-white/90 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl p-4 sm:p-6 hover:shadow-2xl transition-all duration-500">
          <VibeazyQuickOverviewTable />
        </div>
      </div>
    </div>
  );
};

export default VibEazyOverview;