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
  FormControlLabel
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
import { organizationService } from '../../services/organizationService';

interface Route {
  id: string;
  _id: string;
  name: string;
  path: string;
  description: string;
  isActive: boolean;
  createdAt: string;
}

export const Routes: React.FC = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState<Route | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessSnackbar, setShowSuccessSnackbar] = useState(false);
  const [creatingRoute, setCreatingRoute] = useState(false);
  const [updatingRoute, setUpdatingRoute] = useState(false);
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
    fetchRoutes();
    fetchDrivers();
  }, []);

  const fetchRoutes = async () => {
    try {
      const response = await organizationService.getAllRoutes();
      console.log('Routes API response:', response);
      // The API returns data in response.data.data (not response.data.routes)
      if (response.data && response.data.data) {
        setRoutes(response.data.data);
      } else {
        console.error('Unexpected API response format:', response);
        setRoutes([]);
      }
    } catch (error) {
      console.error('Failed to fetch routes:', error);
      setRoutes([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await organizationService.listDrivers();
      setDrivers(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
    }
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
      setShowCreateModal(false);
      setFormData({ name: '', path: '', description: '', isActive: true });
      fetchRoutes();
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
      await organizationService.updateRoute(selectedRoute.id, formData);
      setShowEditModal(false);
      setSelectedRoute(null);
      setFormData({ name: '', path: '', description: '', isActive: true });
      fetchRoutes();
      setSuccessMessage('Route updated successfully!');
      setShowSuccessSnackbar(true);
    } catch (error) {
      console.error('Failed to update route:', error);
    } finally {
      setUpdatingRoute(false);
    }
  };

  const handleDelete = async (route: Route) => {
    handleMenuClose();
    if (window.confirm('Are you sure you want to delete this route?')) {
      try {
        await organizationService.deleteRoute(route.id);
        fetchRoutes();
        setSuccessMessage('Route deleted successfully!');
        setShowSuccessSnackbar(true);
      } catch (error) {
        console.error('Failed to delete route:', error);
      }
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await organizationService.updateRoute(id, { isActive: true });
      fetchRoutes();
      setSuccessMessage('Route activated successfully!');
      setShowSuccessSnackbar(true);
    } catch (error) {
      console.error('Failed to activate route:', error);
    }
  };

  const handleDeactivate = async (id: string) => {
    try {
      await organizationService.updateRoute(id, { isActive: false });
      fetchRoutes();
      setSuccessMessage('Route deactivated successfully!');
      setShowSuccessSnackbar(true);
    } catch (error) {
      console.error('Failed to deactivate route:', error);
    }
  };

  const filteredRoutes = routes.filter(route =>
    route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.description.toLowerCase().includes(searchTerm.toLowerCase())
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
              <TextField
                fullWidth
                placeholder="Search routes..."
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
                  <Box sx={{ width: 12, height: 12, bgcolor: '#9C27B0', borderRadius: '50%' }} />
                  <Typography variant="body2">Total: {routes.length}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: '#4CAF50', borderRadius: '50%' }} />
                  <Typography variant="body2">Active: {routes.filter(r => r.isActive).length}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 12, height: 12, bgcolor: '#F44336', borderRadius: '50%' }} />
                  <Typography variant="body2">Inactive: {routes.filter(r => !r.isActive).length}</Typography>
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
              <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Created</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredRoutes.map((route, index) => (
              <TableRow
                key={route.id}
                hover
                sx={{ '&:hover': { bgcolor: 'grey.50' } }}
              >
                <TableCell>{index + 1}</TableCell>

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
                    <Box>
                      {route.active_drivers.map((driver, index) => (
                        <Box key={driver.id} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: index < route.active_drivers.length - 1 ? 1 : 0 }}>
                          <Avatar
                            sx={{
                              bgcolor: 'primary.main',
                              width: 32,
                              height: 32,
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
                              Active since {new Date(driver.activated_at).toLocaleDateString()}
                            </Typography>
                          </Box>
                        </Box>
                      ))}
                    </Box>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No active drivers
                    </Typography>
                  )}
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
                    {new Date(route.createdAt).toLocaleDateString()}
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
            ))}
          </TableBody>
        </Table>

        {filteredRoutes.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <RouteIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No routes found
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating a new route.'}
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
        <MenuItem onClick={() => menuRoute && handleEdit(menuRoute)}>
          <EditIcon sx={{ mr: 2, fontSize: 20 }} />
          Edit
        </MenuItem>
        <MenuItem 
          onClick={() => {
            if (menuRoute) {
              if (menuRoute.isActive) {
                handleDeactivate(menuRoute.id);
              } else {
                handleActivate(menuRoute.id);
              }
              handleMenuClose();
            }
          }}
          sx={{ color: menuRoute?.isActive ? 'warning.main' : 'success.main' }}
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
                background: 'linear-gradient(45deg, #9C27B0 30%, #7B1FA2 90%)',
                boxShadow: '0 3px 5px 2px rgba(156, 39, 176, .3)',
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