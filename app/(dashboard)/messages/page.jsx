'use client'
import { useState, useEffect, useMemo } from 'react';
import { 
  MessageSquare, Send, Users, Clock, CheckCircle, XCircle, 
  Loader2, Filter, Search, Calendar, RefreshCw, AlertCircle, Wallet, CreditCard, X, PlusCircle
} from 'lucide-react';
import { sendBulkMessage, sendBulkMessageToAll, getMessageHistory } from '@/lib/api';
import { useCustomersData } from '@/lib/queries/branch';
import { useBusinessStore } from '@/store/store';

const MessagesPage = () => {
  const [activeTab, setActiveTab] = useState('send'); // 'send' | 'history' | 'topspenders'
  const [messageType, setMessageType] = useState('all'); // 'all', 'selected'
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
    category: 'top10' // 'top10' | 'top50' | 'min20k'
  });

  // Top Up state for purchasing message credits (₦10 per message)
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpMode, setTopUpMode] = useState('messages'); // 'messages' | 'amount'
  const [topUpMessages, setTopUpMessages] = useState(100);
  const [topUpAmount, setTopUpAmount] = useState(1000);
  const PRICE_PER_MESSAGE = 10; // ₦10 per message
  const computedTopUpAmount = topUpMode === 'messages' ? topUpMessages * PRICE_PER_MESSAGE : topUpAmount;
  const computedTopUpMessages = topUpMode === 'amount' ? Math.floor(topUpAmount / PRICE_PER_MESSAGE) : topUpMessages;

  const { business } = useBusinessStore();
  const businessId = business?.id;

  const { data: customersResponse, isLoading: customersLoading, error: customersError } = useCustomersData({ page: 1, limit: 200 });
  const customers = customersResponse?.customers || [];
  const defaultCustomers = [
    { id: 'd1', phoneNumber: '2348100000001', totalSpent: 50000, lastVisit: new Date().toISOString(), createdAt: new Date().toISOString() },
    { id: 'd2', phoneNumber: '2348100000002', totalSpent: 40000, lastVisit: new Date().toISOString(), createdAt: new Date().toISOString() },
    { id: 'd3', phoneNumber: '2348100000003', totalSpent: 30000, lastVisit: new Date().toISOString(), createdAt: new Date().toISOString() },
    { id: 'd4', phoneNumber: '2348100000004', totalSpent: 15000, lastVisit: new Date().toISOString(), createdAt: new Date().toISOString() },
    { id: 'd5', phoneNumber: '2348100000005', totalSpent: 8000, lastVisit: new Date().toISOString(), createdAt: new Date().toISOString() },
  ];
  const sourceCustomers = customers && customers.length > 0 ? customers : defaultCustomers;

  useEffect(() => {
    if (!businessId) return;
    if (activeTab === 'history') {
      fetchMessageHistory();
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
        alert('Messages sent successfully!');
        setMessage('');
        setSelectedCustomers([]);
      } else {
        alert(`Failed to send messages: ${result.error}`);
      }
    } catch (error) {
      console.error('Error sending messages:', error);
      alert('Failed to send messages. Please try again.');
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

  // Derive mock top spenders from customers data (frontend-only)
  // Assume each customer has totalSpent, lastVisit, createdAt
  const topSpenders = useMemo(() => {
    const src = customers && customers.length > 0 ? customers : defaultCustomers;
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

    // category
    list.sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0));
    if (spenderFilters.category === 'top5') list = list.slice(0, 5);
    else if (spenderFilters.category === 'top10') list = list.slice(0, 10);
    else if (spenderFilters.category === 'top50') list = list.slice(0, 50);
    else if (spenderFilters.category === 'min20k') list = list.filter((c) => (c.totalSpent || 0) >= 20000);
    else if (spenderFilters.category === 'below20k') list = list.filter((c) => (c.totalSpent || 0) < 20000);

    return list;
  }, [customers, spenderFilters]);

  const displayTopSpenders = topSpenders.length > 0 ? topSpenders : defaultCustomers
    .map((c) => ({ id: c.id, phone: c.phoneNumber, totalSpent: c.totalSpent || 0, lastVisit: c.lastVisit || c.createdAt }))
    .sort((a, b) => (b.totalSpent || 0) - (a.totalSpent || 0))
    .slice(0, 5);

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
        alert('Messages sent to top spenders!');
        setMessage('');
        setSelectedCustomers([]);
      } else {
        alert(`Failed to send: ${result.error}`);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to send messages');
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">WhatsApp Messages</h1>
            <p className="text-gray-600">Send bulk WhatsApp messages to your customers</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowTopUpModal(true)}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
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

            <div className="mt-6 flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <CreditCard className="w-4 h-4" />
                <span>Payment method: Card </span>
              </div>
              <button
                onClick={() => {
                  // Frontend-only: simulate adding to balance
                  setShowTopUpModal(false);
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
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
          <button
            onClick={() => setActiveTab('topspenders')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'topspenders'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Top Spenders
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
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    All Customers
                  </span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="messageType"
                    value="selected"
                    checked={messageType === 'selected'}
                    onChange={(e) => setMessageType(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    Selected Customers
                  </span>
                </label>
              </div>

              {/* Customer Selection */}
              {messageType === 'selected' && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Select Customers:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-60 overflow-y-auto">
                    {sourceCustomers.length === 0 ? (
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
                    <p className="text-sm text-blue-600 mt-2">
                      {selectedCustomers.length} customer(s) selected
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Message Composition */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Compose Message</h3>
            <div className="space-y-4">
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  WhatsApp Message
                </label>
                <textarea
                  id="message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your WhatsApp message here..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  disabled={isLoading}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {message.length}/1000 characters
                </p>
              </div>

              <div className="flex justify-end">
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !message.trim()}
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
                      Send Messages
                    </>
                  )}
                </button>
              </div>
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
      {activeTab === 'topspenders' && (
        <div className="space-y-6">
          {/* Filters and Categories */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Spenders</h3>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={spenderFilters.category}
                  onChange={(e) => setSpenderFilters({ ...spenderFilters, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="top5">Top 5</option>
                  <option value="top10">Top 10</option>
                  <option value="top50">Top 50</option>
                  <option value="min20k">Min ₦20k</option>
                  <option value="below20k">Below ₦20k</option>
                </select>
              </div>
            </div>
          </div>

          {/* Top Spenders List and Bulk Messaging */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
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
                      {displayTopSpenders.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="px-6 py-12 text-center text-gray-500">No top spenders found.</td>
                        </tr>
                      ) : (
                        displayTopSpenders.map((c) => (
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
              </div>

              {/* Bulk Message Composer */}
              <div className="lg:col-span-1">
                <h3 className="text-md font-semibold text-gray-900 mb-2">Message Top Spenders</h3>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your WhatsApp message to top spenders..."
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>{message.length}/1000</span>
                  <span>{selectedCustomers.length} selected</span>
                </div>
                <div className="flex justify-end mt-3">
                  <button
                    onClick={handleSendToTopSpenders}
                    disabled={isLoading || !message.trim() || selectedCustomers.length === 0}
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
                        Send to Top Spenders
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default MessagesPage;