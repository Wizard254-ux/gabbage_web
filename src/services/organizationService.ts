import axios from "axios";

const api = axios.create({
  // baseURL: "https://garbagesystem.onrender.com/api",
  baseURL: "http://192.168.0.115:5000/api",
  timeout: 10000,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const admin = localStorage.getItem('admin');
    if (admin) {
      try {
        const adminData = JSON.parse(admin);
        if (adminData && adminData.token) {
          config.headers.Authorization = `Bearer ${adminData.token}`;
          console.log('Added auth token to request');
        } else {
          console.warn('No token found in admin data');
        }
      } catch (error) {
        console.error('Error parsing admin data:', error);
        localStorage.removeItem('admin');
      }
    } else {
      console.warn('No admin data found in localStorage');
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin');
      window.location.reload();
    }
    return Promise.reject(error);
  }
);

export const organizationService = {
  // User Management
  listDrivers: () =>
    api.post("/auth/organization/users/manage", {
      action: "list",
      userType: "driver"
    }),

  listClients: () =>
    api.post("/auth/organization/users/manage", {
      action: "list",
      userType: "client"
    }),

  createDriver: (userData: any) =>
    api.post("/auth/organization/users/manage", {
      action: "create",
      userType: "driver",
      userData
    }),

  createDriverWithMultipart: (formData: FormData) =>
    api.post("/auth/register/driver", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  createClient: (userData: any) =>
    api.post("/auth/organization/users/manage", {
      action: "create",
      userType: "client",
      userData
    }),

  createClientWithMultipart: (formData: FormData) =>
    api.post("/auth/register/client", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  editDriver: (userId: string, updateData: any) =>
    api.post("/auth/organization/users/manage", {
      action: "edit",
      userType: "driver",
      userId,
      updateData
    }),

  editClient: (userId: string, updateData: any) =>
    api.post("/auth/organization/users/manage", {
      action: "edit",
      userType: "client",
      userId,
      updateData
    }),

  deleteDriver: (userId: string) =>
    api.post("/auth/organization/users/manage", {
      action: "delete",
      userType: "driver",
      userId
    }),

  deleteClient: (userId: string) =>
    api.post("/auth/organization/users/manage", {
      action: "delete",
      userType: "client",
      userId
    }),
    
  sendDriverCredentials: (driverId: string) =>
    api.post("/auth/send-driver-credentials", {
      driverId
    }),
    
  getDriverDetails: (driverId: string) =>
    api.get(`/auth/driver/${driverId}`),

  // Route Management
  createRoute: (routeData: any) =>
    api.post("/routes", {
      action: "create",
      ...routeData
    }),

  getAllRoutes: () =>
    api.post("/routes", {
      action: "read"
    }),

  getRoute: (id: string) =>
    api.post("/routes", {
      action: "get",
      id
    }),

  updateRoute: (id: string, routeData: any) =>
    api.post("/routes", {
      action: "update",
      id,
      ...routeData
    }),

  deleteRoute: (id: string) =>
    api.post("/routes", {
      action: "delete",
      id
    }),

  // Payment Management
  processPayment: (paymentData: {
    accountNumber: string;
    amount: number;
    paymentMethod: string;
    mpesaReceiptNumber?: string;
    phoneNumber: string;
    transactionId: string;
  }) =>
    api.post("/payments/process", paymentData),

  generateMonthlyInvoices: () =>
    api.post("/payments/generate-invoices"),

  getPaymentHistory: (accountNumber: string, params?: { page?: number; limit?: number }) =>
    api.get(`/payments/history/${accountNumber}`, { params }),

  getAccountStatement: (accountNumber: string, params?: { 
    startDate?: string; 
    endDate?: string; 
    page?: number; 
    limit?: number 
  }) =>
    api.get(`/payments/statement/${accountNumber}`, { params }),

  getPaymentsByDateRange: (params: {
    startDate: string;
    endDate: string;
    page?: number;
    limit?: number;
  }) =>
    api.get("/payments/transactions", { params }),

  getPaymentDetails: (paymentId: string) =>
    api.get(`/payments/${paymentId}`),

  updatePaymentStatus: (paymentId: string, status: string) =>
    api.put(`/payments/${paymentId}/status`, { status }),

  // Additional Payment APIs from Postman collection
  getAllPayments: (params?: { 
    page?: number; 
    limit?: number; 
    status?: string; 
    paymentMethod?: string;
    startDate?: string;
    endDate?: string;
  }) =>
    api.get("/payments", { params }),

  getPaymentById: (paymentId: string) =>
    api.get(`/payments/${paymentId}`),

  reversePayment: (paymentId: string, reason?: string) =>
    api.post(`/payments/${paymentId}/reverse`, { reason }),

  validatePayment: (paymentData: {
    accountNumber: string;
    mpesaReceiptNumber: string;
    amount: number;
  }) =>
    api.post("/payments/validate", paymentData),

  getPaymentStats: (params?: { 
    startDate?: string; 
    endDate?: string; 
    groupBy?: 'day' | 'week' | 'month' 
  }) =>
    api.get("/payments/stats", { params }),

  exportPayments: (params: {
    format: 'csv' | 'excel' | 'pdf';
    startDate?: string;
    endDate?: string;
    accountNumber?: string;
  }) =>
    api.get("/payments/export", { params, responseType: 'blob' }),

  reconcilePayments: (params: { 
    startDate: string; 
    endDate: string; 
  }) =>
    api.post("/payments/reconcile", params),

  // Invoice Management
  getAllInvoices: (params?: { 
    page?: number; 
    limit?: number; 
    status?: string;
    startDate?: string;
    endDate?: string;
    accountNumber?: string;
  }) =>
    api.get("/invoices", { params }),
    
  // Payment History
  getAllPaymentHistory: (params?: {
    page?: number;
    limit?: number;
  }) =>
    api.get("/payments/history", { params }),
};