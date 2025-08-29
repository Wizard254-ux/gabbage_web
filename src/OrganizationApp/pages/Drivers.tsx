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
  Pagination,

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
  Cancel as CancelIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import { organizationService } from '../../shared/services/services/organizationService';
import { GridLegacy as Grid } from "@mui/material";
interface Driver {
  id: number;
  name: string;
  email: string;
  phone: string;
  isActive: number;
  created_at: string;
  updated_at: string;
  isSent: number;
  documents: string[];
  address?: string;
  email_verified_at?: string;
  role: string;
  organization_id: number;
  active_route?: {
    id: number;
    name: string;
    activated_at: string;
  };
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

interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const Drivers: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [routes, setRoutes] = useState<unknown[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationState>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 20,
    hasNextPage: false,
    hasPrevPage: false
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
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
  const [deletingDocument, setDeletingDocument] = useState(false);
  const [addingNewDocuments, setAddingNewDocuments] = useState(false);
  const [detailsTabValue, setDetailsTabValue] = useState(0);
  const [loadingEdit, setLoadingEdit] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [driverToToggle, setDriverToToggle] = useState<Driver | null>(null);
  const [togglingStatus, setTogglingStatus] = useState(false);

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuDriver, setMenuDriver] = useState<Driver | null>(null);

  useEffect(() => {
    fetchDrivers(1, ''); // Initial load with no search
    // fetchRoutes(); // Disabled due to association error
  }, []);

  const fetchDrivers = async (page = 1, search = '', isSearching = false, showLoading = true) => {
    try {
      if (isSearching) {
        setSearching(true);
      } else if (showLoading) {
        setLoading(true);
      }
      
      console.log('Fetching drivers with params:', { page, search });
      const response = await organizationService.listDrivers({
        page: page.toString(),
        limit: '20',
        search
      });
      console.log('Full response:', response);
      console.log('Response data:', response.data);
      
      if (response.data?.status && response.data?.data) {
        setDrivers(response.data.data.users || []);
        if (response.data.data.pagination) {
          setPagination(response.data.data.pagination);
        }
      }
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
    } finally {
      if (isSearching) {
        setSearching(false);
      } else if (showLoading) {
        setLoading(false);
      }
    }
  };

  const fetchRoutes = async () => {
    try {
      // const response = await organizationService.getAllRoutes();
      // setRoutes(response.data.data || []);
      setRoutes([]); // Temporary fix
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
    setSelectedDriver(driver);
    setEditFormData({
      name: driver.name,
      email: driver.email,
      phone: driver.phone,
      isActive: driver.isActive === 1,
    });
    setDocumentsToDelete([]);
    setEditDocumentsFiles(null);
    setShowEditModal(true);
    setLoadingEdit(true);

    try {
      const response = await organizationService.getDriverDetails(driver.id);
      if (response.data && response.data.data && response.data.data.driver) {
        const driverWithDocs = {
          ...driver,
          ...response.data.data.driver,
          documents: response.data.data.driver.documents || []
        };
        setSelectedDriver(driverWithDocs);
      }
    } catch (error) {
      console.error('Failed to fetch driver details:', error);
    } finally {
      setLoadingEdit(false);
    }
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

      const result = await organizationService.editDriverWithDocuments(selectedDriver.id, formData);
      console.log('Driver update result:', result);
      
      if (result?.data?.status && result?.data?.data?.driver) {
        const rawUpdatedDriver = result.data.data.driver;
        console.log('Raw updated driver from backend:', rawUpdatedDriver);
        
        // Transform the updated driver data to match our interface
        const updatedDriver: Driver = {
          id: rawUpdatedDriver.id,
          name: rawUpdatedDriver.name,
          email: rawUpdatedDriver.email,
          phone: rawUpdatedDriver.phone,
          isActive: rawUpdatedDriver.isActive,
          created_at: rawUpdatedDriver.created_at,
          updated_at: rawUpdatedDriver.updated_at,
          isSent: rawUpdatedDriver.isSent,
          documents: Array.isArray(rawUpdatedDriver.documents) ? rawUpdatedDriver.documents : [],
          address: rawUpdatedDriver.address || '',
          email_verified_at: rawUpdatedDriver.email_verified_at,
          role: rawUpdatedDriver.role,
          organization_id: rawUpdatedDriver.organization_id,
          // Use backend data if available, otherwise preserve existing values
          active_route: rawUpdatedDriver.active_route || selectedDriver.active_route,
          allocated_bags: rawUpdatedDriver.allocated_bags ?? selectedDriver.allocated_bags
        };
        
        console.log('Transformed updated driver:', updatedDriver);
        
        // Update the driver in the current list
        setDrivers(prev => {
          const updatedList = prev.map(driver => 
            driver.id === selectedDriver.id ? updatedDriver : driver
          );
          console.log('Updated drivers list after edit:', updatedList);
          return updatedList;
        });
      } else {
        console.error('Invalid update result structure:', result);
      }
      
      setShowEditModal(false);
      setSelectedDriver(null);
      setDocumentsToDelete([]);
      setEditDocumentsFiles(null);

      setSuccessMessage('Driver updated successfully!');
      setShowSuccessSnackbar(true);
    } catch (error) {
      console.error('Failed to update driver:', error);
    } finally {
      setUpdatingDriver(false);
    }
  };

  const handleDelete = (driver: Driver) => {
    handleMenuClose();
    setDriverToDelete(driver);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!driverToDelete) return;
    
    setDeleting(true);
    try {
      await organizationService.deleteDriver(driverToDelete.id);
      
      // Remove driver from current list and update pagination
      setDrivers(prev => prev.filter(d => d.id !== driverToDelete.id));
      setPagination(prev => {
        const newTotalItems = prev.totalItems - 1;
        const newTotalPages = Math.ceil(newTotalItems / prev.itemsPerPage);
        
        // If current page becomes empty and it's not the first page, go to previous page
        if (drivers.length === 1 && prev.currentPage > 1) {
          fetchDrivers(prev.currentPage - 1, searchQuery);
          return prev;
        }
        
        return {
          ...prev,
          totalItems: newTotalItems,
          totalPages: newTotalPages,
          hasNextPage: prev.currentPage < newTotalPages
        };
      });
      
      setSuccessMessage('Driver deleted successfully!');
      setShowSuccessSnackbar(true);
      setShowDeleteDialog(false);
      setDriverToDelete(null);
    } catch (error) {
      console.error('Failed to delete driver:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleSendCredentials = async (driver: Driver) => {
    handleMenuClose();
    setSendingCredentials(true);
    try {
      await organizationService.sendDriverCredentials(driver.id);
      
      // Update the driver's isSent status in the current list
      setDrivers(prev => prev.map(d => 
        d.id === driver.id ? { ...d, isSent: 1 } : d
      ));
      
      setSuccessMessage(`Credentials ${driver.isSent === 1 ? 'resent' : 'sent'} successfully to ${driver.email}`);
      setShowSuccessSnackbar(true);
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
    setSelectedDriver(null); // Clear previous data
    setDetailsTabValue(0);

    try {
      const response = await organizationService.getDriverDetails(driver.id);
      if (response.data && response.data.data && response.data.data.driver) {
        // Use fresh data from backend instead of merging with old data
        setSelectedDriver({
          ...response.data.data.driver,
          documents: response.data.data.driver.documents || []
        });
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

        // Update selectedDriver immediately
        if (selectedDriver) {
          const updatedDriver = {
            ...selectedDriver,
            documents: selectedDriver.documents?.filter(doc => doc !== documentPath) || []
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

      // Fetch fresh driver details to get updated documents
      const response = await organizationService.getDriverDetails(selectedDriver.id);
      if (response.data && response.data.data && response.data.data.driver) {
        const updatedDriver = {
          ...selectedDriver,
          ...response.data.data.driver,
          documents: response.data.data.driver.documents || []
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

  const handleAdd = async () => {
    console.log('Add driver clicked', addFormData);
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

      const result = await organizationService.createDriverWithMultipart(formData);
      console.log('Driver creation result:', result);
      console.log('Result data:', result?.data);
      console.log('Driver data:', result?.data?.driver);
      
      if (result?.data?.driver) {
        const rawDriver = result.data.driver;
        console.log('Raw driver before transformation:', rawDriver);
        
        // Transform the driver data to match the expected format
        const newDriver: Driver = {
          id: rawDriver.id,
          name: rawDriver.name,
          email: rawDriver.email,
          phone: rawDriver.phone,
          isActive: rawDriver.isActive ?? 1, // Default to active if undefined
          created_at: rawDriver.created_at,
          updated_at: rawDriver.updated_at,
          isSent: 1, // Since credentials were sent
          documents: Array.isArray(rawDriver.documents) ? rawDriver.documents : [],
          address: rawDriver.address || '',
          email_verified_at: rawDriver.email_verified_at || null,
          role: rawDriver.role,
          organization_id: rawDriver.organization_id,
          active_route: null, // New drivers don't have routes
          allocated_bags: 0 // New drivers don't have bags allocated
        };
        
        console.log('Transformed new driver:', newDriver);
        console.log('Current pagination state:', pagination);
        console.log('Current page:', pagination.currentPage);
        
        // Add to the beginning of the current page or fetch first page if not on first page
        if (pagination.currentPage === 1) {
          console.log('Adding to current page (page 1)');
          setDrivers(prev => {
            console.log('Previous drivers:', prev);
            const updatedDrivers = [newDriver, ...prev.slice(0, 19)]; // Keep only 19 to make room for new one
            console.log('Updated drivers list:', updatedDrivers);
            return updatedDrivers;
          });
          setPagination(prev => {
            const newPagination = {
              ...prev,
              totalItems: prev.totalItems + 1,
              totalPages: Math.ceil((prev.totalItems + 1) / prev.itemsPerPage),
              hasNextPage: Math.ceil((prev.totalItems + 1) / prev.itemsPerPage) > prev.currentPage
            };
            console.log('Updated pagination:', newPagination);
            return newPagination;
          });
        } else {
          // If not on first page, go to first page to show the new driver
          console.log('Not on first page, fetching page 1...');
          fetchDrivers(1, searchQuery);
        }
      } else {
        console.error('Invalid result structure:', result);
      }
      
      setShowAddModal(false);
      setAddFormData({ name: '', email: '', phone: '' });
      setDocumentsFiles(null);

      setSuccessMessage('Driver added successfully!');
      setShowSuccessSnackbar(true);
    } catch (error) {
      console.error('Failed to create driver:', error);
    } finally {
      setAddingDriver(false);
    }
  };

  // Handle manual search
  const handleSearch = () => {
    const trimmedSearch = searchTerm.trim();
    console.log('Search triggered:', { searchTerm, trimmedSearch, currentSearchQuery: searchQuery });
    
    // Always search, even if same term (user might want to refresh)
    setSearchQuery(trimmedSearch);
    fetchDrivers(1, trimmedSearch, true);
  };

  // Handle search input key press
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle page changes
  const handlePageChange = (newPage: number) => {
    fetchDrivers(newPage, searchQuery);
  };

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
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  placeholder="Search drivers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="contained"
                  onClick={handleSearch}
                  disabled={searching}
                  sx={{ minWidth: '100px' }}
                >
                  {searching ? <CircularProgress size={20} /> : 'Search'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={async () => {
                    setSearchTerm('');
                    setSearchQuery('');
                    setClearing(true);
                    try {
                      await fetchDrivers(1, '', false, false); // Pass false for isSearching and showLoading
                    } finally {
                      setClearing(false);
                    }
                  }}
                  disabled={searching || clearing}
                  sx={{ minWidth: '80px' }}
                >
                  {clearing ? 'Clearing...' : 'Clear'}
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', gap: 3, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: '#2196F3', borderRadius: '50%' }} />
                  <Typography variant="body2">Total: {pagination.totalItems}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: '#4CAF50', borderRadius: '50%' }} />
                  <Typography variant="body2">Active: {drivers.filter(d => d.isActive === 1).length}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: '#F44336', borderRadius: '50%' }} />
                  <Typography variant="body2">Inactive: {drivers.filter(d => d.isActive === 0).length}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </Typography>
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
              <TableCell sx={{ fontWeight: 'bold' }}>Bags</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Joined</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              // Show loading skeletons
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  <TableCell><div style={{ height: '20px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}></div></TableCell>
                  <TableCell><div style={{ height: '40px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}></div></TableCell>
                  <TableCell><div style={{ height: '20px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}></div></TableCell>
                  <TableCell><div style={{ height: '20px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}></div></TableCell>
                  <TableCell><div style={{ height: '20px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}></div></TableCell>
                  <TableCell><div style={{ height: '20px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}></div></TableCell>
                  <TableCell><div style={{ height: '20px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}></div></TableCell>
                  <TableCell><div style={{ height: '20px', backgroundColor: '#f0f0f0', borderRadius: '4px' }}></div></TableCell>
                </TableRow>
              ))
            ) : (
              drivers.map((driver, index) => (
              <TableRow
                key={driver.id}
                hover
                sx={{ '&:hover': { bgcolor: 'grey.50' } }}
              >
                <TableCell>{((pagination.currentPage - 1) * pagination.itemsPerPage) + index + 1}</TableCell>

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
                  {driver.active_route ? (
                    <Box>
                      <Typography variant="body2" fontWeight="medium" color="primary.main">
                        {driver.active_route.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Active since {new Date(driver.active_route.activated_at).toLocaleDateString()}
                      </Typography>
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No active route
                    </Typography>
                  )}
                </TableCell>

                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {driver.allocated_bags || 0}
                  </Typography>
                 
                </TableCell>

                <TableCell>
                  <Chip
                    label={driver.isActive === 1 ? 'Active' : 'Inactive'}
                    color={driver.isActive === 1 ? 'success' : 'error'}
                    variant="outlined"
                    size="small"
                  />
                </TableCell>

                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(driver.created_at).toLocaleDateString()}
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
              ))
            )}
          </TableBody>
        </Table>

        {drivers.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <PersonIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No drivers found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchQuery ? 'Try adjusting your search terms.' : 'Get started by adding a new driver.'}
            </Typography>
          </Box>
        )}
      </TableContainer>

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 3 }}>
          <Pagination
            count={pagination.totalPages}
            page={pagination.currentPage}
            onChange={(_, page) => handlePageChange(page)}
            color="primary"
            size="large"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

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
          {sendingCredentials ? 'Sending...' : (menuDriver?.isSent === 1 ? 'Resend Credentials' : 'Send Credentials')}
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
          onClick={() => {
            if (menuDriver) {
              setDriverToToggle(menuDriver);
              setShowStatusDialog(true);
              handleMenuClose();
            }
          }}
          sx={{ color: 'primary.main' }}
        >
          {menuDriver?.isActive === 1 ? <CancelIcon sx={{ mr: 2, fontSize: 20 }} /> : <CheckCircleIcon sx={{ mr: 2, fontSize: 20 }} />}
          {menuDriver?.isActive === 1 ? 'Deactivate' : 'Activate'}
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
              variant="contained"
              disabled={addingDriver}
              startIcon={addingDriver ? <CircularProgress size={20} /> : <AddIcon />}
              onClick={handleAdd}
            >
              {addingDriver ? 'Adding...' : 'Add Driver'}
            </Button>
          </DialogActions>
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
              
              {loadingEdit ? (
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 4 }}>
                    <CircularProgress size={30} />
                    <Typography sx={{ ml: 2 }}>Loading driver details...</Typography>
                  </Box>
                </Grid>
              ) : selectedDriver?.documents && selectedDriver.documents.length > 0 && (
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
              onClick={() => window.open(organizationService.getSecureDocumentUrl(doc), '_blank')}
              sx={{ color: 'primary.main' }}
            >
              <VisibilityIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={async () => {
                try {
                  const response = await fetch(organizationService.getSecureDocumentUrl(doc));
                  const blob = await response.blob();
                  const url = window.URL.createObjectURL(blob);
                  const link = document.createElement('a');
                  link.href = url;
                  link.download = fileName;
                  link.click();
                  window.URL.revokeObjectURL(url);
                } catch (error) {
                  console.error('Download failed:', error);
                }
              }}
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
          {loadingDriverDetails ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
              <CircularProgress size={40} />
              <Typography sx={{ ml: 2 }}>Loading driver details...</Typography>
            </Box>
          ) : selectedDriver && (
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
                    label={selectedDriver.isActive === 1 ? 'Active' : 'Inactive'}
                    color={selectedDriver.isActive === 1 ? 'success' : 'error'}
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
                        <Typography>{new Date(selectedDriver.created_at).toLocaleDateString()}</Typography>
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
                          label={selectedDriver.isSent === 1 ? 'Credentials Sent' : 'Credentials Not Sent'}
                          color={selectedDriver.isSent === 1 ? 'info' : 'warning'}
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
          <Grid item xs={12} sm={8} md={6} lg={4} key={`doc-detail-${index}`}>
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

              <CardContent sx={{ p: 2.5, minHeight: 120 }}>
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
                    onClick={() => window.open(organizationService.getSecureDocumentUrl(doc), '_blank')}
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
                    onClick={async () => {
                      try {
                        const response = await fetch(organizationService.getSecureDocumentUrl(doc));
                        const blob = await response.blob();
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = fileName;
                        link.click();
                        window.URL.revokeObjectURL(url);
                      } catch (error) {
                        console.error('Download failed:', error);
                      }
                    }}
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

      {/* Status Toggle Confirmation Dialog */}
      <Dialog open={showStatusDialog} onClose={() => !togglingStatus && setShowStatusDialog(false)}>
        <DialogTitle>
          {driverToToggle?.isActive === 1 ? 'Deactivate Driver' : 'Activate Driver'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {driverToToggle?.isActive === 1 ? 'deactivate' : 'activate'} <strong>{driverToToggle?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStatusDialog(false)} disabled={togglingStatus}>
            Cancel
          </Button>
          <Button 
            onClick={async () => {
              if (!driverToToggle) return;
              
              setTogglingStatus(true);
              try {
                const newStatus = driverToToggle.isActive === 1 ? false : true;
                await organizationService.toggleDriverStatus(driverToToggle.id, newStatus);
                
                // Update driver status in the list
                setDrivers(prev => prev.map(driver => 
                  driver.id === driverToToggle.id 
                    ? { ...driver, isActive: newStatus ? 1 : 0 }
                    : driver
                ));
                
                setSuccessMessage(`Driver ${newStatus ? 'activated' : 'deactivated'} successfully!`);
                setShowSuccessSnackbar(true);
                setShowStatusDialog(false);
                setDriverToToggle(null);
              } catch (error) {
                console.error('Failed to toggle driver status:', error);
              } finally {
                setTogglingStatus(false);
              }
            }}
            color="primary"
            variant="contained"
            disabled={togglingStatus}
            startIcon={togglingStatus ? <CircularProgress size={20} /> : (driverToToggle?.isActive === 1 ? <CancelIcon /> : <CheckCircleIcon />)}
          >
            {togglingStatus ? (driverToToggle?.isActive === 1 ? 'Deactivating...' : 'Activating...') : (driverToToggle?.isActive === 1 ? 'Deactivate' : 'Activate')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => !deleting && setShowDeleteDialog(false)}>
        <DialogTitle>Delete Driver</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{driverToDelete?.name}</strong>? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete} 
            color="error" 
            variant="contained"
            disabled={deleting}
            startIcon={deleting ? <CircularProgress size={20} /> : <DeleteIcon />}
          >
            {deleting ? 'Deleting...' : 'Delete'}
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