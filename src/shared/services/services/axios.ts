import axios from "axios";

const api = axios.create({
   baseURL: "http://127.0.0.1:8000/api",
  //baseURL: "https://garbagesystem.onrender.com/api",
  timeout: 30000,
});

api.interceptors.request.use(
  (config) => {
    const admin = localStorage.getItem('admin');
    if (admin) {
      try {
        const adminData = JSON.parse(admin);
        const token = adminData.data?.access_token;
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
          console.log('Request URL:', config.url);
          console.log('Authorization header:', config.headers['Authorization']);
        }
      } catch (error) {
        localStorage.removeItem('admin');
      }
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
