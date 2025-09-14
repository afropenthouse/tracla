"use client";

import { useEffect } from 'react';
import { usePaymentModalStore } from '@/store/modalStore';
import { useSubscriptionStore } from '@/store/store';
import { usePathname } from 'next/navigation';

const PaymentModalTrigger = () => {
  const { onOpen } = usePaymentModalStore();
  const { shouldShowPaymentModal, updateLastPaymentModalShown } = useSubscriptionStore();
  const pathname = usePathname();

  useEffect(() => {
    // Don't show modal on authentication pages, landing page, or onboarding
    const excludedPaths = ['/login', '/signup', '/email-verification', '/onboarding', '/', '/forgot-password', '/reset-password'];
    const shouldExclude = excludedPaths.some(path => pathname.startsWith(path));
    
    if (shouldExclude) {
      return;
    }

    // Set up interval to check every 5 seconds
    const intervalId = setInterval(() => {
      if (shouldShowPaymentModal()) {
        onOpen();
        updateLastPaymentModalShown();
      }
    }, 5000);

    // Also check immediately when component mounts (after 5 seconds delay)
    const timeoutId = setTimeout(() => {
      if (shouldShowPaymentModal()) {
        onOpen();
        updateLastPaymentModalShown();
      }
    }, 5000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [pathname, shouldShowPaymentModal, onOpen, updateLastPaymentModalShown]);

  return null; // This component doesn't render anything
};

export default PaymentModalTrigger;