"use client"
import React, { useState, useRef, useEffect } from 'react';
import { 
  Users, Search, MoreVertical, MessageSquare, Phone, Eye, ChevronDown, Check, FileText, 
  FileSpreadsheet, Filter, RefreshCw, Calendar, Loader2, AlertCircle, Store, BarChart3
} from 'lucide-react';
import { IoMdInformationCircleOutline } from 'react-icons/io';
import { RxCaretDown, RxCaretSort, RxCaretUp } from 'react-icons/rx';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import { useCustomersData } from '@/lib/queries/branch';
import { useBranchStore, useBusinessStore } from '@/store/store';



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
    { id: 'sendMessage', label: 'Send Message', icon: MessageSquare, color: 'text-gray-700' }
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

// Main Customers Page Component
const CustomersPage = () => {
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
    minVisits: "",
    maxVisits: "",
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
    minVisits: filterValues.minVisits || undefined,
    maxVisits: filterValues.maxVisits || undefined,
  };

  // Fetch customers data using context-aware hook
  const { data: customersResponse, isLoading, error, refetch } = useCustomersData(filters);
  
  // Extract customers and pagination from response
  const customers = customersResponse?.customers || [];
  const pagination = customersResponse?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 };
  
  const isBusinessView = !currentBranch;

  const searchFields = [
    "Phone Number",
    "Total Spent", 
    "Visit Count",
    "Last Visit"
  ];

  const columnInfo = {
    phoneNumber: "Customer's phone number used for identification",
    totalSpent: "Total amount customer has spent (all-time)",
    visitCount: "Number of times customer has visited",
    lastVisit: "Date of customer's most recent visit",
    recentPurchases: "Customer's latest purchase transactions"
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

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
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
    alert(`Action: ${action} for customer ${item.phoneNumber}`);
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
      minVisits: "",
      maxVisits: "",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-red-50 to-rose-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl border border-white/20 shadow-xl rounded-2xl p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-[#6c0f2a] flex items-center justify-center shadow-lg">
                <Users size={28} className="text-white" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-gray-900">Customers</h1>
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
                    ? "All customers across your business" 
                    : `Customers for ${currentBranch?.name || 'this branch'}`
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
                      Total Spent Range
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
                      Visit Count Range
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Min Visits"
                        value={filterValues.minVisits}
                        onChange={(e) => handleFilterChange("minVisits", e.target.value)}
                        className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                      <input
                        type="number"
                        placeholder="Max Visits"
                        value={filterValues.maxVisits}
                        onChange={(e) => handleFilterChange("maxVisits", e.target.value)}
                        className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Last Visit Date Range
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
                placeholder="Search customers..."
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
                Customers ({pagination.total})
              </h3>
              <div className="relative">
                <button
                  onClick={() => setIsExportOpen(!isExportOpen)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreVertical size={18} />
                </button>

                {/* {isExportOpen && (
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
                )} */}
              </div>
            </div>
          </div>

          {/* Table Header */}
          <div className="grid grid-cols-6 gap-4 py-3 px-6 text-sm font-semibold text-gray-700 bg-gray-50/50 border-b border-gray-200/50">
            <HeaderCell 
              text="Phone Number" 
              info={columnInfo.phoneNumber}
              hasSort
              onSort={handleSort}
              sortBy={sortBy}
              order={order}
            />
            <HeaderCell 
              text="Total Spent" 
              info={columnInfo.totalSpent}
              hasSort
              onSort={handleSort}
              sortBy={sortBy}
              order={order}
            />
            <HeaderCell 
              text="Visit Count" 
              info={columnInfo.visitCount}
              hasSort
              onSort={handleSort}
              sortBy={sortBy}
              order={order}
            />
            <HeaderCell 
              text="Last Visit" 
              info={columnInfo.lastVisit}
              hasSort
              onSort={handleSort}
              sortBy={sortBy}
              order={order}
            />
            <HeaderCell 
              text="Recent Purchases" 
              info={columnInfo.recentPurchases}
            />
            <div className="text-center">Actions</div>
          </div>

          {/* Table Body */}
          <div className="divide-y divide-gray-200/50">
            {isLoading ? (
              <div className="py-12 text-center">
                <Loader2 size={48} className="animate-spin text-red-500 mx-auto mb-4" />
                <p className="text-gray-600">Loading customers...</p>
              </div>
            ) : error ? (
              <div className="py-12 text-center">
                <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">{error.message}</p>
                <button 
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-[#6c0f2a] text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : customers.length === 0 ? (
              <div className="py-12 text-center">
                <Users size={48} className="text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No customers found</p>
                <p className="text-sm text-gray-500">Try adjusting your search or filters</p>
              </div>
            ) : (
              customers.map((customer) => (
              <div
                key={customer.id}
                className="grid grid-cols-6 gap-4 py-4 px-6 text-sm hover:bg-gray-50/50 items-center transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                    <Phone size={16} className="text-[#6c0f2a]" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{customer.phoneNumber}</p>
                    <p className="text-xs text-gray-500">
                      Customer since {formatDate(customer.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <span className="text-lg font-bold text-[#6c0f2a]">
                    {formatCurrency(customer.totalSpent)}
                  </span>
                </div>

                <div className="text-center">
                  <span className="text-lg font-semibold text-gray-900">
                    {customer.visitCount}
                  </span>
                  <p className="text-xs text-gray-500">visits</p>
                </div>

                <div className="text-center">
                  <span className="font-medium text-gray-900">
                    {formatDate(customer.lastVisit)}
                  </span>
                </div>

                <div className="space-y-1">
                  {customer.recentPurchases.slice(0, 3).map((purchase, idx) => (
                    <div key={idx} className="flex justify-between text-xs">
                      <span className="text-gray-600">
                        {formatDateTime(purchase.purchaseDate)}
                      </span>
                      <span className="font-medium text-gray-900">
                        {formatCurrency(purchase.amount)}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="text-center">
                  <ActionDropdown item={customer} onAction={handleAction} />
                </div>
              </div>
              ))
            )}
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200/50">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold">{((pagination.page - 1) * pagination.limit) + 1}-{Math.min(pagination.page * pagination.limit, pagination.total)}</span> of <span className="font-semibold">{pagination.total}</span> customers
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
                            ? "text-white bg-[#6c0f2a]"
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
                      : "bg-[#6c0f2a] hover:from-rose-500 hover:to-red-600 cursor-pointer"
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

export default CustomersPage;