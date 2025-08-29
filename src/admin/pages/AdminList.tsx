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
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Person as PersonIcon,
  MoreVert as MoreVertIcon,
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Block as BlockIcon,
  SupervisorAccount as SupervisorIcon,
} from '@mui/icons-material';
import {
  IconButton,
  Menu,
  MenuItem,
} from '@mui/material';
import { adminService } from '../../shared/services/services/axios';

interface Admin {
  id: string;
  name: string;
  email: string;
  phone: string;
  created_by: string;
  created_at: string;
  isActive?: boolean;
}

const AdminList: React.FC = () => {
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showViewDialog, setShowViewDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showMakeSuperDialog, setShowMakeSuperDialog] = useState(false);
  const [showUnauthorizedDialog, setShowUnauthorizedDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [makingSuper, setMakingSuper] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    fetchAdmins();
    getCurrentUser();
  }, []);

  const getCurrentUser = () => {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      setCurrentUserId(userData.data?.user?.id || '');
      setUserRole(userData.data?.user?.role || '');
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await adminService.listAdmins();
      setAdmins(response.data.data.admins || []);
    } catch (error: any) {
      console.error("Failed to fetch admins:", error);
      if (error.response?.status === 403) {
        setShowUnauthorizedDialog(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleAddAdmin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCreating(true);

    try {
      await adminService.createAdmin(formData);
      setShowAddDialog(false);
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
      });
      // Add new admin to list immediately
      const newAdmin = {
        id: Date.now().toString(), // Temporary ID
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: 'admin',
        isActive: true,
        created_by: currentUserId,
        created_at: new Date().toISOString()
      };
      setAdmins(prev => [newAdmin, ...prev]);
      
      setSuccessMessage('Admin created successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error("Failed to add admin:", error);
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat().join('\n');
        setErrorMessage(errorMessages);
      } else {
        setErrorMessage('Failed to create admin. Please try again.');
      }
    } finally {
      setCreating(false);
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, admin: Admin) => {
    setAnchorEl(event.currentTarget);
    setSelectedAdmin(admin);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleView = () => {
    setShowViewDialog(true);
    handleMenuClose();
  };

  const handleEdit = () => {
    if (selectedAdmin) {
      setEditFormData({
        name: selectedAdmin.name,
        email: selectedAdmin.email,
        phone: selectedAdmin.phone,
      });
      setShowEditDialog(true);
    }
    handleMenuClose();
  };

  const handleDelete = () => {
    setShowDeleteDialog(true);
    handleMenuClose();
  };

  const handleDeactivate = () => {
    setShowDeactivateDialog(true);
    handleMenuClose();
  };

  const handleMakeSuper = () => {
    setShowMakeSuperDialog(true);
    handleMenuClose();
  };

  const handleUpdateAdmin = async () => {
    if (!selectedAdmin) return;

    setUpdating(true);
    try {
      await adminService.updateAdmin(selectedAdmin.id, editFormData);
      
      // Update admin in list immediately
      setAdmins(prev => prev.map(admin => 
        admin.id === selectedAdmin.id 
          ? { ...admin, ...editFormData }
          : admin
      ));
      
      setShowEditDialog(false);
      setSelectedAdmin(null);
      setSuccessMessage('Admin updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Failed to update admin:', error);
      setErrorMessage('Failed to update admin. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;

    setDeleting(true);
    try {
      await adminService.deleteAdmin(selectedAdmin.id);
      
      // Remove admin from list immediately
      setAdmins(prev => prev.filter(admin => admin.id !== selectedAdmin.id));
      
      setShowDeleteDialog(false);
      setSelectedAdmin(null);
      setSuccessMessage('Admin deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Failed to delete admin:', error);
      if (error.response?.status === 403) {
        setErrorMessage('You are not authorized to delete this Admin');
      } else {
        setErrorMessage('Failed to delete admin. Please try again.');
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleDeactivateAdmin = async () => {
    if (!selectedAdmin) return;

    setDeactivating(true);
    try {
      await adminService.deactivateAdmin(selectedAdmin.id);
      
      // Update admin status in list immediately
      setAdmins(prev => prev.map(admin => 
        admin.id === selectedAdmin.id 
          ? { ...admin, isActive: !admin.isActive }
          : admin
      ));
      
      setShowDeactivateDialog(false);
      setSelectedAdmin(null);
      setSuccessMessage('Admin status updated successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Failed to deactivate admin:', error);
      setErrorMessage('Failed to update admin status. Please try again.');
    } finally {
      setDeactivating(false);
    }
  };

  const handleMakeSuperAdmin = async () => {
    if (!selectedAdmin) return;

    setMakingSuper(true);
    try {
      await adminService.makeSuperAdmin(selectedAdmin.id);
      
      // Update admin role in list immediately
      setAdmins(prev => prev.map(admin => 
        admin.id === selectedAdmin.id 
          ? { ...admin, role: 'super_admin' }
          : admin
      ));
      
      setShowMakeSuperDialog(false);
      setSelectedAdmin(null);
      setSuccessMessage('Admin promoted to Super Admin successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      console.error('Failed to make super admin:', error);
      setErrorMessage('Failed to promote admin. Please try again.');
    } finally {
      setMakingSuper(false);
    }
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
          Admin Management
        </Typography>
        {userRole === 'super_admin' && (
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowAddDialog(true)}
          >
            Add Admin
          </Button>
        )}
      </Box>

      {successMessage && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setErrorMessage('')}>
          {errorMessage}
        </Alert>
      )}

      {admins.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <PersonIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No admins yet
          </Typography>
          <Typography color="text.secondary">
            Get started by adding your first admin.
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Admin</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {admins.map((admin, index) => (
                <TableRow key={admin.id} hover>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                        {admin.name.charAt(0).toUpperCase()}
                      </Avatar>
                      <Typography variant="subtitle2">{admin.name}</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">{admin.email}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {admin.phone || 'No phone'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                      {admin.role?.replace('_', ' ')}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: (admin.isActive === true || admin.isActive === 1 || admin.isActive === '1') ? 'success.main' : 'error.main',
                        fontWeight: 'medium'
                      }}
                    >
                      {(admin.isActive === true || admin.isActive === 1 || admin.isActive === '1') ? 'Active' : 'Inactive'}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    {new Date(admin.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <IconButton onClick={(e) => handleMenuClick(e, admin)}>
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Admin Dialog */}
      <Dialog open={showAddDialog} onClose={() => setShowAddDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Admin</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Password"
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setShowAddDialog(false);
            setFormData({
              name: '',
              email: '',
              password: '',
              phone: '',
            });
          }}>Cancel</Button>
          <Button onClick={handleAddAdmin} variant="contained" disabled={creating}>
            {creating ? 'Creating Admin...' : 'Create Admin'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleView}>
          <VisibilityIcon sx={{ mr: 1 }} />
          View
        </MenuItem>
        <MenuItem onClick={handleEdit}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        {userRole === 'super_admin' && (
          <MenuItem onClick={handleDeactivate}>
            <BlockIcon sx={{ mr: 1 }} />
            {(selectedAdmin?.isActive === true || selectedAdmin?.isActive === 1 || selectedAdmin?.isActive === '1') ? 'Deactivate' : 'Activate'}
          </MenuItem>
        )}
        {selectedAdmin?.role === 'admin' && userRole === 'super_admin' && (
          <MenuItem onClick={handleMakeSuper}>
            <SupervisorIcon sx={{ mr: 1 }} />
            Make Super Admin
          </MenuItem>
        )}
        {userRole === 'super_admin' && (
          <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
            <DeleteIcon sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        )}
      </Menu>

      {/* View Dialog */}
      <Dialog open={showViewDialog} onClose={() => setShowViewDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Admin Details</DialogTitle>
        <DialogContent>
          {selectedAdmin && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>{selectedAdmin.name}</Typography>
              <Typography variant="body2" color="text.secondary">Email:</Typography>
              <Typography variant="body1" gutterBottom>{selectedAdmin.email}</Typography>
              <Typography variant="body2" color="text.secondary">Phone:</Typography>
              <Typography variant="body1" gutterBottom>{selectedAdmin.phone || 'Not provided'}</Typography>
              <Typography variant="body2" color="text.secondary">Created:</Typography>
              <Typography variant="body1">{new Date(selectedAdmin.created_at).toLocaleDateString()}</Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowViewDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onClose={() => setShowEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Admin</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={editFormData.name}
              onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={editFormData.email}
              onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
              required
            />
            <TextField
              fullWidth
              label="Phone"
              value={editFormData.phone}
              onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button onClick={handleUpdateAdmin} variant="contained" disabled={updating}>
            {updating ? 'Updating...' : 'Update Admin'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => setShowDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'error.main' }}>Delete Admin</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to delete <strong>"{selectedAdmin?.name}"</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteAdmin} color="error" variant="contained" disabled={deleting}>
            {deleting ? 'Deleting...' : 'Delete Admin'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deactivate/Activate Dialog */}
      <Dialog open={showDeactivateDialog} onClose={() => setShowDeactivateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'warning.main' }}>
          {(selectedAdmin?.isActive === true || selectedAdmin?.isActive === 1 || selectedAdmin?.isActive === '1') ? 'Deactivate' : 'Activate'} Admin
        </DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to {(selectedAdmin?.isActive === true || selectedAdmin?.isActive === 1 || selectedAdmin?.isActive === '1') ? 'deactivate' : 'activate'} <strong>"{selectedAdmin?.name}"</strong>?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Type '{(selectedAdmin?.isActive === true || selectedAdmin?.isActive === 1 || selectedAdmin?.isActive === '1') ? 'deactivate' : 'activate'}' to confirm this action.
          </Typography>
          <TextField
            fullWidth
            label={`Type '${(selectedAdmin?.isActive === true || selectedAdmin?.isActive === 1 || selectedAdmin?.isActive === '1') ? 'deactivate' : 'activate'}' to confirm`}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeactivateDialog(false)}>Cancel</Button>
          <Button onClick={handleDeactivateAdmin} color="warning" variant="contained" disabled={deactivating}>
            {deactivating ? `${(selectedAdmin?.isActive === true || selectedAdmin?.isActive === 1 || selectedAdmin?.isActive === '1') ? 'Deactivating' : 'Activating'}...` : (selectedAdmin?.isActive === true || selectedAdmin?.isActive === 1 || selectedAdmin?.isActive === '1') ? 'Deactivate' : 'Activate'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Make Super Admin Dialog */}
      <Dialog open={showMakeSuperDialog} onClose={() => setShowMakeSuperDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'primary.main' }}>Make Super Admin</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Are you sure you want to promote <strong>"{selectedAdmin?.name}"</strong> to Super Admin?
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Type 'Confirm' to proceed with this action.
          </Typography>
          <TextField
            fullWidth
            label="Type 'Confirm' to proceed"
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowMakeSuperDialog(false)}>Cancel</Button>
          <Button onClick={handleMakeSuperAdmin} color="primary" variant="contained" disabled={makingSuper}>
            {makingSuper ? 'Promoting...' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Unauthorized Dialog */}
      <Dialog open={showUnauthorizedDialog} onClose={() => setShowUnauthorizedDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ color: 'error.main' }}>Unauthorized Access</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            You are unauthorized to perform this action.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Please contact the system administrator for assistance.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowUnauthorizedDialog(false)} variant="contained">
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminList;