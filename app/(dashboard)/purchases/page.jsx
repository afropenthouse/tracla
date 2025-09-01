"use client"
import React, { useState, useRef, useEffect } from 'react';
import { 
  Receipt, Search, MoreVertical, Eye, Users, ChevronDown, Check, FileText, 
  FileSpreadsheet, Filter, RefreshCw, Calendar, ShoppingBag, Loader2, AlertCircle, Store, BarChart3
} from 'lucide-react';
import { IoMdInformationCircleOutline } from 'react-icons/io';
import { RxCaretDown, RxCaretSort, RxCaretUp } from 'react-icons/rx';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { usePurchasesData } from '@/lib/queries/branch';
import { useBranchStore, useBusinessStore } from '@/store/store';

// Mock purchases data
const mockPurchases = [
  {
    id: 'pur_001',
    customerId: 'cust_001',
    customerPhone: '+234 801 234 5678',
    amount: 28000,
    purchaseDate: '2024-12-11T12:00:00Z',
    createdAt: '2024-12-11T12:00:00Z',
    branchId: 'branch_001',
    branchName: 'Main Store'
  },
  {
    id: 'pur_002',
    customerId: 'cust_002',
    customerPhone: '+234 802 345 6789',
    amount: 22000,
    purchaseDate: '2024-12-11T09:15:00Z',
    createdAt: '2024-12-11T09:15:00Z',
    branchId: 'branch_001',
    branchName: 'Main Store'
  },
  {
    id: 'pur_003',
    customerId: 'cust_001',
    customerPhone: '+234 801 234 5678',
    amount: 15000,
    purchaseDate: '2024-12-10T14:30:00Z',
    createdAt: '2024-12-10T14:30:00Z',
    branchId: 'branch_002',
    branchName: 'Mall Branch'
  },
  {
    id: 'pur_004',
    customerId: 'cust_004',
    customerPhone: '+234 804 567 8901',
    amount: 19500,
    purchaseDate: '2024-12-10T10:15:00Z',
    createdAt: '2024-12-10T10:15:00Z',
    branchId: 'branch_001',
    branchName: 'Main Store'
  },
  {
    id: 'pur_005',
    customerId: 'cust_003',
    customerPhone: '+234 803 456 7890',
    amount: 12000,
    purchaseDate: '2024-12-09T15:30:00Z',
    createdAt: '2024-12-09T15:30:00Z',
    branchId: 'branch_003',
    branchName: 'Downtown'
  },
  {
    id: 'pur_006',
    customerId: 'cust_002',
    customerPhone: '+234 802 345 6789',
    amount: 18500,
    purchaseDate: '2024-12-09T13:20:00Z',
    createdAt: '2024-12-09T13:20:00Z',
    branchId: 'branch_002',
    branchName: 'Mall Branch'
  },
  {
    id: 'pur_007',
    customerId: 'cust_005',
    customerPhone: '+234 805 678 9012',
    amount: 14000,
    purchaseDate: '2024-12-08T16:45:00Z',
    createdAt: '2024-12-08T16:45:00Z',
    branchId: 'branch_001',
    branchName: 'Main Store'
  },
  {
    id: 'pur_008',
    customerId: 'cust_001',
    customerPhone: '+234 801 234 5678',
    amount: 8500,
    purchaseDate: '2024-12-08T16:20:00Z',
    createdAt: '2024-12-08T16:20:00Z',
    branchId: 'branch_001',
    branchName: 'Main Store'
  }
];

// Info Popover Component
const InfoPopover = ({ text }) => (
  <div className="invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-opacity duration-200 absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-3 bg-gray-900 text-white text-sm rounded-lg w-48 z-50">
    {text}
    <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
  </div>
);

// Header Cell Component
const HeaderCell = ({ text, info, hasSort = false, onSort, sortBy, order }) => {
  const normalizedText = text.toLowerCase().replace(/\s+/g, '');

  return (
    <div
      className={`flex items-center gap-1 justify-center ${hasSort ? "cursor-pointer hover:bg-gray-100 rounded px-2 py-1" : ""}`}
      onClick={hasSort ? () => onSort(normalizedText) : undefined}
    >
      <div className="group relative">
        <IoMdInformationCircleOutline className="flex-shrink-0 text-gray-500 hover:text-gray-700 cursor-help" />
        <InfoPopover text={info} />
      </div>
      <span>{text}</span>
      {hasSort && (
        <div className="flex-shrink-0">
          {sortBy === normalizedText ? (
            order === "ASC" ? (
              <RxCaretUp className="text-gray-700" />
            ) : (
              <RxCaretDown className="text-gray-700" />
            )
          ) : (
            <RxCaretSort className="text-gray-400" />
          )}
        </div>
      )}
    </div>
  );
};

// Action Dropdown Component
const ActionDropdown = ({ item, onAction }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const actions = [
    { id: 'viewCustomer', label: 'View Customer', icon: Eye, color: 'text-red-600' },
    { id: 'viewReceipt', label: 'View Receipt', icon: Receipt, color: 'text-gray-700' }
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
      >
        <MoreVertical size={16} />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {actions.map((action) => (
            <button
              key={action.id}
              onClick={() => { 
                onAction(action.id, item); 
                setIsOpen(false); 
              }}
              className={`w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 cursor-pointer text-sm ${action.color}`}
            >
              <action.icon size={14} />
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Main Purchases Page Component
const PurchasesPage = () => {
  // Store hooks
  const { currentBranch } = useBranchStore();
  const { business } = useBusinessStore();
  
  // UI state
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [searchBy, setSearchBy] = useState('');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [order, setOrder] = useState('DESC');
  const [page, setPage] = useState(1);
  const [isSearchFieldOpen, setIsSearchFieldOpen] = useState(false);
  
  const [filterValues, setFilterValues] = useState({
    minAmount: "",
    maxAmount: "",
    dateFrom: "",
    dateTo: "",
  });

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState(search);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page when search changes
    }, 500);
    
    return () => clearTimeout(timer);
  }, [search]);

  // Build filters object for API call
  const filters = {
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    minAmount: filterValues.minAmount || undefined,
    maxAmount: filterValues.maxAmount || undefined,
    dateFrom: filterValues.dateFrom || undefined,
    dateTo: filterValues.dateTo || undefined,
  };

  // Fetch purchases data using context-aware hook
  const { data: purchasesResponse, isLoading, error, refetch } = usePurchasesData(filters);
  
  // Extract purchases and pagination from response
  const purchases = purchasesResponse?.purchases || [];
  const pagination = purchasesResponse?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
  
  const isBusinessView = !currentBranch;

  const searchFields = [
    "Customer Phone",
    "Amount",
    "Purchase Date",
    "Branch"
  ];

  const columnInfo = {
    customerPhone: "Phone number of the customer who made this purchase",
    amount: "Amount spent in this specific transaction", 
    time: "Time when this purchase was made",
    purchaseDate: "Date when this purchase was made",
    branch: "Store branch where this purchase occurred"
  };

  const formatCurrency = (amount) => {
    return `₦${amount.toLocaleString()}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleSort = (column) => {
    if (sortBy === column) {
      setOrder(order === "ASC" ? "DESC" : "ASC");
    } else {
      setSortBy(column);
      setOrder("DESC");
    }
    setPage(1);
  };

  const handleAction = (action, item) => {
    console.log(`Action: ${action}`, item);
    alert(`Action: ${action} for purchase by ${item.customerPhone}`);
  };

  const handleSearchFieldSelect = (field) => {
    setSearchBy(field);
    setIsSearchFieldOpen(false);
  };

  const handleFilterChange = (name, value) => {
    setFilterValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const clearFilters = () => {
    setFilterValues({
      minAmount: "",
      maxAmount: "",
      dateFrom: "",
      dateTo: "",
    });
    setSearch('');
    setSearchBy('');
    setSortBy('');
    setOrder('DESC');
    setPage(1);
  };

  const handleRefresh = () => {
    refetch();
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  const applyFilters = () => {
    setPage(1); // Reset to first page when applying filters
    setIsFilterOpen(false);
  };

  const getBranchColor = (branchName) => {
    const colors = {
      'Main Store': 'from-red-500 to-rose-600',
      'Mall Branch': 'from-rose-500 to-red-600',
      'Downtown': 'from-red-400 to-rose-500'
    };
    return colors[branchName] || 'from-gray-500 to-gray-600';
  };

  // Calculate totals for pagination (mock)
  const totalItems = purchases.length;
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-rose-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6c0f2a] to-[#d32f2f] flex items-center justify-center shadow-lg">
                <ShoppingBag size={28} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">Purchases</h1>
                  <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg">
                    {isBusinessView ? (
                      <>
                        <BarChart3 size={14} className="text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">Business View</span>
                      </>
                    ) : (
                      <>
                        <Store size={14} className="text-gray-600" />
                        <span className="text-sm font-medium text-gray-700">{currentBranch?.name}</span>
                      </>
                    )}
                  </div>
                </div>
                <p className="text-gray-600">
                  {isBusinessView 
                    ? "All purchases across your business" 
                    : `Purchases for ${currentBranch?.name || 'this branch'}`
                  }
                </p>
              </div>
            </div>
            
            <button 
              onClick={handleRefresh}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-xl text-sm hover:bg-gray-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap gap-3 justify-end">
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-xl text-sm hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <Filter size={18} />
              Show Filters
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-lg z-50 p-6 border">
                <div className="flex flex-col gap-4">
                  <h3 className="font-semibold text-gray-700 mb-2">Filters</h3>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Purchase Amount Range
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min Amount"
                        value={filterValues.minAmount}
                        onChange={(e) => handleFilterChange("minAmount", e.target.value)}
                        className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                      <input
                        type="number"
                        placeholder="Max Amount"
                        value={filterValues.maxAmount}
                        onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
                        className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Date Range
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="date"
                        value={filterValues.dateFrom}
                        onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
                        className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                      <input
                        type="date"
                        value={filterValues.dateTo}
                        onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                        className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>


                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Clear
                    </button>
                    <button
                      onClick={applyFilters}
                      className="px-4 py-2 text-sm font-medium text-white bg-[#6c0f2a] border border-transparent rounded-lg hover:from-rose-500 hover:to-red-600"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search Controls */}
          <div className="inline-flex items-center relative">
            <div className="relative">
              <button
                onClick={() => setIsSearchFieldOpen(!isSearchFieldOpen)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-l-xl text-sm hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-2"
              >
                {searchBy || "Search field"}
                <ChevronDown size={16} />
              </button>

              {isSearchFieldOpen && (
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border">
                  {searchFields.map((field) => (
                    <button
                      key={field}
                      className="w-full px-4 py-2 text-sm text-left hover:bg-gray-100 first:rounded-t-lg last:rounded-b-lg"
                      onClick={() => handleSearchFieldSelect(field)}
                    >
                      {field}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-80 px-4 py-2 pl-10 border border-l-0 border-gray-300 rounded-r-xl text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                placeholder="Search purchases..."
              />
              <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="flex flex-col bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20">
          <div className="px-6 py-4 border-b border-gray-200/50">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Purchases ({pagination.total})
              </h3>
              <div className="relative">
                <button
                  onClick={() => setIsExportOpen(!isExportOpen)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical size={18} />
                </button>

                {isExportOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border">
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 first:rounded-t-lg border-b border-gray-100 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" />
                      <span>Download as CSV</span>
                    </button>
                    <button className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 last:rounded-b-lg flex items-center gap-2">
                      <FileSpreadsheet className="w-4 h-4 text-green-600" />
                      <span>Download as Excel</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Table Header */}
          <div className={`grid gap-4 py-3 px-6 text-sm font-semibold text-gray-700 bg-gray-50/50 border-b border-gray-200/50 ${isBusinessView ? 'grid-cols-6' : 'grid-cols-5'}`}>
            <HeaderCell 
              text="Customer Phone" 
              info={columnInfo.customerPhone}
              hasSort
              onSort={handleSort}
              sortBy={sortBy}
              order={order}
            />
            <HeaderCell 
              text="Amount" 
              info={columnInfo.amount}
              hasSort
              onSort={handleSort}
              sortBy={sortBy}
              order={order}
            />
            <HeaderCell 
              text="Time" 
              info={columnInfo.time}
              hasSort
              onSort={handleSort}
              sortBy={sortBy}
              order={order}
            />
            <HeaderCell 
              text="Purchase Date" 
              info={columnInfo.purchaseDate}
              hasSort
              onSort={handleSort}
              sortBy={sortBy}
              order={order}
            />
            {isBusinessView && (
              <HeaderCell 
                text="Branch" 
                info={columnInfo.branch}
                hasSort
                onSort={handleSort}
                sortBy={sortBy}
                order={order}
              />
            )}
            <div className="text-center">Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200/50">
            {isLoading ? (
              <div className="py-12 text-center">
                <Loader2 size={48} className="animate-spin text-[#6c0f2a] mx-auto mb-4" />
                <p className="text-gray-600">Loading purchases...</p>
              </div>
            ) : error ? (
              <div className="py-12 text-center">
                <AlertCircle size={48} className="text-[#6c0f2a] mx-auto mb-4" />
                <p className="text-gray-600 mb-4">{error.message}</p>
                <button 
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-[#6c0f2a] text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : purchases.length === 0 ? (
              <div className="py-12 text-center">
                <ShoppingBag size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No purchases found</p>
                <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
              </div>
            ) : (
              purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className={`grid gap-4 py-4 px-6 text-sm hover:bg-gray-50/50 items-center transition-colors ${isBusinessView ? 'grid-cols-6' : 'grid-cols-5'}`}
                >
                  <div className="text-center">
                    <p className="font-medium text-gray-900">{purchase.customerPhone}</p>
                  </div>

                  <div className="text-center">
                    <span className="text-lg font-bold text-[#6c0f2a]">
                      {formatCurrency(purchase.amount)}
                    </span>
                  </div>

                  <div className="text-center">
                    <span className="font-medium text-gray-900">
                      {formatTime(purchase.purchaseDate)}
                    </span>
                  </div>

                  <div className="text-center">
                    <span className="font-medium text-gray-900">
                      {formatDate(purchase.purchaseDate)}
                    </span>
                  </div>

                  {isBusinessView && (
                    <div className="text-center">
                      <div className={`inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r ${getBranchColor(purchase.branchName)} text-white rounded-full text-xs font-medium shadow-sm`}>
                        <div className="w-2 h-2 bg-white/80 rounded-full"></div>
                        {purchase.branchName}
                      </div>
                    </div>
                  )}

                  <div className="text-center">
                    <button
                      onClick={() => handleAction('viewCustomer', purchase)}
                      className="flex items-center gap-2 px-3 py-1.5 text-[#6c0f2a] border border-[#6c0f2a] rounded-lg text-sm hover:bg-red-600 hover:text-white transition-colors cursor-pointer"
                    >
                      <Users size={14} />
                      View Customer
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200/50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-semibold">{pagination.total}</span> purchases
              </p>
              <div className="flex items-center space-x-2">
                <button
                  disabled={pagination.page === 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                  className={`px-4 py-2 border rounded-lg text-sm font-medium flex items-center ${
                    pagination.page === 1
                      ? "cursor-not-allowed text-gray-400 border-gray-300"
                      : "text-gray-700 hover:bg-gray-50 border-gray-300 cursor-pointer"
                  }`}
                >
                  <FaAngleLeft className="mr-2" />
                  Previous
                </button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                          pagination.page === pageNum
                            ? "text-white bg-gradient-to-r from-red-500 to-rose-600"
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {pagination.totalPages > 5 && (
                    <>
                      <span className="px-2 text-gray-500">...</span>
                      <button 
                        onClick={() => handlePageChange(pagination.totalPages)}
                        className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
                      >
                        {pagination.totalPages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                  className={`px-4 py-2 border-transparent rounded-lg shadow-sm text-sm font-medium text-white flex items-center ${
                    pagination.page >= pagination.totalPages
                      ? "cursor-not-allowed bg-gray-400"
                      : "bg-gradient-to-r from-red-500 to-rose-600 hover:from-rose-500 hover:to-red-600 cursor-pointer"
                  }`}
                >
                  Next
                  <FaAngleRight className="ml-2" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PurchasesPage;