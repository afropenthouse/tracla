"use client";

import { useEffect } from 'react';
import { usePaymentModalStore } from '@/store/modalStore';
import { useCurrentPlanStore } from '@/store/store';
import { usePathname } from 'next/navigation';

const PaymentModalTrigger = () => {
  const { onOpen, isOpen } = usePaymentModalStore();
  const { getTierName } = useCurrentPlanStore();
  const pathname = usePathname();

  useEffect(() => {
    // Don't show modal on authentication pages, landing page, or onboarding
    const excludedPaths = ['/login', '/signup', '/email-verification', '/onboarding', '/forgot-password', '/reset-password'];
    const shouldExclude = excludedPaths.some(path => pathname.startsWith(path)) || pathname === '/';
    
    console.log('🔍 Path Check:', {
      pathname,
      excludedPaths,
      shouldExclude,
      startsWithLogin: pathname.startsWith('/login'),
      startsWithDashboard: pathname.startsWith('/dashboard')
    });
    
    if (shouldExclude) {
      console.log('🚫 Modal excluded on path:', pathname);
      return;
    }

    // Check if user has basic plan - if so, show modal immediately
    const currentTier = getTierName();
    const isBasicPlan = currentTier && currentTier.toLowerCase() === 'basic';
    
    console.log('🔍 Modal Trigger Debug:', {
      pathname,
      currentTier,
      isBasicPlan,
      isOpen
    });
    
    if (!isBasicPlan) {
      console.log('❌ Not a basic plan, skipping modal');
      return; // Don't set up interval for non-basic plans
    }

    // Show modal immediately for basic plan users (after 1 second)
    const timeoutId = setTimeout(() => {
      if (!isOpen) { // Only open if not already open
        console.log('🚀 OPENING PAYMENT MODAL FOR BASIC PLAN');
        onOpen();
      }
    }, 1000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [pathname, onOpen, getTierName, isOpen]);

  return null; // This component doesn't render anything
};

export default PaymentModalTrigger;