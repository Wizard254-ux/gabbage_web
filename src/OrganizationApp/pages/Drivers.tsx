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

  Alert,
  Snackbar,

  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,

} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Send as SendIcon,
  Visibility as VisibilityIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  Upload as UploadIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  PictureAsPdf as PdfIcon,
  InsertDriveFile as FileIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarToday as CalendarIcon,
  Cancel as CancelIcon
} from '@mui/icons-material';
import { organizationService } from '../../services/organizationService';
import { GridLegacy as Grid } from "@mui/material";
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

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export const Drivers: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingDriver, setAddingDriver] = useState(false);
  const [sendingCredentials, setSendingCredentials] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [loadingDriverDetails, setLoadingDriverDetails] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<Driver >("");
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
  const [deletingDocument, setDeletingDocument] = useState(false);
  const [addingNewDocuments, setAddingNewDocuments] = useState(false);
  const [detailsTabValue, setDetailsTabValue] = useState(0);
  const [loadingEdit, setLoadingEdit] = useState(false);

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuDriver, setMenuDriver] = useState<Driver | null>(null);

  useEffect(() => {
    fetchDrivers();
    fetchRoutes();
  }, []);

  const fetchDrivers = async () => {
    try {
      const response = await organizationService.listDrivers();
      setDrivers(response.data.users || []);
      console.log('drivers ',response.data)
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutes = async () => {
    try {
      const response = await organizationService.getAllRoutes();
      setRoutes(response.data.data || []);
      console.log('drivers routes ',response.data)
    } catch (error) {
      console.error('Failed to fetch routes:', error);
    }
  };

  const getDriverActiveRoute = (driverId: string) => {
    const activeRoute = routes.find(route => route.activeDriverId === driverId && route.isActive);
    return activeRoute;
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
    setLoadingEdit(true);
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
    } finally {
      setLoadingEdit(false);
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
      console.log('driver',selectedDriver)

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
        await organizationService.deleteDriver(driver.id);
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
    setDetailsTabValue(0);

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

  const handleDeleteDocument = async (driverId: string, documentPath: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      setDeletingDocument(true);
      try {
        await organizationService.deleteDriverDocument(driverId, documentPath);

        const response = await organizationService.getDriverDetails(driverId);
        if (response.data && response.data.user && selectedDriver) {
          const updatedDriver = {
            ...selectedDriver,
            ...response.data.user,
            documents: response.data.user.documents || []
          };
          setSelectedDriver(updatedDriver);
        }

        setSuccessMessage('Document deleted successfully!');
        setShowSuccessSnackbar(true);
      } catch (error) {
        console.error('Failed to delete document:', error);
        alert('Failed to delete document');
      } finally {
        setDeletingDocument(false);
      }
    }
  };

  const handleDeleteDocumentInEditMode = async (documentPath: string) => {
    if (!selectedDriver) return;
    
    if (window.confirm('Are you sure you want to delete this document permanently?')) {
      setDeletingDocument(true);
      try {
        await organizationService.deleteDriverDocument(selectedDriver.id, documentPath);

        // Update the selectedDriver state to remove the document
        const updatedDriver = {
          ...selectedDriver,
          documents: selectedDriver.documents.filter(doc => doc !== documentPath)
        };
        setSelectedDriver(updatedDriver);
        
        setSuccessMessage('Document deleted successfully!');
        setShowSuccessSnackbar(true);
      } catch (error) {
        console.error('Error deleting document:', error);
        alert('Failed to delete document');
      } finally {
        setDeletingDocument(false);
      }
    }
  };

  const handleAddNewDocuments = async () => {
    if (!selectedDriver || !newDocumentsFiles) return;

    setAddingNewDocuments(true);
    try {
      const formData = new FormData();

      for (let i = 0; i < newDocumentsFiles.length; i++) {
        formData.append('documents', newDocumentsFiles[i]);
      }

      await organizationService.editDriverWithDocuments(selectedDriver.id, formData);

      const response = await organizationService.getDriverDetails(selectedDriver.id);
      if (response.data && response.data.user) {
        const updatedDriver = {
          ...selectedDriver,
          ...response.data.user,
          documents: response.data.user.documents || []
        };
        setSelectedDriver(updatedDriver);
      }

      setNewDocumentsFiles(null);
      setSuccessMessage('Documents added successfully!');
      setShowSuccessSnackbar(true);
    } catch (error) {
      console.error('Failed to add documents:', error);
    } finally {
      setAddingNewDocuments(false);
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

  const getFileIcon = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return <ImageIcon />;
    } else if (ext === 'pdf') {
      return <PdfIcon />;
    } else if (['doc', 'docx'].includes(ext || '')) {
      return <DescriptionIcon />;
    }
    return <FileIcon />;
  };

  const isImageFile = (fileName: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '');
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
              <TableCell sx={{ fontWeight: 'bold' }}>Active Route</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Joined</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredDrivers.map((driver, index) => (
              <TableRow
                key={driver.id}
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
                  {(() => {
                    const activeRoute = getDriverActiveRoute(driver.id);
                    return activeRoute ? (
                      <Box>
                        <Typography variant="body2" fontWeight="medium" color="primary.main">
                          {activeRoute.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {activeRoute.path}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        No active route
                      </Typography>
                    );
                  })()}
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
        <MenuItem onClick={() => menuDriver && handleEdit(menuDriver)} disabled={loadingEdit}>
          {loadingEdit ? <CircularProgress size={20} sx={{ mr: 2 }} /> : <EditIcon sx={{ mr: 2, fontSize: 20 }} />}
          {loadingEdit ? 'Loading...' : 'Edit'}
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
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<UploadIcon />}
                  sx={{ py: 2 }}
                >
                  Upload Documents
                  <input
                    type="file"
                    hidden
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => setDocumentsFiles(e.target.files)}
                  />
                </Button>
                {documentsFiles && documentsFiles.length > 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {documentsFiles.length} file(s) selected
                  </Typography>
                )}
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

      {/* Edit Driver Dialog */}
      <Dialog
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Edit Driver
          <IconButton onClick={() => setShowEditModal(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <form onSubmit={handleUpdate}>
          <DialogContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  required
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={editFormData.isActive}
                      onChange={(e) => setEditFormData({ ...editFormData, isActive: e.target.checked })}
                    />
                  }
                  label="Active Status"
                />
              </Grid>
              
              {selectedDriver?.documents && selectedDriver.documents.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Current Documents ({selectedDriver.documents.length})
                  </Typography>
<Box sx={{ maxHeight: 300, overflow: 'auto' }}>
  <List>
    {selectedDriver.documents.map((doc, index) => {
      const fileName = doc.split('/').pop() || `Document ${index + 1}`;
      const isMarkedForDeletion = documentsToDelete.includes(doc);

      return (
        <ListItem
          key={`edit-doc-${index}`}
          sx={{
            border: 1,
            borderColor: isMarkedForDeletion ? 'error.main' : 'divider',
            borderRadius: 1,
            mb: 1,
            bgcolor: isMarkedForDeletion ? 'error.light' : 'background.paper',
            opacity: isMarkedForDeletion ? 0.6 : 1,
            display: 'flex',
            alignItems: 'center',
            py: 1,
            px: 2
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {getFileIcon(fileName)}
          </ListItemIcon>
          <ListItemText
            primary={fileName}
            secondary={fileName.split('.').pop()?.toUpperCase() + ' file'}
            sx={{
              textDecoration: isMarkedForDeletion ? 'line-through' : 'none',
              flex: 1,
              mr: 2
            }}
          />
          <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
            <IconButton
              size="small"
              href={doc}
              target="_blank"
              rel="noopener noreferrer"
              sx={{ color: 'primary.main' }}
            >
              <VisibilityIcon />
            </IconButton>
            <IconButton
              size="small"
              href={doc}
              download={fileName}
              sx={{ color: 'info.main' }}
            >
              <DownloadIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => handleDeleteDocumentInEditMode(doc)}
              color="error"
              disabled={deletingDocument}
            >
              {deletingDocument ? <CircularProgress size={16} /> : <DeleteIcon />}
            </IconButton>
          </Box>
        </ListItem>
      );
    })}
  </List>
                </Box>
                  {documentsToDelete.length > 0 && (
                    <Alert severity="warning" sx={{ mt: 2 }}>
                      {documentsToDelete.length} document(s) will be permanently deleted when you update the driver.
                    </Alert>
                  )}
                </Grid>
              )}

              {/* Add New Documents */}
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Add New Documents
                </Typography>
                <Button
                  variant="outlined"
                  component="label"
                  fullWidth
                  startIcon={<UploadIcon />}
                  sx={{ py: 2 }}
                >
                  Upload Additional Documents
                  <input
                    type="file"
                    hidden
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    onChange={(e) => setEditDocumentsFiles(e.target.files)}
                  />
                </Button>
                {editDocumentsFiles && editDocumentsFiles.length > 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                    {editDocumentsFiles.length} new file(s) selected
                  </Typography>
                )}
              </Grid>
            </Grid>


          </DialogContent>
          <DialogActions sx={{ p: 3 }}>
            <Button onClick={() => setShowEditModal(false)} disabled={updatingDriver}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={updatingDriver}
              startIcon={updatingDriver ? <CircularProgress size={20} /> : <EditIcon />}
            >
              {updatingDriver ? 'Updating...' : 'Update Driver'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Driver Details Dialog */}
      <Dialog
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Driver Details
          <IconButton onClick={() => setShowDetailsModal(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedDriver && (
            <Box>
              {/* Driver Info Header */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 3, mb: 3 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    width: 80,
                    height: 80,
                    fontSize: '1.5rem'
                  }}
                >
                  {getInitials(selectedDriver.name)}
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight="bold">
                    {selectedDriver.name}
                  </Typography>
                  <Chip
                    label={selectedDriver.isActive ? 'Active' : 'Inactive'}
                    color={selectedDriver.isActive ? 'success' : 'error'}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Box>
              </Box>

              <Tabs
                value={detailsTabValue}
                onChange={(_, newValue) => setDetailsTabValue(newValue)}
                sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}
              >
                <Tab label="Basic Information" />
                <Tab label="Documents" />
              </Tabs>

              <TabPanel value={detailsTabValue} index={0}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <EmailIcon color="primary" />
                          <Typography variant="h6">Email</Typography>
                        </Box>
                        <Typography>{selectedDriver.email}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <PhoneIcon color="primary" />
                          <Typography variant="h6">Phone</Typography>
                        </Box>
                        <Typography>{selectedDriver.phone}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <CalendarIcon color="primary" />
                          <Typography variant="h6">Joined Date</Typography>
                        </Box>
                        <Typography>{new Date(selectedDriver.createdAt).toLocaleDateString()}</Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <SendIcon color="primary" />
                          <Typography variant="h6">Credentials Status</Typography>
                        </Box>
                        <Chip
                          label={selectedDriver.isSent ? 'Credentials Sent' : 'Credentials Not Sent'}
                          color={selectedDriver.isSent ? 'info' : 'warning'}
                          variant="outlined"
                        />
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                          <PersonIcon color="primary" />
                          <Typography variant="h6">Driver ID</Typography>
                        </Box>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace', bgcolor: 'grey.100', p: 1, borderRadius: 1 }}>
                          {selectedDriver.id}
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
              </TabPanel>

              <TabPanel value={detailsTabValue} index={1}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                  <Typography variant="h6">
                    Documents ({selectedDriver.documents?.length || 0})
                  </Typography>
                  <Button
                    variant={isDocumentEditMode ? "outlined" : "contained"}
                    onClick={() => setIsDocumentEditMode(!isDocumentEditMode)}
                    startIcon={isDocumentEditMode ? <CancelIcon /> : <EditIcon />}
                  >
                    {isDocumentEditMode ? 'Cancel Edit' : 'Edit Documents'}
                  </Button>
                </Box>

              {loadingDriverDetails ? (
  <Box
    sx={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      py: 6,
      minHeight: '200px',
      borderRadius: 2,
      bgcolor: 'grey.50',
      border: '1px dashed',
      borderColor: 'grey.300'
    }}
  >
    <CircularProgress size={32} thickness={4} />
    <Typography
      sx={{
        ml: 2,
        color: 'text.secondary',
        fontWeight: 500
      }}
    >
      Loading documents...
    </Typography>
  </Box>
) : selectedDriver.documents && selectedDriver.documents.length > 0 ? (
  <Box sx={{ p: 2 }}>
    <Typography
      variant="h6"
      sx={{
        mb: 3,
        fontWeight: 600,
        color: 'text.primary',
        borderBottom: '2px solid',
        borderColor: 'primary.main',
        pb: 1,
        display: 'inline-block'
      }}
    >
      Documents ({selectedDriver.documents.length})
    </Typography>

    <Grid container spacing={3}>
      {selectedDriver.documents.map((doc, index) => {
        const fileName = doc.split('/').pop() || `Document ${index + 1}`;
        const isImage = isImageFile(fileName);

        return (
          <Grid item xs={12} sm={6} md={4} lg={3} key={`doc-detail-${index}`}>
            <Card
              variant="outlined"
              sx={{
                height: '100%',
                borderRadius: 3,
                border: '1px solid',
                borderColor: 'grey.200',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                overflow: 'hidden',
                position: 'relative',
                bgcolor: 'background.paper',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                '&:hover': {
                  boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
                  transform: 'translateY(-4px)',
                  borderColor: 'primary.main'
                },
                '&:active': {
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <Box
                sx={{
                  height: 180,
                  overflow: 'hidden',
                  position: 'relative',
                  bgcolor: 'grey.50'
                }}
              >
                {isImage ? (
                  <Box sx={{ position: 'relative', height: '100%' }}>
                    <img
                      src={doc}
                      alt={fileName}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease'
                      }}
                      onError={(e) => {
                        const target = e.currentTarget as HTMLImageElement;
                        target.style.display = 'none';
                        const parent = target.parentElement;
                        if (parent) {
                          parent.innerHTML = `
                            <div style="
                              display: flex; 
                              align-items: center; 
                              justify-content: center; 
                              height: 100%; 
                              background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
                              position: relative;
                            ">
                              <div style="text-align: center; color: #666;">
                                <svg width="56" height="56" viewBox="0 0 24 24" fill="currentColor" style="opacity: 0.6;">
                                  <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"/>
                                </svg>
                                <div style="margin-top: 12px; font-size: 14px; font-weight: 500;">Image Preview</div>
                                <div style="margin-top: 4px; font-size: 12px; opacity: 0.7;">Failed to load</div>
                              </div>
                            </div>
                          `;
                        }
                      }}
                    />
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(0,0,0,0.6)',
                        color: 'white',
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        backdropFilter: 'blur(4px)'
                      }}
                    >
                      IMG
                    </Box>
                  </Box>
                ) : (
                  <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    position: 'relative'
                  }}>
                    <Box
                      sx={{
                        textAlign: 'center',
                        color: 'white',
                        position: 'relative',
                        zIndex: 1
                      }}
                    >
                      <Box sx={{ mb: 2 }}>
                        {getFileIcon(fileName)}
                      </Box>
                      <Typography
                        variant="h6"
                        sx={{
                          fontWeight: 700,
                          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {fileName.split('.').pop()?.toUpperCase() || 'FILE'}
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.1) 0%, transparent 50%)',
                        pointerEvents: 'none'
                      }}
                    />
                  </Box>
                )}
              </Box>

              <CardContent sx={{ p: 2.5 }}>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 2,
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    minHeight: '2.6em'
                  }}
                  title={fileName}
                >
                  {fileName}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  <Button
                    size="small"
                    variant="contained"
                    href={doc}
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<VisibilityIcon />}
                    sx={{
                      flex: 1,
                      minWidth: 'auto',
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1,
                      boxShadow: '0 2px 8px rgba(25, 118, 210, 0.25)',
                      '&:hover': {
                        boxShadow: '0 4px 16px rgba(25, 118, 210, 0.4)',
                        transform: 'translateY(-1px)'
                      }
                    }}
                  >
                    View
                  </Button>

                  <Button
                    size="small"
                    variant="outlined"
                    href={doc}
                    download={fileName}
                    startIcon={<DownloadIcon />}
                    sx={{
                      flex: 1,
                      minWidth: 'auto',
                      borderRadius: 2,
                      textTransform: 'none',
                      fontWeight: 600,
                      py: 1,
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2,
                        transform: 'translateY(-1px)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    Download
                  </Button>

                  {isDocumentEditMode && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={() => handleDeleteDocument(selectedDriver.id, doc)}
                      startIcon={deletingDocument ? <CircularProgress size={16} /> : <DeleteIcon />}
                      disabled={deletingDocument}
                      sx={{
                        flex: 1,
                        minWidth: 'auto',
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        py: 1,
                        borderWidth: 2,
                        '&:hover': {
                          borderWidth: 2,
                          transform: 'translateY(-1px)',
                          boxShadow: '0 4px 12px rgba(211, 47, 47, 0.25)'
                        }
                      }}
                    >
                      Delete
                    </Button>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        );
      })}
    </Grid>
  </Box>
) : (
  <Box
    sx={{
      textAlign: 'center',
      py: 8,
      px: 4,
      borderRadius: 3,
      bgcolor: 'grey.50',
      border: '2px dashed',
      borderColor: 'grey.300',
      position: 'relative',
      overflow: 'hidden'
    }}
  >
    <Box
      sx={{
        position: 'absolute',
        top: -50,
        left: -50,
        width: 100,
        height: 100,
        borderRadius: '50%',
        bgcolor: 'primary.main',
        opacity: 0.05,
      }}
    />
    <Box
      sx={{
        position: 'absolute',
        bottom: -30,
        right: -30,
        width: 80,
        height: 80,
        borderRadius: '50%',
        bgcolor: 'secondary.main',
        opacity: 0.05,
      }}
    />

    <Box sx={{ position: 'relative', zIndex: 1 }}>
      <DescriptionIcon
        sx={{
          fontSize: 64,
          color: 'grey.400',
          mb: 3,
          opacity: 0.7
        }}
      />
      <Typography
        variant="h5"
        sx={{
          color: 'text.primary',
          fontWeight: 600,
          mb: 1
        }}
      >
        No documents uploaded
      </Typography>
      <Typography
        variant="body1"
        sx={{
          color: 'text.secondary',
          maxWidth: 400,
          mx: 'auto',
          lineHeight: 1.6
        }}
      >
        Documents will appear here once uploaded. Drag and drop files or click to browse.
      </Typography>
    </Box>
  </Box>
)}

                {/* Add New Documents Section - Only in Edit Mode */}
                {isDocumentEditMode && (
                  <Card variant="outlined" sx={{ mt: 3, bgcolor: 'blue.50' }}>
                    <CardContent>
                      <Typography variant="h6" gutterBottom>
                        Add New Documents
                      </Typography>
                      <Box sx={{ mb: 2 }}>
                        <Button
                          variant="outlined"
                          component="label"
                          fullWidth
                          startIcon={<UploadIcon />}
                          sx={{ py: 2 }}
                        >
                          Choose Files to Upload
                          <input
                            type="file"
                            hidden
                            multiple
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={(e) => setNewDocumentsFiles(e.target.files)}
                          />
                        </Button>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                          Upload driver documents (PDF, Word, Images)
                        </Typography>
                      </Box>
                      {newDocumentsFiles && newDocumentsFiles.length > 0 && (
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2">
                            {newDocumentsFiles.length} file(s) selected
                          </Typography>
                          <Button
                            variant="contained"
                            onClick={handleAddNewDocuments}
                            disabled={addingNewDocuments}
                            startIcon={addingNewDocuments ? <CircularProgress size={20} /> : <UploadIcon />}
                          >
                            {addingNewDocuments ? 'Adding...' : 'Add Documents'}
                          </Button>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabPanel>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button
            onClick={() => {
              setShowDetailsModal(false);
              setIsDocumentEditMode(false);
              setNewDocumentsFiles(null);
            }}
            variant="outlined"
            fullWidth
          >
            Close
          </Button>
        </DialogActions>
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
    </Box>
  );
};