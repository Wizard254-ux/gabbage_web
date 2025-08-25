import axios from "axios";

const api = axios.create({
   baseURL: "http://127.0.0.1:8000/api",
  //baseURL: "https://garbagesystem.onrender.com/api",
  timeout: 30000,
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
        const token = adminData.data?.access_token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
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
      window.location.reload();
    }
    
    return Promise.reject(error);
  }
);

export const adminService = {
  // Auth
  login: (credentials: { email: string; password: string }) =>
    api.post("/auth/login", credentials),

  logout: () => api.post("/auth/logout"),

  // Organization Management
  listOrganizations: (params?: any) =>
    api.post("/auth/organization/manage", { action: "list", ...params }),

  addOrganization: (data: FormData) =>
    api.post("/auth/register/organization", data),

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
    api.post("/auth/organization/manage", {
      action: "get",
      organizationId,
    }),
};

export default api;
