'use client'
import { useState, useEffect } from 'react';
import { X, MessageSquare, Send, Loader2, Wallet, PlusCircle } from 'lucide-react';
import { useBusinessStore } from '@/store/store';
import { useToastStore } from '@/store/toastStore';
import { sendSingleMessage as sendSingleMessageApi, initializeTopUp, verifyTopUp, getMessageWallet } from '@/lib/api';

const MessageModal = ({ isOpen, onClose, customer, onSend }) => {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Wallet & Top Up state
  const [wallet, setWallet] = useState(null);
  const [balance, setBalance] = useState(0); // Naira equivalent
  const PRICE_PER_MESSAGE = 10; // ₦10 per message

  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [topUpMode, setTopUpMode] = useState('messages'); // 'messages' | 'amount'
  const [topUpMessages, setTopUpMessages] = useState(100);
  const [topUpAmount, setTopUpAmount] = useState(1000);
  const computedTopUpAmount = topUpMode === 'messages' ? topUpMessages * PRICE_PER_MESSAGE : topUpAmount;
  const computedTopUpMessages = topUpMode === 'amount' ? Math.floor(topUpAmount / PRICE_PER_MESSAGE) : topUpMessages;

  const [isInitializingTopUp, setIsInitializingTopUp] = useState(false);
  const [isVerifyingTopUp, setIsVerifyingTopUp] = useState(false);
  const [paystackAuthUrl, setPaystackAuthUrl] = useState('');
  const [paystackRef, setPaystackRef] = useState('');
  const [topUpError, setTopUpError] = useState('');
  const [topUpStatus, setTopUpStatus] = useState('');

  const { business } = useBusinessStore();
  const { showSuccess, showError } = useToastStore();

  // Fetch wallet when modal opens
  useEffect(() => {
    const fetchWallet = async () => {
      try {
        setBalance(0);
        if (!business?.id) return;
        const result = await getMessageWallet(business.id);
        if (result.success) {
          const payload = result.data?.data || result.data; // support both shapes
          setWallet(payload);
          const currentBalanceMsgs = payload?.balanceMessages ?? 0;
          setBalance(currentBalanceMsgs * PRICE_PER_MESSAGE);
        } else {
          setWallet(null);
          setBalance(0);
        }
      } catch (e) {
        setWallet(null);
        setBalance(0);
      }
    };
    if (isOpen) fetchWallet();
  }, [isOpen, business?.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    // Pre-check wallet credits for single message
    const availableCredits = wallet?.balanceMessages ?? 0;
    if (availableCredits < 1) {
      showError?.('Insufficient message credits. Please top up your wallet.');
      setShowTopUpModal(true);
      return;
    }

    setIsLoading(true);
    try {
      const payloadMessage = message.trim();
      if (onSend) {
        await onSend(customer, payloadMessage);
      } else {
        const businessId = business?.id;
        if (!businessId || !customer?.id) {
          throw new Error('Missing business or customer identification');
        }
        const result = await sendSingleMessageApi(businessId, customer.id, payloadMessage);
        if (!result?.success) {
          throw new Error(result?.error || 'Failed to send message');
        }
        showSuccess?.('Message sent successfully');
      }
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Failed to send message:', error);
      showError?.(error?.message || 'Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      setMessage('');
      onClose();
    }
  };

  // Top Up handlers
  const handleConfirmTopUp = async () => {
    setTopUpError('');
    setTopUpStatus('');
    setIsInitializingTopUp(true);
    try {
      const amountNaira = computedTopUpAmount;
      const res = await initializeTopUp(amountNaira);
      if (res.success) {
        const data = res.data?.data || res.data;
        setPaystackAuthUrl(data?.authorization_url || '');
        setPaystackRef(data?.reference || '');
        setTopUpStatus('Top up initialized. Open the payment page to complete.');
      } else {
        setTopUpError(res.error || 'Failed to initialize top-up');
      }
    } catch (e) {
      setTopUpError('Failed to initialize top-up');
    } finally {
      setIsInitializingTopUp(false);
    }
  };

  const handleVerifyTopUp = async () => {
    setTopUpError('');
    setTopUpStatus('');
    setIsVerifyingTopUp(true);
    try {
      const res = await verifyTopUp(paystackRef);
      if (res.success) {
        setTopUpStatus('Top up verified successfully. Your wallet has been credited.');
        setPaystackRef('');
        setPaystackAuthUrl('');
        // Refresh wallet
        try {
          const result = await getMessageWallet(business.id);
          if (result.success) {
            const payload = result.data?.data || result.data;
            setWallet(payload);
            const currentBalanceMsgs = payload?.balanceMessages ?? 0;
            setBalance(currentBalanceMsgs * PRICE_PER_MESSAGE);
          }
        } catch (e) {}
      } else {
        setTopUpError(res.error || 'Failed to verify top-up');
      }
    } catch (e) {
      setTopUpError('Failed to verify top-up');
    } finally {
      setIsVerifyingTopUp(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-white/10 backdrop-blur-xl flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Send Message</h3>
              <p className="text-sm text-gray-600">To: {customer?.phoneNumber || customer?.customerPhone}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowTopUpModal(true)}
              className="px-3 py-2 bg-[#6d0e2b] text-white rounded-lg hover:opacity-90 transition-colors flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Top Up
            </button>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-4">
            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message here..."
              rows={4}
              maxLength={1000}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isLoading}
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              {message.length}/1000 characters
            </p>
          </div>

          {/* Balance row moved below message for clearer layout - single horizontal line */}
          <div className="mb-4">
            <div className="flex items-center gap-4 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 w-full">
              <Wallet className="w-4 h-4 text-emerald-700" />
              <span className="text-xs text-emerald-700">Balance</span>
              <span className="text-sm font-bold text-emerald-800">₦{(balance || 0).toLocaleString()}</span>
              <span className="ml-auto text-xs text-gray-600">{wallet?.balanceMessages ?? 0} messages</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              disabled={isLoading}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading || !message.trim()}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Send Message
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Top Up Modal */}
      {showTopUpModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
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
    </div>
  );
};

export default MessageModal;