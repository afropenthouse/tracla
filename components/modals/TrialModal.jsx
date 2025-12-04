"use client";

import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Crown, BarChart3, Sparkles, Filter } from 'lucide-react';
import { useTrialModalStore, usePaymentModalStore } from '@/store/modalStore';
import { useSubscriptionStore } from '@/store/store';

const TrialModal = () => {
  const { isOpen, onClose } = useTrialModalStore();
  const { onOpen: openPayment } = usePaymentModalStore();
  const {
    trialStartsAt,
    trialEndsAt,
    getTrialRemainingMs,
    updateLastTrialModalShown,
    dismissTrialModalLonger,
  } = useSubscriptionStore();

  const [remaining, setRemaining] = useState(getTrialRemainingMs());

  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => setRemaining(getTrialRemainingMs()), 1000);
    return () => clearInterval(interval);
  }, [isOpen, getTrialRemainingMs]);

  const metrics = useMemo(() => {
    const totalMs = (trialEndsAt || 0) - (trialStartsAt || 0);
    const pct = totalMs > 0 ? Math.max(0, Math.min(100, ((totalMs - remaining) / totalMs) * 100)) : 0;
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    return { pct, days, hours, minutes };
  }, [remaining, trialStartsAt, trialEndsAt]);

  const featureItems = [
    { icon: BarChart3, text: 'Customer dashboard and spending analytics' },
    { icon: Sparkles, text: 'Identify and reward top spenders' },
    { icon: Filter, text: 'Filters and segmentation tools' },
  ];

  const handleClose = () => {
    updateLastTrialModalShown();
    onClose();
  };

  const handleRemindLater = () => {
    dismissTrialModalLonger();
    onClose();
  };

  const handleUpgrade = () => {
    // Prevent immediate re-open from trigger cadence
    dismissTrialModalLonger();
    onClose();
    openPayment();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 16 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 z-50 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-gray-200/50">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 bg-[#6c0f2a] rounded-xl flex items-center justify-center text-white">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">You’re on a 14‑day free trial</h2>
                  <p className="text-sm text-gray-600">Unlock core features during your trial</p>
                </div>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-5 space-y-5">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-[#6c0f2a]" />
                <p className="text-sm text-gray-700">
                  {metrics.days}d {metrics.hours}h {metrics.minutes}m remaining
                </p>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#6c0f2a] transition-all"
                  style={{ width: `${metrics.pct}%` }}
                />
              </div>

              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <ul className="text-sm text-gray-800 space-y-3">
                  {featureItems.map(({ icon: Icon, text }, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <div className="w-7 h-7 bg-[#6c0f2a]/10 text-[#6c0f2a] rounded-lg flex items-center justify-center">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span>{text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleRemindLater}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Later
                </button>
                <button
                  onClick={handleUpgrade}
                  className="flex-1 bg-[#6c0f2a] text-white px-4 py-2 rounded-lg hover:bg-[#5a0d23]"
                >
                  Upgrade now
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default TrialModal;
