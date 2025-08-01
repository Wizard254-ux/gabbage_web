import axios from "axios";

const api = axios.create({
  // baseURL: "https://garbagesystem.onrender.com/api",
  baseURL: "https://garbagesystem.onrender.com/api",
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
  // Pickup Management
  getPickups: (params?: { 
    page?: number; 
    limit?: number; 
    startDate?: string;
    endDate?: string;
    status?: string;
    routeId?: string;
    driverId?: string;
  }) =>
    api.get("/pickups", { params }),

  createPickup: (pickupData: {
    userId: string;
    routeId: string;
    scheduledDate: string;
  }) =>
    api.post("/pickups", pickupData),

  updatePickupStatus: (id: string, updateData: {
    status?: string;
    driverId?: string;
    notes?: string;
  }) =>
    api.put(`/pickups/${id}`, updateData),

  getPickupRoutes: () =>
    api.get("/pickups/routes"),

  getPickupDrivers: () =>
    api.get("/pickups/drivers"),

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

  createDriver: (userData: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    licenseNumber?: string;
  }) =>
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

  createClient: (userData: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    accountNumber?: string;
  }) =>
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

  editDriver: (userId: string, updateData: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    licenseNumber?: string;
    status?: string;
  }) =>
    api.post("/auth/organization/users/manage", {
      action: "edit",
      userType: "driver",
      userId,
      updateData
    }),

  editDriverWithDocuments: (userId: string, formData: FormData) =>
    api.put(`/auth/driver/${userId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  deleteDriverDocument: (userId: string, documentPath: string) =>
    api.delete(`/auth/driver/${userId}/document`, {
      data: { documentPath }
    }),

  editClient: (userId: string, updateData: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
    accountNumber?: string;
    status?: string;
  }) =>
    api.post("/auth/organization/users/manage", {
      action: "edit",
      userType: "client",
      userId,
      updateData
    }),

  editClientWithDocuments: (userId: string, formData: FormData) =>
    api.put(`/auth/client/${userId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }),

  deleteClientDocument: (userId: string, documentPath: string) =>
    api.delete(`/auth/client/${userId}/document`, {
      data: { documentPath }
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

  getClientDetails: (clientId: string) =>
    api.get(`/auth/client/${clientId}`),

  getClientPayments: (clientId: string, params?: { page?: number; limit?: number; startDate?: string; endDate?: string }) =>
    api.get(`/payments/client/${clientId}/payments`, { params }),

  getClientInvoices: (clientId: string, params?: { page?: number; limit?: number; status?: string; startDate?: string; endDate?: string }) =>
    api.get(`/invoices/client/${clientId}`, { params }),

  // Route Management
  createRoute: (routeData: {
    name: string;
    description?: string;
    startLocation?: string;
    endLocation?: string;
    waypoints?: string[];
  }) =>
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

  updateRoute: (id: string, routeData: {
    name?: string;
    description?: string;
    startLocation?: string;
    endLocation?: string;
    waypoints?: string[];
  }) =>
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

  exportPayments: (params: {
    format?: 'csv' | 'excel';
    startDate?: string;
    endDate?: string;
    status?: string;
    paymentMethod?: string;
  }) =>
    api.get("/payments/export", { params, responseType: 'blob' }),

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
    api.get("/auth/invoices", { params }),
    
  getAgingSummary: (params?: {
    page?: number;
    limit?: number;
    paymentStatus?: string;
    dueStatus?: string;
    startDate?: string;
    endDate?: string;
    accountNumber?: string;
  }) =>
    api.get("/invoices/aging-summary", { params }),

  exportInvoices: (params?: {
    format?: 'csv' | 'excel';
    status?: string;
    startDate?: string;
    endDate?: string;
    accountNumber?: string;
  }) =>
    api.get("/invoices/export", { params, responseType: 'blob' }),

  exportAgingSummary: (params?: {
    format?: 'csv' | 'excel';
    paymentStatus?: string;
    dueStatus?: string;
    startDate?: string;
    endDate?: string;
    accountNumber?: string;
  }) =>
    api.get("/invoices/aging-summary/export", { params, responseType: 'blob' }),
    
  getInvoiceById: (invoiceId: string) =>
    api.get(`/invoices/${invoiceId}`),
    
  getInvoiceWithPayments: (invoiceId: string) =>
    api.get(`/invoices/${invoiceId}`),
    
  createInvoice: (invoiceData: {
    userId: string;
    totalAmount: number;
    dueDate: string;
    billingPeriod: { start: string; end: string };
  }) => api.post("/invoices", invoiceData),
    
  deleteInvoice: (id: string) => api.delete(`/invoices/${id}`),
    
  // Payment History
  getAllPaymentHistory: (params?: {
    page?: number;
    limit?: number;
  }) =>
    api.get("/payments/history", { params }),

  // Bag Distribution Management
  getClientBagHistory: (clientId: string, params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }) =>
    api.get(`/bags/history/${clientId}`, { params }),

  getBagDistributionHistory: (params?: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
    clientId?: string;
  }) =>
    api.get("/bags/history", { params }),

  distributeBags: (distributionData: {
    client_id: string;
    recipient_email: string;
    number_of_bags: number;
    notes?: string;
  }) =>
    api.post("/bags/distribute", distributionData),

  verifyBagDistribution: (verificationData: {
    distribution_id: string;
    verification_code: string;
  }) =>
    api.post("/bags/verify", verificationData),
};