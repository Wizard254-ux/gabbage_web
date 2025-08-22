import React, { useState, useEffect } from "react";
import { adminService } from "../../services/axios";

interface Organization {
  id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  statistics: {
    totalDrivers: number;
    activeDrivers: number;
    totalClients: number;
    activeClients: number;
    totalUsers: number;
  };
}

interface OrganizationManagementProps {
  onLogout: () => void;
}

export const OrganizationManagement: React.FC<OrganizationManagementProps> = ({
  onLogout,
}) => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
    const [creating, setCreating] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    role: "organization",
  });
  const [documents, setDocuments] = useState<File[]>([]);
  const [documentPreviews, setDocumentPreviews] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    isActive: true,
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeactivating, setIsDeactivating] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    fetchOrganizations();
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdown && !(event.target as Element).closest('.relative')) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdown]);

  const fetchOrganizations = async () => {
    try {
      const requestBody = {
        action: "list",
        page: 1,
        limit: 10,
        search: "",
        isActive: true,
        sortBy: "createdAt",
        sortOrder: "desc"
      };
      console.log('Fetching organizations with request:', requestBody);
      const response = await adminService.listOrganizations(requestBody);
      console.log('Organizations response:', response.data);
      setOrganizations(response.data.organizations || []);
    } catch (error: any) {
      console.error("Failed to fetch organizations:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to fetch organizations';
      alert(`Error fetching organizations: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocuments(files);

    const previews = files.map(file => {
      if (file.type.startsWith('image/')) {
        return URL.createObjectURL(file);
      }
      return '';
    });
    setDocumentPreviews(previews);
  };

  const removeDocument = (index: number) => {
    const newDocuments = documents.filter((_, i) => i !== index);
    const newPreviews = documentPreviews.filter((_, i) => i !== index);
    setDocuments(newDocuments);
    setDocumentPreviews(newPreviews);
  };

  const handleAddOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
        setCreating(true);

    try {
      const formDataObj = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataObj.append(key, value);
      });

      documents.forEach((file) => {
        formDataObj.append('documents', file);
      });

      await adminService.addOrganization(formDataObj);
      setShowAddForm(false);
      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        address: "",
        role: "organization",
      });
      setDocuments([]);
      setDocumentPreviews([]);
      fetchOrganizations();
    } catch (error) {
      console.error("Failed to add organization:", error);
    } finally {
          setCreating(false);

    }
  };

  const handleViewDetails = (org: Organization) => {
    setSelectedOrg(org);
    setShowViewModal(true);
    setOpenDropdown(null);
  };

  const handleEditOrganization = (org: Organization) => {
    setSelectedOrg(org);
    setEditFormData({
      name: org.name,
      email: org.email,
      phone: org.phone,
      isActive: org.isActive,
    });
    setShowEditModal(true);
    setOpenDropdown(null);
  };

  const handleUpdateOrganization = async () => {
    if (!selectedOrg || isUpdating) return;

    setIsUpdating(true);
    try {
      const changedData: any = {};
      if (editFormData.name !== selectedOrg.name) changedData.name = editFormData.name;
      if (editFormData.email !== selectedOrg.email) changedData.email = editFormData.email;
      if (editFormData.phone !== selectedOrg.phone) changedData.phone = editFormData.phone;
      if (editFormData.isActive !== selectedOrg.isActive) changedData.isActive = editFormData.isActive;

      if (Object.keys(changedData).length === 0) {
        setShowEditModal(false);
        return;
      }

      console.log('Updating organization:', selectedOrg.id, 'with data:', changedData);
      const response = await adminService.updateOrganization(selectedOrg.id, changedData);
      console.log('Update response:', response);
      
      setShowEditModal(false);
      setSelectedOrg(null);
      setSuccessMessage('Organization updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchOrganizations();
    } catch (error: any) {
      console.error("Failed to update organization:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update organization';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteClick = (org: Organization) => {
    setSelectedOrg(org);
    setDeleteConfirmText('');
    setShowDeleteModal(true);
    setOpenDropdown(null);
  };

  const handleDeactivateClick = (org: Organization) => {
    setSelectedOrg(org);
    setShowDeactivateModal(true);
    setOpenDropdown(null);
  };

  const handleDeactivateConfirm = async () => {
    if (!selectedOrg || isDeactivating) return;

    setIsDeactivating(true);
    const newStatus = !selectedOrg.isActive;
    try {
      console.log(`${newStatus ? 'Activating' : 'Deactivating'} organization:`, selectedOrg.id);
      const response = await adminService.updateOrganization(selectedOrg.id, { isActive: newStatus });
      console.log('Deactivate/Activate response:', response);
      
      setShowDeactivateModal(false);
      setSelectedOrg(null);
      setSuccessMessage(`Organization ${newStatus ? 'activated' : 'deactivated'} successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchOrganizations();
    } catch (error: any) {
      console.error(`Failed to ${newStatus ? 'activate' : 'deactivate'} organization:`, error);
      const errorMessage = error.response?.data?.message || error.message || `Failed to ${newStatus ? 'activate' : 'deactivate'} organization`;
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsDeactivating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!selectedOrg || isDeleting || deleteConfirmText !== 'delete') return;

    setIsDeleting(true);
    try {
      console.log('Deleting organization:', selectedOrg.id);
      const response = await adminService.deleteOrganization(selectedOrg.id);
      console.log('Delete response:', response);
      
      setShowDeleteModal(false);
      setSelectedOrg(null);
      setDeleteConfirmText('');
      setSuccessMessage('Organization deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchOrganizations();
    } catch (error: any) {
      console.error("Failed to delete organization:", error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete organization';
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await adminService.logout();
      onLogout();
    } catch (error) {
      console.error("Logout failed:", error);
      onLogout();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading organizations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center mr-3">
                <span className="text-white text-sm">🌱</span>
              </div>
              <h1 className="text-xl font-semibold text-gray-900">
                GreenLife Admin
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-xl flex items-center">
            <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            {successMessage}
          </div>
        )}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                Organization Management
              </h2>
              <p className="text-gray-600 mt-1">
                Manage and monitor all organizations
              </p>
            </div>
            <button
              onClick={() => setShowAddForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              + Add Organization
            </button>
          </div>
        </div>

        {/* Add Organization Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="sticky top-0 bg-white border-b px-8 py-6 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Add New Organization</h3>
                    <p className="text-gray-600 mt-1">Create a new organization account</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setFormData({ name: "", email: "", phone: "", address: "", role: "organization" });
                      setDocuments([]);
                      setDocumentPreviews([]);
                    }}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <form onSubmit={handleAddOrganization} className="px-8 py-6 space-y-6">
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Organization Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter organization name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      placeholder="organization@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>



                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address *
                    </label>
                    <textarea
                      placeholder="Enter complete address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                      rows={3}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Documents (Optional)
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        multiple
                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                        onChange={handleDocumentChange}
                        className="hidden"
                        id="file-upload"
                      />
                      <label
                        htmlFor="file-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <svg className="w-8 h-8 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PDF, DOC, DOCX, JPG, JPEG, PNG</p>
                        </div>
                      </label>
                    </div>

                    {documents.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <h4 className="text-sm font-medium text-gray-700">Uploaded Files ({documents.length})</h4>
                        {documents.map((file, index) => (
                          <div key={index} className="flex items-center justify-between bg-green-50 border border-green-200 p-3 rounded-lg">
                            <div className="flex items-center space-x-3">
                              {documentPreviews[index] ? (
                                <img src={documentPreviews[index]} alt="Preview" className="w-10 h-10 object-cover rounded-lg" />
                              ) : (
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </div>
                              )}
                              <div>
                                <p className="text-sm font-medium text-gray-900 truncate max-w-48">{file.name}</p>
                                <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(1)} KB</p>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeDocument(index)}
                              className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                      ))}
                    </div>
                  )}
                </div>
                </div>

                <div className="flex gap-4 pt-6 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setFormData({ name: "", email: "", phone: "", address: "", role: "organization" });
                      setDocuments([]);
                      setDocumentPreviews([]);
                    }}
                    className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                      disabled={creating}
                    type="submit"
                    className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl"
                  >
                    {creating ? "Creating & Sending Credentials...": "Create & Send Credentials"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Organizations Table */}
        <div className="bg-white  shadow-sm  overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">#</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statistics</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {organizations.map((org, index) => (
                  <tr key={org.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-3">
                          <span className="text-green-600 font-semibold text-sm">
                            {org.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{org.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{org.email}</div>
                      <div className="text-sm text-gray-500">{org.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        org.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {org.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-4">
                        <span className="text-blue-600 font-medium">{org.statistics.totalDrivers} Drivers</span>
                        <span className="text-green-600 font-medium">{org.statistics.totalClients} Clients</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(org.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium relative">
                      <button
                        onClick={() => setOpenDropdown(openDropdown === org.id ? null : org.id)}
                        className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                        </svg>
                      </button>
                      {openDropdown === org.id && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                          <div className="py-1">
                            <button
                              onClick={() => handleViewDetails(org)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              View Details
                            </button>
                            <button
                              onClick={() => handleEditOrganization(org)}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeactivateClick(org)}
                              className="flex items-center px-4 py-2 text-sm text-orange-600 hover:bg-orange-50 w-full text-left"
                            >
                              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
                              </svg>
                              {org.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => handleDeleteClick(org)}
                              className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                            >
                              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {organizations.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏢</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No organizations yet
              </h3>
              <p className="text-gray-600">
                Get started by adding your first organization.
              </p>
            </div>
          </div>
        )}

        {/* View Details Modal */}
        {showViewModal && selectedOrg && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border">
              <div className="sticky top-0 bg-gradient-to-r from-green-50 to-blue-50 border-b px-8 py-6 rounded-t-3xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-bold text-lg">{selectedOrg.name.charAt(0).toUpperCase()}</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">{selectedOrg.name}</h3>
                      <p className="text-gray-600">Organization Details</p>
                    </div>
                  </div>
                  <button onClick={() => setShowViewModal(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-white/50 transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="px-8 py-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Organization Name</label>
                      <p className="text-lg font-medium text-gray-900">{selectedOrg.name}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Email Address</label>
                      <p className="text-lg font-medium text-gray-900">{selectedOrg.email}</p>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Phone Number</label>
                      <p className="text-lg font-medium text-gray-900">{selectedOrg.phone}</p>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-xl">
                      <label className="block text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">Status</label>
                      <span className={`inline-flex px-4 py-2 text-sm font-bold rounded-full ${selectedOrg.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {selectedOrg.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="border-t pt-8">
                  <h4 className="text-xl font-bold text-gray-900 mb-6">Organization Statistics</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl text-center border border-blue-200">
                      <div className="text-3xl font-bold text-blue-600 mb-2">{selectedOrg.statistics.totalDrivers}</div>
                      <div className="text-sm font-semibold text-blue-800">Total Drivers</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl text-center border border-green-200">
                      <div className="text-3xl font-bold text-green-600 mb-2">{selectedOrg.statistics.activeDrivers}</div>
                      <div className="text-sm font-semibold text-green-800">Active Drivers</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl text-center border border-purple-200">
                      <div className="text-3xl font-bold text-purple-600 mb-2">{selectedOrg.statistics.totalClients}</div>
                      <div className="text-sm font-semibold text-purple-800">Total Clients</div>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl text-center border border-orange-200">
                      <div className="text-3xl font-bold text-orange-600 mb-2">{selectedOrg.statistics.activeClients}</div>
                      <div className="text-sm font-semibold text-orange-800">Active Clients</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && selectedOrg && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border">
              <div className="sticky top-0 bg-gradient-to-r from-green-50 to-blue-50 border-b px-8 py-6 rounded-t-3xl z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">Edit Organization</h3>
                      <p className="text-gray-600">Update organization information</p>
                    </div>
                  </div>
                  <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-white/50 transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleUpdateOrganization(); }} className="px-8 py-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Organization Name *</label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                      placeholder="Enter organization name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Email Address *</label>
                    <input
                      type="email"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                      placeholder="organization@example.com"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Phone Number *</label>
                    <input
                      type="tel"
                      value={editFormData.phone}
                      onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">Status</label>
                    <select
                      value={editFormData.isActive.toString()}
                      onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.value === 'true' })}
                      className="w-full px-4 py-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all bg-gray-50 focus:bg-white"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-4 pt-8 border-t-2 border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    disabled={isUpdating}
                    className="flex-1 px-8 py-4 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="flex-1 px-8 py-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isUpdating ? 'Updating...' : 'Update Organization'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Deactivate Confirmation Modal */}
        {showDeactivateModal && selectedOrg && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border">
              <div className="bg-gradient-to-r from-orange-50 to-yellow-50 border-b px-8 py-6 rounded-t-3xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedOrg.isActive ? 'Deactivate' : 'Activate'} Organization</h3>
                    <p className="text-gray-600">Change organization status</p>
                  </div>
                </div>
              </div>
              <div className="px-8 py-6">
                <p className="text-gray-700 mb-6">
                  Are you sure you want to {selectedOrg.isActive ? 'deactivate' : 'activate'} <span className="font-bold text-gray-900">{selectedOrg.name}</span>?
                  {selectedOrg.isActive ? ' This will prevent the organization from accessing the system.' : ' This will restore the organization\'s access to the system.'}
                </p>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowDeactivateModal(false)}
                    disabled={isDeactivating}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeactivateConfirm}
                    disabled={isDeactivating}
                    className={`flex-1 px-6 py-3 ${selectedOrg.isActive ? 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800' : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'} text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {isDeactivating ? (selectedOrg.isActive ? 'Deactivating...' : 'Activating...') : (selectedOrg.isActive ? 'Deactivate Organization' : 'Activate Organization')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && selectedOrg && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border">
              <div className="bg-gradient-to-r from-red-50 to-orange-50 border-b px-8 py-6 rounded-t-3xl">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Delete Organization</h3>
                    <p className="text-gray-600">This action cannot be undone</p>
                  </div>
                </div>
              </div>
              <div className="px-8 py-6">
                <p className="text-gray-700 mb-4">
                  Are you sure you want to delete <span className="font-bold text-gray-900">{selectedOrg.name}</span>?
                  This will permanently remove the organization and all associated data.
                </p>
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Type <span className="text-red-600 font-bold">delete</span> to confirm:
                  </label>
                  <input
                    type="text"
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    placeholder="Type 'delete' to confirm"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  />
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeleteConfirmText('');
                    }}
                    disabled={isDeleting}
                    className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteConfirm}
                    disabled={isDeleting || deleteConfirmText !== 'delete'}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete Organization'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
