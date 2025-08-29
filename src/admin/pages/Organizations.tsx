import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Avatar,
  Card,
  CardContent,
  CircularProgress,
  Backdrop,
  Pagination,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Business as BusinessIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Send as SendIcon,
  CloudUpload as CloudUploadIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
} from '@mui/icons-material';
import { adminService } from '../../shared/services/services/axios';

interface Organization {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  isActive: boolean;
  isSent: boolean;
  documents: (string | { url?: string; path?: string; original_name?: string })[];
  created_at: string;
  updated_at: string;
}

const Organizations: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [sendingCredentials, setSendingCredentials] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deactivateConfirmText, setDeactivateConfirmText] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [downloadingDoc, setDownloadingDoc] = useState<number | null>(null);
  const [openingDoc, setOpeningDoc] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const [documents, setDocuments] = useState<File[]>([]);

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async (currentPage = 1) => {
    try {
      const requestBody = {
        action: "list",
        page: currentPage,
        limit: 10,
        search: "",
        isActive: true,
        sortOrder: "desc"
      };
      
      const response = await adminService.listOrganizations(requestBody);
      const data = response.data.data;
      setOrganizations(data.organizations || []);
      setTotal(data.total || 0);
      setTotalPages(Math.ceil((data.total || 0) / 10));
      setPage(currentPage);
    } catch (error: any) {
      console.error("Failed to fetch organizations:", error);
      let errorMsg = 'Failed to load organizations. Please try again.';
      
      if (error.code === 'ECONNABORTED') {
        errorMsg = 'Request timeout. The server is taking too long to respond.';
      } else if (error.response?.status === 500) {
        errorMsg = 'Server error. Please try again later.';
      } else if (error.response?.status === 401) {
        errorMsg = 'Session expired. Please login again.';
      }
      
      setErrorMessage(errorMsg);
      setShowErrorDialog(true);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, org: Organization) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrg(org);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    // Don't clear selectedOrg immediately as it's needed for dialogs
  };

  const handleView = () => {
    console.log('View clicked, selectedOrg:', selectedOrg);
    setShowViewDialog(true);
    // Don't close menu immediately to preserve selectedOrg
  };

  const handleEdit = () => {
    console.log('Edit clicked, selectedOrg:', selectedOrg);
    if (selectedOrg) {
      setEditFormData({
        name: selectedOrg.name,
        email: selectedOrg.email,
        phone: selectedOrg.phone,
        address: selectedOrg.address || '',
      });
      setShowEditDialog(true);
    }
    // Don't close menu immediately to preserve selectedOrg
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
    setDeleteConfirmText('');
    handleMenuClose();
  };

  const handleDeactivate = () => {
    setShowDeactivateDialog(true);
    setDeactivateConfirmText('');
    handleMenuClose();
  };

  const handleSendCredentials = async () => {
    if (!selectedOrg) return;
    
    setSendingCredentials(true);
    try {
      await adminService.sendCredentials(selectedOrg.id);
      setSuccessMessage(`Credentials ${selectedOrg.isSent ? 'resent' : 'sent'} successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
      fetchOrganizations();
    } catch (error: any) {
      console.error("Failed to send credentials:", error);
    } finally {
      setSendingCredentials(false);
    }
    handleMenuClose();
  };

  const handleDeleteConfirm = async () => {
    if (!selectedOrg || deleteConfirmText !== 'delete') return;

    setDeleting(true);
    try {
      await adminService.deleteOrganization(selectedOrg.id);
      
      // Remove organization from list immediately
      setOrganizations(prev => prev.filter(org => org.id !== selectedOrg.id));
      setTotal(prev => prev - 1);
      
      setShowDeleteDialog(false);
      setSelectedOrg(null);
      setDeleteConfirmText('');
      setSuccessMessage('Organization deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error("Failed to delete organization:", error);
    } finally {
      setDeleting(false);
    }
  };

  const handleDeactivateConfirm = async () => {
    if (!selectedOrg || deactivateConfirmText !== 'deactivate') return;

    setDeactivating(true);
    try {
      await adminService.toggleOrganizationStatus(selectedOrg.id);
      
      // Update organization status immediately
      setOrganizations(prev => prev.map(org => 
        org.id === selectedOrg.id 
          ? { ...org, isActive: !org.isActive, updated_at: new Date().toISOString() }
          : org
      ));
      
      setShowDeactivateDialog(false);
      setSelectedOrg(null);
      setDeactivateConfirmText('');
      setSuccessMessage(`Organization ${selectedOrg.isActive ? 'deactivated' : 'activated'} successfully!`);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error("Failed to deactivate organization:", error);
    } finally {
      setDeactivating(false);
    }
  };

  const handleAddOrganization = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCreating(true);

    try {
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('email', formData.email);
      formDataObj.append('phone', formData.phone);
      formDataObj.append('address', formData.address);

      documents.forEach((file) => {
        formDataObj.append('uploaded_documents[]', file);
      });
      
      console.log('FormData being sent:');
      console.log('Number of files:', documents.length);
      for (let [key, value] of formDataObj.entries()) {
        console.log(key, value);
      }
      
      // Log file details
      documents.forEach((file, index) => {
        console.log(`File ${index}:`, file.name, file.size, file.type);
      });
      
      console.log('Admin token check:', {
        hasAdmin: !!localStorage.getItem('admin'),
        token: localStorage.getItem('admin') ? JSON.parse(localStorage.getItem('admin')!).data?.access_token?.substring(0, 20) + '...' : 'none'
      });

      const response = await adminService.addOrganization(formDataObj);
      
      // Create new organization object from response
      const userData = response.data.data.user;
      const newOrganization = {
        id: userData.id.toString(),
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        address: userData.address,
        isActive: userData.isActive || false,
        isSent: userData.isSent,
        documents: userData.documents,
        created_at: userData.created_at,
        updated_at: userData.updated_at
      };
      
      // Update UI immediately without refetching
      setOrganizations(prev => [newOrganization, ...prev]);
      setTotal(prev => prev + 1);
      
      setShowAddDialog(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
      });
      setDocuments([]);
      setSuccessMessage('Organization created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error("Failed to add organization:", error);
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join('\n');
        setErrorMessage(errorMessages);
        setShowErrorDialog(true);
      } else {
        setErrorMessage('Failed to create organization. Please try again.');
        setShowErrorDialog(true);
      }
    } finally {
      setCreating(false);
    }
  };

  const handleUpdateOrganization = async () => {
    if (!selectedOrg) return;

    setUpdating(true);
    try {
      const changedData: any = {};
      if (editFormData.name !== selectedOrg.name) changedData.name = editFormData.name;
      if (editFormData.email !== selectedOrg.email) changedData.email = editFormData.email;
      if (editFormData.phone !== selectedOrg.phone) changedData.phone = editFormData.phone;
      if (editFormData.address !== (selectedOrg.address || '')) changedData.address = editFormData.address;

      if (Object.keys(changedData).length === 0) {
        setShowEditDialog(false);
        return;
      }

      const response = await adminService.updateOrganization(selectedOrg.id, changedData);
      
      // Update organization in the list immediately
      setOrganizations(prev => prev.map(org => 
        org.id === selectedOrg.id 
          ? { ...org, ...changedData, updated_at: new Date().toISOString() }
          : org
      ));
      
      setShowEditDialog(false);
      setSelectedOrg(null);
      setSuccessMessage('Organization updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error("Failed to update organization:", error);
    } finally {
      setUpdating(false);
    }
  };

  const handleDocumentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setDocuments(files);
  };

  const removeDocument = (index: number) => {
    setDocuments(documents.filter((_, i) => i !== index));
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" component="h1">
          Organization Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAddDialog(true)}
        >
          Add Organization
        </Button>
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {organizations.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <BusinessIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No organizations yet
          </Typography>
          <Typography color="text.secondary">
            Get started by adding your first organization.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Organization</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Credentials</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {organizations.map((org, index) => (
                <TableRow key={org.id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        {org.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="subtitle2">{org.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{org.email}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {org.phone}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={org.isActive ? 'Active' : 'Inactive'}
                      color={org.isActive ? 'success' : 'error'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={org.isSent ? 'Sent' : 'Not Sent'}
                      color={org.isSent ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(org.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={(e) => handleMenuClick(e, org)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Box display="flex" justifyContent="center" mt={3}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_, newPage) => fetchOrganizations(newPage)}
            color="primary"
          />
        </Box>
      )}

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          <VisibilityIcon sx={{ mr: 1 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={handleSendCredentials} disabled={sendingCredentials}>
          <SendIcon sx={{ mr: 1 }} />
          {sendingCredentials ? 'Sending...' : (selectedOrg?.isSent ? 'Resend Credentials' : 'Send Credentials')}
        </MenuItem>
        <MenuItem onClick={handleDeactivate}>
          <BlockIcon sx={{ mr: 1 }} />
          {selectedOrg?.isActive ? 'Deactivate' : 'Activate'}
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Add Organization Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Organization</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <TextField
                sx={{ flex: 1, minWidth: '200px' }}
                label="Organization Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
              <TextField
                sx={{ flex: 1, minWidth: '200px' }}
                label="Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </Box>
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Address"
              multiline
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
            <Button
              variant="outlined"
              component="label"
              startIcon={<CloudUploadIcon />}
              fullWidth
            >
              Upload Documents
              <input
                type="file"
                hidden
                multiple
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleDocumentChange}
              />
            </Button>
            {documents.length > 0 && (
              <Box>
                {documents.map((file, index) => (
                  <Chip
                    key={index}
                    label={file.name}
                    onDelete={() => removeDocument(index)}
                    sx={{ mr: 1, mb: 1 }}
                  />
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowAddDialog(false);
            setFormData({
              name: '',
              email: '',
              phone: '',
              address: '',
            });
            setDocuments([]);
          }}>Cancel</Button>
          <Button onClick={handleAddOrganization} variant="contained" disabled={creating}>
            {creating ? 'Creating Organization...' : 'Create Organization'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Dialog */}
      <Dialog open={showViewDialog} onClose={() => {
        setShowViewDialog(false);
        setSelectedOrg(null);
      }} maxWidth="lg" fullWidth>
        <DialogTitle>Organization Details</DialogTitle>
        <DialogContent>
          {selectedOrg && (
            <Box sx={{ display: 'flex', gap: 3, mt: 1, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 2, minWidth: '300px' }}>
                <Card>
                  <CardContent>
                    <Typography variant="h5" gutterBottom color="primary">
                      {selectedOrg.name}
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" color="text.secondary">Email:</Typography>
                          <Typography variant="body1" gutterBottom>{selectedOrg.email}</Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" color="text.secondary">Phone:</Typography>
                          <Typography variant="body1" gutterBottom>{selectedOrg.phone}</Typography>
                        </Box>
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">Address:</Typography>
                        <Typography variant="body1" gutterBottom>{selectedOrg.address || 'Not provided'}</Typography>
                      </Box>
                      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" color="text.secondary">Created:</Typography>
                          <Typography variant="body1" gutterBottom>
                            {new Date(selectedOrg.created_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="subtitle2" color="text.secondary">Last Updated:</Typography>
                          <Typography variant="body1" gutterBottom>
                            {new Date(selectedOrg.updated_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                    <Box sx={{ mt: 3 }}>
                      <Chip
                        label={selectedOrg.isActive ? 'Active' : 'Inactive'}
                        color={selectedOrg.isActive ? 'success' : 'error'}
                        sx={{ mr: 1, mb: 1 }}
                      />
                      <Chip
                        label={selectedOrg.isSent ? 'Credentials Sent' : 'Credentials Not Sent'}
                        color={selectedOrg.isSent ? 'success' : 'warning'}
                        sx={{ mr: 1, mb: 1 }}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Box>
              <Box sx={{ flex: 1, minWidth: '250px' }}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Documents
                    </Typography>
                    {selectedOrg.documents && selectedOrg.documents.length > 0 ? (
                      selectedOrg.documents.map((doc, index) => {
                        const docUrl = typeof doc === 'string' ? doc : doc?.url || '';
                        const fileName = typeof doc === 'object' ? (doc.original_name || doc.filename || `Document ${index + 1}`) : (docUrl ? docUrl.split('/').pop() || `Document ${index + 1}` : `Document ${index + 1}`);
                        const isDocx = fileName.toLowerCase().endsWith('.docx') || fileName.toLowerCase().endsWith('.doc');
                        const isPdf = fileName.toLowerCase().endsWith('.pdf');
                        
                        return (
                          <Box key={index} sx={{ mb: 2, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="body2">
                                {isPdf ? '📄' : isDocx ? '📝' : '📎'}
                              </Typography>
                              <Typography variant="body2" sx={{ flex: 1 }}>
                                {fileName}
                              </Typography>
                            </Box>
                            <Box sx={{ mt: 1 }}>
                              {isPdf ? (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  disabled={openingDoc === index}
                                  onClick={async () => {
                                    setOpeningDoc(index);
                                    try {
                                      let token = null;
                                      const admin = localStorage.getItem('admin');
                                      const user = localStorage.getItem('user');
                                      
                                      if (admin) {
                                        const adminData = JSON.parse(admin);
                                        token = adminData.data?.access_token;
                                      } else if (user) {
                                        const userData = JSON.parse(user);
                                        token = userData.data?.access_token || userData.access_token;
                                      }
                                      
                                      const response = await fetch(docUrl, {
                                        headers: {
                                          'Authorization': `Bearer ${token}`
                                        }
                                      });
                                      
                                      if (response.ok) {
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        window.open(url, '_blank');
                                        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
                                      } else {
                                        throw new Error('Failed to fetch document');
                                      }
                                    } catch (error) {
                                      console.error('Error opening PDF:', error);
                                    } finally {
                                      setOpeningDoc(null);
                                    }
                                  }}
                                >
                                  {openingDoc === index ? 'Opening...' : 'Open PDF'}
                                </Button>
                              ) : (
                                <Button
                                  size="small"
                                  variant="outlined"
                                  disabled={downloadingDoc === index}
                                  onClick={async () => {
                                    setDownloadingDoc(index);
                                    try {
                                      let token = null;
                                      const admin = localStorage.getItem('admin');
                                      const user = localStorage.getItem('user');
                                      
                                      if (admin) {
                                        const adminData = JSON.parse(admin);
                                        token = adminData.data?.access_token;
                                      } else if (user) {
                                        const userData = JSON.parse(user);
                                        token = userData.data?.access_token || userData.access_token;
                                      }
                                      
                                      const response = await fetch(docUrl, {
                                        headers: {
                                          'Authorization': `Bearer ${token}`
                                        }
                                      });
                                      
                                      if (response.ok) {
                                        const blob = await response.blob();
                                        const url = window.URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.download = fileName;
                                        document.body.appendChild(link);
                                        link.click();
                                        document.body.removeChild(link);
                                        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
                                      } else {
                                        throw new Error('Failed to fetch document');
                                      }
                                    } catch (error) {
                                      console.error('Error downloading file:', error);
                                    } finally {
                                      setDownloadingDoc(null);
                                    }
                                  }}
                                >
                                  {downloadingDoc === index ? 'Downloading...' : 'Download'}
                                </Button>
                              )}
                            </Box>
                          </Box>
                        );
                      })
                    ) : (
                      <Typography color="text.secondary">No documents uploaded</Typography>
                    )}
                  </CardContent>
                </Card>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onClose={() => {
        setShowEditDialog(false);
        setSelectedOrg(null);
      }} maxWidth="md" fullWidth>
        <DialogTitle>Edit Organization</DialogTitle>
        <DialogContent>
          {selectedOrg && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom color="primary">
                {selectedOrg.name}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <TextField
                    sx={{ flex: 1, minWidth: '200px' }}
                    label="Organization Name"
                    value={editFormData.name}
                    onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                    required
                  />
                  <TextField
                    sx={{ flex: 1, minWidth: '200px' }}
                    label="Email"
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    required
                  />
                </Box>
                <TextField
                  fullWidth
                  label="Phone"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  required
                />
                <TextField
                  fullWidth
                  label="Address"
                  multiline
                  rows={3}
                  value={editFormData.address}
                  onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                />
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    Created: {new Date(selectedOrg.created_at).toLocaleDateString()}
                  </Typography>
                  <Chip
                    label={selectedOrg.isActive ? 'Active' : 'Inactive'}
                    color={selectedOrg.isActive ? 'success' : 'error'}
                    size="small"
                  />
                  <Chip
                    label={selectedOrg.isSent ? 'Credentials Sent' : 'Credentials Not Sent'}
                    color={selectedOrg.isSent ? 'success' : 'warning'}
                    size="small"
                  />
                </Box>
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateOrganization} variant="contained" disabled={updating}>
            {updating ? 'Updating...' : 'Update Organization'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'error.main' }}>⚠️ Delete Organization</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action cannot be undone. All organization data will be permanently removed.
          </Alert>
          <Typography gutterBottom>
            Are you sure you want to delete <strong>"{selectedOrg?.name}"</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            This will permanently remove:
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 2 }}>
            <Typography variant="body2" color="text.secondary" component="li">
              Organization profile and settings
            </Typography>
            <Typography variant="body2" color="text.secondary" component="li">
              All associated users and data
            </Typography>
            <Typography variant="body2" color="text.secondary" component="li">
              Uploaded documents
            </Typography>
            <Typography variant="body2" color="text.secondary" component="li">
              Historical records
            </Typography>
          </Box>
          <TextField
            fullWidth
            label="Type 'delete' to confirm"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            sx={{ mt: 2 }}
            helperText="You must type 'delete' exactly to proceed"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowDeleteDialog(false);
            setDeleteConfirmText('');
          }}>Cancel</Button>
          <Button 
            onClick={handleDeleteConfirm} 
            color="error" 
            variant="contained"
            disabled={deleting || deleteConfirmText !== 'delete'}
          >
            {deleting ? 'Deleting...' : 'Delete Organization'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deactivate Confirmation Dialog */}
      <Dialog open={showDeactivateDialog} onClose={() => setShowDeactivateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'warning.main' }}>
          ⚠️ {selectedOrg?.isActive ? 'Deactivate' : 'Activate'} Organization
        </DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            This action will {selectedOrg?.isActive ? 'prevent the organization from accessing the system' : 'restore the organization\'s access to the system'}.
          </Alert>
          <Typography gutterBottom>
            Are you sure you want to {selectedOrg?.isActive ? 'deactivate' : 'activate'} <strong>"{selectedOrg?.name}"</strong>?
          </Typography>
          <TextField
            fullWidth
            label="Type 'deactivate' to confirm"
            value={deactivateConfirmText}
            onChange={(e) => setDeactivateConfirmText(e.target.value)}
            sx={{ mt: 2 }}
            helperText="You must type 'deactivate' exactly to proceed"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowDeactivateDialog(false);
            setDeactivateConfirmText('');
          }}>Cancel</Button>
          <Button 
            onClick={handleDeactivateConfirm} 
            color={selectedOrg?.isActive ? 'warning' : 'success'}
            variant="contained"
            disabled={deactivating || deactivateConfirmText !== 'deactivate'}
          >
            {deactivating ? (selectedOrg?.isActive ? 'Deactivating...' : 'Activating...') : (selectedOrg?.isActive ? 'Deactivate Organization' : 'Activate Organization')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onClose={() => setShowErrorDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'error.main' }}>❌ Error</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowErrorDialog(false)} variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>

      {/* Loading Backdrop */}
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={creating}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
          <CircularProgress color="inherit" />
          <Typography>Creating organization...</Typography>
        </Box>
      </Backdrop>
    </Box>
  );
};

export default Organizations;