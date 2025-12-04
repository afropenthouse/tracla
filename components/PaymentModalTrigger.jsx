"use client";

import { useEffect } from 'react';
import { usePaymentModalStore, useTrialModalStore } from '@/store/modalStore';
import { useCurrentPlanStore, useSubscriptionStore, useBusinessStore } from '@/store/store';
import { usePathname } from 'next/navigation';

const PaymentModalTrigger = () => {
  const { onOpen, isOpen } = usePaymentModalStore();
  const { onOpen: openTrialModal } = useTrialModalStore();
  const { getTierName } = useCurrentPlanStore();
  const { business } = useBusinessStore();
  const { ensureTrialInitialized, getTrialRemainingMs } = useSubscriptionStore();
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

    // Check if user has basic plan - if so, show modal after trial ends
    const currentTier = getTierName() || business?.currentTier;
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

    // Initialize trial
    if (isBasicPlan) ensureTrialInitialized();

    const trialRemaining = getTrialRemainingMs();

    // Show trial modal during trial if cadence allows
    if (isBasicPlan && trialRemaining > 0 && !isOpen) {
      try {
        const shouldShow = require('@/store/store').useSubscriptionStore.getState().shouldShowTrialModal?.();
        if (shouldShow) openTrialModal();
      } catch (e) {}
    }

    // Show payment modal when trial is over
    const timeoutId = setTimeout(() => {
      if (!isOpen && isBasicPlan && trialRemaining <= 0) {
        console.log('🚀 OPENING PAYMENT MODAL FOR BASIC PLAN');
        onOpen();
      }
    }, 1000); //1000 -time

    return () => {
      clearTimeout(timeoutId);
    };
  }, [pathname, onOpen, getTierName, business, isOpen]);

  return null; // This component doesn't render anything
};

export default PaymentModalTrigger;
