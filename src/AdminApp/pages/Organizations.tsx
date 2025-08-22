import React, { useState, useEffect, useRef } from 'react';
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
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  Grid
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Send as SendIcon,
  Block as BlockIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import { organizationService } from '../../services/organizationService';

interface Organization {
  id: number;
  name: string;
  email: string;
  phone: string;
  location?: string;
  isActive: boolean;
  isSent: boolean;
  createdAt: string;
  documents?: string[];
  statistics?: {
    totalDrivers: number;
    activeDrivers: number;
    totalClients: number;
    activeClients: number;
    totalUsers: number;
  };
}

export const Organizations: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchingRef, setFetchingRef] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'create' | 'edit' | 'view' | 'deactivate' | 'delete'>('create');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', location: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [sendingCredentials, setSendingCredentials] = useState<number | null>(null);
  const [creating, setCreating] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [editFormData, setEditFormData] = useState({ name: '', email: '', phone: '', location: '' });
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [editing, setEditing] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [viewingOrg, setViewingOrg] = useState<Organization | null>(null);
  const [loadingView, setLoadingView] = useState(false);

  useEffect(() => {
    let mounted = true;
    const loadData = async () => {
      if (mounted) {
        await fetchOrganizations();
      }
    };
    loadData();
    return () => { mounted = false; };
  }, []);

  const fetchOrganizations = async () => {
    if (fetchingRef) return;
    setFetchingRef(true);
    try {
      const response = await organizationService.list();
      if (response && response.organizations) {
        setOrganizations(response.organizations);
      }
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        showSnackbar('Error fetching organizations', 'error');
      }
    } finally {
      setLoading(false);
      setTimeout(() => setFetchingRef(false), 100);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, org: Organization) => {
    setAnchorEl(event.currentTarget);
    setSelectedOrg(org);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleCreateOrganization = async () => {
    setCreating(true);
    try {
      const formDataObj = new FormData();
      formDataObj.append('name', formData.name);
      formDataObj.append('email', formData.email);
      formDataObj.append('phone', formData.phone);
      if (formData.location) formDataObj.append('location', formData.location);
      
      selectedFiles.forEach((file) => {
        formDataObj.append('documents', file);
      });
      
      await organizationService.createWithFiles(formDataObj);
      showSnackbar('Organization created successfully', 'success');
      setOpenDialog(false);
      setFormData({ name: '', email: '', phone: '', location: '' });
      setSelectedFiles([]);
      fetchOrganizations();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Error creating organization';
      showSnackbar(errorMessage, 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleSendCredentials = async (orgId: number) => {
    setSendingCredentials(orgId);
    try {
      await organizationService.sendCredentials(orgId);
      showSnackbar('Credentials sent successfully', 'success');
      fetchOrganizations();
    } catch (error) {
      showSnackbar('Error sending credentials', 'error');
    } finally {
      setSendingCredentials(null);
    }
  };

  const handleDeactivate = async (orgId: number) => {
    try {
      await organizationService.update(orgId, { isActive: false });
      showSnackbar('Organization deactivated', 'success');
      fetchOrganizations();
    } catch (error) {
      showSnackbar('Error deactivating organization', 'error');
    }
  };

  const handleDelete = async (orgId: number) => {
    try {
      await organizationService.delete(orgId);
      showSnackbar('Organization deleted', 'success');
      fetchOrganizations();
    } catch (error) {
      showSnackbar('Error deleting organization', 'error');
    }
  };

  const openCreateDialog = () => {
    setDialogType('create');
    setFormData({ name: '', email: '', phone: '', location: '' });
    setOpenDialog(true);
  };

  const handleView = async (org: Organization) => {
    setLoadingView(true);
    setViewingOrg(null); // Reset viewing org to show loading
    setSelectedOrg(org);
    setDialogType('view');
    setOpenDialog(true);
    handleMenuClose();
    
    try {
      console.log('Loading details for organization:', org.id);
      const response = await organizationService.getDetails(org.id);
      console.log('Organization details loaded:', response);
      setViewingOrg(response.organization);
    } catch (error: any) {
      console.error('Error loading organization details:', error);
      showSnackbar('Error loading organization details', 'error');
      setOpenDialog(false);
    } finally {
      setLoadingView(false);
    }
  };

  const handleEdit = (org: Organization) => {
    setSelectedOrg(org);
    setEditFormData({
      name: org.name,
      email: org.email,
      phone: org.phone,
      location: org.location || ''
    });
    setDialogType('edit');
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleDeactivateClick = (org: Organization) => {
    setSelectedOrg(org);
    setDialogType('deactivate');
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleDeleteClick = (org: Organization) => {
    setSelectedOrg(org);
    setDeleteConfirmText('');
    setDialogType('delete');
    setOpenDialog(true);
    handleMenuClose();
  };

  const handleUpdateOrganization = async () => {
    if (!selectedOrg) return;
    console.log('Starting update for organization:', selectedOrg.id, editFormData);
    setEditing(true);
    try {
      const result = await organizationService.update(selectedOrg.id, editFormData);
      console.log('Update result:', result);
      showSnackbar('Organization updated successfully', 'success');
      setOpenDialog(false);
      setSelectedOrg(null);
      fetchOrganizations();
    } catch (error: any) {
      console.error('Update error:', error);
      showSnackbar(error.response?.data?.message || 'Error updating organization', 'error');
    } finally {
      setEditing(false);
    }
  };

  const handleConfirmDeactivate = async () => {
    if (!selectedOrg) return;
    console.log('Starting deactivation for organization:', selectedOrg.id);
    setDeactivating(true);
    try {
      const newStatus = !selectedOrg.isActive;
      const result = await organizationService.update(selectedOrg.id, { isActive: newStatus });
      console.log('Status change result:', result);
      showSnackbar(`Organization ${newStatus ? 'activated' : 'deactivated'} successfully`, 'success');
      setOpenDialog(false);
      setSelectedOrg(null);
      fetchOrganizations();
    } catch (error: any) {
      console.error('Deactivation error:', error);
      showSnackbar(error.response?.data?.message || 'Error deactivating organization', 'error');
    } finally {
      setDeactivating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedOrg || deleteConfirmText !== 'delete') return;
    console.log('Starting deletion for organization:', selectedOrg.id);
    setDeleting(true);
    try {
      const result = await organizationService.delete(selectedOrg.id);
      console.log('Deletion result:', result);
      showSnackbar('Organization deleted successfully', 'success');
      setOpenDialog(false);
      setSelectedOrg(null);
      fetchOrganizations();
    } catch (error: any) {
      console.error('Deletion error:', error);
      showSnackbar(error.response?.data?.message || 'Error deleting organization', 'error');
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Organizations
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreateDialog}
        >
          Add Organization
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Credentials</TableCell>
              <TableCell>Drivers</TableCell>
              <TableCell>Clients</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {organizations.map((org, index) => (
              <TableRow key={org.id}>
                <TableCell>{index + 1}</TableCell>
                <TableCell>{org.name}</TableCell>
                <TableCell>{org.email}</TableCell>
                <TableCell>{org.phone}</TableCell>
                <TableCell>{org.location || 'N/A'}</TableCell>
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
                <TableCell>{org.statistics?.totalDrivers || 0}</TableCell>
                <TableCell>{org.statistics?.totalClients || 0}</TableCell>
                <TableCell>{new Date(org.createdAt).toLocaleDateString()}</TableCell>
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

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedOrg && handleView(selectedOrg)}>
          <ViewIcon sx={{ mr: 1 }} /> View
        </MenuItem>
        <MenuItem onClick={() => selectedOrg && handleEdit(selectedOrg)}>
          <EditIcon sx={{ mr: 1 }} /> Edit
        </MenuItem>
        <MenuItem 
          onClick={() => selectedOrg && handleSendCredentials(selectedOrg.id)}
          disabled={sendingCredentials === selectedOrg?.id}
        >
          <SendIcon sx={{ mr: 1 }} />
          {selectedOrg?.isSent ? 'Resend Credentials' : 'Send Credentials'}
          {sendingCredentials === selectedOrg?.id && <CircularProgress size={16} sx={{ ml: 1 }} />}
        </MenuItem>
        <MenuItem onClick={() => selectedOrg && handleDeactivateClick(selectedOrg)}>
          <BlockIcon sx={{ mr: 1 }} /> {selectedOrg?.isActive ? 'Deactivate' : 'Activate'}
        </MenuItem>
        <MenuItem onClick={() => selectedOrg && handleDeleteClick(selectedOrg)}>
          <DeleteIcon sx={{ mr: 1 }} /> Delete
        </MenuItem>
      </Menu>

      {/* Create Organization Dialog */}
      <Dialog open={openDialog && dialogType === 'create'} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create New Organization</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Organization Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Phone"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Location (Optional)"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            margin="normal"
          />
          <Box sx={{ mt: 2 }}>
            <input
              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              style={{ display: 'none' }}
              id="file-upload"
              multiple
              type="file"
              onChange={(e) => setSelectedFiles(Array.from(e.target.files || []))}
            />
            <label htmlFor="file-upload">
              <Button variant="outlined" component="span" sx={{ mb: 1 }}>
                Upload Documents (Optional)
              </Button>
            </label>
            {selectedFiles.length > 0 && (
              <Box sx={{ mt: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  {selectedFiles.length} file(s) selected:
                </Typography>
                {selectedFiles.map((file, index) => (
                  <Typography key={index} variant="body2" sx={{ ml: 1 }}>
                    • {file.name}
                  </Typography>
                ))}
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleCreateOrganization} 
            variant="contained"
            disabled={creating}
          >
            {creating ? 'Creating...' : 'Create Organization'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={openDialog && dialogType === 'view'} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Organization Details</DialogTitle>
        <DialogContent>
          {loadingView ? (
            <Box display="flex" justifyContent="center" p={3}>
              <CircularProgress />
            </Box>
          ) : viewingOrg ? (
            <Box sx={{ pt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Basic Information</Typography>
                    <Typography sx={{ mb: 1 }}><strong>Name:</strong> {viewingOrg.name}</Typography>
                    <Typography sx={{ mb: 1 }}><strong>Email:</strong> {viewingOrg.email}</Typography>
                    <Typography sx={{ mb: 1 }}><strong>Phone:</strong> {viewingOrg.phone}</Typography>
                    <Typography sx={{ mb: 1 }}><strong>Location:</strong> {viewingOrg.location || 'N/A'}</Typography>
                    <Box sx={{ mb: 1, display: 'flex', alignItems: 'center' }}>
                      <Typography component="span"><strong>Status:</strong></Typography>
                      <Chip 
                        label={viewingOrg.isActive ? 'Active' : 'Inactive'} 
                        color={viewingOrg.isActive ? 'success' : 'error'} 
                        size="small" 
                        sx={{ ml: 1 }}
                      />
                    </Box>
                    <Typography sx={{ mb: 1 }}><strong>Credentials Sent:</strong> {viewingOrg.isSent ? 'Yes' : 'No'}</Typography>
                    <Typography sx={{ mb: 1 }}><strong>Created:</strong> {new Date(viewingOrg.createdAt).toLocaleDateString()}</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, mb: 2 }}>
                    <Typography variant="h6" sx={{ mb: 2 }}>Statistics</Typography>
                    <Typography sx={{ mb: 1 }}><strong>Total Drivers:</strong> {viewingOrg.statistics?.totalDrivers || 0}</Typography>
                    <Typography sx={{ mb: 1 }}><strong>Active Drivers:</strong> {viewingOrg.statistics?.activeDrivers || 0}</Typography>
                    <Typography sx={{ mb: 1 }}><strong>Total Clients:</strong> {viewingOrg.statistics?.totalClients || 0}</Typography>
                    <Typography sx={{ mb: 1 }}><strong>Active Clients:</strong> {viewingOrg.statistics?.activeClients || 0}</Typography>
                    <Typography sx={{ mb: 1 }}><strong>Total Users:</strong> {viewingOrg.statistics?.totalUsers || 0}</Typography>
                  </Paper>
                </Grid>
                {viewingOrg.documents && viewingOrg.documents.length > 0 && (
                  <Grid item xs={12}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>Documents</Typography>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                        {viewingOrg.documents.map((doc: string, index: number) => (
                          <Button
                            key={index}
                            variant="outlined"
                            size="small"
                            onClick={() => window.open(doc, '_blank')}
                            sx={{ mb: 1 }}
                          >
                            Document {index + 1}
                          </Button>
                        ))}
                      </Box>
                    </Paper>
                  </Grid>
                )}
              </Grid>
            </Box>
          ) : (
            <Box display="flex" justifyContent="center" p={3}>
              <Typography>No data available</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={openDialog && dialogType === 'edit'} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Organization</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Organization Name"
            value={editFormData.name}
            onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Email"
            type="email"
            value={editFormData.email}
            onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Phone"
            value={editFormData.phone}
            onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
            margin="normal"
          />
          <TextField
            fullWidth
            label="Location"
            value={editFormData.location}
            onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
            margin="normal"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleUpdateOrganization} 
            variant="contained"
            disabled={editing}
          >
            {editing ? 'Updating...' : 'Update'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deactivate Dialog */}
      <Dialog open={openDialog && dialogType === 'deactivate'} onClose={() => setOpenDialog(false)}>
        <DialogTitle>{selectedOrg?.isActive ? 'Deactivate' : 'Activate'} Organization</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            You are about to {selectedOrg?.isActive ? 'deactivate' : 'activate'} <strong>{selectedOrg?.name}</strong>.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {selectedOrg?.isActive ? (
              <>Deactivating an organization will:<br/>
              • Prevent the organization from logging in<br/>
              • Stop all their drivers and clients from accessing the system<br/>
              • Suspend all garbage collection services<br/>
              • Keep all data intact for future reactivation</>
            ) : (
              <>Activating an organization will:<br/>
              • Allow the organization to log in<br/>
              • Enable all their drivers and clients to access the system<br/>
              • Resume all garbage collection services</>
            )}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirmDeactivate} 
            color={selectedOrg?.isActive ? 'warning' : 'success'}
            variant="contained"
            disabled={deactivating}
          >
            {deactivating ? (selectedOrg?.isActive ? 'Deactivating...' : 'Activating...') : (selectedOrg?.isActive ? 'Deactivate' : 'Activate')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={openDialog && dialogType === 'delete'} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Delete Organization</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            You are about to permanently delete <strong>{selectedOrg?.name}</strong>.
          </Typography>
          <Typography variant="body2" color="error" sx={{ mb: 2 }}>
            This action cannot be undone and will:
            • Delete all organization data
            • Remove all associated drivers and clients
            • Delete all pickup records and invoices
            • Cancel all active services
          </Typography>
          <Typography sx={{ mb: 1 }}>Type <strong>delete</strong> to confirm:</Typography>
          <TextField
            fullWidth
            value={deleteConfirmText}
            onChange={(e) => setDeleteConfirmText(e.target.value)}
            placeholder="Type 'delete' to confirm"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deleteConfirmText !== 'delete' || deleting}
          >
            {deleting ? 'Deleting...' : 'Delete Permanently'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};