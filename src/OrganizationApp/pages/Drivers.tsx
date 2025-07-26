import React, { useState, useEffect } from 'react';
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
  Avatar,
  Chip,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Grid,
  FormControl,
  InputLabel,
  Select,
  Alert,
  Snackbar
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { organizationService } from '../../services/organizationService';

interface Driver {
  _id: string;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  id: string;
  isSent?: boolean;
  documents?: string[];
}

export const Drivers: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingDriver, setAddingDriver] = useState(false);
  const [sendingCredentials, setSendingCredentials] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loadingDriverDetails, setLoadingDriverDetails] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDocumentEditMode, setIsDocumentEditMode] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    phone: '',
    isActive: true,
  });
  const [editDocumentsFiles, setEditDocumentsFiles] = useState<FileList | null>(null);
  const [documentsToDelete, setDocumentsToDelete] = useState<string[]>([]);
  const [updatingDriver, setUpdatingDriver] = useState(false);
  const [addFormData, setAddFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [documentsFiles, setDocumentsFiles] = useState<FileList | null>(null);
  const [newDocumentsFiles, setNewDocumentsFiles] = useState<FileList | null>(null);
  const [addingNewDocuments, setAddingNewDocuments] = useState(false);

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuDriver, setMenuDriver] = useState<Driver | null>(null);

  useEffect(() => {
    fetchDrivers();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await organizationService.listDrivers();
      setDrivers(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, driver: Driver) => {
    setAnchorEl(event.currentTarget);
    setMenuDriver(driver);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuDriver(null);
  };

  const handleEdit = async (driver: Driver) => {
    handleMenuClose();
    setSelectedDriver(driver);
    setEditFormData({
      name: driver.name,
      email: driver.email,
      phone: driver.phone,
      isActive: driver.isActive,
    });
    setDocumentsToDelete([]);
    setEditDocumentsFiles(null);

    try {
      const response = await organizationService.getDriverDetails(driver.id);
      if (response.data && response.data.user) {
        const driverWithDocs = {
          ...driver,
          ...response.data.user,
          documents: response.data.user.documents || []
        };
        setSelectedDriver(driverWithDocs);
      }
    } catch (error) {
      console.error('Failed to fetch driver details:', error);
    }

    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDriver) return;

    setUpdatingDriver(true);
    try {
      const formData = new FormData();
      formData.append('name', editFormData.name);
      formData.append('email', editFormData.email);
      formData.append('phone', editFormData.phone);
      formData.append('isActive', editFormData.isActive.toString());

      documentsToDelete.forEach(docPath => {
        formData.append('documentsToDelete', docPath);
      });

      if (editDocumentsFiles) {
        for (let i = 0; i < editDocumentsFiles.length; i++) {
          formData.append('documents', editDocumentsFiles[i]);
        }
      }

      await organizationService.editDriverWithDocuments(selectedDriver.id, formData);
      setShowEditModal(false);
      setSelectedDriver(null);
      setDocumentsToDelete([]);
      setEditDocumentsFiles(null);
      fetchDrivers();

      setSuccessMessage('Driver updated successfully!');
      setShowSuccessSnackbar(true);
    } catch (error) {
      console.error('Failed to update driver:', error);
    } finally {
      setUpdatingDriver(false);
    }
  };

  const handleDelete = async (driver: Driver) => {
    handleMenuClose();
    if (window.confirm('Are you sure you want to delete this driver?')) {
      try {
        await organizationService.deleteDriver(driver._id);
        fetchDrivers();
        setSuccessMessage('Driver deleted successfully!');
        setShowSuccessSnackbar(true);
      } catch (error) {
        console.error('Failed to delete driver:', error);
      }
    }
  };

  const handleSendCredentials = async (driver: Driver) => {
    handleMenuClose();
    setSendingCredentials(true);
    try {
      await organizationService.sendDriverCredentials(driver.id);
      setSuccessMessage(`Credentials ${driver.isSent ? 'resent' : 'sent'} successfully to ${driver.email}`);
      setShowSuccessSnackbar(true);
      await fetchDrivers();
    } catch (error) {
      console.error('Failed to send credentials:', error);
    } finally {
      setSendingCredentials(false);
    }
  };

  const handleViewDetails = async (driver: Driver) => {
    handleMenuClose();
    setShowDetailsModal(true);
    setLoadingDriverDetails(true);
    setIsDocumentEditMode(false);
    setSelectedDriver(driver);

    try {
      const response = await organizationService.getDriverDetails(driver.id);
      if (response.data && response.data.user) {
        const driverWithDocs = {
          ...driver,
          ...response.data.user,
          documents: response.data.user.documents || []
        };
        setSelectedDriver(driverWithDocs);
      }
    } catch (error) {
      console.error('Failed to fetch driver details:', error);
    } finally {
      setLoadingDriverDetails(false);
    }
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddingDriver(true);
    try {
      const formData = new FormData();
      formData.append('name', addFormData.name);
      formData.append('email', addFormData.email);
      formData.append('phone', addFormData.phone);
      formData.append('role', 'driver');

      if (documentsFiles) {
        for (let i = 0; i < documentsFiles.length; i++) {
          formData.append('documents', documentsFiles[i]);
        }
      }

      await organizationService.createDriverWithMultipart(formData);
      setShowAddModal(false);
      setAddFormData({ name: '', email: '', phone: '' });
      setDocumentsFiles(null);
      await fetchDrivers();

      setSuccessMessage('Driver added successfully!');
      setShowSuccessSnackbar(true);
    } catch (error) {
      console.error('Failed to create driver:', error);
    } finally {
      setAddingDriver(false);
    }
  };

  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.phone.includes(searchTerm)
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Drivers Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your delivery team efficiently
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowAddModal(true)}
          sx={{
            background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
            boxShadow: '0 3px 5px 2px rgba(33, 203, 243, .3)',
          }}
        >
          Add New Driver
        </Button>
      </Box>

      {/* Stats and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                placeholder="Search drivers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 3, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: '#2196F3', borderRadius: '50%' }} />
                  <Typography variant="body2">Total: {drivers.length}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: '#4CAF50', borderRadius: '50%' }} />
                  <Typography variant="body2">Active: {drivers.filter(d => d.isActive).length}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: '#F44336', borderRadius: '50%' }} />
                  <Typography variant="body2">Inactive: {drivers.filter(d => !d.isActive).length}</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Drivers Table */}
      <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Driver</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Contact</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Joined</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDrivers.map((driver, index) => (
              <TableRow
                key={driver._id}
                hover
                sx={{ '&:hover': { bgcolor: 'grey.50' } }}
              >
                <TableCell>{index + 1}</TableCell>

                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 40,
                        height: 40,
                        fontSize: '0.875rem'
                      }}
                    >
                      {getInitials(driver.name)}
                    </Avatar>
                    <Typography variant="body2" fontWeight="medium">
                      {driver.name}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Box>
                    <Typography variant="body2">{driver.email}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      {driver.phone}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Chip
                    label={driver.isActive ? 'Active' : 'Inactive'}
                    color={driver.isActive ? 'success' : 'error'}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(driver.createdAt).toLocaleDateString()}
                  </Typography>
                </TableCell>

                <TableCell>
                  <IconButton
                    onClick={(e) => handleMenuOpen(e, driver)}
                    size="small"
                  >
                    <MoreVertIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {filteredDrivers.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <PersonIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No drivers found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by adding a new driver.'}
            </Typography>
          </Box>
        )}
      </TableContainer>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        PaperProps={{
          elevation: 3,
          sx: { mt: 1 }
        }}
      >
        <MenuItem
          onClick={() => menuDriver && handleSendCredentials(menuDriver)}
          disabled={sendingCredentials}
        >
          <SendIcon sx={{ mr: 2, fontSize: 20 }} />
          {sendingCredentials ? 'Sending...' : (menuDriver?.isSent ? 'Resend Credentials' : 'Send Credentials')}
        </MenuItem>
        <MenuItem onClick={() => menuDriver && handleViewDetails(menuDriver)}>
          <VisibilityIcon sx={{ mr: 2, fontSize: 20 }} />
          View Details
        </MenuItem>
        <MenuItem onClick={() => menuDriver && handleEdit(menuDriver)}>
          <EditIcon sx={{ mr: 2, fontSize: 20 }} />
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => menuDriver && handleDelete(menuDriver)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 2, fontSize: 20 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Add Driver Dialog */}
      <Dialog
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Driver</DialogTitle>
        <form onSubmit={handleAdd}>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={addFormData.name}
                  onChange={(e) => setAddFormData({ ...addFormData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={addFormData.email}
                  onChange={(e) => setAddFormData({ ...addFormData, email: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={addFormData.phone}
                  onChange={(e) => setAddFormData({ ...addFormData, phone: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <input
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => setDocumentsFiles(e.target.files)}
                  style={{ width: '100%', padding: '8px 0' }}
                />
                <Typography variant="caption" color="text.secondary">
                  Upload driver documents (optional)
                </Typography>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button
              type="submit"
              variant="contained"
              disabled={addingDriver}
              startIcon={addingDriver ? <CircularProgress size={20} /> : <AddIcon />}
            >
              {addingDriver ? 'Adding...' : 'Add Driver'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccessSnackbar}
        autoHideDuration={6000}
        onClose={() => setShowSuccessSnackbar(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setShowSuccessSnackbar(false)}
          severity="success"
          variant="filled"
        >
          {successMessage}
        </Alert>
      </Snackbar>

      {/* You can add the Edit and Details dialogs here following the same MUI pattern */}
    </Box>
  );
};