'use client'
import { useState, useEffect, useMemo } from 'react';
import { 
  MessageSquare, Send, Users, CheckCircle, XCircle,
  Loader2, Search, Wallet, X, PlusCircle
} from 'lucide-react';
import { sendBulkMessage, sendBulkMessageToAll, /* getMessageHistory, */ getMessageWallet, initializeTopUp, verifyTopUp, sendMessageToExternalRecipients } from '@/lib/api';
import { useCustomersData } from '@/lib/queries/branch';
import { useBusinessStore } from '@/store/store';


const MessagesPage = () => {
  const [activeTab, setActiveTab] = useState('send'); // 'send' | 'history'
  const [messageType, setMessageType] = useState('all'); // 'all', 'selected', 'topspenders'
  const [message, setMessage] = useState('');
  const [selectedCustomers, setSelectedCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [externalRecipients, setExternalRecipients] = useState([]);
  const [externalPhoneInput, setExternalPhoneInput] = useState('');
  // Removed Message History state
  // const [messageHistory, setMessageHistory] = useState([]);
  // const [historyFilters, setHistoryFilters] = useState({
  //   status: '',
  //   dateFrom: '',
  //   dateTo: '',
  //   search: ''
  // });

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
  const [topUpMessages] = useState(100);
  const [topUpAmount, setTopUpAmount] = useState(1000);
  const [balance, setBalance] = useState(0);
  const PRICE_PER_MESSAGE = 10; // ₦10 per message
  const computedTopUpAmount = topUpMode === 'messages' ? topUpMessages * PRICE_PER_MESSAGE : topUpAmount;
  const computedTopUpMessages = topUpMode === 'amount' ? Math.floor(topUpAmount / PRICE_PER_MESSAGE) : topUpMessages;

  // Wallet state
  const [wallet, setWallet] = useState(null);
  const [walletLoading, setWalletLoading] = useState(false);

  // Top-up flow state
  const [isInitializingTopUp, setIsInitializingTopUp] = useState(false);
  const [paystackRef, setPaystackRef] = useState('');
  const [paystackAuthUrl, setPaystackAuthUrl] = useState('');
  const [isVerifyingTopUp, setIsVerifyingTopUp] = useState(false);
  const [topUpStatus, setTopUpStatus] = useState('');
  const [topUpError, setTopUpError] = useState('');

  const { business } = useBusinessStore();
  const businessId = business?.id;
  // Pagination for selected customers list
  const [customersPage, setCustomersPage] = useState(1);
  const CUSTOMERS_PER_PAGE = 10;
  // Debounce search to avoid excessive network calls while keeping instant UI filtering
  const [debouncedSpenderSearch, setDebouncedSpenderSearch] = useState(spenderFilters.search);
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSpenderSearch(spenderFilters.search), 400);
    return () => clearTimeout(t);
  }, [spenderFilters.search]);
  // When searching by phone, fetch a larger page so results span across all pages
  const customersLimit = debouncedSpenderSearch ? 1000 : CUSTOMERS_PER_PAGE;
  const { data: customersResponse, isLoading: customersLoading, error: customersError, refetch: refetchCustomers } = useCustomersData({ page: customersPage, limit: customersLimit, search: debouncedSpenderSearch, scope: 'business' });
  // Reset to first page whenever debounced search changes
  useEffect(() => {
    setCustomersPage(1);
  }, [debouncedSpenderSearch]);
  // Use backend customers directly. If the API returns no customers, show an empty list.
  const sourceCustomers = customersResponse?.customers || [];

  useEffect(() => {
    if (!businessId) return;
    // removed: history fetch
    // Always refresh wallet when business or tab changes
    fetchBalance();
    // Ensure customers are refetched when business/tab changes so selected customers panel has fresh data
    try {
      if (typeof refetchCustomers === 'function') refetchCustomers();
    } catch (e) {
      console.error('Failed to refetch customers on business/tab change', e);
    }
  }, [activeTab, businessId]);

  const fetchBalance = async () => {
    if (!businessId) {
      setWallet(null);
      setBalance(0);
      return;
    }
    setWalletLoading(true);
    try {
      const result = await getMessageWallet(businessId);
      if (result?.success) {
        const payload = result.data?.data ?? result.data; // backend wraps in { message, data }
        setWallet(payload || null);
        const currentBalanceMsgs = (payload?.balanceMessages ?? 0);
        // Derive approximate Naira value for display purposes
        setBalance(currentBalanceMsgs * PRICE_PER_MESSAGE);
      } else {
        setWallet(null);
        setBalance(0);
      }
    } catch (error) {
      console.error('Error fetching message wallet:', error);
      setWallet(null);
      setBalance(0);
    } finally {
      setWalletLoading(false);
    }
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

      // Normalize text to avoid unsupported SMS characters (e.g., curly quotes becoming ?)
      const normalize = (s) => (s || '')
        .replace(/[’‘]/g, "'")
        .replace(/[“”]/g, '"')
        .replace(/[–—]/g, '-')
        .replace(/\u00A0/g, ' ');
      const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      const businessNameRaw = business?.name?.trim() || '';
      const businessName = normalize(businessNameRaw);
      const baseMessage = normalize(message.trim());
      const prefixRegex = businessName ? new RegExp(`^\\s*${escapeRegExp(businessName)}\\s*:`, 'i') : null;
      const alreadyPrefixed = prefixRegex ? prefixRegex.test(baseMessage) : false;
      const payloadMessage = alreadyPrefixed ? baseMessage : `${businessName ? `${businessName}: ` : ''}${baseMessage}`;

      // Pre-check wallet credits for selected customers to show top-up modal proactively
      if (messageType !== 'all') {
        const requiredCredits = messageType === 'external' ? externalRecipients.length : selectedCustomers.length;
        const availableCredits = wallet?.balanceMessages ?? 0;
        if (requiredCredits > 0 && availableCredits < requiredCredits) {
          setSendResult({ error: `Insufficient message credits. Required: ${requiredCredits}, Available: ${availableCredits}. Please top up your wallet.` });
          setShowResultModal(true);
          setShowTopUpModal(true);
          setIsLoading(false);
          return;
        }
      }
      
      if (messageType === 'all') {
        result = await sendBulkMessageToAll(businessId, payloadMessage);
      } else if (messageType === 'external') {
        if (externalRecipients.length === 0) {
          alert('Please add at least one external recipient');
          setIsLoading(false);
          return;
        }
        result = await sendMessageToExternalRecipients(businessId, externalRecipients, payloadMessage);
      } else {
        if (selectedCustomers.length === 0) {
          alert('Please select at least one customer');
          setIsLoading(false);
          return;
        }
        result = await sendBulkMessage(businessId, selectedCustomers, payloadMessage);
      }

      if (result.success) {
        // Show modal with summary from backend
        setSendResult(result.data);
        setShowResultModal(true);
        setMessage('');
        setSelectedCustomers([]);
        // Refresh wallet balance after successful send
        try { await fetchBalance(); } catch (e) { console.warn('Failed to refresh wallet after send', e); }
      } else {
        // Show error in modal
        setSendResult({ error: result.error });
        setShowResultModal(true);
        // If backend indicates insufficient credits, open top-up modal automatically
        if (/Insufficient message credits|INSUFFICIENT_CREDITS/i.test(result.error || '')) {
          setShowTopUpModal(true);
        }
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

  // removed: getStatusIcon helper

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

  const handleConfirmTopUp = async () => {
    try {
      setTopUpError('');
      setTopUpStatus('');
      setIsInitializingTopUp(true);

      const amountNaira = computedTopUpAmount; // Naira
      if (!amountNaira || amountNaira < PRICE_PER_MESSAGE) {
        setTopUpError(`Amount must be at least ₦${PRICE_PER_MESSAGE}`);
        setIsInitializingTopUp(false);
        return;
      }

      const res = await initializeTopUp(amountNaira);
      if (res?.success) {
        const payload = res.data?.data ?? res.data; // ResponseHandler wraps data
        const authUrl = payload?.authorization_url;
        const ref = payload?.reference;
        if (authUrl) setPaystackAuthUrl(authUrl);
        if (ref) setPaystackRef(ref);
        setTopUpStatus('Top-up initialized. Please complete payment, then click Verify Top Up.');
        try { if (authUrl) window.open(authUrl, '_blank'); } catch (e) {}
      } else {
        setTopUpError(res?.error || 'Failed to initialize top-up');
      }
    } catch (e) {
      console.error('Initialize top-up error:', e);
      setTopUpError('Failed to initialize top-up. Please try again.');
    } finally {
      setIsInitializingTopUp(false);
    }
  };

  const handleVerifyTopUp = async () => {
    try {
      setTopUpError('');
      setTopUpStatus('');
      setIsVerifyingTopUp(true);

      if (!paystackRef) {
        setTopUpError('Missing payment reference.');
        setIsVerifyingTopUp(false);
        return;
      }

      const res = await verifyTopUp(paystackRef);
      if (res?.success) {
        const msg = res.data?.message || 'Top-up verified successfully.';
        setTopUpStatus(msg);
        await fetchBalance();
        // Reset reference and auth URL after successful verification
        setPaystackAuthUrl('');
        setPaystackRef('');
        setShowTopUpModal(false);
        // Optionally, show a brief confirmation somewhere (toast if available)
      } else {
        setTopUpError(res?.error || 'Failed to verify top-up');
      }
    } catch (e) {
      console.error('Verify top-up error:', e);
      setTopUpError('Failed to verify top-up. Please try again.');
    } finally {
      setIsVerifyingTopUp(false);
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
            <div className="flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200">
              <Wallet className="w-4 h-4 text-emerald-700" />
              <span className="text-xs text-emerald-700">Balance: <span className="text-sm font-bold text-emerald-800">₦{(balance || 0).toLocaleString()}</span></span>
              <span className="ml-2 text-xs text-gray-600">{(wallet?.balanceMessages ?? 0).toLocaleString()}/{(wallet?.totalTopUpMsgs ?? (wallet?.balanceMessages ?? 0)).toLocaleString()} messages</span>
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

            {topUpError && (
              <div className="mt-4 text-sm text-red-600">{topUpError}</div>
            )}
            {topUpStatus && (
              <div className="mt-2 text-sm text-green-700">{topUpStatus}</div>
            )}

            <div className="mt-6 flex items-center justify-end gap-2">
              {paystackAuthUrl && (
                <button
                  onClick={() => {
                    try { window.open(paystackAuthUrl, '_blank'); } catch (e) {}
                  }}
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                >
                  Open Payment Page
                </button>
              )}
              {paystackRef && (
                <button
                  onClick={handleVerifyTopUp}
                  disabled={isVerifyingTopUp}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                >
                  {isVerifyingTopUp ? 'Verifying...' : 'Verify Top Up'}
                </button>
              )}
              {!paystackRef && (
                <button
                  onClick={handleConfirmTopUp}
                  disabled={isInitializingTopUp}
                  className="px-4 py-2 bg-[#6d0e2b] text-white rounded-lg hover:opacity-90 transition-colors disabled:opacity-50"
                >
                  {isInitializingTopUp ? 'Initializing...' : 'Confirm Top Up'}
                </button>
              )}
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
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="messageType"
                    value="external"
                    checked={messageType === 'external'}
                    onChange={(e) => setMessageType(e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">External Numbers</span>
                </label>
              </div>

              {/* External Numbers input and list */}
              {messageType === 'external' && (
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="tel"
                      value={externalPhoneInput}
                      onChange={(e) => setExternalPhoneInput(e.target.value)}
                      placeholder="Enter Nigerian number e.g. 09012345678"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                    />
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#6d0e2b] text-white text-sm"
                      onClick={() => {
                        const raw = (externalPhoneInput || '').trim();
                        if (!raw) return;
                        const digits = raw.replace(/\D/g, '');
                        if (!/^0\d{10}$/.test(digits) && !/^0\d{9}$/.test(digits)) {
                          alert('Please enter a valid Nigerian phone number starting with 0 (e.g., 09012345678)');
                          return;
                        }
                        setExternalRecipients((prev) => (prev.includes(digits) ? prev : [...prev, digits]));
                        setExternalPhoneInput('');
                      }}
                    >
                      <PlusCircle className="w-4 h-4" /> Add recipient
                    </button>
                  </div>
                  {externalRecipients.length > 0 && (
                    <div className="mt-3">
                      <div className="flex flex-wrap gap-2">
                        {externalRecipients.map((pn) => (
                          <span key={pn} className="inline-flex items-center gap-2 px-2 py-1 border border-gray-200 rounded-full text-sm">
                            {pn}
                            <button className="text-red-600" onClick={() => setExternalRecipients((prev) => prev.filter((x) => x !== pn))}>
                              <X className="w-4 h-4" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <p className="text-sm text-blue-600 mt-2">{externalRecipients.length} recipient(s) added</p>
                    </div>
                  )}
                </div>
              )}

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
                  {/* First row: Search + Date range */}
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                      <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5">
                        <Search className="w-4 h-4 text-gray-500" />
                        <input
                          type="tel"
                          value={spenderFilters.search}
                          onChange={(e) => setSpenderFilters({ ...spenderFilters, search: e.target.value })}
                          placeholder="Search phone"
                          className="bg-transparent outline-none w-full text-sm"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                      <input
                        type="date"
                        value={spenderFilters.dateFrom}
                        onChange={(e) => setSpenderFilters({ ...spenderFilters, dateFrom: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                      <input
                        type="date"
                        value={spenderFilters.dateTo}
                        onChange={(e) => setSpenderFilters({ ...spenderFilters, dateTo: e.target.value })}
                        className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm"
                      />
                    </div>
                  </div>

                  {/* Second row: Amount Range + Actions */}
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4 items-center mt-2">
                    <div className="md:col-span-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Amount Range (₦)</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          value={spenderFilters.minAmount}
                          onChange={(e) => setSpenderFilters({ ...spenderFilters, minAmount: e.target.value })}
                          placeholder="Min"
                          className="w-28 md:w-36 lg:w-44 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                        <span className="text-gray-500">-</span>
                        <input
                          type="number"
                          value={spenderFilters.maxAmount}
                          onChange={(e) => setSpenderFilters({ ...spenderFilters, maxAmount: e.target.value })}
                          placeholder="Max"
                          className="w-28 md:w-36 lg:w-44 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                        />
                      </div>
                    </div>
                    <div className="md:col-span-2 flex justify-end gap-2">
                      <button
                        className="px-3 py-2 rounded-lg bg-[#6d0e2b] text-white text-sm"
                        onClick={() => {
                          // Toggle select/deselect for currently visible (filtered) customers
                          const visibleIds = (topSpenders || []).map((c) => c.id);
                          const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedCustomers.includes(id));
                          if (allSelected) {
                            // Deselect only the currently visible ones
                            setSelectedCustomers((prev) => prev.filter((id) => !visibleIds.includes(id)));
                          } else {
                            // Select all currently visible
                            const merged = Array.from(new Set([...(selectedCustomers || []), ...visibleIds]));
                            setSelectedCustomers(merged);
                          }
                        }}
                      >
                        {(() => {
                          const visibleIds = (topSpenders || []).map((c) => c.id);
                          const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedCustomers.includes(id));
                          return allSelected ? 'Deselect' : 'Select All';
                        })()}
                      </button>
                      <button
                        className="px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm"
                        onClick={() => {
                          // Clear only date and amount range filters, keep search text intact
                          setSpenderFilters({ ...spenderFilters, dateFrom: '', dateTo: '', minAmount: '', maxAmount: '' });
                        }}
                      >
                        Clear Filters
                      </button>
                    </div>
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
                <span className="text-xs text-emerald-700">Balance: <span className="text-sm font-bold text-emerald-800">₦{(balance || 0).toLocaleString()}</span></span>
                <span className="ml-2 text-xs text-gray-600">{(wallet?.balanceMessages ?? 0).toLocaleString()}/{(wallet?.totalTopUpMsgs ?? (wallet?.balanceMessages ?? 0)).toLocaleString()} messages</span>
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
                disabled={isLoading || !message.trim() || (messageType === 'external' ? externalRecipients.length === 0 : (messageType !== 'all' && selectedCustomers.length === 0))}
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