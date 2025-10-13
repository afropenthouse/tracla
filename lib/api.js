import axios from "axios";
import { redirect } from "next/navigation";
import { getAuthCookies, deleteAllCookies, getUserCookies } from "@/actions/cookies/cookies";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

let isRefreshing = false;
let failedQueue = [];

const processQueue = (token, err) => {
  failedQueue.forEach((prom) => prom(token, err));
  failedQueue = [];
};

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

const publicEndpoints = ['/auth/login', '/auth/register', '/auth/verify', '/auth/forgot-password', '/auth/reset-password', '/auth/token/refresh', '/public/branch'];

api.interceptors.request.use(async (config) => {
  const isPublicEndpoint = publicEndpoints.some(endpoint => 
    config.url?.includes(endpoint)
  );

  if (isPublicEndpoint) {
    return config;
  }

  const cookie = await getAuthCookies();
  console.log(`this is the cookie ${JSON.stringify(cookie)}`);

  if (!cookie?.success) { 
    console.log(cookie, 'cookie in api.js');
    console.log("called for redirect in api.js");
    console.log(cookie, 'no cookie');
  }

  const { accessToken } = cookie;
  console.log(accessToken, 'accessToken in api.js');

  config.headers = config.headers || {};
  
   if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
   }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if this is a public endpoint
    const isPublicEndpoint = publicEndpoints.some(endpoint => 
      originalRequest.url?.includes(endpoint)
    );

    // Don't intercept 401 errors for public endpoints or if already retried
    if (!error.response || error.response.status !== 401 || originalRequest._retry || isPublicEndpoint) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push((token, err) => {
            if (err) return reject(err);
            if (token) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      const cookie = await getAuthCookies();
      const refreshToken = cookie.refreshToken;

      const response = await axios.post(`${BASE_URL}/auth/token/refresh`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefreshToken } = response.data.data;

      const { setAuthCookies } = await import("@/actions/cookies/cookies");
      await setAuthCookies(accessToken, newRefreshToken);

      processQueue(accessToken, null);
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      return api(originalRequest);
    } catch (refreshErr) {
      processQueue(null, refreshErr);
      console.log("called for deleteAllCookies in api.js");
      await deleteAllCookies();
      redirect("/login");
    } finally {
      isRefreshing = false;
    }
  }
);

// DVA (Dedicated Virtual Account) function
export const getDVA = async (planData) => {
  try {
    const response = await api.get('/payments/dva', {
      params: planData
    });
    return response.data;
  } catch (error) {
    console.error('DVA retrieval error:', error);
    throw error;
  }
};

// Payment verification function
export const verifyPayment = async (businessId) => {
  try {
    const response = await api.get(`/branches/${businessId}/plan`);
    return response.data;
  } catch (error) {
    console.error('Payment verification error:', error);
    throw error;
  }
};

// Customer analytics functions
export const getCustomerBusinessAnalytics = async (businessId, customerId, dateFilter = {}) => {
  try {
    const params = new URLSearchParams();
    if (dateFilter.dateFrom) params.append('dateFrom', dateFilter.dateFrom);
    if (dateFilter.dateTo) params.append('dateTo', dateFilter.dateTo);
    
    const response = await api.get(`/customers/${businessId}/${customerId}/analytics?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Customer business analytics error:', error);
    throw error;
  }
};

export const getCustomerBranchAnalytics = async (businessId, customerId, branchId, dateFilter = {}) => {
  try {
    const params = new URLSearchParams();
    if (dateFilter.dateFrom) params.append('dateFrom', dateFilter.dateFrom);
    if (dateFilter.dateTo) params.append('dateTo', dateFilter.dateTo);
    
    const response = await api.get(`/customers/${businessId}/${customerId}/branch/${branchId}/analytics?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Customer branch analytics error:', error);
    throw error;
  }
};

// Get customer purchase history
export const getCustomerPurchaseHistory = async (businessId, customerPhone, filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);
    if (customerPhone) params.append('search', customerPhone);
    
    const url = `/customers/${businessId}/purchases?${params.toString()}`;
    console.log('API BASE_URL:', BASE_URL);
    console.log('Full API URL:', `${BASE_URL}${url}`);
    console.log('Request params:', { businessId, customerPhone, filters });
    
    // Use the purchases endpoint with customer phone filter
    const response = await api.get(url);
    
    return response.data;
  } catch (error) {
    console.error('Customer purchase history error:', error);
    throw error;
  }
};

// Logout function
export const logout = async () => {
  try {
    await api.post('/auth/logout');
    await deleteAllCookies();
    return { success: true };
  } catch (error) {
    console.error('Logout error:', error);
    // Even if logout fails, clear local cookies
    await deleteAllCookies();
    return { success: false, error: error.message };
  }
};

// Message API functions
export const sendSingleMessage = async (businessId, customerId, message) => {
  try {
    // Backend expects POST /api/v1/messages/:businessId/single with { customerId, message }
    const response = await api.post(`/messages/${businessId}/single`, {
      customerId,
      message
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Send message error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to send message' 
    };
  }
};

export const sendBulkMessage = async (businessId, customerIds, message) => {
  try {
    const response = await api.post(`/messages/${businessId}/bulk`, {
      customerIds,
      message
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Send bulk message error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to send bulk message' 
    };
  }
};

export const sendBulkMessageToAll = async (businessId, message) => {
  try {
    const response = await api.post(`/messages/${businessId}/bulk-all`, {
      message
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Send bulk message to all error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to send bulk message to all customers' 
    };
  }
};

export const getMessageHistory = async (businessId, filters = {}) => {
  try {
    const response = await api.get(`/messages/${businessId}/history`, {
      params: filters
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Get message history error:', error);
    return { 
      success: false, 
      error: error.response?.data?.message || 'Failed to get message history' 
    };
  }
};

export const getTermiiBalance = async (businessId) => {
  try {
    const response = await api.get(`/messages/${businessId}/balance`);
    return response.data;
  } catch (error) {
    console.error('Termii balance retrieval error:', error);
    throw error;
  }
};

// NEW: Message Wallet - fetch wallet data and recent transactions
export const getMessageWallet = async (businessId) => {
  try {
    const response = await api.get(`/messages/${businessId}/wallet`);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Get message wallet error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to get message wallet'
    };
  }
};

// NEW: Initialize Paystack top-up for message wallet
// amountNaira should be provided in Naira; it will be converted to kobo for the backend
export const initializeTopUp = async (amountNaira, options = {}) => {
  try {
    const { userEmail } = await getUserCookies();
    const amountKobo = Math.round(Number(amountNaira) * 100);

    const payload = {
      email: userEmail,
      amount: amountKobo,
      currency: options.currency || 'NGN',
      reference: options.reference,
      callback_url: options.callback_url,
      metadata: options.metadata || { source: 'messages_topup' }
    };

    const response = await api.post('/payments/transaction/initialize', payload);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Initialize top-up error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to initialize top-up'
    };
  }
};

// NEW: Verify Paystack top-up using payment reference
export const verifyTopUp = async (reference) => {
  try {
    const response = await api.post('/payments/transaction/verify', { reference });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Verify top-up error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to verify top-up'
    };
  }
};

// Rewards API helpers
export const getRewards = async (businessId) => {
  try {
    const response = await api.get(`/rewards/${businessId}`);
    return response.data;
  } catch (error) {
    console.error('Rewards fetch error:', error);
    throw error;
  }
};

// NEW: Public rewards (active & valid) for customer-facing views
export const getPublicRewards = async (businessId) => {
  try {
    const response = await api.get(`/public/${businessId}/rewards`);
    return response.data;
  } catch (error) {
    console.error('Public rewards fetch error:', error);
    throw error;
  }
};

export const createRewardApi = async (businessId, payload) => {
  try {
    const response = await api.post(`/rewards/${businessId}`, payload);
    return response.data;
  } catch (error) {
    console.error('Create reward error:', error);
    throw error;
  }
};

export const updateRewardApi = async (businessId, rewardId, payload) => {
  try {
    const response = await api.put(`/rewards/${businessId}/${rewardId}`, payload);
    return response.data;
  } catch (error) {
    console.error('Update reward error:', error);
    throw error;
  }
};

export const deleteRewardApi = async (businessId, rewardId) => {
  try {
    const response = await api.delete(`/rewards/${businessId}/${rewardId}`);
    return response.data;
  } catch (error) {
    console.error('Delete reward error:', error);
    throw error;
  }
};

export const sendMessageToExternalRecipients = async (businessId, phoneNumbers, message) => {
  try {
    const response = await api.post(`/messages/${businessId}/external-bulk`, {
      phoneNumbers,
      message,
    });
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Send message to external recipients error:', error);
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to send message to external recipients'
    };
  }
};

export default api;