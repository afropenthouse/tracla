import axios from "axios";
import { redirect } from "next/navigation";
import { getAuthCookies, deleteAllCookies } from "@/actions/cookies/cookies";

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

export default api;