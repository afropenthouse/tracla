'use client'
import { useState, useEffect } from 'react';
import { 
  MessageSquare, Send, Users, Clock, CheckCircle, XCircle, 
  Loader2, Filter, Search, Calendar, RefreshCw, AlertCircle
} from 'lucide-react';
import { sendBulkMessage, sendBulkMessageToAll, getMessageHistory, getTermiiBalance } from '@/lib/api';
import { useCustomersData } from '@/lib/queries/branch';
import { useBusinessStore } from '@/store/store';

const MessagesPage = () => {
  const [activeTab, setActiveTab] = useState('send'); // 'send' or 'history'
  const [messageType, setMessageType] = useState('all'); // 'all', 'selected'
  const [message, setMessage] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [messageHistory, setMessageHistory] = useState([]);
  const [termiiBalance, setTermiiBalance] = useState(null);
  const [historyFilters, setHistoryFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });

  const { business } = useBusinessStore();
  const businessId = business?.id;



  const { data: customersResponse, isLoading: customersLoading, error: customersError } = useCustomersData({ page: 1, limit: 50 });
  const customers = customersResponse?.customers || [];

  useEffect(() => {
    if (!businessId) return;
    if (activeTab === 'history') {
      fetchMessageHistory();
    }
    fetchTermiiBalance();
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

  const fetchTermiiBalance = async () => {
    try {
      const result = await getTermiiBalance(businessId);
      if (result.success) {
        setTermiiBalance(result.data.balance);
      }
    } catch (error) {
      console.error('Error fetching Termii balance:', error);
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
        fetchTermiiBalance(); // Refresh balance
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

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">WhatsApp Messages</h1>
            <p className="text-gray-600">Send bulk WhatsApp messages to your customers via Termii</p>
          </div>
          {termiiBalance !== null && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm text-blue-600 font-medium">Termii Balance</p>
                  <p className="text-lg font-bold text-blue-800">₦{termiiBalance?.toLocaleString()}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

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
                    {customersLoading ? (
                      <div className="col-span-1 md:col-span-2 lg:col-span-3 flex items-center justify-center py-6 text-gray-500 text-sm">
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading customers...
                      </div>
                    ) : customers.length === 0 ? (
                      <div className="col-span-1 md:col-span-2 lg:col-span-3 py-6 text-gray-500 text-sm">No customers found.</div>
                    ) : (
                      customers.map((customer) => (
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
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Message History</h3>
              <button
                onClick={fetchMessageHistory}
                className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={historyFilters.status}
                  onChange={(e) => setHistoryFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="sent">Sent</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
                <input
                  type="date"
                  value={historyFilters.dateFrom}
                  onChange={(e) => setHistoryFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
                <input
                  type="date"
                  value={historyFilters.dateTo}
                  onChange={(e) => setHistoryFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <input
                  type="text"
                  placeholder="Phone number..."
                  value={historyFilters.search}
                  onChange={(e) => setHistoryFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Message History Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
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
    </div>
  );
};

export default MessagesPage;