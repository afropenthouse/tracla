'use client'
import { useState, useRef, useEffect } from 'react';
import { 
  Users, Receipt, Search, MoreVertical, MessageSquare, Phone, 
  ArrowUpRight, ArrowDownRight, ChevronDown, Check, X, FileText, 
  FileSpreadsheet, Clock, Eye, Edit3, Filter, RefreshCw, Calendar,
  Grid3X3, List, ShoppingBag
} from 'lucide-react';
import { IoMdInformationCircleOutline } from 'react-icons/io';
import { RxCaretDown, RxCaretSort, RxCaretUp } from 'react-icons/rx';
import { FaAngleLeft, FaAngleRight } from 'react-icons/fa';

// Mock data based on the Prisma models
const mockCustomers = [
  {
    id: 'cust_001',
    phoneNumber: '+234 801 234 5678',
    totalSpent: 342000,
    visitCount: 27,
    lastVisit: '2024-12-10T14:30:00Z',
    createdAt: '2024-01-15T10:00:00Z',
    recentPurchases: [
      { amount: 15000, purchaseDate: '2024-12-10T14:30:00Z' },
      { amount: 8500, purchaseDate: '2024-12-08T16:20:00Z' },
      { amount: 12000, purchaseDate: '2024-12-05T11:45:00Z' }
    ]
  },
  {
    id: 'cust_002', 
    phoneNumber: '+234 802 345 6789',
    totalSpent: 156000,
    visitCount: 18,
    lastVisit: '2024-12-09T09:15:00Z',
    createdAt: '2024-02-22T14:30:00Z',
    recentPurchases: [
      { amount: 22000, purchaseDate: '2024-12-09T09:15:00Z' },
      { amount: 18500, purchaseDate: '2024-12-06T13:20:00Z' }
    ]
  },
  {
    id: 'cust_003',
    phoneNumber: '+234 803 456 7890', 
    totalSpent: 289000,
    visitCount: 12,
    lastVisit: '2024-12-08T17:45:00Z',
    createdAt: '2024-03-10T09:20:00Z',
    recentPurchases: [
      { amount: 7500, purchaseDate: '2024-12-08T17:45:00Z' },
      { amount: 12000, purchaseDate: '2024-12-04T15:30:00Z' }
    ]
  },
  {
    id: 'cust_004',
    phoneNumber: '+234 804 567 8901',
    totalSpent: 234000,
    visitCount: 31,
    lastVisit: '2024-12-11T12:00:00Z',
    createdAt: '2024-01-08T16:45:00Z',
    recentPurchases: [
      { amount: 28000, purchaseDate: '2024-12-11T12:00:00Z' },
      { amount: 15000, purchaseDate: '2024-12-09T14:20:00Z' },
      { amount: 19500, purchaseDate: '2024-12-07T10:15:00Z' }
    ]
  },
  {
    id: 'cust_005',
    phoneNumber: '+234 805 678 9012',
    totalSpent: 167000,
    visitCount: 8,
    lastVisit: '2024-12-07T15:30:00Z',
    createdAt: '2024-04-18T11:10:00Z',
    recentPurchases: [
      { amount: 9500, purchaseDate: '2024-12-07T15:30:00Z' },
      { amount: 14000, purchaseDate: '2024-12-03T16:45:00Z' }
    ]
  },
  {
    id: 'cust_006',
    phoneNumber: '+234 806 789 0123',
    totalSpent: 123000,
    visitCount: 15,
    lastVisit: '2024-12-06T11:20:00Z',
    createdAt: '2024-02-14T13:25:00Z',
    recentPurchases: [
      { amount: 16500, purchaseDate: '2024-12-06T11:20:00Z' },
      { amount: 11000, purchaseDate: '2024-12-02T09:30:00Z' }
    ]
  }
];

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

// Custom Dropdown Component
const CustomDropdown = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select...", 
  icon: Icon,
  className = "" 
}) => {
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

  const selectedOption = options.find(option => option.value === value);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-2 text-left bg-white border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#1A73E8] focus:border-[#1A73E8] hover:border-gray-400 transition-colors cursor-pointer flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          {Icon && <Icon size={16} className="text-gray-500" />}
          <span className={selectedOption ? "text-gray-900" : "text-gray-500"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown 
          size={16} 
          className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
          {options.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors cursor-pointer flex items-center justify-between text-sm"
            >
              <span className={value === option.value ? "text-[#1A73E8] font-medium" : "text-gray-900"}>
                {option.label}
              </span>
              {value === option.value && (
                <Check size={14} className="text-[#1A73E8]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

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
const ActionDropdown = ({ item, onAction, viewMode }) => {
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

  const customerActions = [
    { id: 'viewCustomer', label: 'View Customer', icon: Eye, color: 'text-[#1A73E8]' },
    { id: 'sendMessage', label: 'Send Message', icon: MessageSquare, color: 'text-gray-700' }
  ];

  const purchaseActions = [
    { id: 'viewCustomer', label: 'View Customer', icon: Eye, color: 'text-[#1A73E8]' },
    { id: 'viewReceipt', label: 'View Receipt', icon: Receipt, color: 'text-gray-700' }
  ];

  const actions = viewMode === 'customers' ? customerActions : purchaseActions;

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

// Main Table Component
const VibeazyTable = () => {
  const [viewMode, setViewMode] = useState('customers'); // 'customers' or 'purchases'
  const [customers] = useState(mockCustomers);
  const [purchases] = useState(mockPurchases);
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

  const customerSearchFields = [
    "Phone Number",
    "Total Spent", 
    "Visit Count",
    "Last Visit"
  ];

  const purchaseSearchFields = [
    "Customer Phone",
    "Amount",
    "Purchase Date",
    "Branch"
  ];

  const customerColumnInfo = {
    phoneNumber: "Customer's phone number used for identification",
    totalSpent: "Total amount customer has spent (all-time)",
    visitCount: "Number of times customer has visited",
    lastVisit: "Date of customer's most recent visit",
    recentPurchases: "Customer's latest purchase transactions"
  };

  const purchaseColumnInfo = {
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

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
    alert(`Action: ${action} for ${viewMode === 'customers' ? item.phoneNumber : item.customerPhone}`);
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
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    setSearch('');
    setSearchBy('');
    setSortBy('');
    setOrder('DESC');
    setPage(1);
    clearFilters();
  };

  // Get current data and fields based on view mode
  const currentData = viewMode === 'customers' ? customers : purchases;
  const currentSearchFields = viewMode === 'customers' ? customerSearchFields : purchaseSearchFields;
  const currentColumnInfo = viewMode === 'customers' ? customerColumnInfo : purchaseColumnInfo;

  // Calculate totals for pagination (mock)
  const totalItems = currentData.length;
  const itemsPerPage = 10;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  return (
    <div className="flex flex-col gap-5">
      {/* Header with View Toggle */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {viewMode === 'customers' ? 'Customers' : 'Purchases'}
            </h1>
            <p className="text-gray-600">
              {viewMode === 'customers' 
                ? 'Manage customer data and spending patterns' 
                : 'Track all purchase transactions and receipts'
              }
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button 
                onClick={() => handleViewModeChange('customers')}
                className={`px-4 py-2 text-sm rounded-md transition-colors cursor-pointer flex items-center gap-2 ${
                  viewMode === 'customers' 
                    ? 'bg-white text-[#1A73E8] shadow-sm font-medium' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Users size={16} />
                Customers
              </button>
              <button 
                onClick={() => handleViewModeChange('purchases')}
                className={`px-4 py-2 text-sm rounded-md transition-colors cursor-pointer flex items-center gap-2 ${
                  viewMode === 'purchases' 
                    ? 'bg-white text-[#1A73E8] shadow-sm font-medium' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ShoppingBag size={16} />
                Purchases
              </button>
            </div>
            
            <button 
              onClick={clearFilters}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <RefreshCw size={14} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="flex flex-wrap gap-2 justify-end">
        <div className="relative">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <Filter size={18} />
            Show Filters
          </button>

          {isFilterOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg z-50 p-6 border">
              <div className="flex flex-col gap-4">
                <h3 className="font-semibold text-gray-700 mb-2">Filters</h3>

                {viewMode === 'customers' ? (
                  <>
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
                          className="w-1/2 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[#1A73E8] focus:border-[#1A73E8]"
                        />
                        <input
                          type="number"
                          placeholder="Max Amount"
                          value={filterValues.maxAmount}
                          onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
                          className="w-1/2 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[#1A73E8] focus:border-[#1A73E8]"
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
                          className="w-1/2 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[#1A73E8] focus:border-[#1A73E8]"
                        />
                        <input
                          type="number"
                          placeholder="Max Visits"
                          value={filterValues.maxVisits}
                          onChange={(e) => handleFilterChange("maxVisits", e.target.value)}
                          className="w-1/2 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[#1A73E8] focus:border-[#1A73E8]"
                        />
                      </div>
                    </div>
                  </>
                ) : (
                  <>
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
                          className="w-1/2 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[#1A73E8] focus:border-[#1A73E8]"
                        />
                        <input
                          type="number"
                          placeholder="Max Amount"
                          value={filterValues.maxAmount}
                          onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
                          className="w-1/2 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[#1A73E8] focus:border-[#1A73E8]"
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
                          className="w-1/2 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[#1A73E8] focus:border-[#1A73E8]"
                        />
                        <input
                          type="date"
                          value={filterValues.dateTo}
                          onChange={(e) => handleFilterChange("dateTo", e.target.value)}
                          className="w-1/2 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[#1A73E8] focus:border-[#1A73E8]"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end gap-2 mt-4">
                  <button
                    onClick={clearFilters}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Clear
                  </button>
                  <button
                    onClick={() => setIsFilterOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#1A73E8] border border-transparent rounded-md hover:bg-[#1557B0]"
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
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-l-md text-sm hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-2"
            >
              {searchBy || "Search field"}
              <ChevronDown size={16} />
            </button>

            {isSearchFieldOpen && (
              <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-50 border">
                {currentSearchFields.map((field) => (
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
              className="w-80 px-4 py-2 pl-10 border border-l-0 border-gray-300 rounded-r-md text-sm focus:ring-1 focus:ring-[#1A73E8] focus:border-[#1A73E8]"
              placeholder={`Search ${viewMode}...`}
            />
            <Search size={18} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex flex-col bg-white rounded-lg shadow-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold text-gray-900">
              {viewMode === 'customers' ? `Customers (${totalItems})` : `Purchases (${totalItems})`}
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

        {/* Table Headers */}
        {viewMode === 'customers' ? (
          <>
            {/* Customer Table Header */}
            <div className="grid grid-cols-6 gap-4 py-3 px-6 text-sm font-semibold text-gray-700 bg-gray-50 border-b border-gray-200">
              <HeaderCell 
                text="Phone Number" 
                info={currentColumnInfo.phoneNumber}
                hasSort
                onSort={handleSort}
                sortBy={sortBy}
                order={order}
              />
              <HeaderCell 
                text="Total Spent" 
                info={currentColumnInfo.totalSpent}
                hasSort
                onSort={handleSort}
                sortBy={sortBy}
                order={order}
              />
              <HeaderCell 
                text="Visit Count" 
                info={currentColumnInfo.visitCount}
                hasSort
                onSort={handleSort}
                sortBy={sortBy}
                order={order}
              />
              <HeaderCell 
                text="Last Visit" 
                info={currentColumnInfo.lastVisit}
                hasSort
                onSort={handleSort}
                sortBy={sortBy}
                order={order}
              />
              <HeaderCell 
                text="Recent Purchases" 
                info={currentColumnInfo.recentPurchases}
              />
              <div className="text-center">Actions</div>
            </div>

            {/* Customer Table Body */}
            <div className="divide-y divide-gray-200">
              {customers.map((customer) => (
                <div
                  key={customer.id}
                  className="grid grid-cols-6 gap-4 py-4 px-6 text-sm hover:bg-gray-50 items-center"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#1A73E8]/10 rounded-lg flex items-center justify-center">
                      <Phone size={16} className="text-[#1A73E8]" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{customer.phoneNumber}</p>
                      <p className="text-xs text-gray-500">
                        Customer since {formatDate(customer.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="text-center">
                    <span className="text-lg font-bold text-[#1A73E8]">
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
                    <ActionDropdown item={customer} onAction={handleAction} viewMode={viewMode} />
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Purchase Table Header */}
            <div className="grid grid-cols-6 gap-4 py-3 px-6 text-sm font-semibold text-gray-700 bg-gray-50 border-b border-gray-200">
              <HeaderCell 
                text="Customer Phone" 
                info={currentColumnInfo.customerPhone}
                hasSort
                onSort={handleSort}
                sortBy={sortBy}
                order={order}
              />
              <HeaderCell 
                text="Amount" 
                info={currentColumnInfo.amount}
                hasSort
                onSort={handleSort}
                sortBy={sortBy}
                order={order}
              />
              <HeaderCell 
                text="Time" 
                info={currentColumnInfo.time}
                hasSort
                onSort={handleSort}
                sortBy={sortBy}
                order={order}
              />
              <HeaderCell 
                text="Purchase Date" 
                info={currentColumnInfo.purchaseDate}
                hasSort
                onSort={handleSort}
                sortBy={sortBy}
                order={order}
              />
              <HeaderCell 
                text="Branch" 
                info={currentColumnInfo.branch}
                hasSort
                onSort={handleSort}
                sortBy={sortBy}
                order={order}
              />
              <div className="text-center">Actions</div>
            </div>

            {/* Purchase Table Body */}
            <div className="divide-y divide-gray-200">
              {purchases.map((purchase) => (
                <div
                  key={purchase.id}
                  className="grid grid-cols-6 gap-4 py-4 px-6 text-sm hover:bg-gray-50 items-center"
                >
                  <div className="text-center">
                    <p className="font-medium text-gray-900">{purchase.customerPhone}</p>
                  </div>

                  <div className="text-center">
                    <span className="text-lg font-bold text-[#1A73E8]">
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

                  <div className="text-center">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#1A73E8]/10 text-[#1A73E8] rounded-full text-xs font-medium">
                      <div className="w-2 h-2 bg-[#1A73E8] rounded-full"></div>
                      {purchase.branchName}
                    </div>
                  </div>

                  <div className="text-center">
                    <button
                      onClick={() => handleAction('viewCustomer', purchase)}
                      className="flex items-center gap-2 px-3 py-1.5 text-[#1A73E8] border border-[#1A73E8] rounded-lg text-sm hover:bg-[#1A73E8] hover:text-white transition-colors cursor-pointer"
                    >
                      <Users size={14} />
                      View Customer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        <div className="px-6 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing <span className="font-semibold">1-{Math.min(itemsPerPage, totalItems)}</span> of <span className="font-semibold">{totalItems}</span> {viewMode}
            </p>
            <div className="flex items-center space-x-2">
              <button
                disabled={page === 1}
                className={`px-4 py-2 border rounded-lg text-sm font-medium flex items-center ${
                  page === 1
                    ? "cursor-not-allowed text-gray-400 border-gray-300"
                    : "text-gray-700 hover:bg-gray-50 border-gray-300 cursor-pointer"
                }`}
              >
                <FaAngleLeft className="mr-2" />
                Previous
              </button>

              <div className="flex items-center space-x-1">
                <button className="px-3 py-2 text-sm font-medium text-white bg-[#1A73E8] rounded-lg">
                  1
                </button>
                <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                  2
                </button>
                <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                  3
                </button>
                <span className="px-2 text-gray-500">...</span>
                <button className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                  {totalPages}
                </button>
              </div>

              <button
                disabled={page >= totalPages}
                className={`px-4 py-2 border-transparent rounded-lg shadow-sm text-sm font-medium text-white flex items-center ${
                  page >= totalPages
                    ? "cursor-not-allowed bg-gray-400"
                    : "bg-[#1A73E8] hover:bg-[#1557B0] cursor-pointer"
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
  );
};

export default VibeazyTable;