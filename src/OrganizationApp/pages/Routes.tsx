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
  Snackbar,
  Switch,
  FormControlLabel,
  Pagination
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  Route as RouteIcon,
  Map as MapIcon,
  LocationOn as LocationIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  PlayArrow as PlayArrowIcon,
  Pause as PauseIcon
} from '@mui/icons-material';
import { organizationService } from '../../shared/services/services/organizationService';

interface Route {
  id: string;
  _id: string;
  name: string;
  path: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  active_drivers?: any[];
  clients_count?: number;
}

interface PaginationState {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export const Routes: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [routeDetails, setRouteDetails] = useState<any>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [creatingRoute, setCreatingRoute] = useState(false);
  const [updatingRoute, setUpdatingRoute] = useState(false);
  const [activatingRoute, setActivatingRoute] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<Route | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [clearing, setClearing] = useState(false);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [routeToToggle, setRouteToToggle] = useState<Route | null>(null);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    path: '',
    description: '',
    isActive: true,
  });

  // Menu state
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuRoute, setMenuRoute] = useState<Route | null>(null);

  useEffect(() => {
    fetchRoutes(1, ''); // Initial load with no search
    fetchDrivers();
  }, []);

  const fetchRoutes = async (page = 1, search = '', isSearching = false, showLoading = true) => {
    try {
      if (isSearching) {
        setSearching(true);
      } else if (showLoading) {
        setLoading(true);
      }
      console.log('Fetching routes with params:', { page, search });
      const response = await organizationService.getAllRoutes({
        page: page.toString(),
        limit: '20',
        search
      });
      console.log('Routes API response:', response);
      
      if (response.data && response.data.data) {
        setRoutes(response.data.data.data || []);
        if (response.data.data.pagination) {
          setPagination(response.data.data.pagination);
        }
      } else {
        console.error('Unexpected API response format:', response);
        setRoutes([]);
      }
    } catch (error) {
      console.error('Failed to fetch routes:', error);
      setRoutes([]);
    } finally {
      if (isSearching) {
        setSearching(false);
      } else if (showLoading) {
        setLoading(false);
      }
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await organizationService.listDrivers();
      setDrivers(response.data?.data?.users || []);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
    }
  };

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setSearchQuery(searchTerm);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Handle manual search
  const handleSearch = () => {
    const trimmedSearch = searchTerm.trim();
    console.log('Search triggered:', { searchTerm, trimmedSearch, currentSearchQuery: searchQuery });
    
    // Always search, even if same term (user might want to refresh)
    setSearchQuery(trimmedSearch);
    fetchRoutes(1, trimmedSearch, true);
  };

  // Handle search input key press
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Handle page changes
  const handlePageChange = (newPage: number) => {
    fetchRoutes(newPage, searchQuery);
  };

  const getAssignedDriver = (routeId: string) => {
    const route = routes.find(r => r.id === routeId);
    if (route && (route as any).activeDriverId) {
      const driver = drivers.find(d => d.id === (route as any).activeDriverId);
      return driver;
    }
    return null;
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, route: Route) => {
    setAnchorEl(event.currentTarget);
    setMenuRoute(route);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setMenuRoute(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingRoute(true);
    try {
      console.log('Creating route with data:', formData);
      const response = await organizationService.createRoute(formData);
      console.log('Create route response:', response);
      
      if (response?.data?.status && response?.data?.data?.route) {
        const newRoute = response.data.data.route;
        
        // Add to the beginning of the current page or fetch first page
        if (pagination.currentPage === 1) {
          setRoutes(prev => [newRoute, ...prev.slice(0, 19)]);
          setPagination(prev => ({
            ...prev,
            totalItems: prev.totalItems + 1,
            totalPages: Math.ceil((prev.totalItems + 1) / prev.itemsPerPage)
          }));
        } else {
          fetchRoutes(1, searchQuery);
        }
      }
      
      setShowCreateModal(false);
      setFormData({ name: '', path: '', description: '', isActive: true });
      setSuccessMessage('Route created successfully!');
      setShowSuccessSnackbar(true);
    } catch (error) {
      console.error('Failed to create route:', error);
    } finally {
      setCreatingRoute(false);
    }
  };

  const handleEdit = (route: Route) => {
    handleMenuClose();
    setSelectedRoute(route);
    setFormData({
      name: route.name,
      path: route.path,
      description: route.description,
      isActive: route.isActive,
    });
    setShowEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRoute) return;

    setUpdatingRoute(true);
    try {
      const response = await organizationService.updateRoute(selectedRoute.id, formData);
      console.log('Update route response:', response);
      
      if (response?.data?.status) {
        // Update the route in the current list
        const updatedRoute = {
          ...selectedRoute,
          name: formData.name,
          path: formData.path,
          description: formData.description,
          isActive: formData.isActive
        };
        
        setRoutes(prev => prev.map(route => 
          route.id === selectedRoute.id ? updatedRoute : route
        ));
      }
      
      setShowEditModal(false);
      setSelectedRoute(null);
      setFormData({ name: '', path: '', description: '', isActive: true });
      setSuccessMessage('Route updated successfully!');
      setShowSuccessSnackbar(true);
    } catch (error) {
      console.error('Failed to update route:', error);
    } finally {
      setUpdatingRoute(false);
    }
  };

  const handleDelete = (route: Route) => {
    handleMenuClose();
    setRouteToDelete(route);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!routeToDelete) return;
    
    setDeleting(true);
    try {
      await organizationService.deleteRoute(routeToDelete.id);
      
      // Remove route from current list and update pagination
      setRoutes(prev => prev.filter(r => r.id !== routeToDelete.id));
      setPagination(prev => {
        const newTotalItems = prev.totalItems - 1;
        const newTotalPages = Math.ceil(newTotalItems / prev.itemsPerPage);
        
        // If current page becomes empty and it's not the first page, go to previous page
        if (routes.length === 1 && prev.currentPage > 1) {
          fetchRoutes(prev.currentPage - 1, searchQuery);
          return prev;
        }
        
        return {
          ...prev,
          totalItems: newTotalItems,
          totalPages: newTotalPages,
          hasNextPage: prev.currentPage < newTotalPages
        };
      });
      
      setSuccessMessage('Route deleted successfully!');
      setShowSuccessSnackbar(true);
      setShowDeleteDialog(false);
      setRouteToDelete(null);
    } catch (error) {
      console.error('Failed to delete route:', error);
    } finally {
      setDeleting(false);
    }
  };

  const handleActivate = async (id: string) => {
    setActivatingRoute(id);
    try {
      await organizationService.updateRoute(id, { isActive: true });
      
      // Update specific route in the list without reloading
      setRoutes(prev => prev.map(route => 
        route.id === id ? { ...route, isActive: true } : route
      ));
      
      setSuccessMessage('Route activated successfully!');
      setShowSuccessSnackbar(true);
    } catch (error) {
      console.error('Failed to activate route:', error);
    } finally {
      setActivatingRoute(null);
    }
  };

  const handleDeactivate = async (id: string) => {
    setActivatingRoute(id);
    try {
      await organizationService.updateRoute(id, { isActive: false });
      
      // Update specific route in the list without reloading
      setRoutes(prev => prev.map(route => 
        route.id === id ? { ...route, isActive: false } : route
      ));
      
      setSuccessMessage('Route deactivated successfully!');
      setShowSuccessSnackbar(true);
    } catch (error) {
      console.error('Failed to deactivate route:', error);
    } finally {
      setActivatingRoute(null);
    }
  };

  const handleViewRoute = async (route: Route) => {
    handleMenuClose();
    setShowDetailsModal(true);
    setLoadingDetails(true);
    setRouteDetails(null);
    
    try {
      const response = await organizationService.getRouteDetails(route.id);
      setRouteDetails(response.data.data.route);
    } catch (error) {
      console.error('Failed to fetch route details:', error);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Removed frontend filtering - now handled by backend

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
            Routes Management
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Design and manage collection routes
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowCreateModal(true)}
          sx={{
            background: 'linear-gradient(45deg, #4CAF50 30%, #45A049 90%)',
            boxShadow: '0 3px 5px 2px rgba(156, 39, 176, .3)',
          }}
        >
          Create New Route
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
                  placeholder="Search routes..."
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
                      await fetchRoutes(1, '', false, false); // Pass false for isSearching and showLoading
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
                  <Box sx={{ width: 12, height: 12, bgcolor: '#9C27B0', borderRadius: '50%' }} />
                  <Typography variant="body2">Total: {pagination.totalItems}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: '#4CAF50', borderRadius: '50%' }} />
                  <Typography variant="body2">Active: {routes.filter(r => r.isActive).length}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: '#F44336', borderRadius: '50%' }} />
                  <Typography variant="body2">Inactive: {routes.filter(r => !r.isActive).length}</Typography>
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

      {/* Routes Table */}
      <TableContainer component={Paper} sx={{ boxShadow: 3 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'grey.50' }}>
              <TableCell sx={{ fontWeight: 'bold' }}>#</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Route</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Path</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Assigned Driver</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Clients</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
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
                </TableRow>
              ))
            ) : (
              routes.map((route, index) => (
              <TableRow
                key={route.id}
                hover
                sx={{ '&:hover': { bgcolor: 'grey.50' } }}
              >
                <TableCell>{((pagination.currentPage - 1) * pagination.itemsPerPage) + index + 1}</TableCell>

                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'secondary.main',
                        width: 40,
                        height: 40,
                        fontSize: '0.875rem'
                      }}
                    >
                      {getInitials(route.name)}
                    </Avatar>
                    <Box>
                      <Typography variant="body2" fontWeight="medium">
                        {route.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {route.id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>

                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MapIcon color="action" fontSize="small" />
                    <Typography variant="body2">
                      {route.path}
                    </Typography>
                  </Box>
                </TableCell>

                <TableCell>
                  <Typography 
                    variant="body2" 
                    sx={{ maxWidth: 250 }} 
                    noWrap 
                    title={route.description || 'No description provided'}
                  >
                    {route.description || 'No description provided'}
                  </Typography>
                </TableCell>

                <TableCell>
                  {route.active_drivers && route.active_drivers.length > 0 ? (
                    route.active_drivers.length === 1 ? (
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar
                          sx={{
                            bgcolor: 'primary.main',
                            width: 32,
                            height: 32,
                            fontSize: '0.75rem'
                          }}
                        >
                          {route.active_drivers[0].name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {route.active_drivers[0].name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Active since {new Date(route.active_drivers[0].activated_at).toLocaleDateString()}
                          </Typography>
                        </Box>
                      </Box>
                    ) : (
                      <FormControl size="small" sx={{ minWidth: 200 }}>
                        <Select
                          displayEmpty
                          renderValue={() => `${route.active_drivers.length} Active Drivers`}
                          sx={{ fontSize: '0.875rem' }}
                        >
                          {route.active_drivers.map((driver) => (
                            <MenuItem key={driver.id} value={driver.id}>
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%' }}>
                                <Avatar
                                  sx={{
                                    bgcolor: 'primary.main',
                                    width: 24,
                                    height: 24,
                                    fontSize: '0.75rem'
                                  }}
                                >
                                  {driver.name.charAt(0).toUpperCase()}
                                </Avatar>
                                <Box>
                                  <Typography variant="body2" fontWeight="medium">
                                    {driver.name}
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Since {new Date(driver.activated_at).toLocaleDateString()}
                                  </Typography>
                                </Box>
                              </Box>
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    )
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No active drivers
                    </Typography>
                  )}
                </TableCell>

                <TableCell>
                  <Typography variant="body2" fontWeight="medium" color="info.main">
                    {route.clients_count || 0}
                  </Typography>
                </TableCell>

                <TableCell>
                  <Chip
                    label={route.isActive ? 'Active' : 'Inactive'}
                    color={route.isActive ? 'success' : 'error'}
                    variant="outlined"
                    size="small"
                    icon={route.isActive ? <CheckCircleIcon /> : <CancelIcon />}
                  />
                </TableCell>

                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {new Date(route.created_at).toLocaleDateString()}
                  </Typography>
                </TableCell>

                <TableCell>
                  <IconButton
                    onClick={(e) => handleMenuOpen(e, route)}
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

        {routes.length === 0 && !loading && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <RouteIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No routes found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchQuery ? 'Try adjusting your search terms.' : 'Get started by creating a new route.'}
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
        <MenuItem onClick={() => menuRoute && handleViewRoute(menuRoute)}>
          <VisibilityIcon sx={{ mr: 2, fontSize: 20 }} />
          View Route
        </MenuItem>
        <MenuItem onClick={() => menuRoute && handleEdit(menuRoute)}>
          <EditIcon sx={{ mr: 2, fontSize: 20 }} />
          Edit
        </MenuItem>
        <MenuItem 
          onClick={() => {
            if (menuRoute) {
              setRouteToToggle(menuRoute);
              setShowStatusDialog(true);
              handleMenuClose();
            }
          }}
          sx={{ color: 'primary.main' }}
        >
          {menuRoute?.isActive ? <PauseIcon sx={{ mr: 2, fontSize: 20 }} /> : <PlayArrowIcon sx={{ mr: 2, fontSize: 20 }} />}
          {menuRoute?.isActive ? 'Deactivate' : 'Activate'}
        </MenuItem>
        <MenuItem
          onClick={() => menuRoute && handleDelete(menuRoute)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 2, fontSize: 20 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Create Route Dialog */}
      <Dialog
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            background: 'linear-gradient(45deg, #4CAF50 30%, #45A049 90%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 3
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <RouteIcon sx={{ fontSize: 28 }} />
            <Typography variant="h5" fontWeight="bold">
              Create New Route
            </Typography>
          </Box>
          <IconButton 
            onClick={() => setShowCreateModal(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <form onSubmit={handleCreate}>
          <DialogContent sx={{ p: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Route Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <RouteIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Route Path"
                  value={formData.path}
                  onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={3}
                  variant="outlined"
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, bgcolor: 'grey.50' }}>
            <Button 
              onClick={() => setShowCreateModal(false)}
              variant="outlined"
              disabled={creatingRoute}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={creatingRoute}
              startIcon={creatingRoute ? <CircularProgress size={20} /> : <AddIcon />}
              sx={{
                background: 'linear-gradient(45deg, #4CAF50 30%, #45A049 90%)',
                boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)',
              }}
            >
              {creatingRoute ? 'Creating...' : 'Create Route'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Edit Route Dialog */}
      <Dialog
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle 
          sx={{ 
            background: 'linear-gradient(45deg, #4CAF50 30%, #45A049 90%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 3
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <EditIcon sx={{ fontSize: 28 }} />
            <Typography variant="h5" fontWeight="bold">
              Edit Route
            </Typography>
          </Box>
          <IconButton 
            onClick={() => setShowEditModal(false)}
            sx={{ color: 'white' }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <form onSubmit={handleUpdate}>
          <DialogContent sx={{ p: 4 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Route Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <RouteIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Route Path"
                  value={formData.path}
                  onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                  required
                  variant="outlined"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon color="action" />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  multiline
                  rows={3}
                  variant="outlined"
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    />
                  }
                  label="Active Status"
                />
              </Grid>
            </Grid>
          </DialogContent>
          
          <DialogActions sx={{ p: 3, bgcolor: 'grey.50' }}>
            <Button 
              onClick={() => setShowEditModal(false)}
              variant="outlined"
              disabled={updatingRoute}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={updatingRoute}
              startIcon={updatingRoute ? <CircularProgress size={20} /> : <EditIcon />}
              sx={{
                background: 'linear-gradient(45deg, #4CAF50 30%, #45A049 90%)',
                boxShadow: '0 3px 5px 2px rgba(76, 175, 80, .3)',
              }}
            >
              {updatingRoute ? 'Updating...' : 'Update Route'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Route Details Dialog */}
      <Dialog
        open={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          Route Details
          <IconButton onClick={() => setShowDetailsModal(false)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {loadingDetails ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : routeDetails ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Route Information</Typography>
                    <Typography><strong>Name:</strong> {routeDetails.name}</Typography>
                    <Typography><strong>Path:</strong> {routeDetails.path}</Typography>
                    <Typography><strong>Description:</strong> {routeDetails.description || 'No description'}</Typography>
                    <Typography><strong>Status:</strong> 
                      <Chip 
                        label={routeDetails.isActive ? 'Active' : 'Inactive'} 
                        color={routeDetails.isActive ? 'success' : 'error'} 
                        size="small" 
                        sx={{ ml: 1 }}
                      />
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Statistics</Typography>
                    <Typography><strong>Total Clients:</strong> {routeDetails.clients_count}</Typography>
                    <Typography><strong>Active Drivers:</strong> {routeDetails.active_drivers?.length || 0}</Typography>
                    <Typography><strong>Created:</strong> {new Date(routeDetails.created_at).toLocaleDateString()}</Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              {routeDetails.active_drivers?.length > 0 && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Active Drivers</Typography>
                      <Grid container spacing={2}>
                        {routeDetails.active_drivers.map((driver) => (
                          <Grid item xs={12} sm={6} md={4} key={driver.id}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                              <Avatar sx={{ bgcolor: 'primary.main' }}>
                                {driver.name.charAt(0).toUpperCase()}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">{driver.name}</Typography>
                                <Typography variant="caption" color="text.secondary">{driver.email}</Typography>
                                <Typography variant="caption" display="block" color="text.secondary">{driver.phone}</Typography>
                              </Box>
                            </Box>
                          </Grid>
                        ))}
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              )}
              
              {routeDetails.clients?.length > 0 && (
                <Grid item xs={12}>
                  <Card variant="outlined">
                    <CardContent>
                      <Typography variant="h6" gutterBottom>Clients on Route</Typography>
                      <TableContainer>
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell>Name</TableCell>
                              <TableCell>Contact</TableCell>
                              <TableCell>Type</TableCell>
                              <TableCell>Rate</TableCell>
                              <TableCell>Pickup Day</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {routeDetails.clients.map((client) => (
                              <TableRow key={client.id}>
                                <TableCell>{client.name}</TableCell>
                                <TableCell>
                                  <Typography variant="body2">{client.email}</Typography>
                                  <Typography variant="caption" color="text.secondary">{client.phone}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Chip label={client.clientType} size="small" variant="outlined" />
                                </TableCell>
                                <TableCell>KSH {parseFloat(client.monthlyRate || '0').toLocaleString()}</TableCell>
                                <TableCell sx={{ textTransform: 'capitalize' }}>{client.pickUpDay}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    </CardContent>
                  </Card>
                </Grid>
              )}
            </Grid>
          ) : (
            <Typography>No route details available</Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Toggle Confirmation Dialog */}
      <Dialog open={showStatusDialog} onClose={() => !togglingStatus && setShowStatusDialog(false)}>
        <DialogTitle>
          {routeToToggle?.isActive ? 'Deactivate Route' : 'Activate Route'}
        </DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to {routeToToggle?.isActive ? 'deactivate' : 'activate'} <strong>{routeToToggle?.name}</strong>?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStatusDialog(false)} disabled={togglingStatus}>
            Cancel
          </Button>
          <Button 
            onClick={async () => {
              if (!routeToToggle) return;
              
              setTogglingStatus(true);
              try {
                const newStatus = !routeToToggle.isActive;
                await organizationService.updateRoute(routeToToggle.id, { isActive: newStatus });
                
                // Update route status in the list
                setRoutes(prev => prev.map(route => 
                  route.id === routeToToggle.id 
                    ? { ...route, isActive: newStatus }
                    : route
                ));
                
                setSuccessMessage(`Route ${newStatus ? 'activated' : 'deactivated'} successfully!`);
                setShowSuccessSnackbar(true);
                setShowStatusDialog(false);
                setRouteToToggle(null);
              } catch (error) {
                console.error('Failed to toggle route status:', error);
              } finally {
                setTogglingStatus(false);
              }
            }}
            color="primary"
            variant="contained"
            disabled={togglingStatus}
            startIcon={togglingStatus ? <CircularProgress size={20} /> : (routeToToggle?.isActive ? <PauseIcon /> : <PlayArrowIcon />)}
          >
            {togglingStatus ? (routeToToggle?.isActive ? 'Deactivating...' : 'Activating...') : (routeToToggle?.isActive ? 'Deactivate' : 'Activate')}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onClose={() => !deleting && setShowDeleteDialog(false)}>
        <DialogTitle>Delete Route</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete <strong>{routeToDelete?.name}</strong>? This action cannot be undone.
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