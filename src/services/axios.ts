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
        config.headers.Authorization = `Bearer ${adminData.token}`;
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
    
    // Retry logic for timeout errors
    if (error.code === 'ECONNABORTED' && !error.config._retry) {
      error.config._retry = true;
      return api.request(error.config);
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
