import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const runtimeBaseUrl = typeof window !== "undefined" ? window.location.origin : "http://localhost:8000";
export const BASE_URL = import.meta.env.VITE_API_URL || runtimeBaseUrl;
const API_BASE_URL = `${BASE_URL}/api`;
const ACCESS_TOKEN_KEY = "metafarm_access_token";

type AuthSession = {
  access_token: string;
  token_type: string;
  expires_in_seconds: number;
  refresh_expires_in_seconds: number;
};

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const authClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export const authStorage = {
  getToken: () => window.localStorage.getItem(ACCESS_TOKEN_KEY),
  setSession: (session: AuthSession) => window.localStorage.setItem(ACCESS_TOKEN_KEY, session.access_token),
  clearSession: () => window.localStorage.removeItem(ACCESS_TOKEN_KEY),
};

const redirectToLogin = () => {
  authStorage.clearSession();
  if (window.location.pathname !== "/login") {
    window.location.assign("/login");
  }
};

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  if (!refreshPromise) {
    refreshPromise = authClient
      .post<AuthSession>("/auth/refresh")
      .then((response) => {
        authStorage.setSession(response.data);
        return response.data.access_token;
      })
      .catch(() => {
        authStorage.clearSession();
        return null;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }

  return refreshPromise;
};

api.interceptors.request.use((config) => {
  const token = authStorage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetryableRequestConfig | undefined;
    const isAuthRoute = originalRequest?.url?.startsWith("/auth/");

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry && !isAuthRoute) {
      originalRequest._retry = true;
      const refreshedAccessToken = await refreshAccessToken();
      if (refreshedAccessToken) {
        originalRequest.headers.Authorization = `Bearer ${refreshedAccessToken}`;
        return api(originalRequest);
      }
    }

    if (error.response?.status === 401) {
      redirectToLogin();
    }

    return Promise.reject(error);
  }
);

export const authService = {
  login: async (username: string, password: string) => {
    const response = await authClient.post<AuthSession>("/auth/login", { username, password });
    authStorage.setSession(response.data);
    return response;
  },
  me: () => api.get("/auth/me"),
  logout: async () => {
    try {
      await authClient.post("/auth/logout");
    } finally {
      authStorage.clearSession();
    }
  },
};

export const hiveService = {
  getAll: () => api.get("/hives/"),
  getById: (id: string) => api.get(`/hives/${id}`),
  create: (data: unknown) => api.post("/hives/", data),
  update: (id: string, data: unknown) => api.put(`/hives/${id}`, data),
  delete: (id: string) => api.delete(`/hives/${id}`),
};

export const harvestService = {
  getAll: () => api.get("/harvests/"),
  getByHive: (hiveId: number) => api.get(`/harvests/hive/${hiveId}`),
  create: (hiveId: number, data: unknown) => api.post(`/harvests/?hive_id_int=${hiveId}`, data),
};

export const inspectionService = {
  getByHive: (hiveId: number) => api.get(`/inspections/hive/${hiveId}`),
  create: (formData: FormData) =>
    api.post("/inspections/", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
};

export const dashboardService = {
  getStats: () => api.get("/dashboard/stats"),
};

export const weatherService = {
  getCurrent: () => api.get("/weather/current"),
  getHistory: (limit: number = 10) => api.get(`/weather/history?limit=${limit}`),
};

export default api;
