import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { toast } from "react-toastify";

const handleApiError = (error, defaultMessage = "An error occurred") => {
  const response = error.response?.data;

  if (response) {
    // Handle your backend response format
    const message = response.message || defaultMessage;
    const httpStatusCode = error?.status; // This is the numeric HTTP code (403, 404, etc.)

    console.log(`Error Status Code: ${httpStatusCode}`);

    // Different handling based on HTTP status codes
    switch (httpStatusCode) {
      case 422:
        toast.error(`Validation Error: ${message}`);
        break;
      case 404:
        toast.error(`Not Found: ${message}`);
        break;
      case 403:
        toast.error(`Access Denied: ${message}`);
        break;
      case 409:
        toast.error(`Conflict: ${message}`);
        break;
      case 500:
        toast.error(`Server Error: ${message}`);
        break;
      default:
        toast.error(message);
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
  if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
    toast.error("Request timeout. Please try again.");
  } else if (error.code === "ERR_NETWORK") {
    toast.error("Network error. Please check your connection.");
  } else {
    toast.error(defaultMessage);
  }

  return { message: defaultMessage, statusCode: "NETWORK_ERROR" };
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
  purchases: (businessId, branchId, filters) => [
    ...branchKeys.detail(businessId, branchId),
    "purchases",
    filters,
  ],
  overview: (businessId, branchId) => [
    ...branchKeys.detail(businessId, branchId),
    "overview",
  ],
};

export const useBranchOverview = (businessId, branchId, options = {}) => {
  return useQuery({
    queryKey: branchKeys.overview(businessId, branchId),
    queryFn: async () => {
      if (!businessId || !branchId) {
        throw new Error("Business ID and Branch ID are required");
      }

      try {
        const response = await api.get(
          `/branches/${businessId}/${branchId}/overview`
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
    enabled: !!(businessId && branchId),
    staleTime: 2 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    ...options,
  });
};

export const useBranchStats = (businessId, branchId, options = {}) => {
  return useQuery({
    queryKey: branchKeys.stats(businessId, branchId),
    queryFn: async () => {
      if (!businessId || !branchId) {
        throw new Error("Business ID and Branch ID are required");
      }

      const response = await api.get(
        `/branches/${businessId}/${branchId}/stats`
      );

      // Handle your backend response format
      if (response.data.success) {
        return response.data.overview;
      }

      throw new Error(response.data.message || "Failed to fetch branch stats");
    },
    enabled: !!(businessId && branchId),
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
    onError: (error) =>
      handleApiError(error, "Failed to load branch statistics"),
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
    onError: (error) =>
      handleApiError(error, "Failed to load branch customers"),
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
    queryKey: branchKeys.purchases(businessId, branchId, filters),
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
      if (dateFrom) params.append("dateFrom", dateFrom);
      if (dateTo) params.append("dateTo", dateTo);

      const response = await api.get(
        `/branches/${businessId}/${branchId}/purchases?${params.toString()}`
      );

      if (response.data.success) {
        return response.data.data;
      }

      throw new Error(
        response.data.message || "Failed to fetch branch purchases"
      );
    },
    enabled: !!(businessId && branchId),
    staleTime: 1 * 60 * 1000, // 1 minute
    keepPreviousData: true,
    onError: (error) =>
      handleApiError(error, "Failed to load branch purchases"),
    ...options,
  });
};
