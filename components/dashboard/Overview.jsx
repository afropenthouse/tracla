"use client";
import React, { useState } from "react";
import VibeazyQuickOverviewTable from '@/components/dashboard/QuickOverviewTable';
import { useOverviewData, useTopCustomersData } from '@/lib/queries/branch';
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
} from "lucide-react";
import { IoMdInformationCircleOutline } from "react-icons/io";


// Enhanced Overview Cards Component
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
      gradient: "from-red-500 to-rose-600",
    },
    {
      title: "Total Customers",
      value: data ? data.totalCustomers.toLocaleString() : "0",
      subtitle: "Unique customers",
      change: data ? data?.customerGrowth : 12,
      icon: Users,
      gradient: "from-red-500 to-rose-600",
    },
    {
      title: "Average Spend per Customer",
      value: data
        ? (data.avgSpendPerCustomer >= 1000 ? `₦${(data.avgSpendPerCustomer / 1000).toFixed(1)}K` : `₦${data.avgSpendPerCustomer?.toFixed(0)}`)
        : "₦0",
      subtitle: "Per customer lifetime",
      change: data ? data?.avgSpendGrowth : 0,
      icon: TrendingUp,
      gradient: "from-red-500 to-rose-600",
    },
    {
      title: "Total Visits",
      value: data ? data.totalVisits.toLocaleString() : "0",
      subtitle: "All transactions",
      change: data ? data?.visitsGrowth : 0,
      icon: Receipt,
      gradient: "from-red-500 to-rose-600",
    },
    {
      title: "Active Customers",
      value: data ? data.activeCustomers.toLocaleString() : "0",
      subtitle: "Last 30 days",
      change: data ? data?.activeGrowth : 0,
      icon: Activity,
      gradient: "from-red-500 to-rose-600",
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
      gradient: "from-red-500 to-rose-600",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {cards.map((card, index) => (
          <div
            key={index}
            className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-4"
          >
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded-xl mb-2"></div>
              <div className="h-6 bg-gray-200 rounded-xl mb-2"></div>
              <div className="h-3 bg-gray-200 rounded-xl w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div className="col-span-full bg-red-50/80 backdrop-blur-xl border border-red-200/50 rounded-2xl p-4 text-center">
          <p className="text-red-600 font-medium">{error?.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
      {cards.map((card, index) => (
        <div
          key={index}
          className="group bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-4 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
        >
          {/* Background pattern */}
          <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
            <div className={`w-full h-full rounded-full bg-[#6d0e2b]`}></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between mb-3">
              <div className={`p-2.5 rounded-xl bg-[#6d0e2b] shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <card.icon size={20} className="text-white" />
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1 font-medium">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900 mb-1">
                {card.value}
              </p>
              <p className="text-xs text-gray-500 mb-3">{card.subtitle}</p>
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 px-2 py-0.5 rounded-lg ${
                  card.change > 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                }`}>
                  {card.change > 0 ? (
                    <ArrowUpRight size={12} />
                  ) : (
                    <ArrowDownRight size={12} />
                  )}
                  <span className="text-xs font-semibold">
                    {Math.abs(card.change)}%
                  </span>
                </div>
                <span className="text-xs text-gray-500 font-medium">vs last month</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Today Stats Component - Redesigned with sidebar inspiration
const TodayStats = ({ data, isLoading, error }) => {
  const formatCurrency = (amount) => `₦${amount.toLocaleString()}`;

  if (isLoading) {
    return (
      <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Today's Performance</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-6 mb-8">
        <div className="bg-red-50/80 border border-red-200/50 rounded-xl p-6 text-center">
          <p className="text-red-600 font-medium">{error?.message}</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Today's Revenue",
      value: data ? formatCurrency(data.todayStats.revenue) : "₦0",
      color: "text-[#6d0e2b]",
      bgColor: "from-[#6d0e2b]/5 to-[#6d0e2b]/10",
      borderColor: "border-[#6d0e2b]/20"
    },
    {
      title: "New Customers",
      value: data ? data.todayStats.customers.toString() : "0",
      color: "text-[#6d0e2b]",
      bgColor: "from-[#6d0e2b]/5 to-[#6d0e2b]/10",
      borderColor: "border-[#6d0e2b]/20"
    },
    {
      title: "Transactions",
      value: data ? data.todayStats.transactions.toString() : "0",
      color: "text-[#6d0e2b]",
      bgColor: "from-[#6d0e2b]/5 to-[#6d0e2b]/10",
      borderColor: "border-[#6d0e2b]/20"
    },
    {
      title: "Visits",
      value: data ? data.todayStats.visits.toString() : "0",
      color: "text-[#6d0e2b]",
      bgColor: "from-[#6d0e2b]/5 to-[#6d0e2b]/10",
      borderColor: "border-[#6d0e2b]/20"
    },
    {
      title: "Average Transaction",
      value: data ? formatCurrency(data.todayStats.avgTransaction) : "₦0",
      color: "text-[#6d0e2b]",
      bgColor: "from-[#6d0e2b]/5 to-[#6d0e2b]/10",
      borderColor: "border-[#6d0e2b]/20"
    },
  ];

  return (
    <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-6 mb-8 relative overflow-hidden">
      {/* Background gradient like sidebar */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-red-50 to-rose-50 opacity-30"></div>
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#6d0e2b] rounded-xl shadow-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900">Today's Performance</h3>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500 bg-white/50 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-white/20">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="font-medium">Live</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className={`bg-[#6d0e2b] p-4 rounded-xl border ${stat.borderColor} hover:shadow-md transition-all duration-300`}>
              <div className="text-sm text-white mb-2 font-medium">{stat.title}</div>
              <div className={`text-2xl font-bold text-white`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Enhanced Customer Cards Component - All using same brand color scheme
const CustomerCards = ({ topSpender, frequentCustomer, allTimeCustomer, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-6 relative overflow-hidden">
            <div className="animate-pulse">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="space-y-3">
                <div className="h-16 bg-gray-200 rounded-xl"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
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
        <div className="col-span-full bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-6 text-center">
          <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">Failed to load top customers</p>
          <p className="text-sm text-gray-500">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!topSpender && !frequentCustomer && !allTimeCustomer) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="col-span-full bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-6 text-center">
          <Users size={48} className="text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No customer data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Top Spender This Week */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-6 relative overflow-hidden hover:shadow-xl transition-all duration-300">
        {topSpender ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-[#6d0e2b]/5 to-[#6d0e2b]/10"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gradient-to-br from-[#6d0e2b] to-[#6c0f2a] rounded-xl shadow-lg">
                  <Crown size={20} className="text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Top Spender This Week</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20">
                  <Phone size={16} className="text-gray-500" />
                  <div>
                    <span className="font-medium text-gray-900 block">{topSpender.phone}</span>
                    <span className="text-sm text-gray-600">Phone Number</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Spent:</span>
                  <span className="text-2xl font-bold text-[#6d0e2b]">
                    ₦{topSpender.spend >= 1000 ? (topSpender.spend / 1000).toFixed(0) + 'K' : topSpender.spend?.toFixed(0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Visits this week:</span>
                  <span className="font-semibold text-gray-900">{topSpender.visits || 0}</span>
                </div>
                {/* <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Points earned:</span>
                  <span className="font-semibold text-[#6c0f2a]">{topSpender.points}</span>
                </div> */}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Crown size={32} className="text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No customer data available</p>
          </div>
        )}
      </div>

      {/* Most Frequent This Week */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-6 relative overflow-hidden hover:shadow-xl transition-all duration-300">
        {frequentCustomer ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-[#6c0f2a]/5 to-[#6c0f2a]/10"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gradient-to-br from-[#6c0f2a] to-[#6d0e2b] rounded-xl shadow-lg">
                  <Activity size={20} className="text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">Most Frequent This Week</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20">
                  <Phone size={16} className="text-gray-500" />
                  <div>
                    <span className="font-medium text-gray-900 block">{frequentCustomer.phone}</span>
                    <span className="text-sm text-gray-600">Phone Number</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Visits this week:</span>
                  <span className="text-2xl font-bold text-[#6c0f2a]">{frequentCustomer.visits || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Spent:</span>
                  <span className="font-semibold text-gray-900">
                    ₦{frequentCustomer.totalSpend >= 1000 ? (frequentCustomer.totalSpend / 1000).toFixed(0) + 'K' : frequentCustomer.totalSpend?.toFixed(0)}
                  </span>
                </div>
                {/* <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Points earned:</span>
                  <span className="font-semibold text-[#6d0e2b]">{frequentCustomer.points}</span>
                </div> */}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Activity size={32} className="text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No customer data available</p>
          </div>
        )}
      </div>

      {/* All-Time Top Customer */}
      <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg rounded-2xl p-6 relative overflow-hidden hover:shadow-xl transition-all duration-300">
        {allTimeCustomer ? (
          <>
            <div className="absolute inset-0 bg-gradient-to-br from-[#6d0e2b]/5 via-[#6c0f2a]/5 to-[#6d0e2b]/10"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-gradient-to-br from-[#6d0e2b] to-[#6c0f2a] rounded-xl shadow-lg">
                  <Star size={20} className="text-white" />
                </div>
                <h3 className="font-semibold text-gray-900">All-Time Top Customer</h3>
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-white/50 backdrop-blur-sm rounded-xl border border-white/20">
                  <Phone size={16} className="text-gray-500" />
                  <div>
                    <span className="font-medium text-gray-900 block">{allTimeCustomer.phone}</span>
                    <span className="text-sm text-gray-600">Joined {allTimeCustomer.joinedDate}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Spent:</span>
                  <span className="text-2xl font-bold text-[#6c0f2a]">
                    ₦{allTimeCustomer.totalSpend >= 1000 ? (allTimeCustomer.totalSpend / 1000).toFixed(0) + 'K' : allTimeCustomer.totalSpend?.toFixed(0)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total visits:</span>
                  <span className="font-semibold text-gray-900">{allTimeCustomer.visits || 0}</span>
                </div>
                {/* <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Points earned:</span>
                  <span className="font-semibold text-[#6d0e2b]">{allTimeCustomer.points}</span>
                </div> */}
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <Star size={32} className="text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">No all-time customer data</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Main VibEazy Overview Component
const VibEazyOverview = () => {
  const { currentBranch } = useBranchStore();
  const { business } = useBusinessStore();
  
  // Use context-aware hooks
  const { data, isLoading, error } = useOverviewData();
  const { data: topCustomersData, isLoading: topCustomersLoading, error: topCustomersError } = useTopCustomersData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-rose-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Context indicator */}
        <div className="mb-6 bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg rounded-xl p-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#6d0e2b] flex items-center justify-center">
              {currentBranch ? <Store size={16} className="text-white" /> : <BarChart3 size={16} className="text-white" />}
            </div>
            <div>
              <p className="text-sm text-gray-600">Viewing</p>
              <p className="font-semibold text-gray-900">
                {currentBranch ? currentBranch.name : business?.name || 'Overall Business'}
              </p>
            </div>
          </div>
        </div>

        <OverviewCards
          data={data}
          isLoading={isLoading}
          error={error}
        />

        <TodayStats
          data={data}
          isLoading={isLoading}
          error={error}
        />

        <CustomerCards
          topSpender={topCustomersData?.weeklyTopCustomer}
          frequentCustomer={topCustomersData?.weeklyMostFrequentCustomer}
          allTimeCustomer={topCustomersData?.allTimeTopCustomer}
          isLoading={topCustomersLoading}
          error={topCustomersError}
        />
        <VibeazyQuickOverviewTable />
      </div>
    </div>
  );
};

export default VibEazyOverview;