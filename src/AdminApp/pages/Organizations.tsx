import React, { useState, useEffect, useRef } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import adminService from '../../services/adminService';

interface Organization {
  id: number;
  name: string;
  email: string;
  phone?: string;
  adress?: string;
  isActive: boolean;
  isSent: boolean;
  createdAt: string;
}

interface CreateOrganizationData {
  name: string;
  email: string;
  phone?: string;
  adress?: string;
}

const Organizations: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuOrgId, setMenuOrgId] = useState<number | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const fetchingRef = useRef(false);

  const [createForm, setCreateForm] = useState<CreateOrganizationData>({
    name: '',
    email: '',
    phone: '',
    adress: ''
  });

  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    adress: ''
  });

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const fetchOrganizations = async () => {
    if (fetchingRef.current) return;
    
    try {
      fetchingRef.current = true;
      setLoading(true);
      setError(null);
      
      const response = await adminService.getOrganizations({
        page: 1,
        limit: 100,
        sortBy: 'created_at',
        sortOrder: 'desc'
      });

      if (response.status) {
        setOrganizations(response.data.organizations);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch organizations');
    } finally {
      setLoading(false);
      fetchingRef.current = false;
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, orgId: number) => {
    setAnchorEl(event.currentTarget);
    setMenuOrgId(orgId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuOrgId(null);
  };

  const handleSendCredentials = async (org: Organization) => {
    try {
      setActionLoading('credentials');
      const response = await adminService.sendOrganizationCredentials(org.id);
      if (response.status) {
        alert('Credentials sent successfully!');
        fetchOrganizations();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to send credentials');
    } finally {
      setActionLoading(null);
    }
    handleMenuClose();
  };

  const handleViewDetails = (org: Organization) => {
    setSelectedOrg(org);
    setShowViewModal(true);
    handleMenuClose();
  };

  const handleEdit = (org: Organization) => {
    setSelectedOrg(org);
    setEditForm({
      name: org.name,
      email: org.email,
      phone: org.phone || '',
      adress: org.adress || ''
    });
    setShowEditModal(true);
    handleMenuClose();
  };

  const handleDeactivate = (org: Organization) => {
    setSelectedOrg(org);
    setShowDeactivateModal(true);
    handleMenuClose();
  };

  const handleDelete = (org: Organization) => {
    setSelectedOrg(org);
    setShowDeleteModal(true);
    setDeleteConfirmText('');
    handleMenuClose();
  };

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await adminService.createOrganization(createForm);
      if (response.status) {
        setShowCreateModal(false);
        setCreateForm({ name: '', email: '', phone: '', adress: '' });
        fetchOrganizations();
        alert('Organization created successfully! Credentials sent to email.');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create organization');
    }
  };

  const handleEditOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrg) return;

    try {
      const response = await adminService.updateOrganization(selectedOrg.id, editForm);
      if (response.status) {
        setShowEditModal(false);
        setSelectedOrg(null);
        fetchOrganizations();
        alert('Organization updated successfully!');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update organization');
    }
  };

  const confirmDeactivate = async () => {
    if (!selectedOrg) return;

    try {
      setActionLoading('deactivate');
      const response = await adminService.deactivateOrganization(selectedOrg.id);
      if (response.status) {
        setShowDeactivateModal(false);
        setSelectedOrg(null);
        fetchOrganizations();
        alert(`Organization ${selectedOrg.isActive ? 'deactivated' : 'activated'} successfully!`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update organization status');
    } finally {
      setActionLoading(null);
    }
  };

  const confirmDelete = async () => {
    if (!selectedOrg || deleteConfirmText !== 'delete') return;

    try {
      setActionLoading('delete');
      const response = await adminService.deleteOrganization(selectedOrg.id);
      if (response.status) {
        setShowDeleteModal(false);
        setSelectedOrg(null);
        setDeleteConfirmText('');
        fetchOrganizations();
        alert('Organization deleted successfully!');
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete organization');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          Create Organization
        </button>
      </div>

      {/* MUI Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Credentials</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <div className="flex justify-center items-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <div className="text-red-600 py-8">{error}</div>
                </TableCell>
              </TableRow>
            ) : (
              organizations.map((org, index) => (
                <TableRow key={org.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{org.name}</TableCell>
                  <TableCell>{org.email}</TableCell>
                  <TableCell>{org.phone || 'N/A'}</TableCell>
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
                      color={org.isSent ? 'primary' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{new Date(org.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <IconButton onClick={(e) => handleMenuClick(e, org.id)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {menuOrgId && (() => {
          const org = organizations.find(o => o.id === menuOrgId);
          if (!org) return null;
          
          return [
            <MenuItem key="view" onClick={() => handleViewDetails(org)}>
              View Details
            </MenuItem>,
            <MenuItem key="edit" onClick={() => handleEdit(org)}>
              Edit
            </MenuItem>,
            <MenuItem key="credentials" onClick={() => handleSendCredentials(org)} disabled={actionLoading === 'credentials'}>
              {actionLoading === 'credentials' ? 'Sending...' : (org.isSent ? 'Resend Credentials' : 'Send Credentials')}
            </MenuItem>,
            <MenuItem key="deactivate" onClick={() => handleDeactivate(org)} disabled={actionLoading === 'deactivate'}>
              {actionLoading === 'deactivate' ? (org.isActive ? 'Deactivating...' : 'Activating...') : (org.isActive ? 'Deactivate' : 'Activate')}
            </MenuItem>,
            <MenuItem key="delete" onClick={() => handleDelete(org)} sx={{ color: 'error.main' }} disabled={actionLoading === 'delete'}>
              {actionLoading === 'delete' ? 'Deleting...' : 'Delete'}
            </MenuItem>
          ];
        })()}
      </Menu>

      {/* Create Modal */}
      <Dialog open={showCreateModal} onClose={() => setShowCreateModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Organization</DialogTitle>
        <form onSubmit={handleCreateOrganization}>
          <DialogContent>
            <TextField
              label="Name"
              fullWidth
              required
              margin="normal"
              value={createForm.name}
              onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              margin="normal"
              value={createForm.email}
              onChange={(e) => setCreateForm({...createForm, email: e.target.value})}
            />
            <TextField
              label="Phone"
              fullWidth
              margin="normal"
              value={createForm.phone}
              onChange={(e) => setCreateForm({...createForm, phone: e.target.value})}
            />
            <TextField
              label="Address"
              fullWidth
              multiline
              rows={3}
              margin="normal"
              value={createForm.adress}
              onChange={(e) => setCreateForm({...createForm, adress: e.target.value})}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowCreateModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Create</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={showEditModal} onClose={() => setShowEditModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Organization</DialogTitle>
        <form onSubmit={handleEditOrganization}>
          <DialogContent>
            <TextField
              label="Name"
              fullWidth
              required
              margin="normal"
              value={editForm.name}
              onChange={(e) => setEditForm({...editForm, name: e.target.value})}
            />
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              margin="normal"
              value={editForm.email}
              onChange={(e) => setEditForm({...editForm, email: e.target.value})}
            />
            <TextField
              label="Phone"
              fullWidth
              margin="normal"
              value={editForm.phone}
              onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
            />
            <TextField
              label="Address"
              fullWidth
              multiline
              rows={3}
              margin="normal"
              value={editForm.adress}
              onChange={(e) => setEditForm({...editForm, adress: e.target.value})}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button type="submit" variant="contained">Update</Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Deactivate Confirmation Modal */}
      <Dialog open={showDeactivateModal} onClose={() => setShowDeactivateModal(false)}>
        <DialogTitle>
          {selectedOrg?.isActive ? 'Deactivate' : 'Activate'} Organization
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {selectedOrg?.isActive ? 'deactivate' : 'activate'} "{selectedOrg?.name}"?
          </Typography>
          {selectedOrg?.isActive && (
            <Box sx={{ mt: 2, p: 2, bgcolor: 'warning.light', borderRadius: 1 }}>
              <Typography variant="body2" color="warning.dark">
                ⚠️ Warning: Deactivating this organization will prevent them from accessing the system.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeactivateModal(false)}>Cancel</Button>
          <Button 
            onClick={confirmDeactivate} 
            variant="contained" 
            color={selectedOrg?.isActive ? 'warning' : 'success'}
            disabled={actionLoading === 'deactivate'}
          >
            {actionLoading === 'deactivate' ? (selectedOrg?.isActive ? 'Deactivating...' : 'Activating...') : (selectedOrg?.isActive ? 'Deactivate' : 'Activate')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <DialogTitle>Delete Organization</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to delete "{selectedOrg?.name}"?
          </Typography>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'error.light', borderRadius: 1 }}>
            <Typography variant="body2" color="error.dark">
              ⚠️ Warning: This action cannot be undone. All data associated with this organization will be permanently deleted.
            </Typography>
          </Box>
          <TextField
            label='Type "delete" to confirm'
            fullWidth
            margin="normal"
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="delete"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button 
            onClick={confirmDelete} 
            variant="contained" 
            color="error"
            disabled={deleteConfirmText !== 'delete' || actionLoading === 'delete'}
          >
            {actionLoading === 'delete' ? 'Deleting...' : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Details Modal */}
      <Dialog open={showViewModal} onClose={() => setShowViewModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Organization Details</DialogTitle>
        <DialogContent>
          {selectedOrg && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="body1" gutterBottom>
                <strong>Name:</strong> {selectedOrg.name}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Email:</strong> {selectedOrg.email}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Phone:</strong> {selectedOrg.phone || 'N/A'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Address:</strong> {selectedOrg.adress || 'N/A'}
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Status:</strong> 
                <Chip
                  label={selectedOrg.isActive ? 'Active' : 'Inactive'}
                  color={selectedOrg.isActive ? 'success' : 'error'}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Credentials:</strong> 
                <Chip
                  label={selectedOrg.isSent ? 'Sent' : 'Not Sent'}
                  color={selectedOrg.isSent ? 'primary' : 'default'}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
              <Typography variant="body1" gutterBottom>
                <strong>Created:</strong> {new Date(selectedOrg.createdAt).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowViewModal(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Organizations;