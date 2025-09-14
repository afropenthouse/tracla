import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useToastStore } from "@/store/toastStore";
import { useBranchStore, useBusinessStore } from "@/store/store";

const handleApiError = (error, defaultMessage = "An error occurred", showError = null) => {
  const response = error.response?.data;

  if (response) {
    // Handle your backend response format
    const message = response.message || response.error || defaultMessage;
    const httpStatusCode = error?.status; // This is the numeric HTTP code (403, 404, etc.)

    console.log(`Error Status Code: ${httpStatusCode}`);

    // Show error toast if showError function is provided
    if (showError) {
      showError(message);
    }

    // Return structured error info
    return {
      message,
      httpStatusCode,
      data: response.data || null,
      success: response.success || false,
    };
  }

  // Network or other errors
  let errorMessage = defaultMessage;
  if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
    errorMessage = "Request timeout. Please try again.";
  } else if (error.code === "ERR_NETWORK") {
    errorMessage = "Network error. Please check your connection.";
  }

  if (showError) {
    showError(errorMessage);
  }

  return { message: errorMessage, statusCode: "NETWORK_ERROR" };
};

// Query Keys Factory
export const branchKeys = {
  all: ["branches"],
  lists: () => [...branchKeys.all, "list"],
  list: (filters) => [...branchKeys.lists(), { filters }],
  details: () => [...branchKeys.all, "detail"],
  detail: (businessId, branchId) => [
    ...branchKeys.details(),
    businessId,
    branchId,
  ],
  stats: (businessId, branchId) => [
    ...branchKeys.detail(businessId, branchId),
    "stats",
  ],
  customers: (businessId, branchId, filters) => [
    ...branchKeys.detail(businessId, branchId),
    "customers",
    filters,
  ],
  purchases: (branchId, filters) => [
    ...branchKeys.detail(branchId),
    "purchases",
    filters,
  ],
  overview: (branchId, days) => [
    ...branchKeys.detail(branchId),
    "overview",
    days,
  ],
};

// Business Keys Factory
export const businessKeys = {
  all: ["businesses"],
  lists: () => [...businessKeys.all, "list"],
  detail: (businessId) => [...businessKeys.all, "detail", businessId],
  overview: (businessId, days) => [...businessKeys.detail(businessId), "overview", days],
  stats: (businessId) => [...businessKeys.detail(businessId), "stats"],
  customers: (businessId, filters) => [...businessKeys.detail(businessId), "customers", filters],
  purchases: (businessId, filters) => [...businessKeys.detail(businessId), "purchases", filters],
  businessesAndBranches: () => [...businessKeys.all, "businesses-and-branches"],
};

// Hook to fetch user's businesses and branches
export const useBusinessesAndBranches = (options = {}) => {
  return useQuery({
    queryKey: businessKeys.businessesAndBranches(),
    queryFn: async () => {
      const response = await api.get("/auth/businesses-and-branches");
      
      if (response.data.success) {
        return response.data.data;
      }
      
      throw new Error(response.data.message || "Failed to fetch businesses and branches");
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

// Context-aware overview hook - switches between business and branch endpoints
export const useOverviewData = (days = 30, options = {}) => {
  const { currentBranch } = useBranchStore();
  const { business } = useBusinessStore();
  
  const isBusinessView = !currentBranch;
  const queryKey = isBusinessView 
    ? businessKeys.overview(business?.id, days)
    : branchKeys.overview(currentBranch?.id, days);
    
  return useQuery({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (days) params.append("days", days.toString());
      
      if (isBusinessView) {
        if (!business?.id) {
          throw new Error("Business ID is required");
        }
        
        const response = await api.get(`/business/${business.id}/overview?${params.toString()}`);
        
        if (response.data.success) {
          return response.data.data.overview;
        }
        
        throw new Error(response.data.message || "Failed to fetch business overview");
      } else {
        if (!currentBranch?.id) {
          throw new Error("Branch ID is required");
        }
        
        const response = await api.get(`/branches/branch/${currentBranch.id}/overview?${params.toString()}`);
        
        if (response.data.success) {
          return response.data.data.overview;
        }
        
        throw new Error(response.data.message || "Failed to fetch branch overview");
      }
    },
    enabled: !!(isBusinessView ? business?.id : currentBranch?.id),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    ...options,
  });
};

// Context-aware customers hook - switches between business and branch endpoints
export const useCustomersData = (filters = {}, options = {}) => {
  const { currentBranch } = useBranchStore();
  const { business } = useBusinessStore();
  
  const isBusinessView = !currentBranch;
  const queryKey = isBusinessView 
    ? businessKeys.customers(business?.id, filters)
    : branchKeys.customers(business?.id, currentBranch?.id, filters);
    
  return useQuery({
    queryKey,
    queryFn: async () => {
      if (isBusinessView) {
        if (!business?.id) {
          throw new Error("Business ID is required");
        }
        
        const params = new URLSearchParams({
          page: filters.page?.toString() || "1",
          limit: filters.limit?.toString() || "10",
        });

        if (filters.search) params.append("search", filters.search);
        if (filters.minAmount) params.append("minAmount", filters.minAmount.toString());
        if (filters.maxAmount) params.append("maxAmount", filters.maxAmount.toString());
        if (filters.minVisits) params.append("minVisits", filters.minVisits.toString());
        if (filters.maxVisits) params.append("maxVisits", filters.maxVisits.toString());
        if (filters.sortBy) params.append("sortBy", filters.sortBy);
        if (filters.order) params.append("sortOrder", filters.order.toLowerCase());
        
        const response = await api.get(`/business/${business.id}/customers?${params.toString()}`);
        
        if (response.data.success) {
          return response.data.data;
        }
        
        throw new Error(response.data.message || "Failed to fetch business customers");
      } else {
        if (!currentBranch?.id) {
          throw new Error("Branch ID is required");
        }
        
        const params = new URLSearchParams({
          page: filters.page?.toString() || "1",
          limit: filters.limit?.toString() || "10",
        });

        if (filters.search) params.append("search", filters.search);
        if (filters.minAmount) params.append("minAmount", filters.minAmount.toString());
        if (filters.maxAmount) params.append("maxAmount", filters.maxAmount.toString());
        if (filters.minVisits) params.append("minVisits", filters.minVisits.toString());
        if (filters.maxVisits) params.append("maxVisits", filters.maxVisits.toString());
        if (filters.sortBy) params.append("sortBy", filters.sortBy);
        if (filters.order) params.append("sortOrder", filters.order.toLowerCase());
        
        const response = await api.get(`/branches/branch/${currentBranch.id}/customers?${params.toString()}`);
        
        if (response.data.success) {
          return response.data.data;
        }
        
        throw new Error(response.data.message || "Failed to fetch branch customers");
      }
    },
    enabled: !!(isBusinessView ? business?.id : currentBranch?.id),
    staleTime: 1 * 60 * 1000, // 1 minute
    keepPreviousData: true,
    ...options,
  });
};

// Context-aware purchases hook - switches between business and branch endpoints
export const usePurchasesData = (filters = {}, options = {}) => {
  const { currentBranch } = useBranchStore();
  const { business } = useBusinessStore();
  
  const isBusinessView = !currentBranch;
  const queryKey = isBusinessView 
    ? businessKeys.purchases(business?.id, filters)
    : branchKeys.purchases(currentBranch?.id, filters);
    
  return useQuery({
    queryKey,
    queryFn: async () => {
      if (isBusinessView) {
        if (!business?.id) {
          throw new Error("Business ID is required");
        }
        
        const params = new URLSearchParams({
          page: filters.page?.toString() || "1",
          limit: filters.limit?.toString() || "10",
        });

        if (filters.search) params.append("search", filters.search);
        if (filters.minAmount) params.append("minAmount", filters.minAmount.toString());
        if (filters.maxAmount) params.append("maxAmount", filters.maxAmount.toString());
        if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
        if (filters.dateTo) params.append("dateTo", filters.dateTo);
        if (filters.sortBy) params.append("sortBy", filters.sortBy);
        if (filters.order) params.append("sortOrder", filters.order.toLowerCase());
        
        const response = await api.get(`/business/${business.id}/purchases?${params.toString()}`);
        
        if (response.data.success) {
          return response.data.data;
        }
        
        throw new Error(response.data.message || "Failed to fetch business purchases");
      } else {
        if (!currentBranch?.id) {
          throw new Error("Branch ID is required");
        }
        
        const params = new URLSearchParams({
          page: filters.page?.toString() || "1",
          limit: filters.limit?.toString() || "10",
        });

        if (filters.search) params.append("search", filters.search);
        if (filters.minAmount) params.append("minAmount", filters.minAmount.toString());
        if (filters.maxAmount) params.append("maxAmount", filters.maxAmount.toString());
        if (filters.dateFrom) params.append("dateFrom", filters.dateFrom);
        if (filters.dateTo) params.append("dateTo", filters.dateTo);
        if (filters.sortBy) params.append("sortBy", filters.sortBy);
        if (filters.order) params.append("sortOrder", filters.order.toLowerCase());
        
        const response = await api.get(`/branches/branch/${currentBranch.id}/purchases?${params.toString()}`);
        
        if (response.data.success) {
          return response.data.data;
        }
        
        throw new Error(response.data.message || "Failed to fetch branch purchases");
      }
    },
    enabled: !!(isBusinessView ? business?.id : currentBranch?.id),
    staleTime: 1 * 60 * 1000, // 1 minute
    keepPreviousData: true,
    ...options,
  });
};

// Context-aware recent activity hook - switches between business and branch endpoints
export const useRecentActivityData = (options = {}) => {
  const { currentBranch } = useBranchStore();
  const { business } = useBusinessStore();
  
  const isBusinessView = !currentBranch;
  const queryKey = isBusinessView 
    ? [...businessKeys.detail(business?.id), "recent-activity"]
    : [...branchKeys.detail(business?.id, currentBranch?.id), "recent-activity"];
    
  return useQuery({
    queryKey,
    queryFn: async () => {
      if (isBusinessView) {
        if (!business?.id) {
          throw new Error("Business ID is required");
        }
        
        const response = await api.get(`/business/${business.id}/recent-activity`);
        
        if (response.data.success) {
          return response.data.data;
        }
        
        throw new Error(response.data.message || "Failed to fetch business recent activity");
      } else {
        if (!currentBranch?.id) {
          throw new Error("Branch ID is required");
        }
        
        const response = await api.get(`/branches/branch/${currentBranch.id}/recent-activity`);
        
        if (response.data.success) {
          return response.data.data;
        }
        
        throw new Error(response.data.message || "Failed to fetch branch recent activity");
      }
    },
    enabled: !!(isBusinessView ? business?.id : currentBranch?.id),
    staleTime: 30 * 1000, // 30 seconds - more frequent for recent activity
    refetchInterval: 60 * 1000, // 1 minute
    ...options,
  });
};

// Context-aware top customers hook - switches between business and branch endpoints
// This hook is for static customer data (weekly, all-time) - NOT affected by days filter
export const useTopCustomersData = (options = {}) => {
  const { currentBranch } = useBranchStore();
  const { business } = useBusinessStore();
  
  const isBusinessView = !currentBranch;
  const queryKey = isBusinessView 
    ? [...businessKeys.detail(business?.id), "top-customers"]
    : [...branchKeys.detail(business?.id, currentBranch?.id), "top-customers"];
    
  return useQuery({
    queryKey,
    queryFn: async () => {
      if (isBusinessView) {
        if (!business?.id) {
          throw new Error("Business ID is required");
        }
        
        const response = await api.get(`/business/${business.id}/top-customers`);
        
        if (response.data.success) {
          return response.data.data;
        }
        
        throw new Error(response.data.message || "Failed to fetch business top customers");
      } else {
        if (!currentBranch?.id) {
          throw new Error("Branch ID is required");
        }
        
        const response = await api.get(`/branches/branch/${currentBranch.id}/top-customers`);
        
        if (response.data.success) {
          return response.data.data;
        }
        
        throw new Error(response.data.message || "Failed to fetch branch top customers");
      }
    },
    enabled: !!(isBusinessView ? business?.id : currentBranch?.id),
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchInterval: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export const useBranchOverview = (branchId, options = {}) => {
  return useQuery({
    queryKey: branchKeys.overview(branchId),
    queryFn: async () => {
      console.log('useBranchOverview called with branchId:', branchId);
      
      if (!branchId) {
        console.error('Branch ID is missing in useBranchOverview');
        throw new Error("Branch ID is required");
      }

      try {
        console.log('Making API call to:', `/branches/branch/${branchId}/overview`);
        const response = await api.get(
          `/branches/branch/${branchId}/overview`
        );

        if (response.data.success) {
          return response.data.data.overview;
        }

        throw new Error(
          response.data.message || "Failed to fetch branch overview"
        );
      } catch (error) {
        // Transform the error to include server message
        const serverMessage =
          error.response?.data?.message || "Failed to fetch branch overview";
        // handleApiError(error, "Failed to load branch overview"); 
        throw new Error(serverMessage); // This becomes the error.message in your component
      }
    },
    // enabled: !!(businessId && branchId),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    ...options,
  });
};

export const useBranchStats = (branchId, options = {}) => {
  return useQuery({
    queryKey: branchKeys.stats(branchId),
    queryFn: async () => {
      if (!branchId) {
        throw new Error("Branch ID is required");
      }

      const response = await api.get(
        `/branches/branch/${branchId}/stats`
      );

      // Handle your backend response format
      if (response.data.success) {
        return response.data.overview;
      }

      throw new Error(response.data.message || "Failed to fetch branch stats");
    },
    // enabled: !!(businessId && branchId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    ...options,
  });
};

export const useBranchCustomers = (
  businessId,
  branchId,
  filters = {},
  options = {}
) => {
  const {
    page = 1,
    limit = 10,
    search,
    minAmount,
    maxAmount,
    minVisits,
    maxVisits,
  } = filters;

  return useQuery({
    queryKey: branchKeys.customers(businessId, branchId, filters),
    queryFn: async () => {
      if (!businessId || !branchId) {
        throw new Error("Business ID and Branch ID are required");
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) params.append("search", search);
      if (minAmount) params.append("minAmount", minAmount.toString());
      if (maxAmount) params.append("maxAmount", maxAmount.toString());
      if (minVisits) params.append("minVisits", minVisits.toString());
      if (maxVisits) params.append("maxVisits", maxVisits.toString());

      const response = await api.get(
        `/branches/${businessId}/${branchId}/customers?${params.toString()}`
      );

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(
        response.data.message || "Failed to fetch branch customers"
      );
    },
    enabled: !!(businessId && branchId),
    staleTime: 1 * 60 * 1000, // 1 minute
    keepPreviousData: true,
    ...options,
  });
};

export const useBranchPurchases = (
  businessId,
  branchId,
  filters = {},
  options = {}
) => {
  const {
    page = 1,
    limit = 10,
    search,
    minAmount,
    maxAmount,
    dateFrom,
    dateTo,
  } = filters;

  return useQuery({
    queryKey: branchKeys.purchases(branchId, filters),
    queryFn: async () => {
      if (!branchId) {
        throw new Error("Branch ID is required");
      }

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (search) params.append("search", search);
      if (minAmount) params.append("minAmount", minAmount.toString());
      if (maxAmount) params.append("maxAmount", maxAmount.toString());
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);

      const response = await api.get(
        `/branches/branch/${branchId}/purchases?${params.toString()}`
      );

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(
        response.data.message || "Failed to fetch branch purchases"
      );
    },
    // enabled: !!(businessId && branchId),
    staleTime: 1 * 60 * 1000, // 1 minute
    keepPreviousData: true,
    ...options,
  });
};

// Context-aware today's stats hook - fixed data, no days parameter
export const useTodayStats = (options = {}) => {
  const { currentBranch } = useBranchStore();
  const { business } = useBusinessStore();
  
  const isBusinessView = !currentBranch;
  const queryKey = isBusinessView 
    ? [...businessKeys.detail(business?.id), "today-stats"]
    : [...branchKeys.detail(business?.id, currentBranch?.id), "today-stats"];
    
  return useQuery({
    queryKey,
    queryFn: async () => {
      if (isBusinessView) {
        if (!business?.id) {
          throw new Error("Business ID is required");
        }
        
        const response = await api.get(`/business/${business.id}/today-stats`);
        
        if (response.data.success) {
          return response.data.data;
        }
        
        throw new Error(response.data.message || "Failed to fetch business today stats");
      } else {
        if (!currentBranch?.id) {
          throw new Error("Branch ID is required");
        }
        
        const response = await api.get(`/branches/branch/${currentBranch.id}/today-stats`);
        
        if (response.data.success) {
          return response.data.data;
        }
        
        throw new Error(response.data.message || "Failed to fetch branch today stats");
      }
    },
    enabled: !!(isBusinessView ? business?.id : currentBranch?.id),
    staleTime: 1 * 60 * 1000, // 1 minute - today's data changes frequently
    refetchInterval: 2 * 60 * 1000, // 2 minutes
    ...options,
  });
};

// Context-aware sidebar stats hook with aggressive caching
export const useSidebarStats = (options = {}) => {
  const { currentBranch } = useBranchStore();
  const { business } = useBusinessStore();
  
  const isBusinessView = !currentBranch;
  const queryKey = isBusinessView 
    ? [...businessKeys.detail(business?.id), "quick-stats"]
    : [...branchKeys.detail(business?.id, currentBranch?.id), "quick-stats"];
    
  return useQuery({
    queryKey,
    queryFn: async () => {
      if (isBusinessView) {
        if (!business?.id) {
          throw new Error("Business ID is required");
        }
        
        const response = await api.get(`/business/${business.id}/quick-stats`);
        
        if (response.data.success) {
          return response.data.data;
        }
        
        throw new Error(response.data.message || "Failed to fetch business quick stats");
      } else {
        if (!currentBranch?.id) {
          throw new Error("Branch ID is required");
        }
        
        const response = await api.get(`/branches/branch/${currentBranch.id}/quick-stats`);
        
        if (response.data.success) {
          return response.data.data;
        }
        
        throw new Error(response.data.message || "Failed to fetch branch quick stats");
      }
    },
    enabled: !!(isBusinessView ? business?.id : currentBranch?.id),
    staleTime: 10 * 60 * 1000, // 10 minutes - very long to avoid loading states
    cacheTime: 30 * 60 * 1000, // 30 minutes - persist across page reloads
    refetchOnWindowFocus: true, // Don't refetch when user comes back to tab
    refetchInterval: 15 * 60 * 1000, // Background refresh every 15 minutes
    placeholderData: { // Show immediately while loading
      totalCustomers: 0,
      totalRevenueThisMonth: 0,
      totalCustomersThisMonth: 0
    },
    ...options,
  });
};
