"use client";

import React from 'react';
import { useSubscriptionStore } from '@/store/store';
import { usePaymentModalStore } from '@/store/modalStore';
import { Settings, Crown, Clock, Play } from 'lucide-react';

const SubscriptionDebugPanel = () => {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const { 
    isSubscribed, 
    plan,
    subscription,
    setSubscription, 
    clearSubscription, 
    lastPaymentModalShown,
    dismissedUntil,
    shouldShowPaymentModal,
    dismissPaymentModalLonger
  } = useSubscriptionStore();
  
  const { onOpen } = usePaymentModalStore();

  const handleToggleSubscription = () => {
    if (isSubscribed) {
      clearSubscription();
    } else {
      setSubscription({
        plan: 'growth',
        expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
        isActive: true
      });
    }
  };

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Never';
    return new Date(timestamp).toLocaleString();
  };

  const timeUntilNextModal = () => {
    if (!shouldShowPaymentModal()) {
      if (dismissedUntil && Date.now() < dismissedUntil) {
        const remaining = dismissedUntil - Date.now();
        const minutes = Math.floor(remaining / (1000 * 60));
        const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
        return `${minutes}m ${seconds}s (dismissed)`;
      }
      if (lastPaymentModalShown) {
        const elapsed = Date.now() - lastPaymentModalShown;
        const remaining = 5000 - elapsed;
        if (remaining > 0) {
          return `${Math.ceil(remaining / 1000)}s`;
        }
      }
    }
    return 'Ready to show';
  };

  return (
    <div></div>
  );
};

export default SubscriptionDebugPanel;