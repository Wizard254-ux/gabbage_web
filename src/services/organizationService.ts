import axios from "axios";

const api = axios.create({
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
  processPayment: (paymentData: any) =>
    api.post("/payments/process", paymentData),

  getPaymentHistory: (accountNumber: string, params?: any) =>
    api.get(`/payments/history/${accountNumber}`, { params }),

  getAccountStatement: (accountNumber: string, params?: any) =>
    api.get(`/payments/statement/${accountNumber}`, { params }),
};