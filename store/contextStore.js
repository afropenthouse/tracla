import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useContextStore = create()(
  persist(
    (set, get) => ({
      availableContexts: [],
      user: null,
      
      setAvailableContexts: (contexts) => set({ availableContexts: contexts }),
      
      setUser: (user) => set({ user }),
      
      clearContexts: () => set({ availableContexts: [] }),
      
      clearUser: () => set({ user: null }),
      
      clearAll: () => set({ 
        availableContexts: [], 
        user: null 
      }),
      
      getContextById: (contextId) => {
        const { availableContexts } = get();
        return availableContexts.find(context => context.id === contextId);
      },
      
      getContextsByRole: (role) => {
        const { availableContexts } = get();
        return availableContexts.filter(context => context.role === role);
      },
      
      getContextsBySchool: (schoolId) => {
        const { availableContexts } = get();
        return availableContexts.filter(context => context.school.id === schoolId);
      },
      
      hasContexts: () => {
        const { availableContexts } = get();
        return availableContexts.length > 0;
      },
    }),
    {
      name: "contextStore", // Storage key
      // Only persist the contexts and user data, not derived state
      partialize: (state) => ({
        availableContexts: state.availableContexts,
        user: state.user,
      }),
    }
  )
);