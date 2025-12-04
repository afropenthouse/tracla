"use client";

import { useEffect, useState } from 'react';
import { useSubscriptionStore, useCurrentPlanStore, useBusinessStore } from '@/store/store';
import { usePaymentModalStore } from '@/store/modalStore';
import { usePathname } from 'next/navigation';

const TrialBanner = () => {
  const pathname = usePathname();
  const { getTierName } = useCurrentPlanStore();
  const { business } = useBusinessStore();
  const { ensureTrialInitialized, getTrialRemainingMs, trialEndsAt, dismissTrialModalLonger } = useSubscriptionStore();
  const { onOpen } = usePaymentModalStore();
  const [remaining, setRemaining] = useState(0);

  useEffect(() => {
    const excluded = ['/login', '/signup', '/email-verification', '/onboarding', '/forgot-password', '/reset-password'];
    const shouldExclude = excluded.some(p => pathname.startsWith(p)) || pathname === '/';
    if (shouldExclude) return;

    const tier = getTierName() || business?.currentTier;
    if (!tier || tier.toLowerCase() !== 'basic') return;

    ensureTrialInitialized();
    setRemaining(getTrialRemainingMs());

    const interval = setInterval(() => {
      setRemaining(getTrialRemainingMs());
    }, 1000);

    return () => clearInterval(interval);
  }, [pathname, getTierName, business, ensureTrialInitialized, getTrialRemainingMs]);

  if (!trialEndsAt) return null;
  if (remaining <= 0) return null;

  const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
  const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white/90 backdrop-blur-xl border border-[#6c0f2a]/20 shadow-xl rounded-2xl p-4 w-[92vw] max-w-sm">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-[#6c0f2a] rounded-xl flex items-center justify-center text-white font-bold">14</div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-gray-900">Free trial active</p>
          <p className="text-xs text-gray-600">{days}d {hours}h {minutes}m remaining</p>
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <button
          onClick={() => { dismissTrialModalLonger(); onOpen(); }}
          className="flex-1 bg-[#6c0f2a] text-white px-3 py-2 rounded-lg text-sm hover:bg-[#5a0d23]"
        >
          Upgrade now
        </button>
        <a
          href="#"
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
        >
          Later
        </a>
      </div>
    </div>
  );
};

export default TrialBanner;
