'use client'
import { useState, useEffect, useMemo } from 'react';
import { 
  MessageSquare, Send, Users, Clock, CheckCircle, XCircle,
  Loader2, Filter, Search, Calendar, RefreshCw, AlertCircle, Wallet, X, PlusCircle
} from 'lucide-react';
import { sendBulkMessage, sendBulkMessageToAll, getMessageHistory } from '@/lib/api';
import { useCustomersData } from '@/lib/queries/branch';
import { useBusinessStore } from '@/store/store';


const MessagesPage = () => {
  const [activeTab, setActiveTab] = useState('send'); // 'send' | 'history'
  const [messageType, setMessageType] = useState('all'); // 'all', 'selected', 'topspenders'
  const [message, setMessage] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messageHistory, setMessageHistory] = useState([]);
  const [historyFilters, setHistoryFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  // Top spenders filters
  const [spenderFilters, setSpenderFilters] = useState({
    dateFrom: '',
    dateTo: '',
    search: '',
    minAmount: '',
    maxAmount: ''
  });

  // Top Up state for purchasing message credits (₦10 per message)
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpMode, setTopUpMode] = useState('messages'); // 'messages' | 'amount'
  const [topUpMessages, setTopUpMessages] = useState(100);
  const [topUpAmount, setTopUpAmount] = useState(1000);
  const [balance, setBalance] = useState(0);
  const PRICE_PER_MESSAGE = 10; // ₦10 per message
  const computedTopUpAmount = topUpMode === 'messages' ? topUpMessages * PRICE_PER_MESSAGE : topUpAmount;
  const computedTopUpMessages = topUpMode === 'amount' ? Math.floor(topUpAmount / PRICE_PER_MESSAGE) : topUpMessages;

  const { business } = useBusinessStore();
  const businessId = business?.id;
  // Pagination for selected customers list
  const [customersPage, setCustomersPage] = useState(1);
  const CUSTOMERS_PER_PAGE = 10;

  const { data: customersResponse, isLoading: customersLoading, error: customersError, refetch: refetchCustomers } = useCustomersData({ page: customersPage, limit: CUSTOMERS_PER_PAGE });
  // Use backend customers directly. If the API returns no customers, show an empty list.
  const sourceCustomers = customersResponse?.customers || [];

  useEffect(() => {
    if (!businessId) return;
    if (activeTab === 'history') {
      fetchMessageHistory();
    }
    // Always refresh balance when business or tab changes
    fetchBalance();
    // Ensure customers are refetched when business/tab changes so selected customers panel has fresh data
    try {
      if (typeof refetchCustomers === 'function') refetchCustomers();
    } catch (e) {
      console.error('Failed to refetch customers on business/tab change', e);
    }
  }, [activeTab, businessId]);

  const fetchMessageHistory = async () => {
    try {
      const result = await getMessageHistory(businessId, historyFilters);
      if (result.success) {
        setMessageHistory(result.data.messages || []);
      }
    } catch (error) {
      console.error('Error fetching message history:', error);
    }
  };

  const fetchBalance = async () => {
    // Balance is intentionally not connected to any service. Always show 0.
    setBalance(0);
  };

  const [showResultModal, setShowResultModal] = useState(false);
  const [sendResult, setSendResult] = useState(null);
  const handleSendMessage = async () => {
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }

    setIsLoading(true);
    try {
      let result;
      
      if (messageType === 'all') {
        result = await sendBulkMessageToAll(businessId, message.trim());
      } else {
        if (selectedCustomers.length === 0) {
          alert('Please select at least one customer');
          setIsLoading(false);
          return;
        }
        result = await sendBulkMessage(businessId, selectedCustomers, message.trim());
      }

      if (result.success) {
        // Show modal with summary from backend
        setSendResult(result.data);
        setShowResultModal(true);
        setMessage('');
        setSelectedCustomers([]);
      } else {
        // Show error in modal
        setSendResult({ error: result.error });
        setShowResultModal(true);
      }
    } catch (error) {
      console.error('Error sending messages:', error);
      setSendResult({ error: 'Failed to send messages. Please try again.' });
      setShowResultModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomerSelect = (customerId) => {
    setSelectedCustomers(prev => 
      prev.includes(customerId) 
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'sent':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  // Derive top spenders from actual customers data
  // Assume each customer has totalSpent, lastVisit, createdAt
  const topSpenders = useMemo(() => {
    const src = sourceCustomers;
    let list = src
      .map((c) => ({ id: c.id, phone: c.phoneNumber, totalSpent: c.totalSpent || 0, lastVisit: c.lastVisit || c.createdAt }))
      .filter((c) => !!c.phone);

    // search filter by phone
    if (spenderFilters.search) {
      const q = spenderFilters.search.toLowerCase();
      list = list.filter((c) => c.phone.toLowerCase().includes(q));
    }

    // date filters (by lastVisit)
    const from = spenderFilters.dateFrom ? new Date(spenderFilters.dateFrom) : null;
    const to = spenderFilters.dateTo ? new Date(spenderFilters.dateTo) : null;
    if (from) list = list.filter((c) => new Date(c.lastVisit) >= from);
    if (to) list = list.filter((c) => new Date(c.lastVisit) <= to);

    // amount range filters
    const min = spenderFilters.minAmount !== '' ? Number(spenderFilters.minAmount) : null;
    const max = spenderFilters.maxAmount !== '' ? Number(spenderFilters.maxAmount) : null;
    if (min !== null) list = list.filter((c) => (c.totalSpent || 0) >= min);
    if (max !== null) list = list.filter((c) => (c.totalSpent || 0) <= max);

    list.sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0));
    return list;
  }, [sourceCustomers, spenderFilters]);

  const displayTopSpenders = topSpenders;

  const toggleSpenderSelect = (id) => {
    setSelectedCustomers((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSendToTopSpenders = async () => {
    if (!message.trim()) {
      alert('Please enter a message');
      return;
    }
    if (selectedCustomers.length === 0) {
      alert('Please select at least one top spender');
      return;
    }
    setIsLoading(true);
    try {
      const result = await sendBulkMessage(businessId, selectedCustomers, message.trim());
      if (result.success) {
        setSendResult(result.data);
        setShowResultModal(true);
        setMessage('');
        setSelectedCustomers([]);
      } else {
        setSendResult({ error: result.error });
        setShowResultModal(true);
      }
    } catch (e) {
      console.error(e);
      setSendResult({ error: 'Failed to send messages. Please try again.' });
      setShowResultModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Send Messages</h1>
            <p className="text-gray-600">Send bulk SMS messages to your customers</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 shadow-sm">
              <Wallet className="w-4 h-4 text-emerald-700" />
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-emerald-700">Balance</span>
                <span className="text-2xl font-bold text-emerald-800">₦0</span>
              </div>
            </div>
            <button
              onClick={() => setShowTopUpModal(true)}
              className="px-4 py-2 bg-[#6d0e2b] text-white rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Top Up
            </button>
          </div>
        </div>
      </div>
      {/* Top Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowTopUpModal(false)}></div>
          <div className="relative bg-white rounded-xl border border-gray-200 w-full max-w-lg p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Wallet className="w-5 h-5 text-[#6c0f2a]" />
                <h3 className="text-lg font-semibold text-gray-900">Top Up Message Credits</h3>
              </div>
              <button className="p-2 rounded-lg hover:bg-gray-100" onClick={() => setShowTopUpModal(false)}>
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">1 message costs ₦{PRICE_PER_MESSAGE.toLocaleString()}.</p>

            <div className="flex items-center gap-2 mb-4">
              <button
                className={`px-3 py-1 rounded-lg border ${topUpMode === 'messages' ? 'bg-gray-100 border-gray-300' : 'border-gray-200'}`}
                onClick={() => setTopUpMode('messages')}
              >
                Top up by messages
              </button>
              <button
                className={`px-3 py-1 rounded-lg border ${topUpMode === 'amount' ? 'bg-gray-100 border-gray-300' : 'border-gray-200'}`}
                onClick={() => setTopUpMode('amount')}
              >
                Top up by amount (₦)
              </button>
            </div>

            {topUpMode === 'messages' ? (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Number of messages</label>
                <input
                  type="number"
                  min={1}
                  value={topUpMessages}
                  onChange={(e) => setTopUpMessages(Number(e.target.value))}
                  className="w-full rounded-lg border px-3 py-2"
                />
                <p className="text-sm text-gray-600">You will pay <span className="font-semibold">₦{computedTopUpAmount.toLocaleString()}</span>.</p>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">Amount (₦)</label>
                <input
                  type="number"
                  min={PRICE_PER_MESSAGE}
                  value={topUpAmount}
                  onChange={(e) => setTopUpAmount(Number(e.target.value))}
                  className="w-full rounded-lg border px-3 py-2"
                />
                <p className="text-sm text-gray-600">This gives you approximately <span className="font-semibold">{computedTopUpMessages.toLocaleString()}</span> messages.</p>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end">
              <button
                onClick={() => {
                  // Instead of simulating balance, just close and refresh actual balance
                  setShowTopUpModal(false);
                  // fetchBalance(); // Removed to keep balance fixed at 0
                }}
                className="px-4 py-2 bg-[#6d0e2b] text-white rounded-lg hover:opacity-90 transition-colors"
              >
                Confirm Top Up
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('send')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'send'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Send className="w-4 h-4 inline mr-2" />
            Send Messages
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Clock className="w-4 h-4 inline mr-2" />
            Message History
          </button>
        </nav>
      </div>

      {/* Send Messages Tab */}
      {activeTab === 'send' && (
        <div className="space-y-6">
          {/* Message Type Selection */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Recipients</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="messageType"
                    value="all"
                    checked={messageType === 'all'}
                    onChange={(e) => setMessageType(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">All Customers</span>
                </label>
                {/* Removed simple Selected Customers option */}
                {/* <label className="flex items-center">
                  <input
                    type="radio"
                    name="messageType"
                    value="selected"
                    checked={messageType === 'selected'}
                    onChange={(e) => setMessageType(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Selected Customers</span>
                </label> */}
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="messageType"
                    value="topspenders"
                    checked={messageType === 'topspenders'}
                    onChange={(e) => setMessageType(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">Selected Customers</span>
                </label>
              </div>

              {/* Customer Selection */}
              {messageType === 'selected' && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Select Customers:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                    {customersLoading ? (
                        // Render skeleton rows for the loading state
                        Array.from({ length: CUSTOMERS_PER_PAGE }).map((_, idx) => (
                          <div key={idx} className="flex items-center p-3 border border-gray-200 rounded-lg animate-pulse">
                            <div className="h-4 w-4 bg-gray-200 rounded" />
                            <div className="ml-3 w-full">
                              <div className="h-4 bg-gray-200 w-1/3 rounded mb-2" />
                              <div className="h-3 bg-gray-200 w-1/4 rounded" />
                            </div>
                          </div>
                        ))
                      ) : customersError ? (
                      <div className="col-span-1 md:col-span-2 lg:col-span-3 py-8 text-center text-red-500">
                        <p className="mb-2">Failed to load customers.</p>
                        <button
                          onClick={() => refetchCustomers()}
                          className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm"
                        >
                          Retry
                        </button>
                      </div>
                    ) : !businessId ? (
                      <div className="col-span-1 md:col-span-2 lg:col-span-3 py-8 text-center text-gray-500 text-sm">
                        No business selected. Please select a business to load customers.
                      </div>
                    ) : sourceCustomers.length === 0 ? (
                      <div className="col-span-1 md:col-span-2 lg:col-span-3 py-6 text-gray-500 text-sm">No customers found.</div>
                    ) : (
                      sourceCustomers.map((customer) => (
                        <label key={customer.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                          <input
                            type="checkbox"
                            checked={selectedCustomers.includes(customer.id)}
                            onChange={() => handleCustomerSelect(customer.id)}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{customer.phoneNumber}</p>
                            <p className="text-xs text-gray-500">{customer.name}</p>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                  {selectedCustomers.length > 0 && (
                    <p className="text-sm text-blue-600 mt-2">{selectedCustomers.length} customer(s) selected</p>
                  )}
                </div>
              )}

              {/* Top Spenders Selection */}
              {messageType === 'topspenders' && (
                <div className="mt-4 space-y-4">
                  <h4 className="text-sm font-medium text-gray-700">Filter Selected Customers:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                        <Search className="w-4 h-4 text-gray-500" />
                        <input
                          type="text"
                          value={spenderFilters.search}
                          onChange={(e) => setSpenderFilters({ ...spenderFilters, search: e.target.value })}
                          placeholder="Search phone"
                          className="bg-transparent outline-none w-full"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                      <input
                        type="date"
                        value={spenderFilters.dateFrom}
                        onChange={(e) => setSpenderFilters({ ...spenderFilters, dateFrom: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                      <input
                        type="date"
                        value={spenderFilters.dateTo}
                        onChange={(e) => setSpenderFilters({ ...spenderFilters, dateTo: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount Range (₦)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={spenderFilters.minAmount}
                          onChange={(e) => setSpenderFilters({ ...spenderFilters, minAmount: e.target.value })}
                          placeholder="Min"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                          type="number"
                          value={spenderFilters.maxAmount}
                          onChange={(e) => setSpenderFilters({ ...spenderFilters, maxAmount: e.target.value })}
                          placeholder="Max"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />

                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end mb-2 gap-2">
                    <button
                      className="px-3 py-2 rounded-lg bg-[#6d0e2b] text-white text-sm"
                      onClick={() => {
                        // Select all customers currently shown (current page)
                        const allIds = sourceCustomers.map((c) => c.id);
                        setSelectedCustomers(allIds);
                      }}
                    >
                      Select All
                    </button>
                    <button
                      className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm"
                      onClick={() => {
                        setSpenderFilters({ dateFrom: '', dateTo: '', search: '', minAmount: '', maxAmount: '' });
                        setSelectedCustomers([]);
                      }}
                    >
                      Clear Filters
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Select</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent (₦)</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Visit</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {topSpenders.length === 0 ? (
                          <tr>
                            <td colSpan="4" className="px-6 py-12 text-center text-gray-500">No customers found.</td>
                          </tr>
                        ) : (
                          topSpenders.map((c) => (
                            <tr key={c.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4">
                                <input
                                  type="checkbox"
                                  checked={selectedCustomers.includes(c.id)}
                                  onChange={() => toggleSpenderSelect(c.id)}
                                  className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{c.phone}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₦{(c.totalSpent || 0).toLocaleString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{c.lastVisit ? new Date(c.lastVisit).toLocaleDateString() : '-'}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>

                  {selectedCustomers.length > 0 && (
                    <p className="text-sm text-blue-600 mt-2">{selectedCustomers.length} top spender(s) selected</p>
                  )}

                  {/* Pagination footer for customers list */}
                  {customersResponse?.pagination && (
                    <div className="mt-4 flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        {(() => {
                          const page = customersResponse.pagination.page || customersPage;
                          const limit = customersResponse.pagination.limit || CUSTOMERS_PER_PAGE;
                          const total = customersResponse.pagination.total || 0;
                          const start = (page - 1) * limit + 1;
                          const end = Math.min(page * limit, total);
                          if (total === 0) return 'Showing 0 customers';
                          return `Showing ${start}-${end} of ${total} customers`;
                        })()}
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCustomersPage((p) => Math.max(1, p - 1))}
                          disabled={customersPage <= 1 || customersLoading}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <div className="px-3 py-2 text-sm">
                          {Array.from({ length: customersResponse.pagination.totalPages || 1 }).slice(0, 10).map((_, idx) => {
                            const pg = idx + 1;
                            return (
                              <button
                                key={pg}
                                onClick={() => setCustomersPage(pg)}
                                disabled={customersLoading}
                                className={`mx-1 px-3 py-1 rounded ${customersPage === pg ? 'bg-[#6d0e2b] text-white' : 'border border-gray-200 text-gray-700'} ${customersLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                              >
                                {pg}
                              </button>
                            );
                          })}
                        </div>
                        <button
                          onClick={() => setCustomersPage((p) => Math.min(customersResponse.pagination.totalPages || 1, p + 1))}
                          disabled={customersPage >= (customersResponse.pagination.totalPages || 1) || customersLoading}
                          className="px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Message Composition */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Compose Message</h3>
              <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200">
                <Wallet className="w-4 h-4 text-emerald-700" />
                <span className="text-xs text-emerald-700">Balance:</span>
                <span className="text-sm font-bold text-emerald-800">₦0</span>
                <span className="ml-2 text-xs text-gray-600">0/0 messages</span>
              </div>
            </div>
            <div className="space-y-4">
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">SMS Message</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your SMS message here..."
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-500 mt-1">{message.length}/1000 characters</p>
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !message.trim() || (messageType !== 'all' && selectedCustomers.length === 0)}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send SMS
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={historyFilters.status}
                  onChange={(e) => setHistoryFilters({ ...historyFilters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">All</option>
                  <option value="sent">Sent</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                <input
                  type="date"
                  value={historyFilters.dateFrom}
                  onChange={(e) => setHistoryFilters({ ...historyFilters, dateFrom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                <input
                  type="date"
                  value={historyFilters.dateTo}
                  onChange={(e) => setHistoryFilters({ ...historyFilters, dateTo: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
                  <Search className="w-4 h-4 text-gray-500" />
                  <input
                    type="text"
                    value={historyFilters.search}
                    onChange={(e) => setHistoryFilters({ ...historyFilters, search: e.target.value })}
                    placeholder="Search phone"
                    className="bg-transparent outline-none w-full"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <button onClick={fetchMessageHistory} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2">
                <RefreshCw className="w-4 h-4" /> Refresh
              </button>
            </div>
          </div>

          {/* Message History Table */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sent At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sent By
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {messageHistory.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                        <MessageSquare className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>No messages found</p>
                        <p className="text-sm">Start sending messages to see them here</p>
                      </td>
                    </tr>
                  ) : (
                    messageHistory.map((msg, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {msg.phoneNumber}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          <div className="max-w-xs truncate" title={msg.message}>
                            {msg.message}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center gap-2">
                            {getStatusIcon(msg.status)}
                            <span className="capitalize">{msg.status}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(msg.sentAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {msg.sentBy || 'System'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Top Spenders Tab */}
      {false && activeTab === 'topspenders' && (
        <div className="space-y-6">{/* hidden per requirements */}</div>
      )}

      {showResultModal && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Message Send Summary</h3>
              <button
                className="p-2 hover:bg-gray-100 rounded-lg"
                onClick={() => setShowResultModal(false)}
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-3">
              {sendResult?.error ? (
                <div className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="text-sm text-red-700 font-medium">{sendResult.error}</p>
                    <p className="text-xs text-gray-600">Please review your selections and try again.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <div className="space-y-1">
                      <p className="text-sm text-gray-800">
                        Sent to {sendResult?.totalCustomers ?? sendResult?.data?.totalCustomers ?? (messageType === 'all' ? 'all customers' : selectedCustomers.length)} customers
                      </p>
                      <p className="text-sm text-gray-800">Successfully sent: {sendResult?.totalSent ?? sendResult?.data?.totalSent ?? 0}</p>
                      <p className="text-sm text-gray-800">Failed: {sendResult?.totalFailed ?? sendResult?.data?.totalFailed ?? 0}</p>
                      {sendResult?.data?.branchFilter && (
                        <p className="text-xs text-gray-600">{sendResult.data.branchFilter}</p>
                      )}
                    </div>
                  </div>

                  {Array.isArray(sendResult?.data?.results) && sendResult.data.results.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-gray-900 mb-2">Delivery details</p>
                      <div className="max-h-40 overflow-auto border border-gray-200 rounded">
                        <ul className="divide-y divide-gray-100">
                          {sendResult.data.results.map((r, idx) => (
                            <li key={idx} className="p-2 text-sm flex items-center justify-between">
                              <span className="text-gray-700">{r?.customer?.phoneNumber || r?.phoneNumber}</span>
                              {r?.success ? (
                                <span className="text-green-600">sent</span>
                              ) : (
                                <span className="text-red-600">failed</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowResultModal(false)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
export default MessagesPage;