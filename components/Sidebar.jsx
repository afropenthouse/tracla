"use client"
import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Users, 
  Gift, 
  Megaphone, 
  Receipt,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  Bell,
  HelpCircle,
  X,
  ChevronDown,
  Sparkles,
  Store,
  QrCode,
  TrendingUp,
  UserCheck,
  ShoppingBag,
  Building2
} from 'lucide-react';
import { useSidebarStats } from '@/lib/queries/branch';
import { useBranchStore, useBusinessStore } from '@/store/store';
import { logout } from '@/lib/api';

// Generate a consistent gradient from a business name
const generateGradientFromName = (name) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const gradients = [
    'from-red-500 to-rose-500',
    'from-pink-500 to-red-500', 
    'from-orange-500 to-red-500',
    'from-rose-500 to-pink-500',
    'from-red-600 to-rose-600',
    'from-amber-500 to-red-500',
    'from-red-400 to-rose-400',
    'from-pink-600 to-red-600',
    'from-rose-600 to-red-700',
    'from-red-500 to-pink-600'
  ];
  
  return gradients[Math.abs(hash) % gradients.length];
};

// Get the first two letters of a business name
const getInitials = (name) => {
  if (!name) return '??';
  
  const nameParts = name.split(' ');
  if (nameParts.length >= 2) {
    return (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase();
  }
  
  return name.substring(0, 2).toUpperCase();
};

const VibEazyBusinessSidebar = ({ 
  notificationCount = 5, 
  messageCount = 12
}) => {
  const { currentBranch, branches, setCurrentBranch } = useBranchStore();
  const { business } = useBusinessStore();
  const router = useRouter();
  
  // Fetch sidebar stats with aggressive caching
  const { data: sidebarStats } = useSidebarStats();
  const pathname = usePathname();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showBranchesDropdown, setShowBranchesDropdown] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // Format currency for display
  const formatCurrency = (amount) => {
    if (amount >= 1000000) return `₦${(amount / 1000000).toFixed(1)}M`;
    if (amount >= 1000) return `₦${(amount / 1000).toFixed(1)}K`;
    return `₦${amount?.toLocaleString() || 0}`;
  };

  // Use real business data only - context-aware naming
  const displayName = currentBranch?.name || business?.name || "Loading...";
  const businessName = business?.name || "Loading...";
  const totalBranches = branches?.length || 0;
  const displayMonthlyRevenue = sidebarStats?.totalRevenueThisMonth ? formatCurrency(sidebarStats.totalRevenueThisMonth) : "₦0";

  // Navigation sections
  const analyticsItems = [
    { 
      label: 'Dashboard', 
      icon: LayoutDashboard, 
      path: '/dashboard'
    },
    { 
      label: 'Customers', 
      icon: Users, 
      path: '/customers'
    },
    { 
      label: 'Purchases', 
      icon: ShoppingBag, 
      path: '/purchases'
    },
  ];

  const businessItems = [
    { 
      label: 'Business Overview', 
      icon: Building2, 
      path: '/context'
    },
  ];
  
  const isActive = (path) => pathname === path;
  
  const toggleMobileMenu = () => {
    setShowMobileMenu(!showMobileMenu);
    setShowUserDropdown(false);
  };

  const toggleUserDropdown = () => {
    setShowUserDropdown(!showUserDropdown);
    setShowMobileMenu(false);
  };

  const handleBranchSwitch = (branch) => {
    setCurrentBranch(branch);
    // setShowBranchesDropdown(false);
  };

  const toggleBranchesDropdown = () => {
    setShowBranchesDropdown(!showBranchesDropdown);
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const result = await logout();
      if (result.success) {
        router.push('/login');
      } else {
        console.error('Logout failed:', result.error);
        // Still redirect even if API call fails since cookies are cleared
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  return (
    <div className="flex h-screen">
      {/* Sidebar for Desktop */}
      <div className="hidden md:flex flex-col backdrop-blur-xl border-r border-white/20 shadow-2xl w-72 relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute inset-0 "></div>
        
        {/* Logo Section */}
        <div className="relative z-10 flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-[#6d0e2b] flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-lg">T</span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Sparkles className="w-2 h-2 text-white" />
              </div>
            </div>
            <div className="ml-3">
              <h2 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                Tra<span className="text-black">cla</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Business Dashboard</p>
            </div>
          </div>
        </div>
        
        {/* Business Info Section - Compact */}
        <div className="relative z-10 px-4 py-3  border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-[#6d0e2b] flex items-center justify-center shadow-md flex-shrink-0">
              <Store className="h-4 w-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 text-sm truncate">{businessName}</h3>
              <p className="text-xs text-gray-600">{totalBranches} Branch{totalBranches !== 1 ? 'es' : ''}</p>
            </div>
          </div>
        </div>
        
        {/* QR Code Quick Access */}
        <div className="relative z-10 px-4 py-3">
          <Link href="/qr-code">
            <div className="w-full bg-[#6d0e2b] text-white rounded-xl p-3 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group">
              <div className="flex items-center justify-center space-x-2">
                <QrCode className="h-5 w-5" />
                <span className="font-semibold text-sm">Download QR Code</span>
              </div>
              <p className="text-xs text-red-100 text-center mt-1 opacity-90">For Customer Scanning</p>
            </div>
          </Link>
        </div>
        
        {/* Navigation Items */}
        <div className="relative z-10 flex-1 py-4 overflow-y-auto">
          <nav className="px-4 space-y-4">
            {/* Analytics Section */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-4">Analytics</h4>
              <div className="space-y-1">
                {analyticsItems.map((item) => (
                  <Link key={item.path} href={item.path}>
                    <div className={`w-full flex items-center justify-start px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden cursor-pointer ${
                      isActive(item.path) 
                        ? 'text-white shadow-lg' 
                        : 'text-gray-700 hover:bg-white/50 hover:shadow-md'
                    }`}>
                      {/* Active background gradient */}
                      {isActive(item.path) && (
                        <div className={`absolute inset-0 bg-[#6d0e2b] rounded-xl`} />
                      )}
                      
                      <div className="relative z-10 flex items-center w-full">
                        <item.icon size={18} className={isActive(item.path) ? 'text-white' : 'text-gray-600'} />
                        <span className={`ml-3 ${isActive(item.path) ? 'text-white' : 'text-gray-700'}`}>
                          {item.label}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Business Section */}
            <div>
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-4">Business</h4>
              <div className="space-y-1">
                {businessItems.map((item) => (
                  <Link key={item.path} href={item.path}>
                    <div className={`w-full flex items-center justify-start px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden cursor-pointer ${
                      isActive(item.path) 
                        ? 'text-white shadow-lg' 
                        : 'text-gray-700 hover:bg-white/50 hover:shadow-md'
                    }`}>
                      {/* Active background gradient */}
                      {isActive(item.path) && (
                        <div className={`absolute inset-0 bg-[#6d0e2b] rounded-xl`} />
                      )}
                      
                      <div className="relative z-10 flex items-center w-full">
                        <item.icon size={18} className={isActive(item.path) ? 'text-white' : 'text-gray-600'} />
                        <span className={`ml-3 ${isActive(item.path) ? 'text-white' : 'text-gray-700'}`}>
                          {item.label}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Branches Dropdown */}
            <div>
              <button
                onClick={toggleBranchesDropdown}
                className="w-full flex items-center justify-between px-4 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider hover:text-gray-700 transition-colors"
              >
                <span>Branches</span>
                <ChevronDown size={14} className={`transition-transform duration-200 ${showBranchesDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showBranchesDropdown && (
                <div className="space-y-1 mt-2">
                  {branches?.map((branch) => (
                    <button
                      key={branch.id}
                      onClick={() => handleBranchSwitch(branch)}
                      className={`w-full flex items-center justify-start px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden cursor-pointer ${
                        currentBranch?.id === branch.id
                          ? 'text-white shadow-lg' 
                          : 'text-gray-700 hover:bg-white/50 hover:shadow-md'
                      }`}
                    >
                      {/* Active background gradient */}
                      {currentBranch?.id === branch.id && (
                        <div className={`absolute inset-0 bg-[#6d0e2b] rounded-xl`} />
                      )}
                      
                      <div className="relative z-10 flex items-center w-full">
                        <Store size={16} className={currentBranch?.id === branch.id ? 'text-white' : 'text-gray-600'} />
                        <span className={`ml-3 ${currentBranch?.id === branch.id ? 'text-white' : 'text-gray-700'}`}>
                          {branch.name}
                        </span>
                      </div>
                    </button>
                  )) || (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      No branches available
                    </div>
                  )}
                </div>
              )}
            </div>
          </nav>
        </div>
        
        {/* Quick Stats Section */}
        <div className="relative z-10 px-4 py-3 border-t border-white/10">
          <div className=" rounded-xl p-3 border border-red-100/50">
            <h4 className="text-xs font-semibold text-gray-600 mb-2">This Month</h4>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-lg font-bold text-[#6d0e2b]">{displayMonthlyRevenue}</p>
                <p className="text-xs text-gray-500">Total Revenue</p>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-gray-800">{sidebarStats?.totalCustomersThisMonth || 0}</p>
                <p className="text-xs text-gray-500">New Customers</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* User Section */}
        <div className="relative z-10 px-4 py-3 border-t border-white/10">
          <button
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="w-full flex items-center justify-start px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 group relative overflow-hidden cursor-pointer text-red-600 hover:bg-red-50/50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogOut size={18} className={`text-red-600 ${isLoggingOut ? 'animate-pulse' : ''}`} />
            <span className="ml-3">{isLoggingOut ? 'Signing Out...' : 'Sign Out'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden fixed top-0 inset-x-0 z-50">
        <nav className="bg-white/90 backdrop-blur-xl shadow-lg border-b border-white/20">
          <div className="px-4 py-3 flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-lg bg-[#6d0e2b] flex items-center justify-center mr-3 shadow-md">
                <span className="text-white font-bold text-sm">T</span>
              </div>
              <div>
                <h2 className="text-lg font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Tra<span className="text-red-600">cla</span>
                </h2>
                <p className="text-xs text-gray-500">Business Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="hidden sm:flex items-center bg-white/50 rounded-lg px-3 py-1.5 backdrop-blur-sm">
                <div className="w-5 h-5 rounded-lg bg-[#6d0e2b] flex items-center justify-center mr-2">
                  <Store className="h-3 w-3 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-700">{totalBranches} Branch{totalBranches !== 1 ? 'es' : ''}</span>
              </div>
              
              {/* <Link href="/notifications">
                <div className="p-2 relative bg-white/50 rounded-lg backdrop-blur-sm cursor-pointer">
                  <Bell size={20} className="text-gray-600" />
                  {notificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-[#6d0e2b] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center shadow-lg">
                      {notificationCount}
                    </span>
                  )}
                </div>
              </Link> */}
              
              <button
                className="p-2 bg-white/50 rounded-lg backdrop-blur-sm cursor-pointer"
                onClick={toggleMobileMenu}
              >
                {showMobileMenu ? (
                  <X size={22} className="text-gray-600" />
                ) : (
                  <Menu size={22} className="text-gray-600" />
                )}
              </button>
            </div>
          </div>
        </nav>
      </div>

      {/* Mobile Menu Dropdown */}
      <AnimatePresence>
        {showMobileMenu && (
          <motion.div 
            className="md:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowMobileMenu(false)}
          >
            <motion.div 
              className="absolute top-16 inset-x-0 bg-white/95 backdrop-blur-xl shadow-2xl border-b border-white/20 max-h-96 overflow-y-auto"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 pt-4 pb-6 space-y-2">
                {/* Business Info */}
                <div className="bg-[#6d0e2b] rounded-xl p-4 mb-4 border border-red-200/50">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-xl bg-[#6d0e2b] flex items-center justify-center mr-3 shadow-lg">
                      <Store className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{businessName}</h3>
                      <p className="text-xs text-white">{totalBranches} Branch{totalBranches !== 1 ? 'es' : ''}</p>
                    </div>
                  </div>
                </div>

                {/* QR Code Button */}
                <Link href="/qr-code">
                  <div className="w-full bg-[#6d0e2b] text-white rounded-xl p-3 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer mb-4">
                    <div className="flex items-center justify-center space-x-2">
                      <QrCode className="h-5 w-5" />
                      <span className="font-semibold text-sm">Download QR Code</span>
                    </div>
                  </div>
                </Link>

                {/* Analytics Section */}
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-4">Analytics</h4>
                  {analyticsItems.map((item) => (
                    <Link key={item.path} href={item.path}>
                      <div 
                        className={`block w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all cursor-pointer ${
                          isActive(item.path) 
                            ? 'text-white bg-[#6d0e2b] shadow-lg' 
                            : 'text-gray-700 hover:bg-white/50'
                        }`}
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <div className="flex items-center">
                          <item.icon size={20} className="mr-4" />
                          <span className="flex-1">{item.label}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Business Section */}
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-4">Business</h4>
                  {businessItems.map((item) => (
                    <Link key={item.path} href={item.path}>
                      <div 
                        className={`block w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all cursor-pointer ${
                          isActive(item.path) 
                            ? 'text-white bg-[#6d0e2b] shadow-lg' 
                            : 'text-gray-700 hover:bg-white/50'
                        }`}
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <div className="flex items-center">
                          <item.icon size={20} className="mr-4" />
                          <span className="flex-1">{item.label}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Branches Section */}
                <div className="mb-4">
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-4">Branches</h4>
                  {branches?.map((branch) => (
                    <button
                      key={branch.id}
                      onClick={() => {
                        handleBranchSwitch(branch);
                        setShowMobileMenu(false);
                      }}
                      className={`block w-full text-left px-4 py-3 rounded-xl text-base font-medium transition-all cursor-pointer ${
                        currentBranch?.id === branch.id
                          ? 'text-white bg-[#6d0e2b] shadow-lg' 
                          : 'text-gray-700 hover:bg-white/50'
                      }`}
                    >
                      <div className="flex items-center">
                        <Store size={20} className="mr-4" />
                        <span className="flex-1">{branch.name}</span>
                      </div>
                    </button>
                  )) || (
                    <div className="px-4 py-2 text-sm text-gray-500">
                      No branches available
                    </div>
                  )}
                </div>

                {/* Logout Button */}
                <div className="mb-4">
                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="w-full flex items-center justify-start px-4 py-3 rounded-xl text-base font-medium transition-all cursor-pointer text-red-600 hover:bg-red-50/50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <LogOut size={20} className={`mr-4 ${isLoggingOut ? 'animate-pulse' : ''}`} />
                    {isLoggingOut ? 'Signing Out...' : 'Sign Out'}
                  </button>
                </div>
                
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default VibEazyBusinessSidebar;