import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useSignUpEmailStore = create()(
  persist(
    (set) => ({
      clearEmail: () => set({ email: null }),
      email: "",
      setEmail: (email) => set({ email }),
    }),
    {
      name: "signUpEmail",
    }
  )
);

export const verificationIdStore = create()(
  persist(
    (set) => ({
      clearId: () => set({ id: null }),
      id: "",
      setId: (id) => set({ id }),
    }),
    {
      name: "verificationId",
    }
  )
);

// Business Store
export const useBusinessStore = create()(
  persist(
    (set) => ({
      business: null,

      // Set business data
      setBusiness: (business) => set({ business }),

      // Update business data
      updateBusiness: (updatedBusiness) =>
        set((state) => ({
          business: { ...state.business, ...updatedBusiness },
        })),

      // Clear business data
      clearBusiness: () => set({ business: null }),
    }),
    {
      name: "businessStore",
    }
  )
);

// Utility function to ensure www prefix in URLs
const ensureWwwPrefix = (url) => {
  if (!url || typeof url !== 'string') return url;
  
  try {
    const urlObj = new URL(url);
    
    // Skip if already has www or is localhost/IP
    if (urlObj.hostname.startsWith('www.') || 
        urlObj.hostname === 'localhost' ||
        /^\d+\.\d+\.\d+\.\d+$/.test(urlObj.hostname)) {
      return url;
    }
    
    // Add www prefix
    urlObj.hostname = `www.${urlObj.hostname}`;
    return urlObj.toString();
  } catch (error) {
    console.warn('Failed to process URL for www prefix:', url, error);
    return url;
  }
};

// Process branch data to ensure www in qrCodeUrl
const processBranchData = (branch) => {
  if (!branch) return branch;
  return {
    ...branch,
    qrCodeUrl: branch.qrCodeUrl ? ensureWwwPrefix(branch.qrCodeUrl) : branch.qrCodeUrl
  };
};

// Branch Store
export const useBranchStore = create()(
  persist(
    (set) => ({
      branches: [],
      currentBranch: null,

      // Set all branches
      setBranches: (branches) => set({ branches: branches.map(processBranchData) }),

      // Add a branch
      addBranch: (branch) =>
        set((state) => ({
          branches: [...state.branches, processBranchData(branch)],
        })),

      // Update a branch
      updateBranch: (updatedBranch) =>
        set((state) => {
          const processedBranch = processBranchData(updatedBranch);
          return {
            branches: state.branches.map((branch) =>
              branch.id === processedBranch.id
                ? { ...branch, ...processedBranch }
                : branch
            ),
            currentBranch:
              state.currentBranch?.id === processedBranch.id
                ? processedBranch
                : state.currentBranch,
          };
        }),

      // Remove a branch
      removeBranch: (branchId) =>
        set((state) => ({
          branches: state.branches.filter((branch) => branch.id !== branchId),
          currentBranch:
            state.currentBranch?.id === branchId ? null : state.currentBranch,
        })),

      // Set current branch
      setCurrentBranch: (branch) => set({ currentBranch: processBranchData(branch) }),

      // Clear all branches
      clearBranches: () =>
        set({
          branches: [],
          currentBranch: null,
        }),
    }),
    {
      name: "branchStore",
    }
  )
);

// Subscription Store
export const useSubscriptionStore = create()(
  persist(
    (set, get) => ({
      subscription: null,
      isSubscribed: false,
      plan: null,
      expiresAt: null,
      lastPaymentModalShown: null,
      dismissedUntil: null,

      // Set subscription data
      setSubscription: (subscription) => set({ 
        subscription,
        isSubscribed: !!subscription,
        plan: subscription?.plan || null,
        expiresAt: subscription?.expiresAt || null
      }),

      // Check if user is subscribed (for now, always false to show modal)
      checkSubscription: () => {
        const state = get();
        return state.isSubscribed;
      },

      // Update last modal shown timestamp
      updateLastPaymentModalShown: () => set({ 
        lastPaymentModalShown: Date.now() 
      }),

      // Dismiss modal for a longer period (1 hour)
      dismissPaymentModalLonger: () => set({
        lastPaymentModalShown: Date.now(),
        dismissedUntil: Date.now() + (60 * 60 * 1000) // 1 hour from now
      }),

      // Check if enough time has passed to show modal again
      shouldShowPaymentModal: () => {
        const state = get();
        if (state.isSubscribed) return false;
        
        const now = Date.now();
        const lastShown = state.lastPaymentModalShown;
        const dismissedUntil = state.dismissedUntil;
        
        // Don't show if dismissed until a future time
        if (dismissedUntil && now < dismissedUntil) return false;
        
        // Show modal if never shown or if 5 seconds have passed
        return !lastShown || (now - lastShown) >= 5000;
      },

      // Clear subscription data
      clearSubscription: () => set({ 
        subscription: null,
        isSubscribed: false,
        plan: null,
        expiresAt: null,
        lastPaymentModalShown: null,
        dismissedUntil: null
      }),
    }),
    {
      name: "subscriptionStore",
    }
  )
);
