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

// Branch Store
export const useBranchStore = create()(
  persist(
    (set) => ({
      branches: [],
      currentBranch: null,

      // Set all branches
      setBranches: (branches) => set({ branches }),

      // Add a branch
      addBranch: (branch) =>
        set((state) => ({
          branches: [...state.branches, branch],
        })),

      // Update a branch
      updateBranch: (updatedBranch) =>
        set((state) => ({
          branches: state.branches.map((branch) =>
            branch.id === updatedBranch.id
              ? { ...branch, ...updatedBranch }
              : branch
          ),
          currentBranch:
            state.currentBranch?.id === updatedBranch.id
              ? updatedBranch
              : state.currentBranch,
        })),

      // Remove a branch
      removeBranch: (branchId) =>
        set((state) => ({
          branches: state.branches.filter((branch) => branch.id !== branchId),
          currentBranch:
            state.currentBranch?.id === branchId ? null : state.currentBranch,
        })),

      // Set current branch
      setCurrentBranch: (branch) => set({ currentBranch: branch }),

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
