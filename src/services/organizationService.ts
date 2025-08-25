import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  withCredentials: true,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const adminData = localStorage.getItem('admin');
  if (adminData) {
    try {
      const parsedData = JSON.parse(adminData);
      const token = parsedData.data?.access_token; // Correct path for organization login
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Added auth token to request:', config.method?.toUpperCase(), config.url);
      }
    } catch (error) {
      console.error('Error parsing admin data:', error);
      localStorage.removeItem('admin');
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

  // Get admin stats (for admin dashboard)
  getAdminStats: async () => {
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
    const response = await api.post('/organization/drivers', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // List drivers
  listDrivers: async () => {
    const response = await api.get('/organization/drivers');
    return response;
  },

  // Get driver details
  getDriverDetails: async (driverId: string) => {
    const response = await api.get(`/organization/drivers/${driverId}`);
    return response;
  },

  // Edit driver with documents
  editDriverWithDocuments: async (driverId: string, formData: FormData) => {
    const response = await api.post(`/organization/drivers/${driverId}/update`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  // Delete driver
  deleteDriver: async (driverId: string) => {
    const response = await api.delete(`/organization/drivers/${driverId}`);
    return response;
  },

  // Send driver credentials
  sendDriverCredentials: async (driverId: string) => {
    const response = await api.post(`/organization/drivers/${driverId}/send-credentials`);
    return response;
  },

  // Delete driver document
  deleteDriverDocument: async (driverId: string, documentPath: string) => {
    const response = await api.delete(`/organization/drivers/${driverId}/documents`, {
      data: { documentPath }
    });
    return response;
  },

  // Routes management
  getAllRoutes: async () => {
    console.log('🛣️ Fetching routes list...');
    const response = await api.get('/organization/routes');
    console.log('🛣️ Routes list response:', response.data);
    return response;
  },

  createRoute: async (data) => {
    const response = await api.post('/organization/routes', data);
    return response;
  },

  getRouteDetails: async (routeId) => {
    const response = await api.get(`/organization/routes/${routeId}`);
    return response;
  },

  updateRoute: async (routeId, data) => {
    const response = await api.put(`/organization/routes/${routeId}`, data);
    return response;
  },

  deleteRoute: async (routeId) => {
    const response = await api.delete(`/organization/routes/${routeId}`);
    return response;
  },

  // Client management
  listClients: async () => {
    console.log('👥 Fetching clients list...');
    const response = await api.get('/organization/clients');
    console.log('👥 Clients list response:', response.data);
    return response;
  },

  createClientWithMultipart: async (formData) => {
    console.log('➕ Creating new client with documents...');
    const response = await api.post('/organization/clients', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('➕ Client creation response:', response.data);
    return response;
  },

  getClientDetails: async (clientId) => {
    console.log('🔍 Fetching client details for ID:', clientId);
    const response = await api.get(`/organization/clients/${clientId}`);
    console.log('🔍 Client details response:', response.data);
    return response;
  },

  editClient: async (clientId, data) => {
    console.log('✏️ Editing client ID:', clientId, 'with data:', data);
    const response = await api.put(`/organization/clients/${clientId}`, data);
    console.log('✏️ Client edit response:', response.data);
    return response;
  },

  editClientWithDocuments: async (clientId, formData) => {
    console.log('📝 Editing client with documents, ID:', clientId);
    // Use POST with _method=PUT for file uploads
    formData.append('_method', 'PUT');
    const response = await api.post(`/organization/clients/${clientId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    console.log('📝 Client edit with documents response:', response.data);
    return response;
  },

  deleteClient: async (clientId) => {
    console.log('🗑️ Deleting client ID:', clientId);
    const response = await api.delete(`/organization/clients/${clientId}`);
    console.log('🗑️ Client deletion response:', response.data);
    return response;
  },

  deleteClientDocument: async (clientId, documentPath) => {
    console.log('📄 Deleting document for client ID:', clientId, 'path:', documentPath);
    const response = await api.delete(`/organization/clients/${clientId}/documents`, {
      data: { documentPath }
    });
    console.log('📄 Document deletion response:', response.data);
    return response;
  },

  getClientPayments: async (clientId, params = {}) => {
    console.log('💳 Fetching payments for client ID:', clientId, 'params:', params);
    const response = await api.get(`/organization/clients/${clientId}/payments`, { params });
    console.log('💳 Client payments response:', response.data);
    return response;
  },

  getClientInvoices: async (clientId, params = {}) => {
    console.log('🧾 Fetching invoices for client ID:', clientId, 'params:', params);
    const response = await api.get(`/organization/clients/${clientId}/invoices`, { params });
    console.log('🧾 Client invoices response:', response.data);
    return response;
  },

  // Dashboard endpoints
  getOrganizationStats: async () => {
    console.log('📊 Fetching organization dashboard stats...');
    const response = await api.get('/organization/dashboard/stats');
    console.log('📊 Organization dashboard stats response:', response.data);
    return response;
  },

  getRecentActivity: async () => {
    console.log('🔄 Fetching recent activity...');
    const response = await api.get('/organization/recent-activity');
    console.log('🔄 Recent activity response:', response.data);
    return response;
  },

  getTodayPickupsSummary: async () => {
    console.log('📦 Fetching today\'s pickups summary...');
    const response = await api.get('/organization/pickups/today-summary');
    console.log('📦 Today\'s pickups summary response:', response.data);
    return response;
  },

  getFinancialSummary: async () => {
    console.log('💰 Fetching financial summary...');
    const response = await api.get('/organization/financial-summary');
    console.log('💰 Financial summary response:', response.data);
    return response;
  },

  // Secure document viewing
  getSecureDocumentUrl: (documentUrl: string) => {
    const adminData = localStorage.getItem('admin');
    if (adminData) {
      try {
        const parsedData = JSON.parse(adminData);
        const token = parsedData.data?.access_token;
        if (token) {
          return `${documentUrl}?token=${token}`;
        }
      } catch (error) {
        console.error('Error parsing admin data:', error);
      }
    }
    return documentUrl;
  }
};