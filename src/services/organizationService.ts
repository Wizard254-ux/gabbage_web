import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const adminData = localStorage.getItem('admin');
  if (adminData) {
    const token = JSON.parse(adminData).token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Added auth token to request:', config.method?.toUpperCase(), config.url);
    }
  }
  return config;
});

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.config?.url, error.response?.data);
    return Promise.reject(error);
  }
);

let pendingListRequest = null;

export const organizationService = {
  // List organizations
  list: async (params = {}) => {
    if (pendingListRequest) {
      console.log('Request already pending, waiting...');
      return await pendingListRequest;
    }
    
    pendingListRequest = api.post('/auth/organization/manage', {
      action: 'list',
      ...params
    }).then(response => response.data)
    .finally(() => {
      pendingListRequest = null;
    });
    
    return await pendingListRequest;
  },

  // Get organization stats
  getStats: async () => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // Create organization
  create: async (data: { name: string; email: string; phone: string }) => {
    const response = await api.post('/admin/organizations/create', data);
    return response.data;
  },

  // Create organization with files
  createWithFiles: async (formData: FormData) => {
    const response = await api.post('/auth/register/organization', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Update organization
  update: async (organizationId: number | string, updateData: any) => {
    console.log('Updating organization:', organizationId, updateData);
    const response = await api.post('/auth/organization/manage', {
      action: 'edit',
      organizationId,
      updateData
    });
    return response.data;
  },

  // Delete organization
  delete: async (organizationId: number | string) => {
    console.log('Deleting organization:', organizationId);
    const response = await api.post('/auth/organization/manage', {
      action: 'delete',
      organizationId
    });
    return response.data;
  },

  // Send credentials
  sendCredentials: async (organizationId: number | string) => {
    console.log('Sending credentials for organization:', organizationId);
    const response = await api.post('/admin/organizations/send-credentials', {
      organizationId
    });
    return response.data;
  },

  // Get organization details
  getDetails: async (organizationId: number | string) => {
    console.log('Getting details for organization:', organizationId);
    const response = await api.get(`/admin/organizations/${organizationId}`);
    return response.data;
  },

  // Create driver with multipart
  createDriverWithMultipart: async (formData: FormData) => {
    const response = await api.post('/auth/register/driver', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // List drivers
  listDrivers: async () => {
    const response = await api.get('/auth/drivers');
    return response;
  },

  // Get driver details
  getDriverDetails: async (driverId: string) => {
    const response = await api.get(`/drivers/${driverId}`);
    return response;
  },

  // Edit driver with documents
  editDriverWithDocuments: async (driverId: string, formData: FormData) => {
    const response = await api.put(`/auth/driver/${driverId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  // Delete driver
  deleteDriver: async (driverId: string) => {
    const response = await api.post('/auth/organization/users/manage', {
      action: 'delete',
      userType: 'driver',
      userId: driverId
    });
    return response;
  },

  // Send driver credentials
  sendDriverCredentials: async (driverId: string) => {
    const response = await api.post('/auth/send-driver-credentials', {
      driverId
    });
    return response;
  },

  // Delete driver document
  deleteDriverDocument: async (driverId: string, documentPath: string) => {
    const response = await api.delete(`/auth/driver/${driverId}/document`, {
      data: { documentPath }
    });
    return response;
  },

  // Get all routes - disabled
  getAllRoutes: async () => {
    return { data: { data: [] } };
  }
};