'use client'
import React, { useState } from 'react';
import { 
  TrendingUp, TrendingDown, Users, DollarSign, Eye, 
  RefreshCw, ArrowUpRight, ArrowDownRight, Calendar,
  Receipt, Activity, Clock, Target, Star, Phone, ChevronDown
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Mock analytics data
const mockAnalyticsData = {
  overview: {
    totalRevenue: 15420000,
    revenueGrowth: 15.2,
    totalCustomers: 1234,
    customerGrowth: 8.3,
    avgTransactionValue: 2850,
    avgTransactionGrowth: 6.8,
    totalTransactions: 5680,
    transactionGrowth: 12.1
  },
  
  revenueData: [
    { month: 'Jan', revenue: 980000, customers: 145, transactions: 420 },
    { month: 'Feb', revenue: 1200000, customers: 168, transactions: 485 },
    { month: 'Mar', revenue: 1150000, customers: 182, transactions: 468 },
    { month: 'Apr', revenue: 1350000, customers: 195, transactions: 520 },
    { month: 'May', revenue: 1480000, customers: 210, transactions: 580 },
    { month: 'Jun', revenue: 1620000, customers: 225, transactions: 615 },
    { month: 'Jul', revenue: 1750000, customers: 240, transactions: 650 }
  ],

  customerGrowthData: [
    { month: 'Jan', newCustomers: 45, totalCustomers: 850 },
    { month: 'Feb', newCustomers: 52, totalCustomers: 902 },
    { month: 'Mar', newCustomers: 48, totalCustomers: 950 },
    { month: 'Apr', newCustomers: 58, totalCustomers: 1008 },
    { month: 'May', newCustomers: 65, totalCustomers: 1073 },
    { month: 'Jun', newCustomers: 71, totalCustomers: 1144 },
    { month: 'Jul', newCustomers: 90, totalCustomers: 1234 }
  ],

  topCustomers: [
    { phone: '+234 801 234 5678', totalSpent: 342000, visits: 27, avgPerVisit: 12667 },
    { phone: '+234 802 345 6789', totalSpent: 289000, visits: 22, avgPerVisit: 13136 },
    { phone: '+234 803 456 7890', totalSpent: 234000, visits: 31, avgPerVisit: 7548 },
    { phone: '+234 804 567 8901', totalSpent: 189000, visits: 18, avgPerVisit: 10500 },
   
  ],

  transactionTrends: [
    { time: '6 AM', transactions: 12, revenue: 45000 },
    { time: '9 AM', transactions: 35, revenue: 125000 },
    { time: '12 PM', transactions: 68, revenue: 240000 },
    { time: '3 PM', transactions: 45, revenue: 168000 },
    { time: '6 PM', transactions: 52, revenue: 195000 },
    { time: '9 PM', transactions: 28, revenue: 98000 }
  ],

  weeklyComparison: {
    2: [
      { day: 'Mon', thisWeek: 145000, lastWeek: 125000 },
      { day: 'Tue', thisWeek: 168000, lastWeek: 142000 },
      { day: 'Wed', thisWeek: 189000, lastWeek: 156000 },
      { day: 'Thu', thisWeek: 175000, lastWeek: 163000 },
      { day: 'Fri', thisWeek: 210000, lastWeek: 185000 },
      { day: 'Sat', thisWeek: 245000, lastWeek: 220000 },
      { day: 'Sun', thisWeek: 198000, lastWeek: 178000 }
    ],
    4: [
      { period: 'Week 1', current: 980000, previous: 850000 },
      { period: 'Week 2', current: 1120000, previous: 920000 },
      { period: 'Week 3', current: 1050000, previous: 980000 },
      { period: 'Week 4', current: 1180000, previous: 1050000 }
    ],
    8: [
      { period: 'Week 1', current: 850000, previous: 780000 },
      { period: 'Week 2', current: 920000, previous: 850000 },
      { period: 'Week 3', current: 980000, previous: 890000 },
      { period: 'Week 4', current: 1050000, previous: 920000 },
      { period: 'Week 5', current: 1120000, previous: 980000 },
      { period: 'Week 6', current: 1180000, previous: 1050000 },
      { period: 'Week 7', current: 1250000, previous: 1120000 },
      { period: 'Week 8', current: 1330000, previous: 1180000 }
    ],
    12: [
      { period: 'Week 1', current: 720000, previous: 680000 },
      { period: 'Week 2', current: 780000, previous: 720000 },
      { period: 'Week 3', current: 850000, previous: 780000 },
      { period: 'Week 4', current: 890000, previous: 820000 },
      { period: 'Week 5', current: 920000, previous: 850000 },
      { period: 'Week 6', current: 980000, previous: 890000 },
      { period: 'Week 7', current: 1050000, previous: 920000 },
      { period: 'Week 8', current: 1120000, previous: 980000 },
      { period: 'Week 9', current: 1180000, previous: 1050000 },
      { period: 'Week 10', current: 1250000, previous: 1120000 },
      { period: 'Week 11', current: 1320000, previous: 1180000 },
      { period: 'Week 12', current: 1390000, previous: 1250000 }
    ]
  }
};

// Header Component
const AnalyticsHeader = ({ onRefresh }) => {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Analytics & Reports</h1>
          <p className="text-gray-600">Deep insights into business performance and customer behavior</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar size={16} />
            <span>{currentDate}</span>
          </div>
          <button 
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>
      </div>
    </div>
  );
};

// KPI Cards Component
const KPICards = ({ data }) => {
  const kpis = [
    {
      title: 'Total Revenue',
      value: `₦${(data.totalRevenue / 1000000).toFixed(1)}M`,
      change: data.revenueGrowth,
      icon: DollarSign
    },
    {
      title: 'Total Customers',
      value: data.totalCustomers.toLocaleString(),
      change: data.customerGrowth,
      icon: Users
    },
    {
      title: 'Avg Transaction Value',
      value: `₦${data.avgTransactionValue.toLocaleString()}`,
      change: data.avgTransactionGrowth,
      icon: TrendingUp
    },
    {
      title: 'Total Transactions',
      value: data.totalTransactions.toLocaleString(),
      change: data.transactionGrowth,
      icon: Receipt
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {kpis.map((kpi, index) => (
        <div key={index} className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">{kpi.title}</p>
              <p className="text-2xl font-semibold text-gray-900">{kpi.value}</p>
            </div>
            <div className="p-3 bg-[#1A73E8]/10 rounded-lg">
              <kpi.icon size={20} className="text-[#1A73E8]" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1">
            {kpi.change > 0 ? (
              <ArrowUpRight size={14} className="text-green-600" />
            ) : (
              <ArrowDownRight size={14} className="text-red-600" />
            )}
            <span className={`text-sm font-medium ${kpi.change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.abs(kpi.change)}%
            </span>
            <span className="text-sm text-gray-500">vs last month</span>
          </div>
        </div>
      ))}
    </div>
  );
};

// Revenue Chart Component
const RevenueChart = ({ data, viewType, onViewTypeChange }) => {
  const currentData = data[viewType] || data.monthly || [];

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Revenue Trends</h3>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onViewTypeChange('weekly')}
            className={`px-3 py-1 text-sm rounded-md transition-colors cursor-pointer ${
              viewType === 'weekly' 
                ? 'bg-white text-[#1A73E8] shadow-sm font-medium' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => onViewTypeChange('monthly')}
            className={`px-3 py-1 text-sm rounded-md transition-colors cursor-pointer ${
              viewType === 'monthly' 
                ? 'bg-white text-[#1A73E8] shadow-sm font-medium' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={currentData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="period" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip 
              formatter={(value, name) => [
                name === 'revenue' ? `₦${(value / 1000).toFixed(0)}K` : value,
                name === 'revenue' ? 'Revenue' :
                name === 'customers' ? 'Customers' : 'Transactions'
              ]}
              labelStyle={{ color: '#374151' }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '6px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#1A73E8" 
              strokeWidth={3}
              dot={{ fill: '#1A73E8', strokeWidth: 2, r: 5 }}
              name="revenue"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Customer Growth Chart Component
const CustomerGrowthChart = ({ data, viewType, onViewTypeChange }) => {
  const currentData = data[viewType] || data.monthly || [];

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Customer Growth</h3>
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => onViewTypeChange('weekly')}
            className={`px-3 py-1 text-sm rounded-md transition-colors cursor-pointer ${
              viewType === 'weekly' 
                ? 'bg-white text-[#1A73E8] shadow-sm font-medium' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Weekly
          </button>
          <button
            onClick={() => onViewTypeChange('monthly')}
            className={`px-3 py-1 text-sm rounded-md transition-colors cursor-pointer ${
              viewType === 'monthly' 
                ? 'bg-white text-[#1A73E8] shadow-sm font-medium' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Monthly
          </button>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={currentData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="period" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <Tooltip 
              labelStyle={{ color: '#374151' }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '6px'
              }}
            />
            <Bar 
              dataKey="newCustomers" 
              fill="#1A73E8" 
              radius={[4, 4, 0, 0]}
              name="New Customers"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Weekly Comparison Chart
const WeeklyComparisonChart = ({ data, weeksCount, onWeeksCountChange }) => {
  const currentData = data[weeksCount];
  const isDaily = weeksCount === 2;

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          {isDaily ? 'This Week vs Last Week' : `Last ${weeksCount} Weeks Comparison`}
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">Compare:</span>
          <div className="relative">
            <select
              value={weeksCount}
              onChange={(e) => onWeeksCountChange(parseInt(e.target.value))}
              className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm focus:ring-2 focus:ring-[#1A73E8] focus:border-[#1A73E8] cursor-pointer"
            >
              <option value={2}>This vs Last Week</option>
              <option value={4}>Last 4 Weeks</option>
              <option value={8}>Last 8 Weeks</option>
              <option value={12}>Last 12 Weeks</option>
            </select>
            <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={currentData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey={isDaily ? "day" : "period"}
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
              tickFormatter={(value) => `₦${(value / 1000).toFixed(0)}K`}
            />
            <Tooltip 
              formatter={(value, name) => [
                `₦${(value / 1000).toFixed(0)}K`, 
                isDaily 
                  ? (name === 'thisWeek' ? 'This Week' : 'Last Week')
                  : (name === 'current' ? 'Current Period' : 'Previous Period')
              ]}
              labelStyle={{ color: '#374151' }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '6px'
              }}
            />
            {isDaily ? (
              <>
                <Bar dataKey="lastWeek" fill="#E5E7EB" radius={[2, 2, 0, 0]} name="lastWeek" />
                <Bar dataKey="thisWeek" fill="#1A73E8" radius={[2, 2, 0, 0]} name="thisWeek" />
              </>
            ) : (
              <>
                <Bar dataKey="previous" fill="#E5E7EB" radius={[2, 2, 0, 0]} name="previous" />
                <Bar dataKey="current" fill="#1A73E8" radius={[2, 2, 0, 0]} name="current" />
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Customer Segmentation Pie Chart
const CustomerSegmentation = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Customer Segments</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={120}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value) => [value, 'Customers']}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '6px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <span className="text-sm text-gray-600">{item.name}</span>
            </div>
            <span className="font-semibold text-gray-900">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Transaction Trends Chart
const TransactionTrends = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Daily Transaction Patterns</h3>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: '#6b7280' }}
            />
            <Tooltip 
              formatter={(value, name) => [
                value,
                name === 'transactions' ? 'Transactions' : `₦${(value / 1000).toFixed(0)}K Revenue`
              ]}
              labelStyle={{ color: '#374151' }}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '6px'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="transactions" 
              stroke="#1A73E8" 
              strokeWidth={2}
              dot={{ fill: '#1A73E8', strokeWidth: 2, r: 4 }}
              name="transactions"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

// Top Customers Component
const TopCustomers = ({ data }) => {
  const formatCurrency = (amount) => `₦${amount.toLocaleString()}`;

  return (
    <div className="bg-white p-6 rounded-lg border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">Top Customers by Spending</h3>
      
      <div className="space-y-4">
        {data.map((customer, index) => (
          <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
            <div className="flex items-center gap-4">
              <div className="w-8 h-8 bg-[#1A73E8]/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-[#1A73E8]">{index + 1}</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <Phone size={14} className="text-gray-400" />
                  <span className="font-medium text-gray-900">{customer.phone}</span>
                </div>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-gray-500">{customer.visits} visits</span>
                  <span className="text-xs text-gray-500">₦{customer.avgPerVisit.toLocaleString()}/visit</span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-[#1A73E8]">{formatCurrency(customer.totalSpent)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Main Analytics Component
const VibeasyAnalytics = () => {
  const [data] = useState(mockAnalyticsData);
  const [revenueViewType, setRevenueViewType] = useState('monthly');
  const [customerGrowthViewType, setCustomerGrowthViewType] = useState('monthly');
  const [weeksCount, setWeeksCount] = useState(2);

  const handleRefresh = () => {
    console.log('Refreshing analytics data...');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <AnalyticsHeader onRefresh={handleRefresh} />
        
        <KPICards data={data.overview} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RevenueChart 
            data={data.revenueData} 
            viewType={revenueViewType}
            onViewTypeChange={setRevenueViewType}
          />
          <CustomerGrowthChart 
            data={data.customerGrowthData}
            viewType={customerGrowthViewType}
            onViewTypeChange={setCustomerGrowthViewType}
          />
        </div>
        
        <div className="mb-8">
          <WeeklyComparisonChart 
            data={data.weeklyComparison}
            weeksCount={weeksCount}
            onWeeksCountChange={setWeeksCount}
          />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TransactionTrends data={data.transactionTrends} />
          <TopCustomers data={data.topCustomers} />
        </div>
      </div>
    </div>
  );
};

export default VibeasyAnalytics;