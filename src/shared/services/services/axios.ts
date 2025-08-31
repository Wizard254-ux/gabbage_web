import axios from "axios";

const api = axios.create({
  baseURL: "https://gabbage.lomtechnology.com/api",
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    // Try both 'admin' and 'user' keys for token storage
    let token = null;
    
    // First try 'admin' key
    const admin = localStorage.getItem('admin');
    if (admin) {
      try {
        const adminData = JSON.parse(admin);
        token = adminData.data?.access_token;
      } catch (error) {
        localStorage.removeItem('admin');
      }
    }
    
    // If no token found, try 'user' key
    if (!token) {
      const user = localStorage.getItem('user');
      if (user) {
        try {
          const userData = JSON.parse(user);
          token = userData.data?.access_token || userData.access_token;
        } catch (error) {
          localStorage.removeItem('user');
        }
      }
    }
    
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('admin');
      localStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export const adminService = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    api.post("/auth/login", credentials),

  logout: () => api.post("/auth/logout"),

  // Dashboard
  getDashboardStats: () => api.get("/admin/dashboard/stats"),

  // Admin Management
  listAdmins: () => api.get("/admin/admins/list"),
  
  createAdmin: (data: any) => api.post("/admin/admins/create", data),
  
  getAdmin: (id: string) => api.get(`/admin/admins/${id}`),
  
  updateAdmin: (id: string, data: any) => api.put(`/admin/admins/${id}`, data),
  
  deleteAdmin: (id: string) => api.delete(`/admin/admins/${id}`),
  
  deactivateAdmin: (id: string) => api.post(`/admin/admins/${id}/deactivate`),
  
  makeSuperAdmin: (id: string) => api.post(`/admin/admins/${id}/make-super`),
  
  updateProfile: (data: any) => api.put('/admin/profile', data),

  // Organization Management
  listOrganizations: (params?: any) =>
    api.post("/auth/organization/manage", { action: "list", ...params }),

  addOrganization: (data: FormData) => {
    console.log('Sending FormData to backend:');
    for (let [key, value] of data.entries()) {
      console.log(key, value);
    }
    return api.post("/auth/create-organization", data, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
  },

  updateOrganization: (organizationId: string, updateData: any) =>
    api.post("/auth/organization/manage", {
      action: "edit",
      organizationId,
      updateData,
    }),

  deleteOrganization: (organizationId: string) =>
    api.post("/auth/organization/manage", {
      action: "delete",
      organizationId,
    }),

  getOrganization: (organizationId: string) =>
    api.get(`/admin/organizations/${organizationId}`),

  sendCredentials: (organizationId: string) =>
    api.post("/admin/organizations/send-credentials", {
      organizationId,
    }),

  toggleOrganizationStatus: (organizationId: string) =>
    api.post("/admin/organizations/deactivate", {
      organizationId,
    }),

  deactivateOrganization: (organizationId: string) =>
    api.post("/admin/organizations/deactivate", {
      organizationId,
    }),
};

export default api;
