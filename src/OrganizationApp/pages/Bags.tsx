import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  TextField,
  InputAdornment,
  Card,
  CardContent,
  Button,
  CircularProgress,
  Chip,
  Avatar,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import Grid from '@mui/material/Grid';

import {
  Search as SearchIcon,
  Download as DownloadIcon,
  LocalShipping as BagIcon,
  FilterList as FilterIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Person as PersonIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Assignment as AssignIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { organizationService } from '../../shared/services/services/organizationService';
import { handleApiError } from '../../shared/utils/errorHandler';

interface BagIssue {
  id: number;
  driver_id: number;
  client_id: number;
  client_email: string;
  number_of_bags_issued: number;
  otp_code: string;
  otp_expires_at: string;
  is_verified: boolean;
  issued_at?: string;
  created_at: string;
  updated_at: string;
  driver?: {
    id: number;
    name: string;
  };
  client?: {
    id: number;
    name: string;
  };
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  accountNumber: string;
}

const Bags: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [bagIssues, setBagIssues] = useState<BagIssue[]>([]);
  const [driverAllocations, setDriverAllocations] = useState<any[]>([]);
  const [bagTransfers, setBagTransfers] = useState<any[]>([]);
  const [bagInventory, setBagInventory] = useState<any>(null);
  const [clients, setClients] = useState<Client[]>([]);
  const [drivers, setDrivers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [driverSearchTerm, setDriverSearchTerm] = useState('');
  const [searchingDrivers, setSearchingDrivers] = useState(false);
  const [searchingBagIssues, setSearchingBagIssues] = useState(false);
  const [clearingBagIssues, setClearingBagIssues] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, hasNext: false, hasPrev: false });
  
  // Menu and modal states
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [removeModalOpen, setRemoveModalOpen] = useState(false);
  const [allocateModalOpen, setAllocateModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  
  // Form states
  const [addBags, setAddBags] = useState('');
  const [removeBags, setRemoveBags] = useState('');
  const [removeReason, setRemoveReason] = useState('');
  const [allocateBags, setAllocateBags] = useState('');
  const [selectedDriver, setSelectedDriver] = useState('');
  const [returnBags, setReturnBags] = useState('');
  const [returnDriver, setReturnDriver] = useState('');
  const [returnReason, setReturnReason] = useState('');
  
  // Loading and toast states
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Fetch bag distribution history
  const fetchBagIssues = async (page = 1) => {
    setLoading(true);
    try {
      const response = await organizationService.getBagDistributionHistory({ page, limit: 50 });
      setBagIssues(response.data.data?.bag_issues || []);
      setPagination(response.data.data?.pagination || { currentPage: page, totalPages: 1, hasNext: false, hasPrev: false });
      setCurrentPage(page);
    } catch (error) {
      console.error('Failed to fetch bag distribution history:', error);
      handleApiError(error, (message) => setToast({ open: true, message, severity: 'error' }));
      setBagIssues([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch clients and drivers
  const fetchClients = async () => {
    try {
      const response = await organizationService.listClients();
      setClients(response.data.users || []);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      handleApiError(error, (message) => setToast({ open: true, message, severity: 'error' }));
    }
  };

  const fetchDrivers = async () => {
    try {
      const response = await organizationService.listDrivers();
      console.log('Drivers response:', response.data);
      setDrivers(response.data.data.users || []);
    } catch (error) {
      console.error('Failed to fetch drivers:', error);
      handleApiError(error, (message) => setToast({ open: true, message, severity: 'error' }));
    }
  };

  const fetchBagInventory = async () => {
    try {
      const response = await organizationService.getOrganizationBags();
      console.log('Driver allocations response:', response.data.data?.driver_allocations);
      setBagInventory(response.data.data?.organization_bags || null);
      setDriverAllocations(response.data.data?.driver_allocations || []);
    } catch (error) {
      console.error('Failed to fetch bag inventory:', error);
      handleApiError(error, (message) => setToast({ open: true, message, severity: 'error' }));
    }
  };

  const fetchBagTransfers = async () => {
    try {
      const response = await organizationService.getBagTransfers();
      setBagTransfers(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch bag transfers:', error);
      handleApiError(error, (message) => setToast({ open: true, message, severity: 'error' }));
      setBagTransfers([]);
    }
  };

  const fetchDriverAllocations = async (searchTerm = '') => {
    setSearchingDrivers(true);
    try {
      const params = searchTerm ? { search: searchTerm } : {};
      console.log('Sending search params to backend:', params);
      const response = await organizationService.getOrganizationBags(params);
      console.log('Filtered driver allocations response:', response.data.data?.driver_allocations);
      setDriverAllocations(response.data.data?.driver_allocations || []);
    } catch (error) {
      console.error('Failed to fetch driver allocations:', error);
      handleApiError(error, (message) => setToast({ open: true, message, severity: 'error' }));
    } finally {
      setSearchingDrivers(false);
    }
  };

  useEffect(() => {
    fetchClients();
    fetchDrivers();
    fetchBagInventory();
    fetchBagTransfers();
  }, []);

  useEffect(() => {
    fetchBagIssues(1);
  }, []);

  const handlePageChange = (page: number) => {
    fetchBagIssues(page);
  };

  // Use bag issues directly from backend (no client-side filtering)
  const filteredBagIssues = bagIssues;

  // Calculate summary statistics
  const totalBags = filteredBagIssues.reduce((sum, bagIssue) => sum + bagIssue.number_of_bags_issued, 0);
  const verifiedCount = filteredBagIssues.filter(bagIssue => bagIssue.is_verified).length;
  const pendingCount = filteredBagIssues.filter(bagIssue => !bagIssue.is_verified).length;

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setClearingBagIssues(true);
    fetchBagIssues(1).finally(() => setClearingBagIssues(false));
  };

  const searchBagIssues = async () => {
    setSearchingBagIssues(true);
    try {
      const params: any = { page: 1, limit: 50 };
      if (searchTerm) params.search = searchTerm;
      if (statusFilter) params.status = statusFilter;
      
      const response = await organizationService.getBagDistributionHistory(params);
      setBagIssues(response.data.data?.bag_issues || []);
      setPagination(response.data.data?.pagination || { currentPage: 1, totalPages: 1, hasNext: false, hasPrev: false });
      setCurrentPage(1);
    } catch (error) {
      console.error('Failed to search bag issues:', error);
      handleApiError(error, (message) => setToast({ open: true, message, severity: 'error' }));
    } finally {
      setSearchingBagIssues(false);
    }
  };

  // Use driver allocations directly from backend (no client-side filtering)
  const filteredDriverAllocations = driverAllocations;

  // Action handlers
  const handleMenuClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleAddBags = async () => {
    setActionLoading(true);
    try {
      await organizationService.addBags({ number_of_bags: parseInt(addBags) });
      setAddModalOpen(false);
      setAddBags('');
      setToast({ open: true, message: `Successfully added ${addBags} bags to inventory`, severity: 'success' });
      fetchBagInventory();
    } catch (error) {
      handleApiError(error, (message) => setToast({ open: true, message, severity: 'error' }));
    } finally {
      setActionLoading(false);
    }
  };

  const handleRemoveBags = async () => {
    setActionLoading(true);
    try {
      await organizationService.removeBags({ 
        number_of_bags: parseInt(removeBags), 
        reason: removeReason 
      });
      setRemoveModalOpen(false);
      setRemoveBags('');
      setRemoveReason('');
      setToast({ open: true, message: `Successfully removed ${removeBags} bags from inventory`, severity: 'success' });
      fetchBagInventory();
    } catch (error) {
      handleApiError(error, (message) => setToast({ open: true, message, severity: 'error' }));
    } finally {
      setActionLoading(false);
    }
  };

  const handleExport = (format: 'csv' | 'pdf') => {
    setShowExportDropdown(false);
    
    if (activeTab === 0) {
      // Export bag issues
      exportBagIssues(format);
    } else {
      // Export driver allocations
      exportDriverAllocations(format);
    }
  };

  const exportBagIssues = (format: 'csv' | 'pdf') => {
    const data = filteredBagIssues.map(issue => ({
      'Issue Date': new Date(issue.created_at).toLocaleDateString(),
      'Client Name': issue.client?.name || 'Unknown',
      'Driver Name': issue.driver?.name || 'Unknown',
      'Bags Issued': issue.number_of_bags_issued,
      'Client Email': issue.client_email,
      'OTP Code': issue.otp_code,
      'Status': issue.is_verified ? 'Verified' : 'Pending',
      'Issued At': issue.issued_at ? new Date(issue.issued_at).toLocaleDateString() : 'Not issued'
    }));
    
    if (format === 'csv') {
      downloadCSV(data, 'bag-issues');
    } else {
      downloadPDF(data, 'Bag Issues Report', 'bag-issues');
    }
  };

  const exportDriverAllocations = (format: 'csv' | 'pdf') => {
    const data = driverAllocations.map(allocation => ({
      'Driver Name': allocation.driver?.name || 'Unknown',
      'Allocated Bags': allocation.allocated_bags || 0,
      'Used Bags': allocation.used_bags || 0,
      'Available Bags': allocation.available_bags || 0,
      'Bags from Previous': allocation.bags_from_previous || 0,
      'Status': allocation.status === 1 ? 'Recent' : 'Previous'
    }));
    
    if (format === 'csv') {
      downloadCSV(data, 'driver-allocations');
    } else {
      downloadPDF(data, 'Driver Allocations Report', 'driver-allocations');
    }
  };

  const downloadCSV = (data: any[], filename: string) => {
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header]}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const downloadPDF = async (data: any[], title: string, filename: string) => {
    if (data.length === 0) return;
    
    const { jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');
    
    const doc = new jsPDF();
    
    doc.setFontSize(16);
    doc.text(title, 20, 20);
    
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, 20, 30);
    
    const headers = Object.keys(data[0]);
    const rows = data.map(row => headers.map(header => row[header] || ''));
    
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 40,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [66, 139, 202] }
    });
    
    doc.save(`${filename}-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  const handleProcessReturn = async () => {
    setActionLoading(true);
    try {
      await organizationService.processBagReturn({
        driver_id: returnDriver,
        number_of_bags: parseInt(returnBags),
        reason: returnReason
      });
      
      setReturnModalOpen(false);
      setReturnBags('');
      setReturnDriver('');
      setReturnReason('');
      const driverName = drivers.find(d => d.id == returnDriver)?.name || 'driver';
      setToast({ open: true, message: `Successfully processed return of ${returnBags} bags from ${driverName}`, severity: 'success' });
      fetchBagInventory();
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to process bag return';
      setToast({ open: true, message: errorMessage, severity: 'error' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleAllocateBags = async () => {
    setActionLoading(true);
    try {
      const response = await organizationService.allocateBags({ 
        driver_id: parseInt(selectedDriver), 
        number_of_bags: parseInt(allocateBags) 
      });
      
      // Add new allocation to the list
      if (response.data.data?.driver_allocation) {
        setDriverAllocations(prev => [response.data.data.driver_allocation, ...prev]);
      }
      
      setAllocateModalOpen(false);
      setAllocateBags('');
      setSelectedDriver('');
      const driverName = drivers.find(d => d.id == selectedDriver)?.name || 'driver';
      setToast({ open: true, message: `Successfully allocated ${allocateBags} bags to ${driverName}`, severity: 'success' });
      fetchBagInventory();
    } catch (error) {
      handleApiError(error, (message) => setToast({ open: true, message, severity: 'error' }));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom>
            Bag Issue Management
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Track and manage garbage bag issues to clients
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant="contained"
            startIcon={<MoreVertIcon />}
            onClick={handleMenuClick}
          >
            Actions
          </Button>
          <div className="relative">
            <Button
              variant="outlined"
              startIcon={<DownloadIcon />}
              onClick={() => setShowExportDropdown(!showExportDropdown)}
            >
              Export Data
            </Button>
            {showExportDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-10">
                <div className="py-1">
                  <button
                    onClick={() => handleExport('csv')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => handleExport('pdf')}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Export as PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </Box>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="info.main">
                {bagInventory?.available_bags || 0}
              </Typography>
              {/* Debug: {JSON.stringify(bagInventory)} */}
              <Typography variant="body2" color="text.secondary">
                Available Bags
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="primary">
                {filteredBagIssues.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Issues
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">
                {totalBags}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total Bags Issued
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="success.main">
                {verifiedCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Verified Issues
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card>
            <CardContent>
              <Typography variant="h6" color="warning.main">
                {pendingCount}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Pending Verification
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="Client Allocation" />
          <Tab label="Driver Allocations" />
          <Tab label="Bag Transfers" />
        </Tabs>
      </Card>

      {/* Filters */}
      {activeTab === 0 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterIcon />
              Filters
            </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                placeholder="Search by driver or client name..."
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <Box>
                <Typography variant="body2" sx={{ mb: 0.5, color: 'text.secondary', fontSize: '0.75rem' }}>
                  Status
                </Typography>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    width: '100%',
                    height: '56px',
                    padding: '16px 14px',
                    border: '1px solid #d0d7de',
                    borderRadius: '4px',
                    fontSize: '16px',
                    backgroundColor: 'white',
                    cursor: 'pointer',
                    outline: 'none'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#1976d2'}
                  onBlur={(e) => e.target.style.borderColor = '#d0d7de'}
                >
                  <option value="">All Status</option>
                  <option value="verified">Verified</option>
                  <option value="pending">Pending</option>
                </select>
              </Box>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="contained"
                onClick={searchBagIssues}
                disabled={searchingBagIssues || clearingBagIssues}
                sx={{ height: '56px' }}
              >
                {searchingBagIssues ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                    Searching...
                  </>
                ) : (
                  'Search'
                )}
              </Button>
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                fullWidth
                variant="outlined"
                onClick={clearFilters}
                disabled={searchingBagIssues || clearingBagIssues}
                sx={{ height: '56px' }}
              >
                {clearingBagIssues ? (
                  <>
                    <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                    Clearing...
                  </>
                ) : (
                  'Clear'
                )}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
      )}

      {/* Driver Allocation Filters */}
      {activeTab === 1 && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FilterIcon />
              Search Drivers
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Search Driver"
                  value={driverSearchTerm}
                  onChange={(e) => setDriverSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                  }}
                  placeholder="Search by driver name..."
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="contained"
                  onClick={() => fetchDriverAllocations(driverSearchTerm)}
                  disabled={searchingDrivers}
                  sx={{ height: '56px' }}
                >
                  {searchingDrivers ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                      Searching...
                    </>
                  ) : (
                    'Search'
                  )}
                </Button>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() => {
                    setDriverSearchTerm('');
                    fetchBagInventory();
                  }}
                  disabled={searchingDrivers}
                  sx={{ height: '56px' }}
                >
                  {searchingDrivers ? (
                    <>
                      <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                      Clearing...
                    </>
                  ) : (
                    'Clear'
                  )}
                </Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <Card>
        <CardContent>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
              <Typography sx={{ ml: 2 }}>Loading data...</Typography>
            </Box>
          ) : activeTab === 0 ? (
            filteredBagIssues.length > 0 ? (
            <>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Issue Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Client</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Bags Issued</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Driver</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Client Email</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>OTP Code</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Issued At</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredBagIssues.map((bagIssue, index) => (
                      <TableRow key={bagIssue.id || index} hover>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(bagIssue.created_at).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(bagIssue.created_at).toLocaleTimeString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              <PersonIcon />
                            </Avatar>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {bagIssue.client?.name || 'Unknown Client'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {bagIssue.client_id}
                              </Typography>
                            </Box>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BagIcon color="action" fontSize="small" />
                            <Typography variant="body2" fontWeight="medium">
                              {bagIssue.number_of_bags_issued}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {bagIssue.driver?.name || 'Unknown Driver'}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            ID: {bagIssue.driver_id}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.875rem' }}>
                            {bagIssue.client_email}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography 
                            variant="body2" 
                            sx={{ 
                              fontFamily: 'monospace', 
                              bgcolor: 'grey.100', 
                              p: 0.5, 
                              borderRadius: 1,
                              fontSize: '0.75rem'
                            }}
                          >
                            {bagIssue.otp_code}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={bagIssue.is_verified ? 'Verified' : 'Pending'} 
                            size="small"
                            color={bagIssue.is_verified ? 'success' : 'warning'}
                            icon={bagIssue.is_verified ? <CheckCircleIcon /> : <CancelIcon />}
                          />
                        </TableCell>
                        <TableCell>
                          {bagIssue.issued_at ? (
                            <Box>
                              <Typography variant="body2">
                                {new Date(bagIssue.issued_at).toLocaleDateString()}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(bagIssue.issued_at).toLocaleTimeString()}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Not issued
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 2 }}>
                  <Button 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={!pagination.hasPrev || currentPage === 1}
                    variant="outlined"
                    size="small"
                  >
                    Previous
                  </Button>
                  <Typography sx={{ display: 'flex', alignItems: 'center', px: 2 }}>
                    Page {currentPage} of {pagination.totalPages}
                  </Typography>
                  <Button 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={!pagination.hasNext || currentPage >= pagination.totalPages}
                    variant="outlined"
                    size="small"
                  >
                    Next
                  </Button>
                </Box>
              )}
            </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <BagIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Bag Issues Found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {searchTerm || statusFilter
                    ? 'No bag issues match your current filters.'
                    : 'No bag issues have been recorded yet.'
                  }
                </Typography>
                {(searchTerm || statusFilter) && (
                  <Button 
                    variant="outlined" 
                    sx={{ mt: 2 }}
                    onClick={clearFilters}
                  >
                    Clear Filters
                  </Button>
                )}
              </Box>
            )
          ) : activeTab === 1 ? (
            // Driver Allocations Tab
            driverAllocations.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Driver</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Allocated Bags</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Used Bags</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Available Bags</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Bags from Previous</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {driverAllocations.map((allocation, index) => (
                      <TableRow key={allocation.id || index} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              <PersonIcon />
                            </Avatar>
                            <Typography variant="body2" fontWeight="medium">
                              {allocation.driver?.name || 'Unknown Driver'}
                            </Typography>
                          </Box>
                        </TableCell>
                       
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            {allocation.allocated_bags || 0}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {allocation.used_bags || 0}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="success.main" fontWeight="medium">
                            {allocation.available_bags || 0}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="info.main">
                            {allocation.bags_from_previous || 0}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={allocation.status === 1 ? 'Recent' : 'Previous'} 
                            size="small"
                            color={allocation.status === 1 ? 'success' : 'default'}
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <BagIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Driver Allocations Found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {driverSearchTerm ? 'No drivers match your search criteria.' : 'No bags have been allocated to drivers yet.'}
                </Typography>
                {driverSearchTerm && (
                  <Button 
                    variant="outlined" 
                    sx={{ mt: 2 }}
                    onClick={() => {
                      setDriverSearchTerm('');
                      fetchBagInventory();
                    }}
                  >
                    Clear Search
                  </Button>
                )}
              </Box>
            )
          ) : (
            // Bag Transfers Tab
            bagTransfers.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ bgcolor: 'grey.50' }}>
                      <TableCell sx={{ fontWeight: 'bold' }}>Transfer Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>From Driver</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>To Driver</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Bags Transferred</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Completed At</TableCell>
                      <TableCell sx={{ fontWeight: 'bold' }}>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {bagTransfers.map((transfer, index) => (
                      <TableRow key={transfer.id || index} hover>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(transfer.created_at).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {new Date(transfer.created_at).toLocaleTimeString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              <PersonIcon />
                            </Avatar>
                            <Typography variant="body2" fontWeight="medium">
                              {transfer.from_driver?.name || 'Unknown Driver'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar sx={{ width: 32, height: 32 }}>
                              <PersonIcon />
                            </Avatar>
                            <Typography variant="body2" fontWeight="medium">
                              {transfer.to_driver?.name || 'Unknown Driver'}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <BagIcon color="action" fontSize="small" />
                            <Typography variant="body2" fontWeight="medium">
                              {transfer.number_of_bags}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip 
                            label={transfer.status} 
                            size="small"
                            color={transfer.status === 'completed' ? 'success' : transfer.status === 'pending' ? 'warning' : 'error'}
                          />
                        </TableCell>
                        <TableCell>
                          {transfer.completed_at ? (
                            <Box>
                              <Typography variant="body2">
                                {new Date(transfer.completed_at).toLocaleDateString()}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(transfer.completed_at).toLocaleTimeString()}
                              </Typography>
                            </Box>
                          ) : (
                            <Typography variant="body2" color="text.secondary">
                              Not completed
                            </Typography>
                          )}
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" color="text.secondary">
                            {transfer.notes || 'No notes'}
                          </Typography>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <BagIcon sx={{ fontSize: 48, color: 'grey.400', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  No Bag Transfers Found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  No bag transfers have been recorded yet.
                </Typography>
              </Box>
            )
          )}
        </CardContent>
      </Card>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => { setAddModalOpen(true); handleMenuClose(); }}>
          <AddIcon sx={{ mr: 1 }} /> Add Bags
        </MenuItem>
        <MenuItem onClick={() => { setRemoveModalOpen(true); handleMenuClose(); }}>
          <RemoveIcon sx={{ mr: 1 }} /> Remove Bags
        </MenuItem>
        <MenuItem onClick={() => { setAllocateModalOpen(true); handleMenuClose(); }}>
          <AssignIcon sx={{ mr: 1 }} /> Allocate Bags
        </MenuItem>
        <MenuItem onClick={() => { setReturnModalOpen(true); handleMenuClose(); }}>
          <RemoveIcon sx={{ mr: 1 }} /> Process Returns
        </MenuItem>
      </Menu>

      {/* Add Bags Modal */}
      <Dialog open={addModalOpen} onClose={() => setAddModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Bags to Inventory</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Number of Bags"
            type="number"
            value={addBags}
            onChange={(e) => setAddBags(e.target.value)}
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddModalOpen(false)} disabled={actionLoading}>Cancel</Button>
          <Button onClick={handleAddBags} variant="contained" disabled={!addBags || actionLoading}>
            {actionLoading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
            Add Bags
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove Bags Modal */}
      <Dialog open={removeModalOpen} onClose={() => setRemoveModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Remove Bags from Inventory</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Number of Bags"
            type="number"
            value={removeBags}
            onChange={(e) => setRemoveBags(e.target.value)}
            sx={{ mt: 2, mb: 2 }}
          />
          <TextField
            fullWidth
            label="Reason"
            multiline
            rows={3}
            value={removeReason}
            onChange={(e) => setRemoveReason(e.target.value)}
            placeholder="e.g., Damaged during transport"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveModalOpen(false)} disabled={actionLoading}>Cancel</Button>
          <Button onClick={handleRemoveBags} variant="contained" disabled={!removeBags || !removeReason || actionLoading}>
            {actionLoading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
            Remove Bags
          </Button>
        </DialogActions>
      </Dialog>

      {/* Allocate Bags Modal */}
      <Dialog open={allocateModalOpen} onClose={() => setAllocateModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Allocate Bags to Driver</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Select Driver</InputLabel>
            <Select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              label="Select Driver"
            >
              {drivers.map((driver) => (
                <MenuItem key={driver.id} value={driver.id}>
                  {driver.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Number of Bags"
            type="number"
            value={allocateBags}
            onChange={(e) => setAllocateBags(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAllocateModalOpen(false)} disabled={actionLoading}>Cancel</Button>
          <Button onClick={handleAllocateBags} variant="contained" disabled={!selectedDriver || !allocateBags || actionLoading}>
            {actionLoading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
            Allocate Bags
          </Button>
        </DialogActions>
      </Dialog>

      {/* Process Returns Modal */}
      <Dialog open={returnModalOpen} onClose={() => setReturnModalOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Process Bag Returns</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 2, mb: 2 }}>
            <InputLabel>Select Driver</InputLabel>
            <Select
              value={returnDriver}
              onChange={(e) => setReturnDriver(e.target.value)}
              label="Select Driver"
            >
              {drivers.map((driver) => (
                <MenuItem key={driver.id} value={driver.id}>
                  {driver.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Number of Bags to Return"
            type="number"
            value={returnBags}
            onChange={(e) => setReturnBags(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Reason for Return"
            multiline
            rows={3}
            value={returnReason}
            onChange={(e) => setReturnReason(e.target.value)}
            placeholder="e.g., Damaged bags returned"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReturnModalOpen(false)} disabled={actionLoading}>Cancel</Button>
          <Button onClick={handleProcessReturn} variant="contained" disabled={!returnDriver || !returnBags || !returnReason || actionLoading}>
            {actionLoading ? <CircularProgress size={20} sx={{ mr: 1 }} /> : null}
            Process Return
          </Button>
        </DialogActions>
      </Dialog>

      {/* Toast Notification */}
      <Snackbar 
        open={toast.open} 
        autoHideDuration={4000} 
        onClose={() => setToast({ ...toast, open: false })}
      >
        <Alert severity={toast.severity} onClose={() => setToast({ ...toast, open: false })}>
          {toast.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Bags;