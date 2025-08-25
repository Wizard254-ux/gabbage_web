import axios from './axios';

export interface Organization {
  id: number;
  name: string;
  email: string;
  phone?: string;
  adress?: string;
  role: string;
  isActive: boolean;
  isSent: boolean;
  createdAt: string;
  updatedAt: string;
  documents?: string[];
}

export interface Admin {
  id: number;
  name: string;
  email: string;
  phone?: string;
  created_at: string;
}

export interface CreateOrganizationData {
  name: string;
  email: string;
  phone?: string;
  adress?: string;
  uploaded_documents?: string[];
}

export interface CreateAdminData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface ManageOrganizationData {
  action: 'edit' | 'delete' | 'list';
  organizationId?: number;
  updateData?: {
    name?: string;
    email?: string;
    phone?: string;
    adress?: string;
  };
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: 'name' | 'email' | 'created_at' | 'updated_at';
  sortOrder?: 'asc' | 'desc';
}

class AdminService {
  // Organization Management
  async createOrganization(data: CreateOrganizationData) {
    const response = await axios.post('/auth/create-organization', data);
    return response.data;
  }

  async getOrganizations(params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: string;
  }) {
    const response = await axios.post('/auth/organization/manage', {
      action: 'list',
      ...params
    });
    return response.data;
  }

  async getOrganization(id: number) {
    const response = await axios.get(`/admin/organizations/${id}`);
    return response.data;
  }

  async updateOrganization(id: number, updateData: any) {
    const response = await axios.post('/auth/organization/manage', {
      action: 'edit',
      organizationId: id,
      updateData
    });
    return response.data;
  }

  async deleteOrganization(id: number) {
    const response = await axios.post('/auth/organization/manage', {
      action: 'delete',
      organizationId: id
    });
    return response.data;
  }

  async sendOrganizationCredentials(organizationId: number) {
    const response = await axios.post('/admin/organizations/send-credentials', {
      organizationId
    });
    return response.data;
  }

  // Admin Management
  async getAdmins() {
    const response = await axios.get('/admin/admins/list');
    return response.data;
  }

  async createAdmin(data: CreateAdminData) {
    const response = await axios.post('/admin/admins/create', data);
    return response.data;
  }

  // Dashboard Stats
  async getDashboardStats() {
    const response = await axios.get('/admin/dashboard/stats');
    return response.data;
  }

  // Activity Logs
  async getActivityLogs(params?: {
    page?: number;
    limit?: number;
    action?: string;
    user_id?: number;
  }) {
    const response = await axios.get('/admin/activity-logs', { params });
    return response.data;
  }

  // System Stats
  async getSystemStats() {
    const response = await axios.get('/admin/system/stats');
    return response.data;
  }

  // Deactivate Organization
  async deactivateOrganization(organizationId: number) {
    const response = await axios.post('/admin/organizations/deactivate', {
      organizationId
    });
    return response.data;
  }
}

export default new AdminService();