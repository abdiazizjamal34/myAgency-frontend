import axios from "axios";

import NProgress from "nprogress";
import "nprogress/nprogress.css";





const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE || "",
  headers: { "Content-Type": "application/json" },
});

// Attach JWT to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Optional: basic 401 handling
api.interceptors.response.use(
  (r) => r,
  (err) => {
    if (err?.response?.status === 401) {
      localStorage.removeItem("token");
      // you could redirect to login page here if using a router
      
    }
    throw err;
  }
);

// ---- Auth
export const AuthAPI = {
  login: (email, password) => api.post("/api/auth/login", { email, password }),
  verifyEmail: (data) => api.post("/api/auth/verify-email", data).then((r) => r.data),
  requestOtp: (data) => api.post("/api/auth/forgot-password", data).then((r) => r.data),
  verifyOtp: (data) => api.post("/api/auth/verify-otp", data).then((r) => r.data),
  resetPassword: (data) => api.post("/api/auth/reset-password", data).then((r) => r.data),
};

// ---- Records
export const RecordsAPI = {
  list: (params = {}) =>
    api.get("/api/records", { params }).then((r) => r.data || []),
   get: (id) => api.get(`/api/records/${id}`).then(r => r.data),
   create: (payload) => {
    console.log("Creating record with payload:", payload);
    return api.post("/api/records", payload).then((r) => r.data);
  },
  update: (id, payload) =>  api.put(`/api/records/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/api/records/${id}`).then((r) => r.data),
};


// ---- Agencies (SUPER_ADMIN)
export const AgenciesAPI = {
  list: () => api.get("/api/agencies").then((r) => r.data || []),
  create: (payload) => api.post("/api/agencies", payload).then((r) => r.data),
  update: (id, payload) => api.patch(`/api/agencies/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/api/agencies/${id}`).then((r) => r.data),
  assignAdmin: (id, payload) => api.post(`/api/agencies/${id}/admin`, payload).then((r) => r.data),
};

// ---- Users (SUPER_ADMIN + AGENCY_ADMIN)
export const UsersAPI = {
  list: () => api.get("/api/users").then((r) => r.data || []),
  create: (payload) => api.post("/api/users", payload).then((r) => r.data),
  update: (id, payload) => api.put(`/api/users/${id}`, payload).then((r) => r.data),
  remove: (id) => api.delete(`/api/users/${id}`).then((r) => r.data),
};

// ---- Reports
export const ReportsAPI = {
  summary: (params = {}) =>
    api.get("/api/reports/summary", { params }).then((r) => r.data),

  byService: (params = {}) =>
    api.get("/api/reports/by-service", { params }).then((r) => r.data || []),

  trend: async (params) => {
  try {
    const response = await api.get("/api/reports/trend", { params });
    return response.data;
  } catch (error) {
    console.error("Error fetching trend data:", error);
    throw error;
  }
}

};
  
// export const UserAPI = {
//   changePassword: (_id, data) => api.post(`api/users/change-password`, data).then(r => r.data),
  

// };

export const UserAPI = {
  // For self password change
  changePassword: (data) => api.post('api/users/change-password', data).then(r => r.data),

  // For admin changing another user's password
  changeUserPassword: (_id, data) => api.post(`api/users/${_id}/change-password`, data).then(r => r.data),
};

// { change the authenticated user's password }

export const PasswordAPI = {
  requestOtp: (phone) => api.post("/api/auth/forgot-password", { phone }).then(r => r.data),
  verifyOtp: (data) => api.post("/api/auth/verify-otp", data).then(r => r.data),
  changePassword: (data) => api.post("/api/auth/reset-password", data).then(r => r.data),
};


NProgress.configure({
  showSpinner: false,
  speed: 400,
  minimum: 0.2,
});

let activeRequests = 0;

function startProgress() {
  if (activeRequests === 0) NProgress.start();
  activeRequests++;
}

function stopProgress() {
  activeRequests--;
  if (activeRequests <= 0) {
    NProgress.done();
    activeRequests = 0;
  }
}

api.interceptors.request.use(
  (config) => {
    startProgress();
    return config;
  },
  (error) => {
    stopProgress();
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    stopProgress();
    return response;
  },
  (error) => {
    stopProgress();
    return Promise.reject(error);
  }
);




export default api;
