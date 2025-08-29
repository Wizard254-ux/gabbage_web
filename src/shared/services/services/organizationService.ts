import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  withCredentials: true,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const userData = localStorage.getItem('user');
  if (userData) {
    try {
      const parsedData = JSON.parse(userData);
      const token = parsedData.data?.access_token;
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('Added auth token to request:', config.method?.toUpperCase(), config.url);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
      localStorage.removeItem('user');
    }
  }
  return config;
});

// Add response interceptor for debugging and token refresh
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url, response.data);
    return response;
  },
  async (error) => {
    console.error('API Error:', error.response?.status, error.config?.url, error.response?.data);
    
    // Handle 401 errors (token expired) - but not for refresh-token endpoint to avoid infinite loop
    if (error.response?.status === 401 && 
        error.response?.data?.message === 'Invalid or expired token' &&
        !error.config.url?.includes('/auth/refresh-token') &&
        !error.config._retry) {
      
      error.config._retry = true; // Mark as retry to prevent infinite loop
      
      console.log('Token expired, redirecting to login...');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
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

  // List drivers with pagination and search
  listDrivers: async (params = {}) => {
    const queryParams = new URLSearchParams({
      page: '1',
      limit: '20',
      search: '',
      ...params
    }).toString();
    const response = await api.get(`/organization/drivers?${queryParams}`);
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

  // Routes management with pagination and search
  getAllRoutes: async (params = {}) => {
    const queryParams = new URLSearchParams({
      page: '1',
      limit: '20',
      search: '',
      ...params
    }).toString();
    console.log('🛣️ Fetching routes with params:', params);
    const response = await api.get(`/organization/routes?${queryParams}`);
    console.log('🛣️ Routes response:', response.data);
    return response;
  },

  createRoute: async (data) => {
    console.log('🛣️ Creating route with data:', data);
    const response = await api.post('/organization/routes', data);
    console.log('🛣️ Route creation response:', response.data);
    return response;
  },

  getRouteDetails: async (routeId) => {
    console.log('🛣️ Fetching route details for ID:', routeId);
    const response = await api.get(`/organization/routes/${routeId}`);
    console.log('🛣️ Route details response:', response.data);
    return response;
  },

  updateRoute: async (routeId, data) => {
    console.log('🛣️ Updating route ID:', routeId, 'with data:', data);
    const response = await api.put(`/organization/routes/${routeId}`, data);
    console.log('🛣️ Route update response:', response.data);
    return response;
  },

  deleteRoute: async (routeId) => {
    console.log('🛣️ Deleting route ID:', routeId);
    const response = await api.delete(`/organization/routes/${routeId}`);
    console.log('🛣️ Route deletion response:', response.data);
    return response;
  },

  // Client management
  // List clients with pagination and search
  listClients: async (params = {}) => {
    const queryParams = new URLSearchParams({
      page: '1',
      limit: '20',
      search: '',
      ...params
    }).toString();
    console.log('👥 Fetching clients list with params:', params);
    const response = await api.get(`/organization/clients?${queryParams}`);
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
    const response = await api.post(`/organization/clients/${clientId}`, data);
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
  getDashboardCounts: async () => {
    console.log('📊 Fetching optimized dashboard counts...');
    const response = await api.get('/organization/dashboard/counts');
    console.log('📊 Dashboard counts response:', response.data);
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
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        const token = parsedData.data?.access_token;
        if (token) {
          return `${documentUrl}?token=${token}`;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
    return documentUrl;
  },

  // Invoice management
  getAllInvoices: async (params = {}) => {
    console.log('🧾 Fetching all invoices with params:', params);
    const response = await api.get('/organization/invoices', { params });
    console.log('🧾 All invoices response:', response.data);
    return response;
  },

  createInvoice: async (data) => {
    console.log('🧾 Creating invoice with data:', data);
    const response = await api.post('/organization/invoices', data);
    console.log('🧾 Invoice creation response:', response.data);
    return response;
  },

  getInvoiceDetails: async (invoiceId) => {
    console.log('🧾 Fetching invoice details for ID:', invoiceId);
    const response = await api.get(`/organization/invoices/${invoiceId}`);
    console.log('🧾 Invoice details response:', response.data);
    return response;
  },

  resendInvoices: async (invoiceIds) => {
    console.log('📧 Resending invoices:', invoiceIds);
    const response = await api.post('/organization/invoices/resend', { invoice_ids: invoiceIds });
    console.log('📧 Resend invoices response:', response.data);
    return response;
  },

  exportInvoices: async (params) => {
    console.log('📊 Exporting invoices with params:', params);
    const response = await api.get('/organization/invoices/export', { 
      params,
      responseType: 'blob'
    });
    console.log('📊 Export invoices response received');
    return response;
  },

  getAgingSummary: async (params) => {
    console.log('📈 Fetching aging summary with params:', params);
    const response = await api.get('/organization/invoices/aging-summary', { params });
    console.log('📈 Aging summary response:', response.data);
    return response;
  },

  exportAgingSummary: async (params) => {
    console.log('📊 Exporting aging summary with params:', params);
    const response = await api.get('/organization/invoices/aging-summary/export', { 
      params,
      responseType: 'blob'
    });
    console.log('📊 Export aging summary response received');
    return response;
  },



  // Payment management
  getAllPaymentHistory: async (params = {}) => {
    console.log('💰 Fetching all payment history with params:', params);
    const response = await api.get('/organization/payments', { params });
    console.log('💰 All payment history response:', response.data);
    return response;
  },

  getPaymentHistory: async (accountNumber, params = {}) => {
    console.log('💰 Fetching payment history for account:', accountNumber, 'params:', params);
    const response = await api.get(`/organization/payments/account/${accountNumber}`, { params });
    console.log('💰 Payment history response:', response.data);
    return response;
  },

  createCashPayment: async (data) => {
    console.log('💵 Creating cash payment with data:', data);
    const response = await api.post('/organization/payments/cash', data);
    console.log('💵 Cash payment response:', response.data);
    return response;
  },

  exportPayments: async (params) => {
    console.log('📊 Exporting payments with params:', params);
    const response = await api.get('/organization/payments/export', { 
      params,
      responseType: 'blob'
    });
    console.log('📊 Export payments response received');
    return response;
  },

  getPaymentDetails: async (paymentId) => {
    console.log('🔍 Fetching payment details for ID:', paymentId);
    const response = await api.get(`/organization/payments/${paymentId}`);
    console.log('🔍 Payment details response:', response.data);
    return response;
  },

  // Pickup management
  getPickups: async (params = {}) => {
    console.log('📦 Fetching pickups with params:', params);
    const response = await api.get('/organization/pickups', { params });
    console.log('📦 Pickups response:', response.data);
    return response;
  },

  getPickupRoutes: async () => {
    console.log('🛣️ Fetching pickup routes...');
    const response = await api.get('/organization/routes');
    console.log('🛣️ Pickup routes response:', response.data);
    return response;
  },

  getPickupDrivers: async () => {
    console.log('🚛 Fetching pickup drivers...');
    const response = await api.get('/organization/drivers');
    console.log('🚛 Pickup drivers response:', response.data);
    return response;
  },

  createWeeklyPickups: async () => {
    console.log('📅 Creating weekly pickups...');
    const response = await api.post('/organization/pickups/weekly');
    console.log('📅 Weekly pickups response:', response.data);
    return response;
  },

  updatePickupStatus: async (pickupId, data) => {
    console.log('✏️ Updating pickup status for ID:', pickupId, 'with data:', data);
    const response = await api.put(`/organization/pickups/${pickupId}`, data);
    console.log('✏️ Pickup status update response:', response.data);
    return response;
  },

  getClientsToPickup: async (params = {}) => {
    console.log('👥 Fetching clients to pickup with params:', params);
    const response = await api.get('/organization/pickups/clients', { params });
    console.log('👥 Clients to pickup response:', response.data);
    return response;
  },

  createPickup: async (data) => {
    console.log('📦 Creating pickup with data:', data);
    const response = await api.post('/organization/pickups', data);
    console.log('📦 Create pickup response:', response.data);
    return response;
  },

  searchClients: async (params) => {
    console.log('🔍 Searching clients with params:', params);
    const response = await api.get('/organization/clients/search', { params });
    console.log('🔍 Search clients response:', response.data);
    return response;
  },

  // Bag management
  getOrganizationBags: async (params = {}) => {
    console.log('🎒 Fetching organization bags overview with params:', params);
    const response = await api.get('/organization/bags', { params });
    console.log('🎒 Organization bags response:', response.data);
    return response;
  },

  addBags: async (data) => {
    console.log('➕ Adding bags to inventory:', data);
    const response = await api.post('/organization/bags/add', data);
    console.log('➕ Add bags response:', response.data);
    return response;
  },

  removeBags: async (data) => {
    console.log('➖ Removing bags from inventory:', data);
    const response = await api.post('/organization/bags/remove', data);
    console.log('➖ Remove bags response:', response.data);
    return response;
  },

  allocateBags: async (data) => {
    console.log('🚛 Allocating bags to driver:', data);
    const response = await api.post('/organization/bags/allocate', data);
    console.log('🚛 Allocate bags response:', response.data);
    return response;
  },

  getBagDistributionHistory: async (params = {}) => {
    console.log('📋 Fetching bag distribution history with params:', params);
    const response = await api.get('/organization/bags/issues/list', { params });
    console.log('📋 Bag distribution history response:', response.data);
    return response;
  },

  processBagReturn: async (data) => {
    console.log('🔄 Processing bag return with data:', data);
    const response = await api.post('/organization/bags/process-return', data);
    console.log('🔄 Process bag return response:', response.data);
    return response;
  },

  getBagTransfers: async (params = {}) => {
    console.log('🔄 Fetching bag transfers with params:', params);
    const response = await api.get('/organization/bags/transfers', { params });
    console.log('🔄 Bag transfers response:', response.data);
    return response;
  },

  toggleClientStatus: async (clientId: string | number, isActive: boolean) => {
    console.log('🔄 Toggling client status:', { clientId, isActive });
    const response = await api.post(`/organization/clients/${clientId}/toggle-status`, { isActive });
    console.log('🔄 Toggle client status response:', response.data);
    return response;
  },

  toggleDriverStatus: async (driverId: string | number, isActive: boolean) => {
    console.log('🔄 Toggling driver status:', { driverId, isActive });
    const response = await api.post(`/organization/drivers/${driverId}/toggle-status`, { isActive });
    console.log('🔄 Toggle driver status response:', response.data);
    return response;
  }
};