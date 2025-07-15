import axios from "axios";

const api = axios.create({
  baseURL: "http://192.168.10.2:5000/api",
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
  (error) => {
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
